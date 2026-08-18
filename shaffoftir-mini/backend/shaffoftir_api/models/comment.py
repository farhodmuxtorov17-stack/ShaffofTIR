"""Operator comments on sessions (for review process)."""
from django.db import models
import uuid


class OperatorComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=255, db_index=True)
    soldier_seq = models.IntegerField(blank=True, null=True)
    author = models.CharField(max_length=255)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "operator_comments"
        ordering = ["-created_at"]


class ReviewReason(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=255, db_index=True)
    soldier_seq = models.IntegerField(blank=True, null=True)
    reviewer = models.CharField(max_length=255)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "review_reasons"
        ordering = ["-created_at"]
