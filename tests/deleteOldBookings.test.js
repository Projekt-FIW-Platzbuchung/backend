const {
  deleteOldBookings,
} = require("../helpers_delete_old_bookings");
const bookings = require("../models/bookings");

// Mocking the bookings' Mongoose model methods
jest.mock("../models/bookings");

describe("deleteOldBookings function", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods
    jest.clearAllMocks();
  });

  it("should delete bookings older than today's date", async () => {
    // Setup mock implementation for deleteMany
    bookings.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });

    await deleteOldBookings();

    const today = new Date().toISOString().split("T")[0];

    // Ensure deleteMany was called with the correct query
    expect(bookings.deleteMany).toHaveBeenCalledWith({
      date: { $lt: today },
    });

    // Ensure deleteMany is called exactly once
    expect(bookings.deleteMany).toHaveBeenCalledTimes(1);

    console.log("Test for deleteOldBookings passed!");
  });

  it("should log an error if deleteMany fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Setup mock implementation for deleteMany to throw an error
    bookings.deleteMany = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));

    await deleteOldBookings();

    // Ensure console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error in deleting old bookings:",
      expect.any(Error)
    );

    // Clean up spy
    consoleErrorSpy.mockRestore();
  });
});
