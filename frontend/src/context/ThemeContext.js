"use client"

import { createContext, useState, useContext, useEffect } from "react"

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    } else {
      // Default to dark mode as shown in screenshots
      setIsDarkMode(true)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle("dark-theme", isDarkMode)
    document.documentElement.classList.toggle("light-theme", !isDarkMode)

    // Save theme preference
    localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}
