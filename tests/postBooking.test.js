const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import app from server.js
const Bookings = require('../models/bookings');

describe('POST /booking', () => {
    let createdBookingId;

    // Ensure the Mongoose connection closes after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a new booking and return the saved data', async () => {
        const newBooking = {
            bookingsId: 123,
            userId: 1,
            seatId: 1,
            date: new Date(),
        };

        const response = await request(app)
            .post('/booking')
            .send(newBooking)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json'); // Ensure JSON content type

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.bookingsId).toBe(newBooking.bookingsId);
    }, 15000); 

    it('should handle database errors and return a 500', async () => {
        // Mock `save` method to throw an error
        jest.spyOn(Bookings.prototype, 'save').mockRejectedValueOnce(new Error('Database error'));

        const newBooking = {
            bookingsId: 123,
            userId: 1,
            seatId: 1,
            date: new Date(),
        };

        const response = await request(app)
            .post('/booking')
            .send(newBooking)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json'); // Ensure JSON content type

        expect(response.status).toBe(500);
        expect(response.text).toBe('Fehler beim Speichern der Buchung');
    }, 15000);

    // Cleanup step: Delete the created booking after the tests
    afterEach(async () => {
        if (createdBookingId) {
            await Bookings.findByIdAndDelete(createdBookingId);
            createdBookingId = null; // Reset for the next test
        }
    });
});
