const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/login");
  })
);

router.post(
  "/",
  wrapAsync(async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      const verify = bcrypt.compare(password, user.password);
      if (!verify || !user) {
        req.flash("error", "Invalid Credentials");
        res.redirect("/login");
      }
      req.flash("success", "Welcome Back :)");
      req.flash("aadar", "Ji");
      const redirectUrl = res.locals.returnTo || "/";
      res.redirect(redirectUrl);
    } catch (error) {
      console.log(error);
      req.flash("error", "Invalid Credentials :(");
      res.redirect("/login");
    }
  })
);

module.exports = router;
