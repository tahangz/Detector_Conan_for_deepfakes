# Detector Conan - Deepfake Detection Platform

![Detector Conan Logo](frontend/public/favicon.svg)  
(Video model CODE WILL BE AVAILABLE SOON)

Image model notebook link : ([Hybrid_Xception_ViT_V2.ipynb](https://colab.research.google.com/drive/1sxC-XU0e4o1uWhujCntx8RzVYCUdF6iA?usp=sharing))


Detector Conan is an advanced deepfake detection platform (developed with MERN-Stack + Django for AI API) that uses AI to identify manipulated images and videos. The platform provides a user-friendly interface for uploading and analyzing media files, with approximately 92% accuracy in detecting synthetic content.
Using: XceptionNet + Vit for images analysis and ResNeXt 50 + LSTM for videos analysis 


<p align="center">
  <img src="Screenshot 2025-05-05 014534.png" alt="Sample Gesture" width="900"/>
</p>



# 🏗️ High level overview of XceptionNet + Vit Architecture & Workflow
<p align="center">
  <img src="Screenshot 2025-05-05 013244.png" alt="Sample Gesture" width="500"/>
</p>

# 🏗️ High level overview of ResNeXt + LSTM Architecture & Workflow
<p align="center">
  <img src="Screenshot 2025-05-05 013331.png" alt="Sample Gesture" width="400"/>
  <img src="Screenshot 2025-05-05 013347.png" alt="Sample Gesture" width="400"/>
</p>

<p align="center">
  <img src="Screenshot 2025-05-22 214831.png" alt="Sample Gesture" width="600"/>
</p>

## 👥 Contributors

- [@tahangz](https://github.com/tahangz)
- [@Najemeddinebessaoud](https://github.com/Najemeddinebessaoud) 

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

    ```bash
    cd backend
    npm install
    
    mkdir -p uploads logs
    
    npm start

    npm run dev
    ````

  The server will run on [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Frontend Setup

1. **Install React dependencies:**

    ```bash
    cd frontend
    npm install
    ```

2. **Configure the start script in `package.json`:**

     ```json
     "scripts": {
       "start": "set PORT=5000 && react-scripts start",
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


## 🔍 Detailed Model Setup

### Image Model (XceptionNet + ViT)

1. Download the pre-trained image model (will be available soon)  
2. Place the model file in `DJ_API/ai_models/face_detection.keras`  
3. The model expects input images of size **224×224** pixels in RGB format  

### Video Model (ResNeXt-50 + LSTM)

1. Download the pre-trained video model (will be available soon)  
2. Place the model file in `DJ_API/ai_models/video_model.pth`  
3. The model processes video frames at **112×112** pixels  

### Switching from Mock to Real Models

By default, the system uses mock models for testing. To switch to real models:

1. Ensure your model files are in the correct locations (see above)  
2. Open `DJ_API/deepfake_api/settings.py`  
3. Find the `AI_MODELS` dictionary and set in settings:
   ```python
   'USE_MOCK_MODELS': False
4. Restart the Django API server

If you encounter any issues with model loading, check the Django logs at `DJ_API/logs/`.


## 📝 Usage

1. Register a new account or log in with existing credentials
2. Choose between image or video analysis
3. Upload your file for analysis
4. View the detection results and detailed analysis
5. Check your history and dashboard for past analyses



## 🔌 API Endpoints

### Backend API (Node.js/Express)

- **Authentication**

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in a user
- `GET /api/auth/user`: Get current user



- **Detection**

- `POST /api/detection/image`: Analyze an image
- `POST /api/detection/video`: Analyze a video
- `GET /api/detection/file/:id`: Get a specific file



- **History**

- `GET /api/history`: Get user's detection history
- `GET /api/history/:id`: Get specific detection
- `DELETE /api/history/:id`: Delete a detection



- **User**

- `GET /api/user/profile`: Get user profile
- `PUT /api/user/profile`: Update user profile
- `GET /api/user/stats`: Get user statistics





### Django API

- `POST /api/detect/image/`: Detect deepfakes in images
- `POST /api/detect/video/`: Detect deepfakes in videos
- `GET /api/health/`: Check API health


## 🛠️ Technologies Used

- **Frontend**: React, React Router, Axios, CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **AI API**: Django, TensorFlow, PyTorch, OpenCV
- **AI Models**: XceptionNet, Vision Transformer (ViT), ResNeXt-50, LSTM



## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**  
   - Verify your MongoDB URI in the `.env` file  
   - Ensure your IP address is whitelisted in MongoDB Atlas  

2. **Model Loading Errors**  
   - Check if the model files exist in the correct location  
   - Verify that TensorFlow and PyTorch are properly installed  
   - Look at the Django logs for specific error messages  

3. **CORS Issues**  
   - Ensure the frontend URL is correctly set in Django's CORS settings  
   - Check that the backend URL is correctly set in the frontend's axios configuration  

4. **File Upload Problems**  
   - Verify that the `uploads` directory exists in the backend  
   - Check file size limits in both frontend and backend  


### Running in Production

For production deployment:

1. Set `DEBUG = False` in Django settings
2. Use a production-ready server like Gunicorn for Django
3. Set up proper environment variables for production
4. Consider using a reverse proxy like Nginx

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
