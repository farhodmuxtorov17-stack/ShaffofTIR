"""
AI shot analysis models — stores before/after target photos and AI-detected hits.
"""
import uuid
from django.db import models


class ShotAnalysis(models.Model):
    """AI analysis result comparing target photos before and after shooting."""
    class AnalysisStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis_id = models.CharField(max_length=50, unique=True, editable=False)
    queue_entry = models.ForeignKey(
        'shaffoftir_api.QueueEntry',
        on_delete=models.CASCADE,
        related_name='analyses',
        null=True,
        blank=True,
    )
    session = models.ForeignKey(
        'shaffoftir_api.ShootingSession',
        on_delete=models.CASCADE,
        related_name='analyses',
        null=True,
        blank=True,
    )
    soldier_seq = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20,
        choices=AnalysisStatus.choices,
        default=AnalysisStatus.PENDING,
    )
    # Photos
    before_photo_url = models.URLField(blank=True, help_text='Target photo before shooting')
    after_photo_url = models.URLField(blank=True, help_text='Target photo after shooting')
    annotated_photo_url = models.URLField(blank=True, help_text='AI-annotated photo with hit markers')
    # AI Results
    detected_hits = models.JSONField(
        default=list,
        help_text='List of detected hit positions: [{"x": 0.5, "y": 0.3, "score": 10}, ...]',
    )
    detected_misses = models.JSONField(
        default=list,
        help_text='List of detected miss positions',
    )
    total_shots_detected = models.PositiveIntegerField(default=0)
    hit_count = models.PositiveIntegerField(default=0)
    miss_count = models.PositiveIntegerField(default=0)
    total_score = models.PositiveIntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    confidence = models.FloatField(default=0.0, help_text='AI confidence in analysis 0-1')
    # Metadata
    model_version = models.CharField(max_length=50, default='v1.0')
    processing_time_ms = models.PositiveIntegerField(default=0)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'shot_analyses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['session', 'soldier_seq']),
        ]
