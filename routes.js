const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");

const { bookingInformationByDate } = require("./helpers_database_requests.js");

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

//POST-Anfrage für ein neues booking
router.post("/booking", async (req, res) => {
  const bookingsData = {
    userId: req.body.userId,
    username: req.body.username,
    seatId: req.body.seatId,
    date: req.body.date,
  };

  try {
    const newBooking = new bookings(bookingsData);
    const savedBooking = await newBooking.save();
    res.status(201).send(savedBooking);
  } catch (error) {
    console.log(error);
    res.status(500).send("Fehler beim Speichern der Buchung");
  }
});

// GET-anfrage für alle bookings an einem datum
router.get("/date", async (req, res) => {
  try {
    const oneDate = await bookings.find({
      date: "2023-10-10",
    });

    res.json(oneDate);
  } catch (error) {
    console.error("Error fetching date:", error);
    res.status(500).send(error.message);
  }
});

// GET-Anfrage für den Buchungsstatus aller Plätze an einem Datum
router.get("/bookingstatus", async (req, res) => {
  aggregation = await bookingInformationByDate("2023-10-19");
  res.json(aggregation);
});

// DELETE-Anfrage für eine Buchung
router.delete("/bookings/:id", async (req, res) => {
  try {
    await bookings.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Buchung nicht gefunden" });
  }
});

//GET-Anfrage Bookings für bestimmten User
router.get("/bookings/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBookings = await bookings.find({ userId: userId });
    res.json(userBookings);
  }
  catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});


router.get("/seat/:seatId", async (req, res) => {
  try {
    console.log(`Fetching seat details for seatId: ${req.params.seatId}`); // Debugging
    const seatDetails = await seat.findOne({ seatId: parseInt(req.params.seatId) }); // seatId als Zahl verwenden
    if (!seatDetails) {
      return res.status(404).send("Seat not found");
    }
    res.json(seatDetails);
  } catch (error) {
    console.error("Error fetching seat details:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
