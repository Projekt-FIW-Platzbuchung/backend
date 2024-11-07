const mongoose = require('mongoose');

const gebuchterPlatzSchema = new mongoose.Schema({
    UserId: { type: Number, ref: 'User', required: true }, 
    PlatzId: { type: Number, ref: 'Platz', required: true }, 
    datum: { type: Date, required: true } 
});

const buchungenSchema = new mongoose.Schema({
    BuchungsId: { type: Number, required: true }, 
    GebuchtePlätze: [gebuchterPlatzSchema] 
});


module.exports = mongoose.model('Buchungen', buchungenSchema, 'buchungen');