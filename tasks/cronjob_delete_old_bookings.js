const cron = require("node-cron");
const { deleteOldBookings } = require("../helpers_delete_old_bookings");

/**

    Schedules old bookings deletion to run every hour at every 15 minutes, 0 seconds

    @‌param {numbers} schedule - Seconds (optional): 0-59, Minutes: 0-59, Hours: 0-23, Day of Month: 1-31, Months: 1-12 (or names) , Day of Week: 0-7 (or names, 0 or 7 are sunday)

    @‌return {task} - the function

*/

cron.schedule("5 0 * * *", async () => {
  console.log("Running Cron Job: Deleting old bookings");
  try {
    await deleteOldBookings();
  } catch (error) {
    console.error("Error during Cron Job execution:", error);
  }
});
