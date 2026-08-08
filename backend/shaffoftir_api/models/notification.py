"""
Notification, AuditAnnotation, SavedFilter, UIPreference models.
"""
from django.db import models


class Notification(models.Model):
    """Уведомление"""
    class Type(models.TextChoices):
        INFO = 'INFO', 'Информация'
        SUCCESS = 'SUCCESS', 'Успех'
        WARNING = 'WARNING', 'Предупреждение'
        ERROR = 'ERROR', 'Ошибка'
        TRAINING = 'TRAINING', 'Тренировка'
        SYSTEM = 'SYSTEM', 'Система'

    user_id = models.CharField(max_length=100, blank=True, default='', verbose_name='ID пользователя')
    type = models.CharField(
        max_length=20, choices=Type.choices, default=Type.INFO,
        verbose_name='Тип'
    )
    title = models.CharField(max_length=255, verbose_name='Заголовок')
    message = models.TextField(verbose_name='Сообщение')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    action_url = models.URLField(blank=True, null=True, verbose_name='Ссылка действия')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.type}: {self.title}'


class AuditAnnotation(models.Model):
    """Аудит-лог (журнал действий)"""
    action = models.CharField(max_length=100, verbose_name='Действие')
    actor = models.CharField(max_length=255, verbose_name='Кто')
    details = models.TextField(blank=True, default='', verbose_name='Детали')
    session = models.ForeignKey(
        'shaffoftir_api.Session', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='audit_annotations'
    )
    soldier_seq = models.IntegerField(null=True, blank=True, verbose_name='№ стрелка')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_annotations'
        verbose_name = 'Аудит-запись'
        verbose_name_plural = 'Аудит-записи'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.action} - {self.actor} ({self.created_at:%Y-%m-%d %H:%M})'


class SavedFilter(models.Model):
    """Сохранённый фильтр пользователя"""
    name = models.CharField(max_length=255, verbose_name='Название')
    filters = models.JSONField(default=dict, verbose_name='Фильтры')
    user_id = models.CharField(max_length=100, verbose_name='ID пользователя')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_filters'
        verbose_name = 'Сохранённый фильтр'
        verbose_name_plural = 'Сохранённые фильтры'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.user_id}'


class UIPreference(models.Model):
    """Настройки интерфейса пользователя"""
    user_id = models.CharField(max_length=100, unique=True, verbose_name='ID пользователя')
    preferences = models.JSONField(default=dict, verbose_name='Настройки')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ui_preferences'
        verbose_name = 'Настройка интерфейса'
        verbose_name_plural = 'Настройки интерфейса'

    def __str__(self):
        return f'{self.user_id}'
