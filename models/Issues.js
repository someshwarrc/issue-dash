const mongoose = require("mongoose");

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  assigned: {
    type: Boolean,
    required: true,
    default: false,
  },
  assignedTo: {
    type: String,
    required: true,
    default: "None",
  },
});

const Issue = mongoose.model("Issue", IssueSchema);

module.exports = Issue;
