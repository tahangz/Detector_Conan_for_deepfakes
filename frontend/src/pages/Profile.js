"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import "./Profile.css"

const Profile = () => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  })
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/user/profile")
        setProfile(res.data.user)
        setStats(res.data.stats)
        setFormData({
          username: res.data.user.username,
          email: res.data.user.email,
        })
        setLoading(false)
      } catch (error) {
        setError("Error fetching profile data")
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.put("/api/user/profile", formData)
      setProfile(res.data)
      setEditMode(false)
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error) {
      setError("Error updating profile")
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="profile-error">{error}</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">User Profile</h1>
        {!editMode && (
          <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {updateSuccess && <div className="update-success">Profile updated successfully!</div>}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            {editMode ? (
              <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-avatar">
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
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="profile-details">
                  <div className="profile-field">
                    <span className="field-label">Username:</span>
                    <span className="field-value">{profile.username}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Email:</span>
                    <span className="field-value">{profile.email}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">Member Since:</span>
                    <span className="field-value">
                      {new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="stats-card">
          <h2>Your Activity</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.totalDetections}</div>
              <div className="stat-label">Total Detections</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.imageDetections}</div>
              <div className="stat-label">Image Analyses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.videoDetections}</div>
              <div className="stat-label">Video Analyses</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.deepfakeDetections}</div>
              <div className="stat-label">Deepfakes Found</div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <Link to="/dashboard" className="btn btn-primary">
          View Dashboard
        </Link>
        <Link to="/history" className="btn btn-secondary">
          View History
        </Link>
      </div>
    </div>
  )
}

export default Profile
