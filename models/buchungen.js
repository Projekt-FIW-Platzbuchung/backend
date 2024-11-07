const mongoose = require('mongoose');

const buchungenSchema = new mongoose.Schema({
    BuchungsId: { type: Number, required: true },
    UserId: { type: Number, ref: 'User', required: true }, 
    PlatzId: { type: Number, ref: 'Platz', required: true }, 
    datum: { type: Date, required: true } 
});



module.exports = mongoose.model('Buchungen', buchungenSchema, 'buchungen');