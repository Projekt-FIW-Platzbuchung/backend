const express = require('express');
const router = express.Router();
const seat = require('./models/seat');
const bookings = require('./models/bookings');
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
router.get('/bookings', async(req, res) => {
    try {
        const allBookings = await bookings.find(); 
        console.log(allBookings);
        res.json(allBookings);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// eine GET-Anfrage alle plätze
router.get('/seat', async(req, res) => {
    try {
        const allSeats = await seat.find(); 
        console.log(allSeats);
        res.json(allSeats); 
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//POST-Anfrage für booking
router.post('/booking', async(req,res) => {
   
    const bookingsData={
        bookingsId: req.body.bookingsId,
        userId: req.body.userId,
        seatId: req.body.seatId,
        date: req.body.date
    };
    
    try {

        const newBooking = new bookings(bookingsData)
        const savedBooking = await newBooking.save();
        res.status(201).send(savedBooking);
        
    } catch (error) {
        console.log(err.stack)
        res.status(500).send('Fehler beim Speichern der Buchung');   
    }

});

module.exports = router;