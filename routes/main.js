const express = require("express");
const router = express.Router();
const { isLoggedIn, storeReturnTo } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const User = require("../models/user");
const crypto = require("crypto");
const sendOTPEmail = require("../utils/sendOTPEmail");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/home");
  })
);

router.get(
  "/documents",
  wrapAsync(async (req, res) => {
    res.render("pages/documents");
  })
);

router.post(
  "/documents",
  upload.array("documents"),
  wrapAsync(async (req, res) => {
    console.log(req.files);
    res.send("Uploaded");
  })
);



//privacy routes
router.get("/privacy-policy", (req, res) => {
  res.render("pages/privacy-policy");
});

router.get("/contact", (req, res) => {
  res.render("pages/contact");
});

router.get(
  "/logout",
  wrapAsync(async (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.flash("success", "Succesfully Logged You Out");
      res.redirect("/");
    });
  })
);
module.exports = router;
