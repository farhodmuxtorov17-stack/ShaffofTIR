"""Camera model for lane surveillance."""
from django.db import models
import uuid
from .range import CameraStatus


class LaneCamera(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    lane_number = models.IntegerField(db_index=True)
    camera_ip = models.GenericIPAddressField(db_index=True)
    camera_port = models.IntegerField(default=554)
    stream_url = models.URLField(blank=True, null=True)
    status = models.CharField(
        max_length=15,
        choices=CameraStatus.choices(),
        default=CameraStatus.ONLINE.value,
        db_index=True,
    )
    model = models.CharField(max_length=255, blank=True, null=True)
    firmware_version = models.CharField(max_length=50, blank=True, null=True)
    last_seen = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lane_cameras"
        ordering = ["lane_number", "name"]
        indexes = [
            models.Index(fields=["status", "lane_number"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} (Lane {self.lane_number}) — {self.camera_ip}"
