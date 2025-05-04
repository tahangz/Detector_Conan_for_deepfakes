import numpy as np
import logging
import random
from datetime import datetime

logger = logging.getLogger(__name__)

class MockImageModel:
    """A mock image model that returns random predictions for testing"""
    
    def __init__(self):
        logger.info("Initializing mock image model")
        self.name = "MockImageModel"
    
    def __call__(self, input_tensor):
        """Simulate model prediction with random values"""
        logger.info(f"Mock image model called with input shape: {input_tensor.shape if hasattr(input_tensor, 'shape') else 'unknown'}")
        # Simulate processing time
        import time
        time.sleep(0.5)
        
        # Return a random prediction (between 0 and 1)
        # Using numpy to match the expected output format
        return np.array([[random.random()]])

class MockVideoModel:
    """A mock video model that returns random predictions for testing"""
    
    def __init__(self):
        logger.info("Initializing mock video model")
        self.name = "MockVideoModel"
    
    def __call__(self, input_tensor):
        """Simulate model prediction with random values"""
        logger.info(f"Mock video model called with input shape: {input_tensor.shape if hasattr(input_tensor, 'shape') else 'unknown'}")
        # Simulate processing time
        import time
        time.sleep(1)
        
        # Return random predictions for each frame
        if hasattr(input_tensor, 'shape') and len(input_tensor.shape) > 0:
            batch_size = input_tensor.shape[0]
        else:
            batch_size = 1
            
        return np.random.random(size=(batch_size, 1))
    
    def eval(self):
        """Mock eval method to match PyTorch model interface"""
        logger.info("Setting mock video model to eval mode")
        return self

def get_mock_image_model():
    """Return a mock image model for testing"""
    logger.warning("Using MOCK image model for predictions - not for production use!")
    return MockImageModel()

def get_mock_video_model():
    """Return a mock video model for testing"""
    logger.warning("Using MOCK video model for predictions - not for production use!")
    return MockVideoModel()
