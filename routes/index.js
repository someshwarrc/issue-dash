const express = require("express");
const router = express.Router();
const Issue = require("../models/Issues");
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: "completed-report.csv",
  header: [
    { id: "ticketNumber", title: "Ticket #" },
    { id: "title", title: "Title" },
    { id: "description", title: "Description" },
    { id: "reportedBy", title: "Reported By" },
    { id: "reportedOn", title: "Reported On" },
    { id: "completedBy", title: "Completed By" },
    { id: "completedOn", title: "Completed On" },
  ],
});

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
    Issue.find(
      {
        /* fetch all issues for admin/executive */
      },
      (err, docs) => {
        if (err) {
          console.log("[ERR]Error with finding issues", err);
        }
        issues = docs;
      }
    ).then(() => {
      res.render("issue-dashboard", {
        user: req.user, // send current logged in user details
        issues: issues,
      });
    });
  }
});

router.get("/generate-report", (req, res) => {
  req.flash("success_msg", "Your report was generated.");
  // res.redirect("/issue-dashboard");

  // generate report
  let data = [];
  Issue.find({ completed: true }, (err, docs) => {
    docs.forEach((doc) => {
      let {
        title,
        description,
        assignedTo,
        reportedOn,
        reportedBy,
        completedOn,
        ticketNumber,
      } = doc;
      data.push({
        ticketNumber: ticketNumber,
        title: title,
        description: description,
        reportedBy: reportedBy,
        reportedOn: reportedOn,
        completedBy: assignedTo,
        completedOn: completedOn,
      });
    });
    // console.log(data);
    csvWriter
      .writeRecords(data)
      .then(() => console.log("The CSV file was written successfully"));
  });

  let filePath = "completed-report.csv";
  res.download(filePath);
});

module.exports = router;
