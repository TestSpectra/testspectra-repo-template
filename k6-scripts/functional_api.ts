import { check, sleep } from 'k6';
import http from 'k6/http';
import { expectJsonBody, expectStatus } from './helpers.ts';

// Test configuration
export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {
    // Test 1: GET request - Get all users
    const getUsersResponse = http.get('https://jsonplaceholder.typicode.com/users');
    
    check(getUsersResponse, {
        'GET users - status is 200': (r) => expectStatus(r, 200),
        'GET users - response is array': (r) => expectJsonBody(r, (data) => Array.isArray(data)),
        'GET users - has users': (r) => expectJsonBody(r, (data) => data.length > 0),
    });

    sleep(1);

    // Test 2: GET request - Get single user
    const getSingleUserResponse = http.get('https://jsonplaceholder.typicode.com/users/1');
    
    check(getSingleUserResponse, {
        'GET single user - status is 200': (r) => expectStatus(r, 200),
        'GET single user - has id': (r) => expectJsonBody(r, (data) => data.id === 1),
        'GET single user - has name': (r) => expectJsonBody(r, (data) => data.name !== undefined),
        'GET single user - has email': (r) => expectJsonBody(r, (data) => data.email !== undefined),
    });

    sleep(1);

    // Test 3: POST request - Create new user
    const payload = JSON.stringify({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const postResponse = http.post('https://jsonplaceholder.typicode.com/users', payload, params);
    
    check(postResponse, {
        'POST user - status is 201': (r) => expectStatus(r, 201),
        'POST user - has id': (r) => expectJsonBody(r, (data) => data.id !== undefined),
        'POST user - name matches': (r) => expectJsonBody(r, (data) => data.name === 'Test User'),
    });

    sleep(1);

    // Test 4: PUT request - Update user
    const updatePayload = JSON.stringify({
        id: 1,
        name: 'Updated User',
        username: 'updateduser',
        email: 'updated@example.com',
    });

    const putResponse = http.put('https://jsonplaceholder.typicode.com/users/1', updatePayload, params);
    
    check(putResponse, {
        'PUT user - status is 200': (r) => expectStatus(r, 200),
        'PUT user - name updated': (r) => expectJsonBody(r, (data) => data.name === 'Updated User'),
    });

    sleep(1);

    // Test 5: DELETE request - Delete user
    const deleteResponse = http.del('https://jsonplaceholder.typicode.com/users/1');
    
    check(deleteResponse, {
        'DELETE user - status is 200': (r) => expectStatus(r, 200),
    });

    sleep(1);
}
