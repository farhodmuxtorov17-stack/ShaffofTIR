# Развёртывание ShaffofTIR

## Netlify (Frontend)

```bash
npm install
npm run build
netlify deploy --dir=dist --prod
```

Конфигурация: `netlify.toml`

```toml
[build]
  command = "npm install && npx vite build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://api.shaffoftir.uz/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Docker Compose

```bash
docker-compose up -d
```

Сервисы:
- `frontend`: Vue 3 SPA (port 3000)
- `backend`: Django REST (port 8000)
- `scoring`: FastAPI (port 8001)
- `db`: PostgreSQL 16 (port 5432)
- `redis`: Redis 7 (port 6379)

## Production checklist

1. Установить `DEBUG=False` в Django settings
2. Сгенерировать новый `SECRET_KEY`
3. Настроить `ALLOWED_HOSTS`
4. Включить HTTPS (Let's Encrypt / Cloudflare)
5. Настроить static files (WhiteNoise / Nginx)
6. Включить Gunicorn/uWSGI
7. Настроить PostgreSQL connection pooling
8. Включить Redis для кэширования
9. Настроить backup-стратегию для БД
10. Проверить CORS-политику

## Статические IP

Камеры и оборудование используют статические IP-адреса:

| Оборудование | Диапазон | Назначение |
|-------------|----------|-----------|
| Камеры Тир 1 | 88.1.92.10 - 88.1.92.15 | Дорожки 1-6 |
| Камеры Тир 2 | 88.1.93.10 - 88.1.93.15 | Дорожки 1-6 |
| Сервер | 88.1.90.1 | Backend |
| NVR | 88.1.90.2 | Запись видео |
