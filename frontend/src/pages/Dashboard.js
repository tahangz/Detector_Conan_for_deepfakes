"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import "./Dashboard.css"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentDetections, setRecentDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/user/stats")
        setStats(res.data.stats)
        setRecentDetections(res.data.recentDetections)
        setLoading(false)
      } catch (error) {
        setError("Error fetching dashboard data")
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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

  if (error) {
    return <div className="dashboard-error">{error}</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Dashboard</h1>
        <div className="dashboard-welcome">
          Welcome back, <span className="username">{user?.username}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon total-icon">
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
              <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path>
              <path d="M12 12H3"></path>
              <path d="M16 6H3"></path>
              <path d="M12 18H3"></path>
              <circle cx="17" cy="15" r="3"></circle>
              <path d="m21 19-1.9-1.9"></path>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalDetections}</div>
            <div className="stat-label">Total Analyses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon image-icon">
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.imageDetections}</div>
            <div className="stat-label">Image Analyses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon video-icon">
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
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.videoDetections}</div>
            <div className="stat-label">Video Analyses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon fake-icon">
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
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.deepfakeDetections}</div>
            <div className="stat-label">Deepfakes Found</div>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2 className="section-title">Recent Detections</h2>
          {recentDetections.length === 0 ? (
            <div className="no-data">
              <p>No detection history found</p>
              <Link to="/" className="btn btn-primary">
                Analyze a new file
              </Link>
            </div>
          ) : (
            <div className="recent-detections">
              {recentDetections.map((detection) => (
                <div key={detection._id} className="detection-item">
                  <div className="detection-type">
                    {detection.fileType === "image" ? (
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
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    ) : (
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
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    )}
                  </div>
                  <div className="detection-info">
                    <div className="detection-name">{detection.fileName}</div>
                    <div className="detection-date">{formatDate(detection.createdAt)}</div>
                  </div>
                  <div className={`detection-result ${detection.result.isDeepfake ? "fake" : "real"}`}>
                    {detection.result.isDeepfake ? (
                      <div className="result-icon-wrapper">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
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
                        <span>FAKE</span>
                      </div>
                    ) : (
                      <div className="result-icon-wrapper">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
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
                        <span>REAL</span>
                      </div>
                    )}
                  </div>
                  <Link to={`/detection/${detection._id}`} className="detection-link">
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
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 16 16 12 12 8"></polyline>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="section-footer">
            <Link to="/history" className="view-all-link">
              View All History
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
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Detection Summary</h2>
          <div className="summary-chart">
            <div className="chart-bar">
              <div className="bar-label">Images</div>
              <div className="bar-container">
                <div
                  className="bar-fill image-bar"
                  style={{
                    width: `${stats.totalDetections > 0 ? (stats.imageDetections / stats.totalDetections) * 100 : 0}%`,
                  }}
                ></div>
                <div className="bar-value">{stats.imageDetections}</div>
              </div>
            </div>
            <div className="chart-bar">
              <div className="bar-label">Videos</div>
              <div className="bar-container">
                <div
                  className="bar-fill video-bar"
                  style={{
                    width: `${stats.totalDetections > 0 ? (stats.videoDetections / stats.totalDetections) * 100 : 0}%`,
                  }}
                ></div>
                <div className="bar-value">{stats.videoDetections}</div>
              </div>
            </div>
            <div className="chart-bar">
              <div className="bar-label">Deepfakes</div>
              <div className="bar-container">
                <div
                  className="bar-fill fake-bar"
                  style={{
                    width: `${stats.totalDetections > 0 ? (stats.deepfakeDetections / stats.totalDetections) * 100 : 0}%`,
                  }}
                ></div>
                <div className="bar-value">{stats.deepfakeDetections}</div>
              </div>
            </div>
            <div className="chart-bar">
              <div className="bar-label">Authentic</div>
              <div className="bar-container">
                <div
                  className="bar-fill real-bar"
                  style={{
                    width: `${
                      stats.totalDetections > 0
                        ? ((stats.totalDetections - stats.deepfakeDetections) / stats.totalDetections) * 100
                        : 0
                    }%`,
                  }}
                ></div>
                <div className="bar-value">{stats.totalDetections - stats.deepfakeDetections}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/" className="btn btn-primary">
          Analyze New File
        </Link>
        <Link to="/profile" className="btn btn-secondary">
          Edit Profile
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
