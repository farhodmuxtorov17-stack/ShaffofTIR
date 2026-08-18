from django.db import models
import uuid

class HRDepartment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    head = models.CharField(max_length=255, blank=True)
    employee_count = models.IntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hr_departments'
        ordering = ['name']

    def __str__(self):
        return self.name

EMPLOYEE_STATUS = [
    ('ACTIVE', 'Активен'),
    ('RESERVE', 'Резерв'),
    ('RETIRED', 'В отставке'),
    ('DISMISSED', 'Уволен'),
]

QUAL_LEVELS = [
    ('BEGINNER', 'Начальный'),
    ('INTERMEDIATE', 'Средний'),
    ('ADVANCED', 'Продвинутый'),
    ('EXPERT', 'Эксперт'),
]

class HREmployee(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    rank = models.CharField(max_length=100)
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    unit = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    district = models.CharField(max_length=255, blank=True, null=True)
    battalion = models.CharField(max_length=255, blank=True, null=True)
    personal_number = models.CharField(max_length=50, unique=True)
    birth_date = models.DateField()
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=EMPLOYEE_STATUS, default='ACTIVE')
    hire_date = models.DateField()
    shooting_qualified = models.BooleanField(default=False)
    qualification_level = models.CharField(max_length=20, choices=QUAL_LEVELS, blank=True, null=True)
    total_sessions = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    avg_accuracy = models.FloatField(default=0)
    last_shooting_date = models.DateTimeField(blank=True, null=True)
    # FaceID
    face_id_registered = models.BooleanField(default=False)
    face_id_image_url = models.URLField(blank=True, null=True)
    face_id_confidence = models.FloatField(blank=True, null=True)
    # TB Safety
    tb_test_passed = models.BooleanField(default=False)
    tb_test_score = models.IntegerField(blank=True, null=True)
    tb_test_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hr_employees'
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.rank})"
