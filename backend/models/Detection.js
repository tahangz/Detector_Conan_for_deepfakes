const mongoose = require("mongoose")

const detectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    result: {
      isDeepfake: {
        type: Boolean,
        required: true,
      },
      realPercentage: {
        type: Number,
        required: true,
      },
      fakePercentage: {
        type: Number,
        required: true,
      },
      confidence: {
        type: Number,
        required: true,
      },
    },
    filePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const Detection = mongoose.model("Detection", detectionSchema)

module.exports = Detection
