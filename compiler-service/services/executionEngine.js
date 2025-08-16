const { runTestCases, VERDICTS } = require("./testCaseRunner")
const { v4: uuidv4 } = require("uuid")

class ExecutionEngine {
  constructor() {
    this.activeExecutions = new Map()
  }

  async executeSubmission({ submissionId, code, language, testCases, timeLimit, memoryLimit }) {
    const executionId = uuidv4()

    console.log(`[v0] Starting execution ${executionId} for submission ${submissionId}`)

    // Track active execution
    this.activeExecutions.set(executionId, {
      submissionId,
      startTime: Date.now(),
      status: "running",
    })

    try {
      // Validate inputs
      const validation = this.validateInputs({ code, language, testCases, timeLimit, memoryLimit })
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Run test cases
      const results = await runTestCases({
        code,
        language,
        testCases,
        timeLimit: timeLimit || 5000,
        memoryLimit: memoryLimit || 256,
      })

      // Calculate final statistics
      const finalResults = {
        ...results,
        submissionId,
        executionId,
        language,
        totalExecutionTime: Date.now() - this.activeExecutions.get(executionId).startTime,
        timestamp: new Date().toISOString(),
      }

      console.log(`[v0] Execution ${executionId} completed with verdict: ${finalResults.verdict}`)

      // Remove from active executions
      this.activeExecutions.delete(executionId)

      return finalResults
    } catch (error) {
      console.error(`[v0] Execution ${executionId} failed:`, error)

      // Remove from active executions
      this.activeExecutions.delete(executionId)

      return {
        submissionId,
        executionId,
        verdict: VERDICTS.SYSTEM_ERROR,
        totalTestCases: testCases ? testCases.length : 0,
        passedTestCases: 0,
        failedTestCases: 0,
        executionTime: 0,
        memoryUsed: 0,
        testCaseResults: [],
        systemError: error.message,
        language,
        totalExecutionTime: Date.now() - this.activeExecutions.get(executionId)?.startTime || 0,
        timestamp: new Date().toISOString(),
      }
    }
  }

  validateInputs({ code, language, testCases, timeLimit, memoryLimit }) {
    // Check required fields
    if (!code || typeof code !== "string") {
      return { isValid: false, error: "Code is required and must be a string" }
    }

    if (!language || typeof language !== "string") {
      return { isValid: false, error: "Language is required and must be a string" }
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return { isValid: false, error: "Test cases are required and must be a non-empty array" }
    }

    // Validate test cases structure
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      if (!testCase.hasOwnProperty("input") || !testCase.hasOwnProperty("expectedOutput")) {
        return {
          isValid: false,
          error: `Test case ${i + 1} must have 'input' and 'expectedOutput' properties`,
        }
      }
    }

    // Validate limits
    if (timeLimit && (typeof timeLimit !== "number" || timeLimit <= 0 || timeLimit > 30000)) {
      return { isValid: false, error: "Time limit must be a positive number <= 30000ms" }
    }

    if (memoryLimit && (typeof memoryLimit !== "number" || memoryLimit <= 0 || memoryLimit > 1024)) {
      return { isValid: false, error: "Memory limit must be a positive number <= 1024MB" }
    }

    // Check code length
    if (code.length > 100000) {
      return { isValid: false, error: "Code length cannot exceed 100,000 characters" }
    }

    // Check supported language
    const supportedLanguages = ["python", "javascript", "cpp", "java", "c"]
    if (!supportedLanguages.includes(language.toLowerCase())) {
      return {
        isValid: false,
        error: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(", ")}`,
      }
    }

    return { isValid: true }
  }

  getActiveExecutions() {
    return Array.from(this.activeExecutions.entries()).map(([executionId, data]) => ({
      executionId,
      ...data,
      runningTime: Date.now() - data.startTime,
    }))
  }

  getExecutionStats() {
    return {
      activeExecutions: this.activeExecutions.size,
      totalExecutionsToday: 0, // TODO: Implement daily counter
      averageExecutionTime: 0, // TODO: Implement average calculation
      successRate: 0, // TODO: Implement success rate calculation
    }
  }
}

// Singleton instance
const executionEngine = new ExecutionEngine()

module.exports = {
  ExecutionEngine,
  executionEngine,
  VERDICTS,
}
