"""Range schedule model."""
from django.db import models
import uuid


class RangeSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    range_name = models.CharField(max_length=255, db_index=True)
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    instructor_name = models.CharField(max_length=255, blank=True, null=True)
    employee_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default="SCHEDULED")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "range_schedules"
        ordering = ["-date", "start_time"]
