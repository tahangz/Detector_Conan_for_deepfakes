from django.urls import path
from .views import ImageDetectionView, VideoDetectionView, HealthCheckView

urlpatterns = [
    path('detect/image/', ImageDetectionView.as_view(), name='detect_image'),
    path('detect/video/', VideoDetectionView.as_view(), name='detect_video'),
    path('health/', HealthCheckView.as_view(), name='health_check'),
]
