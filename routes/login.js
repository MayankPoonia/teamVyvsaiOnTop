const express = require("express");
const router = express.Router();
const { storeReturnTo, isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/login");
  }),
);

router.post(
  "/",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Welcome Back ");
    req.flash("aadar", "Ji");
    const redirectUrl = res.locals.returnTo || "/";
    res.redirect(redirectUrl);
  }),
);

module.exports = router;
