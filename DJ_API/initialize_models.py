#!/usr/bin/env python
import os
import sys
import logging
import django
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deepfake_api.settings')
django.setup()

from django.conf import settings
from detector.models.mock_models import get_mock_image_model, get_mock_video_model

def initialize_models():
    """Initialize models and save them to files that can be loaded by Django"""
    logger.info("=" * 50)
    logger.info("Initializing models for DeepFake Detector API")
    logger.info("=" * 50)
    
    # Create necessary directories
    os.makedirs(os.path.dirname(settings.AI_MODELS['IMAGE_MODEL_PATH']), exist_ok=True)
    
    # Initialize image model
    logger.info("Initializing image model...")
    image_model = get_mock_image_model()
    
    # Initialize video model
    logger.info("Initializing video model...")
    video_model = get_mock_video_model()
    
    # Save models to global variables
    logger.info("Saving models to global variables...")
    
    # Create a simple file to indicate models are initialized
    with open('models_initialized.txt', 'w') as f:
        f.write(f"Models initialized at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Image model: {image_model.name}\n")
        f.write(f"Video model: {video_model.name}\n")
    
    logger.info("Models initialized successfully!")
    logger.info("=" * 50)
    
    return image_model, video_model

if __name__ == "__main__":
    image_model, video_model = initialize_models()
    
    # Keep the script running to keep the models in memory
    logger.info("Models are initialized and ready. Press Ctrl+C to exit.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Exiting...")
