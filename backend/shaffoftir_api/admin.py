"""
Регистрация всех моделей в админ-панели.
"""
from django.contrib import admin
from shaffoftir_api.models import (
    User, Permission, Employee, Department,
    Weapon, WeaponAssignment,
    Session, Soldier, Shot, ShootingLane, Camera, RangeSchedule,
    TrainingPlan, TrainingAssignment,
    Protocol, OperatorComment, ReviewReason,
    Notification, AuditAnnotation, SavedFilter, UIPreference,
)


# Простой регистрация для всех моделей
models_to_register = [
    Permission, Employee, Department,
    Weapon, WeaponAssignment,
    Soldier, Shot, ShootingLane, Camera, RangeSchedule,
    TrainingPlan, TrainingAssignment,
    Protocol, OperatorComment, ReviewReason,
    Notification, AuditAnnotation, SavedFilter, UIPreference,
]

for model in models_to_register:
    admin.site.register(model, type(f'{model.__name__}Admin', (admin.ModelAdmin,), {
        'list_display': [f.name for f in model._meta.fields if f.name != 'id'][:8],
        'search_fields': [f.name for f in model._meta.fields if f.name in
                          ('full_name', 'name', 'title', 'employee_name', 'code', 'serial_number', 'action')],
        'list_per_page': 25,
    }))

# Custom admin для User
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'role', 'department', 'is_active_user', 'last_login']
    list_filter = ['role', 'is_active_user', 'department']
    search_fields = ['email', 'full_name', 'phone', 'rank']
    list_per_page = 25


# Custom admin для Session
@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee_name', 'weapon_name', 'status', 'score', 'accuracy', 'created_at']
    list_filter = ['status', 'shot_type']
    search_fields = ['employee_name', 'instructor_name', 'weapon_name']
    date_hierarchy = 'created_at'
    list_per_page = 25
