"""HR department model."""
from django.db import models
import uuid


class HRDepartment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    code = models.CharField(max_length=50, blank=True, null=True)
    parent = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children")
    region = models.CharField(max_length=255, blank=True, null=True)
    head_name = models.CharField(max_length=255, blank=True, null=True)
    employee_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "hr_departments"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
