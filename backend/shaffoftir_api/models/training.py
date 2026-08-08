"""
TrainingPlan and TrainingAssignment models.
"""
from django.db import models


class TrainingPlan(models.Model):
    """Учебный план"""
    class Difficulty(models.TextChoices):
        BASIC = 'BASIC', 'Базовый'
        INTERMEDIATE = 'INTERMEDIATE', 'Средний'
        ADVANCED = 'ADVANCED', 'Продвинутый'
        ELITE = 'ELITE', 'Элитный'

    name = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(blank=True, default='', verbose_name='Описание')
    difficulty = models.CharField(
        max_length=20, choices=Difficulty.choices, default=Difficulty.BASIC,
        verbose_name='Сложность'
    )
    duration_minutes = models.IntegerField(default=60, verbose_name='Длительность (мин)')
    required_shots = models.IntegerField(default=10, verbose_name='Выстрелов')
    target_distance_m = models.IntegerField(default=25, verbose_name='Дистанция (м)')
    weapon_categories = models.JSONField(default=list, verbose_name='Категории оружия')
    passing_score = models.IntegerField(default=70, verbose_name='Проходной балл')
    assigned_count = models.IntegerField(default=0, verbose_name='Назначено')
    completed_count = models.IntegerField(default=0, verbose_name='Завершено')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'training_plans'
        verbose_name = 'Учебный план'
        verbose_name_plural = 'Учебные планы'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.difficulty})'


class TrainingAssignment(models.Model):
    """Назначение учебного плана сотруднику"""
    class Status(models.TextChoices):
        ASSIGNED = 'ASSIGNED', 'Назначено'
        IN_PROGRESS = 'IN_PROGRESS', 'В процессе'
        COMPLETED = 'COMPLETED', 'Завершено'
        FAILED = 'FAILED', 'Не сдано'
        OVERDUE = 'OVERDUE', 'Просрочено'

    plan = models.ForeignKey(TrainingPlan, on_delete=models.CASCADE, related_name='assignments')
    plan_name = models.CharField(max_length=255, blank=True, default='')
    employee_name = models.CharField(max_length=255, verbose_name='Сотрудник')
    employee = models.ForeignKey(
        'shaffoftir_api.Employee', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='training_assignments'
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ASSIGNED,
        verbose_name='Статус'
    )
    assigned_at = models.DateTimeField(auto_now_add=True, verbose_name='Назначено')
    due_date = models.DateField(verbose_name='Срок')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Завершено')
    score = models.IntegerField(null=True, blank=True, verbose_name='Балл')
    instructor_name = models.CharField(max_length=255, blank=True, default='', verbose_name='Инструктор')

    class Meta:
        db_table = 'training_assignments'
        verbose_name = 'Назначение тренировки'
        verbose_name_plural = 'Назначения тренировок'
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.employee_name} - {self.plan_name} ({self.status})'
