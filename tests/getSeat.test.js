const request = require('supertest');  
const { expect } = require('@jest/globals');  

const baseUrl = "http://localhost:4000";  


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


describe("GET /seat endpoint", () => {
    it("should return all seats with status 200", async () => {
        try{
        const response = await request(baseUrl)
            .get('/seat')  
            .expect(200);  

        
        expect(response.body).toBeInstanceOf(Array);  
        expect(response.body).toEqual(mockSeats);  
    } catch(error){
        console.log("Test failes with error", error)
    }
    });
});
