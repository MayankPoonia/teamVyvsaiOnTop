const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoURL);
    console.log("Database connected successfully");
  } catch (e) {
    console.error("Error occurred while connecting to MongoDB:", e.message);
    process.exit(1);
  }
};
module.exports = connectDB;
