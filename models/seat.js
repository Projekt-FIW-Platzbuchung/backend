const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const seatScheme = new Schema({
  seatId: { type: Number, required: true, unique: true }, 
  properties: { type: Schema.Types.Mixed, default: {} }, 
  coordinates: {
      x: { type: Number, required: true},
      y: { type: Number, required: true},
  }
});

module.exports = mongoose.model('seat', seatScheme, 'seat');