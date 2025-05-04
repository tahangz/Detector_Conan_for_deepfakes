"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Set up axios defaults
  useEffect(() => {
    // Set base URL for axios
    axios.defaults.baseURL = "http://localhost:3000"

    // Enable credentials for cross-origin requests
    axios.defaults.withCredentials = false

    // Set up response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message)
        if (error.response && error.response.status === 401) {
          // Clear token and user data on unauthorized
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
          setUser(null)
          setIsAuthenticated(false)
        }
        return Promise.reject(error)
      },
    )

    // Set token from localStorage if it exists
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          // Set default headers for all axios requests
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

          // Get user data
          const res = await axios.get("/api/auth/user")
          setUser(res.data)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Authentication error:", error.response?.data || error.message)
        // Clear localStorage on error
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      }

      setLoading(false)
    }

    checkLoggedIn()
  }, [])

  // Register user
  const register = async (formData) => {
    try {
      console.log("Registering user:", formData.username)
      const res = await axios.post("/api/auth/register", formData)

      // Set token in localStorage
      localStorage.setItem("token", res.data.token)

      // Set default headers for all axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`

      setUser(res.data.user)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  // Login user
  const login = async (formData) => {
    try {
      console.log("Logging in user:", formData.username)
      const res = await axios.post("/api/auth/login", formData)

      console.log("Login response:", res.data)

      // Set token in localStorage
      localStorage.setItem("token", res.data.token)

      // Set default headers for all axios requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`

      setUser(res.data.user)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message)
      return {
        success: false,
        message: error.response?.data?.message || "Invalid username or password",
      }
    }
  }

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token")

    // Remove default headers
    delete axios.defaults.headers.common["Authorization"]

    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
