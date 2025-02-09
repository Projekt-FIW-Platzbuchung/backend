const {
  deleteOldBookings,
} = require("../helpers_delete_old_bookings");
const bookings = require("../models/bookings");


jest.mock("../models/bookings");

describe("deleteOldBookings function", () => {
  beforeEach(() => {
    
    jest.clearAllMocks();
  });

  it("should delete bookings older than today's date", async () => {
   
    bookings.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 5 });

    await deleteOldBookings();

    const today = new Date().toISOString().split("T")[0];

    
    expect(bookings.deleteMany).toHaveBeenCalledWith({
      date: { $lt: today },
    });

    
    expect(bookings.deleteMany).toHaveBeenCalledTimes(1);

    console.log("Test for deleteOldBookings passed!");
  });

  it("should log an error if deleteMany fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    
    bookings.deleteMany = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));

    await deleteOldBookings();

    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error in deleting old bookings:",
      expect.any(Error)
    );

    
    consoleErrorSpy.mockRestore();
  });
});
