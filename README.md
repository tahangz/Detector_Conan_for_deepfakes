# Detector Conan - Deepfake Detection Platform

![Detector Conan Logo](frontend/public/favicon.svg)  (MODELS CODE WILL BE AVAILABLE SOON)


Detector Conan is an advanced deepfake detection platform that uses AI to identify manipulated images and videos. The platform provides a user-friendly interface for uploading and analyzing media files, with approximately 92% accuracy in detecting synthetic content.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Setting Up Environment Variables](#setting-up-environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [AI Models Setup](#ai-models-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Image & Video Analysis**: Detect deepfakes in both images and videos
- **User Authentication**: Secure login and registration system
- **Detection History**: Track and review past analyses
- **Dashboard**: Visualize your detection statistics
- **Profile Management**: Update user information
- **Dark/Light Mode**: Toggle between theme preferences

## 🏗️ Project Structure

The project is organized into two main directories:

- **frontend/**: React application for the user interface
- **backend/**: Node.js/Express server for API endpoints
- **DJ_API/**: Django API for AI model inference

## 🔧 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ with pip
- TensorFlow and PyTorch (for AI models)

## 🚀 Installation

### Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/detector-conan.git
cd detector-conan
\`\`\`

### Setting Up Environment Variables

1. In the `backend` directory, create a `.env` file with the following variables:

\`\`\`
MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
PORT=3000
FRONTEND_URL=http://localhost:5000
\`\`\`

Replace the MongoDB URI and JWT secret with your own values.

2. In the `DJ_API` directory, update the `deepfake_api/settings.py` file:

```python
# Update these settings
SECRET_KEY = 'your-django-secret-key'
DEBUG = False  # Set to False in production
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-domain.com']

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "https://your-domain.com",
]
