from django.db import models
import uuid

RANGE_TYPE = [
    ('OPEN', 'Открытый'),
    ('CLOSED', 'Закрытый'),
]

class ShootingRange(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    range_type = models.CharField(max_length=10, choices=RANGE_TYPE, default='CLOSED')
    ip_prefix = models.CharField(max_length=50, blank=True, help_text='IP prefix for cameras, e.g. 88.1.92.x')
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shooting_ranges'
        ordering = ['name']

    def __str__(self):
        return self.name

class RangeRubeg(models.Model):
    """Рубеж — sub-range within a range, with specific weapon type and distance"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    range = models.ForeignKey(ShootingRange, on_delete=models.CASCADE, related_name='rubegs')
    name = models.CharField(max_length=255)
    weapon_type = models.CharField(max_length=50, blank=True)
    distance_m = models.IntegerField(default=25)
    lane_count = models.IntegerField(default=6)
    target_type = models.CharField(max_length=50, default='STANDARD')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'range_rubegs'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.range.name})"

LANE_STATUS = [
    ('AVAILABLE', 'Свободна'),
    ('OCCUPIED', 'Занята'),
    ('MAINTENANCE', 'Техобслуживание'),
    ('RESERVED', 'Резерв'),
]

TARGET_TYPE = [
    ('STANDARD', 'Стандартная'),
    ('SILHOUETTE', 'Силуэт'),
    ('CIRCLE', 'Круглая'),
    ('CUSTOM', 'Пользовательская'),
]

CAMERA_STATUS = [
    ('ONLINE', 'Онлайн'),
    ('OFFLINE', 'Оффлайн'),
    ('CONNECTING', 'Подключение'),
]

class ShootingLane(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lane_number = models.IntegerField()
    name = models.CharField(max_length=255, blank=True)
    range = models.ForeignKey(ShootingRange, on_delete=models.CASCADE, related_name='lanes', blank=True, null=True)
    rubeg = models.ForeignKey(RangeRubeg, on_delete=models.SET_NULL, related_name='lanes', blank=True, null=True)
    status = models.CharField(max_length=20, choices=LANE_STATUS, default='AVAILABLE')
    current_employee_id = models.CharField(max_length=255, blank=True, null=True)
    current_employee_name = models.CharField(max_length=255, blank=True, null=True)
    current_employee_seq = models.IntegerField(blank=True, null=True)
    camera_ip = models.GenericIPAddressField(blank=True, null=True)
    camera_status = models.CharField(max_length=20, choices=CAMERA_STATUS, default='OFFLINE')
    target_type = models.CharField(max_length=20, choices=TARGET_TYPE, default='STANDARD')
    distance_m = models.IntegerField(default=25)
    weapon_assigned = models.CharField(max_length=255, blank=True, null=True)
    session_start_time = models.DateTimeField(blank=True, null=True)
    has_3d_preview = models.BooleanField(default=True)
    current_shots_fired = models.IntegerField(default=0)
    current_score = models.IntegerField(default=0)
    current_soldier_seq = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shooting_lanes'
        ordering = ['lane_number']
        unique_together = [('range', 'lane_number')]

    def __str__(self):
        return f"Lane {self.lane_number}"
