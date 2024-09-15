const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const formatDate = (date) => {
  if (!date || !(date instanceof Date)) {
    return "Invalid Date";
  }
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  mobileNo: {
    type: Number,
    required: true,
    match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    minlength: 10,
    maxlength: 10,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
  },
  preferences: {
    type: String,
    required: true,
    enum: ["goverment-tenders"],
    lowercase: true,
  },
  resetPasswordOTP: String,
  resetPasswordExpires: Date,
  otpVerified: {
    type: Boolean,
    default: false,
  },
  plan: {
    type: String,
    enum: ["basic-plan", "pro-plan", "enterprise-plan"],
    lowercase: true,
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now,
    get: formatDate, // Human-readable format
  },
  subscriptionEndDate: {
    type: Date,
    get: formatDate, // Human-readable format
  },
});

// Automatically calculate the end date only when a subscription plan is set
userSchema.pre("save", function (next) {
  if (this.plan && !this.subscriptionEndDate) {
    const oneYearLater = new Date(this.subscriptionStartDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1); // Add 1 year
    this.subscriptionEndDate = oneYearLater;
  }
  next();
});

// Hash the password before saving it to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    return next(err);
  }
});

// Ensure the getter function runs for human-readable dates
userSchema.set("toJSON", { getters: true });
userSchema.set("toObject", { getters: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
