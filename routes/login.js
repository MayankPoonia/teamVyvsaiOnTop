const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { generateToken } = require("../utils/tokenGenerate");
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/login");
  })
);

router.post(
  "/",
  wrapAsync(async (req, res) => {
    const { mobileNo, password } = req.body;
    // console.log("Login attempt:", { mobileNo });
    const user = await User.findOne({ mobileNo });

    if (!user) {
      console.log("User not found");
      return res.redirect("/login");
    }

    const verify = await bcrypt.compare(password, user.password);
    if (!verify) {
      // console.log("Password mismatch");
      return res.redirect("/login");
    } else {
      const token = generateToken(user);
      // console.log("Generated token:", token);
      res.cookie("UUID", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });

      // Store user info in session
      req.session.currentUser = {
        id: user._id,
        mobileNo: user.mobileNo,
        preferences: user.preferences,
        plan: user.plan,
      };
    }

    res.redirect("/");
  })
);

module.exports = router;
