const mongoose = require("mongoose");
const seat = require("./seat");

const bookingScheme = new mongoose.Schema({
    
    userId: { type: Number, ref: 'user', required: true }, 
    username: { type: String, required: true },
    seatId: { type: Number, ref: 'seat', required: true }, 
    date: { type: String, required: true }, 
    coordinates: {
        x: { type: Number, required: true},
        y: { type: Number, required: true},
    } 
});

/**
 * Pre-save hook for the booking schema to verify that
 * 1. the seat specified in the booking is not already booked for the specified date.
 * 2. the seat exists in the collection
 *
 * @this {mongoose.Document} The document being saved.
 * @param {Function} next - The callback function to proceed to the next middleware.
 */
bookingScheme.pre("save", async function (next) {
  try {
    // Check if the seat already exists in your bookings for the specified date
    const existingBooking = await mongoose.model("bookings").findOne({
      seatId: this.seatId,
      date: this.date,
    });

    if (existingBooking) {
      const error = new Error(
        "Dieser Sitzplatz ist an dem gewählten Datum bereits gebucht."
      );
      return next(error);
    }

    // Check if the seat exists in the seats collection
    const seatExists = await mongoose
      .model("seat")
      .exists({ seatId: this.seatId });

    if (!seatExists) {
      const error = new Error("Der Sitzplatz wurde nicht gefunden.");
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("bookings", bookingScheme, "bookings");
