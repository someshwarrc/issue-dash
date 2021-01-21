const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../models/User");
const { forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", (req, res) => {
  const {
    name,
    email,
    password,
    password2,
    role,
    employeeID,
    department,
    location,
  } = req.body;
  let errors = [];

  if (
    !name ||
    !email ||
    !password ||
    !password2 ||
    role === "Choose your role" ||
    department === "Choose your department" ||
    !employeeID ||
    location === "Choose your location"
  ) {
    errors.push({ msg: "Please enter all fields correctly" });
  }

  // password confirm validation
  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // password strength validation
  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  // if any errors send details for filling form partially
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      employeeID,
      department,
      role,
      location,
    });
  } else {
    User.findOne({ employeeID: employeeID }).then((user) => {
      if (user) {
        errors.push({ msg: "Employee ID already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
          employeeID,
          role,
          location,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          role,
          employeeID,
          location,
          department,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/issue-dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
