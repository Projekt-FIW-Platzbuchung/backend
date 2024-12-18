const mongoose = require('mongoose');

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
        Chair: { type: String, required: false } // Art des Stuhls
        //hdmi kabel
        //monitor defekt
        //notizenfeld
    }
});

module.exports = mongoose.model('seat', seatScheme, 'seat');