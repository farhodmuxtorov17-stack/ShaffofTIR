"""
Weapon and WeaponAssignment models.
"""
from django.db import models


class Weapon(models.Model):
    """Оружие"""
    class Category(models.TextChoices):
        PISTOL = 'PISTOL', 'Пистолет'
        RIFLE = 'RIFLE', 'Винтовка'
        SMG = 'SMG', 'Автомат'
        SNIPER = 'SNIPER', 'Снайперская винтовка'
        SHOTGUN = 'SHOTGUN', 'Дробовик'
        MACHINE_GUN = 'MACHINE_GUN', 'Пулемёт'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Доступно'
        IN_USE = 'IN_USE', 'Используется'
        MAINTENANCE = 'MAINTENANCE', 'Обслуживание'
        DECOMMISSIONED = 'DECOMMISSIONED', 'Списано'

    class Condition(models.TextChoices):
        EXCELLENT = 'EXCELLENT', 'Отличное'
        GOOD = 'GOOD', 'Хорошее'
        FAIR = 'FAIR', 'Удовлетворительное'
        POOR = 'POOR', 'Плохое'

    name = models.CharField(max_length=255, verbose_name='Название')
    category = models.CharField(
        max_length=20, choices=Category.choices,
        verbose_name='Категория'
    )
    serial_number = models.CharField(max_length=100, unique=True, verbose_name='Серийный номер')
    caliber = models.CharField(max_length=50, verbose_name='Калибр')
    manufacturer = models.CharField(max_length=255, blank=True, default='', verbose_name='Производитель')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.AVAILABLE,
        verbose_name='Статус'
    )
    condition = models.CharField(
        max_length=20, choices=Condition.choices, default=Condition.EXCELLENT,
        verbose_name='Состояние'
    )
    assigned_to = models.CharField(max_length=255, blank=True, null=True, verbose_name='Закреплён за')
    last_maintenance = models.DateTimeField(null=True, blank=True, verbose_name='Последнее обслуживание')
    total_shots_fired = models.IntegerField(default=0, verbose_name='Всего выстрелов')
    image_url = models.URLField(blank=True, null=True)
    max_range_m = models.IntegerField(default=100, verbose_name='Макс. дальность (м)')
    ammo_type = models.CharField(max_length=100, blank=True, default='', verbose_name='Тип патрона')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weapons'
        verbose_name = 'Оружие'
        verbose_name_plural = 'Оружие'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.serial_number})'


class WeaponAssignment(models.Model):
    """Выдача оружия на сессию"""
    class Status(models.TextChoices):
        ASSIGNED = 'ASSIGNED', 'Выдано'
        RETURNED = 'RETURNED', 'Возвращено'
        LOST = 'LOST', 'Утеряно'

    weapon = models.ForeignKey(Weapon, on_delete=models.CASCADE, related_name='assignments')
    weapon_name = models.CharField(max_length=255, blank=True, default='')
    employee = models.CharField(max_length=255, verbose_name='Сотрудник')
    employee_id = models.CharField(max_length=100, blank=True, default='')
    session = models.ForeignKey(
        'shaffoftir_api.Session', on_delete=models.CASCADE,
        related_name='weapon_assignments', null=True, blank=True
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    rounds_fired = models.IntegerField(default=0, verbose_name='Патронов израсходовано')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ASSIGNED,
        verbose_name='Статус'
    )

    class Meta:
        db_table = 'weapon_assignments'
        ordering = ['-assigned_at']

    def __str__(self):
        return f'{self.weapon_name} → {self.employee} ({self.status})'
