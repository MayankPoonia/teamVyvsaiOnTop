const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

router.get(
  "/" || "/home",
  wrapAsync(async (req, res) => {
    const cookie = req.cookies.name;
    res.render("pages/home", { cookie });
  })
);

//privacy routes
router.get("/privacy-policy", (req, res) => {
  res.render("pages/privacy-policy");
});

router.get("/contact", (req, res) => {
  res.render("pages/contact");
});

router.post("/get-in-touch", (req, res) => {
  res.send("Okay Vai");
});

router.get(
  "/logout",
  wrapAsync(async (req, res) => {
    // Destroy session data and clear session
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session:", err);
        return res.redirect("/");
      }

      // Clear the token cookie
      res.clearCookie("UUID");

      // Redirect after session and cookie are cleared
      res.redirect("/");
    });
  })
);

module.exports = router;
