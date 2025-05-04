#!/usr/bin/env node

// This script runs the server with improved logging
require("dotenv").config()
const path = require("path")
const fs = require("fs")

// Set environment variable to suppress TensorFlow warnings
process.env.TF_CPP_MIN_LOG_LEVEL = "2"

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

try {
  // Import modules after directories are created
  const express = require("express")
  const mongoose = require("mongoose")
  const cors = require("cors")
  const logger = require("./logger")

  // Import routes
  const authRoutes = require("./routes/auth")
  const detectionRoutes = require("./routes/detection")
  const historyRoutes = require("./routes/history")
  const userRoutes = require("./routes/user")

  // Create Express app
  const app = express()

  // Middleware
  app.use(express.json())
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  app.use(express.urlencoded({ extended: true }))

  // Custom request logger middleware
  app.use((req, res, next) => {
    // Skip logging for static files
    if (req.url.startsWith("/uploads")) {
      return next()
    }

    logger.info(`${req.method} ${req.url}`)
    next()
  })

  // Define routes
  app.use("/api/auth", authRoutes)
  app.use("/api/detection", detectionRoutes)
  app.use("/api/history", historyRoutes)
  app.use("/api/user", userRoutes)

  // Serve static files from the uploads directory
  app.use("/uploads", express.static(path.join(__dirname, "uploads")))

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error(`Server error: ${err.message}`)
    if (err.stack) {
      logger.error(err.stack)
    }
    res.status(500).json({ message: "Server error", error: err.message })
  })

  // Connect to MongoDB
  const mongoURI =
    process.env.MONGODB_URI ||
    "mongodb+srv://tahanaguez:Taha20188555013@cluster0.1u3vcmn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  const port = process.env.PORT || 3000
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000"

  mongoose
    .connect(mongoURI)
    .then(() => {
      // Start the server
      app.listen(port, () => {
        logger.startup(port, mongoURI, frontendUrl)
      })
    })
    .catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`)
      process.exit(1)
    })
} catch (error) {
  console.error("Error starting server:", error)
  process.exit(1)
}
