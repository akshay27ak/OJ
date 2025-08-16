const mongoose = require("mongoose")

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    statement: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    timeLimit: {
      type: Number,
      default: 1000, // milliseconds
      min: 100,
      max: 10000,
    },
    memoryLimit: {
      type: Number,
      default: 256, // MB
      min: 64,
      max: 1024,
    },
    inputFormat: {
      type: String,
      required: true,
    },
    outputFormat: {
      type: String,
      required: true,
    },
    constraints: {
      type: String,
      required: true,
    },
    sampleInput: {
      type: String,
      required: true,
    },
    sampleOutput: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
problemSchema.index({ title: "text", tags: "text" })
problemSchema.index({ difficulty: 1 })
problemSchema.index({ createdBy: 1 })

module.exports = mongoose.model("Problem", problemSchema)
