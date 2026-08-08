"""
Protocol, OperatorComment, ReviewReason models.
"""
import uuid
from django.db import models


class Protocol(models.Model):
    """Протокол стрельбы"""
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Черновик'
        SIGNED = 'SIGNED', 'Подписан'
        ARCHIVED = 'ARCHIVED', 'Архив'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        'shaffoftir_api.Session', on_delete=models.CASCADE,
        related_name='protocols', verbose_name='Сессия'
    )
    soldier = models.ForeignKey(
        'shaffoftir_api.Soldier', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='protocols'
    )
    employee_name = models.CharField(max_length=255, verbose_name='Сотрудник')
    employee_rank = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=255, blank=True, default='')
    weapon_name = models.CharField(max_length=255, blank=True, default='')
    instructor_name = models.CharField(max_length=255, blank=True, default='', verbose_name='Инструктор')
    test_score = models.IntegerField(default=0, verbose_name='Пробный балл')
    main_score = models.IntegerField(default=0, verbose_name='Зачётный балл')
    total_score = models.IntegerField(default=0, verbose_name='Итоговый балл')
    test_shots = models.IntegerField(default=0, verbose_name='Пробных выстрелов')
    main_shots = models.IntegerField(default=0, verbose_name='Зачётных выстрелов')
    hit_count = models.IntegerField(default=0, verbose_name='Попаданий')
    miss_count = models.IntegerField(default=0, verbose_name='Промахов')
    accuracy = models.FloatField(default=0, verbose_name='Точность %')
    passed = models.BooleanField(default=False, verbose_name='Сдано')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT,
        verbose_name='Статус'
    )
    before_image_url = models.URLField(blank=True, null=True, verbose_name='Фото До')
    after_image_url = models.URLField(blank=True, null=True, verbose_name='Фото После')
    ai_analysis = models.JSONField(null=True, blank=True, verbose_name='автоматический анализ')
    instructor_notes = models.TextField(blank=True, default='', verbose_name='Заметки инструктора')
    qr_code_url = models.URLField(blank=True, null=True, verbose_name='QR-код')
    signed_at = models.DateTimeField(null=True, blank=True, verbose_name='Подписан')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'protocols'
        verbose_name = 'Протокол'
        verbose_name_plural = 'Протоколы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Протокол {str(self.id)[:8]} - {self.employee_name}'


class OperatorComment(models.Model):
    """Комментарий оператора к стрелку"""
    session = models.ForeignKey(
        'shaffoftir_api.Session', on_delete=models.CASCADE,
        related_name='operator_comments'
    )
    soldier_seq = models.IntegerField(verbose_name='№ стрелка')
    comment = models.TextField(verbose_name='Комментарий')
    author = models.CharField(max_length=255, verbose_name='Автор')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'operator_comments'
        verbose_name = 'Комментарий оператора'
        verbose_name_plural = 'Комментарии оператора'
        ordering = ['session', 'soldier_seq', 'created_at']

    def __str__(self):
        return f'#{self.soldier_seq}: {self.comment[:50]}'


class ReviewReason(models.Model):
    """Причина возврата на доработку"""
    session = models.ForeignKey(
        'shaffoftir_api.Session', on_delete=models.CASCADE,
        related_name='review_reasons'
    )
    soldier_seq = models.IntegerField(null=True, blank=True, verbose_name='№ стрелка')
    reason = models.TextField(verbose_name='Причина')
    reviewer = models.CharField(max_length=255, verbose_name='Проверяющий')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review_reasons'
        verbose_name = 'Причина возврата'
        verbose_name_plural = 'Причины возврата'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.reason[:60]} - {self.reviewer}'
