require("dotenv").config();
const flash = require("connect-flash");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const hbs = require("hbs");
const connectDB = require("./config/db");
const helpers = require("handlebars-helpers")();

// Database connection
connectDB();

// Passport config
require("./config/passport")(passport);

const indexRouter = require("./routes/index");
const app = express();

// View engine setup with HBS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Register HBS helpers
hbs.registerHelper("formatDate", (date) => {
  return date.toLocaleString();
});

hbs.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper("truncate", function (str, len) {
  if (str.length > len) {
    return str.substring(0, len) + "...";
  }
  return str;
});

hbs.registerHelper(helpers);

hbs.registerHelper("eq", function (a, b) {
  return a == b;
});

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Sessions with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGO_URI || "mongodb://localhost:27017/stackunderflow",
      ttl: 14 * 24 * 60 * 60, // = 14 days
    }),
  })
);

app.use(flash());

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Make user available to all templates
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use("/", indexRouter);
const authRouter = require("./routes/authRoutes");
app.use("/auth", authRouter);
const userRouter = require("./routes/userRoutes");
app.use("/users", userRouter);
const questionRouter = require("./routes/questionRoutes");
app.use("/questions", questionRouter);
// const answerRouter = require("./routes/answerRoutes");
// app.use("/", answerRouter);

// Error handlers
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
