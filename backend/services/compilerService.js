const axios = require("axios")

class CompilerService {
  constructor() {
    this.baseURL = process.env.COMPILER_SERVICE_URL || "http://localhost:3001"
    this.timeout = 30000 // 30 seconds timeout

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  async submitCode({ submissionId, code, language, testCases, timeLimit, memoryLimit, userId, priority = false }) {
    try {
      console.log(`[v0] Submitting code to compiler service for submission ${submissionId}`)

      const response = await this.client.post("/execute", {
        submissionId,
        code,
        language,
        testCases,
        timeLimit,
        memoryLimit,
        userId,
        priority,
      })

      console.log(`[v0] Code submitted successfully, job ID: ${response.data.jobId}`)

      return {
        success: true,
        jobId: response.data.jobId,
        queue: response.data.queue,
        estimatedTime: response.data.estimatedTime,
      }
    } catch (error) {
      console.error(`[v0] Compiler service submission error:`, error.message)

      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: error.response.data.message || "Compiler service error",
          statusCode: error.response.status,
        }
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: "Compiler service unavailable",
          statusCode: 503,
        }
      } else {
        // Other error
        return {
          success: false,
          error: error.message,
          statusCode: 500,
        }
      }
    }
  }

  async getResult(jobId, queue = "execution") {
    try {
      const response = await this.client.get(`/result/${jobId}`, {
        params: { queue },
      })

      return {
        success: true,
        ...response.data,
      }
    } catch (error) {
      console.error(`[v0] Get result error for job ${jobId}:`, error.message)

      if (error.response?.status === 404) {
        return {
          success: false,
          error: "Job not found",
          statusCode: 404,
        }
      }

      return {
        success: false,
        error: error.response?.data?.message || "Failed to get result",
        statusCode: error.response?.status || 500,
      }
    }
  }

  async checkHealth() {
    try {
      const response = await this.client.get("/health")
      return {
        success: true,
        status: response.data.status,
        timestamp: response.data.timestamp,
      }
    } catch (error) {
      return {
        success: false,
        error: "Compiler service unavailable",
      }
    }
  }

  async getStats() {
    try {
      const response = await this.client.get("/stats")
      return {
        success: true,
        stats: response.data.stats,
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to get compiler stats",
      }
    }
  }

  async getRateLimitStats(userId) {
    try {
      const response = await this.client.get(`/rate-limit/${userId}`)
      return {
        success: true,
        rateLimits: response.data.rateLimits,
      }
    } catch (error) {
      return {
        success: false,
        error: "Failed to get rate limit stats",
      }
    }
  }
}

// Singleton instance
const compilerService = new CompilerService()

module.exports = {
  CompilerService,
  compilerService,
}
