const mongoose = require('mongoose');

const seatScheme = new mongoose.Schema({
  seatId: { type: Number, required: true, unique: true }, // Platz-ID als Zahl
  properties: { type: Schema.Types.Mixed, default: {} }, // Nutzt den Mixed-Typ für Flexibilität bei den Eigenschaften
  coordinates: {
      x: { type: Number, required: true},
      y: { type: Number, required: true},
  }
});

module.exports = mongoose.model('seat', seatScheme, 'seat');