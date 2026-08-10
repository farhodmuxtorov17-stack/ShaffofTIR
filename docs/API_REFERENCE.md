# API havolasi

## Asosiy URL-lar

| Xizmat | URL | Maqsad |
|--------|-----|--------|
| Frontend (GitHub Pages) | https://farhodmuxtorov17-stack.github.io/ShaffofTIR/ | Asosiy ilova |
| Frontend (Netlify) | https://e-shaffoftir.netlify.app | Koʻzgu |
| Demo API | localStorage | Demo-rejim (real backendsiz) |

## Demo-rejim

Hozirgi holatda ilova toʻliq demo-rejimda ishlaydi — barcha maʼlumotlar `localStorage` da saqlanadi. Real backend ulanganda quyidagi endpoint-lar talab qilinadi:

### Avtorizatsiya

| Metod | Marshrut | Tavsif |
|-------|----------|--------|
| `POST` | `/api/auth/login` | Tizimga kirish (email + parol) |
| `POST` | `/api/auth/logout` | Tizimdan chiqish |
| `GET` | `/api/auth/me` | Joriy foydalanuvchi maʼlumotlari |

### Sessiyalar

| Metod | Marshrut | Tavsif |
|-------|----------|--------|
| `GET` | `/api/sessions` | Sessiyalar roʻyxati |
| `POST` | `/api/sessions` | Yangi sessiya yaratish |
| `GET` | `/api/sessions/:id` | Sessiya tafsilotlari |
| `PATCH` | `/api/sessions/:id` | Sessiyani yangilash |
| `DELETE` | `/api/sessions/:id` | Sessiyani oʻchirish |

### Natijalar

| Metod | Marshrut | Tavsif |
|-------|----------|--------|
| `GET` | `/api/results` | Natijalar roʻyxati (filtrlar bilan) |
| `GET` | `/api/results/:id` | Batafsil natija |
| `POST` | `/api/results` | Natijani qoʻshish |
| `GET` | `/api/results/export` | PDF/Excel eksport |

### KPI

| Metod | Marshrut | Tavsif |
|-------|----------|--------|
| `GET` | `/api/kpi` | KPI koʻrsatkichlari |
| `POST` | `/api/kpi` | Yangi KPI yaratish |
| `PATCH` | `/api/kpi/:id` | KPI ni yangilash |

### Protokollar

| Metod | Marshrut | Tavsif |
|-------|----------|--------|
| `GET` | `/api/protocols` | Protokollar roʻyxati |
| `POST` | `/api/protocols` | Yangi protokol yaratish |
| `PATCH` | `/api/protocols/:id/approve` | Protokolni tasdiqlash |
| `PATCH` | `/api/protocols/:id/archive` | Protokolni arxivlash |

> **Eslatma:** APPROVED va ARCHIVED holatidagi protokollarni tahrirlash taqiqlangan.

### Kameralar

| Metod | Marshrut | Tavsif |
|-------|----------|--------|
| `GET` | `/api/cameras` | Kamera roʻyxati |
| `GET` | `/api/cameras/:id/stream` | LIVE video oqim (WebSocket / RTSP) |
| `POST` | `/api/cameras/:id/snapshot` | Snapshot olish |

## Autentifikatsiya formati

```json
// POST /api/auth/login
{
  "email": "admin@shaffoftir.uz",
  "password": "admin123"
}

// Javob
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "full_name": "Tizim Administratori",
    "role": "SUPER_ADMIN"
  }
}
```

Keyingi soʻrovlarda:

```
Authorization: Bearer eyJhbGci...
```
