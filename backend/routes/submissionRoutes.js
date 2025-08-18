const express = require("express")
const authMW = require("../middleware/auth")
const router = express.Router()
const Submission = require("../models/Submission")

router.post("/", authMW, async (req, res) => {
  try {
    const { problemId, code, language, verdict, executionTime, memoryUsed } = req.body

    if (!(problemId && code && language && verdict)) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const submission = await Submission.create({
      userId: req.user._id,
      problemId,
      code,
      language,
      verdict,
      executionTime: executionTime || 0,
      memoryUsed: memoryUsed || 0,
    })

    res.status(201).json(submission)
  } catch (err) {
    console.error("Create Submission Error:", err)
    res.status(500).json({ error: "Failed to create submission" })
  }
})

router.get("/", authMW, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user._id })
      .populate("problemId", "title difficulty")
      .sort({ submittedAt: -1 })

    res.json(submissions)
  } catch (err) {
    console.error("Fetch Submissions Error:", err)
    res.status(500).json({ error: "Failed to fetch submissions" })
  }
})

module.exports = router
