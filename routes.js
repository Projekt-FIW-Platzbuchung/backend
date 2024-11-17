const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");

const { bookingInformationByDate } = require('./helpers_database_requests.js'); 

// eine GET-Anfrage alle user
router.get("/user", async (req, res) => {
  try {
    const allUsers = await user.find(); // abfrage  User-Modell
    console.log(allUsers);
    res.json(allUsers);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// eine GET-Anfrage alle buchungen
router.get("/bookings", async (req, res) => {
  try {
    const allBookings = await bookings.find();
    console.log(allBookings);
    res.json(allBookings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// eine GET-Anfrage alle seats
router.get("/seat", async (req, res) => {
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
        console.log(error)
        res.status(500).send('Fehler beim Speichern der Buchung');   
    }

});

// GET-anfrage für alle bookings an einem datum
router.get("/date", async (req, res) => {
  try {
    const oneDate = await bookings.find({
      datum: "2023-10-10",
    });

    res.json(oneDate);
  } catch (error) {
    console.error("Error fetching date:", error);
  }
});

router.get("/bookingstatus", async (req, res) => {
  aggregation = await bookingInformationByDate("2023-10-01");
  res.json(aggregation);
});

router.get("/bookings/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBookings = await bookings.find({ userId: userId });
    res.json(userBookings);
  }
  catch (error) {
    console.error("Error fetching user bookings:", error);
  }
} 
);

router.get("/bookingsWithUsers", async (req, res) => {
  try {
    const allBookings = await bookings.find();
    const allUsers = await user.find();

    const result = allBookings.map(booking => {
      const bookingUser = allUsers.find(u => u.userId === booking.userId);
      return {
        ...booking.toObject(),
        userName: bookingUser ? bookingUser.name : "Unbekannt"
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

