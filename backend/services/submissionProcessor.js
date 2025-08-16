const { compilerService } = require("./compilerService")
const Submission = require("../models/Submission")
const TestCase = require("../models/TestCase")
const Problem = require("../models/Problem")

class SubmissionProcessor {
  constructor() {
    this.processingJobs = new Map() // Track ongoing processing jobs
  }

  async processSubmission(submissionId) {
    try {
      console.log(`[v0] Processing submission ${submissionId}`)

      // Get submission details
      const submission = await Submission.findById(submissionId)
        .populate("problem")
        .populate("user", "firstName lastName")

      if (!submission) {
        throw new Error("Submission not found")
      }

      // Get test cases for the problem
      const testCases = await TestCase.find({ problem: submission.problem._id })

      if (testCases.length === 0) {
        throw new Error("No test cases found for this problem")
      }

      // Prepare test cases for compiler service
      const formattedTestCases = testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
        points: tc.points,
      }))

      // Submit to compiler service
      const compilerResult = await compilerService.submitCode({
        submissionId: submission._id.toString(),
        code: submission.code,
        language: submission.language,
        testCases: formattedTestCases,
        timeLimit: submission.problem.timeLimit,
        memoryLimit: submission.problem.memoryLimit,
        userId: submission.user._id.toString(),
      })

      if (!compilerResult.success) {
        // Update submission with error
        await this.updateSubmissionWithError(submissionId, compilerResult.error)
        return {
          success: false,
          error: compilerResult.error,
        }
      }

      // Store job ID for tracking
      await Submission.findByIdAndUpdate(submissionId, {
        $set: {
          jobId: compilerResult.jobId,
          queue: compilerResult.queue,
          verdict: "Processing",
        },
      })

      // Track the job
      this.processingJobs.set(submissionId, {
        jobId: compilerResult.jobId,
        queue: compilerResult.queue,
        startTime: Date.now(),
      })

      console.log(`[v0] Submission ${submissionId} queued with job ID ${compilerResult.jobId}`)

      return {
        success: true,
        jobId: compilerResult.jobId,
        estimatedTime: compilerResult.estimatedTime,
      }
    } catch (error) {
      console.error(`[v0] Submission processing error:`, error)
      await this.updateSubmissionWithError(submissionId, error.message)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async checkSubmissionResult(submissionId) {
    try {
      let jobInfo = this.processingJobs.get(submissionId)
      if (!jobInfo) {
        // Try to get job info from database
        const submission = await Submission.findById(submissionId)
        if (!submission || !submission.jobId) {
          return {
            success: false,
            error: "No processing job found for this submission",
          }
        }

        jobInfo = {
          jobId: submission.jobId,
          queue: submission.queue || "execution",
        }
      }

      // Get result from compiler service
      const result = await compilerService.getResult(jobInfo.jobId, jobInfo.queue)

      if (!result.success) {
        return result
      }

      if (result.status === "completed") {
        // Update submission with results
        await this.updateSubmissionWithResult(submissionId, result.result)

        // Remove from processing jobs
        this.processingJobs.delete(submissionId)

        return {
          success: true,
          status: "completed",
          result: result.result,
        }
      } else if (result.status === "failed") {
        // Update submission with failure
        await this.updateSubmissionWithError(submissionId, result.error)

        // Remove from processing jobs
        this.processingJobs.delete(submissionId)

        return {
          success: false,
          status: "failed",
          error: result.error,
        }
      } else {
        // Still processing
        return {
          success: true,
          status: result.status,
          progress: result.progress,
        }
      }
    } catch (error) {
      console.error(`[v0] Check submission result error:`, error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async updateSubmissionWithResult(submissionId, executionResult) {
    try {
      // Calculate score based on passed test cases
      const score =
        executionResult.totalTestCases > 0
          ? Math.round((executionResult.passedTestCases / executionResult.totalTestCases) * 100)
          : 0

      const updateData = {
        verdict: executionResult.verdict,
        executionTime: executionResult.executionTime || 0,
        memoryUsed: executionResult.memoryUsed || 0,
        score: score,
        testCasesPassed: executionResult.passedTestCases || 0,
        totalTestCases: executionResult.totalTestCases || 0,
        errorMessage: executionResult.systemError || executionResult.compilationError || "",
        $unset: {
          jobId: 1,
          queue: 1,
        },
      }

      await Submission.findByIdAndUpdate(submissionId, updateData)

      console.log(`[v0] Updated submission ${submissionId} with verdict: ${executionResult.verdict}`)
    } catch (error) {
      console.error(`[v0] Update submission result error:`, error)
      throw error
    }
  }

  async updateSubmissionWithError(submissionId, errorMessage) {
    try {
      await Submission.findByIdAndUpdate(submissionId, {
        verdict: "System Error",
        errorMessage: errorMessage,
        $unset: {
          jobId: 1,
          queue: 1,
        },
      })

      console.log(`[v0] Updated submission ${submissionId} with error: ${errorMessage}`)
    } catch (error) {
      console.error(`[v0] Update submission error:`, error)
    }
  }

  getProcessingJobs() {
    return Array.from(this.processingJobs.entries()).map(([submissionId, jobInfo]) => ({
      submissionId,
      ...jobInfo,
      processingTime: Date.now() - jobInfo.startTime,
    }))
  }

  async cleanupStaleJobs(maxAge = 600000) {
    // 10 minutes
    const now = Date.now()
    const staleJobs = []

    for (const [submissionId, jobInfo] of this.processingJobs.entries()) {
      if (now - jobInfo.startTime > maxAge) {
        staleJobs.push(submissionId)
      }
    }

    for (const submissionId of staleJobs) {
      console.log(`[v0] Cleaning up stale job for submission ${submissionId}`)
      await this.updateSubmissionWithError(submissionId, "Processing timeout")
      this.processingJobs.delete(submissionId)
    }

    return staleJobs.length
  }
}

// Singleton instance
const submissionProcessor = new SubmissionProcessor()

// Cleanup stale jobs every 5 minutes
setInterval(() => {
  submissionProcessor.cleanupStaleJobs()
}, 300000)

module.exports = {
  SubmissionProcessor,
  submissionProcessor,
}
