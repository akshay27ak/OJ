const fs = require("fs")
const path = require("path")
const { exec, spawn } = require("child_process")

const outputPath = path.join(__dirname, "outputs")

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true })
}

const executeCode = async (filepath, input = "") => {
  const ext = path.extname(filepath)
  const jobDir = path.dirname(filepath)
  const jobId = path.basename(filepath).split(".")[0]
  const TIME_LIMIT = 3000

  return new Promise((resolve, reject) => {
    if (ext === ".cpp") {
      const outputFile = path.join(outputPath, `${jobId}.exe`)
      exec(`g++ "${filepath}" -o "${outputFile}"`, (compileErr, stdout, stderr) => {
        if (compileErr || stderr) {
          return reject({
            error: "❌ Compilation Error (C++)",
            stderr: stderr || compileErr.message,
          })
        }

        const run = spawn(outputFile)
        let output = "",
          errorOutput = ""
        let processEnded = false

        if (run.stdin) {
          run.stdin.on("error", (err) => {
            console.log("[executeCode] stdin error (handled):", err.message)
          })
        }
        if (run.stdout) {
          run.stdout.on("error", (err) => {
            console.log("[executeCode] stdout error (handled):", err.message)
          })
        }
        if (run.stderr) {
          run.stderr.on("error", (err) => {
            console.log("[executeCode] stderr error (handled):", err.message)
          })
        }

        const timeout = setTimeout(() => {
          if (!processEnded) {
            processEnded = true
            run.kill("SIGKILL")
            reject({ error: "❌ Time Limit Exceeded (3s)", stderr: "" })
          }
        }, TIME_LIMIT)

        run.stdout.on("data", (data) => (output += data.toString()))
        run.stderr.on("data", (data) => (errorOutput += data.toString()))

        run.on("close", (code) => {
          if (processEnded) return
          processEnded = true
          clearTimeout(timeout)
          fs.unlink(outputFile, () => {})
          if (code !== 0) {
            return reject({
              error: "❌ Runtime Error",
              stderr: errorOutput || `Process exited with code ${code}`,
            })
          }
          resolve(output.trim())
        })

        run.on("error", (err) => {
          if (processEnded) return
          processEnded = true
          clearTimeout(timeout)
          reject({ error: "❌ Process Error", stderr: err.message })
        })

        try {
          if (run.stdin && !run.stdin.destroyed && !processEnded) {
            run.stdin.write(input)
            run.stdin.end()
          }
        } catch (err) {
          console.log("[executeCode] stdin write error (non-fatal):", err.message)
        }
      })
    } else if (ext === ".py") {
      const run = spawn("python", [filepath])
      let output = "",
        errorOutput = ""
      let processEnded = false

      if (run.stdin) {
        run.stdin.on("error", (err) => {
          console.log("[executeCode] stdin error (handled):", err.message)
        })
      }
      if (run.stdout) {
        run.stdout.on("error", (err) => {
          console.log("[executeCode] stdout error (handled):", err.message)
        })
      }
      if (run.stderr) {
        run.stderr.on("error", (err) => {
          console.log("[executeCode] stderr error (handled):", err.message)
        })
      }

      const timeout = setTimeout(() => {
        if (!processEnded) {
          processEnded = true
          run.kill("SIGKILL")
          reject({ error: "❌ Time Limit Exceeded (3s)", stderr: "" })
        }
      }, TIME_LIMIT)

      run.stdout.on("data", (data) => (output += data.toString()))
      run.stderr.on("data", (data) => (errorOutput += data.toString()))

      run.on("close", (code) => {
        if (processEnded) return
        processEnded = true
        clearTimeout(timeout)
        if (code !== 0) {
          return reject({
            error: "❌ Runtime Error",
            stderr: errorOutput || `Process exited with code ${code}`,
          })
        }
        resolve(output.trim())
      })

      run.on("error", (err) => {
        if (processEnded) return
        processEnded = true
        clearTimeout(timeout)
        reject({ error: "❌ Process Error", stderr: err.message })
      })

      try {
        if (run.stdin && !run.stdin.destroyed && !processEnded) {
          run.stdin.write(input)
          run.stdin.end()
        }
      } catch (err) {
        console.log("[executeCode] stdin write error (non-fatal):", err.message)
      }
    } else if (ext === ".java") {
      const className = "Main"
      exec(`javac "${filepath}"`, (compileErr, stdout, stderr) => {
        if (compileErr || stderr) {
          return reject({
            error: "❌ Compilation Error (Java)",
            stderr: stderr || compileErr.message,
          })
        }

        const run = spawn("java", ["-cp", jobDir, className])
        let output = "",
          errorOutput = ""
        let processEnded = false

        if (run.stdin) {
          run.stdin.on("error", (err) => {
            console.log("[executeCode] stdin error (handled):", err.message)
          })
        }
        if (run.stdout) {
          run.stdout.on("error", (err) => {
            console.log("[executeCode] stdout error (handled):", err.message)
          })
        }
        if (run.stderr) {
          run.stderr.on("error", (err) => {
            console.log("[executeCode] stderr error (handled):", err.message)
          })
        }

        const timeout = setTimeout(() => {
          if (!processEnded) {
            processEnded = true
            run.kill("SIGKILL")
            reject({ error: "❌ Time Limit Exceeded (3s)", stderr: "" })
          }
        }, TIME_LIMIT)

        run.stdout.on("data", (data) => (output += data.toString()))
        run.stderr.on("data", (data) => (errorOutput += data.toString()))

        run.on("close", (code) => {
          if (processEnded) return
          processEnded = true
          clearTimeout(timeout)
          if (code !== 0) {
            return reject({
              error: "❌ Runtime Error",
              stderr: errorOutput || `Process exited with code ${code}`,
            })
          }
          resolve(output.trim())
        })

        run.on("error", (err) => {
          if (processEnded) return
          processEnded = true
          clearTimeout(timeout)
          reject({ error: "❌ Process Error", stderr: err.message })
        })

        try {
          if (run.stdin && !run.stdin.destroyed && !processEnded) {
            run.stdin.write(input)
            run.stdin.end()
          }
        } catch (err) {
          console.log("[executeCode] stdin write error (non-fatal):", err.message)
        }
      })
    } else {
      reject({ error: "❌ Unsupported Language", stderr: "" })
    }
  })
}

module.exports = executeCode
