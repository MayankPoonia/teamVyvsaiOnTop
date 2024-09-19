const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const tenderRoutes = require("./routes/tender");
const resetRoutes = require("./routes/passReset");
const paymentRoutes = require("./routes/payment");
const mainRoutes = require("./routes/main");
const uploadRoutes = require("./routes/upload");

const app = express();

const connectDB = require("./config/db");
connectDB();

const store = MongoStore.create({
  mongoUrl: process.env.mongoURL,
  touchAfter: 20 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});
store.on("error", function (e) {
  console.log("Session Store Error");
});

require("./utils/deleteExpiredTenders");

//session Config
const sessionConfig = {
  store,
  name: "session",
  secret: "ThisIsTheSecretIWasLookingForHaHa",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
};

const scriptSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
  "https://stackpath.bootstrapcdn.com/bootstrap/5.3.0/js/bootstrap.bundle.min.js",
];

const styleSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://fonts.googleapis.com",
];

const fontSrcUrls = [
  "https://fonts.gstatic.com",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css",
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'"],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/douqbebwk/",
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(session(sessionConfig));
app.use(cookieParser());
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.cookies.UUID || null;
  res.locals.paymentSuccess = req.flash("paymentSuccess");
  next();
});

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/tenders", tenderRoutes);
app.use("/password-reset", resetRoutes);
app.use("/subscriptions", paymentRoutes);

// just doing time pass
// app.use("/upload-documents", uploadRoutes);
app.use("/", mainRoutes);

app.get("*", (req, res) => {
  res.render("pages/notFound");
});

app.use((err, req, res, next) => {
  // console.log(err);
  res.send(err);
});

app.listen(8000, () => {
  console.log("Port 8000 is now working");
});
