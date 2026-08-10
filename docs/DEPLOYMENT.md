# Deployment Guide

## Overview

ShaffofTIR can be deployed to multiple platforms. The primary deployment target is **GitHub Pages**, with alternatives for Netlify, Vercel, and Docker.

## GitHub Pages (Primary)

### Automatic Deployment

Pushing to the `main` branch triggers the CI/CD pipeline:

1. **Quality Gate** — type check + unit tests
2. **Build** — production build via `npm run build`
3. **Deploy** — auto-deploy to GitHub Pages via `peaceiris/actions-gh-pages`

```yaml
# .github/workflows/ci.yml (deploy job)
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    force_orphan: true
```

### Manual Deployment

```bash
npm run build
npx gh-pages -d dist
```

### Configuration

The `base` path is set in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/ShaffofTIR/',  // GitHub Pages subpath
  // ...
})
```

Hash-based routing ensures SPA compatibility:

```typescript
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL || '/'),
})
```

### URL

```
https://farhodmuxtorov17-stack.github.io/ShaffofTIR/
```

---

## Netlify

### Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

---

## Vercel

### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Deploy

```bash
npm run build
npx vercel --prod
```

---

## Docker

### Frontend Only

```bash
docker build -t shaffoftir .
docker run -p 8080:80 shaffoftir
```

### Full Stack

```bash
docker-compose up -d
```

Services:
- `frontend` — Nginx serving built SPA (port 8080)
- `backend` — Django REST API (port 8000)
- `scoring` — FastAPI scoring service (port 8001)
- `db` — PostgreSQL 16 (port 5432)

---

## Environment Variables

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Django REST API URL | `https://soldier.mrdev.uz` |
| `VITE_API_URL_EXTENDED` | Extended API URL | `https://soldier.mrdev.uz` |

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://...` |
| `SECRET_KEY` | Django secret key | — |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Comma-separated hosts | `*` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins | — |

---

## Build Output

```
dist/
├── index.html              # Entry point (~2KB)
├── assets/
│   ├── index-[hash].js     # Main bundle (~1.8MB, gzipped ~400KB)
│   └── style-[hash].css   # Stylesheet (~166KB, gzipped ~25KB)
└── favicon.svg             # Favicon
```

Build configuration highlights:
- `inlineDynamicImports: true` — single optimized bundle
- `cssCodeSplit: false` — one CSS file
- `assetsInlineLimit: 100MB` — assets inlined
- `minify: 'esbuild'` — fast, efficient minification
- `chunkSizeWarningLimit: 2000` — suppress size warnings

---

## Health Checks

### Frontend

```bash
curl -s https://farhodmuxtorov17-stack.github.io/ShaffofTIR/ | head -1
# Should return: <!DOCTYPE html>
```

### Backend

```bash
curl https://your-api.com/api/health
# {"status": "ok", "version": "3.3.0"}
```

### Scoring Service

```bash
curl http://localhost:8001/health
# {"status": "ok", "opencv": true}
```

---

## Rollback

### GitHub Pages

```bash
# Checkout a previous commit
git checkout <commit-hash>
npm run build
npx gh-pages -d dist
```

### Netlify

Use the Netlify dashboard to rollback to a previous deploy with one click.
