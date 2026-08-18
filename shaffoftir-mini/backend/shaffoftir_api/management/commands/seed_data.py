"""
Seed command for ShaffofTIR demo data.

Creates:
- 2 system users (INSTRUCTOR + TECHSPEC)
- 5 HR departments
- 12 employees
- 8 weapons
- 2 shooting ranges with 20 lanes
- 20 cameras (one per lane)
- 4 training plans
- 1 TB safety test
- 1 sample session + protocol
"""
import random
from django.core.management.base import BaseCommand
from django.utils import timezone

from shaffoftir_api.models.user import SystemUser
from shaffoftir_api.models.employee import Employee
from shaffoftir_api.models.hr import HRDepartment
from shaffoftir_api.models.weapon import Weapon, WeaponStatus
from shaffoftir_api.models.range import ShootingRange, ShootingLane, RangeRubeg, LaneStatus, CameraStatus
from shaffoftir_api.models.camera import LaneCamera
from shaffoftir_api.models.session import ShootingSession, Soldier, Shot, SessionStatus, ScoringMode, ShotType
from shaffoftir_api.models.protocol import Protocol, ProtocolStatus
from shaffoftir_api.models.training import TrainingPlan, TrainingAssignment
from shaffoftir_api.models.tb_test import TBSafetyTest
from shaffoftir_api.models.schedule import RangeSchedule
from shaffoftir_api.models.notification import AppNotification
from shaffoftir_api.models.audit import AuditLog


class Command(BaseCommand):
    help = "Seed demo data for ShaffofTIR"

    def handle(self, *args, **options):
        self.stdout.write("Seeding ShaffofTIR demo data...")

        self._seed_users()
        self._seed_departments()
        self._seed_employees()
        self._seed_weapons()
        self._seed_ranges()
        self._seed_cameras()
        self._seed_training()
        self._seed_tb_test()
        self._seed_sample_session()
        self._seed_notifications()

        self.stdout.write(self.style.SUCCESS("\n✅ Seed complete!"))
        self.stdout.write("\nLogin credentials:")
        self.stdout.write("  INSTRUCTOR:   instructor@shaffoftir.uz / inst123")
        self.stdout.write("  TECHSPEC:     tech@shaffoftir.uz / tech123")

    # ─── Users ────────────────────────────────────────────────────────────────

    def _seed_users(self):
        if not SystemUser.objects.filter(email="instructor@shaffoftir.uz").exists():
            SystemUser.objects.create_user(
                "instructor@shaffoftir.uz", "inst123",
                username="instructor",
                full_name="Тошматов Ф.Ш.", role="INSTRUCTOR",
                rank="Старшина", department="Огневая подготовка",
            )
            self.stdout.write("  ✓ INSTRUCTOR: instructor@shaffoftir.uz / inst123")

        if not SystemUser.objects.filter(email="tech@shaffoftir.uz").exists():
            SystemUser.objects.create_user(
                "tech@shaffoftir.uz", "tech123",
                username="techspec",
                full_name="Технический Специалист", role="TECHSPEC",
            )
            self.stdout.write("  ✓ TECHSPEC: tech@shaffoftir.uz / tech123")

    # ─── Departments ──────────────────────────────────────────────────────────

    def _seed_departments(self):
        depts = [
            {"name": "1-я рота", "code": "R1", "head_name": "Алиев Б.У.", "region": "Ташкент"},
            {"name": "2-я рота", "code": "R2", "head_name": "Каримов А.У.", "region": "Ташкент"},
            {"name": "3-я рота", "code": "R3", "head_name": "Кадыров У.Т.", "region": "Самарканд"},
            {"name": "Разведвзвод", "code": "RV", "head_name": "Назаров Б.Х.", "region": "Ташкент"},
            {"name": "Огневая подготовка", "code": "OP", "head_name": "Тошматов Ф.Ш.", "region": "Ташкент"},
        ]
        for d in depts:
            HRDepartment.objects.get_or_create(code=d["code"], defaults=d)
        self.stdout.write(f"  ✓ {HRDepartment.objects.count()} departments")

    # ─── Employees ────────────────────────────────────────────────────────────

    def _seed_employees(self):
        emps = [
            ("Алиев Бахтиёр Убайдуллаевич", "Капитан", "Командир взвода", "1-я рота", "Ташкент", "Юкоркорган", "AZ-001"),
            ("Рахимов Жасур Тошпулатович", "Лейтенант", "Командир отделения", "1-я рота", "Ташкент", "Юкоркорган", "AZ-002"),
            ("Юлдашев Дилшод Абдуллажонович", "Сержант", "Стрелок", "1-я рота", "Ташкент", "Юкоркорган", "AZ-003"),
            ("Хасанов Отабек Рустамович", "Рядовой", "Стрелок", "1-я рота", "Ташкент", "Юкоркорган", "AZ-004"),
            ("Махмудов Сардор Бахтиёрович", "Ст. сержант", "Зам. командира", "1-я рота", "Ташкент", "Юкоркорган", "AZ-005"),
            ("Каримов Азиз Улугбекович", "Ефрейтор", "Снайпер", "2-я рота", "Ташкент", "Кибрай", "AZ-006"),
            ("Эргашев Бекзод Турсунович", "Рядовой", "Стрелок", "2-я рота", "Ташкент", "Кибрай", "AZ-007"),
            ("Норматов Жамшид Анварович", "Сержант", "Стрелок", "2-я рота", "Ташкент", "Кибрай", "AZ-008"),
            ("Умаров Шерзод Бахтиёрович", "Рядовой", "Стрелок", "2-я рота", "Ташкент", "Кибрай", "AZ-009"),
            ("Кадыров Улугбек Тошпулатович", "Ст. лейтенант", "Командир взвода", "3-я рота", "Самарканд", "Самарканд", "AZ-010"),
            ("Собиров Бахром Исломович", "Сержант", "Стрелок", "3-я рота", "Самарканд", "Самарканд", "AZ-011"),
            ("Тошматов Фирдавс Шерзодович", "Старшина", "Инструктор", "Огневая подготовка", "Ташкент", "Мирабад", "AZ-012"),
        ]
        for i, (name, rank, pos, dept, region, district, pn) in enumerate(emps):
            qualified = i % 5 != 3  # Most are qualified
            Employee.objects.get_or_create(
                personal_number=pn,
                defaults={
                    "full_name": name, "rank": rank, "position": pos,
                    "department": dept, "region": region, "district": district,
                    "shooting_qualified": qualified,
                    "tb_test_passed": qualified,
                    "qualification_level": ["EXPERT", "ADVANCED", "INTERMEDIATE", "BEGINNER"][i % 4],
                    "total_sessions": random.randint(4, 120),
                    "total_score": random.randint(220, 9800),
                    "avg_accuracy": random.randint(48, 95),
                }
            )
        self.stdout.write(f"  ✓ {Employee.objects.count()} employees")

    # ─── Weapons ──────────────────────────────────────────────────────────────

    def _seed_weapons(self):
        weapons = [
            ("АК-74", "АК-74-001", "5.45×39", "Винтовка", WeaponStatus.AVAILABLE.value),
            ("АК-74", "АК-74-002", "5.45×39", "Винтовка", WeaponStatus.IN_USE.value),
            ("АК-74", "АК-74-003", "5.45×39", "Винтовка", WeaponStatus.AVAILABLE.value),
            ("АКМ", "АКМ-001", "7.62×39", "Винтовка", WeaponStatus.AVAILABLE.value),
            ("СВД", "СВД-001", "7.62×54", "Снайперская", WeaponStatus.AVAILABLE.value),
            ("СВД", "СВД-002", "7.62×54", "Снайперская", WeaponStatus.MAINTENANCE.value),
            ("ПМ", "ПМ-001", "9×18", "Пистолет", WeaponStatus.AVAILABLE.value),
            ("ПМ", "ПМ-002", "9×18", "Пистолет", WeaponStatus.AVAILABLE.value),
        ]
        for name, sn, caliber, cat, status in weapons:
            Weapon.objects.get_or_create(
                serial_number=sn,
                defaults={
                    "name": name, "caliber": caliber, "category": cat,
                    "condition": "Исправно", "status": status,
                    "total_shots_fired": random.randint(100, 5000),
                }
            )
        self.stdout.write(f"  ✓ {Weapon.objects.count()} weapons")

    # ─── Ranges & Lanes ───────────────────────────────────────────────────────

    def _seed_ranges(self):
        # OPEN range — has rubegs (рубежи), each with up to 10 lanes
        r1, _ = ShootingRange.objects.get_or_create(
            name="Открытый полигон «Чоктал»",
            defaults={"range_type": "OPEN", "region": "Ташкентская обл.", "code": "CHKT"},
        )
        # CLOSED range — only lanes, no rubegs
        r2, _ = ShootingRange.objects.get_or_create(
            name="Закрытый тир «Мирзо-Улугбек»",
            defaults={"range_type": "CLOSED", "region": "Ташкент", "code": "MIRZ"},
        )

        # OPEN range: 3 рубежа, в каждом по 10 дорожек
        rubeg_data = [
            (1, 25, "Рубеж 25м — начальная подготовка"),
            (2, 50, "Рубеж 50м — боевая подготовка"),
            (3, 100, "Рубеж 100м — снайперская подготовка"),
        ]
        for rnum, dist, desc in rubeg_data:
            rubeg, _ = RangeRubeg.objects.get_or_create(
                range=r1, rubeg_number=rnum,
                defaults={"distance": dist, "max_lanes": 10, "description": desc},
            )
            for i in range(1, 11):
                ShootingLane.objects.get_or_create(
                    range=r1, rubeg=rubeg, lane_number=i,
                    defaults={
                        "name": f"Р{rnum}-Д{i}",
                        "distance_m": dist,
                        "target_type": "Круглая",
                        "status": LaneStatus.AVAILABLE.value,
                        "camera_status": CameraStatus.ONLINE.value,
                        "camera_ip": f"192.168.1.{rnum}{i:02d}",
                    }
                )

        # CLOSED range: 6 дорожек, без рубежей
        for i in range(1, 7):
            ShootingLane.objects.get_or_create(
                range=r2, lane_number=i,
                defaults={
                    "name": f"Дорожка {i}",
                    "distance_m": 25,
                    "target_type": "Круглая",
                    "status": LaneStatus.AVAILABLE.value,
                    "camera_status": CameraStatus.ONLINE.value,
                    "camera_ip": f"192.168.2.{i}",
                }
            )

        self.stdout.write(f"  ✓ 2 ranges (OPEN + CLOSED), {RangeRubeg.objects.count()} rubegs, {ShootingLane.objects.count()} lanes")

    # ─── Cameras ──────────────────────────────────────────────────────────────

    def _seed_cameras(self):
        for lane in ShootingLane.objects.all():
            LaneCamera.objects.get_or_create(
                camera_ip=lane.camera_ip or f"192.168.1.{lane.lane_number}",
                defaults={
                    "name": f"Камера {lane.name}",
                    "lane_number": lane.lane_number,
                    "status": CameraStatus.ONLINE.value,
                    "model": "Hikvision DS-2CD2",
                    "firmware_version": "5.6.1",
                    "last_seen": timezone.now(),
                }
            )
        self.stdout.write(f"  ✓ {LaneCamera.objects.count()} cameras")

    # ─── Training ─────────────────────────────────────────────────────────────

    def _seed_training(self):
        plans = [
            ("Базовая огневая подготовка", "BASIC", 8, "BEGINNER"),
            ("Тактическая стрельба", "TACTICAL", 16, "INTERMEDIATE"),
            ("Снайперская подготовка", "SNIPER", 24, "ADVANCED"),
            ("Ночное ориентирование", "NIGHT", 6, "INTERMEDIATE"),
        ]
        for title, ptype, hours, diff in plans:
            TrainingPlan.objects.get_or_create(
                title=title,
                defaults={
                    "plan_type": ptype, "duration_hours": hours,
                    "difficulty": diff, "is_active": True,
                }
            )
        self.stdout.write(f"  ✓ {TrainingPlan.objects.count()} training plans")

    # ─── TB Test ──────────────────────────────────────────────────────────────

    def _seed_tb_test(self):
        TBSafetyTest.objects.get_or_create(
            employee_name="Хасанов Отабек Рустамович",
            defaults={
                "questions_total": 20,
                "questions_correct": 20,
                "instructor_name": "Тошматов Ф.Ш.",
                "notes": "Сдан на 100%",
            }
        )
        self.stdout.write("  ✓ TB Safety Test")

    # ─── Sample Session + Protocol ─────────────────────────────────────────────

    def _seed_sample_session(self):
        session = ShootingSession.objects.create(
            session_id="sh-demo-001",
            range_name="Закрытый тир «Мирзо-Улугбек»",
            range_type="CLOSED",
            lane_number=1,
            status=SessionStatus.APPROVED.value,
            scoring_mode=ScoringMode.POINTS.value,
            distance=25,
            soldier_count=1,
            instructor_id="inst-1",
            instructor_name="Тошматов Ф.Ш.",
            employee_name="Алиев Бахтиёр Убайдуллаевич",
            employee_rank="Капитан",
            employee_department="1-я рота",
            weapon_name="АК-74",
            weapon_category="Винтовка",
            total_shots=10,
            hit_count=8,
            miss_count=2,
            total_score=78,
            accuracy=80.0,
            passed=True,
            completed_at=timezone.now(),
        )
        soldier = Soldier.objects.create(
            session=session, sequence_number=1,
            employee_name="Алиев Бахтиёр Убайдуллаевич",
            total_score=78, hit_count=8, miss_count=2,
            accuracy=80.0, passed=True,
        )
        for i in range(10):
            Shot.objects.create(
                session=session, soldier=soldier,
                shot_type=ShotType.MAIN.value,
                x=random.uniform(-5, 5), y=random.uniform(-5, 5),
                score=random.choice([10, 9, 8, 7, 0]),
                is_hit=random.choice([True, True, True, True, False]),
                soldier_seq=1, shot_number=i + 1,
            )

        Protocol.objects.create(
            protocol_number="PR-DEMO-01",
            session=session,
            session_id_str="sh-demo-001",
            employee_id="e001",
            employee_name="Алиев Бахтиёр Убайдуллаевич",
            employee_rank="Капитан",
            employee_department="1-я рота",
            weapon_name="АК-74",
            instructor_name="Тошматов Ф.Ш.",
            location="Закрытый тир «Мирзо-Улугбек»",
            lane_number=1,
            scoring_mode="POINTS",
            total_shots=10, hit_count=8, miss_count=2,
            total_score=78, accuracy=80.0, passed=True,
            qualification="ADVANCED",
            status=ProtocolStatus.APPROVED.value,
            signed_at=timezone.now(),
        )
        self.stdout.write("  ✓ 1 sample session + protocol")

    # ─── Notifications ─────────────────────────────────────────────────────────

    def _seed_notifications(self):
        notifs = [
            ("Новая сессия", "Сессия sh-demo-001 завершена и утверждена", "SUCCESS"),
            ("ТБ тест", "Хасанов О.Р. прошёл тест ТБ на 100%", "INFO"),
            ("Обслуживание СВД-002", "Оружие СВД-002 на обслуживании", "WARNING"),
        ]
        for title, msg, ntype in notifs:
            AppNotification.objects.get_or_create(
                title=title, message=msg,
                defaults={"notification_type": ntype, "user_id": "all"},
            )
        self.stdout.write(f"  ✓ {AppNotification.objects.count()} notifications")
