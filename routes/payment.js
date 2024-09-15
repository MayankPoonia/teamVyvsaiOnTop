const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { jwtAuthenticate } = require("../middleware");
router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/subscriptions");
  })
);

router.post(
  "/",
  jwtAuthenticate,
  wrapAsync(async (req, res) => {
    res.redirect("/subscriptions");
  })
);

module.exports = router;
