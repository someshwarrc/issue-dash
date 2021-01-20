module.exports = {
  ensureAuthenticated: function (req, res, next) {
    // allow some endpoints only if logged in
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Please log in to view that resource");
    res.redirect("/users/login");
  },
  forwardAuthenticated: function (req, res, next) {
    // prevent opening certain endpoints if logged in
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/issue-dashboard");
  },
};
