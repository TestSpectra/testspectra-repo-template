import { Response } from 'k6/http';

/**
 * Helper function to parse JSON response body
 */
export function json(response: Response): any {
    return JSON.parse(response.body as string);
}

/**
 * Helper function to check if response status matches expected
 */
export function expectStatus(response: Response, expectedStatus: number): boolean {
    return response.status === expectedStatus;
}

/**
 * Helper function to check if response body contains expected JSON structure
 */
export function expectJsonBody(response: Response, matcher: (data: any) => boolean): boolean {
    try {
        const data = json(response);
        return matcher(data);
    } catch (e) {
        return false;
    }
}

/**
 * Helper function to check response headers
 */
export function expectHeader(response: Response, headerName: string, expectedValue?: string): boolean {
    const headerValue = response.headers[headerName];
    
    if (expectedValue === undefined) {
        // Just check if header exists
        return headerValue !== undefined;
    }
    
    // Check if header matches expected value
    return headerValue === expectedValue;
}

/**
 * Helper function to check if response is successful (2xx status)
 */
export function expectSuccess(response: Response): boolean {
    return response.status >= 200 && response.status < 300;
}

/**
 * Helper function to check response time
 */
export function expectResponseTime(response: Response, maxMs: number): boolean {
    return response.timings.duration < maxMs;
}

/**
 * Combined helper for common JSON API assertions
 */
export function expectJsonResponse(
    response: Response,
    expectedStatus: number,
    matcher?: (data: any) => boolean
): boolean {
    if (response.status !== expectedStatus) {
        return false;
    }
    
    if (matcher) {
        return expectJsonBody(response, matcher);
    }
    
    return true;
}
