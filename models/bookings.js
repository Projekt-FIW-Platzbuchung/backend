const mongoose = require('mongoose');

const buchungenSchema = new mongoose.Schema({
    bookingsId: { type: Number, required: true },
    userId: { type: Number, ref: 'user', required: true }, 
    seatId: { type: Number, ref: 'seat', required: true }, 
    date: { type: Date, required: true } 
});



module.exports = mongoose.model('Bookings', buchungenSchema, 'bookings');

