const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // 🔹 Track time spent per day: { "YYYY-MM-DD": minutes }
  timeSpent: {
    type: Map,
    of: Number,
    default: {},
  },
});

module.exports = mongoose.model("User", userSchema);
