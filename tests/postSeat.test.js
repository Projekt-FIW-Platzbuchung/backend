const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server'); // Import your express app

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.disconnect(); // Stellen Sie sicher, dass keine aktive Verbindung besteht
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const response = await request(app).get('/generate-token');
  token = response.body.token;
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
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json');


    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('seatId');
    expect(response.body.coordinates.x).toBe(newSeat.coordinates.x);
    expect(response.body.coordinates.y).toBe(newSeat.coordinates.y);
    expect(response.body.properties).toEqual(newSeat.properties);
  });
  it('should return 400 if seat data is invalid', async () => {
    const invalidSeat = {
      coordinates: { x: 10 }, // y fehlt
      properties: { Table: 'Tisch A1', Monitor: '24 Zoll', WindowSeat: 'Ja' }
    };

    const response = await request(app)
      .post('/seat')
      .send(invalidSeat)
      .set('Authorization', `Bearer ${token}`) // Token hinzufügen
      .set('Accept', 'application/json')
      .expect(400);

    expect(response.body.error).toBe('Invalid seat data');
  });
});