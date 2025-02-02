const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Import your express app

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.disconnect(); // Stellen Sie sicher, dass keine aktive Verbindung besteht
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /seat', () => {
  it('should create a new seat and return it with a 201 status', async () => {
    const newSeat = {
      coordinates: { x: 10, y: 20 },
      properties: { Table: 'Tisch A1', Monitor: '24 Zoll', WindowSeat: 'Ja' }
    };

    const response = await request(app)
      .post('/seat')
      .send(newSeat)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('seatId');
    expect(response.body.coordinates.x).toBe(newSeat.coordinates.x);
    expect(response.body.coordinates.y).toBe(newSeat.coordinates.y);
    expect(response.body.properties).toEqual(newSeat.properties);
  });
});