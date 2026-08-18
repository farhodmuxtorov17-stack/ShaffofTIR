"""
Shooting queue models — sequential queue management for group sessions.
"""
import uuid
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class ShootingQueue(models.Model):
    """A queue of soldiers for a group shooting session."""
    class QueueStatus(models.TextChoices):
        WAITING = 'WAITING', 'Waiting'
        ACTIVE = 'ACTIVE', 'Active'
        PAUSED = 'PAUSED', 'Paused'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    queue_id = models.CharField(max_length=50, unique=True, editable=False)
    check_in = models.ForeignKey(
        'shaffoftir_api.FaceCheckIn',
        on_delete=models.SET_NULL,
        null=True,
        related_name='queues',
    )
    session = models.ForeignKey(
        'shaffoftir_api.ShootingSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='queues',
    )
    instructor = models.ForeignKey(
        'shaffoftir_api.SystemUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='managed_queues',
    )
    range = models.ForeignKey(
        'shaffoftir_api.ShootingRange',
        on_delete=models.SET_NULL,
        null=True,
    )
    lane = models.ForeignKey(
        'shaffoftir_api.ShootingLane',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=QueueStatus.choices,
        default=QueueStatus.WAITING,
    )
    total_soldiers = models.PositiveIntegerField(default=0)
    current_position = models.PositiveIntegerField(default=0, help_text='Index of current shooter (0-based)')
    completed_count = models.PositiveIntegerField(default=0)
    auto_advance = models.BooleanField(default=True, help_text='Auto-advance to next soldier on completion')
    created_at = models.DateTimeField(auto_now_add=True)
    activated_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'shooting_queues'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['instructor', 'status']),
        ]

    def clean(self):
        if self.current_position > self.total_soldiers:
            raise ValidationError('Current position cannot exceed total soldiers')

    @property
    def remaining_count(self):
        return self.total_soldiers - self.completed_count

    @property
    def is_last(self):
        return self.completed_count >= self.total_soldiers


class QueueEntry(models.Model):
    """A single soldier's entry in a shooting queue."""
    class EntryStatus(models.TextChoices):
        WAITING = 'WAITING', 'Waiting'
        CURRENT = 'CURRENT', 'Current Shooter'
        SHOOTING = 'SHOOTING', 'Shooting'
        COMPLETED = 'COMPLETED', 'Completed'
        SKIPPED = 'SKIPPED', 'Skipped'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    queue = models.ForeignKey(
        ShootingQueue,
        on_delete=models.CASCADE,
        related_name='entries',
    )
    employee = models.ForeignKey(
        'shaffoftir_api.Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    employee_name = models.CharField(max_length=255)
    employee_rank = models.CharField(max_length=100, blank=True)
    employee_department = models.CharField(max_length=255, blank=True)
    sequence_number = models.PositiveIntegerField(help_text='Position in queue (1-based)')
    status = models.CharField(
        max_length=20,
        choices=EntryStatus.choices,
        default=EntryStatus.WAITING,
    )
    pre_shoot_photo = models.URLField(blank=True, help_text='Target photo before shooting')
    post_shoot_photo = models.URLField(blank=True, help_text='Target photo after shooting')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    # Results
    total_shots = models.PositiveIntegerField(default=0)
    hit_count = models.PositiveIntegerField(default=0)
    miss_count = models.PositiveIntegerField(default=0)
    total_score = models.PositiveIntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)

    class Meta:
        db_table = 'queue_entries'
        ordering = ['sequence_number']
        indexes = [
            models.Index(fields=['queue', 'sequence_number']),
            models.Index(fields=['queue', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['queue', 'sequence_number'],
                name='unique_queue_sequence',
            ),
        ]

    @property
    def duration_seconds(self):
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
