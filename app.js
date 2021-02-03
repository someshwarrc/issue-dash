const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const favicon = require("serve-favicon");
const path = require("path");
const bcrypt = require("bcryptjs");
const autoIncrement = require("mongoose-auto-increment");
const { ensureAuthenticated } = require("./config/auth.js");
const User = require("./models/User");
const adminDetails = require("./config/admin-details");
//dotenv config
require("dotenv").config();

// Passport Config
require("./config/passport")(passport);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI.toString();

var connection = mongoose.createConnection(MONGO_URI);

autoIncrement.initialize(connection);

// express configurations
app.use(favicon(path.join(__dirname, "assets", "favicon.ico")));

// default directory for static files
app.use(express.static(path.join(__dirname, "assets")));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Connect to MongoDB and save admin details
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");
    let text_password = adminDetails.password;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(text_password, salt, (err, encrypted) => {
        if (err) throw err;
        adminDetails.password = encrypted;
        User.findOne({ employeeID: adminDetails.employeeID }, (err, res) => {
          if (err) {
            return console.log(err.message);
          }
          if (res) {
            // admin already registered
            console.log("Admin details already loaded.");
          } else {
            User.create(adminDetails, (err, admin) => {
              if (err) console.log(err.message);
              console.log("Admin:", admin);
            });
          }
        });
      });
    });
  })
  .catch((err) => console.log(err));

// Routes
app.use("/", require("./routes/index.js"));
app.use("/users", require("./routes/users.js"));
app.use("/issues", ensureAuthenticated, require("./routes/issues.js")); // entire endpoint needs authorization

app.listen(PORT, console.log(`Server running on  ${PORT}`));
