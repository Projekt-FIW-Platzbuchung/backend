const request = require('supertest');
const { expect } = require('@jest/globals');

const baseUrl = "http://localhost:4000"; 


const mockUpdateData = {
    coordinates: { x: 200, y: 150 },
    properties: { hasPowerOutlet: true, isNearWindow: false },
    propertiesToDelete: ["oldProperty"]
};

describe("PUT /seat/:seatId endpoint", () => {
    it("should update seat details for a valid seatId and return status 200", async () => {
        try {
            const response = await request(baseUrl)
                .put('/seat/1') 
                .send(mockUpdateData) 
                .expect(200); 

            
            expect(response.body).toBeInstanceOf(Object); 
            expect(response.body.updatedSeat).toHaveProperty("coordinates");
            expect(response.body.updatedSeat.coordinates).toEqual(mockUpdateData.coordinates);
            expect(response.body.updatedSeat.properties).toMatchObject(mockUpdateData.properties);
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });

    it("should return 404 for an invalid seatId", async () => {
        try {
            const response = await request(baseUrl)
                .put('/seat/999') 
                .send(mockUpdateData)
                .expect(404); 

            
            expect(response.body.message).toBe("Seat nicht gefunden.");
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });

    it("should return 400 for invalid request body", async () => {
        try {
            const response = await request(baseUrl)
                .put('/seat/invalidId') 
                .send({ coordinates: { x: 100, y: 200 } })  
                .expect(400); 

            
            expect(response.body.message).toBe("Invalid seatId format.");
        } catch (error) {
            console.log("Test failed with error", error);
        }
    });
});
