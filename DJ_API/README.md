# DeepFake Detector API

This Django REST API provides endpoints for detecting deepfakes in images and videos.

## Setup

1. Create a virtual environment:
   \`\`\`
   python -m venv venv
   \`\`\`

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

4. Place your AI models in the `ai_models` directory:
   - Image model: `ai_models/face_detection.keras`
   - Video model: `ai_models/video_model.pth`

5. Run migrations:
   \`\`\`
   python manage.py migrate
   \`\`\`

6. Start the server:
   \`\`\`
   python manage.py runserver 0.0.0.0:8000
   \`\`\`

## Running with Test Models

If you don't have the actual AI models, you can run the API with test models:

1. On Linux/Mac:
   \`\`\`
   bash run_with_test_models.sh
   \`\`\`

2. On Windows:
   \`\`\`
   run_with_test_models.bat
   \`\`\`

This will create simple test models and start the API with mock predictions.

## API Endpoints

- `GET /api/health/`: Check if the API is running and models are loaded
- `POST /api/detect/image/`: Detect deepfakes in images
- `POST /api/detect/video/`: Detect deepfakes in videos

## Configuration

You can configure the API in `deepfake_api/settings.py`:

- `AI_MODELS`: Paths to the AI models
- `USE_MOCK_MODELS`: Set to `True` to use mock models for testing
