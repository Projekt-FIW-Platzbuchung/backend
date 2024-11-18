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
        $addFields: {
          bookingDetails: {
            $filter: {
              input: "$bookingDetails",
              as: "booking",
              cond: {
                $eq: [{ $toDate: "$$booking.date" }, new Date(date)],
              },
            },
          },
        },
      },
      {
        $addFields: {
          bookingDetails: {
            $cond: [
              { $eq: [{ $size: "$bookingDetails" }, 0] },
              null,
              { $arrayElemAt: ["$bookingDetails", 0] },
            ],
          },
        },
      },
      {
        $project: {
          seatId: 1,
          properties: 1,
          "bookingDetails.userId": 1,
          "bookingDetails.date": 1,
          status: {
            $cond: [{ $ne: ["$bookingDetails", null] }, "gebucht", "frei"],
          },
          _id: 0,
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
  bookingInformationByDate,
};
