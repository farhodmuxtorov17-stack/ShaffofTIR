"""
Seed command - загружает тестовые данные в БД.
Запуск: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shaffoftir_api.models import (
    Employee, Department, Weapon, ShootingLane, Camera,
    Session, Soldier, Shot, TrainingPlan, TrainingAssignment,
    Protocol, Notification,
)
from datetime import timedelta
from django.utils import timezone


User = get_user_model()


class Command(BaseCommand):
    help = 'Загружает тестовые данные ShaffofTIR'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Начало загрузки данных...'))

        # 1. Пользователи
        users_data = [
            {'email': 'admin@shaffoftir.uz', 'full_name': 'Админ Шаффов', 'role': 'MANAGER', 'username': 'admin', 'password': 'admin123', 'rank': 'Подполковник', 'department': 'Управление'},
            {'email': 'instructor@shaffoftir.uz', 'full_name': 'Иброхим Каримов', 'role': 'INSTRUCTOR', 'username': 'instructor', 'password': 'inst123', 'rank': 'Капитан', 'department': 'Батальон 1'},
            {'email': 'employee@shaffoftir.uz', 'full_name': 'Жасур Тошев', 'role': 'EMPLOYEE', 'username': 'employee', 'password': 'emp123', 'rank': 'Сержант', 'department': 'Рота 1'},
        ]
        for u in users_data:
            if not User.objects.filter(email=u['email']).exists():
                User.objects.create_user(**u)
                self.stdout.write(f'  ✓ Пользователь: {u["email"]}')

        # 2. Подразделения
        depts = [
            {'name': 'Батальон 1', 'code': 'B1', 'head': 'Майор Рахимов'},
            {'name': 'Батальон 2', 'code': 'B2', 'head': 'Майор Садиков'},
            {'name': 'Рота 1', 'code': 'R1', 'head': 'Капитан Каримов'},
            {'name': 'Рота 2', 'code': 'R2', 'head': 'Капитан Алиев'},
        ]
        for d in depts:
            Department.objects.get_or_create(code=d['code'], defaults=d)
        self.stdout.write(f'  ✓ Подразделений: {Department.objects.count()}')

        # 3. Сотрудники
        employees_data = [
            {'full_name': 'Жасур Тошев', 'rank': 'Сержант', 'position': 'Стрелок', 'department': 'Рота 1', 'region': 'Ташкент', 'personal_number': 'P-001', 'hire_date': '2022-03-15', 'shooting_qualified': True, 'qualification_level': 'INTERMEDIATE', 'total_sessions': 12, 'avg_accuracy': 78.5},
            {'full_name': 'Бахром Юлдашев', 'rank': 'Ефрейтор', 'position': 'Стрелок', 'department': 'Рота 1', 'region': 'Ташкент', 'personal_number': 'P-002', 'hire_date': '2023-01-20', 'shooting_qualified': True, 'qualification_level': 'BEGINNER', 'total_sessions': 5, 'avg_accuracy': 62.0},
            {'full_name': 'Дилшод Назаров', 'rank': 'Старший сержант', 'position': 'Старший стрелок', 'department': 'Рота 2', 'region': 'Самарканд', 'personal_number': 'P-003', 'hire_date': '2021-06-10', 'shooting_qualified': True, 'qualification_level': 'ADVANCED', 'total_sessions': 24, 'avg_accuracy': 88.3},
            {'full_name': 'Алишер Умаров', 'rank': 'Рядовой', 'position': 'Стрелок', 'department': 'Рота 2', 'region': 'Самарканд', 'personal_number': 'P-004', 'hire_date': '2024-02-01', 'shooting_qualified': False, 'qualification_level': None, 'total_sessions': 1, 'avg_accuracy': 45.0},
            {'full_name': 'Шерзод Хасанов', 'rank': 'Сержант', 'position': 'Стрелок', 'department': 'Батальон 1', 'region': 'Бухара', 'personal_number': 'P-005', 'hire_date': '2022-09-05', 'shooting_qualified': True, 'qualification_level': 'EXPERT', 'total_sessions': 30, 'avg_accuracy': 94.1},
            {'full_name': 'Отабек Рахимов', 'rank': 'Ефрейтор', 'position': 'Стрелок', 'department': 'Батальон 2', 'region': 'Андижан', 'personal_number': 'P-006', 'hire_date': '2023-07-12', 'shooting_qualified': True, 'qualification_level': 'INTERMEDIATE', 'total_sessions': 8, 'avg_accuracy': 71.2},
            {'full_name': 'Сардор Махмудов', 'rank': 'Рядовой', 'position': 'Стрелок', 'department': 'Батальон 1', 'region': 'Ташкент', 'personal_number': 'P-007', 'hire_date': '2024-01-15', 'shooting_qualified': True, 'qualification_level': 'BEGINNER', 'total_sessions': 3, 'avg_accuracy': 55.8},
            {'full_name': 'Азамат Юсупов', 'rank': 'Старшина', 'position': 'Замкомвзвода', 'department': 'Батальон 2', 'region': 'Фергана', 'personal_number': 'P-008', 'hire_date': '2020-03-01', 'shooting_qualified': True, 'qualification_level': 'ADVANCED', 'total_sessions': 18, 'avg_accuracy': 82.7},
        ]
        for e in employees_data:
            Employee.objects.get_or_create(personal_number=e['personal_number'], defaults=e)
        self.stdout.write(f'  ✓ Сотрудников: {Employee.objects.count()}')

        # 4. Оружие
        weapons_data = [
            {'name': 'АК-74М', 'category': 'RIFLE', 'serial_number': 'AK-74-001', 'caliber': '5.45×39', 'manufacturer': 'Ижмаш', 'max_range_m': 500, 'ammo_type': '5.45×39 мм'},
            {'name': 'АК-74М', 'category': 'RIFLE', 'serial_number': 'AK-74-002', 'caliber': '5.45×39', 'manufacturer': 'Ижмаш', 'max_range_m': 500, 'ammo_type': '5.45×39 мм'},
            {'name': 'ПМ', 'category': 'PISTOL', 'serial_number': 'PM-001', 'caliber': '9×18', 'manufacturer': 'Ижмех', 'max_range_m': 50, 'ammo_type': '9×18 мм'},
            {'name': 'ПМ', 'category': 'PISTOL', 'serial_number': 'PM-002', 'caliber': '9×18', 'manufacturer': 'Ижмех', 'max_range_m': 50, 'ammo_type': '9×18 мм'},
            {'name': 'СВД', 'category': 'SNIPER', 'serial_number': 'SVD-001', 'caliber': '7.62×54R', 'manufacturer': 'Ижмаш', 'max_range_m': 800, 'ammo_type': '7.62×54R'},
            {'name': 'АКС-74У', 'category': 'SMG', 'serial_number': 'AKSU-001', 'caliber': '5.45×39', 'manufacturer': 'Ижмаш', 'max_range_m': 200, 'ammo_type': '5.45×39 мм'},
        ]
        for w in weapons_data:
            Weapon.objects.get_or_create(serial_number=w['serial_number'], defaults=w)
        self.stdout.write(f'  ✓ Оружия: {Weapon.objects.count()}')

        # 5. Камеры
        for i in range(1, 8):
            Camera.objects.get_or_create(
                lane_number=i,
                defaults={
                    'name': f'Камера L{i}',
                    'camera_ip': f'192.168.1.{100+i}',
                    'username': 'admin',
                    'password': 'admin12345',
                    'status': 'ONLINE' if i <= 5 else 'OFFLINE',
                }
            )
        self.stdout.write(f'  ✓ Камер: {Camera.objects.count()}')

        # 6. Дорожки
        for i in range(1, 8):
            cam = Camera.objects.filter(lane_number=i).first()
            ShootingLane.objects.get_or_create(
                lane_number=i,
                defaults={
                    'name': f'Дорожка {i}',
                    'distance_m': 25,
                    'camera': cam,
                    'camera_status': cam.status if cam else 'OFFLINE',
                }
            )
        self.stdout.write(f'  ✓ Дорожек: {ShootingLane.objects.count()}')

        # 7. Сессии
        now = timezone.now()
        sessions_data = [
            {'employee_name': 'Жасур Тошев', 'employee_rank': 'Сержант', 'weapon_name': 'АК-74М', 'status': 'APPROVED', 'score': 82, 'accuracy': 80.0, 'rounds_fired': 10, 'started_at': now - timedelta(days=1)},
            {'employee_name': 'Дилшод Назаров', 'employee_rank': 'Старший сержант', 'weapon_name': 'СВД', 'status': 'APPROVED', 'score': 91, 'accuracy': 90.0, 'rounds_fired': 10, 'started_at': now - timedelta(days=2)},
            {'employee_name': 'Шерзод Хасанов', 'employee_rank': 'Сержант', 'weapon_name': 'АК-74М', 'status': 'REVIEW', 'score': 95, 'accuracy': 95.0, 'rounds_fired': 10, 'started_at': now - timedelta(hours=3)},
            {'employee_name': 'Бахром Юлдашев', 'employee_rank': 'Ефрейтор', 'weapon_name': 'ПМ', 'status': 'MAIN_COMPLETED', 'score': 62, 'accuracy': 60.0, 'rounds_fired': 10, 'started_at': now - timedelta(hours=1)},
            {'employee_name': 'Отабек Рахимов', 'employee_rank': 'Ефрейтор', 'weapon_name': 'АКС-74У', 'status': 'TEST_ACTIVE', 'score': 0, 'accuracy': 0, 'rounds_fired': 3, 'started_at': now - timedelta(minutes=20)},
        ]
        for s in sessions_data:
            Session.objects.create(**s)
        self.stdout.write(f'  ✓ Сессий: {Session.objects.count()}')

        # 8. Учебные планы
        plans_data = [
            {'name': 'Базовая подготовка', 'description': 'Основы стрельбы из АК-74', 'difficulty': 'BASIC', 'duration_minutes': 60, 'required_shots': 10, 'target_distance_m': 25, 'passing_score': 60, 'assigned_count': 15, 'completed_count': 12},
            {'name': 'Средний уровень', 'description': 'Стрельба с разных позиций', 'difficulty': 'INTERMEDIATE', 'duration_minutes': 90, 'required_shots': 15, 'target_distance_m': 50, 'passing_score': 70, 'assigned_count': 8, 'completed_count': 5},
            {'name': 'Продвинутый курс', 'description': 'Снайперская подготовка', 'difficulty': 'ADVANCED', 'duration_minutes': 120, 'required_shots': 20, 'target_distance_m': 100, 'passing_score': 80, 'assigned_count': 4, 'completed_count': 2},
            {'name': 'Элитная подготовка', 'description': 'Тактическая стрельба', 'difficulty': 'ELITE', 'duration_minutes': 180, 'required_shots': 30, 'target_distance_m': 200, 'passing_score': 90, 'assigned_count': 2, 'completed_count': 0},
        ]
        for p in plans_data:
            TrainingPlan.objects.get_or_create(name=p['name'], defaults=p)
        self.stdout.write(f'  ✓ Учебных планов: {TrainingPlan.objects.count()}')

        # 9. Уведомления
        notifs = [
            {'type': 'SUCCESS', 'title': 'Сессия завершена', 'message': 'Дилшод Назаров завершил стрельбу с результатом 91 балл'},
            {'type': 'WARNING', 'title': 'Камера офлайн', 'message': 'Камера L6 недоступна. Проверьте подключение.'},
            {'type': 'TRAINING', 'title': 'Назначена тренировка', 'message': 'Базовая подготовка назначена 15 сотрудникам'},
            {'type': 'INFO', 'title': 'Новый протокол', 'message': 'Протокол #2026-001 ожидает подписания'},
        ]
        for n in notifs:
            Notification.objects.create(**n)
        self.stdout.write(f'  ✓ Уведомлений: {Notification.objects.count()}')

        self.stdout.write(self.style.SUCCESS('✅ Тестовые данные загружены!'))
        self.stdout.write(self.style.WARNING('   Логин: admin@shaffoftir.uz / Пароль: admin123'))
