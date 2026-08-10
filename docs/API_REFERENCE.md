# API Reference

## Base URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Django REST API | `https://soldier.mrdev.uz` | Auth, CRUD, business logic |
| FastAPI Scoring | `http://localhost:8001` | Target image analysis, scoring |
| Dataprizma | `https://dataprizma.uz` | External scoring sync |

## Authentication

### Login

```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "manager@shaffoftir.uz",
  "password": "manager123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "u001",
    "email": "manager@shaffoftir.uz",
    "full_name": "Тошматов Фирдавс Шерзодович",
    "role": "MANAGER",
    "rank": "Старшина",
    "department": "Огневая подготовка",
    "is_active": true
  }
}
```

### Refresh Token

```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout

```
POST /api/auth/logout
Authorization: Bearer <access_token>
```

---

## Sessions

### List Sessions

```
GET /api/sessions?page=1&page_size=20
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 20) |
| `status` | string | Filter by status: `pending`, `active`, `completed` |
| `date_from` | string | ISO date (YYYY-MM-DD) |
| `date_to` | string | ISO date (YYYY-MM-DD) |

### Create Session

```
POST /api/sessions
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Плановая стрельба 1-й роты",
  "date": "2026-08-15",
  "range_id": "r001",
  "weapon_type": "AK-74",
  "soldiers": ["e001", "e002", "e003"]
}
```

### Get Session Detail

```
GET /api/sessions/{id}
Authorization: Bearer <token>
```

### Finalize Session

```
POST /api/sessions/{id}/finalize
Authorization: Bearer <token>
```

Calculates final scores and transitions session to `completed` status.

---

## Protocols

### List Protocols

```
GET /api/protocols?status=DRAFT
Authorization: Bearer <token>
```

### Create Protocol

```
POST /api/protocols
Authorization: Bearer <token>
```

**Request:**
```json
{
  "session_id": "s001",
  "protocol_number": "P-2026-001",
  "participants": ["e001", "e002"],
  "scores": [
    { "soldier_id": "e001", "total_score": 85, "hits": 8, "penalties": 0 }
  ]
}
```

### Sign Protocol

```
POST /api/protocols/{id}/sign
Authorization: Bearer <token>
```

Transitions protocol from DRAFT → REVIEW → APPROVED.

**Response (403):**
```json
{
  "detail": "Protocol is locked (APPROVED/ARCHIVED status)"
}
```

### Add Comment

```
POST /api/protocols/{id}/comment
Authorization: Bearer <token>
```

**Request:**
```json
{
  "comment": "Результаты подтверждены",
  "soldier_seq": 1
}
```

### Export PDF

```
GET /api/protocols/{id}/export?format=pdf
Authorization: Bearer <token>
```

Returns PDF file (application/pdf).

---

## Weapons

### List Weapons

```
GET /api/weapons?type=AK-74&status=active
```

### Assign Weapon

```
POST /api/weapons/{id}/assign
```

**Request:**
```json
{
  "soldier_id": "e001",
  "session_id": "s001"
}
```

### Return Weapon

```
POST /api/weapons/{id}/return
```

### Maintenance Log

```
GET /api/weapons/{id}/maintenance
POST /api/weapons/{id}/maintenance
```

---

## Cameras

### Camera Status

```
GET /api/cameras/status
```

**Response:**
```json
{
  "total": 54,
  "online": 52,
  "offline": 2,
  "cameras": [
    { "id": "cam-001", "name": "Lane 1 Camera", "status": "online", "ip": "88.1.92.10" }
  ]
}
```

### Live Feed

```
GET /api/cameras/{id}/feed
```

Returns MJPEG stream.

---

## Scoring Service (FastAPI)

### Capture Target Image

```
POST /capture
```

**Request:**
```json
{
  "camera_id": "cam-001",
  "lane": 1
}
```

### Analyze Hits

```
POST /analyze
```

**Request:**
```json
{
  "image_url": "https://...",
  "target_type": "standard"
}
```

**Response:**
```json
{
  "hits": [
    { "x": 120.5, "y": 85.3, "score": 10 },
    { "x": 135.2, "y": 90.1, "score": 9 }
  ],
  "total_score": 47,
  "max_possible": 50
}
```

### Sync with Dataprizma

```
POST /sync
```

**Request:**
```json
{
  "session_id": "s001",
  "results": [...]
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "detail": "Human-readable error message",
  "code": "ERROR_CODE",
  "field_errors": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_FAILED` | 401 | Invalid credentials |
| `TOKEN_EXPIRED` | 401 | JWT access token expired |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `LOCKED` | 403 | Protocol is locked (APPROVED/ARCHIVED) |
| `RATE_LIMITED` | 429 | Too many requests |

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/auth/login` | 5 per minute per IP |
| `/api/auth/refresh` | 10 per minute per IP |
| All other endpoints | 100 per minute per token |
