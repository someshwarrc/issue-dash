const express = require("express");
const router = express.Router();
const Issue = require("../models/Issues");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

// Issue Dashboard
router.get("/issue-dashboard", ensureAuthenticated, (req, res) => {
  let issues;
  Issue.find({}, (err, docs) => {
    if (!err) {
      console.log(err);
    }
    issues = docs;
  }).then(() => {
    res.render("issue-dashboard", {
      user: req.user,
      issues: issues,
    });
  });
});

module.exports = router;
