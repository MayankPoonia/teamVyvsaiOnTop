const cron = require("node-cron");
const Tender = require("../models/tender");

// Function to parse date string into JavaScript Date object
function parseClosingDate(dateString) {
  if (!dateString) {
    return null;
  }

  const [day, month, year, time, period] = dateString.split(/[\s:-]+/);
  const months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  if (isNaN(minutes)) minutes = 0;

  const parsedDate = new Date(year, months[month], Number(day), hours, minutes);
  if (isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

// Schedule cron job to run every 6 hours
cron.schedule("* */6 * * *", async () => {
  try {
    const currentDate = new Date();
    const tenders = await Tender.find({ expired: false }); // Only check active tenders

    for (const tender of tenders) {
      const tenderClosingDate = parseClosingDate(tender.closing_date);

      if (!tenderClosingDate) {
        console.error(
          `Could not parse closing date for tender ID: ${tender._id}`
        );
        continue;
      }

      if (tenderClosingDate < currentDate) {
        // Mark the tender as expired instead of deleting it
        await Tender.updateOne({ _id: tender._id }, { expired: true });
        console.log(`Marked expired tender with ID: ${tender._id}`);
      }
    }
  } catch (error) {
    console.error("Error marking expired tenders:", error);
  }
});
