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

// GET-Anfrage aggregation (~ JOIN bei SQL) aus plaetzen und ihrem buchungsstatus
router.get('/seat', async (req, res) => {
    try {
      const allSeatData = await seat.aggregate([
        {
          $lookup: {
            from: 'bookings', // Name der Collection, mit der verbunden werden soll
            localField: '_id', // Feld in der Seat-Collection
            foreignField: 'PlatzId', // Feld in der bookings-Collection
            
            as: 'reservations' // Name des resultierenden Array-Feldes
          }
        }
      ]);
      console.log(allSeatData);
      res.json(allSeatData);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  

module.exports = router;