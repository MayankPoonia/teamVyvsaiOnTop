const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const { userSchema } = require("../schemas");
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
    const {
      username,
      mobileNo,
      email,
      // budgetPreferences,
      preferences,
      password,
    } = req.body;
    const user = new User({
      username,
      password,
      // budgetPreferences,
      preferences,
      email,
      mobileNo,
    });

    try {
      await user.save();
      req.login(user, async (err) => {
        if (err) return next(err);
        req.flash("success", "A huge welcome from Team VYVSAI ~ ");
        req.flash("aadar", "ji");
        res.redirect("/");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

module.exports = router;
