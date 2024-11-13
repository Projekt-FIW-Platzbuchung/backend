require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const mongoose = require("mongoose");
const { enrichSeatsWithBookingInformation } = require("./helpers_database_requests");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("enrichSeatsWithBookingInformation", () => {
  beforeEach(async () => {});
  it("should aggregate bookings into seats correctly", async () => {
    // Ruft die Methode auf die getestet werden soll
    const results = await enrichSeatsWithBookingInformation();

    // logging der PlatzIds
    results.forEach((result) => {
      console.log("PlatzId:", result.PlatzId);
      console.log(
        "Booking PlatzId:",
        result.bookingDetails.platzId
      );
    });

    // Überprüft die Ergebnisse mit erwartetem Output
    expect(
      results.every(
        (result) =>
          result.PlatzId === result.bookingDetails.PlatzId
      )
    ).toBe(true);
   
  });
});
