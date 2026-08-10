# Oʻzgarishlar jurnali

ShaffofTIR loyihasidagi barcha muhim oʻzgarishlar ushbu faylda hujjatlangan.
Format [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ga asoslangan.

---

## [1.0.0] — 2026-08-10

### Qoʻshilgan
- Komanda markazi — 3 bosqichli drill-down (Respublika → Viloyat → Tuman)
- Vaziyat markazi — LIVE kameralar, nishonlar, voqealar jurnali, 7 poligon
- Instruktur plansheti — Face ID identifikatsiya, kamera, QR-skaner
- Oʻquv moduli — TБ boʻlimlari, oʻtish, 100% ruxsat testi
- Protokollar — yaratishdan arxivlashgacha toʻliq hayotiy sikl
- KPI katalogi — 8 koʻrsatkich, progress-bar bilan
- Kelishuvlar — 14 hujjat tasdiqlash vazifalari
- Eʼtirozlar — koʻrib chiqishni boshqarish
- Ikki tilli lokalizatsiya (Oʻzbek / Rus)
- Mobil moslashuv (telefon va planshet)
- 5 darajali rolli boshqaruv (RBAC)
- Tazyiq (svetofor) indikatsiya tizimi: yashil (≥70), sariq (≥60), qizil (<60)

### Oʻzgartirilgan
- ProtocolCreatePage bundle hajmi 611 KB → 19 KB (lazy-loaded kutubxonalar)
- Barcha sahifalar toʻliq lokalizatsiya qilingan
- Oʻzbek matnlarida toʻgʻri ʻokina (U+02BB) ishlatilgan

### Olib tashlangan
- Tashqi generator markalari (kod va interfeysdan)
- Ortiqcha tab-lar va eskigan UI elementlari

---

## [0.9.0] — 2026-08-09

### Qoʻshilgan
- Qurol boshqaruvi va xizmat hisobi
- Oʻquv materiallari moduli (4 boʻlim)
- TailwindCSS konfiguratsiyasi
- Pinia store-lari (auth, sessions, ui, notifications)

### Oʻzgartirilgan
- Marshrutlash tizimi rolli himoya bilan
- Demo-maʼlumotlar yangilangan

---

## [0.5.0] — 2026-08-08

### Qoʻshilgan
- Asosiy sahifa strukturası (dashboard, sessiyalar, natijalar)
- Vue Router konfiguratsiyasi
- Avtorizatsiya sahifasi (5 rol uchun)
- Demo-maʼlumotlar (republicData, unitData, employeeData)

---

## [0.1.0] — 2026-08-07

### Qoʻshilgan
- Loyiha ishga tushirilgan
- Vue 3 + TypeScript + Vite + TailwindCSS stack tanlangan
- Asosiy dizayn tizimi yaratilgan
