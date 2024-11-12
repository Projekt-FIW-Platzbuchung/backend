const express = require('express');
const router = express.Router();
const seat = require('./models/seat');
const bookings = require('./models/bookings');
const user = require('./models/user');


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
            'gebuchtePlaetze.datum': "2023-10-01"
          });
      
          console.log(oneDate);
          res.json(oneDate);
        } catch (error) {
          console.error("Error fetching date:", error);
        }
      });


// $lookup - simpler Test,soll bookings-mit seats aggregieren als aggregation ~ Vorlage für aggregations die funtioniert
async function enrichBookingsWithSeatInformation() {
  try {
    const results = await bookings.aggregate([
      {
        $lookup: {
          from: 'seat',  // Die Collection, mit der aggregiert wird
          localField: 'gebuchtePlaetze.platzId',  // Das Feld in der 'bookings'-Collection, das die Referenz enthält
          foreignField: 'PlatzId',  // Das entsprechende Feld in der 'seat'-Collection
          as: 'seatDetails'  // Der Name des Arrays, das die verknüpften Dokumente aus 'seat' enthält
        }
      },
      {
        $unwind: '$seatDetails'  // Um das Array aufzulösen
      },
      {
        $project: {
          'buchungsId': 1,
          'gebuchtePlaetze.platzId': 1,
          'gebuchtePlaetze.datum': 1,
          'gebuchtePlaetze.userId': 1, // achtung. es gibt keinen fehler wenn hier etwas falsch geschrieben ist, das taucht nur nicht auf!
          'seatDetails.eigenschaften': 1 // Nur die 'eigenschaften' des Sitzes
        }
      }
    ]);

    return results; 
  } catch (error) {
    console.error("Error during aggregation:", error);
  }
}

// lookup-test: seats mit bookings aggregieren, klappt (siehe Test aggregation.test.js)
async function enrichSeatsWithBookingInformation() {
    try {
      const results = await seat.aggregate([
        {
          $lookup: {
            from: 'bookings',  // Die Collection, mit der aggregiert wird
            localField: 'PlatzId',  // Das Feld in der 'seat'-Collection, das die Referenz enthält
            foreignField: 'gebuchtePlaetze.platzId',  // Das entsprechende Feld in der 'booking'-Collection
            as: 'bookingDetails'  // Der Name des Arrays, das die verknüpften Dokumente aus 'seat' enthält
          }
        },
        {
          $unwind: '$bookingDetails'  // Um das Array aufzulösen
         
        },
        {
          $project: {
          
            'PlatzId': 1, // die PlatzId vom seat. 
            'bookingDetails.gebuchtePlaetze': 1,
            'eigenschaften': 1
          }
        }
      ]);
  
      return results;
    } catch (error) {
      console.error("Error during aggregation:", error);
    }
  }

router.get("/aggregation", async (req, res) => {
    aggregation = await testAggregation("2023-10-01");
    res.json(aggregation);
    console.log(aggregation);
})

router.get("/status", async (req, res) => {
    aggregation = await enrichSeatsWithBookingInformation();
    res.json(aggregation);
    console.log(aggregation);
})
 

async function bookingInformationByDate(date) {
    try {
        const results = await seat.aggregate([
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'PlatzId',
                    foreignField: 'PlatzId',
                    as: 'bookingDetails'
                }
            },
            {
                $unwind: {
                    path: '$bookingDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'bookingDetails.dateAsDate': { $toDate: '$bookingDetails.datum' }
                }
            },
            {
                $project: {
                    PlatzId: 1,
                    eigenschaften: 1,
                    //BuchungsId: '$bookingDetails.BuchungsId',
                    status: {
                        $cond: [
                            { $and: [
                                { $ne: ['$bookingDetails', null] },
                                { $eq: ['$bookingDetails.dateAsDate', new Date(date)] }
                            ]},
                            'gebucht',
                            'frei'
                        ]
                    }
                }
            }
        ]);

        return results;
    } catch (error) {
        console.error("Error during aggregation:", error);
        return [];
    }
}





router.get("/bookingstatus", async (req, res) => {
    aggregation = await bookingInformationByDate("2023-10-01");
    res.json(aggregation);
    console.log(aggregation);
})

// aggregation testen 
async function testAggregation(targetDate){
    const results = await seat.aggregate([
        {
            $lookup: {
                from: 'bookings',
                localField: 'PlatzId',
                foreignField: 'PlatzId',
                as: 'bookingDetails'
            }
        },
        {
            $unwind: {
                path: '$bookingDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        // $match entfernt, um rohes Join-Ergebnis zu sehen
        {
            $project: {
                _id: 0, // zur besseren Lesbarkeit
                PlatzId: 1,
                'bookingDetails.PlatzId': 1,
                //eigenschaften: 1,
                'bookingDetails.datum': 1,
                status: {
                    $cond: {
                        if: { $eq: ['$bookingDetails', null] },
                        then: 'frei',
                        else: 'gebucht'
                    }
                }
            }
        }
    ]);
    
    console.log("Join results without date match:", results);
    return results;
}

module.exports = router;
// module.exports = { enrichSeatsWithBookingInformation };
