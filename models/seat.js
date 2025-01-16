const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const seatScheme = new Schema({
  seatId: { type: Number, required: true, unique: true },
  properties: { type: Schema.Types.Mixed, default: {} } // Nutzt den Mixed-Typ für Flexibilität bei den Eigenschaften
});

module.exports = mongoose.model('seat', seatScheme, 'seat');