from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet,
    CameraViewSet,
    register_user,
    login_user,
    logout_user,
    camera_stream,
    camera_detection,
    camera_detection_history,
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'cameras', CameraViewSet, basename='camera')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/logout/', logout_user, name='logout'),

    # MJPEG stream (must be before router — bypasses DRF Accept negotiation)
    path('cameras/<int:pk>/stream/', camera_stream, name='camera-stream'),
    path('cameras/<int:pk>/detection/', camera_detection, name='camera-detection'),
    path('cameras/<int:pk>/detection-history/', camera_detection_history, name='camera-detection-history'),

    # Resource endpoints
    path('', include(router.urls)),
]
