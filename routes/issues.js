const router = require("express").Router();
const Issue = require("../models/Issues");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(staff_mail, staff_problem_statement, assignedTo) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "testmailsrc99@gmail.com", // mail for login to google smtp
      pass: "s@vage99", // password for login to google smtp
    },
  });

  let message = {
    from: '"Support" <testmailsrc99@gmail.com>', // sender address
    to: staff_mail, // list of receivers
    subject: `Problem Assistance`, // Subject line
    text: `${staff_problem_statement} Your problem has been assigned to ${assignedTo}`, // plain text body
    html: `<b style="white-space:pre-line">${staff_problem_statement}</b><em>Your problem has been assigned to <b>${assignedTo}</b></em>`, // html body
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(message);

  console.log("[OK] Message sent: %s", info.messageId);
}

router.get("/new", (req, res) => {
  res.render("new-issue");
});

router.post("/new", (req, res) => {
  let { title, description, location } = req.body;

  let reportedBy = `[${req.user.employeeID}]${req.user.name}`;
  let reportedOn = Date.now();
  let reportedByMail = req.user.email;
  let newIssue = new Issue({
    title,
    description,
    location,
    reportedBy,
    reportedOn,
    reportedByMail,
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

router.get("/:id", async (req, res) => {
  // res.send(`Issue ${req.params.id}, User ${req.user}`);
  let staff_mail = "",
    assignedTo = `${req.user.role} ${req.user.name.toUpperCase()} [${
      req.user.employeeID
    }]`;
  req.flash("success_msg", "The problem has been assigned to you");
  res.redirect("/issue-dashboard");

  Issue.findOneAndUpdate(
    // updating issue as assigned and the name of executive to whom it's assigned
    { _id: req.params.id },
    { $set: { assigned: true, assignedTo: req.user.name } },
    async (err, issue) => {
      if (err) {
        console.log("[ERR]The issue couldn't be assigned");
      }
      console.log(`[OK]Issue assigned to ${req.user.name}`);
      staff_mail = issue.reportedByMail;
      let staff_issue = `\nTitle: ${issue.title}\n Description: ${issue.description}\n`;
      await sendMail(staff_mail, staff_issue, assignedTo);
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
});

module.exports = router;
