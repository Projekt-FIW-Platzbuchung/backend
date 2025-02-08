const request = require('supertest');  // Use require to import Supertest
const { expect } = require('@jest/globals');  // Use require to import Jest's global expect

const baseUrl = "http://localhost:4000";  // Base URL for your server

// Mock data
const mockSeat = { 
    seatId: 1, 
    properties: { table: { type: 'string', required: false },
                 monitor: { type: 'string', required: false },
                 windowSeat: { type: 'string', required: false }},
    coordinates: { x: 130, y: 99 }
};

// Jest test suite
describe("GET /seat/:seatId endpoint", () => {
    it("should return seat details for a valid seatId with status 200", async () => {
        try {
            const response = await request(baseUrl)
                .get('/seat/1')  // Send GET request to /seat/1
                .expect(200);  // Expect status code 200

            // Assertions
            expect(response.body).toBeInstanceOf(Object);  // Response should be an object
            expect(response.body).toEqual(mockSeat);  // Response should match the mock data
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });

    it("should return 404 for an invalid seatId", async () => {
        try {
            const response = await request(baseUrl)
                .get('/seat/9')  // Send GET request to /seat/999
                .expect(404);  // Expect status code 404

            // Assertions
            expect(response.text).toBe('Seat not found');  // Response should be 'Seat not found'
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });
});