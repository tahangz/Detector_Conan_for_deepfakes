"use client"

import { useState, useEffect } from "react"
import "./AnimatedText.css"

const AnimatedText = ({ words, speed = 2000 }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fadeOutTimeout = setTimeout(() => {
      setIsVisible(false)
    }, speed - 500)

    const changeWordTimeout = setTimeout(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
      setIsVisible(true)
    }, speed)

    return () => {
      clearTimeout(fadeOutTimeout)
      clearTimeout(changeWordTimeout)
    }
  }, [currentWordIndex, words, speed])

  return <span className={`animated-text ${isVisible ? "visible" : "hidden"}`}>{words[currentWordIndex]}</span>
}

export default AnimatedText
