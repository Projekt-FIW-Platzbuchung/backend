const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");

const { bookingInformationByDate } = require("./helpers_database_requests.js");

// eine GET-Anfrage alle buchungen
router.get("/bookings", async (req, res) => {
  try {
    const allBookings = await bookings.find();

    // Datum formatieren
    const formattedBookings = allBookings.map((booking) => {
      return {
        ...booking._doc,
        date: booking.date.toISOString().split("T")[0], // entfernt Uhrzeit und Zeitzone
      };
    });
    console.log(formattedBookings);
    res.json(formattedBookings);
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

//POST-Anfrage für ein neues booking
router.post("/booking", async (req, res) => {
  const bookingsData = {
    bookingsId: req.body.bookingsId,
    userId: req.body.userId,
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
  aggregation = await bookingInformationByDate("2023-10-01");
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

module.exports = router;
