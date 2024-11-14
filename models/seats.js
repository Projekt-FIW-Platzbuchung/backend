
const mongoose = require('mongoose');

const platzSchema = new mongoose.Schema({
  seatId: { type: Number, required: true },
  properties: {
      table: { type: String, required: false }, 
      monitor: { type: String, required: false }, 
      windowSeat: { type: String, required: false }, 
      tableType: { type: String, required: false }, 
      accessibility: { type: String, required: false }, 
      acoustics: { type: String, required: false }, 
      workTop: { type: String, required: false }, 
      chair: { type: String, required: false } 
  }
});


module.exports = mongoose.model('Seats', platzSchema, 'seats');