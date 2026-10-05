import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics
const responseTime = new Trend('api_response_time');
const errorRate = new Rate('api_error_rate');

// Base URL (Configurable via environment variable or default to local)
const BASE_URL = __ENV.API_BASE_URL || 'http://127.0.0.1:5000/api';

// Execution configurations
export const options = {
    scenarios: {
        // Phase 1: Baseline Load Testing against Local SQLite Database
        baseline: {
            executor: 'constant-vus',
            vus: 30, // 30 concurrent users
            duration: '20s', // Run for 20 seconds
            tags: { test_type: 'baseline' },
        },
    },
    thresholds: {
        // Workflow FAILS if these thresholds are not met
        'http_req_duration': ['p(95)<1500'], // 95% of requests must complete below 1.5s
        'api_error_rate': ['rate<0.05'],     // Error rate must be less than 5%
    },
};

export default function () {
    // Test the primary cases history endpoint
    const res1 = http.get(`${BASE_URL}/history/cases`);
    
    // Validate response 1
    const success1 = check(res1, {
        'history status is 200': (r) => r.status === 200,
        'history success flag': (r) => r.json('success') === true,
        'history response time < 1.5s': (r) => r.timings.duration < 1500,
    });

    responseTime.add(res1.timings.duration);
    errorRate.add(!success1);

    // Test cases list endpoint
    const res2 = http.get(`${BASE_URL}/cases/list`);
    const success2 = check(res2, {
        'cases list status is 200': (r) => r.status === 200,
        'cases list success flag': (r) => r.json('success') === true,
        'cases list response time < 1.5s': (r) => r.timings.duration < 1500,
    });

    responseTime.add(res2.timings.duration);
    errorRate.add(!success2);

    // Simulate realistic user browsing delay
    sleep(0.2);
}
