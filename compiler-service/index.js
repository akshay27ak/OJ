const express = require("express")
const cors = require("cors")
const generateFile = require("./generateFile")
const executeCode = require("./executeCode")
const generateAiResponse = require("./generateAiResponse")

const app = express()
const PORT = process.env.PORT || 8080

// ✅ CORS setup for both local dev and production
const allowedOrigins = [
  "http://localhost:8080", // local frontend
  "https://oj-kappa.vercel.app/", // Updated for new app name
  "https://oj-nivt.onrender.com/", // Add your Render backend URL
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      } else {
        return callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Health route
app.get("/", (req, res) => {
  res.send("⚙️ Verdiq Compiler Service Running")
})

// 🔁 Run Code API
app.post("/run", async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body

  if (!code) {
    return res.status(400).json({ success: false, error: "Code is required" })
  }

  try {
    const filePath = await generateFile(language, code)
    const output = await executeCode(filePath, input)
    return res.json({ success: true, filePath, output })
  } catch (err) {
    return res.status(200).json({
      success: false,
      error: err.error || "Compilation or Runtime error",
      stderr: err.stderr || "",
      output: "",
    })
  }
})

// ✅ Submit API
app.post("/submit", async (req, res) => {
  const { language = "cpp", code, input = "", expectedOutput = "" } = req.body

  if (!code || !input || !expectedOutput) {
    return res.status(400).json({ success: false, error: "Code, input, and expected output are required" })
  }

  try {
    const filePath = await generateFile(language, code)
    const actualOutput = await executeCode(filePath, input)
    const isCorrect = actualOutput.trim() === expectedOutput.trim()

    return res.json({
      success: true,
      isCorrect,
      actualOutput,
      error: isCorrect ? "" : "❌ Output mismatch",
      stderr: "",
    })
  } catch (err) {
    return res.status(200).json({
      success: false,
      error: err.error || "Compilation or Runtime error",
      stderr: err.stderr || "",
      actualOutput: "",
      isCorrect: false,
    })
  }
})

// 🤖 AI Review API
app.post("/ai-review", async (req, res) => {
  const { code, language = "cpp" } = req.body

  if (!code) {
    return res.status(400).json({ success: false, error: "Code is required for AI review" })
  }

  try {
    const aiFeedback = await generateAiResponse(code)
    if (!aiFeedback) {
      return res.status(500).json({ success: false, error: "AI feedback generation failed" })
    }

    return res.json({ success: true, aiFeedback })
  } catch (err) {
    console.error("AI Review Error:", err.message)
    return res.status(500).json({ success: false, error: "AI Review failed" })
  }
})

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Verdiq Compiler server running on port ${PORT}`)
})
