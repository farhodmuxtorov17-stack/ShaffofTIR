from django.db import models
import uuid

WEAPON_CATEGORY = [
    ('PISTOL', 'Пистолет'),
    ('RIFLE', 'Автомат'),
    ('SMG', 'ПП'),
    ('SNIPER', 'Снайперская'),
    ('SHOTGUN', 'Дробовик'),
    ('MACHINE_GUN', 'Пулемёт'),
]

WEAPON_STATUS = [
    ('AVAILABLE', 'Доступно'),
    ('IN_USE', 'В использовании'),
    ('MAINTENANCE', 'На обслуживании'),
    ('DECOMMISSIONED', 'Списано'),
]

WEAPON_CONDITION = [
    ('EXCELLENT', 'Отличное'),
    ('GOOD', 'Хорошее'),
    ('FAIR', 'Удовлетворительное'),
    ('POOR', 'Плохое'),
]

class Weapon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=WEAPON_CATEGORY)
    serial_number = models.CharField(max_length=100, unique=True)
    caliber = models.CharField(max_length=50)
    manufacturer = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=WEAPON_STATUS, default='AVAILABLE')
    condition = models.CharField(max_length=20, choices=WEAPON_CONDITION, default='GOOD')
    assigned_to = models.CharField(max_length=255, blank=True, null=True)
    last_maintenance = models.DateTimeField(blank=True, null=True)
    total_shots_fired = models.IntegerField(default=0)
    image_url = models.URLField(blank=True, null=True)
    max_range_m = models.IntegerField(default=100)
    ammo_type = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weapons'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

ASSIGNMENT_STATUS = [
    ('ASSIGNED', 'Назначено'),
    ('RETURNED', 'Возвращено'),
    ('LOST', 'Утеряно'),
]

class WeaponAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    weapon = models.ForeignKey(Weapon, on_delete=models.CASCADE, related_name='assignments')
    weapon_name = models.CharField(max_length=255, blank=True)
    employee_id = models.CharField(max_length=255)
    employee_name = models.CharField(max_length=255)
    session_id = models.CharField(max_length=255, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(blank=True, null=True)
    rounds_fired = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=ASSIGNMENT_STATUS, default='ASSIGNED')

    class Meta:
        db_table = 'weapon_assignments'
        ordering = ['-assigned_at']

    def save(self, *args, **kwargs):
        if not self.weapon_name:
            self.weapon_name = self.weapon.name
        super().save(*args, **kwargs)
