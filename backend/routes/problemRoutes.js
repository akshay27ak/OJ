const express = require("express")
const authMW = require("../middleware/auth")
const router = express.Router()
const Problem = require("../models/Problem")

router.post("/", authMW, async (req, res) => {
  try {
    const { title, statement, difficulty, testCases } = req.body

    if (!(title && statement && difficulty)) {
      return res.status(400).json({ error: "Please fill all required fields" })
    }

    const problem = await Problem.create({
      title,
      statement,
      difficulty,
      createdBy: req.user._id,
      testCases: testCases || [],
    })

    res.status(201).json(problem)
  } catch (err) {
    console.error("Create Problem Error:", err)
    res.status(500).json({ error: "Failed to create problem" })
  }
})


router.get("/", async (req, res) => {
  try {
    const { createdBy } = req.query
    const query = {}

    if (createdBy) {
      query.createdBy = createdBy
    }

    const problems = await Problem.find(query).populate("createdBy", "firstname lastname email")
    res.json(problems)
  } catch (err) {
    console.error("Fetch Problems Error:", err)
    res.status(500).json({ error: "Failed to fetch problems" })
  }
})


router.get("/:id", async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).populate("createdBy", "firstname lastname email")
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" })
    }
    res.json(problem)
  } catch (err) {
    console.error("Fetch Problem Error:", err)
    res.status(500).json({ error: "Failed to fetch problem" })
  }
})


router.put("/:id", authMW, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
    if (!problem) return res.status(404).send("Problem not found")

    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only update your own problems")
    }

    Object.assign(problem, req.body)
    await problem.save()
    res.json(problem)
  } catch (err) {
    console.error("Update Problem Error:", err)
    res.status(500).json({ error: "Failed to update problem" })
  }
})


router.delete("/:id", authMW, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
    if (!problem) return res.status(404).send("Problem not found")

    if (problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only delete your own problems")
    }

    await problem.deleteOne()
    res.send("Problem deleted successfully")
  } catch (err) {
    console.error("Delete Problem Error:", err)
    res.status(500).json({ error: "Failed to delete problem" })
  }
})

module.exports = router
