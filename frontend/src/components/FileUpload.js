"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import "./FileUpload.css"

const FileUpload = ({ fileType, onUploadComplete }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError("")
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      fileType === "image" ? { "image/*": [".png", ".jpg", ".jpeg", ".gif"] } : { "video/*": [".mp4", ".mov", ".avi"] },
    maxSize: fileType === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024, // 10MB for images, 50MB for videos
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError("")
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post(`/api/detection/${fileType}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUploading(false)
      setResult(response.data.detection)

      if (onUploadComplete) {
        onUploadComplete(response.data.detection)
      }
    } catch (error) {
      setUploading(false)
      setError(error.response?.data?.message || "Error uploading file")
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError("")
  }

  return (
    <div className="file-upload">
      {!result && (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""} ${file ? "has-file" : ""}`}>
          <input {...getInputProps()} />

          {file ? (
            <div className="file-preview">
              {fileType === "image" ? (
                <img src={URL.createObjectURL(file) || "/placeholder.svg"} alt="Preview" className="preview-image" />
              ) : (
                <div className="video-preview">
                  <video src={URL.createObjectURL(file)} controls className="preview-video">
                    Your browser does not support the video tag.
                  </video>
                  <div className="video-file-name">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    <span>{file.name}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="upload-message">
              {isDragActive ? (
                <>
                  <div className="upload-icon pulse">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <p className="drag-text">Drop your file here</p>
                </>
              ) : (
                <>
                  <div className="upload-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <p className="upload-text">Drag & drop your {fileType} here</p>
                  <p className="upload-or">- OR -</p>
                  <button className="browse-button">Browse Files</button>
                  <p className="file-types">
                    {fileType === "image" ? "PNG, JPG, GIF up to 10MB" : "MP4, MOV, AVI up to 50MB"}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {file && !result && (
        <div className="file-info">
          <p>
            Selected file: <span className="file-name">{file.name}</span>
          </p>
          <p>
            Size: <span className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {result ? (
        <div className="result-container">
          <div className={`result-banner ${result.result.isDeepfake ? "fake" : "real"}`}>
            <div className="result-icon">
              {result.result.isDeepfake ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
            </div>
            <div className="result-text">
              <h3>{result.result.isDeepfake ? "DEEPFAKE DETECTED" : "AUTHENTIC CONTENT"}</h3>
              <p>
                {result.result.isDeepfake
                  ? "This content appears to be manipulated or AI-generated."
                  : "This content appears to be authentic."}
              </p>
              <p className="accuracy-note">Analysis performed with our 92% accurate detection model</p>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              Analyze Another File
            </button>
            <button className="btn btn-primary" onClick={() => onUploadComplete(result)}>
              View Detailed Analysis
            </button>
          </div>
        </div>
      ) : (
        <div className="analyze-button-container">
          <button
            className={`analyze-btn ${uploading || !file ? "btn-disabled" : ""}`}
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUpload
