const { spawn } = require("child_process")
const fs = require("fs-extra")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

// Supported languages configuration
const LANGUAGE_CONFIG = {
  python: {
    image: "oj-python:3.9",
    extension: ".py",
    compileCommand: null,
    runCommand: ["python", "solution.py"],
  },
  javascript: {
    image: "oj-javascript:18",
    extension: ".js",
    compileCommand: null,
    runCommand: ["node", "solution.js"],
  },
  cpp: {
    image: "oj-cpp:9",
    extension: ".cpp",
    compileCommand: ["g++", "-o", "solution", "solution.cpp", "-std=c++17", "-O2"],
    runCommand: ["./solution"],
  },
  java: {
    image: "oj-java:11",
    extension: ".java",
    compileCommand: ["javac", "Solution.java"],
    runCommand: ["java", "-Djava.security.manager", "-Djava.security.policy=/workspace/java.policy", "Solution"],
  },
  c: {
    image: "oj-c:9",
    extension: ".c",
    compileCommand: ["gcc", "-o", "solution", "solution.c", "-std=c11", "-O2"],
    runCommand: ["./solution"],
  },
}

async function executeCode({ code, language, input, timeLimit, memoryLimit }) {
  const executionId = uuidv4()
  const workDir = path.join(__dirname, "../temp", executionId)

  try {
    console.log(`[v0] Starting execution for ${executionId}`)
    console.log(`[v0] Language: ${language}, TimeLimit: ${timeLimit}ms, MemoryLimit: ${memoryLimit}MB`)
    console.log(`[v0] Code length: ${code.length} characters`)
    console.log(`[v0] Input: "${input}"`)

    // Create temporary directory
    await fs.ensureDir(workDir)
    console.log(`[v0] Created work directory: ${workDir}`)

    const config = LANGUAGE_CONFIG[language.toLowerCase()]
    if (!config) {
      throw new Error(`Unsupported language: ${language}`)
    }

    // Write code to file
    const filename = language.toLowerCase() === "java" ? "Solution.java" : `solution${config.extension}`
    const codePath = path.join(workDir, filename)
    await fs.writeFile(codePath, code)
    console.log(`[v0] Code written to: ${codePath}`)

    // Write input to file
    const inputPath = path.join(workDir, "input.txt")
    await fs.writeFile(inputPath, input)
    console.log(`[v0] Input written to: ${inputPath}`)

    const codeExists = await fs.pathExists(codePath)
    const inputExists = await fs.pathExists(inputPath)
    console.log(`[v0] Code file exists: ${codeExists}, Input file exists: ${inputExists}`)

    if (codeExists) {
      const codeContent = await fs.readFile(codePath, "utf8")
      console.log(`[v0] Code file content: "${codeContent}"`)
    }

    console.log(`[v0] Executing ${language} code in ${workDir}`)

    // Compile if needed
    if (config.compileCommand) {
      console.log(`[v0] Compiling ${language} code...`)
      const compileResult = await runInDocker({
        image: config.image,
        workDir,
        command: config.compileCommand,
        timeLimit: 15000, // 15 seconds for compilation
        memoryLimit: Math.max(memoryLimit, 512), // At least 512MB for compilation
      })

      if (compileResult.exitCode !== 0) {
        console.log(`[v0] Compilation failed for ${executionId}`)
        return {
          verdict: "Compilation Error",
          output: "",
          error: compileResult.stderr || compileResult.stdout,
          executionTime: compileResult.executionTime,
          memoryUsed: 0,
        }
      }
      console.log(`[v0] Compilation successful for ${executionId}`)
    }

    // Execute code
    console.log(`[v0] Running ${language} code...`)
    const executeResult = await runInDocker({
      image: config.image,
      workDir,
      command: config.runCommand,
      input: inputPath,
      timeLimit,
      memoryLimit,
    })

    console.log(`[v0] Docker execution result for ${executionId}:`)
    console.log(`[v0] - Exit code: ${executeResult.exitCode}`)
    console.log(`[v0] - Stdout: "${executeResult.stdout}"`)
    console.log(`[v0] - Stderr: "${executeResult.stderr}"`)
    console.log(`[v0] - Execution time: ${executeResult.executionTime}ms`)
    console.log(`[v0] - Timeout: ${executeResult.timeout}`)

    // Determine verdict based on execution result
    let verdict = "Accepted"
    if (executeResult.timeout) {
      verdict = "Time Limit Exceeded"
    } else if (executeResult.memoryExceeded) {
      verdict = "Memory Limit Exceeded"
    } else if (executeResult.exitCode !== 0) {
      verdict = "Runtime Error"
    }

    console.log(`[v0] Execution completed for ${executionId}: ${verdict}`)

    return {
      verdict,
      output: executeResult.stdout,
      error: executeResult.stderr,
      executionTime: executeResult.executionTime,
      memoryUsed: executeResult.memoryUsed,
      exitCode: executeResult.exitCode,
    }
  } catch (error) {
    console.error(`[v0] Execution error for ${executionId}:`, error)
    return {
      verdict: "System Error",
      output: "",
      error: error.message,
      executionTime: 0,
      memoryUsed: 0,
    }
  } finally {
    // Cleanup temporary directory
    try {
      await fs.remove(workDir)
      console.log(`[v0] Cleaned up workspace for ${executionId}`)
    } catch (cleanupError) {
      console.error(`[v0] Cleanup error for ${executionId}:`, cleanupError)
    }
  }
}

async function runInDocker({ image, workDir, command, input, timeLimit, memoryLimit }) {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const dockerTimeoutSeconds = Math.max(Math.ceil(timeLimit / 1000), 5)

    const dockerArgs = [
      "run",
      "--rm",
      "--network=none", // No network access
      "--memory=" + memoryLimit + "m",
      "--memory-swap=" + memoryLimit + "m", // Prevent swap usage
      "--cpus=0.5", // Limit CPU usage
      "--pids-limit=50", // Limit processes
      "--ulimit",
      "nproc=50:50", // Limit processes
      "--ulimit",
      "fsize=10485760:10485760", // Limit file size (10MB)
      "--ulimit",
      "cpu=10:10", // Limit CPU time
      "--read-only", // Read-only filesystem
      "--tmpfs",
      "/tmp:rw,size=100m,noexec", // Temporary filesystem
      "--tmpfs",
      "/workspace:rw,size=50m", // Workspace filesystem
      "--security-opt",
      "no-new-privileges", // Prevent privilege escalation
      "--cap-drop=ALL", // Drop all capabilities
      "-v",
      `${workDir}:/host-workspace:ro`, // Mount code directory as read-only
      "-w",
      "/workspace",
      image,
      "sh",
      "-c",
      `cp -r /host-workspace/* /workspace/ 2>/dev/null || true && timeout ${dockerTimeoutSeconds}s ${command.join(" ")}`,
    ]

    console.log(`[v0] Running Docker command: docker ${dockerArgs.join(" ")}`)

    let stdout = ""
    let stderr = ""
    let timeout = false

    // Set execution timeout
    const timer = setTimeout(() => {
      timeout = true
      console.log(`[v0] Docker process timed out after ${timeLimit}ms`)
      dockerProcess.kill("SIGKILL")
    }, timeLimit)

    // Collect output
    const dockerProcess = spawn("docker", dockerArgs)

    dockerProcess.on("spawn", () => {
      console.log(`[v0] Docker process spawned successfully`)
    })

    // Handle input
    if (input) {
      fs.readFile(input, "utf8", (err, data) => {
        if (!err && dockerProcess.stdin) {
          console.log(`[v0] Writing input to Docker process: "${data}"`)
          dockerProcess.stdin.write(data)
          dockerProcess.stdin.end()
        } else if (err) {
          console.log(`[v0] Error reading input file: ${err.message}`)
          dockerProcess.stdin.end()
        }
      })
    } else {
      dockerProcess.stdin.end()
    }

    dockerProcess.stdout.on("data", (data) => {
      const output = data.toString()
      console.log(`[v0] Docker stdout: "${output}"`)
      stdout += output
    })

    dockerProcess.stderr.on("data", (data) => {
      const error = data.toString()
      console.log(`[v0] Docker stderr: "${error}"`)
      stderr += error
    })

    dockerProcess.on("close", (exitCode) => {
      clearTimeout(timer)
      const executionTime = Date.now() - startTime
      console.log(`[v0] Docker process closed with exit code: ${exitCode}, execution time: ${executionTime}ms`)

      resolve({
        exitCode: timeout ? 124 : exitCode, // 124 is timeout exit code
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        executionTime,
        memoryUsed: 0, // TODO: Implement memory usage tracking
        timeout,
        memoryExceeded: false, // TODO: Implement memory limit checking
      })
    })

    dockerProcess.on("error", (error) => {
      clearTimeout(timer)
      console.log(`[v0] Docker process error: ${error.message}`)
      resolve({
        exitCode: 1,
        stdout: "",
        stderr: error.message,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        timeout: false,
        memoryExceeded: false,
      })
    })
  })
}

module.exports = { executeCode }
