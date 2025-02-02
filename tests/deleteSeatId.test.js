const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
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

describe('DELETE seat by ID', () => {
  it('should delete a seat with a valid id and return status 204', async () => {
    const seatToDelete = await Seat.findOne({ seatId: 1 });

    const deleteResult = await Seat.deleteOne({ _id: seatToDelete._id });

    const deletedSeat = await Seat.findById(seatToDelete._id);
    expect(deletedSeat).toBeNull();
  });
});