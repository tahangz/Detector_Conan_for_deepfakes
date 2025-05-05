# Detector Conan - Deepfake Detection Platform

![Detector Conan Logo](frontend/public/favicon.svg)  (MODELS CODE WILL BE AVAILABLE SOON)


Detector Conan is an advanced deepfake detection platform (developed with MERN-Stack + Django for API) that uses AI to identify manipulated images and videos. The platform provides a user-friendly interface for uploading and analyzing media files, with approximately 92% accuracy in detecting synthetic content.
Using: XceptionNet + Vit for images analysis and ResNeXt 50 + LSTM for videos analysis 


<p align="center">
  <img src="Screenshot 2025-05-05 014534.png" alt="Sample Gesture" width="800"/>
</p>

# 🏗️ High level overview of XceptionNet + Vit Architecture & Workflow
<p align="center">
  <img src="Screenshot 2025-05-05 013244.png" alt="Sample Gesture" width="400"/>
</p>

# 🏗️ High level overview of ResNeXt + LSTM Architecture & Workflow
<p align="center">
  <img src="Screenshot 2025-05-05 013331.png" alt="Sample Gesture" width="400"/>
  <img src="Screenshot 2025-05-05 013347.png" alt="Sample Gesture" width="400"/>
</p>


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
git clone https://github.com/tahangz/Detector_Conan_for_deepfakes
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
```
<CodeProject id="deepfake-detector">
## 🏗️ Backend Setup

1. **Install Node.js dependencies:**

    ```bash
    cd backend
    npm install
    ```

2. **Create necessary directories:**

    ```bash
    mkdir -p uploads logs
    ```

3. **Start the backend server:**

    ```bash
    npm start
    ```

    Alternatively, for development with auto-restart:

    ```bash
    npm run dev
    ```

    The server will run on [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Frontend Setup

1. **Install React dependencies:**

    ```bash
    cd frontend
    npm install
    ```

2. **Configure the start script in `package.json`:**

   - **Windows**:
     ```json
     "scripts": {
       "start": "set PORT=5000 && react-scripts start",
       ...
     }
     ```
   - **macOS / Linux**:
     ```json
     "scripts": {
       "start": "PORT=5000 react-scripts start",
       ...
     }
     ```

3. **Start the frontend development server:**

    ```bash
    npm start
    ```

    The application will be available at [http://localhost:5000](http://localhost:5000).

---

## 🤖 AI Models Setup

1. **Create the AI models directory in the Django API:**

    ```bash
    mkdir -p DJ_API/ai_models
    ```

2. **Place your AI models in the directory:**
   - Image model: `DJ_API/ai_models/face_detection.keras`  
   - Video model: `DJ_API/ai_models/video_model.pth`

3. **Update the Django settings to use real models**  
   In `DJ_API/deepfake_api/settings.py`, modify:
    ```python
    # AI model paths
    AI_MODELS = {
        'IMAGE_MODEL_PATH': os.path.join(BASE_DIR, 'ai_models', 'face_detection.keras'),
        'VIDEO_MODEL_PATH': os.path.join(BASE_DIR, 'ai_models', 'video_model.pth'),
        'USE_MOCK_MODELS': False,  # Change this to False to use real models
    }
    ```

4. **Install Python dependencies:**

    ```bash
    cd DJ_API
    pip install -r requirements.txt
    ```

5. **Run the Django API:**

    ```bash
    python run_api.py
    ```

    The Django API will run on [http://localhost:8000](http://localhost:8000).
</CodeProject>
