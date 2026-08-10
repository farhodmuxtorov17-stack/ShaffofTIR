# Architecture

## System Overview

ShaffofTIR follows a **modular monolith** pattern with a SPA frontend and two independent backend services.

```
                         ┌──────────────────────────┐
                         │    Browser (SPA)         │
                         │  Vue 3 · TypeScript      │
                         │  Tailwind · Pinia        │
                         │  72 pages · 5 roles      │
                         └────────┬─────────┬───────┘
                                  │         │
                   ┌──────────────┘         └──────────────┐
                   │                                       │
         ┌─────────▼─────────┐                ┌────────────▼──────────┐
         │  Django REST API  │                │  Automated Scoring     │
         │  (Extended BFF)   │                │  (FastAPI + OpenCV)    │
         │                   │                │                        │
         │  • Auth (JWT)    │                │  • Image capture       │
         │  • CRUD (all)    │                │  • Hit detection (CV)  │
         │  • Business logic│                │  • Score calculation   │
         │  • Permissions   │                │  • Dataprizma sync     │
         │  • Audit logging │                │                        │
         │                  │                │  Async · High-perf     │
         │  Port: 8000      │                │  Port: 8001             │
         └────────┬─────────┘                └────────────────────────┘
                  │
         ┌────────▼──────────┐
         │  PostgreSQL 16+   │
         │                   │
         │  • Users          │
         │  • Sessions       │
         │  • Shots          │
         │  • Protocols       │
         │  • Weapons        │
         │  • Audit logs      │
         └───────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App.vue
├── AppShell.vue
│   ├── AppSidebar.vue          # Role-aware navigation
│   ├── AppTopbar.vue            # Search, language, profile
│   └── <router-view />          # Page outlet
├── MobileAppShell.vue           # Mobile breakpoint
└── ToastContainer.vue          # Global notifications
```

### State Management (Pinia)

| Store | File | Responsibility |
|-------|------|----------------|
| `auth` | `stores/auth.ts` | User session, JWT, RBAC, login/logout |
| `master` | `stores/master.ts` | Reference data (sessions, employees, weapons) |
| `session` | `stores/session.ts` | Active session state, shot recording |
| `ui` | `stores/ui.ts` | Sidebar state, modals, theme |
| `audit` | `stores/audit.ts` | Audit trail for sensitive actions |
| `notifications` | `stores/notifications.ts` | In-app notification center |
| `sessionsHistory` | `stores/sessionsHistory.ts` | Session history pagination |
| `sessionRequests` | `stores/sessionRequests.ts` | Pending session requests |
| `baseline` | `stores/baseline.ts` | Performance baseline data |

### Routing

Routes use lazy imports for code splitting:

```typescript
{ path: '/sessions/:id', component: () => import('@/pages/SessionsDetailPage.vue') }
```

Role guards check `meta.roles` before navigation:

```typescript
router.beforeEach((to) => {
  if (to.meta.roles && !authStore.hasRole(to.meta.roles as UserRole[])) {
    return '/403'
  }
})
```

### API Layer

```
src/api/
├── httpClient.ts           # Axios instance with auth interceptor
├── httpClientExtended.ts    # Extended API client (5s timeout)
├── extended.ts             # Auth, users, sessions API
├── session.api.ts          # Session CRUD
├── scoring.api.ts          # Scoring service
├── camera.api.ts           # Camera management
├── health.api.ts           # System health checks
├── dataprizma.api.ts       # Dataprizma integration
└── imageUrl.ts             # Image URL resolution utility
```

### Internationalization

Custom i18n implementation (no external dependency):

```typescript
// src/i18n/index.ts
const translations = {
  ru: { 'common.login': 'Войти', 'nav.results': 'Результаты', ... },
  uz: { 'common.login': "Kirish", 'nav.results': "Natijalar", ... }
}

export function useI18n() {
  const { t, locale, setLocale } = ...
  return { t, locale, setLocale }
}
```

**Uzbek apostrophe handling:** The letter U+02BB (MODIFIER LETTER TURNED COMMA, ʻ) is used instead of ASCII apostrophe (') to comply with the official Uzbek Latin orthography standard.

### Static Data Model

The Command Center uses a three-level hierarchy:

```
Republic of Uzbekistan
├── Region (Viloyat)
│   ├── District (Tuman)
│   │   ├── Unit (Podrazdelenie)
│   │   │   ├── Employee
│   │   │   └── Employee
│   │   └── Unit
│   └── District
└── Region
```

Data files:
- `src/data/republicData.ts` — regions with KPI scores
- `src/data/unitData.ts` — units (districts) with personnel
- `src/data/employeeHistory.ts` — employee shooting history
- `src/data/uzbekistan_regions.json` — geographic SVG paths

## Backend Architecture

### Django REST Framework

```
backend/
├── config/                  # Django settings, URLs, WSGI
├── shaffoftir_api/         # API application
│   ├── models/              # Django models
│   ├── serializers/         # DRF serializers
│   ├── views/               # ViewSets and API views
│   ├── permissions/         # Custom permission classes
│   └── urls.py              # API URL routing
├── manage.py
└── requirements.txt
```

### Data Models

| Module | Models |
|--------|--------|
| User | User, Role |
| Employee | Employee, Department, Qualification |
| Session | Session, Soldier, Shot, ShootingLane, Camera, RangeSchedule |
| Weapon | Weapon, WeaponAssignment |
| Protocol | Protocol, OperatorComment, ReviewReason |
| Training | TrainingPlan, TrainingAssignment |
| Notification | Notification, AuditAnnotation |

### API Patterns

Each module follows the DRF ModelViewSet pattern with custom actions:

```python
class SessionViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def soldiers(self, request, pk=None):
        """Add soldiers to a session."""

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """Finalize session and calculate scores."""
```

### FastAPI Scoring Service

```
backend_fastapi/
├── app/
│   ├── main.py              # FastAPI application
│   ├── routes/              # API endpoints
│   ├── services/            # OpenCV processing logic
│   └── models/              # Pydantic schemas
├── Dockerfile
└── requirements.txt
```

Endpoints:
- `POST /capture` — Capture target image from IP camera
- `POST /analyze` — Detect hits using OpenCV
- `POST /score` — Calculate score from hit coordinates
- `POST /sync` — Sync results with Dataprizma
- `GET /health` — Service health check

## Security Architecture

### Authentication Flow

```
Client                     Django API
  │                           │
  │── POST /auth/login ──────►│
  │   {email, password}       │
  │                           │── verify password (PBKDF2)
  │                           │── generate JWT (access + refresh)
  │◄── {access, refresh} ────│
  │                           │
  │── GET /api/* ────────────►│
  │   Authorization: Bearer   │── verify JWT
  │                           │── check permissions
  │◄── 200 / 403 ─────────────│
```

### RBAC Enforcement

| Layer | Mechanism |
|-------|-----------|
| Frontend route | `meta.roles` in router config |
| Frontend sidebar | Role-filtered `NavGroup[]` |
| Frontend module | `canAccess(module)` in auth store |
| Backend route | DRF permission classes |
| Backend query | ORM-level data filtering |

### Zero-Edit Policy

Protocols in APPROVED or ARCHIVED status cannot be modified:

- **Frontend**: Edit buttons hidden/disabled when `protocol.status === 'APPROVED' || 'ARCHIVED'`
- **Backend**: PATCH/PUT returns 403 for locked protocols
- **Audit**: All access attempts logged

## Performance Considerations

### Bundle Optimization

- Heavy libraries (jspdf, html2canvas) are **lazy-loaded** — only imported when ProtocolCreatePage needs PDF export
- `inlineDynamicImports: true` in Vite config produces a single optimized bundle
- CSS is not split (`cssCodeSplit: false`) — one stylesheet, one request
- Assets inlined up to 100MB limit (no separate asset requests for small files)

### Runtime Performance

- Pinia stores use `computed()` for derived state (memoized)
- Vue Router lazy imports split code per route (72 chunks)
- `v-for` lists use `key` attribute for efficient DOM diffing
- Sidebar navigation is role-gated at render time (no wasted DOM)

### Build Output

```
dist/
├── index.html        # ~2KB
├── assets/
│   ├── index-*.js    # ~1.8MB (single bundle, gzipped ~400KB)
│   └── style-*.css   # ~166KB (gzipped ~25KB)
```
