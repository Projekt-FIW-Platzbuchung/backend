const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Importieren Sie Ihre App-Instanz von Ihrer Hauptserverdatei
const Booking = require('../models/bookings');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
 
  await mongoose.disconnect();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const response = await request(app).get('/generate-token');
  token = response.body.token;

  await Booking.insertMany([
    { seatId: 1, date: '2024-10-10', userId: 1, username: 'Alice', coordinates: { x: 10, y: 15 } },
  ]);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

describe("DELETE /bookings/:id", () => {

  it("should delete a booking with a valid id and return status 204", async () => {
    const booking = await Booking.findOne({ seatId: 1 });

    const response = await request(app)
    .delete(`/bookings/${booking._id}`)
    .set('Authorization', `Bearer ${token}`) // Token hinzufügen
    .set('Accept', 'application/json') 
    .expect(204); 

    
    const deletedBooking = await Booking.findById(booking._id);
    expect(deletedBooking).toBeNull(); 
  });

  it("should return 404 for a non-existent booking id", async () => {
    
    const response = await request(app)
      .delete(`/bookings/09349995454444440987645342`) 
      .set('Authorization', `Bearer ${token}`) 
      .set('Accept', 'application/json') 
      .expect(404); 

    
    expect(response.body.error).toBe("Buchung nicht gefunden");
  });
});