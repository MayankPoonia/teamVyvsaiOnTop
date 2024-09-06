// utils/sendOTPEmail.js
const nodemailer = require("nodemailer");

async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.MY_EMAIL,
    to: email,
    subject: "Password Reset OTP for vyvsai",
    text: `Your OTP for password reset is ${otp}.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOTPEmail;
