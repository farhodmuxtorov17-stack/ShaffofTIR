# Arxitektura

## Tizim umumiy koʻrinishi

ShaffofTIR **modulli monolit** arxitektura namunasida qurilgan — SPA frontend va ikki mustaqil backend xizmati.

```
┌──────────────────────────────────────────────────────────────┐
│                      Frontend (Vue 3 SPA)                      │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐ │
│  │   Pinia       │  │  Vue Router   │  │    Vue I18n        │ │
│  │   Stores      │  │  (72 sahifa)  │  │   (RU / UZ)        │ │
│  └──────────────┘  └───────────────┘  └────────────────────┘ │
│         │                  │                  │              │
│  ┌──────┴─────────────────┴──────────────────┴──────────────┐ │
│  │           TailwindCSS · Komponentlar (UI)                │ │
│  └──────────────────────────────────────────────────────────┘ │
│         │                                                      │
│  ┌──────┴───────────────────────────────────────────────────┐ │
│  │  localStorage (demo-rejim) / REST API (production)        │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Katalog tuzilishi

```
src/
├── pages/              # 72 sahifa — har biri route ga bogʻlangan
├── components/
│   ├── camera/         # LiveCameraMini, LiveTargetMini
│   ├── layout/         # MobileAppShell, Sidebar, TopBar
│   └── ui/             # Button, Modal, Toast, ProgressBar
├── stores/             # Pinia: auth, sessions, ui, notifications
├── router/             # Vue Router — rolli himoya (beforeEach)
├── api/                # API-mijozlar (entities, fetch wrapper)
├── data/               # Demo-maʼlumotlar (republicData, unitData, employeeData)
├── i18n/               # Lokalizatsiya (uz.json, ru.json)
├── types/              # TypeScript turlari
└── utils/              # Yordamchi funksiyalar
```

## Rolli boshqaruv (RBAC)

Marshrut darajasidagi himoya `router/index.ts` da amalga oshirilgan:

```typescript
const routeRoles: Record<string, string[]> = {
  '/admin':       ['SUPER_ADMIN'],
  '/settings':    ['SUPER_ADMIN', 'TECHSPEC'],
  '/command-center': ['SUPER_ADMIN', 'MANAGER'],
  '/live-range':  ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR'],
  '/sessions':    ['SUPER_ADMIN', 'MANAGER', 'INSTRUCTOR', 'EMPLOYEE'],
  // ... 72 sahifa uchun toʻliq roʻyxat
}
```

`router.beforeEach` — foydalanuvchi rolini tekshiradi va ruxsat etilmagan sahifaga oʻtishni bloklaydi.

## Holat boshqaruvi (State)

Pinia store-lari orqali markazlashgan holat boshqaruvi:

| Store | Fayl | Vazifa |
|-------|------|--------|
| `useAuthStore` | `stores/auth.ts` | Avtorizatsiya, rol, foydalanuvchi |
| `useSessionsStore` | `stores/sessions.ts` | Otishma sessiyalari |
| `useUiStore` | `stores/ui.ts` | Sidebar, toast, moda holat |
| `useNotificationsStore` | `stores/notifications.ts` | Bildirishnomalar |

## Lokalizatsiya

Vue I18n orqali ikki tilli qoʻllab-quvvatlash:

- `i18n/uz.json` — oʻzbekcha matnlar
- `i18n/ru.json` — ruscha matnlar
- Komponentlarda: `isUz` computed orqali shartli matn: `{{ isUz ? 'Matn UZ' : 'Текст RU' }}`

## Optimizatsiya strategiyasi

- **Lazy-loaded marshrutlar** — har bir sahifa alohida chunk sifatida yuklanadi
- **Lazy-loaded kutubxonalar** — jsPDF va html2canvas faqat protokol sahifasida yuklanadi
- **Bundle hajmi:** ProtocolCreatePage 611 KB → 19 KB
