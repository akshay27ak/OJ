const mongoose = require("mongoose")

const testCaseSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: true,
    },
    points: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
testCaseSchema.index({ problem: 1 })
testCaseSchema.index({ problem: 1, isHidden: 1 })

module.exports = mongoose.model("TestCase", testCaseSchema)
