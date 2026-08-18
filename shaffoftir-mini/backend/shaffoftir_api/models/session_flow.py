"""Session flow state transitions log."""
from django.db import models
import uuid


class ShootingSessionFlow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=255, db_index=True)
    from_state = models.CharField(max_length=50)
    to_state = models.CharField(max_length=50)
    actor = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "session_flows"
        ordering = ["timestamp"]
