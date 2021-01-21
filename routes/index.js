const express = require("express");
const router = express.Router();
const Issue = require("../models/Issues");
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

// Issue Dashboard
router.get("/issue-dashboard", ensureAuthenticated, (req, res) => {
  let issues;
  /* if a staff has logged in, only his/her reported problems should be visible */
  if (req.user.role === "staff") {
    User.findOne({ employeeID: req.user.employeeID })
      .populate({ path: "issuesReported", model: "Issue" })
      .exec((err, user) => {
        if (err) {
          console.log("[ERR]Error with finding user in DB", err);
        }
        // console.log(user);
        issues = user.issuesReported;
        res.render("issue-dashboard", {
          user: user,
          issues: issues,
        });
      });
  } else {
    /* if an admin/executive has logged in he/she must be able to see all issues on the system */
    Issue.find({}, (err, docs) => {
      if (err) {
        console.log("[ERR]Error with finding issues", err);
      }
      issues = docs;
    }).then(() => {
      res.render("issue-dashboard", {
        user: req.user,
        issues: issues,
      });
    });
  }
});

module.exports = router;
