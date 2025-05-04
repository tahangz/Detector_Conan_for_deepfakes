"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./History.css"

const History = () => {
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/history")
        setDetections(res.data)
        setLoading(false)
      } catch (error) {
        setError("Error fetching history")
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/history/${id}`)
      setDetections(detections.filter((detection) => detection._id !== id))
    } catch (error) {
      setError("Error deleting detection")
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="history-container">
      <h1 className="history-title">Detection History</h1>

      {error && <div className="history-error">{error}</div>}

      {detections.length === 0 ? (
        <div className="no-history">
          <p>No detection history found</p>
          <Link to="/" className="btn btn-primary">
            Analyze a new file
          </Link>
        </div>
      ) : (
        <div className="history-grid">
          {detections.map((detection) => (
            <div key={detection._id} className="history-card">
              <div className="history-card-image">
                {detection.fileType === "image" ? (
                  <img
                    src={`http://localhost:3000${detection.fileUrl}`}
                    alt={detection.fileName}
                    className="history-image"
                  />
                ) : (
                  <div className="video-thumbnail">
                    <video
                      src={`http://localhost:3000${detection.fileUrl}`}
                      className="history-video-preview"
                      poster="/video-thumbnail.png"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="video-info">
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
                      <span>{detection.fileName}</span>
                    </div>
                  </div>
                )}
                <button className="delete-btn" onClick={() => handleDelete(detection._id)} aria-label="Delete">
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
                </button>
              </div>

              <div className="history-card-date">{formatDate(detection.createdAt)}</div>

              <div className="history-card-filename">{detection.fileName}</div>

              <div className={`history-card-result ${detection.result.isDeepfake ? "fake" : "real"}`}>
                {detection.result.isDeepfake ? (
                  <div className="result-icon-wrapper">
                    <div className="fake-icon-circle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="fake-icon"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    </div>
                    <span>DEEPFAKE</span>
                  </div>
                ) : (
                  <div className="result-icon-wrapper">
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
                    <span>AUTHENTIC</span>
                  </div>
                )}
              </div>

              <Link to={`/detection/${detection._id}`} className="history-card-link">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
