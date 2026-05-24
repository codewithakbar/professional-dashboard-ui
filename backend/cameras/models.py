from django.db import models
from django.contrib.auth.models import User

class Location(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    type = models.CharField(max_length=100) # e.g. "Wedding Hall", "Hotel", "Office"
    address = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Camera(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('recording', 'Recording'),
    ]

    name = models.CharField(max_length=255)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='cameras')
    stream_url = models.CharField(max_length=1024)
    resolution = models.CharField(max_length=50, default='1080p')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='online')
    last_recording = models.DateTimeField(auto_now=True)
    snapshot_available = models.BooleanField(default=True)
    ai_detection_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.location.name})"


class DetectionLog(models.Model):
    """AI head-count snapshot for recording history."""

    camera = models.ForeignKey(
        Camera,
        on_delete=models.CASCADE,
        related_name='detection_logs',
    )
    person_count = models.PositiveIntegerField(default=0)
    recorded_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.camera.name}: {self.person_count} @ {self.recorded_at}"
