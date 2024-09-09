const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, storeReturnTo } = require("../middleware");
router.get(
  "/",
  wrapAsync(async (req, res) => {
    res.render("pages/subscriptions");
  })
);

router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    req.flash("paymentSuccess", "Succesfully Purchased Subscription");
    res.redirect("/subscriptions");
  })
);

module.exports = router;
