from django.db import models
import uuid

SCHEDULE_STATUS = [
    ('SCHEDULED', 'Запланировано'),
    ('IN_PROGRESS', 'В процессе'),
    ('COMPLETED', 'Завершено'),
    ('CANCELLED', 'Отменено'),
]

class RangeSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField()
    time_slot = models.CharField(max_length=100)
    lane_numbers = models.JSONField(default=list)
    department = models.CharField(max_length=255, blank=True)
    instructor_name = models.CharField(max_length=255, blank=True)
    employee_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=SCHEDULE_STATUS, default='SCHEDULED')
    weapon_categories = models.JSONField(default=list)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'range_schedules'
        ordering = ['-date']
