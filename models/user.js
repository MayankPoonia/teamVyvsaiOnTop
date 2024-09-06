const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
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
  budgetPreferences: {
    type: [String],
    required: true,
    enum: ["below-20-lakhs", "20-lakhs-to-1-crore", "above-1-crore"],
    lowercase: true,
  },
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;
