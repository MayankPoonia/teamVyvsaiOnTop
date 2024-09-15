const jwt = require("jsonwebtoken");

module.exports.generateToken = (user) => {
  if (!user.plan || !user.plan.length) {
    const payload = { id: user._id };
    return jwt.sign(payload, process.env.JWT_AUTH_SECRET, {
      expiresIn: "20m",
    });
  } else {
    const payload = { id: user._id, pln: user.plan };
    return jwt.sign(payload, process.env.JWT_AUTH_SECRET, {
      expiresIn: "20m",
    });
  }
};
