const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); 
const Booking = require('../models/bookings');
const Seat = require('../models/seat');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  
  const dummySeat = new Seat({
    seatId: 1,
    properties: { Table: 'Tisch A1', Monitor: '24 Zoll', WindowSeat: 'Ja' },
    coordinates: { x: 10, y: 20 }
  });

  await dummySeat.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /booking', () => {
  it('should create a new booking and return it with a 201 status', async () => {
    const newBooking = {
      userId: 2,
      username: 'New User',
      seatId: 1,
      date: '2025-01-02',
      coordinates: {
        x: 10,
        y: 20
      }
    };

    const response = await request(app)
      .post('/booking')
      .send(newBooking)
      .set('Accept', 'application/json')
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.userId).toBe(newBooking.userId);
    expect(response.body.username).toBe(newBooking.username);
    expect(response.body.seatId).toBe(newBooking.seatId);
    expect(response.body.date).toBe(newBooking.date);
    expect(response.body.coordinates).toEqual(newBooking.coordinates);
  });

  it('should return 400 when a seat does not exist to book', async () => {
    const invalidSeatBooking = {
      userId: 2,
      username: 'InvalidSeatUser',
      seatId: 9992, 
      date: new Date().toISOString().split('T')[0],
      coordinates: { x: 10, y: 20 }
    };

    const response = await request(app)
      .post('/booking')
      .send(invalidSeatBooking)
      .set('Accept', 'application/json')
      .expect(400);

    expect(response.body.error).toBe('Der Sitzplatz wurde nicht gefunden.');
  });

  it('should return 400 if booking a seat that is already booked for the date', async () => {
    const existingBooking = {
      userId: 1,
      username: 'ExistingUser',
      seatId: 1,
      date: '2025-01-01',
      coordinates: { x: 10, y: 20 }
    };

    
    await request(app)
      .post('/booking')
      .send(existingBooking)
      .set('Accept', 'application/json')
      .expect(201);

    
    const response = await request(app)
      .post('/booking')
      .send(existingBooking)
      .set('Accept', 'application/json')
      .expect(400);

    expect(response.body.error).toBe('Dieser Sitzplatz ist an dem gewählten Datum bereits gebucht.');
  });
});