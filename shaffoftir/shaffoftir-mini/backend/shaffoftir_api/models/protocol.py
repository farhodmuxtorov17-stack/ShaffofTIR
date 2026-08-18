from django.db import models
import uuid

PROTOCOL_STATUS = [
    ('DRAFT', 'Черновик'),
    ('PENDING_REVIEW', 'На рассмотрении'),
    ('SIGNED', 'Подписан'),
    ('APPROVED', 'Утверждён'),
    ('REJECTED', 'Отклонён'),
    ('ARCHIVED', 'Архив'),
]

class Protocol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol_number = models.CharField(max_length=100, blank=True)
    session = models.ForeignKey('ShootingSession', on_delete=models.SET_NULL, related_name='protocols', blank=True, null=True)
    session_id_str = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=255)
    employee_name = models.CharField(max_length=255)
    employee_rank = models.CharField(max_length=100, blank=True)
    employee_department = models.CharField(max_length=255, blank=True, null=True)
    employee_unit = models.CharField(max_length=255, blank=True, null=True)
    weapon_name = models.CharField(max_length=255, blank=True)
    instructor_id = models.CharField(max_length=255, blank=True)
    instructor_name = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=255, blank=True)
    lane_number = models.IntegerField(blank=True, null=True)
    shot_type = models.CharField(max_length=10, blank=True)
    scoring_mode = models.CharField(max_length=10, default='POINTS')
    total_shots = models.IntegerField(default=0)
    hit_count = models.IntegerField(default=0)
    miss_count = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    max_score = models.IntegerField(default=100)
    accuracy = models.FloatField(default=0)
    passed = models.BooleanField(default=False)
    qualification = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PROTOCOL_STATUS, default='DRAFT')
    qr_code = models.CharField(max_length=500, blank=True, null=True)
    signed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'protocols'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.protocol_number:
            self.protocol_number = f"PR-{self.id}"
        super().save(*args, **kwargs)
