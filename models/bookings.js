const mongoose = require("mongoose");

const bookingScheme = new mongoose.Schema({
  userId: { type: Number, ref: "user", required: true },
  username: { type: String, required: true },
  seatId: { type: Number, ref: "seat", required: true },
  date: { type: String, required: true },
});

bookingScheme.pre("save", async function (next) {
  const existingBooking = await mongoose.model("bookings").findOne({
    seatId: this.seatId,
    date: this.date,
  });

  if (existingBooking) {
    message = "Dieser Platz ist an dem angegebenen Datum bereits gebucht.";
    
    return next(new Error());
  }

  next();
});

module.exports = mongoose.model("bookings", bookingScheme, "bookings");
