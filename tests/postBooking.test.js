jest.setTimeout(30000); // Increase the default timeout to 30 seconds

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../routes.js');  // Import your Express app
const bookings = require('../models/bookings');  // Import the booking model

// Setup for testing
beforeAll(async () => {
    const dbUri =`${process.env.MONGODB_URI}${process.env.DB_NAME}?retryWrites=true`;
    await mongoose.connect(dbUri); 
});

// Cleanup after each test
afterEach(async () => {
    await bookings.deleteMany({});
});

// Close the DB connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('POST /booking', () => {
    it('should create a new booking and return the booking data', async () => {
        const bookingData = {
            bookingsId: 1,
            userId: 123,
            seatId: 456,
            date: '2024-11-14T00:00:00Z'
        };

        const response = await request(app)
            .post('/booking')
            .send(bookingData)
            .expect(201); // Check if status code is 201

        // Verify the response data
        expect(response.body).toHaveProperty('_id');  // Mongoose assigns an _id
        expect(response.body.bookingsId).toBe(bookingData.bookingsId);
        expect(response.body.userId).toBe(bookingData.userId);
        expect(response.body.seatId).toBe(bookingData.seatId);
        expect(new Date(response.body.date)).toEqual(new Date(bookingData.date));

        // Verify that the booking was actually saved to the database
        const savedBooking = await bookings.findOne({ bookingsId: bookingData.bookingsId });
        expect(savedBooking).not.toBeNull();
        expect(savedBooking.userId).toBe(bookingData.userId);
        expect(savedBooking.seatId).toBe(bookingData.seatId);
    });

    it('should return a 500 error if required fields are missing', async () => {
        const incompleteBookingData = {
            bookingsId: 1,
            userId: 123
            // Missing seatId and date
        };

        const response = await request(app)
            .post('/booking')
            .send(incompleteBookingData)
            .expect(500);  // Expect a 500 error due to missing fields

        expect(response.text).toBe('Fehler beim Speichern der Buchung');
    });
});
