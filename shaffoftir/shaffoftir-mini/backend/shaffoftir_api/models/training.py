from django.db import models
import uuid

DIFFICULTY = [
    ('BASIC', 'Базовый'),
    ('INTERMEDIATE', 'Средний'),
    ('ADVANCED', 'Продвинутый'),
    ('ELITE', 'Элитный'),
]

TRAINING_STATUS = [
    ('ASSIGNED', 'Назначено'),
    ('IN_PROGRESS', 'В процессе'),
    ('COMPLETED', 'Завершено'),
    ('FAILED', 'Не пройдено'),
    ('OVERDUE', 'Просрочено'),
]

class TrainingPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY, default='BASIC')
    duration_minutes = models.IntegerField(default=30)
    required_shots = models.IntegerField(default=10)
    target_distance_m = models.IntegerField(default=25)
    weapon_categories = models.JSONField(default=list)
    passing_score = models.IntegerField(default=70)
    assigned_count = models.IntegerField(default=0)
    completed_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'training_plans'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class TrainingAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(TrainingPlan, on_delete=models.CASCADE, related_name='assignments')
    plan_name = models.CharField(max_length=255, blank=True)
    employee_id = models.CharField(max_length=255)
    employee_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=TRAINING_STATUS, default='ASSIGNED')
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField()
    completed_at = models.DateTimeField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    instructor_id = models.CharField(max_length=255, blank=True)
    instructor_name = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = 'training_assignments'
        ordering = ['-assigned_at']

    def save(self, *args, **kwargs):
        if not self.plan_name and self.plan_id:
            self.plan_name = self.plan.name
        super().save(*args, **kwargs)
