const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const axios = require("axios")
const FormData = require("form-data")
const auth = require("../middleware/auth")
const Detection = require("../models/Detection")
const logger = require("../logger")
const router = express.Router()

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  const fileType = req.params.type

  if (fileType === "image") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  } else if (fileType === "video") {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true)
    } else {
      cb(new Error("Only video files are allowed!"), false)
    }
  } else {
    cb(new Error("Invalid file type"), false)
  }
}

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
})

// Django API URL
const DJANGO_API_URL = "http://localhost:8000/api"

// Upload and analyze file
router.post("/:type", auth, upload.single("file"), async (req, res) => {
  try {
    const fileType = req.params.type
    const username = req.user.username || req.user.id

    logger.request("POST", `/api/detection/${fileType}`, username)
    logger.info(`Processing ${fileType} upload from user: ${username}`)

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    if (fileType !== "image" && fileType !== "video") {
      return res.status(400).json({ message: "Invalid file type" })
    }

    // Generate file URL
    const fileUrl = `/uploads/${req.file.filename}`
    logger.info(`File saved at: ${req.file.path}`)

    // Create form data for Django API
    const formData = new FormData()
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })

    logger.info(`Sending ${fileType} to Django API for analysis: ${req.file.originalname}`)

    // Call Django API for analysis
    const djangoResponse = await axios.post(`${DJANGO_API_URL}/detect/${fileType}/`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Number.POSITIVE_INFINITY,
      maxBodyLength: Number.POSITIVE_INFINITY,
    })

    // Extract result from Django API response
    const analysisResult = djangoResponse.data.result

    // Log analysis result with our custom logger
    logger.analysis(fileType, req.file.originalname, analysisResult)

    // Save detection result to database
    const detection = new Detection({
      user: req.user.id,
      fileName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      result: {
        isDeepfake: analysisResult.isDeepfake,
        realPercentage: analysisResult.realPercentage,
        fakePercentage: analysisResult.fakePercentage,
        confidence: analysisResult.confidence,
      },
      filePath: req.file.path,
      fileUrl: fileUrl,
    })

    await detection.save()
    logger.info(`Detection result saved to database with ID: ${detection._id}`)

    res.status(200).json({
      message: "Analysis complete",
      detection: {
        id: detection._id,
        fileName: detection.fileName,
        fileType: detection.fileType,
        fileUrl: detection.fileUrl,
        result: detection.result,
        createdAt: detection.createdAt,
        fileSize: detection.fileSize,
      },
    })
  } catch (error) {
    logger.error(`Error in detection: ${error.message}`)
    if (error.stack) {
      logger.error(error.stack)
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
      details: error.response?.data || "No additional details",
    })
  }
})

// Get file by ID
router.get("/file/:id", auth, async (req, res) => {
  try {
    logger.request("GET", `/api/detection/file/${req.params.id}`, req.user.id)

    const detection = await Detection.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!detection) {
      return res.status(404).json({ message: "Detection not found" })
    }

    res.sendFile(detection.filePath)
  } catch (error) {
    logger.error(`Error retrieving file: ${error.message}`)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
