import http from 'k6/http';
import { check } from 'k6';
import { expectStatus, expectJsonBody, expectHeader } from './helpers.ts';

/**
 * Example test demonstrating header validation
 * This shows how to use expectHeader helper function
 */
export default function () {
    const response = http.get('https://jsonplaceholder.typicode.com/users/1');
    
    check(response, {
        // Status check
        'status is 200': (r) => expectStatus(r, 200),
        
        // JSON body checks
        'has user data': (r) => expectJsonBody(r, (data) => data.id === 1),
        
        // Header existence checks
        'has content-type header': (r) => expectHeader(r, 'Content-Type'),
        
        // Header value checks
        'content-type is JSON': (r) => expectHeader(r, 'Content-Type', 'application/json; charset=utf-8'),
        
        // Check if header contains specific value (using custom matcher)
        'has server header': (r) => expectHeader(r, 'Server'),
    });
}
