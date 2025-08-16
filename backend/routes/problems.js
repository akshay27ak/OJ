const express = require("express")
const Problem = require("../models/Problem")
const TestCase = require("../models/TestCase")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get all problems (public)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, difficulty, search } = req.query

    const query = { isActive: true }

    // Filter by difficulty
    if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
      query.difficulty = difficulty
    }

    // Search functionality
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { tags: { $in: [new RegExp(search, "i")] } }]
    }

    const problems = await Problem.find(query)
      .select("title difficulty tags createdAt")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Problem.countDocuments(query)

    res.status(200).json({
      success: true,
      problems,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get problems error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get single problem by ID
router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate("createdBy", "firstName lastName")

    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      })
    }

    // Get sample test cases (non-hidden ones)
    const sampleTestCases = await TestCase.find({
      problem: problem._id,
      isHidden: false,
    }).select("input expectedOutput")

    res.status(200).json({
      success: true,
      problem: {
        ...problem.toObject(),
        sampleTestCases,
      },
    })
  } catch (error) {
    console.error("Get problem error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Create new problem (authenticated users only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      statement,
      difficulty,
      timeLimit,
      memoryLimit,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      tags,
      testCases,
    } = req.body

    // Validation
    if (!(title && statement && inputFormat && outputFormat && constraints && sampleInput && sampleOutput)) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      })
    }

    // Create problem
    const problem = await Problem.create({
      title,
      statement,
      difficulty: difficulty || "Easy",
      timeLimit: timeLimit || 1000,
      memoryLimit: memoryLimit || 256,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      tags: tags || [],
      createdBy: req.user._id,
    })

    // Create test cases if provided
    if (testCases && Array.isArray(testCases)) {
      const testCasePromises = testCases.map((tc) =>
        TestCase.create({
          problem: problem._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden !== false, // default to hidden
          points: tc.points || 1,
        }),
      )
      await Promise.all(testCasePromises)
    }

    const populatedProblem = await Problem.findById(problem._id).populate("createdBy", "firstName lastName")

    res.status(201).json({
      success: true,
      message: "Problem created successfully",
      problem: populatedProblem,
    })
  } catch (error) {
    console.error("Create problem error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Update problem (only by creator)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      })
    }

    // Check if user is the creator
    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own problems",
      })
    }

    const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "firstName lastName")

    res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      problem: updatedProblem,
    })
  } catch (error) {
    console.error("Update problem error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Delete problem (only by creator)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      })
    }

    // Check if user is the creator
    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own problems",
      })
    }

    // Soft delete by setting isActive to false
    await Problem.findByIdAndUpdate(req.params.id, { isActive: false })

    res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    })
  } catch (error) {
    console.error("Delete problem error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

module.exports = router
