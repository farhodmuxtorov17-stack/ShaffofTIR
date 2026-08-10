<p align="center">
  <img src="public/logo.svg" alt="ShaffofTIR" width="120" height="120" />
</p>

<h1 align="center">ShaffofTIR</h1>

<p align="center">
  <strong>Transparent Shooting Range Management System</strong><br/>
  Enterprise-grade platform for military & law enforcement firearms training
</p>

<p align="center">
  <a href="https://farhodmuxtorov17-stack.github.io/ShaffofTIR/"><img src="https://img.shields.io/badge/LIVE%20DEMO-GitHub%20Pages-181717?logo=github" alt="Live Demo" /></a>
  <a href="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/ci.yml"><img src="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
  <a href="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/codeql.yml"><img src="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" /></a>
  <img src="https://img.shields.io/badge/Vue-3.4-42b883?logo=vuedotjs" alt="Vue 3.4" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06b6d4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-5.3-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Vitest-2.1-6e9f18?logo=vitest" alt="Vitest" />
  <img src="https://img.shields.io/badge/Playwright-1.45-2ead33?logo=playwright" alt="Playwright" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e" alt="MIT License" />
  <img src="https://img.shields.io/badge/coverage-37%20tests-22c55e" alt="Test Coverage" />
</p>

<p align="center">
  <a href="#getting-started">Quick Start</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#roles--access-control">Roles</a> ·
  <a href="#key-features">Features</a> ·
  <a href="#api-reference">API</a> ·
  <a href="#deployment">Deploy</a> ·
  <a href="CONTRIBUTING.md">Contribute</a> ·
  <a href="docs/">Docs</a>
</p>

---

## Overview

**ShaffofTIR** (ШаффофТир — «прозрачный тир») is a comprehensive, production-grade shooting range management platform designed for military units and law enforcement training facilities across the Republic of Uzbekistan.

It provides end-to-end management of shooting sessions, safety compliance, equipment tracking, personnel management, real-time range monitoring, and multi-level analytics — all wrapped in a polished, role-aware SPA with full bilingual support (Uzbek / Russian).

### Why ShaffofTIR?

- **5-tier RBAC** — granular, role-based access control with route guards and dynamic sidebar
- **Three-level Command Center** — Republic → Region → District drill-down with traffic-light KPI indicators
- **Mandatory Safety Certification** — 4-section TB course + 10-question exam requiring 100% to earn range access
- **Protocol Lifecycle** — multi-stage approval workflow with lock-on-approve/archive protection
- **Automated Scoring** — computer vision integration for target hit detection via FastAPI + OpenCV
- **Zero-reload UX** — all transitions handled client-side, no page refreshes needed
- **Production-proven** — 37 unit tests, 72 pages, type-safe end-to-end, deployed and battle-tested

---

## Architecture

```
                         ┌──────────────────────────┐
                         │    Browser (SPA)         │
                         │  Vue 3 · TypeScript      │
                         │  Tailwind · Pinia        │
                         └────────┬─────────┬───────┘
                                  │         │
                   ┌──────────────┘         └──────────────┐
                   │                                       │
         ┌─────────▼─────────┐                ┌────────────▼──────────┐
         │  Django REST API  │                │  Automated Scoring     │
         │  (Extended BFF)   │                │  (FastAPI + OpenCV)    │
         │                   │                │                        │
         │  Port 8000        │                │  Port 8001             │
         └────────┬──────────┘                └────────────────────────┘
                  │
         ┌────────▼──────────┐
         │  PostgreSQL 16+   │
         └───────────────────┘
```

### Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| Vue 3 | 3.4 | Reactive UI framework with Composition API + `<script setup>` |
| TypeScript | 5.5 | End-to-end type safety across all components, stores, and API clients |
| Vite | 5.3 | Lightning-fast HMR dev server and optimized production builds |
| Pinia | 2.x | Lightweight state management (auth, master data, sessions, UI, audit) |
| Vue Router | 4.4 | Client-side routing with role-based route guards |
| Tailwind CSS | 3.4 | Utility-first styling with custom design tokens |
| Lucide Icons | 0.408 | Consistent, tree-shakeable icon system |
| Vitest + Playwright | 2.1 / 1.45 | Unit + E2E testing |
| i18n | Custom | Full UZ/RU localization with U+02BB apostrophe compliance |

### Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend runtime |
| Django | 4.2 | REST API framework |
| DRF | 3.15 | Serializers, ViewSets, permissions |
| PostgreSQL | 16+ | Primary database |
| FastAPI | 0.110+ | Automated scoring microservice |
| OpenCV | 4.x | Target hit detection (computer vision) |

### Project Structure

```
shaffoftir/
├── src/
│   ├── api/               # Typed HTTP clients & API modules
│   │   ├── httpClient.ts          # Axios wrapper with interceptors
│   │   ├── extended.ts            # Extended API (auth, users, sessions)
│   │   ├── session.api.ts         # Session CRUD
│   │   ├── scoring.api.ts         # Scoring service client
│   │   ├── camera.api.ts          # Camera management
│   │   └── health.api.ts          # Health checks
│   ├── components/         # Reusable UI components
│   │   ├── layout/                # AppShell, AppSidebar, AppTopbar
│   │   ├── ui/                     # KPICard, LoadingState, ErrorState, etc.
│   │   ├── session/                # NewSessionModal, ShotTable, StatusFlow
│   │   ├── camera/                 # LiveCameraMini
│   │   └── target/                # TargetViewer, Target3DViewer
│   ├── data/               # Static data (republic hierarchy, units, employees)
│   ├── i18n/               # Internationalization (UZ/RU)
│   ├── pages/              # 72 page components (lazy-loaded)
│   ├── router/             # Route config with role-based guards
│   ├── stores/             # Pinia stores (auth, master, session, ui, audit)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Scoring presets, validation, overlap, error normalizer
├── backend/                # Django REST Framework backend
├── backend_fastapi/        # FastAPI scoring microservice
├── tests/                  # Unit tests (Vitest) + E2E tests (Playwright)
├── docs/                   # Architecture, API reference, data model, deployment
├── public/                 # Static assets (logo, favicon)
├── .github/                # CI/CD workflows, issue templates, PR template
├── Dockerfile              # Frontend container
├── docker-compose.yml      # Full-stack orchestration
├── netlify.toml            # Netlify deployment config
└── vercel.json              # Vercel deployment config
```

---

## Roles & Access Control

ShaffofTIR implements a five-tier Role-Based Access Control (RBAC) system. Each role sees a tailored sidebar and has route-level guards preventing unauthorized access.

| Role | Access Level | Key Modules |
|---|---|---|
| **SUPER_ADMIN** | Full system | All modules, admin panel, users, audit journal, system health |
| **MANAGER** | Regional oversight | Command center, analytics, KPI, protocols, reports, approval workflow |
| **INSTRUCTOR** | Training operations | Session creation, range control, weapons, training plans, results review |
| **EMPLOYEE** | Individual access | Personal results, training materials, safety certification, protocols |
| **TECHSPEC** | Infrastructure only | Range equipment, cameras, network diagnostics, weapon inventory |

### Route Guards

```typescript
// src/router/index.ts
{
  path: '/command-center',
  meta: { roles: ['SUPER_ADMIN', 'MANAGER'] }
}
```

### Module Access (auth store)

```typescript
// src/stores/auth.ts
const moduleAccess: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['*'],
  MANAGER: ['dashboard', 'command-center', 'results', 'analytics', ...],
  TECHSPEC: ['techspec', 'cameras', 'help', 'profile'],
  // ...
}
```

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | admin@shaffoftir.uz | admin123 |
| MANAGER | manager@shaffoftir.uz | manager123 |
| INSTRUCTOR | instructor@shaffoftir.uz | instructor123 |
| EMPLOYEE | soldier@shaffoftir.uz | soldier123 |
| TECHSPEC | *(PIN-protected entry)* | PIN: 8424 |

---

## Key Features

### Command Center
Three-level drill-down hierarchy: **Republic → Region → District → Unit/Employees**. Traffic-light KPI indicators (green ≥70, yellow ≥60, red <60) provide instant readiness visibility across the entire organizational structure. Interactive SVG map of Uzbekistan with gradient-filled regions.

### Safety Certification (TB Module)
Mandatory 4-section safety course covering:
1. General range rules
2. Weapon handling procedures
3. Firing line protocols
4. Emergency situations

A 10-question exam requires **100% correct answers** for range access. Progress is persisted in localStorage and survives page reloads.

### Session Management
Full lifecycle from session request → live execution → result review. Instructors create sessions, assign weapons, record shots via the Instructor Tablet interface, and generate protocols with PDF export (lazy-loaded jspdf + html2canvas).

### Protocol System
Formal shooting protocols with multi-stage approval workflow (DRAFT → REVIEW → APPROVED → ARCHIVED). Protocols in APPROVED or ARCHIVED status are **locked from editing** — enforced at both UI and route level.

### Equipment Tracking
Real-time inventory of weapons by type, status, and assignment. Technical specialists monitor camera status, network topology, and system health from a dedicated dashboard.

### Analytics
- Performance trends over time
- Soldier comparison tools
- Group analytics with visual KPI dashboards
- Data quality monitoring
- Integration health checks

### Internationalization
Full bilingual support with reactive locale switching:
- **Uzbek (uz)** — primary language, uses U+02BB (OKINA) for proper apostrophe rendering
- **Russian (ru)** — secondary language

All 72 pages are localized. Language preference persists across sessions.

---

## Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **npm** 10 or higher
- *(Optional)* Python 3.11+ for backend
- *(Optional)* PostgreSQL 16+ for backend

### Quick Start

```bash
# Clone
git clone https://github.com/farhodmuxtorov17-stack/ShaffofTIR.git
cd ShaffofTIR

# Install
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```bash
# .env
VITE_API_URL=https://your-django-api.com
VITE_API_URL_EXTENDED=https://your-extended-api.com
```

Copy `.env.example` to `.env` and configure. The app falls back to demo mode with built-in mock users if no backend is available.

### Docker

```bash
# Full stack (frontend + backend + database)
docker-compose up -d

# Frontend only
docker build -t shaffoftir .
docker run -p 8080:80 shaffoftir
```

---

## Testing

```bash
# Unit tests (Vitest)
npm run test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck

# E2E tests (Playwright — requires running dev server)
npm run test:e2e
```

Current test coverage: **37 unit tests across 5 test suites** — all passing.

| Test Suite | Tests | Coverage Area |
|---|---|---|
| `scoring.spec.ts` | 6 | Score calculation presets |
| `validation.spec.ts` | 12 | Input validation utilities |
| `overlap.spec.ts` | 6 | Session time overlap detection |
| `errorNormalizer.spec.ts` | 6 | Error message normalization |
| `imageUrl.spec.ts` | 7 | Image URL resolution logic |

---

## Deployment

### GitHub Pages (Primary)

The app auto-deploys to GitHub Pages via CI/CD on every push to `main`:

```
https://farhodmuxtorov17-stack.github.io/ShaffofTIR/
```

Build output uses `base: '/ShaffofTIR/'` with hash-based routing for SPA compatibility.

### Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

See `netlify.toml` for configuration.

### Vercel

```bash
npm run build
npx vercel --prod
```

See `vercel.json` for configuration.

### CI/CD Pipeline

| Stage | Trigger | Action |
|---|---|---|
| **Quality Gate** | Push / PR | Type check + Unit tests |
| **Build** | After quality pass | Production build + artifact upload |
| **Deploy** | Push to `main` | Auto-deploy to GitHub Pages |
| **CodeQL** | Push / PR / Weekly | Security vulnerability analysis |

---

## API Reference

See [docs/API_REFERENCE.md](docs/API_REFERENCE.md) for detailed endpoint documentation.

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | JWT authentication |
| POST | `/api/auth/refresh` | Token refresh |
| GET | `/api/sessions` | List shooting sessions |
| POST | `/api/sessions` | Create session |
| GET | `/api/protocols` | List protocols |
| POST | `/api/protocols/{id}/sign` | Sign/approve protocol |
| GET | `/api/weapons` | List weapons inventory |
| GET | `/api/cameras/status` | Camera health status |
| POST | `/api/scoring/capture` | Capture target image |
| POST | `/api/scoring/analyze` | Analyze hits (OpenCV) |

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System architecture, component diagram, data flow |
| [API Reference](docs/API_REFERENCE.md) | Full REST API endpoint documentation |
| [Data Model](docs/DATA_MODEL.md) | Database schema and entity relationships |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |
| [Video Script](docs/VIDEO_SCRIPT.md) | Project demo video script |
| [Contributing](CONTRIBUTING.md) | Development guidelines and PR process |
| [Changelog](CHANGELOG.md) | Version history and release notes |
| [Security Policy](SECURITY.md) | Vulnerability reporting and security practices |

---

## Tech Decisions

### Why Vue 3 + Pinia over React/Redux?
Pinia's composition API integration is seamless with Vue 3 `<script setup>`. No boilerplate, no action creators, no reducers — just direct, reactive state. Combined with TypeScript, it gives us end-to-end type inference that React/Redux can't match without significant additional tooling.

### Why Vite over Webpack?
Vite's native ESM dev server provides instant HMR regardless of project size. Our 72 pages load in milliseconds, not seconds. Production builds use Rollup with esbuild minification — significantly faster than Webpack with equivalent output quality.

### Why Tailwind over CSS-in-JS?
Utility-first CSS keeps component styles co-located without runtime overhead. Our custom design tokens (brand colors, shadows, animations) are defined once in `tailwind.config.js` and reused everywhere. Zero runtime CSS, smaller bundles, faster rendering.

### Why dual backend (Django + FastAPI)?
Django REST Framework handles the main API (auth, CRUD, business logic) with its mature ORM and admin panel. FastAPI powers the scoring microservice where async performance and OpenCV integration matter. This separation of concerns keeps each service focused and independently scalable.

### Why U+02BB for Uzbek apostrophes?
Uzbek Latin orthography uses the modifier letter U+02BB (ʻ) — not the ASCII apostrophe ('). Using the correct Unicode character ensures proper rendering across all platforms, correct alphabetization, and compliance with the official Uzbek language standard.

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and pull request guidelines.

---

<p align="center">
  <sub>Built with precision for the Republic of Uzbekistan Armed Forces</sub><br/>
  <sub>ShaffofTIR v3.3 · 2026</sub>
</p>
