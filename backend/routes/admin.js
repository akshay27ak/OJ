const express = require("express")
const { authenticateToken } = require("../middleware/auth")
const { compilerService } = require("../services/compilerService")
const { submissionProcessor } = require("../services/submissionProcessor")

const router = express.Router()

// Admin middleware (you can enhance this with proper role checking)
const requireAdmin = (req, res, next) => {
  // TODO: Add proper admin role checking
  // For now, just check if user exists
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    })
  }
  next()
}

// Get compiler service health
router.get("/compiler/health", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const health = await compilerService.checkHealth()
    res.json({
      success: true,
      compilerService: health,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check compiler service health",
      error: error.message,
    })
  }
})

// Get compiler service statistics
router.get("/compiler/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await compilerService.getStats()
    const processingJobs = submissionProcessor.getProcessingJobs()

    res.json({
      success: true,
      compilerStats: stats,
      processingJobs: {
        count: processingJobs.length,
        jobs: processingJobs,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get compiler statistics",
      error: error.message,
    })
  }
})

// Get user rate limit stats
router.get("/rate-limit/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const rateLimits = await compilerService.getRateLimitStats(userId)

    res.json({
      success: true,
      userId,
      rateLimits,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get rate limit stats",
      error: error.message,
    })
  }
})

module.exports = router
