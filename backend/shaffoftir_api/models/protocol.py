"""
Protocol model with signed/approved/archived workflow.

Once a protocol is APPROVED or ARCHIVED, it becomes immutable
(enforced at the view layer and via the ``is_editable`` property).
"""
from django.db import models
import uuid
from enum import Enum


class ProtocolStatus(str, Enum):
    DRAFT = "DRAFT"
    SIGNED = "SIGNED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"

    @classmethod
    def choices(cls):
        return [(s.value, s.value) for s in cls]


# Statuses that prevent further editing (zero-edit policy)
IMMUTABLE_STATUSES = frozenset({
    ProtocolStatus.APPROVED.value,
    ProtocolStatus.ARCHIVED.value,
})


class Protocol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol_number = models.CharField(max_length=100, blank=True, db_index=True)

    # Session link
    session = models.ForeignKey(
        "shaffoftir_api.ShootingSession",
        on_delete=models.SET_NULL,
        related_name="protocols",
        blank=True,
        null=True,
    )
    session_id_str = models.CharField(max_length=100, blank=True)

    # Employee
    employee_id = models.CharField(max_length=255)
    employee_name = models.CharField(max_length=255, db_index=True)
    employee_rank = models.CharField(max_length=100, blank=True)
    employee_department = models.CharField(max_length=255, blank=True, null=True)
    employee_unit = models.CharField(max_length=255, blank=True, null=True)

    # Weapon & instructor
    weapon_name = models.CharField(max_length=255, blank=True)
    instructor_id = models.CharField(max_length=255, blank=True)
    instructor_name = models.CharField(max_length=255, blank=True)

    # Context
    date = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255, blank=True)
    lane_number = models.IntegerField(blank=True, null=True)
    shot_type = models.CharField(max_length=10, blank=True)
    scoring_mode = models.CharField(max_length=10, default="POINTS")

    # Results
    total_shots = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=100)
    accuracy = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    qualification = models.CharField(max_length=50, blank=True, null=True)

    # Workflow
    status = models.CharField(
        max_length=20,
        choices=ProtocolStatus.choices(),
        default=ProtocolStatus.DRAFT.value,
        db_index=True,
    )

    # Metadata
    qr_code = models.CharField(max_length=500, blank=True, null=True)
    signed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "protocols"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["employee_name", "status"]),
        ]

    @property
    def is_editable(self) -> bool:
        """True if the protocol can still be modified."""
        return self.status not in IMMUTABLE_STATUSES

    def save(self, *args, **kwargs):
        if not self.protocol_number:
            super().save(*args, **kwargs)
            self.protocol_number = f"PR-{str(self.id)[:8].upper()}"
            super().save(update_fields=["protocol_number"])
            return
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.protocol_number} — {self.employee_name}"
