const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

// ✅ POST /api/user/heartbeat - Track 1 minute of time spent today
router.post("/heartbeat", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split("T")[0];
    const currentMinutes = user.timeSpent.get(today) || 0;

    user.timeSpent.set(today, currentMinutes + 1);
    await user.save();

    res.status(200).json({ success: true, message: "Heartbeat recorded." });
  } catch (error) {
    console.error("Heartbeat error:", error);
    res.status(500).json({ error: "Failed to record heartbeat" });
  }
});

// ✅ GET /api/user/me - Return profile & timeSpent
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      timeSpent: Object.fromEntries(user.timeSpent || []), // convert Map to plain object
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

module.exports = router;
