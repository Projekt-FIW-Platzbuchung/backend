const express = require('express');
const router = express.Router();
const User = require('./models/user')
const Buchungen = require('./models/buchungen')
const Platz = require('./models/platz')

// eine GET-Anfrage alle user
router.get('/user', async(req, res) => {
    try {
        const allUsers = await User.find(); // abfrage  User-Modell 
        console.log(allUsers);
        res.json(allUsers); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// eine GET-Anfrage alle buchungen
router.get('/buchungen', async(req, res) => {
    try {
        const allBuchungen = await Buchungen.find(); 
        console.log(allBuchungen);
        res.json(allBuchungen);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// eine GET-Anfrage alle plätze
router.get('/platz', async(req, res) => {
    try {
        const allPlaetze = await Platz.find(); 
        console.log(allPlaetze);
        res.json(allPlaetze); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;