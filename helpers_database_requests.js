const seat = require("./models/seat");

/**
 * Aggregates seat with booking collection as bookingDetails and bookingDetails with user-collection, adds status "frei" or "gebucht" to each seat for a date
 * @param {Date} date - date to check booking status
 * @return {Array} - results of aggregation: seats with properties, status and bookingDetails
 */
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
          coordinates: 1,
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

    console.log(typeof properties);

    return results;
  } catch (error) {
    console.error("Error during aggregation:", error);
    return [];
  }
}

module.exports = {
  bookingInformationByDate,
};
