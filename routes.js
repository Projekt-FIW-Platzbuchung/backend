const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const seatService = require("./services/seatService.js");
const bookings = require("./models/bookings");
const moment = require("moment");
const authenticateJWT = require('./middleware/authenticateJWT');
const { bookingInformationByDate } = require("./helpers_database_requests.js");

/**
 * @swagger
 * /protected-resource:
 *   get:
 *     summary: Access a protected resource
 *     description: Retrieves a protected resource that requires a valid JWT token.
 *     tags:
 *       - protected
 *     security:
 *       - bearerAuth: []  
 *     responses:
 *       200:
 *         description: Successfully accessed the protected resource.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: This is a protected resource your token has accessed.
 *       401:
 *         description: Unauthorized access due to invalid or missing token.
 *       500:
 *         description: Server error.
 */

router.get("/protected-resource", authenticateJWT, (req, res) => {
  res.send('This is a protected resource your token has accessed.');
});


/**
 * @swagger
 * /seat:
 *   get:
 *     summary: Retrieve all seats
 *     description: Fetch all available seats from the database.
 *     tags:
 *       - seats
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the seats.
 *       500:
 *         description: Internal server error.
 */
router.get("/seat", authenticateJWT, async (req, res) => {
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
 *     description: |
 *       Create a booking for a user with a specified seat and date. Validates that:
 *         - The seat is not already booked for the specified date.
 *         - The seat exists in the `seat` collection.
 *     tags:
 *       - bookings
 *     security:
 *        - bearerAuth: []
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
router.post("/booking", authenticateJWT, async (req, res) => {
  try {
    const formattedDate = moment(req.body.date).format("YYYY-MM-DD");
    const bookingsData = {
      userId: req.body.userId,
      username: req.body.username,
      seatId: req.body.seatId,
      date: formattedDate,
      coordinates: req.body.coordinates
    };

    
      const newBooking = new bookings(bookingsData);
      const savedBooking = await newBooking.save();
      res.status(201).send(savedBooking);
    }
    
    catch (error) {
      console.log(error);
      if (error.message.includes("Dieser Sitzplatz ist an dem gewählten Datum bereits gebucht")) {
        res.status(400).send({ error: "Dieser Sitzplatz ist an dem gewählten Datum bereits gebucht." });
      } else if (error.message.includes("Der Sitzplatz wurde nicht gefunden")) {
        res.status(400).send({ error: "Der Sitzplatz wurde nicht gefunden." });
      } else {
        res.status(500).send({ error: "Ein unerwarteter Fehler ist aufgetreten." });
      }
    }
  }
);  


// GET-anfrage für alle bookings an einem datum
/**
 * @swagger
 * /date:
 *   get:
 *     summary: Retrieve all bookings for a specific date
 *     description: Fetches all bookings that exist on a given date.
 *     tags:
 *       - bookings
 *     security:
 *        - bearerAuth: []
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
router.get("/date", authenticateJWT, async (req, res) => {
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


/**
 * @swagger
 * /bookingstatus:
 *   get:
 *     summary: Retrieve booking status of all seats for a specific date
 *     description: Returns an aggregation of booking statuses for all seats on a given date.
 *     tags:
 *       - bookings
 *     security:
 *        - bearerAuth: []
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
router.get("/bookingstatus", authenticateJWT, async (req, res) => {
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


/**
 * @swagger
 * /bookingdetails:
 *   get:
 *     summary: Get booking details for a specific seat on a given date
 *     description: Fetches booking information, including the username, for a particular seat on a specified date.
 *     tags:
 *       - bookings
 *     security:
 *        - bearerAuth: []
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
router.get('/bookingdetails', authenticateJWT, async (req, res) => {
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


/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     tags:
 *       - bookings
 *     security:
 *        - bearerAuth: []
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
router.delete("/bookings/:id", authenticateJWT, async (req, res) => {
  try {
    await bookings.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Buchung nicht gefunden" });
  }
});


/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get all bookings for a specific user
 *     tags:
 *       - bookings
 *     security:
 *        - bearerAuth: []
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
router.get("/bookings/user/:userId", authenticateJWT, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBookings = await bookings.find({ userId: userId });
    res.json(userBookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});


/**
 * @swagger
 * /seat/{seatId}:
 *   get:
 *     summary: Retrieve details of a specific seat
 *     tags:
 *       - seats
 *     security:
 *        - bearerAuth: []
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
router.get("/seat/:seatId", authenticateJWT, async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10); // Konvertiert seatId zu einer Zahl
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


/**
 * @swagger
 * /seat/{seatId}:
 *   delete:
 *     summary: Delete a seat and its associated bookings
 *     description: This endpoint deletes a seat by its ID and removes all bookings associated with this seat.
 *     tags:
 *       - seats
 *     security:
 *        - bearerAuth: []
 *     x-note: Uses the `deleteOneSeat` helper function from `services/seatService`.
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the seat to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the seat and its bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 seatId:
 *                   type: integer
 *       404:
 *         description: Seat not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
router.delete("/seat/:seatId", authenticateJWT, async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10); // Konvertiert seatId zu einer Zahl
    const result = await seatService.deleteOneSeat(seatId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Seat not found" });
    }
    res.status(200).json({
        message: "Seat successfully deleted",
        seatId: seatId,
      });
  } catch (err) {
    console.error(`Error deleting seat: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});


/**
 * @swagger
 * /seat:
 *   post:
 *     summary: Create a new seat
 *     tags:
 *       - seats
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       201:
 *         description: Seat created successfully.
 *       500:
 *         description: Error occurred during seat creation.
 */
router.post("/seat", authenticateJWT, async (req, res) => {
  try {
    const seats = await seat.find().sort("seatId").exec();
    let newSeatId = 1;

    for (let i = 0; i < seats.length; i++) {
      if (seats[i].seatId !== i + 1) {
        newSeatId = i + 1;
        break;
      }
      newSeatId = i + 2;
    }

    const properties = req.body.properties || {};
    const coordinates = req.body.coordinates;
    const seatData = { seatId: newSeatId, properties: properties, coordinates: coordinates };

    const newSeat = new seat(seatData);
    const savedSeat = await newSeat.save();

    res.status(201).json(savedSeat);
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Catch validation errors and return a 400 status code
      console.log("Validation Error:", err.message);
      return res.status(400).json({ error: 'Invalid seat data' });
    }

    console.log("Error during seat creation:", err);
    res.status(500).send("Fehler beim Speichern des neuen Platzes");
  }
});



/**
 * @swagger
 * /seat/{seatId}:
 *   put:
 *     summary: Update a seat's coordinates or properties
 *     tags:
 *       - seats
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seat updated successfully.
 *       404:
 *         description: Seat not found.
 */
router.put("/seat/:seatId", authenticateJWT, async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId, 10);
    const updatedCoordinates = req.body.coordinates || {}; // erwartet ein Objekt { x: value, y: value }
    const updatedProperties = req.body.properties || {}; // erwartet ein Objekt mit neuen/aktualisierten Properties


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


    res.status(200).json({ message: "Koordinaten und Eigenschaften erfolgreich aktualisiert", updatedSeat: updatedSeat });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Eigenschaften:", error);
    res.status(500).json({ message: "Serverfehler.", error: error.message });
  }    
});

module.exports = router;
