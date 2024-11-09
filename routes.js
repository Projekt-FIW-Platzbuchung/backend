const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");


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

  // const cursor = db.collection('inventory').find({  'size.uom': 'in'});

 // GET-anfrage für alle bookings an einem datum
 router.get("/date", async (req, res) => {
   
        try {
          const oneDate = await bookings.find({
            'gebuchtePlaetze.datum': "2023-10-06"
          });
      
          console.log(oneDate);
          res.json(oneDate);
        } catch (error) {
          console.error("Error fetching date:", error);
        }
      });


// $lookup - simpler Test
async function enrichbookingsWithSeatInformation() {
    return bookings.aggregate([
      {
        $lookup: {
          from: 'seats',
          localField: 'eigenschaften',
          foreignField: 'Platzid',
          as: 'aggregation'
        }
      }
    ]);
  }
  await enrichOrdersWithProducts();

// eine GET-Anfrage alle plätze un ihr buchungsstatus
router.get("/bookingstatus", async (req, res) => {
  try {
    // Verwenden von Query-Parameter für das Datum
    const bookingDate = req.query.date || "2023-10-17"; // dummy-Fallback-Datum einstellbar

    // Aggregation
    const seatBookingStatus = await seat.aggregate([ // die collection die wir abrufen: seat
      {
        $lookup: {
          from: "bookings", // Die collection mit der wir verknüpfen: bookings
          let: { seatId: "$_id" }, // Variablen für den Lookup
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$seatId", "$gebuchtePlaetze.PlatzId"] }, // Verwende den PlatzId aus dem eingebetteten Dokument
                  ],
                },
              },
            },
            {
              $unwind: "$gebuchtePlaetze" // Entpacken des Arrays gebuchtePlaetze
            },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$gebuchtePlaetze.PlatzId", "$seatId"] },
                    { $eq: ["$gebuchtePlaetze.datum", bookingDate] }, // Vergleichen mit bookingDate direkt
                  ],
                },
              },
            },
          ],
          as: "reservations",
        },
      },
      {
        $addFields: {
          seatBookingStatus: {
            $cond: {
              if: { $gt: [{ $size: "$reservations" }, 0] },
              then: "gebucht",
              else: "frei",
            },
          },
        },
      },
    ]);

    res.json(seatBookingStatus);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
