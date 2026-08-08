# ShaffofTIR Backend - Python Django REST Framework

Backend API for the ShaffofTIR shooting range management system.

## Технологии

- **Python 3.11+**
- **Django 5.0**
- **Django REST Framework 3.15**
- **SQLite** (dev) / **PostgreSQL** (prod)
- **django-cors-headers** (CORS для Vue фронтенда)
- **Pillow** (обработка изображений мишеней)
- **djangorestframework-simplejwt** (JWT авторизация)

## Запуск

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Миграции
python manage.py makemigrations
python manage.py migrate

# Создать суперпользователя
python manage.py createsuperuser

# Загрузить тестовые данные
python manage.py seed_data

# Запуск
python manage.py runserver 0.0.0.0:8000
```

## API

Базовый URL: `http://localhost:8000/api/v1/`

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/auth/login/` | POST | Авторизация (JWT) |
| `/auth/me/` | GET | Текущий пользователь |
| `/employees/` | GET/POST/PUT/DELETE | Сотрудники (HR) |
| `/departments/` | GET/POST | Подразделения |
| `/weapons/` | GET/POST/PUT/DELETE | Оружие (Арсенал) |
| `/weapon-assignments/` | GET/POST | Выдача оружия |
| `/lanes/` | GET/PUT | Дорожки тира |
| `/sessions/` | GET/POST | Стрелковые сессии |
| `/sessions/{id}/soldiers/` | GET/POST | Стрелки в сессии |
| `/sessions/{id}/process-turn/` | POST | Обработка выстрелов (камера) |
| `/sessions/{id}/upload-turn/` | POST | Обработка выстрелов (загрузка фото) |
| `/protocols/` | GET/POST | Протоколы |
| `/training-plans/` | GET/POST/PUT | Учебные планы |
| `/training-assignments/` | GET/POST/PUT | Назначения тренировок |
| `/notifications/` | GET/PUT | Уведомления |
| `/cameras/health/` | POST | Проверка камер |
| `/analytics/summary/` | GET | Аналитика (дашборд) |
| `/reports/export/` | GET | Экспорт отчётов (PDF/Excel) |

## Структура

```
backend/
├── config/              # Django settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── shaffoftir_api/      # Основное приложение
│   ├── models/          # Модели БД
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── weapon.py
│   │   ├── session.py
│   │   ├── training.py
│   │   ├── protocol.py
│   │   └── notification.py
│   ├── serializers/     # DRF сериализаторы
│   ├── views/           # DRF ViewSets
│   ├── urls.py          # Маршруты API
│   └── management/
│       └── commands/
│           └── seed_data.py
├── manage.py
└── requirements.txt
```
