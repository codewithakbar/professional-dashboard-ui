from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Location, Camera, DetectionLog
from .stream_resolver import normalize_stream_url

class UserSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class CameraSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    locationId = serializers.PrimaryKeyRelatedField(
        source='location',
        queryset=Location.objects.all()
    )
    streamUrl = serializers.CharField(source='stream_url')
    lastRecording = serializers.DateTimeField(source='last_recording', read_only=True, required=False)
    snapshotAvailable = serializers.BooleanField(source='snapshot_available', default=True, required=False)
    aiDetectionEnabled = serializers.BooleanField(source='ai_detection_enabled', default=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True, required=False)

    class Meta:
        model = Camera
        fields = (
            'id', 'name', 'locationId', 'streamUrl', 'resolution', 
            'status', 'lastRecording', 'snapshotAvailable', 'aiDetectionEnabled', 'createdAt'
        )

    def validate_streamUrl(self, value: str) -> str:
        normalized = normalize_stream_url(value)
        if not normalized.lower().startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                'Stream URL must start with http:// or https://'
            )
        return normalized

class DetectionLogSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    personCount = serializers.IntegerField(source='person_count', read_only=True)
    recordedAt = serializers.DateTimeField(source='recorded_at', read_only=True)

    class Meta:
        model = DetectionLog
        fields = ('id', 'personCount', 'recordedAt')


class LocationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    cameras = CameraSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True, required=False)

    class Meta:
        model = Location
        fields = ('id', 'name', 'description', 'type', 'address', 'cameras', 'createdAt')
