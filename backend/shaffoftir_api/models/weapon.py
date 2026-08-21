"""Weapon model with assignment tracking."""
from django.db import models
import uuid
from enum import Enum


class WeaponStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    IN_USE = "IN_USE"
    MAINTENANCE = "MAINTENANCE"
    DECOMMISSIONED = "DECOMMISSIONED"

    @classmethod
    def choices(cls):
        return [(s.value, s.value) for s in cls]


class Weapon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    serial_number = models.CharField(max_length=100, blank=True, db_index=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    caliber = models.CharField(max_length=50, blank=True)
    condition = models.CharField(max_length=50, default="Исправно")

    # Assignment
    status = models.CharField(
        max_length=20,
        choices=WeaponStatus.choices(),
        default=WeaponStatus.AVAILABLE.value,
        db_index=True,
    )
    assigned_to = models.CharField(max_length=255, blank=True, null=True)

    # Usage stats
    total_shots_fired = models.IntegerField(default=0)
    last_maintenance = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "weapons"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["status", "category"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.serial_number or 'no-sn'})"
