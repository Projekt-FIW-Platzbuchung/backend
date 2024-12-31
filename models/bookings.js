const mongoose = require('mongoose');

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

module.exports = mongoose.model('bookings', bookingScheme, 'bookings');