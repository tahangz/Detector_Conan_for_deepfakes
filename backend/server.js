require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const authRoutes = require("./routes/auth")
const detectionRoutes = require("./routes/detection")
const historyRoutes = require("./routes/history")
const logger = require("./logger")

// Set environment variable to suppress TensorFlow warnings
process.env.TF_CPP_MIN_LOG_LEVEL = "2"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())
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

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/detection", detectionRoutes)
app.use("/api/history", historyRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`)
  logger.error(err.stack)
  res.status(500).json({ message: "Server error", error: err.message })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.startup(PORT, process.env.MONGODB_URI, process.env.FRONTEND_URL || "http://localhost:5000")
    app.listen(PORT, () => {
      // Server startup message is now handled by logger.startup
    })
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`)
    logger.error(err.stack)
  })
