from django.db import models
import uuid

class TBSafetyTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    questions = models.JSONField(default=list)
    passing_score = models.IntegerField(default=100, help_text='100 = full pass required')
    duration_minutes = models.IntegerField(default=15)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tb_safety_tests'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class TBSafetyTestResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee_id = models.CharField(max_length=255)
    employee_name = models.CharField(max_length=255)
    test = models.ForeignKey(TBSafetyTest, on_delete=models.SET_NULL, related_name='results', blank=True, null=True)
    test_id_str = models.CharField(max_length=255, blank=True)
    score = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=list)
    taken_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tb_safety_results'
        ordering = ['-taken_at']
