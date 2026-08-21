# ShaffofTIR

Система управления стрелковым полигоном — Django 5 + Vue 3 + TypeScript.

## Архитектура

### Backend (Django 5)
- **Models**: Session, Protocol, Employee, Weapon, Range, Camera, Queue, FaceID, Training, TB Safety
- **Service Layer**: SessionService, ProtocolService, QueueService, FaceIDService, AIAnalysisService
- **Auth**: JWT (access 12h, refresh 7d), roles: INSTRUCTOR, TECHSPEC, SUPER_ADMIN, MANAGER
- **Permissions**: Role-based (IsInstructor, IsTechSpec, IsSuperAdmin, IsAdminOrInstructor, IsAdminOrTechSpec)
- **Realtime**: Django Channels WebSocket for queue monitoring
- **Analysis**: OpenCV-based shot detection and scoring

### Frontend (Vue 3 + TypeScript)
- **Pages**: Sessions, Results, Employees, Protocols, FaceID, Queue, Training, TB Test, Cameras, Lanes, Arsenal, System
- **Routing**: Role-based guards with SUPER_ADMIN override
- **API Client**: JWT auto-injection, token refresh queue, typed services
- **i18n**: Russian + Uzbek (U+02BB apostrophe)

## Режимы

### Типы тиров
- **OPEN** — открытый полигон с рубежами (sectors), каждый рубеж имеет свои дорожки
- **CLOSED** — закрытый тир с простыми дорожками (без рубежей)

### Режимы оценки
- **POINTS** — балльная система для военнослужащих (0-10 за выстрел)
- **HIT_MISS** — попадание/промах для гражданских сотрудников

## ТБ-процесс
- Обязательный тест на 100% перед допуском к стрельбе
- Проверка при создании сессии (enforced в SessionService)

## Протоколы
- Жизненный цикл: DRAFT → SIGNED → APPROVED → ARCHIVED
- Zero-edit policy: APPROVED/ARCHIVED протоколы неизменяемы

## Тесты
- 52 unit-теста (auth, cameras, faceid, queue, protocols, range structure, sessions, scoring, websocket)

## Запуск
```bash
cd backend && pip install -r requirements.txt && python manage.py runserver
cd frontend && npm install && npm run dev
```
