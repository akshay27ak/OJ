const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { setupLanguageContainers } = require("./services/dockerManager")
const { executionEngine, VERDICTS } = require("./services/executionEngine")
const { queueManager } = require("./services/queueManager")
const { rateLimiter } = require("./services/rateLimiter")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.COMPILER_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    const userId = req.body.userId || req.headers["x-user-id"] || "anonymous"
    const action = req.path.includes("batch") ? "batch" : req.body.priority ? "priority" : "execute"

    const rateLimitResult = await rateLimiter.checkRateLimit(userId, action)

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded",
        rateLimit: rateLimitResult,
      })
    }

    // Add rate limit info to response headers
    res.set({
      "X-RateLimit-Limit": rateLimitResult.limit,
      "X-RateLimit-Remaining": rateLimitResult.limit - rateLimitResult.current,
      "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toISOString(),
    })

    next()
  } catch (error) {
    console.error("[v0] Rate limit middleware error:", error)
    next() // Continue if rate limiting fails
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Online Judge Compiler Service",
    timestamp: new Date().toISOString(),
  })
})

// Code execution endpoint
app.post("/execute", rateLimitMiddleware, async (req, res) => {
  try {
    const { submissionId, code, language, testCases, timeLimit, memoryLimit, userId, priority } = req.body

    // Validate required fields
    if (!code || !language || !testCases) {
      return res.status(400).json({
        success: false,
        message: "Code, language, and testCases are required",
      })
    }

    // Add job to appropriate queue
    const jobResult = await queueManager.addExecutionJob(
      {
        submissionId: submissionId || `temp_${Date.now()}`,
        code,
        language,
        testCases,
        timeLimit: timeLimit || 5000,
        memoryLimit: memoryLimit || 256,
        userId: userId || "anonymous",
      },
      {
        priority: priority || 0,
      },
    )

    res.json({
      success: true,
      jobId: jobResult.jobId,
      queue: jobResult.queue,
      message: "Code execution queued",
      estimatedTime: `${jobResult.estimatedTime}s`,
    })
  } catch (error) {
    console.error("Execution error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// Batch execution endpoint
app.post("/execute/batch", rateLimitMiddleware, async (req, res) => {
  try {
    const { submissions } = req.body

    if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Submissions array is required and must not be empty",
      })
    }

    if (submissions.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 submissions allowed per batch",
      })
    }

    const jobResult = await queueManager.addBatchJob(submissions)

    res.json({
      success: true,
      jobId: jobResult.jobId,
      queue: jobResult.queue,
      totalSubmissions: jobResult.totalSubmissions,
      message: "Batch execution queued",
    })
  } catch (error) {
    console.error("Batch execution error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// Get execution result
app.get("/result/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params
    const { queue = "execution" } = req.query

    const jobStatus = await queueManager.getJobStatus(jobId, queue)

    if (!jobStatus) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      })
    }

    if (jobStatus.state === "completed") {
      res.json({
        success: true,
        status: "completed",
        result: jobStatus.result,
        jobInfo: {
          processedOn: jobStatus.processedOn,
          finishedOn: jobStatus.finishedOn,
          attemptsMade: jobStatus.attemptsMade,
        },
      })
    } else if (jobStatus.state === "failed") {
      res.json({
        success: false,
        status: "failed",
        error: jobStatus.failedReason,
        jobInfo: {
          attemptsMade: jobStatus.attemptsMade,
          failedOn: jobStatus.finishedOn,
        },
      })
    } else {
      res.json({
        success: true,
        status: jobStatus.state,
        progress: jobStatus.progress,
        message: "Job is still processing",
      })
    }
  } catch (error) {
    console.error("Result fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Queue statistics endpoint
app.get("/stats", async (req, res) => {
  try {
    const queueStats = await queueManager.getQueueStats()
    const executionStats = executionEngine.getExecutionStats()
    const activeExecutions = executionEngine.getActiveExecutions()

    res.json({
      success: true,
      stats: {
        queues: queueStats,
        execution: {
          ...executionStats,
          activeExecutions: activeExecutions.length,
          activeExecutionDetails: activeExecutions,
        },
      },
    })
  } catch (error) {
    console.error("Stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
    })
  }
})

// User rate limit stats
app.get("/rate-limit/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const stats = await rateLimiter.getUserStats(userId)

    res.json({
      success: true,
      userId,
      rateLimits: stats,
    })
  } catch (error) {
    console.error("Rate limit stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get rate limit statistics",
    })
  }
})

// Queue management endpoints (admin only)
app.post("/admin/queue/:action", async (req, res) => {
  try {
    const { action } = req.params
    const { queueType } = req.body

    switch (action) {
      case "pause":
        await queueManager.pauseQueue(queueType)
        break
      case "resume":
        await queueManager.resumeQueue(queueType)
        break
      case "clean":
        await queueManager.cleanQueue(queueType)
        break
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action. Use: pause, resume, clean",
        })
    }

    res.json({
      success: true,
      message: `Queue ${queueType} ${action} completed`,
    })
  } catch (error) {
    console.error("Queue management error:", error)
    res.status(500).json({
      success: false,
      message: "Queue management failed",
      error: error.message,
    })
  }
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[v0] Received SIGTERM, shutting down gracefully...")
  await queueManager.shutdown()
  process.exit(0)
})

process.on("SIGINT", async () => {
  console.log("[v0] Received SIGINT, shutting down gracefully...")
  await queueManager.shutdown()
  process.exit(0)
})

// Initialize Docker containers on startup
async function initializeService() {
  try {
    console.log("[v0] Initializing compiler service...")
    await setupLanguageContainers()
    console.log("[v0] Language containers initialized")

    app.listen(PORT, () => {
      console.log(`[v0] Compiler service running on port ${PORT}`)
      console.log(`[v0] Queue system initialized with Redis`)
      console.log(`[v0] Rate limiting enabled`)
    })
  } catch (error) {
    console.error("[v0] Failed to initialize service:", error)
    process.exit(1)
  }
}

initializeService()
