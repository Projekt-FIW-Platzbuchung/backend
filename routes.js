const express = require('express');
const router = express.Router();
const platz = require('./models/platz');
const buchungen = require('./models/buchungen');
const user = require('./models/user');

// eine GET-Anfrage alle user
router.get('/user', async(req, res) => {
    try {
        const allUsers = await user.find(); // abfrage  User-Modell 
        console.log(allUsers);
        res.json(allUsers); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// eine GET-Anfrage alle buchungen
router.get('/buchungen', async(req, res) => {
    try {
        const allBookings = await buchungen.find(); 
        console.log(allBookings);
        res.json(allBookings);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
router.get('/platz/:PlatzId', async(req, res) => {
    const einPlatz = await platz.findOne({ PlatzId: req.params.PlatzId });
    console.log(req.params);
    if(einPlatz) {
        res.send(einPlatz);
    } else {
        res.status(404);
        res.send({
            error: "platz does not exist!"
        });
    }
});
    // eine GET-Anfrage alle plätze
router.get('/platz', async(req, res) => {
    try {
        const allSeats = await platz.find(); 
        console.log(allSeats);
        res.json(allSeats); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;