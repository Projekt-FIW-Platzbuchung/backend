const express = require("express");
const router = express.Router();
const seat = require("./models/seat");
const bookings = require("./models/bookings");
const user = require("./models/user");

// Funktion die seat mit bookings und bookingDetails mit user aggregiert und "frei" oder "gebucht" als status hinzufügt
async function bookingInformationByDate(date) {
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
        $lookup: {
          from: "user",
          let: { user_id: { $arrayElemAt: ["$bookingDetails.userId", 0] } },
          pipeline: [{ $match: { $expr: { $eq: ["$userId", "$$user_id"] } } }],
          as: "userDetails",
        },
      },
      {
        $addFields: {
          bookingDetails: {
            $cond: [
              { $eq: [{ $size: "$bookingDetails" }, 0] },
              null,
              {
                $mergeObjects: [
                  { $arrayElemAt: ["$bookingDetails", 0] },
                  {
                    username: {
                      $cond: [
                        { $gt: [{ $size: "$userDetails" }, 0] },
                        { $arrayElemAt: ["$userDetails.name", 0] },
                        null,
                      ],
                    },
                  },
                ],
              },
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
          "bookingDetails.username": 1,
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
