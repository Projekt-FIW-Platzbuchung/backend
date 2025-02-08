const request = require('supertest');  // Use require to import Supertest
const { expect } = require('@jest/globals');  // Use require to import Jest's global expect

const baseUrl = "http://localhost:4000";  // Base URL for your server

// Mock data
const mockSeats = [
    { 
        seatId: 1, 
        properties: { table: { type: 'string', required: false },
                     monitor: { type: 'string', required: false },
                     windowSeat: { type: 'string', required: false }},
        coordinates: { x: 10, y: 20 }
    },
    { 
        seatId: 2, 
        properties: { tableType: { type: 'string', required: false },
                      accessibility: { type: 'string', required: false },
                      acoustics: { type: 'string', required: false }},
        coordinates: { x: 15, y: 25 }
    },
    { 
        seatId: 3, 
        properties: { workTop: { type: 'string', required: false },
                      chair: { type: 'string', required: false }},
        coordinates: { x: 20, y: 30 }
    }
];

// Jest test suite
describe("GET /seat endpoint", () => {
    it("should return all seats with status 200", async () => {
        try{
        const response = await request(baseUrl)
            .get('/seat')  // Send GET request to /seat
            .expect(200);  // Expect status code 200

        // Assertions
        expect(response.body).toBeInstanceOf(Array);  // Response should be an array
        expect(response.body).toEqual(mockSeats);  // Response should match the mock data
    } catch(error){
        console.log("Test failes with error", error)
    }
    });
});
