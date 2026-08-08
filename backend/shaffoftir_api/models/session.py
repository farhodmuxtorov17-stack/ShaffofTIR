"""
Session, Soldier, Shot, ShootingLane, Camera, RangeSchedule models.
"""
import uuid
from django.db import models


class ShootingLane(models.Model):
    """Дорожка тира"""
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Доступна'
        OCCUPIED = 'OCCUPIED', 'Занята'
        MAINTENANCE = 'MAINTENANCE', 'Обслуживание'
        RESERVED = 'RESERVED', 'Зарезервирована'

    class TargetType(models.TextChoices):
        STANDARD = 'STANDARD', 'Стандарт'
        SILHOUETTE = 'SILHOUETTE', 'Силуэт'
        CIRCLE = 'CIRCLE', 'Круглая'
        CUSTOM = 'CUSTOM', 'Пользовательская'

    lane_number = models.IntegerField(unique=True, verbose_name='Номер дорожки')
    name = models.CharField(max_length=255, verbose_name='Название')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.AVAILABLE,
        verbose_name='Статус'
    )
    current_employee_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Текущий стрелок')
    current_employee_seq = models.IntegerField(null=True, blank=True)
    camera = models.ForeignKey(
        'Camera', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='lanes', verbose_name='Камера'
    )
    camera_status = models.CharField(max_length=20, default='OFFLINE')
    target_type = models.CharField(
        max_length=20, choices=TargetType.choices, default=TargetType.STANDARD,
        verbose_name='Тип мишени'
    )
    distance_m = models.IntegerField(default=25, verbose_name='Дистанция (м)')
    weapon_assigned = models.CharField(max_length=255, blank=True, null=True, verbose_name='Оружие')
    session_start_time = models.DateTimeField(null=True, blank=True)
    has_3d_preview = models.BooleanField(default=False)
    current_shots_fired = models.IntegerField(default=0)
    current_score = models.IntegerField(default=0)
    current_soldier_seq = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'shooting_lanes'
        verbose_name = 'Дорожка тира'
        verbose_name_plural = 'Дорожки тира'
        ordering = ['lane_number']

    def __str__(self):
        return f'Дорожка {self.lane_number} ({self.status})'


class Camera(models.Model):
    """Камера дорожки"""
    class Status(models.TextChoices):
        ONLINE = 'ONLINE', 'Онлайн'
        OFFLINE = 'OFFLINE', 'Офлайн'
        CONNECTING = 'CONNECTING', 'Подключение'

    lane_number = models.IntegerField(verbose_name='Номер дорожки')
    name = models.CharField(max_length=255, verbose_name='Название')
    camera_ip = models.CharField(max_length=100, verbose_name='IP-адрес')
    username = models.CharField(max_length=100, blank=True, default='admin')
    password = models.CharField(max_length=100, blank=True, default='')
    label = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OFFLINE,
        verbose_name='Статус'
    )
    resolution = models.CharField(max_length=50, default='1920x1080')
    fps = models.IntegerField(default=25)
    has_recording = models.BooleanField(default=False)
    has_3d_overlay = models.BooleanField(default=False)
    last_motion_detected = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cameras'
        verbose_name = 'Камера'
        verbose_name_plural = 'Камеры'
        ordering = ['lane_number']

    def __str__(self):
        return f'Камера L{self.lane_number} ({self.camera_ip}) - {self.status}'


class Session(models.Model):
    """Стрелковая сессия"""
    class Status(models.TextChoices):
        IDLE = 'IDLE', 'Ожидание'
        SESSION_CREATED = 'SESSION_CREATED', 'Сессия создана'
        TEST_READY = 'TEST_READY', 'Пробный: готов'
        TEST_ACTIVE = 'TEST_ACTIVE', 'Пробный: идёт'
        TEST_PROCESSING = 'TEST_PROCESSING', 'Пробный: обработка'
        TEST_COMPLETED = 'TEST_COMPLETED', 'Пробный: завершён'
        MAIN_READY = 'MAIN_READY', 'Зачётный: готов'
        MAIN_ACTIVE = 'MAIN_ACTIVE', 'Зачётный: идёт'
        MAIN_PROCESSING = 'MAIN_PROCESSING', 'Зачётный: обработка'
        MAIN_COMPLETED = 'MAIN_COMPLETED', 'Зачётный: завершён'
        REVIEW = 'REVIEW', 'Проверка'
        APPROVED = 'APPROVED', 'Утверждено'
        ARCHIVED = 'ARCHIVED', 'Архив'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lane = models.ForeignKey(ShootingLane, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
    employee = models.ForeignKey(
        'shaffoftir_api.Employee', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sessions', verbose_name='Сотрудник'
    )
    employee_name = models.CharField(max_length=255, blank=True, default='')
    employee_rank = models.CharField(max_length=100, blank=True, default='')
    weapon = models.ForeignKey(
        'shaffoftir_api.Weapon', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sessions', verbose_name='Оружие'
    )
    weapon_name = models.CharField(max_length=255, blank=True, default='')
    weapon_category = models.CharField(max_length=20, blank=True, default='')
    instructor = models.CharField(max_length=255, blank=True, default='', verbose_name='Инструктор')
    instructor_name = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.SESSION_CREATED,
        verbose_name='Статус'
    )
    shot_type = models.CharField(max_length=10, default='TEST', verbose_name='Тип стрельбы')
    expected_shots = models.IntegerField(default=10, verbose_name='Ожидаемое кол-во выстрелов')
    rounds_fired = models.IntegerField(default=0, verbose_name='Патронов израсходовано')
    score = models.IntegerField(default=0, verbose_name='Балл')
    accuracy = models.FloatField(default=0, verbose_name='Точность %')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='Начало')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Завершение')
    notes = models.TextField(blank=True, default='', verbose_name='Заметки')
    camera_stream_url = models.URLField(blank=True, null=True)
    soldier_count = models.IntegerField(default=1, verbose_name='Кол-во стрелков')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sessions'
        verbose_name = 'Сессия'
        verbose_name_plural = 'Сессии'
        ordering = ['-created_at']

    def __str__(self):
        return f'Сессия {str(self.id)[:8]} - {self.employee_name} ({self.status})'


class Soldier(models.Model):
    """Стрелок в рамках сессии"""
    class Status(models.TextChoices):
        WAITING = 'WAITING', 'Ожидание'
        READY = 'READY', 'Готов'
        SHOOTING = 'SHOOTING', 'Стреляет'
        COMPLETED = 'COMPLETED', 'Завершён'
        CANCELLED = 'CANCELLED', 'Отменён'

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='soldiers')
    sequence_number = models.IntegerField(verbose_name='Порядковый номер')
    employee = models.ForeignKey(
        'shaffoftir_api.Employee', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='soldier_records'
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.WAITING,
        verbose_name='Статус'
    )
    test_image_url = models.URLField(blank=True, null=True, verbose_name='Фото пробной мишени')
    main_image_url = models.URLField(blank=True, null=True, verbose_name='Фото зачётной мишени')
    test_score = models.IntegerField(default=0, verbose_name='Пробный балл')
    main_score = models.IntegerField(default=0, verbose_name='Зачётный балл')
    test_hit_count = models.IntegerField(default=0, verbose_name='Пробные попадания')
    main_hit_count = models.IntegerField(default=0, verbose_name='Зачётные попадания')
    miss_count = models.IntegerField(default=0, verbose_name='Промахи')
    total_shots = models.IntegerField(default=0, verbose_name='Всего выстрелов')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'soldiers'
        verbose_name = 'Стрелок (сессия)'
        verbose_name_plural = 'Стрелки (сессии)'
        ordering = ['session', 'sequence_number']
        unique_together = ('session', 'sequence_number')

    def __str__(self):
        return f'Стрелок #{self.sequence_number} - {self.session}'


class Shot(models.Model):
    """Выстрел (координата попадания)"""
    class ShotType(models.TextChoices):
        TEST = 'TEST', 'Пробный'
        MAIN = 'MAIN', 'Зачётный'

    soldier = models.ForeignKey(Soldier, on_delete=models.CASCADE, related_name='shots')
    shot_type = models.CharField(max_length=10, choices=ShotType.choices, verbose_name='Тип')
    x = models.FloatField(verbose_name='X (мм)')
    y = models.FloatField(verbose_name='Y (мм)')
    score = models.IntegerField(default=0, verbose_name='Оценка')
    is_hit = models.BooleanField(default=True, verbose_name='Попадание')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shots'
        verbose_name = 'Выстрел'
        verbose_name_plural = 'Выстрелы'
        ordering = ['soldier', 'id']

    def __str__(self):
        return f'{self.shot_type} ({self.x:.1f}, {self.y:.1f}) - {self.score}'


class RangeSchedule(models.Model):
    """Расписание тира"""
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Запланировано'
        IN_PROGRESS = 'IN_PROGRESS', 'Идёт'
        COMPLETED = 'COMPLETED', 'Завершено'
        CANCELLED = 'CANCELLED', 'Отменено'

    date = models.DateField(verbose_name='Дата')
    time_slot = models.CharField(max_length=100, verbose_name='Временной слот')
    lane_numbers = models.JSONField(default=list, verbose_name='Дорожки')
    department = models.CharField(max_length=255, verbose_name='Подразделение')
    instructor_name = models.CharField(max_length=255, verbose_name='Инструктор')
    employee_count = models.IntegerField(default=0, verbose_name='Кол-во сотрудников')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED,
        verbose_name='Статус'
    )
    weapon_categories = models.JSONField(default=list, verbose_name='Категории оружия')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'range_schedules'
        verbose_name = 'Расписание тира'
        verbose_name_plural = 'Расписание тира'
        ordering = ['date', 'time_slot']

    def __str__(self):
        return f'{self.date} {self.time_slot} - {self.department}'
