const jwt = require("jsonwebtoken");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.jwtAuthenticate = (req, res, next) => {
  const token = req.cookies.UUID;
  if (!token) {
    // console.log("No token found, redirecting to login");
    return res.redirect("/login");
  }
  jwt.verify(token, process.env.JWT_AUTH_SECRET, (err, user) => {
    if (err) {
      // console.log("Token verification failed:", err.message);
      return res.redirect("/login");
    }
    // console.log("Token verified, user:", user);
    if (!user.pln || !user.pln.length) {
      // console.log("User plan not found, redirecting to subscription");
      req.flash("alert", "You need an active plan for using those services");
      return res.redirect("/subscriptions");
    }
    return next();
  });
};

module.exports.planCheck = (req, res, next) => {
  const token = req.cookies.UUID;
  if (!token) {
    // console.log("No token found, redirecting to login");
    return res.redirect("/login");
  }
  jwt.verify(token, process.env.JWT_AUTH_SECRET, (err, user) => {
    if (err) {
      // console.log("Token verification failed:", err.message);
      return res.redirect("/login");
    }
    // console.log("Token verified, user:", user);
    if (!user.pln || !user.pln.length) {
      // console.log("User plan not found, redirecting to /subscriptions");
      return res.redirect("/subscriptions");
    } else if (user.pln === "pro-plan" || user.plan === "enterprise-plan") {
      return next();
    }
  });
};
