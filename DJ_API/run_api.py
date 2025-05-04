import os
import sys
import django
from django.core.management import call_command
from django.conf import settings

# Set environment variable to suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'deepfake_api.settings')

# Initialize Django
django.setup()

# Import after Django setup to avoid circular imports
from detector.custom_logger import detector_logger as logger, log_startup

def run_api():
    """Run the Django API server"""
    try:
        # Log startup information
        log_startup(logger)
        
        # Run the Django development server
        call_command('runserver', '0.0.0.0:8000')
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Error starting server: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    run_api()
