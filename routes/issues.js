const router = require("express").Router();
const { route } = require(".");
const Issue = require("../models/Issues");
const User = require("../models/User");

router.get("/new", (req, res) => {
  res.render("new-issue");
});

router.post("/new", (req, res) => {
  let { title, description, location } = req.body;

  let reportedBy = `[${req.user.employeeID}]${req.user.name}`;
  let reportedOn = Date.now();
  let newIssue = new Issue({
    title,
    description,
    location,
    reportedBy,
    reportedOn,
  });

  Issue.create(newIssue, (err, issue) => {
    if (err) {
      console.log(err);
    }

    // console.log(issue);

    User.updateOne(
      { employeeID: req.user.employeeID },
      { $push: { issuesReported: issue._id } },
      (err) => {
        if (err) {
          console.log(err);
          console.log("[ERR]issue couldn't be updated to DB");
        }
        console.log("[OK]updated issue successfully");
      }
    );
  });
  req.flash(
    "success_msg",
    "Your issue has been noted. An executive will get back to you asap."
  );

  res.redirect("/issue-dashboard");
});

router.get("/:id", (req, res) => {
  // res.send(`Issue ${req.params.id}, User ${req.user}`);
  req.flash("success_msg", "The problem has been assigned to you");
  Issue.updateOne(
    // updating issue as assigned and the name of executive to whom it's assigned
    { _id: req.params.id },
    { $set: { assigned: true, assignedTo: req.user.name } },
    (err) => {
      if (err) {
        console.log("[ERR]The issue couldn't be assigned");
      }
      console.log(`[OK]Issue assigned to ${req.user.name}`);
      User.updateOne(
        //updating the issue id in issueshandled by the executive for
        // easy access in his/her profile
        { _id: req.user._id },
        { $push: { issuesHandled: req.params.id } },
        (err) => {
          if (err) {
            console.log(
              "[ERR]Error updating issue in executive/admin collection"
            );
          }
          console.log(`[OK]Updated issue handled by ${req.user.name}`);
        }
      );
    }
  );
  res.redirect("/issue-dashboard");
});

module.exports = router;
