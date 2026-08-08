# API Reference

## Base URL

```
Django REST:  http://localhost:8000/api/v1/
FastAPI:       http://localhost:8001/
```

## Аутентификация

### POST /api/v1/auth/login/

```json
Request:
{
  "email": "admin@shaffoftir.uz",
  "password": "admin123"
}

Response (200):
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": "u005",
    "email": "admin@shaffoftir.uz",
    "full_name": "Системный Администратор",
    "role": "SUPER_ADMIN"
  }
}
```

### GET /api/v1/auth/me/

Возвращает текущего пользователя по access-токену.

## Employees

### GET /api/v1/employees/
### GET /api/v1/employees/{id}/
### POST /api/v1/employees/
### PATCH /api/v1/employees/{id}/
### DELETE /api/v1/employees/{id}/

Поддерживает filterset: `status`, `department`, `region`, `district`.
Search: `full_name`, `personal_number`.
Ordering: `full_name`, `hire_date`, `created_at`.

## Weapons

### GET /api/v1/weapons/
### POST /api/v1/weapons/
### PATCH /api/v1/weapons/{id}/

### POST /api/v1/weapon-assignments/
Назначение оружия сотруднику.

```json
{
  "weapon_id": "w001",
  "employee_id": "e001",
  "session_id": "s001"
}
```

## Sessions

### GET /api/v1/sessions/
### POST /api/v1/sessions/

### POST /api/v1/sessions/{id}/soldiers/
Добавление стрелка в сессию.

### POST /api/v1/sessions/{id}/process_turn/
Обработка выстрелов с камеры.

```json
{
  "soldier_seq": 1,
  "shot_type": "TEST",
  "expected_shots": 3
}
```

### POST /api/v1/sessions/{id}/finalize/
Завершение сессии и расчёт итогов.

## Protocols

### GET /api/v1/protocols/
### POST /api/v1/protocols/

### POST /api/v1/protocols/{id}/sign/
Подписание протокола. Генерирует QR-код.

### POST /api/v1/operator-comments/
```json
{
  "protocol_id": "uuid",
  "author": "Инструктор",
  "comment": "Текст комментария"
}
```

## Analytics

### GET /api/v1/analytics/summary/
Сводные метрики по сотрудникам, подразделениям, периоду.

### GET /api/v1/analytics/trends/
Временные ряды эффективности стрельб.

### GET /api/v1/reports/export/
Экспорт отчётов в PDF/Excel.

Query params:
- `format`: pdf | xlsx
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD
- `department`: filter by department

## Cameras

### GET /api/v1/cameras/
### GET /api/v1/cameras/health/
Статус всех IP-камер (online/offline, latency, last_frame).

## Automated Scoring (FastAPI)

### POST /scoring/capture
Захват кадра с камеры дорожки.

### POST /scoring/analyze
Анализ изображения мишени: детекция попаданий, координаты, баллы.

### POST /scoring/score
Расчёт итогового балла по правилам (points / hit-miss).

### POST /scoring/sync
Синхронизация результатов с Dataprizma.

### GET /scoring/health
Статус сервиса scoring.
