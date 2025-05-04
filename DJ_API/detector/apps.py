from django.apps import AppConfig
import os
import sys
from datetime import datetime

# Set environment variable to suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

class DetectorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'detector'
    
    # Class variables to store the loaded models
    image_model = None
    video_model = None
    
    def ready(self):
        # This code will be executed once when Django starts
        # Skip model loading when running management commands or when reloading in dev
        if 'runserver' not in sys.argv and 'manage.py' not in sys.argv[0]:
            return
            
        # Skip if this is a reloader thread in development
        if os.environ.get('RUN_MAIN') == 'true':
            return
            
        from django.conf import settings
        from .custom_logger import detector_logger as logger
        
        # Set up logging
        logger.info("=" * 50)
        logger.info(f"Starting DeepFake Detector API at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 50)
        
        # Create necessary directories
        os.makedirs(os.path.dirname(settings.AI_MODELS['IMAGE_MODEL_PATH']), exist_ok=True)
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'uploads'), exist_ok=True)
        
        # Check if we're using mock models
        if settings.AI_MODELS.get('USE_MOCK_MODELS', False):
            logger.warning("=" * 50)
            logger.warning("USING MOCK MODELS FOR TESTING")
            logger.warning("This is not suitable for production use!")
            logger.warning("=" * 50)
        
        # Load the image model
        try:
            logger.info("=" * 30)
            logger.info("Loading image model...")
            start_time = datetime.now()
            
            from .models.image_model import load_image_model
            DetectorConfig.image_model = load_image_model()
            
            end_time = datetime.now()
            load_time = (end_time - start_time).total_seconds()
            logger.info(f"Image model loaded successfully in {load_time:.2f} seconds.")
            logger.info("=" * 30)
        except Exception as e:
            logger.error(f"Error loading image model: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            DetectorConfig.image_model = None
        
        # Load the video model
        try:
            logger.info("=" * 30)
            logger.info("Loading video model...")
            start_time = datetime.now()
            
            from .models.video_model import load_video_model
            DetectorConfig.video_model = load_video_model()
            
            end_time = datetime.now()
            load_time = (end_time - start_time).total_seconds()
            logger.info(f"Video model loaded successfully in {load_time:.2f} seconds.")
            logger.info("=" * 30)
        except Exception as e:
            logger.error(f"Error loading video model: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            DetectorConfig.video_model = None
        
        # Log model loading status
        logger.info("=" * 50)
        logger.info(f"Image model loaded: {DetectorConfig.image_model is not None}")
        logger.info(f"Video model loaded: {DetectorConfig.video_model is not None}")
        logger.info("DeepFake Detector API is ready!")
        logger.info("=" * 50)
