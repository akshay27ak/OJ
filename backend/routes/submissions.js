const express = require("express")
const Submission = require("../models/Submission")
const Problem = require("../models/Problem")
const { authenticateToken } = require("../middleware/auth")
const { submissionProcessor } = require("../services/submissionProcessor")

const router = express.Router()

// Get user's submissions
router.get("/my-submissions", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, problemId } = req.query

    const query = { user: req.user._id }
    if (problemId) {
      query.problem = problemId
    }

    const submissions = await Submission.find(query)
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Submission.countDocuments(query)

    res.status(200).json({
      success: true,
      submissions,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get submissions error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get leaderboard for a problem
router.get("/leaderboard/:problemId", async (req, res) => {
  try {
    const { problemId } = req.params

    // Check if problem exists
    const problem = await Problem.findById(problemId)
    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      })
    }

    // Get best submissions for each user
    const leaderboard = await Submission.aggregate([
      { $match: { problem: problem._id, verdict: "Accepted" } },
      { $sort: { score: -1, executionTime: 1, createdAt: 1 } },
      {
        $group: {
          _id: "$user",
          bestSubmission: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$bestSubmission" } },
      { $sort: { score: -1, executionTime: 1, createdAt: 1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          score: 1,
          executionTime: 1,
          memoryUsed: 1,
          language: 1,
          createdAt: 1,
          "userInfo.firstName": 1,
          "userInfo.lastName": 1,
        },
      },
    ])

    res.status(200).json({
      success: true,
      leaderboard,
      problem: {
        _id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
      },
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Submit solution
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { problemId, code, language } = req.body

    // Validation
    if (!(problemId && code && language)) {
      return res.status(400).json({
        success: false,
        message: "Problem ID, code, and language are required",
      })
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId)
    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      })
    }

    // Validate language
    const supportedLanguages = ["cpp", "java", "python", "javascript", "c"]
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported programming language",
      })
    }

    // Create submission
    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      code,
      language,
      verdict: "Pending",
    })

    const processingResult = await submissionProcessor.processSubmission(submission._id)

    if (!processingResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to process submission",
        error: processingResult.error,
      })
    }

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("problem", "title difficulty")
      .populate("user", "firstName lastName")

    res.status(201).json({
      success: true,
      message: "Solution submitted successfully",
      submission: populatedSubmission,
      processing: {
        jobId: processingResult.jobId,
        estimatedTime: processingResult.estimatedTime,
      },
    })
  } catch (error) {
    console.error("Submit solution error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

router.get("/:id/result", authenticateToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problem", "title difficulty")
      .populate("user", "firstName lastName")

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Users can only view their own submissions
    if (submission.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // If submission is still processing, check for updates
    if (submission.verdict === "Processing" || submission.verdict === "Pending") {
      const result = await submissionProcessor.checkSubmissionResult(submission._id)

      if (result.success && result.status === "completed") {
        // Refresh submission data after update
        const updatedSubmission = await Submission.findById(req.params.id)
          .populate("problem", "title difficulty")
          .populate("user", "firstName lastName")

        return res.json({
          success: true,
          submission: updatedSubmission,
          status: "completed",
        })
      } else if (!result.success && result.status === "failed") {
        // Refresh submission data after error update
        const updatedSubmission = await Submission.findById(req.params.id)
          .populate("problem", "title difficulty")
          .populate("user", "firstName lastName")

        return res.json({
          success: true,
          submission: updatedSubmission,
          status: "failed",
        })
      } else {
        // Still processing
        return res.json({
          success: true,
          submission,
          status: result.status || "processing",
          progress: result.progress,
        })
      }
    }

    // Submission is complete
    res.json({
      success: true,
      submission,
      status: "completed",
    })
  } catch (error) {
    console.error("Get submission result error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get single submission
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("problem", "title difficulty")
      .populate("user", "firstName lastName")

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Users can only view their own submissions
    if (submission.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    res.status(200).json({
      success: true,
      submission,
    })
  } catch (error) {
    console.error("Get submission error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
