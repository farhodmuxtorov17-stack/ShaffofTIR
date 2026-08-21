"""Training plan and assignment models."""
from django.db import models
import uuid


class TrainingPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    plan_type = models.CharField(max_length=50, default="STANDARD")
    duration_hours = models.IntegerField(default=8)
    difficulty = models.CharField(max_length=20, default="BASIC")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "training_plans"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class TrainingAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(TrainingPlan, on_delete=models.CASCADE, related_name="assignments")
    employee_name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, default="ASSIGNED")
    assigned_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(blank=True, null=True)
    completed_date = models.DateTimeField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)

    class Meta:
        db_table = "training_assignments"
        ordering = ["-assigned_date"]
