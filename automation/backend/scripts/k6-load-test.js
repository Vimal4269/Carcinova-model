import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const responseTime = new Trend('api_response_time');
const errorRate = new Rate('api_error_rate');

// Base URL (Configurable via environment variable or default to local)
const BASE_URL = __ENV.API_BASE_URL || 'http://127.0.0.1:5000/api';

// Execution configurations for different phases
export const options = {
    scenarios: {
        // Phase 1: Baseline / Load Testing (Normal Traffic)
        baseline: {
            executor: 'constant-vus',
            vus: 100, // 100 concurrent users
            duration: '1m', // Run continuously for 1 minute
            tags: { test_type: 'baseline' },
        },
        // Phase 2: Stress Testing (Uncomment to execute)
        /*
        stress: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 200 }, // Ramp up to 200
                { duration: '2m', target: 500 }, // Stress at 500
                { duration: '1m', target: 1000 }, // Max stress at 1000
                { duration: '30s', target: 0 }, // Ramp down
            ],
            tags: { test_type: 'stress' },
        },
        */
        // Phase 3: Spike Testing (Uncomment to execute)
        /*
        spike: {
            executor: 'ramping-vus',
            startVUs: 50,
            stages: [
                { duration: '10s', target: 500 }, // Sudden spike
                { duration: '1m', target: 500 }, // Hold spike
                { duration: '10s', target: 50 }, // Rapid recovery
            ],
            tags: { test_type: 'spike' },
        },
        */
    },
    thresholds: {
        // Workflow FAILS if these thresholds are not met
        'http_req_duration': ['p(95)<1500'], // 95% of requests must complete below 1.5s
        'api_error_rate': ['rate<0.05'],     // Error rate must be less than 5%
    },
};

export default function () {
    // Test the fastest, most common read endpoint
    const res = http.get(`${BASE_URL}/history/cases`);
    
    // Validate the response
    const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response contains success flag': (r) => r.json('success') === true,
        'response time < 1.5s': (r) => r.timings.duration < 1500,
    });

    // Record custom metrics
    responseTime.add(res.timings.duration);
    errorRate.add(!success);

    // Simulate think time between requests (e.g., user scrolling)
    sleep(1);
}
