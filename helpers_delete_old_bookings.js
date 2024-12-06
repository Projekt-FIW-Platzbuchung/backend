const express = require("express");
const router = express.Router();
const bookings = require("./models/bookings");

router.get("/bookings", async (req, res) => {
  try {
    const allBookings = await bookings.find();
    res.json(allBookings);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * Function to delete bookings older than today's date
 */
async function deleteOldBookings() {
  try {
    const today = new Date().toISOString().split("T")[0]; // reformat date

    const result = await bookings.deleteMany({
      date: { $lt: today }, // Assuming dates are stored as strings in "YYYY-MM-DD" format
    });

    console.log(`Deleted ${result.deletedCount} old bookings.`);
  } catch (error) {
    console.error("Error in deleting old bookings:", error);
  }
}

module.exports = { deleteOldBookings, router };
