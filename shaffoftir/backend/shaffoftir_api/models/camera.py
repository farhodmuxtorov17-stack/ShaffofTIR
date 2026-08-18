from django.db import models
import uuid

CAMERA_STATUS = [
    ('ONLINE', 'Онлайн'),
    ('OFFLINE', 'Оффлайн'),
    ('CONNECTING', 'Подключение'),
]

class LaneCamera(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lane = models.ForeignKey('ShootingLane', on_delete=models.CASCADE, related_name='cameras', blank=True, null=True)
    lane_number = models.IntegerField(blank=True, null=True)
    name = models.CharField(max_length=255, blank=True)
    camera_ip = models.GenericIPAddressField()
    username = models.CharField(max_length=100, blank=True)
    password = models.CharField(max_length=255, blank=True)
    label = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=CAMERA_STATUS, default='OFFLINE')
    resolution = models.CharField(max_length=50, blank=True, default='1920x1080')
    fps = models.IntegerField(default=30)
    has_recording = models.BooleanField(default=False)
    has_3d_overlay = models.BooleanField(default=False)
    last_motion_detected = models.DateTimeField(blank=True, null=True)
    capture_image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lane_cameras'
        ordering = ['lane_number']

    def __str__(self):
        return f"Camera {self.camera_ip} (Lane {self.lane_number})"
