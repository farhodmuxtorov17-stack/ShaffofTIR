# Nishon AI backend ulash bo'yicha qo'llanma

Ushbu hujjat frontend jamoasi Nishon AI backendiga ulanishi uchun kerak. Backend FastAPI orqali ishlaydi.

## 1. Backend manzili

Development:

```text
http://127.0.0.1:8000
```

Server ishga tushirish:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Tekshirish:

```http
GET /health
```

Muvaffaqiyatli javob:

```json
{
  "status": "alive",
  "message": "Nishon AI Engine is ready."
}
```

OpenAPI hujjatlari:

```text
http://127.0.0.1:8000/docs
```

## 2. Frontend jamoasiga biz berishimiz kerak bo'lgan narsalar

1. Backend base URL:

```text
http://SERVER_IP:PORT
```

2. API contract:

```text
docs/frontend_integration_guide.md
```

3. Environment namunasi:

```text
.env.example
```

4. Model fayllari backend serverda bo'lishi kerak:

```text
ai/models/target_detector.pt
ai/models/bullet_detector.pt
ai/models/bullet_detector2.pt
```

5. Backendni ishga tushirish uchun:

```text
requirements.txt
main.py
api/
core/
ai/
db/
```

6. Agar frontend alohida domain/portda ishlasa:

Backendda CORS hozir `*` qilib ochiq. Productionda aniq frontend domain qo'yilishi mumkin.

7. Kamera ma'lumotlari:

```json
{
  "camera_ip": "192.168.1.64 yoki rtsp://...",
  "username": "admin",
  "password": "camera_password"
}
```

8. Rasm URLlari:

Backend natija rasmlarini quyidagi static path orqali beradi:

```text
/static/results/...
/static/captures/...
```

Frontend bu pathlarni backend base URL bilan birlashtirishi kerak:

```js
const imageUrl = `${BACKEND_BASE_URL}${result.result_image_url}`;
```

## 3. Frontend firma bizga nimalarni berishi kerak

Frontend jamoasi ishni to'g'ri ulashi va biz backend tomondan moslab berishimiz uchun quyidagi ma'lumotlarni berishi kerak.

### 3.1 Frontend joylashadigan manzil

Ular frontend qayerda ishlashini aytishi kerak:

```text
Development URL: http://localhost:3000
Production URL: https://example.uz
```

Agar productionda CORS cheklash kerak bo'lsa, shu domainlar backendga qo'shiladi.

### 3.2 Ulanish rejimi

Qaysi oqimdan foydalanishlarini aniq aytishlari kerak:

1. Faqat rasm upload orqali demo/test
2. Real kamera orqali scoring
3. Dataprizma yoki boshqa tashqi tizim eventlari orqali scoring

Har bir rejimda request formati farq qiladi.

### 3.3 UI uchun kerakli maydonlar

Ular frontendda qaysi maydonlar bo'lishini kelishib berishi kerak:

```text
session_id
soldier_seq yoki askar raqami
shot_type: TEST / MAIN
expected_shots
baseline_file
current image file
camera_ip
username
password
```

### 3.4 Session va askar tartibi logikasi

Ular quyidagilarni aniqlab berishi kerak:

1. Bitta session qachon boshlanadi va qachon tugaydi?
2. Askar raqami frontendda qo'lda kiritiladimi yoki tizimdan keladimi?
3. Bir nishonda bir nechta askar ketma-ket otadimi?
4. Har askar uchun baseline qanday tanlanadi?
5. TEST va MAIN natijalari alohida ko'rsatiladimi yoki umumiy jamlanadimi?

### 3.5 Dizayn va ekranlar

Frontend firma quyidagilarni berishi kerak:

1. Ekranlar ro'yxati
2. Dizayn maket yoki Figma link
3. Ranglar, logo, shriftlar
4. Operator qanday ketma-ketlikda ishlashini ko'rsatuvchi flow
5. Natija jadvali qanday ko'rinishda bo'lishi
6. Chop etish yoki PDF kerak bo'lsa, uning formati

### 3.6 Auth va xavfsizlik talabi

Hozir backendda login/API key yo'q. Agar kerak bo'lsa, ular quyidagilarni aytishi kerak:

1. Login-parol bo'ladimi?
2. Role kerakmi? Masalan: admin, operator, kuzatuvchi
3. API key yoki token bilan ishlaydimi?
4. Kamera paroli frontendda saqlanadimi yoki backend konfiguratsiyada turadimi?

### 3.7 Kamera ma'lumotlari

Real kamera bilan ishlashsa, ular yoki buyurtmachi quyidagilarni berishi kerak:

```json
{
  "camera_ip": "192.168.1.64",
  "username": "admin",
  "password": "password",
  "rtsp_url": "rtsp://..."
}
```

Qo'shimcha:

1. Kamera modeli
2. Kamera resolution
3. RTSP stream path
4. Bir vaqtning o'zida nechta kamera ishlashi
5. Kamera IP lari static bo'ladimi yoki o'zgaradimi

### 3.8 Test uchun rasm va kutilgan natijalar

Frontend testni to'g'ri qilish uchun ular biz bilan kelishib quyidagilarni ishlatishi kerak:

1. Toza nishon rasmi
2. 5 ta o'q tekkan rasm
3. 10 ta o'q tekkan rasm
4. Ketma-ket otish uchun baseline/current juft rasmlar
5. Har bir test rasm uchun kutilgan o'q soni va ballar

### 3.9 Backenddan kutadigan response formati

Agar ular boshqa format xohlasa, oldindan aytishi kerak. Masalan:

```json
{
  "soldier_id": "1",
  "total_score": 44,
  "hit_count": 6,
  "miss_count": 9,
  "image_url": "/static/results/...",
  "shots": []
}
```

Agar field nomlarini o'zgartirish kerak bo'lsa, backendda adapter qo'shiladi yoki frontend mapping qiladi.

### 3.10 Topshirish formati

Ular yakunda nimani topshirishini aytishi kerak:

1. Faqat frontend source code
2. Build qilingan static fayllar
3. Docker image
4. Backend bilan bitta serverda ishlaydigan build
5. Alohida domain/serverda ishlaydigan frontend

## 4. Asosiy endpointlar

### 4.1 Health check

```http
GET /health
```

Frontend ilova ochilganda backend tirikligini tekshirish uchun ishlatiladi.

### 4.2 Local session yaratish

Rasm upload orqali test qilishdan oldin session yaratiladi.

```http
POST /api/session/start
Content-Type: application/json
```

Request:

```json
{
  "soldier_count": 5,
  "cameras": []
}
```

Kamera bilan session yaratish:

```json
{
  "soldier_count": 5,
  "cameras": [
    {
      "camera_ip": "192.168.1.64",
      "username": "admin",
      "password": "password",
      "label": "Lane 1"
    }
  ]
}
```

Response ichidan `session.id` olinadi va keyingi scoring requestlarida `session_id` sifatida yuboriladi.

Muhim fieldlar:

```json
{
  "session": {
    "id": "local-session-id",
    "created_at": "2026-06-23T...",
    "status": "active",
    "soldiers": []
  },
  "total_cameras": 0,
  "active_cameras": 0,
  "camera_results": []
}
```

### 4.3 Kamera tekshirish

```http
POST /api/camera-health
Content-Type: application/json
```

Request:

```json
{
  "cameras": [
    {
      "camera_ip": "192.168.1.64",
      "username": "admin",
      "password": "password",
      "label": "Lane 1"
    }
  ]
}
```

Response:

```json
{
  "total_cameras": 1,
  "active_cameras": 1,
  "camera_results": [
    {
      "camera_index": 1,
      "camera_ip": "192.168.1.64",
      "status": "active",
      "detail": "OK",
      "camera_source": "rtsp://...",
      "width": 1280,
      "height": 720,
      "capture_image_url": "/static/captures/..."
    }
  ]
}
```

### 4.4 Rasm upload orqali scoring

Bu demo va manual test uchun eng kerakli endpoint.

```http
POST /api/session/process_turn/upload
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Required | Izoh |
| --- | --- | --- | --- |
| `session_id` | string | ha | `/api/session/start` dan olingan ID |
| `soldier_seq` | integer | ha | askar tartib raqami, masalan `1` |
| `shot_type` | string | ha | `TEST` yoki `MAIN` |
| `expected_shots` | integer | ha | berilgan o'q soni |
| `file` | file | ha | hozirgi rasm |
| `baseline_file` | file | yo'q | oldingi/toza nishon rasmi |

Frontend JavaScript namunasi:

```js
const form = new FormData();
form.append("session_id", sessionId);
form.append("soldier_seq", "1");
form.append("shot_type", "MAIN");
form.append("expected_shots", "10");
form.append("file", currentImageFile);

// Ixtiyoriy: eski rasm yoki toza nishon rasmi
form.append("baseline_file", baselineImageFile);

const res = await fetch(`${BACKEND_BASE_URL}/api/session/process_turn/upload`, {
  method: "POST",
  body: form
});

const data = await res.json();
```

Response:

```json
{
  "session_id": "local-session-id",
  "soldier_sequence": 1,
  "shot_type": "MAIN",
  "total_new_shots_found": 5,
  "hit_count": 5,
  "miss_count": 5,
  "new_shots": [
    {
      "id": 1,
      "soldier_id": 1,
      "shot_type": "MAIN",
      "x": 763.1,
      "y": 639.2,
      "score": 9
    }
  ],
  "result_image_url": "/static/results/...",
  "warning": null,
  "camera_results": [],
  "used_camera_index": null,
  "used_camera_source": null,
  "capture_image_url": null
}
```

Frontendda ko'rsatiladigan asosiy fieldlar:

| UI nomi | Response field |
| --- | --- |
| Topilgan o'q soni | `total_new_shots_found` |
| Tekkan | `hit_count` |
| Tegmagan | `miss_count` |
| Umumiy ball | `sum(new_shots[].score)` |
| Natija rasmi | `result_image_url` |
| Jadval | `new_shots` |

`result_image_url` nisbiy path bo'ladi. To'liq URL:

```js
const fullResultImageUrl = `${BACKEND_BASE_URL}${data.result_image_url}`;
```

### 4.5 Kamera orqali scoring

```http
POST /api/session/process_turn
Content-Type: application/json
```

Request:

```json
{
  "session_id": "local-session-id",
  "soldier_seq": 1,
  "shot_type": "TEST",
  "expected_shots": 4,
  "cameras": [
    {
      "camera_ip": "192.168.1.64",
      "username": "admin",
      "password": "password",
      "label": "Lane 1"
    }
  ]
}
```

Response formati upload scoring bilan deyarli bir xil. Farqi:

```json
{
  "capture_image_url": "/static/captures/...",
  "camera_results": [
    {
      "camera_index": 1,
      "status": "active"
    }
  ]
}
```

## 5. Dataprizma event oqimi

Dataprizma yoki tashqi tizim uchun bitta endpoint ishlatiladi:

```http
POST /api/dataprizma/shooting-event
Content-Type: application/json
```

Ruxsat etilgan actionlar:

```text
START_TEST
END_TEST
START_MAIN
END_MAIN
```

### 5.1 START_TEST / START_MAIN

Bu bosqichda backend kamera ulanishini tekshiradi va baseline capture oladi.

Request:

```json
{
  "action_name": "START_TEST",
  "data": [
    {
      "external_id": "soldier-1",
      "bullet_count": 4,
      "shooting_session": {
        "external_id": "session-001",
        "shooting_lane_cameras": [
          {
            "camera_ip": "192.168.1.64",
            "username": "admin",
            "password": "password"
          }
        ]
      }
    }
  ]
}
```

Response:

```json
{
  "is_success": true,
  "message": "Barcha kameraga ulanib rasm olindi",
  "data": [
    {
      "session_external_id": "session-001",
      "total_cameras": 1,
      "active_cameras": 1,
      "inactive_cameras": 0,
      "camera_results": [],
      "failed_cameras": [],
      "assigned_lanes": [
        {
          "camera_index": null,
          "camera_ip": "192.168.1.64",
          "soldier_sequence": 1
        }
      ]
    }
  ]
}
```

### 5.2 END_TEST / END_MAIN

Bu bosqichda backend kameradan rasm olib AI scoring qiladi.

Request:

```json
{
  "action_name": "END_TEST",
  "data": [
    {
      "external_id": "soldier-1",
      "bullet_count": 4,
      "shooting_session": {
        "external_id": "session-001",
        "shooting_lane_cameras": [
          {
            "camera_ip": "192.168.1.64",
            "username": "admin",
            "password": "password"
          }
        ]
      }
    }
  ]
}
```

Response:

```json
{
  "action_name": "END_TEST",
  "data": [
    {
      "external_id": "soldier-1",
      "shooting_session": {
        "external_id": "session-001"
      },
      "response_payload": {
        "local_session_id": "local-session-id",
        "local_soldier_sequence": 1,
        "shot_type": "TEST",
        "event_status": "ENDED",
        "bullet_count": 4,
        "total_score": 32,
        "total_shots_recorded": 4,
        "hit_count": 4,
        "miss_count": 0,
        "test_score": 32,
        "main_score": 0,
        "result_image_url": "/static/results/...",
        "capture_image_url": "/static/captures/...",
        "result_image_base64": "data:image/jpeg;base64,...",
        "camera_results": [],
        "shots": [
          {
            "id": 1,
            "soldier_id": 1,
            "shot_type": "TEST",
            "x": 763.1,
            "y": 639.2,
            "score": 9
          }
        ],
        "error_message": null
      }
    }
  ]
}
```

## 6. Baseline qoidasini frontendda qanday ishlatish kerak

Rasm upload testida `baseline_file` ixtiyoriy, lekin eski o'qlarni ajratish uchun juda muhim.

Oddiy qoida:

1. Agar toza nishondan boshlasangiz:
   - `baseline_file`: toza nishon rasmi
   - `file`: o'q tegilgan hozirgi rasm

2. Agar birinchi askardan keyin ikkinchi askar otgan bo'lsa:
   - `baseline_file`: birinchi askardan keyingi rasm
   - `file`: ikkinchi askardan keyingi rasm

3. Har yangi bosqichda baseline oldingi holat bo'lishi kerak.

Ya'ni baseline doim "oldingi holat", current esa "hozirgi holat".

## 7. Error handling

Frontend quyidagilarni tekshirishi kerak:

1. HTTP status `200` bo'lmasa, `detail` yoki `message` ni ko'rsatish.
2. `result_image_url` bo'sh bo'lsa, rasm panelida "Natija rasmi yo'q" deb ko'rsatish.
3. Kamera ishlamasa, `camera_results[].status` va `camera_results[].detail` ni ko'rsatish.
4. `event_status = "ERROR"` bo'lsa, `error_message` ni operatorga chiqarish.

Misol:

```js
if (!res.ok) {
  const err = await res.json();
  throw new Error(err.detail?.message || err.message || err.detail || "Server error");
}
```

## 8. Frontend uchun tavsiya qilingan ekranlar

Minimum kerakli ekran:

1. Backend status
2. Session ID
3. Askar raqami
4. TEST / MAIN tanlash
5. O'q soni
6. Baseline rasm yuklash
7. Hozirgi rasm yuklash
8. Upload scoring tugmasi
9. Natija rasmi
10. Tekkan / tegmagan / umumiy ball
11. Shotlar jadvali: `#`, `shot_type`, `score`, `x`, `y`

Kamera varianti uchun qo'shimcha:

1. Kamera IP yoki RTSP URL
2. Login
3. Parol
4. Kamera tekshirish tugmasi
5. START_TEST / END_TEST / START_MAIN / END_MAIN tugmalari

## 9. Muhim texnik eslatmalar

1. Auth hozir backendda yo'q. Agar public serverga qo'yilsa, API key yoki login qo'shish kerak.
2. CORS hozir barcha originlarga ochiq.
3. `expected_shots` 1 dan 50 gacha bo'lishi kerak.
4. `shot_type` qiymati frontendda faqat `TEST` yoki `MAIN` bo'lishi kerak.
5. Kamera parollari frontendda doim himoyalangan tarzda ishlatilishi kerak. Public browserda parol saqlash xavfli.
6. Natija rasmi static URL bilan keladi, frontend backend domainini qo'shib ko'rsatadi.
7. Demo uchun upload endpoint yetarli; real poligon uchun Dataprizma yoki camera endpoint ishlatiladi.
