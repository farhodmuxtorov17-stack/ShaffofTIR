"""
Employee (HR) and Department models.
"""
from django.db import models


class Employee(models.Model):
    """Сотрудник (стрелок)"""
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Активен'
        RESERVE = 'RESERVE', 'Резерв'
        RETIRED = 'RETIRED', 'Уволен'
        DISMISSED = 'DISMISSED', 'Уволен по статье'

    class QualLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Начальный'
        INTERMEDIATE = 'INTERMEDIATE', 'Средний'
        ADVANCED = 'ADVANCED', 'Продвинутый'
        EXPERT = 'EXPERT', 'Эксперт'

    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    rank = models.CharField(max_length=100, verbose_name='Звание')
    position = models.CharField(max_length=200, blank=True, default='')
    department = models.CharField(max_length=255, verbose_name='Подразделение')
    region = models.CharField(max_length=200, blank=True, default='', verbose_name='Регион')
    district = models.CharField(max_length=200, blank=True, default='', verbose_name='Район')
    battalion = models.CharField(max_length=200, blank=True, default='', verbose_name='Батальон')
    unit = models.CharField(max_length=255, verbose_name='Подразделение (unit)')
    personal_number = models.CharField(max_length=50, unique=True, verbose_name='Личный номер')
    birth_date = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, null=True)
    face_id_registered = models.BooleanField(default=False, verbose_name='FaceID зарегистрирован')
    face_id_image_url = models.URLField(blank=True, null=True)
    face_id_confidence = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE,
        verbose_name='Статус'
    )
    hire_date = models.DateField(verbose_name='Дата приёма')
    shooting_qualified = models.BooleanField(default=False, verbose_name='Допущен к стрельбе')
    qualification_level = models.CharField(
        max_length=20, choices=QualLevel.choices, null=True, blank=True,
        verbose_name='Уровень квалификации'
    )
    total_sessions = models.IntegerField(default=0, verbose_name='Всего сессий')
    total_score = models.IntegerField(default=0, verbose_name='Суммарный балл')
    avg_accuracy = models.FloatField(default=0, verbose_name='Средняя точность %')
    last_shooting_date = models.DateTimeField(null=True, blank=True, verbose_name='Последняя стрельба')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employees'
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'
        ordering = ['full_name']

    def __str__(self):
        return f'{self.full_name} - {self.rank} ({self.department})'


class Department(models.Model):
    """Подразделение"""
    name = models.CharField(max_length=255, verbose_name='Название')
    code = models.CharField(max_length=50, unique=True, verbose_name='Код')
    head = models.CharField(max_length=255, blank=True, default='', verbose_name='Начальник')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'departments'
        verbose_name = 'Подразделение'
        verbose_name_plural = 'Подразделения'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def employee_count(self):
        return Employee.objects.filter(department=self.name).count()
