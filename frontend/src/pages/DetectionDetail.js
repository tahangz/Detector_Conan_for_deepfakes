"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import "./DetectionDetail.css"

const DetectionDetail = () => {
  const { id } = useParams()
  const [detection, setDetection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDetection = async () => {
      try {
        const res = await axios.get(`/api/history/${id}`)
        setDetection(res.data)
        setLoading(false)
      } catch (error) {
        setError("Error fetching detection details")
        setLoading(false)
      }
    }

    fetchDetection()
  }, [id])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/history/${id}`)
      window.location.href = "/history"
    } catch (error) {
      setError("Error deleting detection")
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="detection-error">{error}</div>
  }

  if (!detection) {
    return <div className="detection-error">Detection not found</div>
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="detection-detail">
      <div className="detection-header">
        <Link to="/history" className="back-link">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to History
        </Link>

        <button onClick={handleDelete} className="delete-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </div>

      <h1 className="detection-title">{detection.fileName}</h1>

      <div className="detection-meta">
        <p>Analyzed on {formatDate(detection.createdAt)}</p>
        <div className={`detection-badge ${detection.result.isDeepfake ? "fake" : "real"}`}>
          <div className="result-icon-wrapper">
            {detection.result.isDeepfake ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                <span>DEEPFAKE DETECTED</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                <span>AUTHENTIC CONTENT</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="detection-media">
        {detection.fileType === "image" ? (
          <img src={`http://localhost:3000${detection.fileUrl}`} alt={detection.fileName} className="detection-image" />
        ) : (
          <div className="video-container">
            <video src={`http://localhost:3000${detection.fileUrl}`} controls className="detection-video">
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      <div className="detection-results">
        <h2>Analysis Results</h2>

        <div className="result-summary">
          <div className="result-icon">
            {detection.result.isDeepfake ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="fake-icon"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="real-icon"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
          </div>
          <div className="result-text">
            <h3>
              {detection.result.isDeepfake
                ? "This content appears to be manipulated"
                : "This content appears to be authentic"}
            </h3>
            <p>
              Our AI model has{" "}
              {detection.result.isDeepfake
                ? "detected signs of manipulation"
                : "not detected any signs of manipulation"}{" "}
              in this {detection.fileType}.
            </p>
            <p className="accuracy-badge">Analysis performed with our 92% accurate detection model</p>
          </div>
        </div>

        <div className="file-details">
          <h3>File Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">File Type:</span>
              <span className="detail-value">{detection.fileType.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">File Size:</span>
              <span className="detail-value">{formatFileSize(detection.fileSize)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Analysis Date:</span>
              <span className="detail-value">{formatDate(detection.createdAt)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Detection ID:</span>
              <span className="detail-value">{detection._id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detection-explanation">
        <h2>What This Means</h2>
        {detection.result.isDeepfake ? (
          <>
            <p>
              <strong>This content has been identified as a deepfake.</strong> Our analysis indicates that this content
              has likely been manipulated or artificially generated using AI technology.
            </p>
            <p>
              Deepfakes can be created for various purposes, including entertainment, misinformation, or fraud. It's
              important to verify the source of this content and be cautious about sharing it.
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>This content appears to be authentic.</strong> Our analysis did not detect significant signs of
              manipulation or AI-generated content.
            </p>
            <p>
              While our detection technology is advanced, we recommend verifying important content through multiple
              sources and maintaining healthy skepticism about media you encounter online.
            </p>
          </>
        )}
        <p className="disclaimer">
          <strong>Note:</strong> Our detection technology is approximately 92% accurate. Results should be considered
          alongside other verification methods for critical content.
        </p>
      </div>

      <div className="action-buttons">
        <Link to="/history" className="btn btn-secondary">
          Back to History
        </Link>
        <Link to="/" className="btn btn-primary">
          Analyze Another File
        </Link>
      </div>
    </div>
  )
}

export default DetectionDetail
