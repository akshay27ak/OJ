const mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
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
      enum: ["cpp", "java", "python", "javascript", "c"],
      required: true,
    },
    verdict: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "System Error",
      ],
      default: "Pending",
    },
    executionTime: {
      type: Number,
      default: 0, // milliseconds
    },
    memoryUsed: {
      type: Number,
      default: 0, // MB
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    jobId: {
      type: String,
      index: true,
    },
    queue: {
      type: String,
      enum: ["execution", "priority", "batch"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient querying
submissionSchema.index({ user: 1, createdAt: -1 })
submissionSchema.index({ problem: 1, createdAt: -1 })
submissionSchema.index({ user: 1, problem: 1, createdAt: -1 })
submissionSchema.index({ verdict: 1 })
submissionSchema.index({ jobId: 1 })

module.exports = mongoose.model("Submission", submissionSchema)
