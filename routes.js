const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const seatService = require("./services/seatService.js");
const bookings = require("./models/bookings");
const user = require("./models/user");
const moment = require("moment");
const mongoose = require("mongoose");

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
  try {
    const formattedDate = moment(req.body.date).format("YYYY-MM-DD");
    const bookingsData = {
      userId: req.body.userId,
      username: req.body.username,
      seatId: req.body.seatId,
      date: formattedDate,
    };

    try {
      const newBooking = new bookings(bookingsData);
      const savedBooking = await newBooking.save();
      res.status(201).send(savedBooking);
    } catch (error) {
      console.log(error);
      res.status(500).send("Fehler beim Speichern der Buchung");
    }
  } catch (error) {
    if (
      error.message.includes(
        "Dieser Sitzplatz ist an dem gewählten Datum bereits gebucht"
      )
    ) {
      res.status(400).send({ error: error.message });
    } else {
      res
        .status(500)
        .send({ error: "Ein unerwarteter Fehler ist aufgetreten." });
    }
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
  try {
    // Holt das Datum aus den Abfrageparametern
    let date = req.query.date;

    // Verwendet das heutige Datum als Standarddatum, wenn kein Datum bereitgestellt wurde
    if (!date) {
      const today = new Date();
      date = today.toISOString().split("T")[0]; // Wandelt das Datum in 'YYYY-MM-DD' Format um
    }

    // Aufruf der Funktion mit dem dynamisch gesetzten Datum
    const aggregation = await bookingInformationByDate(date);

    // Sendet die aggregierten Daten als JSON zurück
    res.json(aggregation);
  } catch (error) {
    console.error("Fehler beim Aufrufen des Buchungsstatus:", error);
    res.status(500).json({ error: "Ein interner Fehler ist aufgetreten." });
  }
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
  } catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});

router.get("/seat/:seatId", async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10); // Konvertiert seatId zu einer Zahl
    console.log(`Fetching seat details for seatId: ${req.params.seatId}`); // Debugging
    const seatDetails = await seat.findOne({ seatId: seatId });
    if (!seatDetails) {
      return res.status(404).send("Seat not found");
    }
    res.json(seatDetails);
  } catch (error) {
    console.error("Error fetching seat details:", error);
    res.status(500).send(error.message);
  }
});

// DELETE-Anfrage für einen nicht mehr benötigten Platz
router.delete("/seat/:seatId", async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10); // Konvertiert seatId zu einer Zahl
    console.log(`Attempting to delete seat with ID: ${seatId}`);
    const result = await seatService.deleteOneSeat(seatId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Seat not found" });
    }
    console.log(`Successfully deleted seat with ID: ${seatId}`);
    res.status(200).json({
        message: "Seat successfully deleted",
        seatId: seatId,
      });
  } catch (err) {
    console.error(`Error deleting seat: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// POST-Anfrage für einen neuen Platz
router.post("/seat", async (req, res) => {
  console.log("Request body:", req.body);
  try {
    // Suche nach dem aktuell höchsten seatId-Wert
    const lastSeat = await seat.findOne().sort("-seatId").exec();
    // Berechnet newSeatId basierend auf der höchsten vorhandenen seatId
    const newSeatId = lastSeat ? lastSeat.seatId + 1 : 1; // Fängt mit 1 an, wenn es keine Einträge gibt

    if (!newSeatId) {
      console.error("Fehler: Keine neue seatId generierbar");
      return res.status(500).send("Fehler beim Generieren einer neuen seatId");
    }

     // Standardisierte Feld-Zuweisung, überprüft, ob sie in req.body.properties enthalten sind
    /*const standardProperties = {
      Table: req.body.properties?.Table,
      Monitor: req.body.properties?.Monitor,
      WindowSeat: req.body.properties?.WindowSeat,
      TableType: req.body.properties?.TableType,
      Accessibility: req.body.properties?.Accessibility,
      Acoustics: req.body.properties?.Acoustics,
      WorkTop: req.body.properties?.WorkTop,
      Chair: req.body.properties?.Chair,
    };*/

    // Dynamische Eigenschaften
    // const dynamicProperties = req.body.properties || {};

    const properties = req.body.properties || {};

    // Kombiniert standardisierte und dynamische Eigenschaften
    /*const combinedProperties = { 
      ...standardProperties, 
    };  */
    // Übergabe der vollständigen dynamischen Eigenschaften, Initialisieren der dynamischen `additionalProperties`
    // combinedProperties.additionalProperties = { ...dynamicProperties };

   /* for (const key in dynamicProperties) {
      if (!standardProperties.hasOwnProperty(key)) {
        combinedProperties[key] = dynamicProperties[key]; // Weise dynamische Eigenschaften zu
      }
    }*/

    //console.log("Standard properties:", standardProperties);
    //console.log("Dynamic properties:", dynamicProperties);
    //console.log("Combined properties:", combinedProperties);

    const seatData = { seatId: newSeatId, properties: properties };
  
    const newSeat = new seat(seatData);
    /* const newSeat = new Seat({
      seatId: newSeatId,
      properties: combinedProperties
    }); */
    const savedSeat = await newSeat.save();
    console.log("Saved Seat:", savedSeat);

    /*res.status(201).json({
      ...savedSeat.toObject(), // Verwendet `toObject` falls nötig um Mongoose Dokument in ein POJO zu konvertieren
      properties: propertiesJSON
    });*/
    res.status(201).json(savedSeat);
    } catch (err) {
    console.log("Error during seat creation:", err);
    res.status(500).send("Fehler beim Speichern des neuen Platzes");
  }
});

module.exports = router;
