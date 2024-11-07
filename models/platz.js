
const mongoose = require('mongoose');

const platzSchema = new mongoose.Schema({
    PlatzId: { type: Number, required: true }, // Platz-ID als Zahl
    eigenschaften: {
        Tisch: { type: String, required: false }, // Tisch als String
        Monitor: { type: String, required: false }, // Monitor als String
        Fensterplatz: { type: String, required: false }, // Fensterplatz Ja/Nein
        TischArt: { type: String, required: false }, // Art des Tisches
        Barrierefreiheit: { type: String, required: false }, // Rollstuhlgerecht/Nicht Rollstuhlgerecht
        Akustik: { type: String, required: false }, // Lärmisolierung vorhanden/nicht vorhanden
        Arbeitsplatte: { type: String, required: false }, // Standard/Erweitert
        Stuhl: { type: String, required: false } // Art des Stuhls
        //hdmi kabel
        //monitor defekt
        //notizenfeld
    }
});


module.exports = mongoose.model('Platz', platzSchema, 'platz');