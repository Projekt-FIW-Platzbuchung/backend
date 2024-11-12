require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const mongoose = require("mongoose");
const { enrichSeatsWithBookingInformation } = require("./routes");

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
        result.bookingDetails.gebuchtePlaetze.platzId
      );
    });

    // Überprüft die Ergebnisse mit erwartetem Output
    expect(
      results.every(
        (result) =>
          result.PlatzId === result.bookingDetails.gebuchtePlaetze.platzId
      )
    ).toBe(true);
    // expect(results.some(result => result.PlatzId === 'A1' && result.bookingDetails?.gebuchtePlaetze?.date === '2023-01-01')).toBe(true);
  });
});
