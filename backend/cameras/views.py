from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import StreamingHttpResponse, Http404, JsonResponse
from .models import Location, Camera, DetectionLog
from .serializers import LocationSerializer, CameraSerializer, DetectionLogSerializer
from .stream_manager import stream_manager, PLAYBACK_FPS
import time


def _authenticate_stream_request(request):
    token_key = request.GET.get('token')
    if token_key:
        try:
            return Token.objects.get(key=token_key).user
        except Token.DoesNotExist:
            return None
    if request.user and request.user.is_authenticated:
        return request.user
    return None


def camera_stream(request, pk):
    """MJPEG proxy — plain Django view so <img> Accept: image/* works."""
    user = _authenticate_stream_request(request)
    if not user:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        camera = Camera.objects.get(pk=pk, location__owner=user)
    except Camera.DoesNotExist:
        raise Http404('Camera not found')

    def event_stream():
        while True:
            frame = stream_manager.get_frame(
                str(camera.id),
                camera.stream_url,
                camera.ai_detection_enabled,
            )
            if frame is not None:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n'
                    + frame
                    + b'\r\n'
                )
            time.sleep(1 / PLAYBACK_FPS)

    response = StreamingHttpResponse(
        event_stream(),
        content_type='multipart/x-mixed-replace; boundary=frame',
    )
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Access-Control-Allow-Origin'] = '*'
    return response


def camera_detection(request, pk):
    """Real-time person count from YOLO (requires active stream)."""
    user = _authenticate_stream_request(request)
    if not user:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        camera = Camera.objects.get(pk=pk, location__owner=user)
    except Camera.DoesNotExist:
        raise Http404('Camera not found')

    stats = stream_manager.get_detection_stats(
        str(camera.id),
        camera.ai_detection_enabled,
    )

    return JsonResponse({
        'camera_id': camera.id,
        'camera_name': camera.name,
        'person_count': stats['person_count'],
        'last_detection_at': stats['last_detection_at'],
        'ai_active': stats['ai_active'],
        'ai_enabled': stats['ai_enabled'],
    })


def camera_detection_history(request, pk):
    """Recording history with person/head counts per timestamp."""
    user = _authenticate_stream_request(request)
    if not user:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        camera = Camera.objects.get(pk=pk, location__owner=user)
    except Camera.DoesNotExist:
        raise Http404('Camera not found')

    limit = min(int(request.GET.get('limit', 50)), 200)
    logs = DetectionLog.objects.filter(camera=camera).order_by('-recorded_at')[:limit]
    data = DetectionLogSerializer(logs, many=True).data
    return JsonResponse({'results': data, 'count': len(data)})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    if User.objects.filter(username=email).exists():
        return Response({'error': 'A user with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'name': user.first_name or user.username
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'name': user.first_name or user.username
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    try:
        request.user.auth_token.delete()
        return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Token not found or already deleted'}, status=status.HTTP_400_BAD_REQUEST)

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Location.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CameraViewSet(viewsets.ModelViewSet):
    serializer_class = CameraSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Camera.objects.filter(location__owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Validate that the user owns the location they are adding the camera to
        location = serializer.validated_data.get('location')
        if location.owner != self.request.user:
            raise serializers.ValidationError("You do not own this location.")
        serializer.save()

