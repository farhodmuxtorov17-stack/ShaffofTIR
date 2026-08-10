# Hissa qoʻshish boʻyicha qoʻllanma

## Boshlash

ShaffofTIR loyihasiga hissa qoʻshishga qiziqishingiz uchun rahmat!

### Talablar

- Node.js 20+
- npm yoki pnpm
- Git

### Lokal muhitni sozlash

```bash
git clone https://github.com/farhodmuxtorov17-stack/ShaffofTIR.git
cd ShaffofTIR
npm install
npm run dev
```

## Commit konventsiyasi

Biz [Conventional Commits](https://www.conventionalcommits.org/) formatidan foydalanamiz:

| Prefiks | Tavsif |
|---------|--------|
| `feat:` | Yangi imkoniyat |
| `fix:` | Xatolik tuzatish |
| `docs:` | Hujjatlar |
| `refactor:` | Refaktoring (funksional oʻzgarishsiz) |
| `chore:` | Texnik vazifalar |
| `style:` | Stillash oʻzgarishlari |
| `test:` | Testlar |

**Misol:** `feat: Komanda markaziga yangi viloyat qoʻshildi`

## Branch konventsiyasi

- `main` — production-kod
- `feature/nomi` — yangi imkoniyatlar
- `fix/nomi` — xatolik tuzatish
- `docs/nomi` — hujjatlar

## Kod standartlari

### Vue komponentlari

- `<script setup lang="ts">` dan foydalaning
- Komponent nomi PascalCase: `CommandCenterPage.vue`
- Props va emit-lar uchun TypeScript turlarini belgilang

### Stillash (TailwindCSS)

- `tailwind.config.js` dagi dizayn token-laridan foydalaning
- Custom ranglardan qoching, brand-palette dan foydalaning
- Mobil moslashuvni unutmang: `sm:`, `md:`, `lg:` breakpoint-lari

### Lokalizatsiya

- Barcha matnlar ikki tilda (UZ/RU) boʻlishi kerak
- Oʻzbek tilida toʻgʻri ʻokina (U+02BB) ishlatish shart
- Hardcoded matnlardan qoching

## Pull Request jarayoni

1. Yangi branch yarating: `git checkout -b feature/mening-imkoniyatim`
2. Oʻzgarishlarni commit qiling
3. Main branch-ga PR oching
4. PR tavsifida oʻzgarishlarni batafsil yoriting

### PR tekshiruv roʻyxati

- [ ] Kod TypeScript xatosiz compile boʻladi
- [ ] `npm run build` muvaffaqiyatli oʻtadi
- [ ] Barcha yangi matnlar lokalizatsiya qilingan (UZ/RU)
- [ ] Oʻzbek matnlarida toʻgʻri ʻokina (U+02BB) ishlatilgan
- [ ] Tashqi generator markalari mavjud emas
- [ ] Mobil koʻrinishda test qilingan
- [ ] Hech qanday `console.log` qoldirilmagan

## Loyiha tuzilishi

```
src/
├── pages/          # 72 sahifa
├── components/     # Qayta foydalaniladigan komponentlar
├── stores/         # Pinia stores
├── router/         # Marshrutlash
├── i18n/           # Lokalizatsiya
└── utils/          # Yordamchi funksiyalar
```

## Savollar va yordam

Savollaringiz boʻlsa, GitHub issue oching yoki maintainer-ga murojaat qiling.
