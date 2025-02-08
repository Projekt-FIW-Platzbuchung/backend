const { bookingInformationByDate } = require("../helpers_database_requests");
const Booking = require("../models/bookings");
const Seat = require("../models/seat");

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri(); // es nimmt diese uri:  mongodb://127.0.0.1:38553/

  await mongoose.disconnect();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  
  await Seat.insertMany([
    {
      seatId: 3000,
      properties: { Table: "Tisch A1", Monitor: "24 Zoll", WindowSeat: "Ja" },
      coordinates: { x: 10, y: 20 }, status: "gebucht"
    },
    {
      seatId: 3001,
      properties: { Table: "Tisch H1", Monitor: "32 Zoll", WindowSeat: "Nein" },
      coordinates: { x: 15, y: 25 }, status: "gebucht"
    },
  ]);

  console.log("seat to be booked :", await Seat.find({seatId: 3000}));
  console.log("seat to be free : ", await Seat.find({seatId: 3001}) );

  await Booking.insertMany([

    { userId: 1,username: "Alice",seatId: 3000, date: "2026-10-10", coordinates: { x: 10, y: 20 }},
    { userId: 2,username: "Bob", seatId: 3001, date: "2026-10-10", coordinates: { x: 15, y: 25 }}, 
  ]);
});

// Connection schließen nach dem Testen
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("bookingInformationByDate", () => {
  it("should return the correct booking information for a given date", async () => {
    const date = "2026-10-10";
    const results = await bookingInformationByDate(date);

    // Erwartung: nach aggregation 2 seats mit booking Data
    expect(results).toHaveLength(2);
    expect(results).toBeInstanceOf(Array);


    const bookedSeatAlice = results.find((result) => result.seatId === 3000);
    console.log("booked seat: ", bookedSeatAlice)

    // Erwartung: Seat 1 gebucht mit bookingDetails
    expect(bookedSeatAlice).toMatchObject({
      seatId: 3000,
      properties: { Table: "Tisch A1", Monitor: "24 Zoll", WindowSeat: "Ja" },
      bookingDetails: { userId: 1, date: "2026-10-10", username: "Alice" },
      status: "gebucht",
    });

    const bookedSeatBob = results.find((result) => result.seatId === 3001);
    console.log("free seat: ", bookedSeatBob)

    // Erwartung: Seat 2 frei ohne bookingDetails
    expect(bookedSeatBob).toMatchObject( {
      seatId: 3001,
      properties: { Table: 'Tisch H1', Monitor: '32 Zoll', WindowSeat: 'Nein' },
      bookingDetails: { userId: 2, date: "2026-10-10", username: "Bob" },
      status: 'gebucht'
    });
  });
});
