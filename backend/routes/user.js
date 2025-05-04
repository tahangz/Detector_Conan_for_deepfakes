const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../models/User")
const Detection = require("../models/Detection")
const logger = require("../logger")

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get detection stats
    const detectionCount = await Detection.countDocuments({ user: req.user.id })
    const imageCount = await Detection.countDocuments({ user: req.user.id, fileType: "image" })
    const videoCount = await Detection.countDocuments({ user: req.user.id, fileType: "video" })
    const deepfakeCount = await Detection.countDocuments({
      user: req.user.id,
      "result.isDeepfake": true,
    })

    res.json({
      user,
      stats: {
        totalDetections: detectionCount,
        imageDetections: imageCount,
        videoDetections: videoCount,
        deepfakeDetections: deepfakeCount,
      },
    })
  } catch (error) {
    logger.error(`Error getting user profile: ${error.message}`)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { username, email } = req.body

    // Build user object
    const userFields = {}
    if (username) userFields.username = username
    if (email) userFields.email = email

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, { $set: userFields }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    logger.info(`User profile updated: ${user._id}`)
    res.json(user)
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user stats
router.get("/stats", auth, async (req, res) => {
  try {
    // Get detection stats
    const detectionCount = await Detection.countDocuments({ user: req.user.id })
    const imageCount = await Detection.countDocuments({ user: req.user.id, fileType: "image" })
    const videoCount = await Detection.countDocuments({ user: req.user.id, fileType: "video" })
    const deepfakeCount = await Detection.countDocuments({
      user: req.user.id,
      "result.isDeepfake": true,
    })

    // Get recent detections
    const recentDetections = await Detection.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5)

    res.json({
      stats: {
        totalDetections: detectionCount,
        imageDetections: imageCount,
        videoDetections: videoCount,
        deepfakeDetections: deepfakeCount,
      },
      recentDetections,
    })
  } catch (error) {
    logger.error(`Error getting user stats: ${error.message}`)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
