const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const { userSchema } = require("../schemas");
const { generateToken } = require("../utils/tokenGenerate");

const validateUser = async (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((e) => e.message);
    return res.render("pages/register", {
      formData: req.body,
      errorMessages,
    });
  }
  next();
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/register", { formData: {}, errorMessages: [] });
  })
);

router.post(
  "/",
  validateUser,
  wrapAsync(async (req, res, next) => {
    console.log(req.body);
    const { username, mobileNo, email, preferences, password } = req.body;
    const user = new User({
      username,
      password,
      preferences,
      email,
      mobileNo,
    });

    try {
      const registeredUser = await user.save(); // Try saving the user
      const token = generateToken(registeredUser); // Generate JWT token

      // Set JWT in cookie
      res.cookie("UUID", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      });
      req.session.currentUser = registeredUser;

      const redirectURL = res.locals.returnTo || "/";
      return res.redirect(redirectURL);
    } catch (e) {
      console.error("Error during user registration:", e); // Log the error
      return res.redirect("/register");
    }
  })
);

module.exports = router;
