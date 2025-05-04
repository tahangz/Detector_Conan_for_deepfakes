import logging
import sys
import os
from datetime import datetime
import io
import codecs
import re

# Create logs directory if it doesn't exist
logs_dir = 'logs'
os.makedirs(logs_dir, exist_ok=True)

# Configure custom formatter
class CustomFormatter(logging.Formatter):
    """Custom formatter with colors for console output"""
    
    grey = "\x1b[38;20m"
    green = "\x1b[32;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    
    format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    FORMATS = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: green + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset
    }
    
    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt='%Y-%m-%d %H:%M:%S')
        return formatter.format(record)

# Filter for unwanted warnings
class UnwantedWarningsFilter(logging.Filter):
    """Filter out unwanted warnings from TensorFlow, PyTorch, etc."""
    
    def filter(self, record):
        message = record.getMessage()
        
        # List of patterns to filter out
        unwanted_patterns = [
            # TensorFlow warnings
            'oneDNN custom operations are on',
            'TF_ENABLE_ONEDNN_OPTS',
            'tensorflow/core/util/port.cc',
            'XLA service',
            'StreamExecutor device',
            'Compiled cluster using XLA',
            'All log messages before absl::InitializeLog()',
            'service.cc:148',
            'service.cc:156',
            'device_compiler.h:188',
            'The name tf.placeholder is deprecated',
            
            # PyTorch warnings
            'The parameter \'pretrained\' is deprecated',
            'Arguments other than a weight enum or `None` for \'weights\' are deprecated',
            'Skipping variable loading for optimizer',
            
            # Keras warnings
            'From C:\\Users\\.*\\keras\\',
            'keras\\src\\',
            
            # Other common warnings to filter
            'UserWarning:',
            'DeprecationWarning:',
            'FutureWarning:',
        ]
        
        # Return False to filter out the message if it matches any pattern
        for pattern in unwanted_patterns:
            if re.search(pattern, message):
                return False
        return True

# Windows-safe console handler
class WindowsSafeStreamHandler(logging.StreamHandler):
    def __init__(self, stream=None):
        super().__init__(stream)
        
    def emit(self, record):
        try:
            msg = self.format(record)
            stream = self.stream
            # Replace box drawing characters with ASCII alternatives for Windows
            if sys.platform == 'win32':
                msg = msg.replace('╔', '+').replace('╚', '+').replace('║', '|').replace('═', '-')
            stream.write(msg + self.terminator)
            self.flush()
        except Exception:
            self.handleError(record)

# Dictionary to track logger instances
_loggers = {}

# Create custom logger
def setup_logger(name):
    # Return existing logger if already created
    if name in _loggers:
        return _loggers[name]
    
    # Remove any existing handlers from the root logger
    root = logging.getLogger()
    if root.handlers:
        for handler in root.handlers:
            root.removeHandler(handler)
    
    # Create a new logger
    logger = logging.getLogger(name)
    
    # Remove any existing handlers
    if logger.handlers:
        for handler in logger.handlers:
            logger.removeHandler(handler)
    
    logger.setLevel(logging.INFO)
    logger.propagate = False  # Prevent propagation to avoid duplicate logs
    
    # Add filter to all handlers
    unwanted_filter = UnwantedWarningsFilter()
    
    # Console handler with colors - use Windows-safe handler
    console_handler = WindowsSafeStreamHandler(sys.stdout)
    console_handler.setFormatter(CustomFormatter())
    console_handler.addFilter(unwanted_filter)
    
    # File handler for all logs
    file_handler = logging.FileHandler(os.path.join(logs_dir, f'django-{datetime.now().strftime("%Y%m%d")}.log'), encoding='utf-8')
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    file_handler.addFilter(unwanted_filter)
    
    # Error file handler
    error_handler = logging.FileHandler(os.path.join(logs_dir, f'django-error-{datetime.now().strftime("%Y%m%d")}.log'), encoding='utf-8')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    error_handler.addFilter(unwanted_filter)
    
    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    
    # Store logger in dictionary
    _loggers[name] = logger
    
    return logger

# Custom logging methods with Windows-safe ASCII art
def log_startup(logger, host='0.0.0.0', port=8000):
    """Log server startup information"""
    if sys.platform == 'win32':
        message = f"""
+----------------------------------------------------------+
| DEEPFAKE DETECTOR API STARTED                            |
|                                                          |
| Server running at: http://{host}:{port}/                 |
|                                                          |
| API endpoints:                                           |
| - POST /api/detect/image/                                |
| - POST /api/detect/video/                                |
| - GET /api/health/                                       |
|                                                          |
| API ready to analyze media!                              |
+----------------------------------------------------------+"""
    else:
        message = f"""
╔════════════════════════════════════════════════════════════
║ DEEPFAKE DETECTOR API STARTED
║ 
║ Server running at: http://{host}:{port}/
║ 
║ API endpoints:
║ - POST /api/detect/image/
║ - POST /api/detect/video/
║ - GET /api/health/
║ 
║ API ready to analyze media!
╚════════════════════════════════════════════════════════════"""
    
    logger.info(message)

def log_analysis(logger, file_type, file_name, result):
    """Log analysis results"""
    analysis_result = "DEEPFAKE DETECTED" if result.get('isDeepfake') else "AUTHENTIC CONTENT"
    confidence = result.get('confidence', 0)
    real_percentage = result.get('realPercentage', 0)
    fake_percentage = result.get('fakePercentage', 0)
    
    if sys.platform == 'win32':
        message = f"""
+----------------------------------------------------------+
| ANALYSIS COMPLETE: {file_type.upper()}                   |
| File: {file_name}                                        |
| Result: {analysis_result}                                |
| Confidence: {confidence:.2f}%                            |
| Real: {real_percentage:.2f}% | Fake: {fake_percentage:.2f}%  |
+----------------------------------------------------------+"""
    else:
        message = f"""
╔════════════════════════════════════════════════════════════
║ ANALYSIS COMPLETE: {file_type.upper()}
║ File: {file_name}
║ Result: {analysis_result}
║ Confidence: {confidence:.2f}%
║ Real: {real_percentage:.2f}% | Fake: {fake_percentage:.2f}%
╚════════════════════════════════════════════════════════════"""
    
    logger.info(message)

# Create a global logger instance
detector_logger = setup_logger('detector')

# Also filter the root logger to suppress warnings from other libraries
root_logger = logging.getLogger()
root_logger.addFilter(UnwantedWarningsFilter())

# Suppress specific warnings from libraries
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="torchvision.models")
warnings.filterwarnings("ignore", category=UserWarning, module="keras")
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # 0=all, 1=no INFO, 2=no WARNING, 3=no ERROR
