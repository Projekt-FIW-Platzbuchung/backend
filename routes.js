const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");

const { bookingInformationByDate } = require("./helpers_database_requests.js");

/**
 * @swagger
 * /seat:
 *   get:
 *     summary: Retrieve all seats
 *     description: Fetches all seat records from the database.
 *     responses:
 *       200:
 *         description: A list of seats.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   seatId:
 *                     type: integer
 *                   properties:
 *                     type: object
 *                     properties:
 *                       Table:
 *                         type: string
 *                       Monitor:
 *                         type: string
 *                       WindowSeat:
 *                         type: string
 *                       TableType:
 *                         type: string
 *                       Accessibility:
 *                         type: string
 *                       Acoustics:
 *                         type: string
 *                       WorkTop:
 *                         type: string
 *                       Chair:
 *                         type: string
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @swagger
 * /booking:
 *   post:
 *     summary: Create a new booking
 *     description: Adds a new booking to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user making the booking.
 *               seatId:
 *                 type: integer
 *                 description: ID of the seat being booked.
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the booking.
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                 seatId:
 *                   type: integer
 *                 date:
 *                   type: string
 *                   format: date
 *       500:
 *         description: Error saving the booking.
 */
//POST-Anfrage für ein neues booking
router.post("/booking", async (req, res) => {
  const bookingsData = {
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

/**
 * @swagger
 * /date:
 *   get:
 *     summary: Retrieve bookings for a specific date
 *     description: Fetches all bookings for a specified date.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date to filter bookings (format: YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: A list of bookings for the specified date.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   seatId:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @swagger
 * /bookingstatus:
 *   get:
 *     summary: Retrieve booking status for all seats on a specific date
 *     description: Returns the booking status of all seats for a given date.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date to check booking status (format: YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Booking status details for the specified date.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   seatId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   userId:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error.
 */
// GET-Anfrage für den Buchungsstatus aller Plätze an einem Datum
router.get("/bookingstatus", async (req, res) => {
  aggregation = await bookingInformationByDate("2023-10-19");
  res.json(aggregation);
});

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking by ID
 *     description: Deletes a booking from the database using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the booking to delete.
 *     responses:
 *       204:
 *         description: Booking deleted successfully.
 *       404:
 *         description: Booking not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Buchung nicht gefunden
 */
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

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Retrieve bookings for a specific user
 *     description: Fetches all bookings made by a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user.
 *     responses:
 *       200:
 *         description: A list of user bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   seatId:
 *                     type: integer
 *                   date:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @swagger
 * /seat/{seatId}:
 *   get:
 *     summary: Retrieve details of a specific seat
 *     description: Fetches seat details by seat ID.
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the seat to fetch details for.
 *     responses:
 *       200:
 *         description: Seat details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 seatId:
 *                   type: integer
 *                 properties:
 *                   type: object
 *                   properties:
 *                     Table:
 *                       type: string
 *                     Monitor:
 *                       type: string
 *                     WindowSeat:
 *                       type: string
 *                     TableType:
 *                       type: string
 *                     Accessibility:
 *                       type: string
 *                     Acoustics:
 *                       type: string
 *                     WorkTop:
 *                       type: string
 *                     Chair:
 *                       type: string
 *       404:
 *         description: Seat not found.
 *       500:
 *         description: Internal server error.
 */
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
