const express = require("express")
const cors = require("cors")
const { DBConnection } = require("./database/db")

// Import routes
const authRoutes = require("./routes/auth")
const problemRoutes = require("./routes/problems")
const submissionRoutes = require("./routes/submissions")
const adminRoutes = require("./routes/admin")

const app = express()

// Database connection
DBConnection()

// Middleware
app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Online Judge API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      problems: "/api/problems",
      submissions: "/api/submissions",
      admin: "/api/admin",
    },
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/problems", problemRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/admin", adminRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📚 API Documentation available at http://localhost:${PORT}`)
  console.log(`🔧 Compiler service expected at ${process.env.COMPILER_SERVICE_URL || "http://localhost:3001"}`)
})
