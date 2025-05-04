import os
import json
import logging
import traceback
import sys
import time
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models.image_model import predict_image, load_image_model, force_real_models as force_real_image_models
from .models.video_model import predict_video, load_video_model, force_real_models as force_real_video_models
from .apps import DetectorConfig
from .custom_logger import detector_logger as logger, log_analysis

# Set environment variable to suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Check if we should force real models
FORCE_REAL_MODELS = os.environ.get('FORCE_REAL_MODELS', '').lower() in ('true', '1', 'yes')
FORCE_MODEL_PERSISTENCE = os.environ.get('FORCE_MODEL_PERSISTENCE', '').lower() in ('true', '1', 'yes')

if FORCE_REAL_MODELS:
    logger.info("Forcing real models based on environment variable")
    force_real_image_models()
    force_real_video_models()

# Load models at module level if persistence is enabled
if FORCE_MODEL_PERSISTENCE:
    logger.info("Pre-loading models for persistence")
    try:
        # Load image model
        if DetectorConfig.image_model is None:
            logger.info("Pre-loading image model for persistence")
            DetectorConfig.image_model = load_image_model()
            
        # Load video model
        if DetectorConfig.video_model is None:
            logger.info("Pre-loading video model for persistence")
            DetectorConfig.video_model = load_video_model()
    except Exception as e:
        logger.error(f"Error pre-loading models: {str(e)}")

class HealthCheckView(APIView):
    """Simple health check endpoint to verify API is running"""
    
    def get(self, request):
        # Check if models are loaded
        image_model_loaded = DetectorConfig.image_model is not None
        video_model_loaded = DetectorConfig.video_model is not None
        
        # If models should be loaded but aren't, try loading them now
        if FORCE_MODEL_PERSISTENCE:
            if not image_model_loaded:
                try:
                    logger.info("Loading image model during health check")
                    DetectorConfig.image_model = load_image_model()
                    image_model_loaded = DetectorConfig.image_model is not None
                except Exception as e:
                    logger.error(f"Failed to load image model during health check: {str(e)}")
            
            if not video_model_loaded:
                try:
                    logger.info("Loading video model during health check")
                    DetectorConfig.video_model = load_video_model()
                    video_model_loaded = DetectorConfig.video_model is not None
                except Exception as e:
                    logger.error(f"Failed to load video model during health check: {str(e)}")
        
        # Check if we're using mock models
        using_mock_models = settings.AI_MODELS.get('USE_MOCK_MODELS', False)
        
        logger.info(f"Health check: Image model loaded: {image_model_loaded}, Video model loaded: {video_model_loaded}")
        logger.info(f"Using mock models: {using_mock_models}")
        
        # Check model files
        image_model_path = settings.AI_MODELS['IMAGE_MODEL_PATH']
        video_model_path = settings.AI_MODELS['VIDEO_MODEL_PATH']
        
        image_model_exists = os.path.exists(image_model_path)
        video_model_exists = os.path.exists(video_model_path)
        
        logger.info(f"Image model file exists: {image_model_exists}")
        logger.info(f"Video model file exists: {video_model_exists}")
        
        return Response({
            'status': 'ok',
            'image_model_loaded': image_model_loaded,
            'video_model_loaded': video_model_loaded,
            'using_mock_models': using_mock_models,
            'image_model_file_exists': image_model_exists,
            'video_model_file_exists': video_model_exists
        })

class ImageDetectionView(APIView):
    """API endpoint for image deepfake detection"""
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        start_time = datetime.now()
        logger.info(f"Received image detection request")
        
        try:
            # Check if we should force real models
            if FORCE_REAL_MODELS:
                force_real_image_models()
                logger.info("Forced real image model for this request")
            
            # Get the model - try to use the pre-loaded model first
            model = DetectorConfig.image_model
            
            # If model is not available, try to load it on demand
            if model is None:
                logger.warning("Image model is not loaded, attempting to load it now")
                try:
                    model = load_image_model()
                    # Update the shared model reference for future use
                    DetectorConfig.image_model = model
                    logger.info("Successfully loaded image model on-demand")
                except Exception as e:
                    logger.error(f"Failed to load image model on-demand: {str(e)}")
                    return Response(
                        {'error': 'Image detection model could not be loaded. Please check server logs.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
            
            # Get the uploaded file
            file_obj = request.FILES.get('file')
            if not file_obj:
                logger.warning("No file provided in request")
                return Response(
                    {'error': 'No file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Processing image: {file_obj.name}, Size: {file_obj.size} bytes")
            
            # Check file type
            if not file_obj.name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                logger.warning(f"Invalid file type: {file_obj.name}")
                return Response(
                    {'error': 'Invalid file type. Only PNG, JPG, JPEG, and GIF are supported'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the file temporarily
            file_path = default_storage.save(f'uploads/{file_obj.name}', ContentFile(file_obj.read()))
            file_path = os.path.join(settings.MEDIA_ROOT, file_path)
            
            logger.info(f"File saved at: {file_path}")
            
            # Make prediction
            prediction_start = datetime.now()
            logger.info(f"Starting image prediction")
            
            result = predict_image(model, file_path)
            
            prediction_end = datetime.now()
            prediction_time = (prediction_end - prediction_start).total_seconds()
            logger.info(f"Image prediction completed in {prediction_time:.2f} seconds")
            
            # Log analysis result with our custom logger
            log_analysis(logger, 'image', file_obj.name, result)
            
            # Create response
            response_data = {
                'result': result,
                'file_url': f'/media/uploads/{os.path.basename(file_path)}'
            }
            
            end_time = datetime.now()
            total_time = (end_time - start_time).total_seconds()
            logger.info(f"Image detection request completed in {total_time:.2f} seconds")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in image detection: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'An error occurred during image analysis', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VideoDetectionView(APIView):
    """API endpoint for video deepfake detection"""
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        start_time = datetime.now()
        logger.info(f"Received video detection request")
        
        try:
            # Check if we should force real models
            if FORCE_REAL_MODELS:
                force_real_video_models()
                logger.info("Forced real video model for this request")
            
            # Get the model - try to use the pre-loaded model first
            model = DetectorConfig.video_model
            
            # If model is not available, try to load it on demand
            if model is None:
                logger.warning("Video model is not loaded, attempting to load it now")
                try:
                    model = load_video_model()
                    # Update the shared model reference for future use
                    DetectorConfig.video_model = model
                    logger.info("Successfully loaded video model on-demand")
                except Exception as e:
                    logger.error(f"Failed to load video model on-demand: {str(e)}")
                    return Response(
                        {'error': 'Video detection model could not be loaded. Please check server logs.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
            
            # Get the uploaded file
            file_obj = request.FILES.get('file')
            if not file_obj:
                logger.warning("No file provided in request")
                return Response(
                    {'error': 'No file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            logger.info(f"Processing video: {file_obj.name}, Size: {file_obj.size} bytes")
            
            # Check file type
            if not file_obj.name.lower().endswith(('.mp4', '.mov', '.avi')):
                logger.warning(f"Invalid file type: {file_obj.name}")
                return Response(
                    {'error': 'Invalid file type. Only MP4, MOV, and AVI are supported'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save the file temporarily
            file_path = default_storage.save(f'uploads/{file_obj.name}', ContentFile(file_obj.read()))
            file_path = os.path.join(settings.MEDIA_ROOT, file_path)
            
            logger.info(f"File saved at: {file_path}")
            
            # Make prediction
            prediction_start = datetime.now()
            logger.info(f"Starting video prediction")
            
            result = predict_video(model, file_path)
            
            prediction_end = datetime.now()
            prediction_time = (prediction_end - prediction_start).total_seconds()
            logger.info(f"Video prediction completed in {prediction_time:.2f} seconds")
            
            # Log analysis result with our custom logger
            log_analysis(logger, 'video', file_obj.name, result)
            
            # Create response
            response_data = {
                'result': result,
                'file_url': f'/media/uploads/{os.path.basename(file_path)}'
            }
            
            end_time = datetime.now()
            total_time = (end_time - start_time).total_seconds()
            logger.info(f"Video detection request completed in {total_time:.2f} seconds")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in video detection: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'An error occurred during video analysis', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
