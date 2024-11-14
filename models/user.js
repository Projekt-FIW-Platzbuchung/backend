const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
    userId: { type: Number, required: true },
    name: { type: String, required: true }, 
    
});


module.exports = mongoose.model('Users', userScheme, 'users');