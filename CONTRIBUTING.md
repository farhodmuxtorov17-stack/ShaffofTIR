# Contributing to ShaffofTIR

Thank you for your interest in contributing to ShaffofTIR. This document outlines the development workflow, code standards, and review process.

## Development Workflow

### 1. Fork and Clone

```bash
git clone https://github.com/farhodmuxtorov17-stack/ShaffofTIR.git
cd ShaffofTIR
npm install
```

### 2. Branch Naming

Create a branch from `main` using the following convention:

```
feature/short-description      # New features
fix/issue-description           # Bug fixes
refactor/module-name            # Code refactoring
docs/update-target              # Documentation changes
```

### 3. Commit Messages

Follow the conventional commits standard:

```
type(scope): brief description

type: feat | fix | refactor | docs | style | test | chore
scope: the module or component affected (optional)
```

Examples:
```
feat(training): add safety test scoring logic
fix(router): correct role guard for techspec
refactor(stores): extract master data initialization
```

### 4. Pull Requests

- One feature or fix per PR
- Include a clear description of what changed and why
- Reference any related issues
- Ensure all tests pass before requesting review

## Code Standards

### Vue Components

All components use `<script setup lang="ts">` with the Composition API.

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const data = ref<Item[]>([])

onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})
</script>

<template>
  <LoadingState v-if="loading" />
  <div v-if="!loading">
    <!-- content -->
  </div>
</template>
```

### TypeScript

- Strict mode enabled
- All function parameters and return types should be typed
- Use `interface` for object shapes, `type` for unions
- Avoid `any` - use `unknown` and narrow with type guards

### Styling

- Tailwind CSS utility classes in templates
- No inline styles unless dynamic values are required
- Component-scoped styles in `<style scoped>` blocks
- Use the design tokens defined in `tailwind.config.js`

### State Management

- Pinia stores in `src/stores/`
- Each store is responsible for one domain (auth, master data, sessions, UI)
- Actions for async operations, getters for computed state
- No direct store mutation from components - use actions

### Internationalization

- All user-facing text must be in the i18n system
- Both Uzbek and Russian translations are required
- Uzbek text uses U+02BB (OKINA) character for apostrophes
- No hardcoded strings in templates or components

### File Naming

- Pages: `PascalCasePage.vue` (e.g., `TrainingMaterialsPage.vue`)
- Components: `PascalCase.vue` (e.g., `TargetViewer.vue`)
- Stores: `camelCase.ts` (e.g., `sessionHistory.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)

## Testing

### Unit Tests

```bash
npm run test
```

Write tests using Vitest. Place test files alongside the source file:

```
src/utils/formatDate.ts
src/utils/formatDate.test.ts
```

### E2E Tests

```bash
npm run test:e2e
```

Playwright tests are in the `tests/` directory. Each test covers a user flow across multiple pages.

## Review Criteria

Pull requests are reviewed against the following criteria:

1. **Functionality** - Does the change work as described?
2. **Type Safety** - No TypeScript errors, no `any` without justification
3. **i18n** - All new text is translated in both UZ and RU
4. **RBAC** - Route guards and sidebar items are correct for all roles
5. **Performance** - No unnecessary re-renders, lazy-loaded heavy components
6. **Accessibility** - Semantic HTML, keyboard navigation, ARIA labels where needed
7. **No Artifacts** - No console.log, TODO comments, or debug code
