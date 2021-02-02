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
  reportedBy: {
    type: String,
    required: true,
  },
  reportedByMail: {
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
  reportedOn: { type: Date, required: true, default: Date.now },
  completed: { type: Boolean, default: false, required: true },
  completedOn: Date,
});

const Issue = mongoose.model("Issue", IssueSchema);

module.exports = Issue;
