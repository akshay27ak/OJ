const { executeCode } = require("./codeExecutor")

// Verdict types
const VERDICTS = {
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  RUNTIME_ERROR: "Runtime Error",
  COMPILATION_ERROR: "Compilation Error",
  SYSTEM_ERROR: "System Error",
  PENDING: "Pending",
}

async function runTestCases({ code, language, testCases, timeLimit, memoryLimit }) {
  console.log(`[v0] Running ${testCases.length} test cases for ${language}`)

  const results = {
    verdict: VERDICTS.PENDING,
    totalTestCases: testCases.length,
    passedTestCases: 0,
    failedTestCases: 0,
    executionTime: 0,
    memoryUsed: 0,
    testCaseResults: [],
    compilationError: null,
    systemError: null,
  }

  try {
    // Run code against each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      console.log(`[v0] Running test case ${i + 1}/${testCases.length}`)

      const executionResult = await executeCode({
        code,
        language,
        input: testCase.input,
        timeLimit,
        memoryLimit,
      })

      // Update overall execution stats
      results.executionTime = Math.max(results.executionTime, executionResult.executionTime)
      results.memoryUsed = Math.max(results.memoryUsed, executionResult.memoryUsed)

      // Handle compilation error (stop execution)
      if (executionResult.verdict === VERDICTS.COMPILATION_ERROR) {
        results.verdict = VERDICTS.COMPILATION_ERROR
        results.compilationError = executionResult.error
        results.testCaseResults.push({
          testCaseNumber: i + 1,
          verdict: VERDICTS.COMPILATION_ERROR,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          executionTime: 0,
          memoryUsed: 0,
          error: executionResult.error,
        })
        break
      }

      // Handle system error (stop execution)
      if (executionResult.verdict === VERDICTS.SYSTEM_ERROR) {
        results.verdict = VERDICTS.SYSTEM_ERROR
        results.systemError = executionResult.error
        results.testCaseResults.push({
          testCaseNumber: i + 1,
          verdict: VERDICTS.SYSTEM_ERROR,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          executionTime: executionResult.executionTime,
          memoryUsed: executionResult.memoryUsed,
          error: executionResult.error,
        })
        break
      }

      // Handle runtime errors, time/memory limits
      if (executionResult.verdict !== VERDICTS.ACCEPTED) {
        results.failedTestCases++
        results.testCaseResults.push({
          testCaseNumber: i + 1,
          verdict: executionResult.verdict,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: executionResult.output,
          executionTime: executionResult.executionTime,
          memoryUsed: executionResult.memoryUsed,
          error: executionResult.error,
        })

        // Set overall verdict to first failure
        if (results.verdict === VERDICTS.PENDING) {
          results.verdict = executionResult.verdict
        }
        continue
      }

      // Compare output for correctness
      const outputComparison = compareOutputs(executionResult.output, testCase.expectedOutput)

      if (outputComparison.isCorrect) {
        results.passedTestCases++
        results.testCaseResults.push({
          testCaseNumber: i + 1,
          verdict: VERDICTS.ACCEPTED,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: executionResult.output,
          executionTime: executionResult.executionTime,
          memoryUsed: executionResult.memoryUsed,
          error: null,
        })
      } else {
        results.failedTestCases++
        results.testCaseResults.push({
          testCaseNumber: i + 1,
          verdict: VERDICTS.WRONG_ANSWER,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: executionResult.output,
          executionTime: executionResult.executionTime,
          memoryUsed: executionResult.memoryUsed,
          error: null,
          outputDifference: outputComparison.difference,
        })

        // Set overall verdict to Wrong Answer if not already set
        if (results.verdict === VERDICTS.PENDING) {
          results.verdict = VERDICTS.WRONG_ANSWER
        }
      }
    }

    // Set final verdict
    if (results.verdict === VERDICTS.PENDING) {
      results.verdict = results.passedTestCases === results.totalTestCases ? VERDICTS.ACCEPTED : VERDICTS.WRONG_ANSWER
    }

    console.log(
      `[v0] Test execution completed. Verdict: ${results.verdict}, Passed: ${results.passedTestCases}/${results.totalTestCases}`,
    )

    return results
  } catch (error) {
    console.error("[v0] Test case runner error:", error)
    return {
      ...results,
      verdict: VERDICTS.SYSTEM_ERROR,
      systemError: error.message,
    }
  }
}

function compareOutputs(actualOutput, expectedOutput) {
  // Normalize outputs (trim whitespace, handle different line endings)
  const normalizeOutput = (output) => {
    return output
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n")
  }

  const normalizedActual = normalizeOutput(actualOutput)
  const normalizedExpected = normalizeOutput(expectedOutput)

  const isCorrect = normalizedActual === normalizedExpected

  let difference = null
  if (!isCorrect) {
    difference = {
      expected: normalizedExpected,
      actual: normalizedActual,
      expectedLines: normalizedExpected.split("\n"),
      actualLines: normalizedActual.split("\n"),
    }
  }

  return {
    isCorrect,
    difference,
  }
}

module.exports = {
  runTestCases,
  compareOutputs,
  VERDICTS,
}
