"""
User, Role, Permission models.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    INSTRUCTOR = 'INSTRUCTOR', 'Инструктор'
    MANAGER = 'MANAGER', 'Руководитель'
    EMPLOYEE = 'EMPLOYEE', 'Сотрудник'


class User(AbstractUser):
    """Системный пользователь (инструктор / руководитель / сотрудник)"""
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.EMPLOYEE,
        verbose_name='Роль'
    )
    avatar_url = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    rank = models.CharField(max_length=100, blank=True, null=True, verbose_name='Звание')
    department = models.CharField(max_length=255, blank=True, null=True)
    is_active_user = models.BooleanField(default=True, verbose_name='Активен')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'username']

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['full_name']

    def __str__(self):
        return f'{self.full_name} ({self.role})'


class Permission(models.Model):
    """Право доступа к модулю"""
    MODULE_CHOICES = [
        ('dashboard', 'Панель управления'),
        ('range', 'Тир'),
        ('sessions', 'Сессии'),
        ('instructor', 'Инструктор'),
        ('upload', 'Загрузка'),
        ('compare', 'Сравнение'),
        ('hr', 'Кадры'),
        ('arsenal', 'Арсенал'),
        ('training', 'Учебные планы'),
        ('reports', 'Отчёты'),
        ('cameras', 'Камеры'),
        ('settings', 'Настройки'),
    ]
    module = models.CharField(max_length=50, choices=MODULE_CHOICES)
    action = models.CharField(max_length=50, verbose_name='Действие')
    description = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'permissions'
        unique_together = ('module', 'action')

    def __str__(self):
        return f'{self.module}:{self.action}'
