<p align="center">
  <img src="public/logo.svg" alt="ShaffofTIR" width="120" height="120" />
</p>

<h1 align="center">ShaffofTIR</h1>

<p align="center">
  <strong>Ochiq va shaffof otish poligoni boshqaruv tizimi</strong><br/>
  Harbiy va huquq-tartibot idoralari uchun enterprise-darajadagi otishma oʻquv platformasi
</p>

<p align="center">
  <a href="https://farhodmuxtorov17-stack.github.io/ShaffofTIR/"><img src="https://img.shields.io/badge/LIVE%20DEMO-GitHub%20Pages-181717?logo=github" alt="Live Demo" /></a>
  <a href="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/ci.yml"><img src="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/ci.yml/badge.svg" alt="CI Status" /></a>
  <a href="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/codeql.yml"><img src="https://github.com/farhodmuxtorov17-stack/ShaffofTIR/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" /></a>
  <img src="https://img.shields.io/badge/Vue-3.4-42b883?logo=vuedotjs" alt="Vue 3.4" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06b6d4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-5.3-646cff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e" alt="MIT License" />
</p>

<p align="center">
  <a href="#boshlash">Tezkor boshlash</a> ·
  <a href="#arxitektura">Arxitektura</a> ·
  <a href="#rollar-va-ruxsatlar">Rollar</a> ·
  <a href="#asosiy-imkoniyatlar">Imkoniyatlar</a> ·
  <a href="#deploy">Deploy</a> ·
  <a href="CONTRIBUTING.md">Hissa qoʻshish</a> ·
  <a href="docs/">Hujjatlar</a>
</p>

---

## Umumiy maʼlumot

**ShaffofTIR** — Oʻzbekiston Respublikasi harbiy boʻlinmalari va huquq-tartibot idoralari otishma oʻquv markazlari uchun moʻljallangan, ishlab chiqarishga tayyor boshqaruv platformasi.

Tizim otishma oʻquv jarayonining toʻliq hayotiy siklini qamrab oladi: xodimni poligonga jalb qilishdan boshlab, natijalarni tahlil qilish va hisobot shakllantirishgacha.

---

## Asosiy imkoniyatlar

- 📊 **Komanda markazi** — 3 bosqichli drill-down (Respublika → Viloyat → Tuman) real vaqtdagi KPI monitoringi
- 🎯 **Vaziyat markazi** — LIVE kameralar, nishonlar, voqealar jurnali, 7 poligon
- 📋 **Protokollar** — yaratishdan tortib arxivlashgacha, APPROVED/ARCHIVED holatida tahrirlash taqiqlangan
- 🎓 **Oʻquv moduli** — TБ boʻlimlari, oʻtish, 100% ruxsat testi
- 👥 **Rolli boshqaruv** — 5 darajali RBAC (SUPER_ADMIN, MANAGER, INSTRUCTOR, TECHSPEC, EMPLOYEE)
- 📱 **Mobil moslashuv** — telefon va planshet uchun toʻliq optimallashtirilgan
- 🌐 **Ikkilik lokalizatsiya** — Oʻzbek va Rus tillarida toʻliq interfeys

---

## Boshlash

```bash
# Bogʻliqliklarni oʻrnatish
npm install

# Lokal dev-server
npm run dev

# Production-sborка
npm run build

# GitHub Pages-ga deploy
npm run deploy
```

**Live-demo:** https://farhodmuxtorov17-stack.github.io/ShaffofTIR/

---

## Arxitektura

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Vue 3)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Pinia      │  │  Vue Router  │  │  Vue I18n     │ │
│  │   Stores     │  │   (72 sahifa) │  │  (RU / UZ)   │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
│         │                │                │           │
│  ┌──────┴──────────────┴────────────────┴──────────┐  │
│  │           TailwindCSS · Komponentlar             │  │
│  └──────────────────────────────────────────────────┘  │
│         │                                              │
│  ┌──────┴───────────────────────────────────────────┐ │
│  │  localStorage (demo-rejim) / REST API (backend)   │ │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Texnik stack

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Vue 3 | 3.4 | Reaktiv frontend-freymvork |
| TypeScript | 5.5 | Tip xavfsizligi |
| Vite | 5.3 | Sborка va dev-server |
| Pinia | 2.1 | Holat boshqaruvi |
| Vue Router | 4.3 | Marshrutlash |
| TailwindCSS | 3.4 | Utility-first stillash |
| jsPDF + html2canvas | — | PDF-generatsiya (lazy-loaded) |

---

## Rollar va ruxsatlar

Tizim 5 darajali rolli boshqaruv (RBAC) tizimini amalga oshiradi. Har bir rol moslashtirilgan sidebar koʻradi va marshrut darajasidagi himoyaga ega.

| Rol | Asosiy funksiyalar |
|-----|---------------------|
| **SUPER_ADMIN** | Barcha modullarga toʻliq ruxsat, foydalanuvchilar, audit, tizim sozlamalari |
| **MANAGER** | Boshqaruv paneli, Komanda markazi, KPI, kelishuvlar, hisobotlar |
| **INSTRUCTOR** | Sessiya yaratish, protokollar, kameralar, oʻquv materiallari |
| **TECHSPEC** | Texnik sahifa, kamera boshqaruvi, tizim sozlamalari |
| **EMPLOYEE** | Shaxsiy natijalar, oʻquv materiallari, sessiyalarni koʻrish |

---

## Deploy

Loyiha GitHub Pages-ga avtomatik deploy qilinadi — har bir `main` branchiga push qilishda:

```bash
npm run build
npm run deploy
```

**Netlify koʻzgusi:** https://e-shaffoftir.netlify.app

---

## Loyiha tuzilishi

```
ShaffofTIR/
├── src/
│   ├── pages/          # 72 sahifa
│   ├── components/     # Qayta foydalaniladigan komponentlar
│   ├── stores/         # Pinia stores
│   ├── router/         # Marshrutlash
│   ├── api/            # API-mijozlar
│   ├── data/           # Demo-maʼlumotlar
│   ├── i18n/           # Lokalizatsiya (RU/UZ)
│   ├── types/          # TypeScript turlari
│   └── utils/          # Yordamchi funksiyalar
├── docs/              # Hujjatlar
├── dist/              # Production-sborка
├── vite.config.ts
└── tailwind.config.js
```

---

## Hisssa qoʻshish

Loyihaga hissa qoʻshish boʻyicha qoidalar [CONTRIBUTING.md](CONTRIBUTING.md) faylida tasvirlangan.

## Litsenziya

MIT — toʻliq ochiq kod.

---

**Buyurtmachi:** Firdavs Muxtorov
**Topshirish sanasi:** 2026-yil 10-avgust
