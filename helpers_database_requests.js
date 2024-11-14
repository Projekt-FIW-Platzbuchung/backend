const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");


// Funktion die seat mit bookings aggregiert/joined und "frei" oder "gebucht" als status hinzufügt
async function bookingInformationByDate(date) {
  console.log(typeof date);

  try {
    const results = await seat.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "seatId",
          foreignField: "seatId",
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
          "bookingDetails.dateAsDate": { $toDate: "$bookingDetails.date" },
        },
      },
      {
        $project: {
          PlatzId: 1,
          eigenschaften: 1,
          'bookingDetails.seatId': 1,
          'bookingDetails.date': 1,
          'bookingDetails.userId': 1,
         
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

    return results;
  } catch (error) {
    console.error("Error during aggregation:", error);
    return [];
  }
}



module.exports = {
  bookingInformationByDate
};
