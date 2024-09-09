const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const loginRoutes = require("./routes/login");
const registerRoutes = require("./routes/register");
const tenderRoutes = require("./routes/tender");
const resetRoutes = require("./routes/passReset");
const paymentRoutes = require("./routes/payment");
const mainRoutes = require("./routes/main");

const app = express();
// var http = require("http").Server(app);

const store = MongoStore.create({
  mongoUrl: process.env.mongoURL,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});
store.on("error", function (e) {
  console.log("Session Store Error");
});
const connectDB = require("./config/db");
connectDB();

require("./expiredTenders");

//models
const User = require("./models/user");

//session Config
const sessionConfig = {
  store,
  name: "session",
  secret: "ThisIsTheSecretIWasLookingForHaHa",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 20,
    maxAge: 1000 * 60 * 20,
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
const fontSrcUrls = ["https://fonts.gstatic.com"];
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
app.use(flash());

//initialize passport
app.use(passport.initialize());
app.use(passport.session());
// const jwtStrategy = require("./config/passport");
// app.use(jwtStrategy);
//configure passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.alert = req.flash("alert");
  res.locals.error = req.flash("error");
  res.locals.aadar = req.flash("aadar");
  res.locals.paymentSuccess = req.flash("paymentSuccess");
  next();
});

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/tenders", tenderRoutes);
app.use("/password-reset", resetRoutes);
app.use("/subscriptions", paymentRoutes);
app.use("/", mainRoutes);
app.get("*", (req, res) => {
  res.render("pages/notFound");
});
app.use((err, req, res, next) => {
  res.send(err);
});

app.listen(8000, () => {
  console.log("Port 8000 is now working");
});
