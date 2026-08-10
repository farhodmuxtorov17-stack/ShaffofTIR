# Changelog

All notable changes to ShaffofTIR are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0] — 2026-08-10

### Added
- Comprehensive GitHub repository documentation (README, SECURITY, CODE_OF_CONDUCT, CONTRIBUTING)
- GitHub Actions CI/CD pipeline (type check → tests → build → deploy)
- CodeQL security analysis workflow (weekly + per-PR)
- Full architecture documentation with system diagrams
- Complete API reference documentation
- Data model documentation with ERD diagram
- Deployment guide (GitHub Pages, Netlify, Vercel, Docker)
- 37 unit tests across 5 test suites (scoring, validation, overlap, errorNormalizer, imageUrl)
- Premium dark theme with gradient map regions (135° three-stop gradients)
- Three-level Command Center drill-down (Republic → Region → District → Unit)
- Traffic-light KPI indicators (green ≥70, yellow ≥60, red <60)
- Mandatory TB safety course (4 sections × 5 rules)
- 10-question TB exam requiring 100% for range access
- Protocol lock-on-approve/archive (zero-edit policy)
- Technical specialist PIN-protected entry (8424)
- Uzbek (uz) and Russian (ru) localization with U+02BB apostrophe compliance
- Telegram Mini App login support
- Lazy loading for heavy dependencies (jspdf, html2canvas) — ProtocolCreatePage reduced from 611KB to 19KB
- Interactive SVG map of Uzbekistan with region drill-down
- Protocol export to PDF
- Session lifecycle management (request → active → completed)
- Weapon assignment and maintenance tracking
- Camera health monitoring dashboard
- Real-time range monitoring (LiveRangePage)
- Analytics dashboard with performance trends
- Soldier comparison tools
- Group analytics
- Data quality monitoring
- Integration health checks
- Audit journal for sensitive actions
- Notification center with settings
- KPI catalog and evaluation periods
- Objections and approval task workflow
- Auto-recommendations engine
- Action plans module

### Changed
- Migrated from flat colors to premium diagonal gradients for map regions
- Enhanced glow effect on selected map areas (SVG filter, 5px blur)
- Improved text contrast with shadows and stroke opacity over gradients
- Updated viewBox for full Uzbekistan territory coverage (0 0 1000 600)
- Moved region list to separate "Регионы" tab in bottom navigation
- Map click now opens region statistics directly (drill-down)

### Fixed
- Uzbek apostrophe rendering (U+02BB) across all 72 pages
- ProtocolCreatePage bundle size (611KB → 19KB via lazy loading)
- Missing roles (TechSpec/Super Admin) on LoginPage
- Route navigation without page refresh
- Map drill-down hierarchy consistency
- Locale type definition error across 19 pages
- Missing Activity icon import in CommandCenterPage

### Security
- PIN-protected technical specialist access
- Route guards on all 72 pages
- Zero-edit policy on APPROVED/ARCHIVED protocols
- Role-based module access control
- No hardcoded secrets in client bundle

---

## [3.2.0] — 2026-08-09

### Added
- Command Center initial implementation
- Republic data structure (14 regions of Uzbekistan)
- Unit data with personnel assignments
- Employee shooting history data

### Changed
- Redesigned Login page with premium dark theme
- Updated sidebar navigation for all 5 roles

---

## [3.1.0] — 2026-08-08

### Added
- Training materials module (4 sections)
- TB safety test (10 questions)
- Session scheduling
- Weapon inventory management

---

## [3.0.0] — 2026-08-07

### Added
- Initial Vue 3 + TypeScript + Vite setup
- Pinia state management
- Vue Router with role-based guards
- Tailwind CSS configuration
- i18n (UZ/RU) internationalization
- Django REST Framework backend
- FastAPI scoring microservice
- Docker and docker-compose configuration
- Netlify and Vercel deployment configs
- 72 page components
- 6 Pinia stores
- 7 API modules
- 4 utility modules with tests

### Breaking
- Complete rewrite from legacy system
- New role-based access control system
