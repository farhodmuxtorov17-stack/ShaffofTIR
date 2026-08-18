from django.core.management.base import BaseCommand
from django.utils import timezone
from shaffoftir_api.models.user import SystemUser
from shaffoftir_api.models.hr import HREmployee, HRDepartment
from shaffoftir_api.models.weapon import Weapon
from shaffoftir_api.models.range import ShootingRange, RangeRubeg, ShootingLane
from shaffoftir_api.models.session import ShootingSession, Soldier, Shot
from shaffoftir_api.models.session_flow import ShootingSessionFlow
from shaffoftir_api.models.training import TrainingPlan, TrainingAssignment
from shaffoftir_api.models.tb_test import TBSafetyTest
from shaffoftir_api.models.protocol import Protocol
from shaffoftir_api.models.camera import LaneCamera
from shaffoftir_api.models.schedule import RangeSchedule
from shaffoftir_api.models.notification import AppNotification
from shaffoftir_api.models.audit import AuditLog
import uuid

class Command(BaseCommand):
    help = 'Seed demo data for ShaffofTIR'

    def handle(self, *args, **options):
        self.stdout.write('Seeding ShaffofTIR demo data...')

        # --- Users ---
        if not SystemUser.objects.filter(email='admin@shaffoftir.uz').exists():
            SystemUser.objects.create_superuser(
                email='admin@shaffoftir.uz', username='admin',
                password='admin123', full_name='Системный Администратор', role='SUPER_ADMIN',
            )
            self.stdout.write('  ✓ SUPER_ADMIN: admin@shaffoftir.uz / admin123')
        
        if not SystemUser.objects.filter(email='instructor@shaffoftir.uz').exists():
            SystemUser.objects.create_user(
                email='instructor@shaffoftir.uz', username='instructor',
                password='inst123', full_name='Тошматов Ф.Ш.', role='INSTRUCTOR',
                rank='Старшина', department='Огневая подготовка',
            )
            self.stdout.write('  ✓ INSTRUCTOR: instructor@shaffoftir.uz / inst123')
        
        if not SystemUser.objects.filter(email='manager@shaffoftir.uz').exists():
            SystemUser.objects.create_user(
                email='manager@shaffoftir.uz', username='manager',
                password='mgr123', full_name='Рахбар Менеджер', role='MANAGER',
            )
            self.stdout.write('  ✓ MANAGER: manager@shaffoftir.uz / mgr123')
        
        if not SystemUser.objects.filter(email='tech@shaffoftir.uz').exists():
            SystemUser.objects.create_user(
                email='tech@shaffoftir.uz', username='techspec',
                password='tech123', full_name='Технический Специалист', role='TECHSPEC',
            )
            self.stdout.write('  ✓ TECHSPEC: tech@shaffoftir.uz / tech123')

        # --- Departments ---
        depts = [
            {'name': '1-я рота', 'code': 'R1', 'head': 'Алиев Б.У.'},
            {'name': '2-я рота', 'code': 'R2', 'head': 'Каримов А.У.'},
            {'name': '3-я рота', 'code': 'R3', 'head': 'Кадыров У.Т.'},
            {'name': 'Разведвзвод', 'code': 'RV', 'head': 'Назаров Б.Х.'},
            {'name': 'Огневая подготовка', 'code': 'OP', 'head': 'Тошматов Ф.Ш.'},
        ]
        for d in depts:
            HRDepartment.objects.get_or_create(code=d['code'], defaults=d)

        # --- Employees ---
        emps_data = [
            ('e001', 'Алиев Бахтиёр Убайдуллаевич', 'Капитан', 'Командир взвода', '1-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Юкоркорганский район', 'AZ-2024-001', '1990-05-15', '2015-06-01', True, True, 'ADVANCED', 24, 1850, 78),
            ('e002', 'Рахимов Жасур Тошпулатович', 'Лейтенант', 'Командир отделения', '1-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Юкоркорганский район', 'AZ-2024-002', '1992-08-20', '2017-03-15', True, True, 'INTERMEDIATE', 18, 1320, 71),
            ('e003', 'Юлдашев Дилшод Абдуллажонович', 'Сержант', 'Стрелок', '1-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Юкоркорганский район', 'AZ-2024-003', '1995-01-10', '2019-09-01', True, True, 'EXPERT', 32, 2400, 85),
            ('e004', 'Хасанов Отабек Рустамович', 'Рядовой', 'Стрелок', '1-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Юкоркорганский район', 'AZ-2024-004', '2000-03-25', '2023-01-15', True, True, 'BEGINNER', 4, 220, 48),
            ('e005', 'Махмудов Сардор Бахтиёрович', 'Ст. сержант', 'Зам. командира взвода', '1-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Юкоркорганский район', 'AZ-2024-005', '1988-11-30', '2012-05-20', True, True, 'EXPERT', 45, 3200, 91),
            ('e006', 'Каримов Азиз Улугбекович', 'Ефрейтор', 'Стрелок-снайпер', '2-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Кибрайский район', 'AZ-2024-006', '1993-07-12', '2016-11-01', True, True, 'EXPERT', 38, 2800, 88),
            ('e007', 'Эргашев Бекзод Турсунович', 'Рядовой', 'Стрелок', '2-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Кибрайский район', 'AZ-2024-007', '2001-02-14', '2024-01-10', False, False, 'BEGINNER', 1, 60, 38),
            ('e008', 'Тошматов Фирдавс Шерзодович', 'Старшина', 'Старший инструктор', 'Огневая подготовка', 'Штаб', 'Ташкентская область', 'Мирабадский район', 'AZ-2024-008', '1985-09-05', '2008-04-15', True, True, 'EXPERT', 120, 9800, 95),
            ('e009', 'Норматов Жамшид Анварович', 'Сержант', 'Стрелок', '2-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Кибрайский район', 'AZ-2024-009', '1994-04-18', '2018-07-01', True, True, 'INTERMEDIATE', 16, 1180, 68),
            ('e010', 'Умаров Шерзод Бахтиёрович', 'Рядовый', 'Стрелок', '2-я рота', 'Батальон "Ширин"', 'Ташкентская область', 'Кибрайский район', 'AZ-2024-010', '1999-12-03', '2022-06-15', True, True, 'BEGINNER', 6, 340, 52),
            ('e011', 'Кадыров Улугбек Тошпулатович', 'Ст. лейтенант', 'Командир взвода', '3-я рота', 'Батальон "Ширин"', 'Самаркандская область', 'Самаркандский район', 'AZ-2024-011', '1989-06-22', '2014-02-10', True, True, 'ADVANCED', 28, 2100, 80),
            ('e012', 'Собиров Бахром Исломович', 'Сержант', 'Стрелок', '3-я рота', 'Батальон "Ширин"', 'Самаркандская область', 'Самаркандский район', 'AZ-2024-012', '1996-10-08', '2020-03-01', True, True, 'INTERMEDIATE', 14, 980, 65),
        ]
        
        for ed in emps_data:
            (eid, name, rank, pos, dept, unit, region, district, pn, birth, hire, sq, tb, qual, ts, tsc, acc) = ed
            HREmployee.objects.get_or_create(
                personal_number=pn,
                defaults={
                    'full_name': name, 'rank': rank, 'position': pos,
                    'department': dept, 'unit': unit, 'region': region, 'district': district,
                    'battalion': dept, 'birth_date': birth, 'phone': '+99890' + eid[1:] * 6,
                    'status': 'ACTIVE', 'hire_date': hire,
                    'shooting_qualified': sq, 'tb_test_passed': tb,
                    'qualification_level': qual, 'total_sessions': ts,
                    'total_score': tsc, 'avg_accuracy': acc,
                }
            )
        self.stdout.write(f'  ✓ {HREmployee.objects.count()} employees')

        # --- Weapons ---
        weapons_data = [
            ('ПМ', 'PISTOL', 'ПМ-2024-001', '9мм', 'Ижевск', 50, '9x18 ПМ'),
            ('ПМ', 'PISTOL', 'ПМ-2024-002', '9мм', 'Ижевск', 50, '9x18 ПМ'),
            ('АК-74', 'RIFLE', 'АК-2024-001', '5.45мм', 'Тула', 500, '5.45x39'),
            ('АК-74', 'RIFLE', 'АК-2024-002', '5.45мм', 'Тула', 500, '5.45x39'),
            ('АК-74', 'RIFLE', 'АК-2024-003', '5.45мм', 'Тула', 500, '5.45x39'),
            ('АКС-74У', 'SMG', 'АКС-2024-001', '5.45мм', 'Тула', 200, '5.45x39'),
            ('СВД', 'SNIPER', 'СВД-2024-001', '7.62мм', 'Тула', 1300, '7.62x54R'),
            ('РПК-74', 'MACHINE_GUN', 'РПК-2024-001', '5.45мм', 'Тула', 1000, '5.45x39'),
        ]
        for wd in weapons_data:
            (name, cat, sn, cal, mfr, rng, ammo) = wd
            Weapon.objects.get_or_create(
                serial_number=sn,
                defaults={'name': name, 'category': cat, 'caliber': cal,
                          'manufacturer': mfr, 'max_range_m': rng, 'ammo_type': ammo,
                          'status': 'AVAILABLE', 'condition': 'EXCELLENT'}
            )
        self.stdout.write(f'  ✓ {Weapon.objects.count()} weapons')

        # --- Ranges + Rubegs ---
        range1, _ = ShootingRange.objects.get_or_create(
            name='Полигон Зангиата',
            defaults={'location': 'Ташкентская область, Зангиатинский район', 'range_type': 'CLOSED', 'ip_prefix': '88.1.92.x'}
        )
        range2, _ = ShootingRange.objects.get_or_create(
            name='Полигон Самарканд',
            defaults={'location': 'Самаркандская область', 'range_type': 'OPEN', 'ip_prefix': '88.2.10.x'}
        )

        rubeg1, _ = RangeRubeg.objects.get_or_create(
            range=range1, name='Рубеж 1 (25м)',
            defaults={'weapon_type': 'RIFLE', 'distance_m': 25, 'lane_count': 6}
        )
        rubeg2, _ = RangeRubeg.objects.get_or_create(
            range=range1, name='Рубеж 2 (50м)',
            defaults={'weapon_type': 'RIFLE', 'distance_m': 50, 'lane_count': 6}
        )
        rubeg3, _ = RangeRubeg.objects.get_or_create(
            range=range1, name='Рубеж 3 (100м)',
            defaults={'weapon_type': 'SNIPER', 'distance_m': 100, 'lane_count': 4}
        )
        self.stdout.write(f'  ✓ {ShootingRange.objects.count()} ranges, {RangeRubeg.objects.count()} rubegs')

        # --- Lanes (unique lane_number per range)
        lane_counter = 0
        for r in [rubeg1, rubeg2]:
            for i in range(1, r.lane_count + 1):
                lane_counter += 1
                ShootingLane.objects.get_or_create(
                    range=range1, rubeg=r, lane_number=lane_counter,
                    defaults={
                        'name': f'Дорожка {lane_counter}',
                        'status': 'AVAILABLE',
                        'target_type': 'STANDARD',
                        'distance_m': r.distance_m,
                        'camera_status': 'ONLINE',
                        'camera_ip': f'88.1.92.{20+lane_counter}',
                    }
                )
        for i in range(1, rubeg3.lane_count + 1):
            lane_counter += 1
            ShootingLane.objects.get_or_create(
                range=range1, rubeg=rubeg3, lane_number=lane_counter,
                defaults={
                    'name': f'Снайпер {i}',
                    'status': 'AVAILABLE',
                    'target_type': 'CIRCLE',
                    'distance_m': 100,
                    'camera_status': 'ONLINE',
                    'camera_ip': f'88.1.92.{20+lane_counter}',
                }
            )
        # Range2 lanes
        rubeg_r2, _ = RangeRubeg.objects.get_or_create(
            range=range2, name='Рубеж 1 (50м)',
            defaults={'weapon_type': 'RIFLE', 'distance_m': 50, 'lane_count': 4}
        )
        for i in range(1, 5):
            lane_counter += 1
            ShootingLane.objects.get_or_create(
                range=range2, rubeg=rubeg_r2, lane_number=i,
                defaults={
                    'name': f'Дорожка {i}',
                    'status': 'AVAILABLE',
                    'target_type': 'STANDARD',
                    'distance_m': 50,
                    'camera_status': 'OFFLINE',
                    'camera_ip': f'88.2.10.{20+i}',
                }
            )
        self.stdout.write(f'  ✓ {ShootingLane.objects.count()} lanes')

        # --- Cameras ---
        for lane in ShootingLane.objects.all():
            if lane.camera_ip:
                LaneCamera.objects.get_or_create(
                    camera_ip=lane.camera_ip, lane_number=lane.lane_number,
                    defaults={'lane': lane, 'name': f'Camera Lane {lane.lane_number}',
                              'username': 'admin', 'password': 'admin', 'status': 'ONLINE'}
                )
        self.stdout.write(f'  ✓ {LaneCamera.objects.count()} cameras')

        # --- Training Plans ---
        plans = [
            ('Базовая подготовка', 'BASIC', 30, 10, 25, 70, ['PISTOL', 'RIFLE']),
            ('Стрелковая квалификация', 'INTERMEDIATE', 45, 15, 50, 75, ['RIFLE']),
            ('Снайперская подготовка', 'ADVANCED', 60, 20, 100, 80, ['SNIPER']),
            ('Скоростная стрельба', 'ELITE', 40, 20, 25, 85, ['RIFLE', 'SMG']),
        ]
        for pn, diff, dur, shots, dist, ps, cats in plans:
            TrainingPlan.objects.get_or_create(
                name=pn,
                defaults={'difficulty': diff, 'duration_minutes': dur, 'required_shots': shots,
                          'target_distance_m': dist, 'passing_score': ps, 'weapon_categories': cats}
            )
        self.stdout.write(f'  ✓ {TrainingPlan.objects.count()} training plans')

        # --- TB Safety Test ---
        tb_test = TBSafetyTest.objects.first()
        if not tb_test:
            TBSafetyTest.objects.create(
                title='ТБ — Техника безопасности',
                description='Обязательный тест на 100% для допуска на полигон',
                passing_score=100,
                duration_minutes=15,
                questions=[
                    {'id': 'q1', 'question': 'Можно ли направлять оружие в сторону людей?', 'question_uz': 'Qurolni odamlar tomoniga yoʻnaltirish mumkinmi?', 'options': ['Да', 'Нет', 'Только в тире', 'Если разряжено'], 'correct_index': 1},
                    {'id': 'q2', 'question': 'Когда можно заряжать оружие?', 'question_uz': 'Qurolni qachon zaryadlash mumkin?', 'options': ['Когда захочу', 'Только на огневом рубеже по команде', 'В любой момент', 'Перед входом в тир'], 'correct_index': 1},
                    {'id': 'q3', 'question': 'Что делать при осечке?', 'question_uz': 'Oʻq otmasa nima qilish kerak?', 'options': ['Сразу перезарядить', 'Подождать 5 секунд,保持 ствол в безопасном направлении', 'Ударить по затвору', 'Осмотреть ствол'], 'correct_index': 1},
                    {'id': 'q4', 'question': 'Где должен находиться палец на спуске?', 'question_uz': 'Otish tugmasida barmogʻ qayerda boʻlishi kerak?', 'options': ['Всегда на спуске', 'На скобе спуска, до команды', 'В кармане', 'Не имеет значения'], 'correct_index': 1},
                    {'id': 'q5', 'question': 'Что нужно для допуска на полигон?', 'question_uz': 'Poligonga chiqish uchun nima kerak?', 'options': ['Только оружие', 'ТБ тест на 100% + допуск', 'Боевая готовность', 'Ничего'], 'correct_index': 1},
                ],
            )
        self.stdout.write(f'  ✓ TB Safety Test')

        # --- Sample sessions ---
        if ShootingSession.objects.count() == 0:
            emp = HREmployee.objects.first()
            weapon = Weapon.objects.first()
            session = ShootingSession.objects.create(
                status='ARCHIVED',
                scoring_mode='POINTS',
                range_name='Полигон Зангиата',
                lane_number=1,
                employee_id=emp.id,
                employee_name=emp.full_name,
                employee_rank=emp.rank,
                employee_department=emp.department,
                weapon_name=weapon.name,
                weapon_category=weapon.category,
                instructor_name='Тошматов Ф.Ш.',
                total_score=82,
                total_shots=10,
                hit_count=8,
                miss_count=2,
                accuracy=80.0,
                passed=True,
                completed_at=timezone.now(),
            )
            session.session_id = f"sh-{session.id}"
            session.save()
            
            soldier = Soldier.objects.create(
                session=session, sequence_number=1,
                employee_id=emp.id, employee_name=emp.full_name,
                total_score=82, hit_count=8, miss_count=2, accuracy=80.0, passed=True,
            )
            for i in range(10):
                Shot.objects.create(
                    session=session, soldier=soldier, shot_type='MAIN',
                    x=0.5 + (i * 0.01), y=0.5 - (i * 0.02),
                    score=10 if i < 8 else 0, is_hit=i < 8,
                    soldier_seq=1, shot_number=i + 1,
                )
            
            Protocol.objects.create(
                session=session,
                session_id_str=session.session_id,
                employee_id=emp.id,
                employee_name=emp.full_name,
                employee_rank=emp.rank,
                employee_department=emp.department,
                weapon_name=weapon.name,
                instructor_name='Тошматов Ф.Ш.',
                total_shots=10, hit_count=8, miss_count=2,
                total_score=82, accuracy=80.0, passed=True,
                qualification='PASSED', status='APPROVED',
                location='Полигон Зангиата', lane_number=1,
            )
            self.stdout.write('  ✓ 1 sample session + protocol')

        # --- Notifications ---
        if AppNotification.objects.count() == 0:
            AppNotification.objects.create(type='INFO', title='Добро пожаловать', message='Система ShaffofTIR готова к работе')
            AppNotification.objects.create(type='SYSTEM', title='Камеры онлайн', message='Все камеры полигона Зангиата активны')
        
        # --- Audit Log ---
        if AuditLog.objects.count() == 0:
            AuditLog.objects.create(actor_name='Системный Администратор', actor_role='SUPER_ADMIN',
                                     action='SYSTEM_INIT', module='Система', details='Инициализация системы', ip_address='88.1.92.1')
            AuditLog.objects.create(actor_name='Тошматов Ф.Ш.', actor_role='INSTRUCTOR',
                                     action='SESSION_START', module='Сессии', details='Начата сессия для Алиев Б.У. на дорожке №1', ip_address='88.1.92.15')

        self.stdout.write(self.style.SUCCESS('\n✅ Seed complete!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('  SUPER_ADMIN:  admin@shaffoftir.uz / admin123')
        self.stdout.write('  INSTRUCTOR:   instructor@shaffoftir.uz / inst123')
        self.stdout.write('  MANAGER:      manager@shaffoftir.uz / mgr123')
        self.stdout.write('  TECHSPEC:     tech@shaffoftir.uz / tech123')
