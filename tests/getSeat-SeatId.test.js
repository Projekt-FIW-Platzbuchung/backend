const request = require('supertest');  
const { expect } = require('@jest/globals');  

const baseUrl = "http://localhost:4000";  


const mockSeat = { 
    seatId: 1, 
    properties: { table: { type: 'string', required: false },
                 monitor: { type: 'string', required: false },
                 windowSeat: { type: 'string', required: false }},
    coordinates: { x: 130, y: 99 }
};


describe("GET /seat/:seatId endpoint", () => {
    it("should return seat details for a valid seatId with status 200", async () => {
        try {
            const response = await request(baseUrl)
                .get('/seat/1')  
                .expect(200);  

            
            expect(response.body).toBeInstanceOf(Object);  
            expect(response.body).toEqual(mockSeat);  
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });

    it("should return 404 for an invalid seatId", async () => {
        try {
            const response = await request(baseUrl)
                .get('/seat/9')  
                .expect(404);  

            
            expect(response.text).toBe('Seat not found');  
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });
});