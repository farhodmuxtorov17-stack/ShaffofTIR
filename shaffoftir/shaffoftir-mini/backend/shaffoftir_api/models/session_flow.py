from django.db import models
import uuid

FLOW_STATUS = [
    ('WAITING', 'Ожидание'),
    ('ASSIGNED', 'Назначен'),
    ('WEAPON_SELECTED', 'Оружие выбрано'),
    ('READY', 'Готов'),
    ('SHOOTING', 'Стрельба'),
    ('COMPLETED', 'Завершён'),
    ('CANCELLED', 'Отменён'),
]

SHOT_TYPE = [
    ('TEST', 'Пробный'),
    ('MAIN', 'Основной'),
]

SCORING_MODE = [
    ('POINTS', 'Балльная система'),
    ('HIT_MISS', 'Попадание/Промах'),
]

class ShootingSessionFlow(models.Model):
    """Tracks the full flow of an employee assigned to a lane with weapon selection"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey('ShootingSession', on_delete=models.CASCADE, related_name='flows', blank=True, null=True)
    session_id_str = models.CharField(max_length=100, blank=True)
    lane = models.ForeignKey('ShootingLane', on_delete=models.SET_NULL, related_name='flows', blank=True, null=True)
    lane_number = models.IntegerField()
    employee_id = models.CharField(max_length=255)
    employee_name = models.CharField(max_length=255)
    employee_rank = models.CharField(max_length=100, blank=True, null=True)
    weapon = models.ForeignKey('Weapon', on_delete=models.SET_NULL, related_name='flows', blank=True, null=True)
    weapon_id_str = models.CharField(max_length=255, blank=True)
    weapon_name = models.CharField(max_length=255, blank=True)
    weapon_category = models.CharField(max_length=50, blank=True)
    instructor_id = models.CharField(max_length=255, blank=True)
    instructor_name = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=25, choices=FLOW_STATUS, default='WAITING')
    shot_type = models.CharField(max_length=10, choices=SHOT_TYPE, default='TEST')
    scoring_mode = models.CharField(max_length=10, choices=SCORING_MODE, default='POINTS')
    expected_shots = models.IntegerField(default=10)
    rounds_fired = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    camera_stream_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'session_flows'
        ordering = ['-created_at']

    def __str__(self):
        return f"Flow {self.employee_name} — Lane {self.lane_number} ({self.status})"
