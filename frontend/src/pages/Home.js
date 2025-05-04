"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import FileUpload from "../components/FileUpload"
import AnimatedText from "../components/AnimatedText"
import "./Home.css"

const Home = () => {
  const [activeTab, setActiveTab] = useState("image")
  const navigate = useNavigate()

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleUploadComplete = (detectionData) => {
    // Navigate to detection detail page
    navigate(`/detection/${detectionData.id}`)
  }

  const animatedWords = ["Deepfakes", "Manipulated Media", "Synthetic Content", "AI-Generated Images", "Fake Videos"]

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="main-title">
          <span>Detector</span>
          <img src="/anonymous-user.svg" alt="Detector Conan Logo" className="title-logo-icon" />
          <span>Conan</span>
        </h1>
        <div className="title-underline"></div>
        <p className="subtitle">
          Advanced technology to detect <AnimatedText words={animatedWords} speed={2000} /> with 92% accuracy
        </p>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === "image" ? "active" : ""}`} onClick={() => handleTabChange("image")}>
          Image
        </button>
        <button className={`tab ${activeTab === "video" ? "active" : ""}`} onClick={() => handleTabChange("video")}>
          Video
        </button>
      </div>

      <div className="upload-container">
        <FileUpload fileType={activeTab} onUploadComplete={handleUploadComplete} />
      </div>

      <div className="info-section">
        <div className="info-card">
          <h2>What are Deepfakes?</h2>
          <p>
            A deepfake refers to synthetic media, typically videos or images, where artificial intelligence techniques
            like deep learning are used to manipulate or superimpose existing content onto other content, often creating
            highly realistic but fabricated scenes.
          </p>
        </div>

        <div className="info-card">
          <h2>How it Works</h2>
          <p>
            Our AI-powered detection technology reveals hidden digital manipulation by identifying microscopic visual
            anomalies that escape human perception. Detector Conan uses advanced neural networks to analyze patterns and
            inconsistencies in media content with approximately 92% accuracy.
          </p>
        </div>

        <div className="info-card">
          <h2>Why Use Detector Conan?</h2>
          <p>
            In an era of increasing digital deception, verifying the authenticity of media is crucial. Our platform
            provides fast, accurate analysis to help you determine if content has been manipulated, protecting you from
            misinformation with our 92% accurate detection models.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
