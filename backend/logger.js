const winston = require("winston")
const path = require("path")
const fs = require("fs")
const util = require("util")

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp }) => {
    // Handle objects properly
    if (typeof message === "object") {
      message = util.inspect(message, { depth: null })
    }
    return `[${timestamp}] ${level}: ${message}`
  }),
)

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
)

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  defaultMeta: { service: "deepfake-detector" },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
    // Console output with color
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
})

// Filter function to ignore specific TensorFlow warnings
const isTensorFlowWarning = (message) => {
  if (typeof message !== "string") {
    return false
  }

  const tensorflowWarnings = [
    "oneDNN custom operations are on",
    "TF_ENABLE_ONEDNN_OPTS",
    "tensorflow/core/util/port.cc",
  ]

  return tensorflowWarnings.some((warning) => message.includes(warning))
}

// Store original console methods
const originalConsoleLog = console.log
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleInfo = console.info

// Override console methods safely - Use regular function declarations, not arrow functions
console.log = () => {
  const args = Array.from(arguments)
  const message = args.map((arg) => (typeof arg === "object" ? util.inspect(arg, { depth: 2 }) : String(arg))).join(" ")

  if (!isTensorFlowWarning(message)) {
    logger.info(message)
  }
}

console.error = () => {
  const args = Array.from(arguments)
  const message = args.map((arg) => (typeof arg === "object" ? util.inspect(arg, { depth: 2 }) : String(arg))).join(" ")

  if (!isTensorFlowWarning(message)) {
    logger.error(message)
  }
}

console.warn = () => {
  const args = Array.from(arguments)
  const message = args.map((arg) => (typeof arg === "object" ? util.inspect(arg, { depth: 2 }) : String(arg))).join(" ")

  if (!isTensorFlowWarning(message)) {
    logger.warn(message)
  }
}

console.info = () => {
  const args = Array.from(arguments)
  const message = args.map((arg) => (typeof arg === "object" ? util.inspect(arg, { depth: 2 }) : String(arg))).join(" ")

  if (!isTensorFlowWarning(message)) {
    logger.info(message)
  }
}

// Add a method to log analysis events with more details
logger.analysis = (type, fileName, result) => {
  const analysisResult = result.isDeepfake ? "DEEPFAKE DETECTED" : "AUTHENTIC CONTENT"
  const confidence = result.confidence.toFixed(2)
  const realPercentage = result.realPercentage.toFixed(2)
  const fakePercentage = result.fakePercentage.toFixed(2)

  const message = `
╔════════════════════════════════════════════════════════════
║ ANALYSIS COMPLETE: ${type.toUpperCase()}
║ File: ${fileName}
║ Result: ${analysisResult}
║ Confidence: ${confidence}%
║ Real: ${realPercentage}% | Fake: ${fakePercentage}%
╚════════════════════════════════════════════════════════════`

  logger.info(message)
}

// Add a method for server startup
logger.startup = (port, mongodbUri, frontendUrl) => {
  const message = `
╔════════════════════════════════════════════════════════════
║ DEEPFAKE DETECTOR SERVER STARTED
║ 
║ Server running on port: ${port}
║ Frontend URL: ${frontendUrl}
║ MongoDB connected successfully
║ 
║ API endpoints:
║ - POST /api/detection/image
║ - POST /api/detection/video
║ - GET /api/history
║ - GET /api/history/:id
║ - DELETE /api/history/:id
║ - GET /api/user/profile
║ - PUT /api/user/profile
║ - GET /api/stats
║ - GET /api/detection/file/:id
║ 
║ Server ready to detect deepfakes!
╚════════════════════════════════════════════════════════════`

  logger.info(message)
}

// Add a method to log HTTP requests
logger.request = (method, url, userId = null) => {
  const userInfo = userId ? `[User: ${userId}]` : ""
  logger.info(`${method} ${url} ${userInfo}`)
}

module.exports = logger
