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
      seatId: 1,
      properties: { Table: "Tisch A1", Monitor: "24 Zoll", WindowSeat: "Ja" },
      coordinates: { x: 10, y: 20 }
    },
    {
      seatId: 2,
      properties: { Table: "Tisch H1", Monitor: "32 Zoll", WindowSeat: "Nein" },
      coordinates: { x: 15, y: 25 }
    },
  ]);

  console.log("seat to be booked :", await Seat.find({seatId: 1}));
  console.log("seat to be free : ", await Seat.find({seatId: 2}) );

  await Booking.insertMany([

    { seatId: 1, date: "2024-10-01", userId: 1},
    { seatId: 2, date: "2024-10-01", userId: 2},
  ]);
});

// Connection schließen nach dem Testen
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("bookingInformationByDate", () => {
  it("should return the correct booking information for a given date", async () => {
    const date = "2024-10-01";
    const results = await bookingInformationByDate(date);

    // Erwartung: nach aggregation 2 seats mit booking Data
    expect(results).toHaveLength(2);
    expect(result).toBeInstanceOf(Array);


    const bookedSeat = results.find((result) => result.seatId === 1);
    console.log("booked seat: ", bookedSeat)

    // Erwartung: Seat 1 gebucht mit bookingDetails
    expect(bookedSeat).toMatchObject({
      seatId: 1,
      properties: { Table: "Tisch A1", Monitor: "24 Zoll", WindowSeat: "Ja" },
      bookingDetails: { userId: 1, date: "2024-10-10", username: "Alice" },
      status: "gebucht",
    });

    const freeSeat = results.find((result) => result.seatId === 2);
    console.log("free seat: ", freeSeat)

    // Erwartung: Seat 2 frei ohne bookingDetails
    expect(freeSeat).toMatchObject( {
      seatId: 2,
      properties: { Table: 'Tisch H1', Monitor: '32 Zoll', WindowSeat: 'Nein' },
      status: 'frei'
    });
  });
});
