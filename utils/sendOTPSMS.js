// utils/sendOTPSMS.js
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOTPSMS(mobileNo, otp) {
  await client.messages.create({
    body: `Your OTP for password reset is ${otp}.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: mobileNo,
  });
}
module.exports = sendOTPSMS;
