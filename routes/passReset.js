// routes/passwordReset.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const sendOTPEmail = require("../utils/sendOTPEmail");

// Function to generate a 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Request OTP Route
router.get("/request-otp", (req, res) => {
  res.render("password-reset/request-otp", { errorMessages: [] });
});

router.post(
  "/request-otp",
  wrapAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.render("password-reset/request-otp", {
        errorMessages: [{ msg: "No user found with that email." }],
      });
    }

    const otp = generateOTP(); // Generate OTP
    req.session.otp = otp; // Store OTP in session
    req.session.currentUser = user._id; // Store userId in session

    await sendOTPEmail(user.email, otp); // Send OTP via email

    res.redirect("/password-reset/verify-otp");
  })
);

// Verify OTP Route
router.get("/verify-otp", (req, res) => {
  res.render("password-reset/verify-otp", { errorMessages: [] });
});

router.post(
  "/verify-otp",
  wrapAsync(async (req, res) => {
    const { otp } = req.body;

    if (req.session.otp === otp) {
      res.redirect("/password-reset/new-password");
    } else {
      res.render("password-reset/verify-otp", {
        errorMessages: [{ msg: "Invalid OTP. Please try again." }],
      });
    }
  })
);

// New Password Route
router.get("/new-password", (req, res) => {
  if (!req.session.currentUser.id) {
    return res.redirect("/password-reset/request-otp");
  }
  res.render("password-reset/new-password", { errorMessages: [] });
});

router.post(
  "/new-password",
  wrapAsync(async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.render("password-reset/new-password", {
        errorMessages: [{ msg: "Passwords do not match." }],
      });
    }

    const user = await User.findById(req.session.currentUser.id);
    if (!user) {
      return res.redirect("/password-reset/request-otp");
    }

    await user.setPassword(newPassword);
    await user.save();

    // Clear OTP and userId from session
    req.session.otp = null;
    req.session.userId = null;

    req.flash(
      "success",
      "Your password has been reset successfully. You can now log in."
    );
    res.redirect("/login");
  })
);

module.exports = router;
