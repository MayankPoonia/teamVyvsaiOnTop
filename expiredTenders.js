const cron = require("node-cron");
const Tender = require("./models/tender");

// MongoDB connection setup

// Function to parse date string into JavaScript Date object
function parseClosingDate(dateString) {
  if (!dateString) {
    console.error("Invalid date string:", dateString);
    return null;
  }

  // Split date string into components
  const [day, month, year, time, period] = dateString.split(/[\s:-]+/);

  // console.log("Day:", day);
  // console.log("Month:", month);
  // console.log("Year:", year);
  // console.log("Time:", time);
  // console.log("Period:", period);

  // Map month names to month numbers
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

  // Extract hour and minute from time
  let [hours, minutes] = time.split(":").map(Number);

  // Adjust hour based on AM/PM
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  // Check if minutes were not provided
  if (isNaN(minutes)) minutes = 0;

  // console.log("Parsed Hours:", hours);
  // console.log("Parsed Minutes:", minutes);

  // Create Date object
  const parsedDate = new Date(year, months[month], Number(day), hours, minutes);

  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    console.error("Error parsing date:", dateString);
    return null;
  }

  return parsedDate;
}

// Schedule cron job to run every 5 minutes
cron.schedule("* */6 * * *", async () => {
  // console.log("Cron job is running at:", new Date().toLocaleString());
  try {
    const currentDate = new Date(); // Current date and time
    const tenders = await Tender.find({});

    for (const tender of tenders) {
      const tenderClosingDate = parseClosingDate(tender.closing_date);

      if (!tenderClosingDate) {
        // console.error(
        //   `Could not parse closing date for tender ID: ${tender._id}`
        // );
        continue;
      }

      if (tenderClosingDate < currentDate) {
        await Tender.deleteOne({ _id: tender._id });
        // console.log(`Deleted expired tender with ID: ${tender._id}`);
      }
    }
  } catch (error) {
    console.error("Error removing expired tenders:", error);
  }
});
