# Contributing to ShaffofTIR

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/ShaffofTIR.git
cd ShaffofTIR
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Dev Server

```bash
npm run dev
```

Open `http://localhost:5173` and use any demo account to log in.

### 4. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

Branch naming convention:
- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation changes
- `refactor/` — code refactoring
- `test/` — test additions or changes
- `chore/` — maintenance tasks

## Code Standards

### TypeScript

- **Strict mode** is enabled. All code must pass `vue-tsc --noEmit`.
- Use Composition API with `<script setup lang="ts">`.
- Define explicit types for props, emits, and function returns.
- Avoid `any` — use `unknown` and narrow with type guards.

```typescript
// ✅ Good
interface Props {
  sessionId: string
  readonly?: boolean
}

const props = defineProps<Props>()

// ❌ Bad
const props = defineProps<any>()
```

### Vue Components

- One component per `.vue` file.
- Component names are PascalCase: `SessionDetailPage.vue`.
- Use scoped styles: `<style scoped>`.
- Computed properties for derived state.
- `ref()` for primitives, `reactive()` for objects (pick one and be consistent).

### State Management (Pinia)

- Store names use camelCase: `useAuthStore()`.
- Expose only what components need — keep internal state private.
- Use `computed()` for derived store values.

### Styling (Tailwind)

- Use design tokens from `tailwind.config.js` (brand colors, custom shadows).
- Prefer utility classes over custom CSS.
- Responsive: `sm:`, `md:`, `lg:` prefixes.
- Dark theme is the primary aesthetic — use `slate-900` / `slate-800` base.

### Internationalization (i18n)

- All user-facing strings must be localized in both **Uzbek (uz)** and **Russian (ru)**.
- Use the `useI18n()` composable: `const { t, locale } = useI18n()`.
- For inline strings: `isUz ? 'Uzbek text' : 'Русский текст'`.
- **Uzbek apostrophes** use U+02BB (ʻ), never ASCII apostrophe (').

### Routing

- All new routes must specify `meta.roles` for access control.
- Use lazy imports: `component: () => import('@/pages/YourPage.vue')`.
- Follow existing naming: `path: '/kebab-case'`, `name: 'PascalCase'`.

### File Organization

```
src/
  pages/          # One .vue file per route
  components/
    layout/       # App shell components
    ui/           # Reusable UI primitives
    session/      # Session-specific components
  stores/         # One .ts file per Pinia store
  api/            # One .ts file per API module
  utils/          # Pure functions, no side effects
  types/          # Shared TypeScript types
  data/           # Static data arrays
  i18n/           # Translation strings
```

## Testing

### Writing Tests

Unit tests use **Vitest** and live in `tests/unit/`. E2E tests use **Playwright** and live in `tests/e2e/`.

```typescript
// tests/unit/example.spec.ts
import { describe, it, expect } from 'vitest'
import { yourFunction } from '@/utils/yourModule'

describe('yourFunction', () => {
  it('should do the right thing', () => {
    expect(yourFunction(input)).toBe(expected)
  })
})
```

### Test Commands

```bash
npm run test          # Run unit tests
npm run test:watch    # Watch mode
npm run test:e2e      # E2E tests (needs running dev server)
npm run typecheck     # Type checking only
```

### Coverage Requirements

- New utility functions must have unit tests.
- New pages should have at least a smoke test (renders without crash).
- Bug fixes should include a regression test.

## Pull Request Process

### Before Submitting

1. Run the full quality gate:

```bash
npm run typecheck && npm run test && npm run build
```

2. All tests must pass.
3. No new TypeScript errors.
4. Production build succeeds.

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactor
- [ ] Test improvement

## Checklist
- [ ] Code passes typecheck
- [ ] Tests pass
- [ ] Build succeeds
- [ ] All user-facing strings are localized (UZ + RU)
- [ ] No AI-generated markers in code or UI
- [ ] New routes have role guards
- [ ] No hardcoded secrets or passwords

## Screenshots
(If UI changes, attach before/after screenshots)

## Related Issues
Closes #123
```

### Review Criteria

- **Type safety** — no `any`, proper types throughout
- **Localization** — all strings in both UZ and RU
- **Access control** — correct role guards on new routes
- **No AI markers** — no ChatGPT/AI/Claude references in code or UI
- **Production quality** — clean, maintainable, well-structured code
- **Performance** — lazy loading for heavy dependencies (jspdf, html2canvas)

## Release Process

1. Version bump in `package.json` (semantic versioning)
2. Update `CHANGELOG.md`
3. Tag release: `git tag v3.4.0`
4. Push tag: `git push origin v3.4.0`
5. GitHub Actions auto-deploys to GitHub Pages

## Questions?

Open a [Discussion](https://github.com/farhodmuxtorov17-stack/ShaffofTIR/discussions) or check the [docs](docs/) directory.
