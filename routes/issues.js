const router = require("express").Router();
const Issue = require("../models/Issues");
const User = require("../models/User");
const nodemailer = require("nodemailer");

require("dotenv").config();

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(
  staff_mail,
  staff_problem_statement,
  assignedTo,
  reassign = false
) {
  // create reusable transporter object using the default SMTP transport
  let message = {};
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: `${process.env.GMAIL_ID}`, // mail for login to google smtp
      pass: `${process.env.GMAIL_PWD}`, // password for login to google smtp
    },
  });
  if (!reassign) {
    message = {
      from: `"Support" <${process.env.GMAIL_ID}>`, // sender address
      to: staff_mail, // list of receivers
      subject: `Problem Assistance`, // Subject line
      text: `${staff_problem_statement} Your problem has been assigned to ${assignedTo}`, // plain text body
      html: `<b style="white-space:pre-line">${staff_problem_statement}</b><em>Your problem has been assigned to <b>${assignedTo}</b></em>`, // html body
    };
  } else {
    message = {
      from: `"Support" <${process.env.GMAIL_ID}>`, // sender address
      to: staff_mail, // list of receivers
      subject: `Problem Assistance`, // Subject line
      text: `${staff_problem_statement} Your problem has been re-assigned to ${assignedTo}`, // plain text body
      html: `<b style="white-space:pre-line">${staff_problem_statement}</b><em>Your problem has been <b>REASSIGNED</b> to <b>${assignedTo}</b></em>`, // html body
    };
  }

  // send mail with defined transport object
  let info = await transporter.sendMail(message);

  console.log("[OK] Message sent: %s", info.messageId);
}

router.get("/new", (req, res) => {
  res.render("new-issue");
});

router.post("/new", (req, res) => {
  let { title, description, location } = req.body;

  let reportedBy = `${req.user.name}[ID:${req.user.employeeID}]`;
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
    {
      $set: {
        assigned: true,
        assignedTo: `${req.user.name}-${req.user.employeeID}`,
      },
    }, // assigned to currently logged in User
    async (err, issue) => {
      if (err) {
        console.log("[ERR]The issue couldn't be assigned");
      }
      console.log(`[OK]Issue assigned to ${req.user.name}`);
      staff_mail = issue.reportedByMail;
      let staff_issue = `\nTitle: ${issue.title}\n Description: ${issue.description}\n`;
      await sendMail(staff_mail, staff_issue, assignedTo);
    }
  );
});

router.get("/:id/pull", (req, res) => {
  // pull route for pulling an already assigned problem from another executive
  req.flash("success_msg", "The problem was re-assigned to you");
  let prevAssignedEmpID = "";

  // updating issue assignedto
  Issue.findOne({ _id: req.params.id }).then((issue) => {
    // issue found store previous assigned emp ID
    prevAssignedEmpID = issue.assignedTo.split("-")[1];
    Issue.updateOne(
      { _id: issue._id },
      { $set: { assignedTo: `${req.user.name}-${req.user.employeeID}` } },
      () => {
        console.log(
          `[OK]Issue reassigned successfully from EmpID:${prevAssignedEmpID} to EmpID:${req.user.employeeID}`
        );
      }
    );
  });
  res.redirect("/issue-dashboard");
});

router.get("/:id/complete", (req, res) => {
  req.flash("success_msg", "The problem was marked as completed!");
  Issue.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { completed: true, completedOn: Date.now() } },
    () => {
      console.log("[OK] Issue marked as completed!");
      res.redirect("/issue-dashboard");
    }
  );
});

module.exports = router;
