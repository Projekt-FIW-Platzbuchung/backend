const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");

// $lookup - Test, soll bookings-mit seats aggregieren als aggregation ~ Vorlage für aggregation die funtioniert
async function enrichBookingsWithSeatInformation() {
  try {
    const results = await bookings.aggregate([
      {
        $lookup: {
          from: "seat", // Die Collection, mit der aggregiert wird
          localField: "PlatzId", // Das Feld in der 'bookings'-Collection, das die Referenz enthält
          foreignField: "PlatzId", // Das entsprechende Feld in der 'seat'-Collection
          as: "seatDetails", // Der Name des Arrays, das die verknüpften Dokumente aus 'seat' enthält
        },
      },
      {
        $unwind: "$seatDetails", // Um das Array aufzulösen
      },
      {
        $project: {
          buchungsId: 1,
          PlatzId: 1,
          datum: 1,
          UserId: 1, // achtung. es gibt keinen fehler wenn hier etwas falsch geschrieben ist, das taucht nur nicht auf!
          "seatDetails.eigenschaften": 1, // Nur die 'eigenschaften' des Sitzes
        },
      },
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
          from: "bookings", // Die Collection, mit der aggregiert wird
          localField: "PlatzId", // Das Feld in der 'seat'-Collection, das die Referenz enthält
          foreignField: "PlatzId", // Das entsprechende Feld in der 'booking'-Collection
          as: "bookingDetails", // Der Name des Arrays, das die verknüpften Dokumente aus 'seat' enthält
        },
      },
      {
        $unwind: "$bookingDetails", // Um das Array aufzulösen
      },
      {
        $project: {
          PlatzId: 1, // die PlatzId vom seat.
          "bookingDetails.PlatzId": 1, // die PlatzID der bookings zum vergleich
          eigenschaften: 1,
        },
      },
    ]);

    return results;
  } catch (error) {
    console.error("Error during aggregation:", error);
  }
}

// Funktion die seat mit bookings aggregiert/joined und "frei" oder "gebucht" als status hinzufügt
async function bookingInformationByDate(date) {
  console.log(typeof date);

  try {
    const results = await seat.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "PlatzId",
          foreignField: "PlatzId",
          as: "bookingDetails",
        },
      },
      {
        $unwind: {
          path: "$bookingDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "bookingDetails.dateAsDate": { $toDate: "$bookingDetails.datum" },
        },
      },
      {
        $project: {
          PlatzId: 1,
          eigenschaften: 1,
          'bookingDetails.PlatzId': 1,
          'bookingDetails.datum': 1,
          //BuchungsId: '$bookingDetails.BuchungsId',
          status: {
            $cond: [
              {
                $and: [
                  { $ne: ["$bookingDetails", null] },
                  { $eq: ["$bookingDetails.dateAsDate", new Date(date)] },
                ],
              },
              "gebucht",
              "frei",
            ],
          },
        },
      },
    ]);
    console.log(JSON.stringify(results, null, 2));

    // so würde man auf die results zugreifen: 
    /* results.forEach((result) => {
        console.log("PlatzId aus booking:", result.bookingDetails.PlatzId);
      }); */
    return results;
  } catch (error) {
    console.error("Error during aggregation:", error);
    return [];
  }
}

// aggregation testen
async function testAggregation(targetDate) {
  const results = await seat.aggregate([
    {
      $lookup: {
        from: "bookings",
        localField: "PlatzId",
        foreignField: "PlatzId",
        as: "bookingDetails",
      },
    },
    {
      $unwind: {
        path: "$bookingDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    // $match entfernt, um rohes Join-Ergebnis zu sehen
    {
      $project: {
        _id: 0, // zur besseren Lesbarkeit
        PlatzId: 1,
        "bookingDetails.PlatzId": 1,
        //eigenschaften: 1,
        "bookingDetails.datum": 1,
        "booking.Details.UserId": 1,
        status: {
          $cond: {
            if: { $eq: ["$bookingDetails", null] },
            then: "frei",
            else: "gebucht",
          },
        },
      },
    },
  ]);

  console.log("Join results without date match:", results);
  return results;
}

module.exports = {
  bookingInformationByDate,
  enrichSeatsWithBookingInformation,
};
