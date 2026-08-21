"""
FaceID models — face registration and identification records.
"""
import uuid
from django.db import models
from django.utils import timezone


class FaceRegistration(models.Model):
    """Enrolled face encoding for an employee."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        'shaffoftir_api.Employee',
        on_delete=models.CASCADE,
        related_name='face_registrations',
    )
    face_encoding = models.TextField(help_text='Base64-encoded face embedding vector')
    photo_reference = models.URLField(blank=True, help_text='Reference photo URL')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'face_registrations'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['employee', 'is_active'])]


class FaceCheckIn(models.Model):
    """Record of a FaceID check-in event for a group session."""
    class CheckInStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    check_in_id = models.CharField(max_length=50, unique=True, editable=False)
    instructor = models.ForeignKey(
        'shaffoftir_api.SystemUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='check_ins',
    )
    range = models.ForeignKey(
        'shaffoftir_api.ShootingRange',
        on_delete=models.SET_NULL,
        null=True,
    )
    status = models.CharField(
        max_length=20,
        choices=CheckInStatus.choices,
        default=CheckInStatus.PENDING,
    )
    total_identified = models.PositiveIntegerField(default=0)
    total_unknown = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'face_check_ins'
        ordering = ['-created_at']
        indexes = [models.Index(fields=['status', 'created_at'])]


class FaceCheckInEntry(models.Model):
    """Individual soldier identification within a check-in event."""
    class EntryStatus(models.TextChoices):
        IDENTIFIED = 'IDENTIFIED', 'Identified'
        UNKNOWN = 'UNKNOWN', 'Unknown'
        MANUAL = 'MANUAL', 'Manual Override'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    check_in = models.ForeignKey(
        FaceCheckIn,
        on_delete=models.CASCADE,
        related_name='entries',
    )
    employee = models.ForeignKey(
        'shaffoftir_api.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    sequence_number = models.PositiveIntegerField(help_text='Order in queue')
    status = models.CharField(
        max_length=20,
        choices=EntryStatus.choices,
        default=EntryStatus.IDENTIFIED,
    )
    confidence_score = models.FloatField(default=0.0, help_text='Face match confidence 0-1')
    photo_captured = models.URLField(blank=True, help_text='Captured photo during check-in')
    identified_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'face_check_in_entries'
        ordering = ['sequence_number']
        indexes = [
            models.Index(fields=['check_in', 'sequence_number']),
            models.Index(fields=['check_in', 'status']),
        ]
