# Maʼlumotlar modeli

## Entity-munosabatlar diagrammasi

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Foydalanuvchi  │     │    Sessiya      │     │    Natija     │
│   (User)         │     │   (Session)     │     │   (Result)    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id             │◄────│ instructor_id  │◄────│ session_id    │
│ full_name      │     │ range_id       │     │ employee_id   │
│ role           │     │ date           │     │ score         │
│ email          │     │ status         │     │ accuracy      │
│ personal_number│     │ weapon_id      │     │ shots_fired   │
│ rank           │     │ exercise_type  │     │ hits          │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       │                     │
┌──────┴──────────┐  ┌──────┴──────────┐  ┌──────────────┐
│  Boʻlinma (Unit)    │  │   Poligon (Range) │  │   Qurol (Weapon) │
├──────────────────┤  ├──────────────────┤  ├──────────────┤
│ id               │  │ id               │  │ id           │
│ name             │  │ name             │  │ name         │
│ type             │  │ region           │  │ serial_number│
│ parent_id        │  │ lanes_count      │  │ type         │
│ region           │  │ status           │  │ status       │
│ district         │  └──────────────────┘  │ last_service│
└──────────────────┘                        └──────────────┘
       │
┌──────┴──────────────────────────────────────────┐
│                    KPI                            │
├──────────────────────────────────────────────────┤
│ id · unit_id · period · indicator_type           │
│ value · target_value · status (green/yellow/red) │
└──────────────────────────────────────────────────┘
```

## Asosiy entity-lar

### 1. Foydalanuvchi (User)

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | number | Unikal identifikator |
| `full_name` | string | Toʻliq F.I.Sh. |
| `role` | enum | SUPER_ADMIN / MANAGER / INSTRUCTOR / TECHSPEC / EMPLOYEE |
| `email` | string | Email manzil |
| `personal_number` | string | Shaxsiy raqam |
| `rank` | string | Unvon |
| `unit_id` | number | Boʻlinma identifikatori |

### 2. Sessiya (Session)

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | string | Unikal identifikator (S-2026-XXX) |
| `date` | date | Oʻtkazilgan sana |
| `range_id` | number | Poligon identifikatori |
| `instructor_id` | number | Instruktur identifikatori |
| `exercise_type` | string | Mashq turi |
| `bullets` | number | Patronlar soni |
| `distance` | number | Masofa (metr) |
| `status` | enum | PLANNED / ACTIVE / COMPLETED / CANCELLED |

### 3. Natija (Result)

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | number | Unikal identifikator |
| `session_id` | string | Sessiya identifikatori |
| `employee_id` | number | Xodim identifikatori |
| `score` | number | Ball (0–100) |
| `accuracy` | number | Aniqlik foizi |
| `shots_fired` | number | Oʻqlangan patronlar |
| `hits` | number | Nishonga tegishlar |
| `soldier_seq` | number | Ketma-ketlik raqami |

### 4. KPI

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | number | Unikal identifikator |
| `unit_id` | number | Boʻlinma identifikatori |
| `period` | string | Davr (2026-Q3) |
| `indicator_type` | string | Koʻrsatkich turi |
| `value` | number | Joriy qiymat |
| `target_value` | number | Maqsadli qiymat |
| `status` | enum | GREEN (≥70) / YELLOW (≥60) / RED (<60) |

### 5. Protokol

| Maydon | Tur | Tavsif |
|--------|-----|--------|
| `id` | string | Unikal identifikator |
| `session_id` | string | Bogʻliq sessiya |
| `status` | enum | DRAFT / PENDING / APPROVED / ARCHIVED |
| `created_by` | number | Yaratuvchi |
| `approved_by` | number | Tasdiqlovchi |
| `pdf_url` | string | PDF fayl havolasi |

> **Muhim:** APPROVED va ARCHIVED holatidagi protokollarni tahrirlash taqiqlangan.
