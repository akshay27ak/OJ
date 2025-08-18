const express = require("express")
const authMW = require("../middleware/auth")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")


router.post("/heartbeat", authMW, async (req, res) => {
  try {
    const user = req.user
    const today = new Date().toISOString().split("T")[0]
    const currentMinutes = user.timeSpent.get(today) || 0

    user.timeSpent.set(today, currentMinutes + 1)
    await user.save()

    res.status(200).json({ success: true, message: "Heartbeat recorded." })
  } catch (error) {
    console.error("Heartbeat error:", error)
    res.status(500).json({ error: "Failed to record heartbeat" })
  }
})

router.get("/me", authMW, async (req, res) => {
  try {
    const user = req.user

    res.status(200).json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      timeSpent: Object.fromEntries(user.timeSpent || []), 
    })
  } catch (error) {
    console.error("Fetch profile error:", error)
    res.status(500).json({ error: "Failed to fetch user data" })
  }
})

router.post("/change-password", authMW, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new passwords are required" })
    }

    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedNewPassword
    await user.save()

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ error: "Failed to change password" })
  }
})

module.exports = router
