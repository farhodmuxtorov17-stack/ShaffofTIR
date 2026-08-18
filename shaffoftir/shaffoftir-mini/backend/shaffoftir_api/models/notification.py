from django.db import models
import uuid

NOTIF_TYPE = [
    ('INFO', 'Инфо'),
    ('SUCCESS', 'Успех'),
    ('WARNING', 'Предупреждение'),
    ('ERROR', 'Ошибка'),
    ('TRAINING', 'Обучение'),
    ('SYSTEM', 'Система'),
]

class AppNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=255, blank=True, null=True, help_text='null = broadcast')
    type = models.CharField(max_length=20, choices=NOTIF_TYPE, default='INFO')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'app_notifications'
        ordering = ['-created_at']
