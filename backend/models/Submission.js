const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ["cpp", "java", "py"],
  },
  verdict: {
    type: String,
    required: true,
    enum: ["Accepted", "Wrong Answer", "Compilation Error", "Runtime Error"],
  },
  executionTime: {
    type: Number,
    default: 0, // in milliseconds
  },
  memoryUsed: {
    type: Number,
    default: 0, // in KB
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Submission", submissionSchema)
