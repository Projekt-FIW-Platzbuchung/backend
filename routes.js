const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");
const moment = require("moment");
const { bookingInformationByDate } = require("./helpers_database_requests.js");
const { verifyToken } = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Load environment variables
require('dotenv').config(); 

// Middleware to verify Azure Entra ID token
async function verifyAzureToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];  // Extract Bearer token from header

  if (!token) {
    return res.status(403).send('Token is required');
  }

  try {
    // Verify the token with Azure's public keys (you can use MSAL or manually verify)
    const response = await axios.get(`https://login.microsoftonline.com/common/discovery/keys`);
    const keys = response.data.keys;

    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      return res.status(401).send('Invalid token');
    }

    // Use the key from Azure to verify the JWT token
    const key = keys.find(k => k.kid === decodedToken.header.kid);
    if (!key) {
      return res.status(401).send('Invalid token');
    }

    const verifiedToken = jwt.verify(token, key.x5c[0], { algorithms: ['RS256'] });

    // Attach the decoded user info to the request
    req.user = verifiedToken;
    next();
  } catch (error) {
    console.error('Error verifying Azure token:', error);
    res.status(401).send('Unauthorized');
  }
}

// Test endpoint to generate token (with Azure Entra ID token)
router.post('/generate-token', verifyAzureToken, (req, res) => {
  const user = { 
    userId: req.user.sub, // The user ID from the Azure token (sub claim)
    name: req.user.name || req.user.preferred_username // Name or username from the token
  };

  if (!user.userId || !user.name) {
    return res.status(400).send('UserId and name are required.');
  }

  // Generate the custom JWT token with the user data from Azure token
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
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

//POST-Anfrage für ein neues booking #PROTECTED
router.post("/booking", verifyToken, async (req, res) => {
  const formattedDate = moment(req.body.date).format("DD-MM-YYYY");
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
      date = today.toISOString().split('T')[0]; // Wandelt das Datum in 'YYYY-MM-DD' Format um
    }

    // Aufruf der Funktion mit dem dynamisch gesetzten Datum
    const aggregation = await bookingInformationByDate(date);

    // Sendet die aggregierten Daten als JSON zurück
    res.json(aggregation);
  }
  catch (error) {
    console.error("Fehler beim Aufrufen des Buchungsstatus:", error);
    res.status(500).json({ error: "Ein interner Fehler ist aufgetreten."});
  }
});  

// DELETE-Anfrage für eine Buchung #PROTECTED
router.delete("/bookings/:id", verifyToken, async (req, res) => {
  try {
    await bookings.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch {
    res.status(404);
    res.send({ error: "Buchung nicht gefunden" });
  }
});

//GET-Anfrage Bookings für bestimmten User #PROTECTED
router.get("/bookings/user/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userBookings = await bookings.find({ userId: userId });
    res.json(userBookings);
  }
  catch (error) {
    console.error("Error fetching user bookings:", error);
  }
});

//GET-Anfrage  für Seat Details
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