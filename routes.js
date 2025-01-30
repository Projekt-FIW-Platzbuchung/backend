const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const seatService = require("./services/seatService.js");
const bookings = require("./models/bookings");
const moment = require("moment");


const { bookingInformationByDate } = require("./helpers_database_requests.js");

// eine GET-Anfrage alle seats
/**
 * @swagger
 * /seat:
 *   post:
 *     summary: Create a new seat
 *     description: Create a new seat in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seatId:
 *                 type: integer
 *                 example: 1
 *                 description: Unique ID for the seat.
 *               properties:
 *                 type: object
 *                 example: { "type": "premium", "capacity": 4 }
 *                 description: Additional properties for the seat.
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                     example: 5.3
 *                   y:
 *                     type: number
 *                     example: 7.2
 *                 description: Coordinates of the seat.
 *     responses:
 *       201:
 *         description: Successfully created the seat.
 *       400:
 *         description: Invalid input.
 *       500:
 *         description: Internal server error.
 */
router.get("/seat", async (req, res) => {
  try {
    const allSeats = await seat.find();
    res.json(allSeats);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//POST-Anfrage für ein neues booking
/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Create a new booking
 *     description: | Create a booking for a user with a specified seat and date. Validates that:
 *       - The seat is not already booked for the specified date.
 *       - The seat exists in the `seat` collection.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 123
 *                 description: The ID of the user creating the booking. References the `user` collection.
 *               username:
 *                 type: string
 *                 example: "John Doe"
 *                 description: The name of the user.
 *               seatId:
 *                 type: integer
 *                 example: 1
 *                 description: The ID of the seat to book. References the `seat` collection.
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *                 description: The date for which the seat is being booked.
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                     example: 5.3
 *                   y:
 *                     type: number
 *                     example: 7.2
 *                 description: Coordinates of the seat.
 *     responses:
 *       201:
 *         description: Successfully created the booking.
 *       400:
 *         description: Invalid input or seat already booked.
 *       500:
 *         description: Internal server error.
 */
router.post("/booking", async (req, res) => {
  try {
    const formattedDate = moment(req.body.date).format("YYYY-MM-DD");
    const bookingsData = {
      userId: req.body.userId,
      username: req.body.username,
      seatId: req.body.seatId,
      date: formattedDate,
      coordinates: req.body.coordinates
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
/**
 * @swagger
 * /date:
 *   get:
 *     summary: Retrieve all bookings for a specific date
 *     description: Fetches all bookings that exist on a given date.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date in format YYYY-MM-DD
 *     responses:
 *       200:
 *         description: A list of bookings for the specified date.
 *       500:
 *         description: Server error.
 */
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
/**
 * @swagger
 * /bookingstatus:
 *   get:
 *     summary: Retrieve booking status of all seats for a specific date
 *     description: Returns an aggregation of booking statuses for all seats on a given date.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: The date for which booking status should be checked. Defaults to today's date if not provided.
 *     responses:
 *       200:
 *         description: Booking status of all seats.
 *       500:
 *         description: Server error.
 */
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
   // console.log(aggregation);
  } catch (error) {
    console.error("Fehler beim Aufrufen des Buchungsstatus:", error);
    res.status(500).json({ error: "Ein interner Fehler ist aufgetreten." });
  }
});

// GET-Anfrage für die Details einer Buchung für Seat und Datum
/**
 * @swagger
 * /bookingdetails:
 *   get:
 *     summary: Get booking details for a specific seat on a given date
 *     description: Fetches booking information, including the username, for a particular seat on a specified date.
 *     parameters:
 *       - in: query
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the seat.
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The booking date.
 *     responses:
 *       200:
 *         description: Booking details for the seat.
 *       400:
 *         description: Missing seatId or date.
 *       404:
 *         description: No booking found.
 *       500:
 *         description: Server error.
 */
router.get('/bookingdetails', async (req, res) => {
  try {
    // Extract seatId and date from query parameters
    const { seatId, date } = req.query;
   
    if (!seatId || !date) {
      return res.status(400).json({ message: 'Missing seatId or date' });
    }

    
    // Query the database for the booking details based on seatId and date
    const bookingDetails = await bookings.findOne({
      seatId: seatId,
      date: date,
    }).exec();

    if (!bookingDetails) {
      return res.status(404).json({ message: 'No booking found for this seat on the given date' });
    }

    // Return the booking details (for example, username)
    res.status(200).json({ bookingDetails: bookingDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}); 

// DELETE-Anfrage für eine Buchung
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking to delete.
 *     responses:
 *       204:
 *         description: Booking deleted successfully.
 *       404:
 *         description: Booking not found.
 */
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
/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get all bookings for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID whose bookings need to be retrieved.
 *     responses:
 *       200:
 *         description: List of bookings for the user.
 *       500:
 *         description: Server error.
 */
router.get("/bookings/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBookings = await bookings.find({ userId: userId });
    res.json(userBookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});

// Get-Anfrage für einen Platz
/**
 * @swagger
 * /seat/{seatId}:
 *   get:
 *     summary: Retrieve details of a specific seat
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the seat.
 *     responses:
 *       200:
 *         description: Seat details.
 *       404:
 *         description: Seat not found.
 */
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
/**
 * @swagger
 * /seat/{seatId}:
 *   delete:
 *     summary: Delete a seat
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the seat to delete.
 *     responses:
 *       200:
 *         description: Seat deleted successfully.
 *       404:
 *         description: Seat not found.
 */
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
/**
 * @swagger
 * /seat:
 *   post:
 *     summary: Create a new seat
 *     responses:
 *       201:
 *         description: Seat created successfully.
 *       500:
 *         description: Error occurred during seat creation.
 */
router.post("/seat", async (req, res) => {
  try {
    // Suche nach dem aktuell höchsten seatId-Wert
    const lastSeat = await seat.findOne().sort("-seatId").exec();
    // Berechnet newSeatId basierend auf der höchsten vorhandenen seatId
    const newSeatId = lastSeat ? lastSeat.seatId + 1 : 1; // Fängt mit 1 an, wenn es keine Einträge gibt

    if (!newSeatId) {
      console.error("Fehler: Keine neue seatId generierbar");
      return res.status(500).send("Fehler beim Generieren einer neuen seatId");
    }

    const properties = req.body.properties || {};
    const coordinates = req.body.coordinates;
    const seatData = { seatId: newSeatId, properties: properties, coordinates: coordinates };
    const newSeat = new seat(seatData);
    const savedSeat = await newSeat.save();
    console.log("Saved Seat:", savedSeat);

    res.status(201).json(savedSeat);
    } catch (err) {
    console.log("Error during seat creation:", err);
    res.status(500).send("Fehler beim Speichern des neuen Platzes");
  }
});

// UPDATE-Anfrage für einen Platz
/**
 * @swagger
 * /seat/{seatId}:
 *   put:
 *     summary: Update a seat's coordinates or properties
 *     responses:
 *       200:
 *         description: Seat updated successfully.
 *       404:
 *         description: Seat not found.
 */
router.put("/seat/:seatId", async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10);
    const updatedCoordinates = req.body.coordinates || {}; // erwartet ein Objekt { x: value, y: value }
    const updatedProperties = req.body.properties || {}; // erwartet ein Objekt mit neuen/aktualisierten Properties

    console.log("Empfangene Koordinaten vom Frontend:", updatedCoordinates);
    console.log("Empfangene Eigenschaften vom Frontend:", updatedProperties);

    const seatDoc = await seat.findOne({ seatId: seatId });
    if (!seatDoc) {
      return res.status(404).json({ message: "Seat nicht gefunden." });
    }

    // Aktualisiert die Koordinaten, wenn sie vorhanden sind
    let newCoordinates = { ...seatDoc.coordinates };
    if (updatedCoordinates && typeof updatedCoordinates === 'object') {
      if (updatedCoordinates.x !== undefined) {
        newCoordinates.x = updatedCoordinates.x;
      }
      if (updatedCoordinates.y !== undefined) {
        newCoordinates.y = updatedCoordinates.y;
      }
    }

    console.log("Vorhandene Eigenschaften in der Datenbank:", seatDoc.properties);

    const currentProperties = seatDoc.properties || {};

    // Löscht explizit definierte Eigenschaften (z.B., wenn der Key zum Löschen übermittelt wird)
    const propertiesToDelete = req.body.propertiesToDelete || []; // Array von Schlüssel-Strings, die gelöscht werden sollen

    propertiesToDelete.forEach(key => {
      delete currentProperties[key];
    });

    // Iteriert über die Schlüssel von updatedProperties
    for (const [key, value] of Object.entries(updatedProperties)) {
      currentProperties[key] = value; // Aktualisiert den bestehenden Wert oder fügt einen neuen hinzu
    }

    // Speichert die aktualisierten Koordinaten und Eigenschaften zurück in die Datenbank
    const updatedSeat = await seat.findOneAndUpdate(
      { seatId: seatId },
      { $set: { coordinates: newCoordinates, properties: currentProperties } },
      { new: true }
    );

    console.log("Nach der Aktualisierung in der Datenbank:", updatedSeat.properties);

    res.status(200).json({ message: "Koordinaten und Eigenschaften erfolgreich aktualisiert", updatedSeat: updatedSeat });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Eigenschaften:", error);
    res.status(500).json({ message: "Serverfehler.", error: error.message });
  }    
});

module.exports = router;
