# ShaffofTIR Backend — Django REST API

## Stack
- Django 5.0 + DRF 3.15
- SQLite (dev) / PostgreSQL (prod)
- JWT auth (SimpleJWT)

## Setup
```bash
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data          # seed demo data
python manage.py runserver 0.0.0.0:8000
```

## API endpoints
- /api/auth/        — login, refresh, me
- /api/users/       — CRUD users (SUPER_ADMIN only)
- /api/employees/   — HR employees
- /api/departments/  — departments
- /api/weapons/     — weapons + assignment
- /api/ranges/      — shooting ranges + rubegs
- /api/lanes/       — shooting lanes
- /api/sessions/    — shooting sessions + soldiers + shots
- /api/session-flows/ — lane assignment + weapon selection
- /api/training/    — plans + assignments
- /api/tb-tests/    — TB safety tests + results
- /api/protocols/   — protocols + sign/approve/archive
- /api/cameras/     — camera health + config
- /api/schedules/   — range schedules
- /api/notifications/ — notifications
- /api/analytics/   — aggregated analytics
- /api/audit/       — audit log
