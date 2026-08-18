"""TB (Техника Безопасности) safety test model."""
from django.db import models
import uuid


class TBSafetyTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_name = models.CharField(max_length=255, db_index=True)
    employee_id = models.CharField(max_length=255, blank=True, null=True)
    test_date = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    questions_total = models.IntegerField(default=20)
    questions_correct = models.IntegerField(default=0)
    instructor_name = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "tb_safety_tests"
        ordering = ["-test_date"]

    def save(self, *args, **kwargs):
        # 100% required to pass TB test
        self.passed = self.questions_total > 0 and self.questions_correct == self.questions_total
        self.score = int(self.questions_correct / max(self.questions_total, 1) * 100)
        super().save(*args, **kwargs)
