const express = require("express")
const auth = require("../middleware/auth")
const Detection = require("../models/Detection")
const router = express.Router()

// Get user's detection history
router.get("/", auth, async (req, res) => {
  try {
    const detections = await Detection.find({ user: req.user.id }).sort({ createdAt: -1 })

    res.json(detections)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get specific detection by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!detection) {
      return res.status(404).json({ message: "Detection not found" })
    }

    res.json(detection)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete detection
router.delete("/:id", auth, async (req, res) => {
  try {
    const detection = await Detection.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!detection) {
      return res.status(404).json({ message: "Detection not found" })
    }

    res.json({ message: "Detection deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
