"""Shooting range and lane models."""
from django.db import models
import uuid
from enum import Enum


class RangeType(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

    @classmethod
    def choices(cls):
        return [(t.value, t.value) for t in cls]


class LaneStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    MAINTENANCE = "MAINTENANCE"
    OFFLINE = "OFFLINE"

    @classmethod
    def choices(cls):
        return [(s.value, s.value) for s in cls]


class CameraStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    ERROR = "ERROR"

    @classmethod
    def choices(cls):
        return [(s.value, s.value) for s in cls]


class ShootingRange(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    code = models.CharField(max_length=50, blank=True, null=True)
    range_type = models.CharField(
        max_length=10,
        choices=RangeType.choices(),
        default=RangeType.CLOSED.value,
    )
    address = models.TextField(blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "shooting_ranges"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ShootingLane(models.Model):
    """A single shooting lane (дорожка).
    For OPEN ranges: lane belongs to a rubeg (рубеж).
    For CLOSED ranges: lane belongs directly to the range (rubeg=None).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    range = models.ForeignKey(ShootingRange, on_delete=models.CASCADE, related_name="lanes")
    rubeg = models.ForeignKey(
        "RangeRubeg", on_delete=models.CASCADE, related_name="lanes",
        blank=True, null=True, db_index=True,
    )
    name = models.CharField(max_length=100)
    lane_number = models.IntegerField(db_index=True)
    distance_m = models.IntegerField(default=25)
    target_type = models.CharField(max_length=50, default="Круглая")
    status = models.CharField(
        max_length=20,
        choices=LaneStatus.choices(),
        default=LaneStatus.AVAILABLE.value,
        db_index=True,
    )
    camera_status = models.CharField(
        max_length=15,
        choices=CameraStatus.choices(),
        default=CameraStatus.ONLINE.value,
    )
    camera_ip = models.GenericIPAddressField(blank=True, null=True)
    current_employee_name = models.CharField(max_length=255, blank=True, null=True)
    weapon_assigned = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "shooting_lanes"
        ordering = ["lane_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["range", "lane_number"],
                name="unique_lane_number_per_range",
                condition=models.Q(rubeg__isnull=True),
            ),
            models.UniqueConstraint(
                fields=["rubeg", "lane_number"],
                name="unique_lane_number_per_rubeg",
                condition=models.Q(rubeg__isnull=False),
            ),
        ]


class RangeRubeg(models.Model):
    """A firing line (рубеж) in an open shooting range.
    Each рубеж contains multiple lanes (typically up to 10).
    Only used for OPEN range types — CLOSED ranges have lanes directly.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    range = models.ForeignKey(ShootingRange, on_delete=models.CASCADE, related_name="rubegs")
    rubeg_number = models.IntegerField()
    distance = models.IntegerField(default=25)
    max_lanes = models.IntegerField(default=10)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        db_table = "range_rubegs"
        ordering = ["rubeg_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["range", "rubeg_number"],
                name="unique_rubeg_number_per_range",
            ),
        ]

    def __str__(self) -> str:
        return f"Rubeg {self.rubeg_number} ({self.distance}m)"

    @property
    def lane_count(self):
        return self.lanes.count()
