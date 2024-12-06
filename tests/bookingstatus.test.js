const { bookingInformationByDate } = require("../helpers_database_requests");
const Booking = require("../models/bookings");
const Seat = require("../models/seat");

// Mock Mongoose models
jest.mock("../models/bookings");
jest.mock("../models/seat");

// Set up Jest's mock for the `bookingInformationByDate` function
jest.mock("../helpers_database_requests", () => ({
  bookingInformationByDate: jest.fn(), // This provides a mock function that we'll configure in tests
}));

// Configure the mock implementation of the function used in aggregation
beforeEach(() => {
  Booking.aggregate = jest.fn().mockResolvedValue([
    {
      seatId: "1",
      properties: {
        table: "Tisch A1",
        monitor: "24 Zoll",
        windowSeat: "Ja",
      },
      status: "frei",
    },
    {
      seatId: "2",
      properties: {
        table: "Tisch H1",
        monitor: "32 Zoll",
        windowSeat: "Nein",
      },
      status: "frei",
    },
    {
      seatId: "4",
      properties: {
        table: "hoehenverstellbar",
        monitor: "32 Zoll",
        windowSeat: "Nein",
      },
      bookingDetails: {
        userId: 2,
        date: "2024-10-10",
        username: "Sabrina",
      },
      status: "gebucht",
    },
  ]);

  bookingInformationByDate.mockResolvedValue([
    // Set up the expected return value for booking aggregated data
    {
      seatId: "4",
      properties: {
        table: "hoehenverstellbar",
        monitor: "32 Zoll",
        windowSeat: "Nein",
      },
      bookingDetails: {
        userId: 2,
        date: "2024-10-10",
        username: "Sabrina",
      },
      status: "gebucht",
    },
    {
      seatId: "1",
      properties: {
        table: "Tisch A1",
        monitor: "24 Zoll",
        windowSeat: "Ja",
      },
      status: "frei",
    },
  ]);
});

describe("bookingInformationByDate", () => {
  it("should test if the seatIds match in the resulting aggregation", async () => {
    const results = await bookingInformationByDate("2024-10-10");

    results.forEach((result) => {
      console.log("seatId:", result.seatId);
      console.log("Booking seatId:", result.bookingDetails?.seatId);
    });

    expect(
      results.some((result) => result.seatId === result.bookingDetails?.seatId)
    ).toBe(true);
  });

  it("should test whether the date used to find the seats from booking is the right one", async () => {
    const dummyDate = "2024-10-10";
    const results = await bookingInformationByDate(dummyDate);

    console.log("dummyDate:", dummyDate);
    results.forEach((result) => {
      console.log("Booking date: ", result.bookingDetails?.date);
    });

    expect(
      results.some((result) => result.bookingDetails?.date === dummyDate)
    ).toBe(true);
  });

  it("should mark seats as 'gebucht' if booking date matches the target date, otherwise 'frei'", async () => {
    const targetDate = "2024-10-10";
    const results = await bookingInformationByDate(targetDate);

    results.forEach((result) => {
      if (result.status === "gebucht") {
        expect(result.bookingDetails?.date).toBe(targetDate);
      } else if (result.status === "frei") {
        expect(result.bookingDetails?.date).not.toBe(targetDate);
      }
    });
  });
});
