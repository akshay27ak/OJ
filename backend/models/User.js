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
  
  timeSpent: {
    type: Map,
    of: Number,
    default: {},
  },

  activityLog: [
    {
      action: { type: String }, // e.g. "login", "logout", "viewPage"
      timestamp: { type: Date, default: Date.now }, // stored in UTC
      timezone: { type: String }, // optional, e.g. "America/New_York"
      ip: { type: String }, // store IP address
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
