const router = require("express").Router();
const { ensureAuthenticated } = require("../config/auth.js");

const Issue = require("../models/Issues");

router.get("/new", (req, res) => {
  res.render("new-issue");
});

router.post("/new", (req, res) => {
  let { title, description, location } = req.body;

  const newIssue = new Issue({
    title,
    description,
    location,
  });

  newIssue.save().then((issue) => {
    req.flash(
      "success_msg",
      "Your issue has been noted. An executive will get back to you asap."
    );
  });

  res.redirect("/issue-dashboard");
});

module.exports = router;
