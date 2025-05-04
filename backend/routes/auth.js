const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    console.log("Register request for:", username, email)

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      })
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
    })

    await newUser.save()

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    console.log("Login attempt for user:", username)

    // Find user
    const user = await User.findOne({ username })
    if (!user) {
      console.log("User not found:", username)
      return res.status(400).json({ message: "Invalid username or password" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    console.log("Password match:", isMatch)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "7d" })

    console.log("Login successful for:", username)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get current user
router.get("/user", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
