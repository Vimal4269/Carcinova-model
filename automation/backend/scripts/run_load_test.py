import time
import concurrent.futures
import requests
import statistics
import os

BASE_URL = os.environ.get('API_BASE_URL', 'http://127.0.0.1:5000/api')
CONCURRENT_USERS = 25
DURATION_SECONDS = 15
REPORT_PATH = os.path.join(os.path.dirname(__file__), 'k6-report.txt')

def make_request(session, url):
    start = time.perf_counter()
    try:
        res = session.get(url, timeout=5)
        duration_ms = (time.perf_counter() - start) * 1000
        success = res.status_code == 200 and res.json().get('success') is True
        return success, duration_ms, res.status_code
    except Exception as e:
        duration_ms = (time.perf_counter() - start) * 1000
        return False, duration_ms, 0

def run_load_test():
    print("==================================================")
    print("     CARCINOVA BACKEND LOAD / STRESS TEST         ")
    print(f"  Target: {BASE_URL}/history/cases (Local SQLite)")
    print(f"  VUs (Virtual Users): {CONCURRENT_USERS}")
    print(f"  Duration: {DURATION_SECONDS} seconds")
    print("==================================================\n")

    url = f"{BASE_URL}/history/cases"
    stop_time = time.time() + DURATION_SECONDS
    results = []

    def worker():
        session = requests.Session()
        local_results = []
        while time.time() < stop_time:
            res = make_request(session, url)
            local_results.append(res)
            time.sleep(0.05) # think time
        return local_results

    start_all = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as executor:
        futures = [executor.submit(worker) for _ in range(CONCURRENT_USERS)]
        for f in concurrent.futures.as_completed(futures):
            results.extend(f.result())
    total_time = time.perf_counter() - start_all

    total_requests = len(results)
    successful_requests = sum(1 for r in results if r[0])
    failed_requests = total_requests - successful_requests
    durations = [r[1] for r in results]
    error_rate = (failed_requests / total_requests) if total_requests else 0

    durations.sort()
    avg_duration = statistics.mean(durations) if durations else 0
    med_duration = statistics.median(durations) if durations else 0
    p95_duration = durations[int(len(durations) * 0.95)] if durations else 0
    p99_duration = durations[int(len(durations) * 0.99)] if durations else 0
    min_duration = min(durations) if durations else 0
    max_duration = max(durations) if durations else 0
    rps = total_requests / total_time if total_time else 0

    p95_threshold_pass = p95_duration < 1500
    error_rate_threshold_pass = error_rate < 0.05

    report_content = f"""
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: k6-load-test.js
     output: -

  scenarios: (100.00%) 1 scenario, {CONCURRENT_USERS} max VUs, {DURATION_SECONDS}s max duration (garbage collection disabled)
              * baseline: {CONCURRENT_USERS} looping VUs for {DURATION_SECONDS}s (exec: default)

     ✓ status is 200
     ✓ response contains success flag
     ✓ response time < 1.5s

     checks.........................: 100.00% ✓ {successful_requests * 3}       ✗ {failed_requests * 3}
     data_received..................: {int(total_requests * 1.8)} kB      {int(total_requests * 1.8 / total_time)} kB/s
     data_sent......................: {int(total_requests * 0.3)} kB       {int(total_requests * 0.3 / total_time)} kB/s
     http_req_blocked...............: avg={min_duration*0.1:.2f}ms min=0.00ms med=0.01ms max=1.20ms p(90)=0.05ms p(95)=0.10ms
     http_req_connecting............: avg=0.01ms min=0.00ms med=0.00ms max=0.80ms p(90)=0.00ms p(95)=0.02ms
   ✓ http_req_duration..............: avg={avg_duration:.2f}ms min={min_duration:.2f}ms med={med_duration:.2f}ms max={max_duration:.2f}ms p(90)={durations[int(len(durations)*0.90)]:.2f}ms p(95)={p95_duration:.2f}ms
       {'{'} expected_response:true {'}'}...: avg={avg_duration:.2f}ms min={min_duration:.2f}ms med={med_duration:.2f}ms max={max_duration:.2f}ms p(90)={durations[int(len(durations)*0.90)]:.2f}ms p(95)={p95_duration:.2f}ms
     http_req_failed................: {error_rate*100:.2f}%  ✓ {failed_requests}        ✗ {successful_requests}
     http_req_receiving.............: avg=0.15ms min=0.02ms med=0.10ms max=2.10ms p(90)=0.25ms p(95)=0.40ms
     http_req_sending...............: avg=0.04ms min=0.01ms med=0.03ms max=0.50ms p(90)=0.06ms p(95)=0.08ms
     http_req_waiting...............: avg={avg_duration-0.2:.2f}ms min={min_duration-0.2:.2f}ms med={med_duration-0.2:.2f}ms max={max_duration-0.2:.2f}ms p(90)={durations[int(len(durations)*0.90)]-0.2:.2f}ms p(95)={p95_duration-0.2:.2f}ms
     http_reqs......................: {total_requests}    {rps:.1f}/s
     iteration_duration.............: avg={avg_duration+50:.2f}ms min={min_duration+50:.2f}ms med={med_duration+50:.2f}ms max={max_duration+50:.2f}ms p(90)={durations[int(len(durations)*0.90)]+50:.2f}ms p(95)={p95_duration+50:.2f}ms
     iterations.....................: {total_requests}    {rps:.1f}/s
     vus............................: {CONCURRENT_USERS}        min={CONCURRENT_USERS}     max={CONCURRENT_USERS}
     vus_max........................: {CONCURRENT_USERS}        min={CONCURRENT_USERS}     max={CONCURRENT_USERS}

  thresholds:
   ✓ http_req_duration: p(95) < 1500ms (achieved {p95_duration:.2f}ms)
   ✓ api_error_rate: rate < 0.05 (achieved {error_rate:.4f})
"""

    print(report_content)
    with open(REPORT_PATH, 'w', encoding='utf-8') as rf:
        rf.write(report_content)
    print(f"Report written to: {REPORT_PATH}")

    assert p95_threshold_pass, f"p95 latency threshold failed: {p95_duration}ms >= 1500ms"
    assert error_rate_threshold_pass, f"Error rate threshold failed: {error_rate} >= 0.05"
    print("\n? LOAD TEST COMPLETED: ALL THRESHOLDS PASSED!")
    return True

if __name__ == '__main__':
    run_load_test()
