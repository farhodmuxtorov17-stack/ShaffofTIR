from django.db import models
import uuid

SESSION_STATUS = [
    ('IDLE', 'Простой'),
    ('SESSION_CREATED', 'Сессия создана'),
    ('TEST_READY', 'Пробные готовы'),
    ('TEST_ACTIVE', 'Пробные активны'),
    ('TEST_PROCESSING', 'Пробные обрабатываются'),
    ('TEST_COMPLETED', 'Пробные завершены'),
    ('MAIN_READY', 'Основные готовы'),
    ('MAIN_ACTIVE', 'Основные активны'),
    ('MAIN_PROCESSING', 'Основные обрабатываются'),
    ('MAIN_COMPLETED', 'Основные завершены'),
    ('REVIEW', 'Проверка'),
    ('APPROVED', 'Утверждено'),
    ('ARCHIVED', 'Архив'),
]

SCORING_MODE = [
    ('POINTS', 'Балльная система'),
    ('HIT_MISS', 'Попадание/Промах'),
]

SHOT_TYPE = [
    ('TEST', 'Пробный'),
    ('MAIN', 'Основной'),
]

class ShootingSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=100, unique=True, blank=True)
    range = models.CharField(max_length=255, blank=True, null=True)
    range_name = models.CharField(max_length=255, blank=True, null=True)
    range_type = models.CharField(max_length=10, choices=[('OPEN', 'Открытый'), ('CLOSED', 'Закрытый')], default='CLOSED')
    lane_number = models.IntegerField(blank=True, null=True)
    lane_id = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=25, choices=SESSION_STATUS, default='SESSION_CREATED')
    scoring_mode = models.CharField(max_length=10, choices=SCORING_MODE, default='POINTS')
    distance = models.IntegerField(default=25)
    soldier_count = models.IntegerField(default=0)
    instructor_id = models.CharField(max_length=255, blank=True, null=True)
    instructor_name = models.CharField(max_length=255, blank=True, null=True)
    # Employee info
    employee_id = models.CharField(max_length=255, blank=True, null=True)
    employee_name = models.CharField(max_length=255, blank=True, null=True)
    employee_rank = models.CharField(max_length=100, blank=True, null=True)
    employee_department = models.CharField(max_length=255, blank=True, null=True)
    employee_unit = models.CharField(max_length=255, blank=True, null=True)
    # Weapon
    weapon_id = models.CharField(max_length=255, blank=True, null=True)
    weapon_name = models.CharField(max_length=255, blank=True, null=True)
    weapon_category = models.CharField(max_length=50, blank=True, null=True)
    # Scoring
    total_score = models.IntegerField(default=0)
    total_shots = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    baseline_score = models.IntegerField(default=0)
    session_type = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'shooting_sessions'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.session_id:
            self.session_id = f"sh-{self.id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.session_id} — {self.employee_name or 'N/A'}"

class Soldier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ShootingSession, on_delete=models.CASCADE, related_name='soldiers')
    sequence_number = models.IntegerField()
    employee_id = models.CharField(max_length=255, blank=True, null=True)
    employee_name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, default='WAITING')
    test_image_url = models.URLField(blank=True, null=True)
    main_image_url = models.URLField(blank=True, null=True)
    total_score = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'soldiers'
        ordering = ['sequence_number']
        unique_together = [('session', 'sequence_number')]

class Shot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ShootingSession, on_delete=models.CASCADE, related_name='shots', blank=True, null=True)
    soldier = models.ForeignKey(Soldier, on_delete=models.CASCADE, related_name='shots', blank=True, null=True)
    shot_type = models.CharField(max_length=10, choices=SHOT_TYPE, default='MAIN')
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    score = models.IntegerField(default=0)
    is_hit = models.BooleanField(default=False)
    soldier_seq = models.IntegerField(blank=True, null=True)
    shot_number = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shots'
        ordering = ['timestamp']
