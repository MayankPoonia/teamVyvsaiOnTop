const express = require("express");
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const nodemailer = require("nodemailer");
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
  const { name, email, message } = req.body;
  // mail controller bna bhai
  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const sendEmail = (mailOptions) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        req.flash("error", "Something went wrong , try again later :) ");
        res.redirect("/contact");
      } else {
        req.flash(
          "success",
          "Thanks for Your Response , Team VYVSAI will contact You soon :)"
        );
        res.redirect("/contact");
      }
    });
  };
  const mailOptions = {
    from: process.env.MY_EMAIL,
    to: "m84719666@gmail.com",
    subject: "New Contact Form Submission",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Form Submission Details</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
            }
            .content h2 {
                font-size: 20px;
                color: #333333;
                margin-bottom: 20px;
            }
            .content p {
                margin: 10px 0;
                font-size: 16px;
                color: #555555;
            }
            .content p span {
                font-weight: bold;
                color: #333333;
            }
            .footer {
                background-color: #f4f4f4;
                padding: 10px;
                text-align: center;
                font-size: 12px;
                color: #888888;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
                <h2>Form Details:</h2>
                <p><span>Name:</span> ${name}</p>
                <p><span>Email:</span> ${email}</p>
                <p><span>Message:</span></p>
                <p>${message}</p>
            </div>
            <div class="footer">
                <p>This email was automatically generated from your website's contact form.</p>
            </div>
        </div>
    </body>
    </html>
    `,
  };
  sendEmail(mailOptions);
});

router.get(
  "/logout",
  wrapAsync(async (req, res) => {
    // Destroy session data and clear session
    req.session.destroy((err) => {
      if (err) {
        // console.log("Error destroying session:", err);
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
