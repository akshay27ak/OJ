const { spawn } = require("child_process")

const LANGUAGE_IMAGES = ["oj-python:3.9", "oj-javascript:18", "oj-cpp:9", "oj-java:11", "oj-c:9"]

async function setupLanguageContainers() {
  console.log("[v0] Setting up custom language containers...")

  // Check if containers need to be built
  for (const image of LANGUAGE_IMAGES) {
    try {
      const exists = await checkImageExists(image)
      if (!exists) {
        console.log(`[v0] Image ${image} not found, building...`)
        await buildLanguageContainers()
        break
      } else {
        console.log(`[v0] Image ${image} already exists`)
      }
    } catch (error) {
      console.error(`[v0] Error checking image ${image}:`, error.message)
    }
  }
}

function checkImageExists(image) {
  return new Promise((resolve) => {
    const dockerProcess = spawn("docker", ["image", "inspect", image])

    dockerProcess.on("close", (exitCode) => {
      resolve(exitCode === 0)
    })

    dockerProcess.on("error", () => {
      resolve(false)
    })
  })
}

async function buildLanguageContainers() {
  console.log("[v0] Building language containers...")

  return new Promise((resolve, reject) => {
    const buildProcess = spawn("bash", ["./scripts/build-containers.sh"], {
      cwd: __dirname + "/..",
    })

    buildProcess.stdout.on("data", (data) => {
      console.log(`[v0] Build: ${data.toString().trim()}`)
    })

    buildProcess.stderr.on("data", (data) => {
      console.error(`[v0] Build Error: ${data.toString().trim()}`)
    })

    buildProcess.on("close", (exitCode) => {
      if (exitCode === 0) {
        console.log("[v0] All language containers built successfully")
        resolve()
      } else {
        reject(new Error(`Build failed with exit code ${exitCode}`))
      }
    })
  })
}

async function checkDockerAvailability() {
  return new Promise((resolve) => {
    const dockerProcess = spawn("docker", ["--version"])

    dockerProcess.on("close", (exitCode) => {
      resolve(exitCode === 0)
    })

    dockerProcess.on("error", () => {
      resolve(false)
    })
  })
}

module.exports = {
  setupLanguageContainers,
  checkDockerAvailability,
  buildLanguageContainers,
}
