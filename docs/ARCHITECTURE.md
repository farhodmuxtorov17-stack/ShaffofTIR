# Архитектура ShaffofTIR

## Общая схема

Система построена по паттерну "модульный монолит" с двумя независимыми backend-сервисами и SPA-фронтендом.

```
                   +----------------------------+
                   |       Browser (SPA)        |
                   |    Vue 3 / TypeScript      |
                   |   Tailwind / Pinia         |
                   +------+----------+--------+
                          |          |
              +-----------+          +-----------+
              |                                   |
    +---------v---------+              +-----------v-----------+
    |  Django REST API  |              |  Automated Scoring    |
    |  (Extended BFF)   |              |  (FastAPI + OpenCV)   |
    |                   |              |                       |
    |  Port: 8000       |              |  Port: 8001           |
    +--------+----------+              +-----------------------+
             |
    +--------v----------+
    |  PostgreSQL 16+    |
    +-------------------+
```

## Frontend (Vue 3)

### Структура

- `pages/` - 72 страницы, lazy-loaded через Vue Router
- `components/` - переиспользуемые UI-компоненты (layout, ui, session, camera, target)
- `stores/` - Pinia stores (auth, session, master, audit, notifications, ui)
- `api/` - типизированные HTTP-клиенты (httpClient, session.api, scoring.api)
- `i18n/` - локализация RU/UZ с поддержкой U+02BB
- `data/` - статические данные иерархии (Республика, Регион, Район)
- `router/` - конфигурация маршрутов с role-based guard

### Роутинг и доступ

Маршрутизация использует meta-поля `roles` для проверки доступа. Guard проверяет роль пользователя через Pinia auth store перед каждым переходом.

### Локализация

Два locale-файла (ru, uz). Узбекские строки используют символ U+02BB (MODIFIER LETTER TURNED COMMA) для апострофов вместо стандартного U+0027. Это требование орфографического стандарта узбекского языка.

## Backend (Django REST Framework)

### Модели

| Модуль | Модели |
|--------|--------|
| User | User, Role |
| Employee | Employee, Department, Qualification |
| Session | Session, Soldier, Shot, ShootingLane, Camera, RangeSchedule |
| Weapon | Weapon, WeaponAssignment |
| Protocol | Protocol, OperatorComment, ReviewReason |
| Training | TrainingPlan, TrainingAssignment |
| Notification | Notification, AuditAnnotation |

### ViewSets

Каждый модуль следует паттерну DRF ModelViewSet с дополнительными custom actions:

- `SessionViewSet` - `soldiers`, `process_turn`, `finalize`
- `ProtocolViewSet` - `sign`, `export_pdf`, `add_comment`
- `WeaponViewSet` - `assign`, `return`, `maintenance_log`
- `AnalyticsSummaryView` - агрегированные метрики
- `PerformanceTrendsView` - временные ряды эффективности

### Сериализаторы

Многоуровневые сериализаторы для оптимизации payload:
- `*ListSerializer` - сокращённый формат для списков
- `*Serializer` - полный формат с вложенными объектами
- `*CreateSerializer` - валидация при создании

## Automated Scoring (FastAPI)

Отдельный сервис для обработки изображений мишеней:

- Захват кадра с IP-камеры дорожки
- Детекция попаданий (computer vision)
- Расчёт координат и баллов
- Синхронизация с Dataprizma
- 8 endpoints (capture, analyze, score, sync, health, etc.)

## Безопасность

### Аутентификация

JWT с access/refresh токенами. Access-токен живёт 15 минут, refresh - 7 дней.

### Ролевая модель (RBAC)

5 ролей с гранулярным доступом к модулям. Доступ определяется через `moduleAccess` в auth store на frontend и через permissions на backend.

### Изоляция

- TechSpec не имеет доступа к результатам стрельб
- EMPLOYEE видит только свои результаты
- Рахбар ограничен аналитикой, операционное управление недоступно
- Zero-edit policy: исторические результаты не редактируются
