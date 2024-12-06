const cron = require("node-cron");

const { deleteOldBookings } = require('../helpers_delete_old_bookings');

// Schedule to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running Cron Job: Deleting old bookings");
  try {
    await deleteOldBookings();
  } catch (error) {
    console.error("Error during Cron Job execution:", error);
  }
});
