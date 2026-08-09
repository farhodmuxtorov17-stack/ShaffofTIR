import { defineStore } from './pinia-shim';
import { ref, computed } from 'vue';
import type { Weapon, HRDepartment, HREmployee, ShootingLane, ShootingRange, RangeRubeg, ShootingSessionFlow, TrainingPlan, TrainingAssignment, AppNotification, RangeSchedule, AnalyticsSummary } from '@/types/extended';

// ============================================================
// Master Store - Realistic interconnected data
// Employee → Session → Protocol → QR chain
// ============================================================

export const useMasterStore = defineStore('master', () => {
  // --- 24 Employees across 6 departments 
  const employees = ref<HREmployee[]>([
    // 1-я рота
    { id: 'e001', full_name: 'Алиев Бахтиёр Убайдуллаевич', rank: 'Капитан', position: 'Командир взвода', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-001', birth_date: '1990-05-15', phone: '+998901112233', email: 'aliev@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2015-06-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 24, total_score: 1850, avg_accuracy: 78, last_shooting_date: '2026-07-22', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e002', full_name: 'Рахимов Жасур Тошпулатович', rank: 'Лейтенант', position: 'Командир отделения', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-002', birth_date: '1992-08-20', phone: '+998902223344', email: 'rahimov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2017-03-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'INTERMEDIATE', total_sessions: 18, total_score: 1320, avg_accuracy: 71, last_shooting_date: '2026-07-20', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e003', full_name: 'Юлдашев Дилшод Абдуллажонович', rank: 'Сержант', position: 'Стрелок', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-003', birth_date: '1995-01-10', phone: '+998903334455', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2019-09-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'EXPERT', total_sessions: 32, total_score: 2400, avg_accuracy: 85, last_shooting_date: '2026-07-22', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e004', full_name: 'Хасанов Отабек Рустамович', rank: 'Рядовой', position: 'Стрелок', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-004', birth_date: '2000-03-25', phone: '+998904445566', email: null, face_id_registered: false, face_id_image_url: null, status: 'ACTIVE', hire_date: '2023-01-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'BEGINNER', total_sessions: 4, total_score: 220, avg_accuracy: 48, last_shooting_date: '2026-07-15', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e005', full_name: 'Махмудов Сардор Бахтиёрович', rank: 'Ст. сержант', position: 'Зам. командира взвода', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-005', birth_date: '1988-11-30', phone: '+998905556677', email: 'mahmudov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2012-05-20', shooting_qualified: true, tb_test_passed: true, qualification_level: 'EXPERT', total_sessions: 45, total_score: 3200, avg_accuracy: 91, last_shooting_date: '2026-07-22', created_at: '2024-01-01T00:00:00Z' },
    // 2-я рота
    { id: 'e006', full_name: 'Каримов Азиз Улугбекович', rank: 'Ефрейтор', position: 'Стрелок-снайпер', department: '2-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '2-я рота', personal_number: 'AZ-2024-006', birth_date: '1993-07-12', phone: '+998906667788', email: 'karimov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2016-11-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'EXPERT', total_sessions: 38, total_score: 2800, avg_accuracy: 88, last_shooting_date: '2026-07-22', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e007', full_name: 'Эргашев Бекзод Турсунович', rank: 'Рядовой', position: 'Стрелок', department: '2-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '2-я рота', personal_number: 'AZ-2024-007', birth_date: '2001-02-14', phone: '+998907778899', email: null, face_id_registered: false, face_id_image_url: null, status: 'RESERVE', hire_date: '2024-01-10', shooting_qualified: false, tb_test_passed: false, qualification_level: 'BEGINNER', total_sessions: 1, total_score: 60, avg_accuracy: 38, last_shooting_date: '2026-05-15', created_at: '2024-01-10T00:00:00Z' },
    { id: 'e008', full_name: 'Тошматов Фирдавс Шерзодович', rank: 'Старшина', position: 'Старший инструктор', department: 'Огневая подготовка', unit: 'Штаб', region: 'Ташкентская область', district: 'Мирабадский район', battalion: 'Огневая подготовка', personal_number: 'AZ-2024-008', birth_date: '1985-09-05', phone: '+998908889900', email: 'toshmatov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2008-04-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'EXPERT', total_sessions: 120, total_score: 9800, avg_accuracy: 95, last_shooting_date: '2026-07-21', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e009', full_name: 'Норматов Жамшид Анварович', rank: 'Сержант', position: 'Стрелок', department: '2-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '2-я рота', personal_number: 'AZ-2024-009', birth_date: '1994-04-18', phone: '+998911223344', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2018-07-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'INTERMEDIATE', total_sessions: 16, total_score: 1180, avg_accuracy: 68, last_shooting_date: '2026-07-18', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e010', full_name: 'Умаров Шерзод Бахтиёрович', rank: 'Рядовый', position: 'Стрелок', department: '2-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '2-я рота', personal_number: 'AZ-2024-010', birth_date: '1999-12-03', phone: '+998912233455', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2022-06-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'BEGINNER', total_sessions: 6, total_score: 340, avg_accuracy: 52, last_shooting_date: '2026-07-14', created_at: '2024-01-01T00:00:00Z' },
    // 3-я рота
    { id: 'e011', full_name: 'Кадыров Улугбек Тошпулатович', rank: 'Ст. лейтенант', position: 'Командир взвода', department: '3-я рота', unit: 'Батальон "Ширин"', region: 'Самаркандская область', district: 'Самаркандский район', battalion: '3-я рота', personal_number: 'AZ-2024-011', birth_date: '1989-06-22', phone: '+998913344566', email: 'kadyrov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2014-02-10', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 28, total_score: 2100, avg_accuracy: 80, last_shooting_date: '2026-07-19', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e012', full_name: 'Собиров Бахром Исломович', rank: 'Сержант', position: 'Стрелок', department: '3-я рота', unit: 'Батальон "Ширин"', region: 'Самаркандская область', district: 'Самаркандский район', battalion: '3-я рота', personal_number: 'AZ-2024-012', birth_date: '1996-10-08', phone: '+998914455678', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2020-03-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'INTERMEDIATE', total_sessions: 14, total_score: 980, avg_accuracy: 65, last_shooting_date: '2026-07-16', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e013', full_name: 'Рахмонов Ислом Жамолович', rank: 'Рядовый', position: 'Стрелок', department: '3-я рота', unit: 'Батальон "Ширин"', region: 'Самаркандская область', district: 'Самаркандский район', battalion: '3-я рота', personal_number: 'AZ-2024-013', birth_date: '2002-01-25', phone: '+998915566789', email: null, face_id_registered: false, face_id_image_url: null, status: 'ACTIVE', hire_date: '2024-02-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'BEGINNER', total_sessions: 3, total_score: 180, avg_accuracy: 44, last_shooting_date: '2026-07-10', created_at: '2024-02-01T00:00:00Z' },
    { id: 'e014', full_name: 'Фазилов Дилшод Рустамович', rank: 'Ефрейтор', position: 'Стрелок', department: '3-я рота', unit: 'Батальон "Ширин"', region: 'Самаркандская область', district: 'Самаркандский район', battalion: '3-я рота', personal_number: 'AZ-2024-014', birth_date: '1997-08-14', phone: '+998916677890', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2021-01-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'INTERMEDIATE', total_sessions: 12, total_score: 870, avg_accuracy: 63, last_shooting_date: '2026-07-17', created_at: '2024-01-01T00:00:00Z' },
    // Разведвзвод
    { id: 'e015', full_name: 'Назаров Бекзод Холикович', rank: 'Ст. сержант', position: 'Разведчик', department: 'Разведвзвод', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Мирабадский район', battalion: 'Разведвзвод', personal_number: 'AZ-2024-015', birth_date: '1991-03-30', phone: '+998917788901', email: 'nazarov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2015-09-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'EXPERT', total_sessions: 42, total_score: 3100, avg_accuracy: 89, last_shooting_date: '2026-07-21', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e016', full_name: 'Холиков Азиз Халилович', rank: 'Сержант', position: 'Разведчик-снайпер', department: 'Разведвзвод', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Мирабадский район', battalion: 'Разведвзвод', personal_number: 'AZ-2024-016', birth_date: '1993-11-11', phone: '+998918899012', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2017-04-20', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 22, total_score: 1650, avg_accuracy: 76, last_shooting_date: '2026-07-20', created_at: '2024-01-01T00:00:00Z' },
    // Огневая подготовка
    { id: 'e017', full_name: 'Турсунов Анвар Комилович', rank: 'Капитан', position: 'Инструктор', department: 'Огневая подготовка', unit: 'Штаб', region: 'Ташкентская область', district: 'Мирабадский район', battalion: 'Огневая подготовка', personal_number: 'AZ-2024-017', birth_date: '1987-02-18', phone: '+998919900123', email: 'tursunov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2010-06-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'EXPERT', total_sessions: 85, total_score: 7100, avg_accuracy: 93, last_shooting_date: '2026-07-22', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e018', full_name: 'Камилов Сардор Рустамович', rank: 'Лейтенант', position: 'Инструктор', department: 'Огневая подготовка', unit: 'Штаб', region: 'Ташкентская область', district: 'Мирабадский район', battalion: 'Огневая подготовка', personal_number: 'AZ-2024-018', birth_date: '1990-07-25', phone: '+998901011213', email: 'kamilov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2016-02-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 36, total_score: 2450, avg_accuracy: 79, last_shooting_date: '2026-07-21', created_at: '2024-01-01T00:00:00Z' },
    // Штаб
    { id: 'e019', full_name: 'Тешабаев Жасур Акмалович', rank: 'Полковник', position: 'Начальник штаба', department: 'Штаб', unit: 'Штаб', region: 'город Ташкент', district: 'Мирабадский район', battalion: 'Штаб', personal_number: 'AZ-2024-019', birth_date: '1980-04-12', phone: '+998902021314', email: 'teshabaev@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2005-08-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 30, total_score: 2200, avg_accuracy: 77, last_shooting_date: '2026-07-05', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e020', full_name: 'Исомиддинов Бахтиёр Шукурович', rank: 'Майор', position: 'Зам. начальника штаба', department: 'Штаб', unit: 'Штаб', region: 'город Ташкент', district: 'Мирабадский район', battalion: 'Штаб', personal_number: 'AZ-2024-020', birth_date: '1984-09-15', phone: '+998903031415', email: 'isomiddinov@mil.uz', face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2009-03-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 26, total_score: 1950, avg_accuracy: 75, last_shooting_date: '2026-07-08', created_at: '2024-01-01T00:00:00Z' },
    // Additional - 1-я рота
    { id: 'e021', full_name: 'Шерматов Улугбек Бахтиярович', rank: 'Рядовый', position: 'Стрелок', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-021', birth_date: '2001-06-20', phone: '+998904041516', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2023-06-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'BEGINNER', total_sessions: 5, total_score: 290, avg_accuracy: 50, last_shooting_date: '2026-07-12', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e022', full_name: 'Юсупов Камол Анварович', rank: 'Ефрейтор', position: 'Пулемётчик', department: '1-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Юкоркорганский район', battalion: '1-я рота', personal_number: 'AZ-2024-022', birth_date: '1998-03-08', phone: '+998905051617', email: null, face_id_registered: false, face_id_image_url: null, status: 'ACTIVE', hire_date: '2021-09-15', shooting_qualified: true, tb_test_passed: true, qualification_level: 'INTERMEDIATE', total_sessions: 11, total_score: 720, avg_accuracy: 61, last_shooting_date: '2026-07-11', created_at: '2024-01-01T00:00:00Z' },
    // Additional - 2-я рота
    { id: 'e023', full_name: 'Бобонов Рустам Хамидович', rank: 'Рядовый', position: 'Стрелок', department: '2-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '2-я рота', personal_number: 'AZ-2024-023', birth_date: '2000-11-22', phone: '+998906061718', email: null, face_id_registered: false, face_id_image_url: null, status: 'ACTIVE', hire_date: '2022-11-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'BEGINNER', total_sessions: 7, total_score: 410, avg_accuracy: 54, last_shooting_date: '2026-07-09', created_at: '2024-01-01T00:00:00Z' },
    { id: 'e024', full_name: 'Хайдаров Жавлон Бахтиёрович', rank: 'Сержант', position: 'Стрелок-снайпер', department: '2-я рота', unit: 'Батальон "Ширин"', region: 'Ташкентская область', district: 'Кибрайский район', battalion: '2-я рота', personal_number: 'AZ-2024-024', birth_date: '1995-05-17', phone: '+998907071819', email: null, face_id_registered: true, face_id_image_url: null, status: 'ACTIVE', hire_date: '2019-04-01', shooting_qualified: true, tb_test_passed: true, qualification_level: 'ADVANCED', total_sessions: 20, total_score: 1480, avg_accuracy: 74, last_shooting_date: '2026-07-18', created_at: '2024-01-01T00:00:00Z' },
  ]);

  // --- 6 Departments 
  const departments = ref<HRDepartment[]>([
    { id: 'd001', name: '1-я рота', code: 'R1', head: 'Алиев Б.У.', employee_count: 6, description: 'Первая стрелковая рота', created_at: '2024-01-01T00:00:00Z' },
    { id: 'd002', name: '2-я рота', code: 'R2', head: 'Юлдашев Д.А.', employee_count: 6, description: 'Вторая стрелковая рота', created_at: '2024-01-01T00:00:00Z' },
    { id: 'd003', name: '3-я рота', code: 'R3', head: 'Кадыров У.Т.', employee_count: 4, description: 'Третья стрелковая рота', created_at: '2024-01-01T00:00:00Z' },
    { id: 'd004', name: 'Разведвзвод', code: 'RV', head: 'Назаров Б.Х.', employee_count: 2, description: 'Разведывательный взвод', created_at: '2024-01-01T00:00:00Z' },
    { id: 'd005', name: 'Огневая подготовка', code: 'FP', head: 'Турсунов А.К.', employee_count: 2, description: 'Инструкторский состав', created_at: '2024-01-01T00:00:00Z' },
    { id: 'd006', name: 'Штаб', code: 'ST', head: 'Тешабаев Ж.А.', employee_count: 2, description: 'Штабной отдел', created_at: '2024-01-01T00:00:00Z' },
  ]);

  // --- 12 Weapons 
  const weapons = ref<Weapon[]>([
    { id: 'w001', name: 'AK-74', category: 'RIFLE', serial_number: 'AK74-2024-001', caliber: '5.45×39mm', manufacturer: 'Ижмаш', status: 'AVAILABLE', condition: 'EXCELLENT', assigned_to: null, last_maintenance: '2026-06-15', total_shots_fired: 1500, image_url: null, max_range_m: 500, ammo_type: '5.45mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w002', name: 'AK-74', category: 'RIFLE', serial_number: 'AK74-2024-002', caliber: '5.45×39mm', manufacturer: 'Ижмаш', status: 'IN_USE', condition: 'GOOD', assigned_to: 'e001', last_maintenance: '2026-05-20', total_shots_fired: 3200, image_url: null, max_range_m: 500, ammo_type: '5.45mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w003', name: 'Макаров ПМ', category: 'PISTOL', serial_number: 'PM-2024-001', caliber: '9×18mm', manufacturer: 'Ижмех', status: 'IN_USE', condition: 'EXCELLENT', assigned_to: 'e002', last_maintenance: '2026-07-01', total_shots_fired: 800, image_url: null, max_range_m: 50, ammo_type: '9mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w004', name: 'СВД (Драгунов)', category: 'SNIPER', serial_number: 'SVD-2024-001', caliber: '7.62×54mmR', manufacturer: 'Ижмаш', status: 'IN_USE', condition: 'EXCELLENT', assigned_to: 'e006', last_maintenance: '2026-06-30', total_shots_fired: 600, image_url: null, max_range_m: 1300, ammo_type: '7.62x54mmR', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w005', name: 'АКС-74У', category: 'SMG', serial_number: 'AKSU-2024-001', caliber: '5.45×39mm', manufacturer: 'Ижмаш', status: 'MAINTENANCE', condition: 'FAIR', assigned_to: null, last_maintenance: '2026-07-15', total_shots_fired: 5000, image_url: null, max_range_m: 200, ammo_type: '5.45mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w006', name: 'ПК (Пулемёт Калашникова)', category: 'MACHINE_GUN', serial_number: 'PK-2024-001', caliber: '7.62×54mmR', manufacturer: 'Златоуст', status: 'IN_USE', condition: 'GOOD', assigned_to: 'e005', last_maintenance: '2026-05-10', total_shots_fired: 4500, image_url: null, max_range_m: 1000, ammo_type: '7.62x54mmR', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w007', name: 'Glock 17', category: 'PISTOL', serial_number: 'GLK-2024-001', caliber: '9×19mm Parabellum', manufacturer: 'Glock', status: 'AVAILABLE', condition: 'EXCELLENT', assigned_to: null, last_maintenance: '2026-07-10', total_shots_fired: 400, image_url: null, max_range_m: 50, ammo_type: '9mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w008', name: 'АК-12', category: 'RIFLE', serial_number: 'AK12-2024-001', caliber: '5.45×39mm', manufacturer: 'Калашников', status: 'IN_USE', condition: 'EXCELLENT', assigned_to: 'e003', last_maintenance: '2026-06-20', total_shots_fired: 200, image_url: null, max_range_m: 600, ammo_type: '5.45mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w009', name: 'AK-74', category: 'RIFLE', serial_number: 'AK74-2024-003', caliber: '5.45×39mm', manufacturer: 'Ижмаш', status: 'IN_USE', condition: 'GOOD', assigned_to: 'e004', last_maintenance: '2026-06-01', total_shots_fired: 1800, image_url: null, max_range_m: 500, ammo_type: '5.45mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w010', name: 'АК-12', category: 'RIFLE', serial_number: 'AK12-2024-002', caliber: '5.45×39mm', manufacturer: 'Калашников', status: 'IN_USE', condition: 'EXCELLENT', assigned_to: 'e011', last_maintenance: '2026-06-25', total_shots_fired: 350, image_url: null, max_range_m: 600, ammo_type: '5.45mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w011', name: 'Макаров ПМ', category: 'PISTOL', serial_number: 'PM-2024-002', caliber: '9×18mm', manufacturer: 'Ижмех', status: 'IN_USE', condition: 'GOOD', assigned_to: 'e015', last_maintenance: '2026-06-18', total_shots_fired: 1200, image_url: null, max_range_m: 50, ammo_type: '9mm', created_at: '2024-01-01T00:00:00Z' },
    { id: 'w012', name: 'СВД (Драгунов)', category: 'SNIPER', serial_number: 'SVD-2024-002', caliber: '7.62×54mmR', manufacturer: 'Ижмаш', status: 'AVAILABLE', condition: 'EXCELLENT', assigned_to: null, last_maintenance: '2026-07-05', total_shots_fired: 450, image_url: null, max_range_m: 1300, ammo_type: '7.62x54mmR', created_at: '2024-01-01T00:00:00Z' },
  ]);

  // --- Shooting Ranges (Open + Closed) 
  const ranges = ref<ShootingRange[]>([
    { id: 'rg001', name: 'Тир №1 (Открытый)', code: 'RNG-001', region: 'tashkent_city', ip_prefix: '88.1.92', range_type: 'OPEN', status: 'ACTIVE', total_rubegs: 3, total_lanes: 18, lanes_per_rubeg: 6, cameras_online: 17, cameras_total: 18, created_at: '2024-01-01T00:00:00Z', updated_at: null },
    { id: 'rg002', name: 'Тир №2 (Закрытый)', code: 'RNG-002', region: 'tashkent_region', ip_prefix: '88.1.93', range_type: 'CLOSED', status: 'ACTIVE', total_rubegs: 4, total_lanes: 24, lanes_per_rubeg: 6, cameras_online: 24, cameras_total: 24, created_at: '2024-01-01T00:00:00Z', updated_at: null },
    { id: 'rg003', name: 'Тир №3 (Открытый)', code: 'RNG-003', region: 'samarkand', ip_prefix: '88.1.94', range_type: 'OPEN', status: 'ACTIVE', total_rubegs: 2, total_lanes: 12, lanes_per_rubeg: 6, cameras_online: 11, cameras_total: 12, created_at: '2024-01-01T00:00:00Z', updated_at: null },
  ]);

  // --- Rubegs (firing lines) per range 
  const rubegs = ref<RangeRubeg[]>([
    // Range 1 (Open) - 3 rubegs
    { id: 'rb001', range_id: 'rg001', range_name: 'Тир №1', rubeg_number: 1, name: 'Рубеж 1 (100м)', weapon_type: 'PISTOL', distance_m: 100, lane_count: 6, cameras: [] },
    { id: 'rb002', range_id: 'rg001', range_name: 'Тир №1', rubeg_number: 2, name: 'Рубеж 2 (200м)', weapon_type: 'RIFLE', distance_m: 200, lane_count: 6, cameras: [] },
    { id: 'rb003', range_id: 'rg001', range_name: 'Тир №1', rubeg_number: 3, name: 'Рубеж 3 (300м)', weapon_type: 'SNIPER', distance_m: 300, lane_count: 6, cameras: [] },
    // Range 2 (Closed) - 4 rubegs
    { id: 'rb004', range_id: 'rg002', range_name: 'Тир №2', rubeg_number: 1, name: 'Рубеж 1 (25м)', weapon_type: 'PISTOL', distance_m: 25, lane_count: 6, cameras: [] },
    { id: 'rb005', range_id: 'rg002', range_name: 'Тир №2', rubeg_number: 2, name: 'Рубеж 2 (50м)', weapon_type: 'PISTOL', distance_m: 50, lane_count: 6, cameras: [] },
    { id: 'rb006', range_id: 'rg002', range_name: 'Тир №2', rubeg_number: 3, name: 'Рубеж 3 (100м)', weapon_type: 'RIFLE', distance_m: 100, lane_count: 6, cameras: [] },
    { id: 'rb007', range_id: 'rg002', range_name: 'Тир №2', rubeg_number: 4, name: 'Рубеж 4 (300м)', weapon_type: 'SNIPER', distance_m: 300, lane_count: 6, cameras: [] },
    // Range 3 (Open) - 2 rubegs
    { id: 'rb008', range_id: 'rg003', range_name: 'Тир №3', rubeg_number: 1, name: 'Рубеж 1 (100м)', weapon_type: 'RIFLE', distance_m: 100, lane_count: 6, cameras: [] },
    { id: 'rb009', range_id: 'rg003', range_name: 'Тир №3', rubeg_number: 2, name: 'Рубеж 2 (300м)', weapon_type: 'SNIPER', distance_m: 300, lane_count: 6, cameras: [] },
  ]);
  // --- 6 Shooting Lanes 
  const now = new Date()
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString()

  const lanes = ref<ShootingLane[]>([
    { id: 'l001', lane_number: 1, name: 'Дорожка 1', status: 'OCCUPIED', current_employee_id: 'e005', current_employee_name: 'Махмудов С.Б.', camera_ip: '192.168.1.64', camera_status: 'ONLINE', target_type: 'STANDARD', distance_m: 100, has_3d_preview: true, weapon_assigned: 'ПК (Пулемёт)', session_start_time: minsAgo(8), current_soldier_seq: 1, current_shots_fired: 7, current_score: 62 },
    { id: 'l002', lane_number: 2, name: 'Дорожка 2', status: 'OCCUPIED', current_employee_id: 'e003', current_employee_name: 'Юлдашев Д.А.', camera_ip: '192.168.1.65', camera_status: 'ONLINE', target_type: 'STANDARD', distance_m: 100, has_3d_preview: true, weapon_assigned: 'АК-12', session_start_time: minsAgo(12), current_soldier_seq: 1, current_shots_fired: 10, current_score: 87 },
    { id: 'l003', lane_number: 3, name: 'Дорожка 3', status: 'OCCUPIED', current_employee_id: 'e006', current_employee_name: 'Каримов А.У.', camera_ip: '192.168.1.66', camera_status: 'ONLINE', target_type: 'SILHOUETTE', distance_m: 300, has_3d_preview: true, weapon_assigned: 'СВД (Драгунов)', session_start_time: minsAgo(5), current_soldier_seq: 1, current_shots_fired: 4, current_score: 38 },
    { id: 'l004', lane_number: 4, name: 'Дорожка 4', status: 'AVAILABLE', current_employee_id: null, current_employee_name: null, camera_ip: '192.168.1.67', camera_status: 'OFFLINE', target_type: 'STANDARD', distance_m: 100, has_3d_preview: false, weapon_assigned: null, session_start_time: null, current_soldier_seq: undefined, current_shots_fired: 0, current_score: 0 },
    { id: 'l005', lane_number: 5, name: 'Дорожка 5', status: 'OCCUPIED', current_employee_id: 'e001', current_employee_name: 'Алиев Б.У.', camera_ip: '192.168.1.68', camera_status: 'ONLINE', target_type: 'STANDARD', distance_m: 100, has_3d_preview: true, weapon_assigned: 'AK-74', session_start_time: minsAgo(3), current_soldier_seq: 1, current_shots_fired: 3, current_score: 25 },
    { id: 'l006', lane_number: 6, name: 'Дорожка 6', status: 'MAINTENANCE', current_employee_id: null, current_employee_name: null, camera_ip: '192.168.1.69', camera_status: 'OFFLINE', target_type: 'CIRCLE', distance_m: 50, has_3d_preview: false, weapon_assigned: null, session_start_time: null, current_soldier_seq: undefined, current_shots_fired: 0, current_score: 0 },
  ]);

  // --- Active Session Flows (interconnected with employees + weapons + lanes) 
  const sessionFlows = ref<ShootingSessionFlow[]>([
    {
      id: 'sf001', session_id: 's-2026-046', lane_id: 'l001', lane_number: 1,
      employee_id: 'e005', employee_name: 'Махмудов С.Б.', employee_rank: 'Ст. сержант',
      weapon_id: 'w006', weapon_name: 'ПК (Пулемёт Калашникова)', weapon_category: 'MACHINE_GUN',
      instructor_id: 'u002', instructor_name: 'Каримов Б.Р.',
      status: 'SHOOTING', shot_type: 'MAIN', expected_shots: 10, rounds_fired: 7, score: 62,
      started_at: minsAgo(8), completed_at: null, notes: null, scoring_mode: 'POINTS' as const, hit_count: 0, miss_count: 0, passed: false,
      camera_stream_url: null, hit_positions: [
        { x: 52, y: 48, score: 9, timestamp: minsAgo(7) },
        { x: 55, y: 51, score: 8, timestamp: minsAgo(6) },
        { x: 48, y: 53, score: 9, timestamp: minsAgo(5) },
        { x: 51, y: 49, score: 10, timestamp: minsAgo(4) },
        { x: 58, y: 55, score: 7, timestamp: minsAgo(3) },
        { x: 50, y: 50, score: 10, timestamp: minsAgo(2) },
        { x: 54, y: 47, score: 9, timestamp: minsAgo(1) },
      ],
    },
    {
      id: 'sf002', session_id: 's-2026-047', lane_id: 'l002', lane_number: 2,
      employee_id: 'e003', employee_name: 'Юлдашев Д.А.', employee_rank: 'Сержант',
      weapon_id: 'w008', weapon_name: 'АК-12', weapon_category: 'RIFLE',
      instructor_id: 'u002', instructor_name: 'Каримов Б.Р.',
      status: 'COMPLETED', shot_type: 'MAIN', expected_shots: 10, rounds_fired: 10, score: 87,
      started_at: minsAgo(25), completed_at: minsAgo(12), notes: 'Отличный результат', scoring_mode: 'POINTS' as const, hit_count: 8, miss_count: 2, passed: true,
      camera_stream_url: null, hit_positions: [
        { x: 50, y: 50, score: 10, timestamp: minsAgo(24) },
        { x: 51, y: 49, score: 10, timestamp: minsAgo(23) },
        { x: 49, y: 51, score: 9, timestamp: minsAgo(22) },
        { x: 52, y: 48, score: 9, timestamp: minsAgo(21) },
        { x: 50, y: 50, score: 10, timestamp: minsAgo(20) },
        { x: 48, y: 52, score: 8, timestamp: minsAgo(19) },
        { x: 53, y: 51, score: 8, timestamp: minsAgo(18) },
        { x: 50, y: 49, score: 10, timestamp: minsAgo(17) },
        { x: 51, y: 50, score: 9, timestamp: minsAgo(16) },
        { x: 49, y: 50, score: 9, timestamp: minsAgo(13) },
      ],
    },
    {
      id: 'sf003', session_id: 's-2026-048', lane_id: 'l003', lane_number: 3,
      employee_id: 'e006', employee_name: 'Каримов А.У.', employee_rank: 'Ефрейтор',
      weapon_id: 'w004', weapon_name: 'СВД (Драгунов)', weapon_category: 'SNIPER',
      instructor_id: 'u002', instructor_name: 'Каримов Б.Р.',
      status: 'SHOOTING', shot_type: 'TEST', expected_shots: 4, rounds_fired: 4, score: 38,
      started_at: minsAgo(5), completed_at: null, notes: null, scoring_mode: 'POINTS' as const, hit_count: 0, miss_count: 0, passed: false,
      camera_stream_url: null, hit_positions: [
        { x: 48, y: 52, score: 9, timestamp: minsAgo(4) },
        { x: 52, y: 48, score: 9, timestamp: minsAgo(3) },
        { x: 55, y: 45, score: 10, timestamp: minsAgo(2) },
        { x: 50, y: 50, score: 10, timestamp: minsAgo(1) },
      ],
    },
    {
      id: 'sf004', session_id: 's-2026-049', lane_id: 'l005', lane_number: 5,
      employee_id: 'e001', employee_name: 'Алиев Б.У.', employee_rank: 'Капитан',
      weapon_id: 'w002', weapon_name: 'AK-74', weapon_category: 'RIFLE',
      instructor_id: 'u002', instructor_name: 'Каримов Б.Р.',
      status: 'SHOOTING', shot_type: 'TEST', expected_shots: 3, rounds_fired: 3, score: 25,
      started_at: minsAgo(3), completed_at: null, notes: null, scoring_mode: 'POINTS' as const, hit_count: 0, miss_count: 0, passed: false,
      camera_stream_url: null, hit_positions: [
        { x: 55, y: 45, score: 8, timestamp: minsAgo(2) },
        { x: 48, y: 52, score: 9, timestamp: minsAgo(1) },
        { x: 52, y: 48, score: 8, timestamp: minsAgo(0) },
      ],
    },
  ]);

  // --- Training Plans (linked to weapons) 
  const trainingPlans = ref<TrainingPlan[]>([
    { id: 'tp001', name: 'Базовая стрельба из АК-74', description: 'Начальный курс стрельбы из автомата. 3 серии по 5 выстрелов.', difficulty: 'BASIC', duration_minutes: 30, required_shots: 15, target_distance_m: 100, weapon_categories: ['RIFLE'], passing_score: 60, assigned_count: 8, completed_count: 5, created_at: '2024-01-15T00:00:00Z' },
    { id: 'tp002', name: 'Снайперская подготовка', description: 'Точная стрельба на дальние дистанции. 5 выстрелов с 300м.', difficulty: 'ADVANCED', duration_minutes: 45, required_shots: 5, target_distance_m: 300, weapon_categories: ['SNIPER'], passing_score: 80, assigned_count: 4, completed_count: 2, created_at: '2024-02-01T00:00:00Z' },
    { id: 'tp003', name: 'Стрельба из пистолета', description: 'Короткая дистанция, 10 выстрелов с 25м.', difficulty: 'BASIC', duration_minutes: 20, required_shots: 10, target_distance_m: 25, weapon_categories: ['PISTOL'], passing_score: 60, assigned_count: 12, completed_count: 9, created_at: '2024-01-20T00:00:00Z' },
    { id: 'tp004', name: 'Тактическая стрельба', description: 'Комплексная подготовка: движение + стрельба. 20 выстрелов.', difficulty: 'INTERMEDIATE', duration_minutes: 60, required_shots: 20, target_distance_m: 100, weapon_categories: ['RIFLE', 'SMG'], passing_score: 70, assigned_count: 6, completed_count: 3, created_at: '2024-03-01T00:00:00Z' },
    { id: 'tp005', name: 'Стрельба из пулемёта', description: 'Подавляющий огонь. 30 выстрелов очередями.', difficulty: 'ADVANCED', duration_minutes: 40, required_shots: 30, target_distance_m: 200, weapon_categories: ['MACHINE_GUN'], passing_score: 65, assigned_count: 3, completed_count: 2, created_at: '2024-02-15T00:00:00Z' },
    { id: 'tp006', name: 'Ночная стрельба', description: 'Стрельба в условиях ограниченной видимости. 10 выстрелов.', difficulty: 'ELITE', duration_minutes: 35, required_shots: 10, target_distance_m: 100, weapon_categories: ['RIFLE'], passing_score: 75, assigned_count: 5, completed_count: 1, created_at: '2024-04-01T00:00:00Z' },
  ]);

  // --- Training Assignments (linked to employees + plans) 
  const trainingAssignments = ref<TrainingAssignment[]>([
    { id: 'ta001', plan_id: 'tp001', plan_name: 'Базовая стрельба из АК-74', employee_id: 'e004', employee_name: 'Хасанов О.Р.', status: 'IN_PROGRESS', assigned_at: '2026-07-01T00:00:00Z', due_date: '2026-07-30T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta002', plan_id: 'tp001', plan_name: 'Базовая стрельба из АК-74', employee_id: 'e021', employee_name: 'Шерматов У.Б.', status: 'ASSIGNED', assigned_at: '2026-07-10T00:00:00Z', due_date: '2026-08-10T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta003', plan_id: 'tp002', plan_name: 'Снайперская подготовка', employee_id: 'e016', employee_name: 'Холиков А.Х.', status: 'IN_PROGRESS', assigned_at: '2026-07-05T00:00:00Z', due_date: '2026-08-05T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta004', plan_id: 'tp003', plan_name: 'Стрельба из пистолета', employee_id: 'e013', employee_name: 'Рахмонов И.Ж.', status: 'ASSIGNED', assigned_at: '2026-07-15T00:00:00Z', due_date: '2026-08-15T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta005', plan_id: 'tp004', plan_name: 'Тактическая стрельба', employee_id: 'e009', employee_name: 'Норматов Ж.А.', status: 'IN_PROGRESS', assigned_at: '2026-07-08T00:00:00Z', due_date: '2026-08-08T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta006', plan_id: 'tp005', plan_name: 'Стрельба из пулемёта', employee_id: 'e022', employee_name: 'Юсупов К.А.', status: 'ASSIGNED', assigned_at: '2026-07-12T00:00:00Z', due_date: '2026-08-12T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta007', plan_id: 'tp006', plan_name: 'Ночная стрельба', employee_id: 'e015', employee_name: 'Назаров Б.Х.', status: 'ASSIGNED', assigned_at: '2026-07-18T00:00:00Z', due_date: '2026-08-18T00:00:00Z', completed_at: null, score: null, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta008', plan_id: 'tp001', plan_name: 'Базовая стрельба из АК-74', employee_id: 'e023', employee_name: 'Бобонов Р.Х.', status: 'COMPLETED', assigned_at: '2026-06-01T00:00:00Z', due_date: '2026-07-01T00:00:00Z', completed_at: '2026-06-28T00:00:00Z', score: 72, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta009', plan_id: 'tp003', plan_name: 'Стрельба из пистолета', employee_id: 'e010', employee_name: 'Умаров Ш.Б.', status: 'COMPLETED', assigned_at: '2026-05-15T00:00:00Z', due_date: '2026-06-15T00:00:00Z', completed_at: '2026-06-10T00:00:00Z', score: 65, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
    { id: 'ta010', plan_id: 'tp004', plan_name: 'Тактическая стрельба', employee_id: 'e014', employee_name: 'Фазилов Д.Р.', status: 'COMPLETED', assigned_at: '2026-05-01T00:00:00Z', due_date: '2026-06-01T00:00:00Z', completed_at: '2026-05-28T00:00:00Z', score: 78, instructor_id: 'u002', instructor_name: 'Каримов Б.Р.' },
  ]);

  // --- Range Schedule 
  const rangeSchedule = ref<RangeSchedule[]>([
    { id: 'rs001', date: '2026-07-23', time_slot: '09:00-12:00', lane_numbers: [1, 2, 3], department: '1-я рота', instructor_name: 'Каримов Б.Р.', employee_count: 6, status: 'SCHEDULED', weapon_categories: ['RIFLE'], notes: 'Базовая подготовка' },
    { id: 'rs002', date: '2026-07-23', time_slot: '14:00-17:00', lane_numbers: [1, 2], department: 'Разведвзвод', instructor_name: 'Турсунов А.К.', employee_count: 2, status: 'SCHEDULED', weapon_categories: ['SNIPER'], notes: 'Снайперская подготовка' },
    { id: 'rs003', date: '2026-07-24', time_slot: '09:00-11:00', lane_numbers: [4, 5, 6], department: '2-я рота', instructor_name: 'Каримов Б.Р.', employee_count: 6, status: 'SCHEDULED', weapon_categories: ['RIFLE', 'PISTOL'], notes: null },
    { id: 'rs004', date: '2026-07-24', time_slot: '13:00-15:00', lane_numbers: [1, 2, 3], department: '3-я рота', instructor_name: 'Камилов С.Р.', employee_count: 4, status: 'SCHEDULED', weapon_categories: ['RIFLE'], notes: 'Контрольная стрельба' },
    { id: 'rs005', date: '2026-07-22', time_slot: '09:00-12:00', lane_numbers: [1, 2, 3, 5], department: 'Сводная', instructor_name: 'Каримов Б.Р.', employee_count: 4, status: 'IN_PROGRESS', weapon_categories: ['RIFLE', 'SNIPER', 'MACHINE_GUN'], notes: 'Текущая сессия' },
    { id: 'rs006', date: '2026-07-21', time_slot: '14:00-17:00', lane_numbers: [1, 2, 3], department: 'Огневая подготовка', instructor_name: 'Тошматов Ф.Ш.', employee_count: 2, status: 'COMPLETED', weapon_categories: ['PISTOL'], notes: 'Инструкторский зачёт' },
  ]);

  // --- Notifications 
  const notifications = ref<AppNotification[]>([
    { id: 'n001', type: 'SUCCESS', title: 'Сессия завершена', message: 'Юлдашев Д.А. завершил стрельбу: 87 баллов из 100', is_read: false, created_at: minsAgo(12), action_url: '/sessions/s-2026-047' },
    { id: 'n002', type: 'WARNING', title: 'Камера офлайн', message: 'Дорожка 4: камера 192.168.1.67 недоступна', is_read: false, created_at: minsAgo(30), action_url: '/cameras' },
    { id: 'n003', type: 'TRAINING', title: 'Назначена тренировка', message: 'Хасанову О.Р. назначен план "Базовая стрельба из АК-74"', is_read: false, created_at: minsAgo(60), action_url: '/training' },
    { id: 'n004', type: 'INFO', title: 'Оружие на обслуживании', message: 'АКС-74У (AKSU-2024-001) отправлен на ТО', is_read: true, created_at: minsAgo(120), action_url: '/weapons' },
    { id: 'n005', type: 'SUCCESS', title: 'Тренировка завершена', message: 'Бобонов Р.Х. прошел "Базовая стрельба из АК-74" со счётом 72', is_read: true, created_at: minsAgo(240), action_url: '/training' },
    { id: 'n006', type: 'ERROR', title: 'FaceID не зарегистрирован', message: 'Хасанов О.Р. - FaceID не настроен. Требуется регистрация.', is_read: false, created_at: minsAgo(360), action_url: '/hr/employees/e004' },
  ]);

  // --- Computed: Dashboard stats 
  const activeLanes = computed(() => lanes.value.filter(l => l.status === 'OCCUPIED').length);
  const totalLanes = computed(() => lanes.value.length);
  const activeEmployees = computed(() => employees.value.filter(e => e.status === 'ACTIVE').length);
  const expertShooters = computed(() => employees.value.filter(e => e.qualification_level === 'EXPERT').length);

  const analyticsSummary = computed<AnalyticsSummary>(() => {
    const allEmps = employees.value;
    const totalSessions = allEmps.reduce((sum, e) => sum + e.total_sessions, 0);
    const totalShots = allEmps.reduce((sum, e) => sum + e.total_sessions * 10, 0);
    const avgAcc = allEmps.reduce((sum, e) => sum + e.avg_accuracy, 0) / allEmps.length;
    const avgScore = allEmps.reduce((sum, e) => sum + e.total_score, 0) / allEmps.length;
    const topEmp = [...allEmps].sort((a, b) => b.total_score - a.total_score)[0];
    return {
      total_sessions: totalSessions,
      total_shots: totalShots,
      avg_accuracy: Math.round(avgAcc),
      avg_score: Math.round(avgScore),
      top_scorer: topEmp ? { name: topEmp.full_name, score: topEmp.total_score } : null,
      improvement_rate: 12.5,
      total_employees_trained: allEmps.length,
      total_rounds_fired: totalShots,
      pass_rate: 85,
    };
  })

  // CRUD: Shooting Ranges (Polygons)




  // CRUD: Shooting Ranges (Polygons)
  function createRange(data: { name: string; code: string; region: string; ip_prefix: string; range_type: 'OPEN' | 'CLOSED'; lanes_per_rubeg: number }) {
    const id = 'rg' + String(ranges.value.length + 1).padStart(3, '0')
    const range: ShootingRange = {
      id,
      name: data.name,
      code: data.code,
      region: data.region,
      ip_prefix: data.ip_prefix,
      range_type: data.range_type,
      status: 'ACTIVE',
      total_rubegs: 0,
      total_lanes: 0,
      lanes_per_rubeg: data.lanes_per_rubeg,
      cameras_online: 0,
      cameras_total: 0,
      created_at: new Date().toISOString(),
      updated_at: null,
    }
    ranges.value.push(range)
    return range
  }

  function updateRange(id: string, data: Partial<Pick<ShootingRange, 'name' | 'code' | 'region' | 'ip_prefix' | 'range_type' | 'status'>>) {
    const r = ranges.value.find(r => r.id === id)
    if (r) {
      Object.assign(r, data)
      r.updated_at = new Date().toISOString()
    }
  }

  function deleteRange(id: string) {
    ranges.value = ranges.value.filter(r => r.id !== id)
    rubegs.value = rubegs.value.filter(r => r.range_id !== id)
  }

  // --- CRUD: Rubegs (Firing Lines) 
  const createRubeg = (data: { range_id: string; name: string; weapon_type: string; distance_m: number; lane_count: number }) => {
    const range = ranges.value.find(r => r.id === data.range_id)
    if (!range) return null
    const existing = rubegs.value.filter(r => r.range_id === data.range_id)
    const id = 'rb' + String(rubegs.value.length + 1).padStart(3, '0')
    const rubeg: RangeRubeg = {
      id,
      range_id: data.range_id,
      range_name: range.name,
      rubeg_number: existing.length + 1,
      name: data.name,
      weapon_type: data.weapon_type as any,
      distance_m: data.distance_m,
      lane_count: data.lane_count,
      cameras: [],
    }
    rubegs.value.push(rubeg)
    range.total_rubegs = existing.length + 1
    range.total_lanes = (existing.length + 1) * range.lanes_per_rubeg
    return rubeg
  }

  const updateRubeg = (id: string, data: Partial<Pick<RangeRubeg, 'name' | 'weapon_type' | 'distance_m' | 'lane_count'>>) => {
    const r = rubegs.value.find(r => r.id === id)
    if (r) Object.assign(r, data)
  }

  const deleteRubeg = (id: string) => {
    const rubeg = rubegs.value.find(r => r.id === id)
    if (rubeg) {
      const range = ranges.value.find(r => r.id === rubeg.range_id)
      if (range) {
        const remaining = rubegs.value.filter(r => r.range_id === rubeg.range_id && r.id !== id)
        range.total_rubegs = remaining.length
        range.total_lanes = remaining.reduce((s, r) => s + r.lane_count, 0)
      }
    }
    rubegs.value = rubegs.value.filter(r => r.id !== id)
  }

  // --- CRUD: Weapons 
  const createWeapon = (data: { name: string; category: string; serial_number: string; caliber: string; manufacturer: string }) => {
    const id = 'w' + String(weapons.value.length + 1).padStart(3, '0')
    weapons.value.push({
      id,
      name: data.name,
      category: data.category as any,
      serial_number: data.serial_number,
      caliber: data.caliber,
      manufacturer: data.manufacturer,
      status: 'AVAILABLE',
      condition: 'GOOD',
      assigned_to: null,
      last_maintenance: null,
      total_shots_fired: 0,
      image_url: null,
      max_range_m: 0,
      ammo_type: data.caliber,
      created_at: new Date().toISOString(),
    } as any)
  }

  const updateWeapon = (id: string, data: Partial<Weapon>) => {
    const w = weapons.value.find(w => w.id === id)
    if (w) Object.assign(w, data)
  }

  const deleteWeapon = (id: string) => {
    weapons.value = weapons.value.filter(w => w.id !== id)
  }



  // --- Employee Shooting History 
  interface ShootingHistoryRecord {
    id: string;
    employee_id: string;
    date: string;
    range_name: string;
    weapon: string;
    scoring_mode: 'POINTS' | 'HITMISS';
    total_rounds: number;
    hit_count: number;
    score: number;
    max_score: number;
    accuracy: number;
    result: 'PASS' | 'FAIL';
    instructor_name: string;
  }

  const shootingHistory = ref<ShootingHistoryRecord[]>([
    { id: 'sh001', employee_id: 'e001', date: '2026-07-22', range_name: 'Полигон Орта-Сарой', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 8, hit_count: 7, score: 82, max_score: 100, accuracy: 78, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh002', employee_id: 'e001', date: '2026-07-15', range_name: 'Полигон Орта-Сарой', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 8, hit_count: 6, score: 75, max_score: 100, accuracy: 72, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh003', employee_id: 'e001', date: '2026-07-08', range_name: 'Полигон Чирчик', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 6, hit_count: 5, score: 68, max_score: 100, accuracy: 70, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh004', employee_id: 'e001', date: '2026-06-28', range_name: 'Полигон Орта-Сарой', weapon: 'Макаров ПМ', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 8, score: 80, max_score: 100, accuracy: 75, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh005', employee_id: 'e002', date: '2026-07-20', range_name: 'Полигон Чирчик', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 8, hit_count: 6, score: 71, max_score: 100, accuracy: 68, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh006', employee_id: 'e002', date: '2026-07-10', range_name: 'Полигон Чирчик', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 8, hit_count: 5, score: 65, max_score: 100, accuracy: 62, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh007', employee_id: 'e003', date: '2026-07-22', range_name: 'Полигон Орта-Сарой', weapon: 'Снайперская винтовка', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 9, score: 92, max_score: 100, accuracy: 88, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh008', employee_id: 'e003', date: '2026-07-14', range_name: 'Полигон Орта-Сарой', weapon: 'Снайперская винтовка', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 8, score: 85, max_score: 100, accuracy: 82, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh009', employee_id: 'e004', date: '2026-07-15', range_name: 'Полигон Орта-Сарой', weapon: 'АК-12', scoring_mode: 'HITMISS', total_rounds: 6, hit_count: 3, score: 0, max_score: 0, accuracy: 50, result: 'FAIL', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh010', employee_id: 'e005', date: '2026-07-22', range_name: 'Полигон Орта-Сарой', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 10, score: 95, max_score: 100, accuracy: 92, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh011', employee_id: 'e005', date: '2026-07-12', range_name: 'Полигон Зангиота', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 9, score: 90, max_score: 100, accuracy: 88, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh012', employee_id: 'e006', date: '2026-07-22', range_name: 'Полигон Чирчик', weapon: 'Снайперская винтовка', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 9, score: 88, max_score: 100, accuracy: 85, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh013', employee_id: 'e007', date: '2026-05-15', range_name: 'Полигон Чирчик', weapon: 'АК-12', scoring_mode: 'HITMISS', total_rounds: 4, hit_count: 1, score: 0, max_score: 0, accuracy: 25, result: 'FAIL', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh014', employee_id: 'e008', date: '2026-07-21', range_name: 'Полигон Орта-Сарой', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 10, hit_count: 10, score: 98, max_score: 100, accuracy: 95, result: 'PASS', instructor_name: 'Система' },
    { id: 'sh015', employee_id: 'e009', date: '2026-07-18', range_name: 'Полигон Чирчик', weapon: 'АК-12', scoring_mode: 'POINTS', total_rounds: 8, hit_count: 5, score: 62, max_score: 100, accuracy: 65, result: 'PASS', instructor_name: 'Тошматов Ф.Ш.' },
    { id: 'sh016', employee_id: 'e010', date: '2026-07-14', range_name: 'Полигон Чирчик', weapon: 'АК-12', scoring_mode: 'HITMISS', total_rounds: 6, hit_count: 3, score: 0, max_score: 0, accuracy: 50, result: 'FAIL', instructor_name: 'Тошматов Ф.Ш.' },
  ]);

  // --- Audit Log (for SUPER_ADMIN) 
  interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor_name: string;
    actor_role: string;
    action: string;
    module: string;
    details: string;
    ip_address: string;
  }

  const auditLog = ref<AuditLogEntry[]>([
    { id: 'al001', timestamp: '2026-07-25T19:45:00Z', actor_name: 'Тошматов Ф.Ш.', actor_role: 'INSTRUCTOR', action: 'SESSION_START', module: 'Сессии', details: 'Начата сессия для Алиев Б.У. на дорожке №3', ip_address: '88.1.92.15' },
    { id: 'al002', timestamp: '2026-07-25T19:30:00Z', actor_name: 'Технический Специалист', actor_role: 'TECHSPEC', action: 'CAMERA_ADD', module: 'Камеры', details: 'Добавлена камера 88.1.92.41 на рубеж 4', ip_address: '88.1.92.2' },
    { id: 'al003', timestamp: '2026-07-25T19:15:00Z', actor_name: 'Системный Администратор', actor_role: 'SUPER_ADMIN', action: 'USER_CREATE', module: 'Пользователи', details: 'Создан пользователь: Каримов А.У. (e006)', ip_address: '88.1.92.1' },
    { id: 'al004', timestamp: '2026-07-25T18:50:00Z', actor_name: 'Тошматов Ф.Ш.', actor_role: 'INSTRUCTOR', action: 'SCORE_SUBMIT', module: 'Результаты', details: 'Отправлен результат: Алиев Б.У. - 82/100', ip_address: '88.1.92.15' },
    { id: 'al005', timestamp: '2026-07-25T18:30:00Z', actor_name: 'Технический Специалист', actor_role: 'TECHSPEC', action: 'CAMERA_RESTART', module: 'Камеры', details: 'Перезагрузка камеры 88.1.92.35 (OFFLINE)', ip_address: '88.1.92.2' },
    { id: 'al006', timestamp: '2026-07-25T17:00:00Z', actor_name: 'Системный Администратор', actor_role: 'SUPER_ADMIN', action: 'CONFIG_CHANGE', module: 'Настройки', details: 'Изменён IP-префикс полигона Зангиота', ip_address: '88.1.92.1' },
    { id: 'al007', timestamp: '2026-07-25T16:20:00Z', actor_name: 'Тошматов Ф.Ш.', actor_role: 'INSTRUCTOR', action: 'PROTOCOL_SIGN', module: 'Протоколы', details: 'Подписан протокол сессии #sh001', ip_address: '88.1.92.15' },
    { id: 'al008', timestamp: '2026-07-25T15:00:00Z', actor_name: 'Системный Администратор', actor_role: 'SUPER_ADMIN', action: 'SYSTEM_RESTART', module: 'Система', details: 'Перезапуск модуля скоринга Nishon AI', ip_address: '88.1.92.1' },
  ]);

  const getShootingHistoryByEmployee = (empId: string) => {
    return shootingHistory.value.filter(s => s.employee_id === empId).sort((a, b) => b.date.localeCompare(a.date));
  }

  const getAuditLog = () => {
    return auditLog.value.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }



  // --- Helpers 
  const getEmployeeById = (id: string) => {
    return employees.value.find(e => e.id === id);
  }

  const getEmployeesByDepartment = (dept: string) => {
    return employees.value.filter(e => e.department === dept);
  }

  const getWeaponById = (id: string) => {
    return weapons.value.find(w => w.id === id);
  }

  const getWeaponByEmployeeId = (empId: string) => {
    return weapons.value.find(w => w.assigned_to === empId);
  }

  const getLaneByNumber = (num: number) => {
    return lanes.value.find(l => l.lane_number === num);
  }

  const getActiveSessionFlows = () => {
    return sessionFlows.value.filter(sf => sf.status === 'SHOOTING' || sf.status === 'READY');
  }

  const getTrainingAssignmentsByEmployee = (empId: string) => {
    return trainingAssignments.value.filter(ta => ta.employee_id === empId);
  }

  const getNotificationsUnread = () => {
    return notifications.value.filter(n => !n.is_read);
  }

  // --- Additional helpers 
  const liveActivity = computed(() => {
    const colors = ['bg-brand-500', 'bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-red-500'];
    const messages: Record<string, string> = {
      SHOOTING: 'Ведёт стрельбу',
      READY: 'Готов к стрельбе',
      COMPLETED: 'Завершил стрельбу',
      ASSIGNED: 'Назначен на дорожку',
    };
    return sessionFlows.value.filter(sf => sf.status === 'SHOOTING' || sf.status === 'READY' || sf.status === 'COMPLETED').slice(0, 10).map((sf, i) => ({
      id: sf.id,
      employee: sf.employee_name,
      lane: sf.lane_number,
      weapon: sf.weapon_name,
      score: sf.score,
      status: sf.status,
      time: sf.started_at,
      color: colors[i % colors.length],
      message: messages[sf.status] || 'Активность',
    }));
  });

  const schedules = computed(() => rangeSchedule.value);
  const availableWeapons = computed(() => weapons.value.filter(w => !w.assigned_to));

  const updateLaneStatus = (laneId: string, status: string) => {
    const lane = lanes.value.find(l => l.id === laneId);
    if (lane) lane.status = status as any;
  }

  const assignWeaponToLane = (laneId: string, weaponId: string) => {
    const lane = lanes.value.find(l => l.id === laneId);
    const weapon = weapons.value.find(w => w.id === weaponId);
    if (lane && weapon) {
      (lane as any).assigned_weapon_id = weaponId;
      weapon.assigned_to = (lane as any).current_employee_id || null;
    }
  }

  const updateEmployee = (employeeId: string, data: Partial<HREmployee>) => {
    const emp = employees.value.find(e => e.id === employeeId);
    if (emp) {
      Object.assign(emp, data);
      return true;
    }
    return false;
  }

  const registerFaceID = (employeeId: string) => {
    const emp = employees.value.find(e => e.id === employeeId);
    if (emp) {
      emp.face_id_registered = true;
      return true;
    }
    return false;
  }

  const markNotificationRead = (notificationId: string) => {
    const n = notifications.value.find(n => n.id === notificationId);
    if (n) n.is_read = true;
  }

  const markAllNotificationsRead = () => {
    notifications.value.forEach(n => { n.is_read = true; });
  }





  return {
    employees, departments, weapons, lanes, ranges, rubegs, sessionFlows,
    trainingPlans, trainingAssignments, rangeSchedule, notifications,
    activeLanes, totalLanes, activeEmployees, expertShooters, analyticsSummary,
    liveActivity, schedules, availableWeapons,
    getEmployeeById, getEmployeesByDepartment,
    getWeaponById, getWeaponByEmployeeId,
    getLaneByNumber, getActiveSessionFlows,
    getTrainingAssignmentsByEmployee, getNotificationsUnread,
    updateLaneStatus, assignWeaponToLane, registerFaceID, updateEmployee,
    markNotificationRead, markAllNotificationsRead,
    shootingHistory, auditLog,
    getShootingHistoryByEmployee, getAuditLog,
    createRange, updateRange, deleteRange,
    createRubeg, updateRubeg, deleteRubeg,
    createWeapon, updateWeapon, deleteWeapon,
  };
});
