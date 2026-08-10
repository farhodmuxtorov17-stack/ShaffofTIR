# SHAFFOFTIR — LOYIHANI TOPSHIRISH HUJJATI

**Topshirish sanasi:** 2026-yil 10-avgust
**Versiya:** 1.0.0
**Holati:** Production-ready (ishlab chiqarishga tayyor)

---

## 1. HAVOLALAR

### Production (GitHub Pages)
- **Asosiy ilova:** https://farhodmuxtorov17-stack.github.io/ShaffofTIR/
- **Mini-ilova (planshet):** https://farhodmuxtorov17-stack.github.io/ShaffofTIR/?miniapp=1&device=tablet
- **Mini-ilova (menejer):** https://farhodmuxtorov17-stack.github.io/ShaffofTIR/?miniapp=1&device=tablet&role=MANAGER

### Netlify (koʻzgu)
- **URL:** https://e-shaffoftir.netlify.app

### Manba kodi
- **GitHub repozoriy:** https://github.com/farhodmuxtorov17-stack/ShaffofTIR
- **Asosiy branch:** main
- **Deploy branch:** gh-pages

### Demo-video
- **Ssenariy:** /docs/VIDEO_SCRIPT.md
- **Taqdimot videosi:** /docs/presentation.mp4

---

## 2. HISOB MAʼLUMOTLARI (DEMO-REJIM)

Barcha hisoblar demo-rejimda ishlaydi (real backendsiz).

| № | Rol | Email | Parol | F.I.Sh. |
|---|-----|-------|-------|---------|
| 1 | **SUPER_ADMIN** | admin@shaffoftir.uz | `admin123` | Tizim Administratori |
| 2 | **MANAGER** (Rahbariyat) | manager@shaffoftir.uz | `manager123` | Toshmatov Firdavs Sherzodovich |
| 3 | **INSTRUCTOR** | instructor@shaffoftir.uz | `instructor123` | Mahmudov Sardor Baxtiyorovich |
| 4 | **TECHSPEC** (Texnik mutaxassis) | techspec@shaffoftir.uz | `techspec123` | Normurodov Jasur Bahriddinovich |
| 5 | **EMPLOYEE** (Xodim) | soldier@shaffoftir.uz | `soldier123` | Yuldashev Dilshod Abdullojonovich |

> Tezkor kirish: URL-parametri orqali — `?role=MANAGER` — avtomatik avtorizatsiya.

---

## 3. ROLLAR VA RUXSATLAR

| Rol | Ruxsat berilgan modullar |
|-----|--------------------------|
| **SUPER_ADMIN** | Barcha modullar, foydalanuvchilar, sozlamalar, audit — toʻliq ruxsat |
| **MANAGER** | Boshqaruv paneli, Komanda markazi, Vaziyat markazi, KPI, Kelishuvlar, Eʼtirozlar, Hisobotlar, Protokollar |
| **INSTRUCTOR** | Sessiyalar, Protokollar (yaratish), Kameralar, Vaziyat markazi, Oʻquv materiallari |
| **TECHSPEC** | Texnik sahifa, Kameralar, Tizim sozlamalari |
| **EMPLOYEE** | Shaxsiy natijalar, Oʻquv materiallari, Sessiyalar (koʻrish) |

---

## 4. ASOSIY MODULLAR

| Modul | Marshrut | Tavsif |
|-------|----------|--------|
| Boshqaruv paneli | `/dashboard` | KPI-umumiy, xarita, top-regionlar |
| Komanda markazi | `/command-center` | 3 bosqichli drill-down: Respublika → Viloyat → Tuman |
| Vaziyat markazi | `/live-range` | LIVE kameralar, nishonlar, voqealar jurnali, 7 poligon |
| Sessiyalar | `/sessions` | Otishma kalendari va boshqaruvi |
| Natijalar | `/results` | Individual va guruh natijalari |
| Taqqoslash | `/compare` | Xodimlar va guruhlarni taqqoslash |
| KPI Katalog | `/kpi/catalog` | 8 koʻrsatkich, progress-bar bilan |
| KPI Redaktor | `/kpi/editor` | KPI yaratish va tahrirlash |
| Kelishuvlar | `/approval-tasks` | 14 hujjat tasdiqlash vazifalari |
| Eʼtirozlar | `/objections` | 10 yozuv, koʻrib chiqishni boshqarish |
| Protokollar | `/protocols` | Yaratish, koʻrish, tasdiqlash. APPROVED/ARCHIVED holatida tahrirlash taqiqlangan |
| Oʻquv materiallari | `/training/materials` | Boʻlimlar, oʻtish, 100% ruxsat testi |
| Hisobotlar | `/reports` | Hisobotlarni shakllantirish va eksport qilish |
| HR / Xodimlar | `/hr/employees` | Shaxsiy tarkibni hisobga olish |
| Qurollar | `/weapons` | Hisob, xizmat, inventar |
| Analitika | `/analytics` | Grafiklar, trendlar, bashoratlar |
| Administratsiya | `/admin` | Foydalanuvchilar, spravochniklar, audit (SUPER_ADMIN) |

---

## 5. TEXNIK STACK

- **Frontend:** Vue 3 + TypeScript + Vite
- **State management:** Pinia
- **Routing:** Vue Router 4
- **UI:** TailwindCSS
- **i18n:** Vue I18n (RU / UZ)
- **PDF generatsiya:** jsPDF + html2canvas (lazy-loaded — kechiktirilgan yuklash)
- **Deploy:** GitHub Pages (main → gh-pages — avtomatik deploy)
- **Koʻzgu:** Netlify

---

## 6. OPTIMIZATSIYA

| Koʻrsatkich | Oldin | Keyin |
|-------------|-------|-------|
| ProtocolCreatePage bundle | 611 KB | 19 KB |
| Ogʻir kutubxonalar (jsPDF, html2canvas) | Asosiy bundlda | Lazy-loaded |
| Lokalizatsiya | Qisman | 100% RU/UZ |
| Tashqi markalar | Mavjud edi | Olib tashlangan |

---

## 7. LOYIHA TUZILISHI

```
ShaffofTIR/
├── src/
│   ├── pages/          # 72 sahifa
│   ├── components/     # Qayta foydalaniladigan komponentlar
│   ├── stores/         # Pinia stores (auth, sessions, va h.k.)
│   ├── router/         # Marshrutlash
│   ├── api/            # API-mijozlar
│   ├── data/           # Demo-maʼlumotlar (republicData, unitData, employeeData)
│   ├── i18n/           # Lokalizatsiya RU/UZ
│   ├── types/          # TypeScript turlari
│   └── utils/          # Yordamchi funksiyalar
├── backend/           # Backend API (ixtiyoriy)
├── docs/              # Hujjatlar
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── DEPLOYMENT.md
│   ├── VIDEO_SCRIPT.md
│   └── PROJECT_HANDOVER.md
├── dist/              # Production-sborка
├── vite.config.ts
├── package.json
└── tailwind.config.js
```

---

## 8. DEPLOY

```bash
# Bogʻliqliklarni oʻrnatish
npm install

# Sborка
npm run build

# GitHub Pages-ga deploy
npm run deploy
# (yoki: npx gh-pages -d dist)

# Lokal dev-server
npm run dev
```

Base URL — `vite.config.ts` faylida: `/ShaffofTIR/`

---

## 9. MAʼLUM OCHIQLAR

1. **Demo-rejim:** maʼlumotlar localStorage-da saqlanadi, backend ulanmagan
2. **Kameralar va nishonlar** Vaziyat markazida — simulyatsiya (animatsion demo-maʼlumotlar)
3. **PDF-generatsiya** brauzerning canvas qoʻllab-quvvatlashini talab qiladi
4. **Real kamera integratsiyasi** backend API-ni talab qiladi (`/docs/API_REFERENCE.md` da tasvirlangan)

---

**Loyiha topshirildi:** 2026-yil 10-avgust
**Buyurtmachi:** Firdavs Muxtorov
