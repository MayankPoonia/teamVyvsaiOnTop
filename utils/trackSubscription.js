const cron = require("node-cron");
const User = require("../models/user");

cron.schedule("* * * *", async () => {
  try {
    const users = await User.find();
    const todayDate = new Date().toString();
  } catch (error) {
    console.log(error);
  }
});
