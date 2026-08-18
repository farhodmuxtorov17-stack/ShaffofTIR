# ShaffofTIR — Mini Version

Professional shooting range management system with two roles:
- **INSTRUCTOR** — sessions, results, employees, protocols
- **TECHSPEC** — cameras, lanes, arsenal, system health

## Architecture

### Backend (Django + DRF)
```
backend/
├── config/
│   ├── settings/          # Split settings: base / dev / prod
│   │   ├── base.py         # Shared config
│   │   ├── dev.py          # SQLite + debug
│   │   └── prod.py         # PostgreSQL + security headers
│   ├── urls.py             # Root URLs + OpenAPI schema
│   ├── wsgi.py
│   └── asgi.py
├── shaffoftir_api/
│   ├── models/             # Domain models with Enum choices
│   ├── serializers/        # DRF serializers with validation
│   ├── services/           # Business logic layer
│   │   ├── session_service.py   # Session FSM + shot processing
│   │   ├── protocol_service.py  # Protocol workflow (sign → approve → archive)
│   │   └── camera_service.py    # Concurrent health checks
│   ├── views/              # ViewSets with role-based permissions
│   ├── permissions.py      # IsInstructor, IsTechSpec, IsOwnerOrReadOnly
│   ├── middleware.py       # Request logging
│   ├── exceptions.py       # Custom error envelope
│   ├── pagination.py       # Standard pagination with metadata
│   └── urls.py             # API v1 routing
├── tests/                 # pytest with fixtures (26 tests)
├── Dockerfile             # Multi-stage build
├── docker-compose.yml     # Backend + PostgreSQL
└── requirements.txt       # Pinned dependencies
```

### Frontend (Vue 3 + TypeScript + Tailwind)
```
frontend/
├── src/
│   ├── api/               # Typed API service modules
│   │   ├── client.ts      # HTTP client with JWT refresh + error handling
│   │   ├── auth.ts        # Authentication service
│   │   ├── sessions.ts    # Sessions API
│   │   ├── protocols.ts   # Protocols API
│   │   └── ...
│   ├── composables/       # Vue composables
│   │   ├── useApi.ts      # Async data fetching
│   │   ├── useAuth.ts     # Reactive auth state
│   │   └── useToast.ts    # Toast notifications
│   ├── components/
│   │   ├── layout/        # AppShell
│   │   └── ui/            # ToastContainer
│   ├── pages/             # Route-level views
│   ├── stores/            # Auth store
│   ├── types/             # TypeScript interfaces
│   └── router/            # Route guards with role checks
└── ...
```

## Key Features

### Real Computer Vision (OpenCV)
- Image differencing to detect new bullet holes (before/after target photos)
- Contour detection with circularity filtering
- Automatic target center detection via HoughCircles
- Scoring rings mapping (10 down to 0)
- Annotated output image with hit markers and score labels
- Falls back to simulation when real images unavailable

### Real-Time WebSocket (Django Channels)
- Push notifications for queue events (no polling needed)
- Events: soldier_completed, next_soldier, queue_completed, analysis_ready
- In-memory channel layer for dev, Redis for production
- Frontend composable `useQueueSocket` auto-reconnects

### Backend
- **Role-based access control** — custom permission classes per endpoint
- **Session state machine** — validated transitions with `VALID_TRANSITIONS` map
- **Zero-edit policy** — APPROVED/ARCHIVED protocols are immutable
- **Service layer** — business logic separated from views
- **Custom error envelope** — consistent JSON error structure: `{ error: { code, message, details } }`
- **Pagination metadata** — `{ count, page, page_size, total_pages, results }`
- **Request logging middleware** — method, path, status, duration, user
- **OpenAPI/Swagger** — auto-generated docs at `/api/docs/`
- **Multi-stage Docker** — optimized image with healthcheck
- **pytest** — 26 tests covering auth, sessions, protocols, cameras

### Frontend
- **Typed API client** — JWT auto-injection + token refresh on 401
- **Error normalization** — `ApiError` class with code/message/details
- **Composables** — `useApi`, `useAuth`, `useToast`
- **Toast notifications** — auto-dismiss with type variants
- **Route guards** — role-based access with redirect logic

## Quick Start

### Backend (dev)
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
cd backend
docker-compose up -d
```

### Tests
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/login/ | Login |
| GET | /api/v1/auth/me/ | Current user |
| CRUD | /api/v1/sessions/ | Shooting sessions |
| POST | /api/v1/sessions/{id}/start/ | Start session |
| POST | /api/v1/sessions/{id}/process_turn/ | Process shots |
| POST | /api/v1/sessions/{id}/transition/ | Change status |
| CRUD | /api/v1/protocols/ | Protocols |
| POST | /api/v1/protocols/{id}/sign/ | Sign protocol |
| POST | /api/v1/protocols/{id}/approve/ | Approve protocol |
| POST | /api/v1/protocols/{id}/archive/ | Archive protocol |
| CRUD | /api/v1/employees/ | Employees |
| CRUD | /api/v1/weapons/ | Weapons |
| CRUD | /api/v1/lanes/ | Lanes |
| CRUD | /api/v1/cameras/ | Cameras |
| POST | /api/v1/cameras/health/ | Camera health check |
| GET | /api/v1/analytics/summary/ | System metrics |
| POST | /api/v1/face-registrations/ | Register face |
| POST | /api/v1/face-registrations/identify/ | Identify face |
| POST | /api/v1/face-checkins/create_group/ | Group FaceID check-in |
| POST | /api/v1/queues/create_manual/ | Create shooting queue |
| POST | /api/v1/queues/{id}/activate/ | Activate queue |
| POST | /api/v1/queues/{id}/complete_current/ | Complete + auto-advance |
| POST | /api/v1/queues/{id}/skip_current/ | Skip current shooter |
| GET | /api/v1/queues/{id}/state/ | Full queue state |
| POST | /api/v1/shot-analyses/create_and_run/ | AI shot analysis |
| WS | /ws/queue/{id}/ | Real-time queue updates |
| GET | /api/v1/analytics/trends/ | Performance trends |
| GET | /api/v1/reports/export/ | CSV export |

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| INSTRUCTOR | instructor@shaffoftir.uz | inst123 |
| TECHSPEC | tech@shaffoftir.uz | tech123 |
