import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { expectStatus, expectJsonBody, expectResponseTime } from './helpers.ts';

// Custom metrics
const errorRate = new Rate('errors');

// Load test configuration
export const options = {
    stages: [
        { duration: '5s', target: 2 }, // Ramp up to 2 users over 5 seconds
        { duration: '10s', target: 5 }, // Ramp up to 5 users over 10 seconds
        { duration: '5s', target: 0 }, // Ramp down to 0 users over 5 seconds
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        errors: ['rate<0.1'],              // Error rate should be less than 10%
    },
};

export default function () {
    // Simulate user browsing posts
    const postsResponse = http.get('https://jsonplaceholder.typicode.com/posts');
    
    const postsCheckResult = check(postsResponse, {
        'status is 200': (r) => expectStatus(r, 200),
        'response time < 500ms': (r) => expectResponseTime(r, 500),
    });
    
    errorRate.add(!postsCheckResult);

    sleep(1);

    // Simulate user viewing a specific post
    const randomPostId = Math.floor(Math.random() * 100) + 1;
    const postResponse = http.get(`https://jsonplaceholder.typicode.com/posts/${randomPostId}`);
    
    const postCheckResult = check(postResponse, {
        'status is 200': (r) => expectStatus(r, 200),
        'has post data': (r) => expectJsonBody(r, (data) => data.id === randomPostId),
    });
    
    errorRate.add(!postCheckResult);

    sleep(1);

    // Simulate user viewing comments
    const commentsResponse = http.get(`https://jsonplaceholder.typicode.com/posts/${randomPostId}/comments`);
    
    const commentsCheckResult = check(commentsResponse, {
        'status is 200': (r) => expectStatus(r, 200),
        'has comments': (r) => expectJsonBody(r, (data) => Array.isArray(data)),
    });
    
    errorRate.add(!commentsCheckResult);

    sleep(2);
}
