/*const mongoose = require('mongoose');

const seatScheme = new mongoose.Schema({
    seatId: { type: Number, required: true, unique: true }, // Platz-ID als Zahl
    properties: {
        Table: { type: String, required: false }, // Tisch als String
        Monitor: { type: String, required: false }, // Monitor als String
        WindowSeat: { type: String, required: false }, // Fensterplatz Ja/Nein
        TableType: { type: String, required: false }, // Art des Tisches
        Accessibility: { type: String, required: false }, // Rollstuhlgerecht/Nicht Rollstuhlgerecht
        Acoustics: { type: String, required: false }, // Lärmisolierung vorhanden/nicht vorhanden
        WorkTop: { type: String, required: false }, // Standard/Erweitert
        Chair: { type: String, required: false }, // Art des Stuhls
        //hdmi kabel
        //monitor defekt
        //notizenfeld
        //additionalProperties: { type: Map, of: String, default: {} } // Hier können dynamische Eigenschaften hinzugefügt werden durch Verwendung der Mongoose-Map
    }
});*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seatScheme = new Schema({
  seatId: { type: Number, required: true, unique: true },
  properties: { type: Schema.Types.Mixed, default: {} } // Nutzt den Mixed-Typ für Flexibilität bei den Eigenschaften
});

module.exports = mongoose.model('seat', seatScheme, 'seat');