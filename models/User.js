const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeID: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  issuesReported: {
    // only for staff
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Issue",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
