import os
import cv2
import numpy as np
import time
import logging
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

# Global variables for persistence
USING_MOCK_MODEL = False
_LOADED_MODEL = None
_MODEL_LOADING_LOCK = False

# Check if torch and torchvision are available
TORCH_AVAILABLE = False
TORCHVISION_AVAILABLE = False

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
    
    try:
        from torchvision import transforms, models
        TORCHVISION_AVAILABLE = True
        logger.info("PyTorch and torchvision are available")
        
        class VideoModel(nn.Module):
            """ResNext50 + LSTM model for deepfake detection"""
            def __init__(self, num_classes=2):
                super(VideoModel, self).__init__()
                backbone = models.resnext50_32x4d(pretrained=None)
                self.model = nn.Sequential(*list(backbone.children())[:-2])
                self.lstm = nn.LSTM(2048, 2048, 1, bidirectional=False)
                self.relu = nn.LeakyReLU()
                self.dp = nn.Dropout(0.4)
                self.linear1 = nn.Linear(2048, num_classes)
                self.avgpool = nn.AdaptiveAvgPool2d(1)
            
            def forward(self, x):
                batch_size, seq_length, c, h, w = x.shape
                x = x.view(batch_size * seq_length, c, h, w)
                fmap = self.model(x)
                x = self.avgpool(fmap)
                x = x.view(batch_size, seq_length, 2048)
                x_lstm, _ = self.lstm(x)
                return fmap, self.dp(self.linear1(torch.mean(x_lstm, dim=1)))
                
    except ImportError:
        logger.warning("torchvision is not available. Using mock model instead.")
        TORCHVISION_AVAILABLE = False
        
except ImportError:
    logger.warning("PyTorch is not available. Using mock model instead.")
    TORCH_AVAILABLE = False

def load_video_model():
    """Load the PyTorch video model for deepfake detection"""
    global USING_MOCK_MODEL, _LOADED_MODEL, _MODEL_LOADING_LOCK
    
    # If model is already loaded and persistence is enabled, return it
    if os.environ.get('FORCE_MODEL_PERSISTENCE') == 'true' and _LOADED_MODEL is not None:
        logger.info("Using previously loaded video model (persistence enabled)")
        return _LOADED_MODEL
    
    # Prevent concurrent loading
    if _MODEL_LOADING_LOCK:
        logger.warning("Model loading already in progress, waiting...")
        # Wait for the other thread to complete loading
        while _MODEL_LOADING_LOCK:
            time.sleep(0.1)
        if _LOADED_MODEL is not None:
            return _LOADED_MODEL
    
    _MODEL_LOADING_LOCK = True
    
    try:
        # Check if torch and torchvision are available
        if not TORCH_AVAILABLE or not TORCHVISION_AVAILABLE:
            logger.warning("PyTorch or torchvision not available. Using mock model.")
            from .mock_models import get_mock_video_model
            USING_MOCK_MODEL = True
            _LOADED_MODEL = get_mock_video_model()
            return _LOADED_MODEL
            
        model_path = settings.AI_MODELS['VIDEO_MODEL_PATH']
        use_mock = settings.AI_MODELS.get('USE_MOCK_MODELS', False)
        
        # Force clear any cached setting
        if hasattr(load_video_model, 'use_mock_override'):
            use_mock = load_video_model.use_mock_override
        
        # Check if we should use mock models
        if use_mock:
            from .mock_models import get_mock_video_model
            logger.warning("Using mock video model as specified in settings")
            USING_MOCK_MODEL = True
            _LOADED_MODEL = get_mock_video_model()
            return _LOADED_MODEL
        
        # Check if the model file exists
        if not os.path.exists(model_path):
            logger.error(f"Video model not found at {model_path}")
            logger.error(f"Current directory: {os.getcwd()}")
            logger.error(f"Directory contents: {os.listdir(os.path.dirname(model_path) if os.path.dirname(model_path) else '.')}")
            
            # Check if we have a simple model
            simple_model_path = model_path + ".simple"
            if os.path.exists(simple_model_path):
                logger.info(f"Found simple model at {simple_model_path}, using it instead")
                model_path = simple_model_path
            else:
                # Fall back to mock model
                from .mock_models import get_mock_video_model
                logger.warning("Falling back to mock video model because real model file not found")
                USING_MOCK_MODEL = True
                _LOADED_MODEL = get_mock_video_model()
                return _LOADED_MODEL
        
        logger.info(f"Loading real video model from {model_path}")
        logger.info(f"Model file size: {os.path.getsize(model_path) / (1024 * 1024):.2f} MB")
        
        # Initialize the model
        model = VideoModel()
        
        # Load the model weights
        try:
            # Always load to CPU first, then move to appropriate device
            checkpoint = torch.load(model_path, map_location='cpu')
            
            # Handle different checkpoint formats
            if isinstance(checkpoint, dict):
                if 'state_dict' in checkpoint:
                    state_dict = checkpoint['state_dict']
                elif 'model_state_dict' in checkpoint:
                    state_dict = checkpoint['model_state_dict']
                else:
                    state_dict = checkpoint
            else:
                state_dict = checkpoint
            
            # Remove 'module.' prefix if present (from DataParallel/DistributedDataParallel)
            new_state_dict = {}
            for k, v in state_dict.items():
                name = k.replace('module.', '')
                new_state_dict[name] = v
            
            # Load the state dict
            model.load_state_dict(new_state_dict, strict=False)
            logger.info("Successfully loaded model weights")
            
            # Set model to evaluation mode
            model.eval()
            logger.info("Model set to evaluation mode")
            
            USING_MOCK_MODEL = False
            _LOADED_MODEL = model
            return _LOADED_MODEL
            
        except Exception as e:
            logger.error(f"Error loading model weights: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Fall back to mock model
            from .mock_models import get_mock_video_model
            logger.warning("Falling back to mock video model due to error loading weights")
            USING_MOCK_MODEL = True
            _LOADED_MODEL = get_mock_video_model()
            return _LOADED_MODEL
            
    except Exception as e:
        logger.error(f"Failed to load video model: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Fall back to mock model
        from .mock_models import get_mock_video_model
        logger.warning("Falling back to mock video model due to error")
        USING_MOCK_MODEL = True
        _LOADED_MODEL = get_mock_video_model()
        return _LOADED_MODEL
    finally:
        _MODEL_LOADING_LOCK = False

# Method to force use of real models
def force_real_models():
    load_video_model.use_mock_override = False
    logger.info("Forced use of real video models")

# Method to force use of mock models
def force_mock_models():
    load_video_model.use_mock_override = True
    logger.info("Forced use of mock video models")

def extract_frames(video_path, max_frames=30, uniform_sampling=True):
    """Extract frames from a video file with uniform sampling"""
    try:
        start_time = datetime.now()
        logger.info(f"Extracting frames from video: {video_path}")
        
        frames = []
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")
        
        # Get video properties
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        logger.info(f"Video properties: {total_frames} frames, {fps:.2f} FPS, {duration:.2f} seconds, {width}x{height} resolution")
        
        # Define frame indices to extract
        if uniform_sampling and total_frames > max_frames:
            indices = np.linspace(0, total_frames-1, max_frames, dtype=int)
        else:
            indices = range(min(total_frames, max_frames))
        
        logger.info(f"Extracting {len(indices)} frames with {'uniform' if uniform_sampling else 'sequential'} sampling")
        
        # Extract frames
        if TORCH_AVAILABLE and TORCHVISION_AVAILABLE:
            transform = transforms.Compose([
                transforms.ToPILImage(),
                transforms.Resize((112, 112)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            
            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frame_tensor = transform(frame)
                    frames.append(frame_tensor)
            
            cap.release()
            
            if frames:
                frames = torch.stack(frames)
                logger.info(f"Frames tensor shape: {frames.shape}")
            else:
                raise ValueError("No frames could be extracted from the video")
        else:
            # If torch/torchvision not available, just extract raw frames
            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    # Resize to 112x112
                    frame = cv2.resize(frame, (112, 112))
                    # Normalize (approximate)
                    frame = frame / 255.0
                    frames.append(frame)
            
            cap.release()
            
            if frames:
                frames = np.array(frames)
                logger.info(f"Frames array shape: {frames.shape}")
            else:
                raise ValueError("No frames could be extracted from the video")
        
        end_time = datetime.now()
        logger.info(f"Extracted {len(frames)} frames in {(end_time - start_time).total_seconds():.2f} seconds")
            
        return frames
    except Exception as e:
        logger.error(f"Error extracting frames from video: {str(e)}")
        raise

def predict_video(model, video_path):
    """Make a prediction on a video"""
    global USING_MOCK_MODEL
    
    try:
        start_time = datetime.now()
        logger.info(f"Starting prediction for video: {video_path}")
        logger.info(f"Using mock model: {USING_MOCK_MODEL}")
        
        # Extract frames from the video
        frames = extract_frames(video_path)
        
        if TORCH_AVAILABLE and TORCHVISION_AVAILABLE and not USING_MOCK_MODEL:
            # Add batch dimension
            frames = frames.unsqueeze(0)  # Shape: [1, num_frames, 3, 112, 112]
            
            logger.info(f"Prepared tensor of shape {frames.shape} for prediction")
            
            # Make prediction
            logger.info("Running model inference...")
            prediction_start = datetime.now()
            
            with torch.no_grad():
                _, output = model(frames)
                proba = torch.softmax(output, dim=1)
                
                # Get prediction and confidence
                pred_idx = proba.argmax(dim=1).item()
                confidence = proba[0][pred_idx].item()
            
            prediction_end = datetime.now()
            logger.info(f"Raw prediction value: {pred_idx}")
            logger.info(f"Confidence: {confidence:.4f}")
            logger.info(f"Inference time: {(prediction_end - prediction_start).total_seconds():.4f} seconds")
            
            # Calculate percentages
            fake_percentage = (1 - confidence) * 100 if pred_idx == 1 else confidence * 100
            real_percentage = confidence * 100 if pred_idx == 1 else (1 - confidence) * 100
            
            # Determine if it's a deepfake based on prediction
            is_deepfake = pred_idx == 0
            
            # Calculate confidence
            confidence_percentage = max(fake_percentage, real_percentage)
        else:
            # Mock prediction if torch/torchvision not available
            logger.info("Using mock prediction (torch/torchvision not available or using mock model)")
            
            # Generate random prediction
            import random
            is_deepfake = random.choice([True, False])
            confidence_percentage = random.uniform(70, 95)
            
            fake_percentage = confidence_percentage if is_deepfake else 100 - confidence_percentage
            real_percentage = 100 - fake_percentage
        
        result = {
            'isDeepfake': bool(is_deepfake),
            'realPercentage': float(real_percentage),
            'fakePercentage': float(fake_percentage),
            'confidence': float(confidence_percentage),
            'usingMockModel': USING_MOCK_MODEL or not TORCH_AVAILABLE or not TORCHVISION_AVAILABLE
        }
        
        end_time = datetime.now()
        logger.info(f"Prediction completed in {(end_time - start_time).total_seconds():.2f} seconds")
        logger.info(f"Result: {'FAKE' if is_deepfake else 'REAL'} with {confidence_percentage:.2f}% confidence")
        
        return result
    except Exception as e:
        logger.error(f"Error during video prediction: {str(e)}")
        logger.exception("Exception details:")
        
        # Return a fallback result
        import random
        is_deepfake = random.choice([True, False])
        confidence = random.uniform(50, 70)  # Lower confidence for error cases
        
        return {
            'isDeepfake': bool(is_deepfake),
            'realPercentage': float(100 - confidence if is_deepfake else confidence),
            'fakePercentage': float(confidence if is_deepfake else 100 - confidence),
            'confidence': float(confidence),
            'usingMockModel': True,
            'error': str(e)
        }
