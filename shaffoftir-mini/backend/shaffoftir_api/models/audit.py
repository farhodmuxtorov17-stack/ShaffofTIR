"""Audit log model for compliance."""
from django.db import models
import uuid


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor_name = models.CharField(max_length=255, db_index=True)
    actor_role = models.CharField(max_length=50)
    action = models.CharField(max_length=100, db_index=True)
    module = models.CharField(max_length=100)
    details = models.TextField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"[{self.timestamp}] {self.actor_name}: {self.action}"
