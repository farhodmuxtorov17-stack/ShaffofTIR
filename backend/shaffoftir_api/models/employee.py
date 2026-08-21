"""Employee model — the personnel registry."""
from django.db import models
import uuid


class Employee(models.Model):
    """An employee registered in the shooting qualification system."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255, db_index=True)
    personal_number = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    rank = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=255, blank=True, null=True)

    # Hierarchy
    department = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    unit = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    district = models.CharField(max_length=255, blank=True, null=True)

    # Qualification
    shooting_qualified = models.BooleanField(default=False)
    qualification_level = models.CharField(max_length=50, default="Неизвестно")
    tb_test_passed = models.BooleanField(default=False)
    tb_test_date = models.DateTimeField(blank=True, null=True)
    tb_test_score = models.IntegerField(default=0)

    # Stats (denormalised for performance)
    total_sessions = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    avg_accuracy = models.FloatField(default=0.0)

    # Metadata
    hire_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "employees"
        ordering = ["full_name"]
        indexes = [
            models.Index(fields=["region", "department"]),
            models.Index(fields=["shooting_qualified", "tb_test_passed"]),
        ]

    def __str__(self) -> str:
        return f"{self.full_name} ({self.rank or '—'})"
