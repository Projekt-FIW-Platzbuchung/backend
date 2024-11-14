require("dotenv").config();
const express = require("express");
const routes = require("../routes.js");
const mongoose = require("mongoose");
const { bookingInformationByDate } = require("../helpers_database_requests.js");

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

describe("bookingInformationByDate", () => {
  beforeEach(async () => {});
  it("should test if the seatIds match in the resulting aggregation", async () => {
    const results = await bookingInformationByDate("2023-10-10");

    // logging der seatId
    results.forEach((result) => {
      console.log("seatId:", result.seatId);
      console.log("Booking seatId:", result.bookingDetails.seatId);
    });

    // Überprüft die Ergebnisse mit erwartetem Output
    expect(
      results.every(
        (result) => result.seatId === result.bookingDetails.seatId
      )
    ).toBe(true);
  });
});


describe("bookingInformationByDate", () => {
    beforeEach(async () => {});
    it("should test whether the date used to find the seats from booking is the right one ", async () => {
      const dummyDate = "2023-10-01";
      const results = await bookingInformationByDate(dummyDate);
      // logging für debugging
      console.log("dummyDate:", dummyDate);
      results.forEach((result) => {
          console.log("Booking date: ", result.bookingDetails?.date);
        });
      expect(
          results.some(
              (result) => result.bookingDetails?.date === dummyDate
          )
  
      ).toBe(true);
  
    });
  });

  describe("Booking Information Aggregation by Date", () => {
    // Define a test case for a specific date
    it("should mark seats as 'gebucht' if booking date matches the target date, otherwise 'frei'", async () => {
      const targetDate = "2023-10-18"; // Example target date
  
      // Run the function with the target date
      const results = await bookingInformationByDate(targetDate);
  
      // Loop through each result to check the status and booking date
      results.forEach((result) => {
        if (result.status === "gebucht") {
          // For "gebucht" status, ensure the booking date matches the target date
          expect(result.bookingDetails?.date).toBe(targetDate);
        } else if (result.status === "frei") {
          // For "frei" status, ensure bookingDetails are either null or have a non-matching date
          expect(result.bookingDetails?.date).not.toBe(targetDate);
        }
      });
    });
  });
  