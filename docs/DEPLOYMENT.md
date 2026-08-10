# Deploy qoʻllanmasi

## Umumiy maʼlumot

ShaffofTIR bir nechta platformalarga deploy qilinishi mumkin. Asosiy platforma — GitHub Pages, muqobil sifatida Netlify, Vercel va Docker qoʻllab-quvvatlanadi.

---

## 1. GitHub Pages (asosiy)

```bash
# Bogʻliqliklarni oʻrnatish
npm install

# Production-yigʻim
npm run build

# GitHub Pages-ga deploy
npx gh-pages -d dist
```

**Avtomatik deploy:** har bir `main` branchiga push qilishda CI/CD orqali avtomatik deploy ishga tushadi.

**Natija:** https://farhodmuxtorov17-stack.github.io/ShaffofTIR/

**Base URL:** `vite.config.ts` faylida `/ShaffofTIR/` ga sozlangan.

---

## 2. Netlify (koʻzgu)

```bash
# Build komandasi
npm run build

# Publish katalogi
dist
```

**Natija:** https://e-shaffoftir.netlify.app

---

## 3. Vercel (muqobil)

```bash
# Vercel CLI orqali
npm i -g vercel
vercel --prod
```

---

## 4. Docker (konteynerlash)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t shaffoftir .
docker run -p 8080:80 shaffoftir
```

---

## 5. Lokal ishga tushirish

```bash
# Dev-server
npm run dev

# Ishlab chiqarish-yigʻim
npm run build && npm run preview
```

---

## Atrof-muhit oʻzgaruvchilari

| Oʻzgaruvchi | Qiymat | Tavsif |
|-------------|--------|--------|
| `VITE_API_URL` | `https://api.shaffoftir.uz` | Backend API manzili |
| `VITE_DEMO_MODE` | `true` | Demo-rejim (backendsiz) |

---

## Tekshiruv roʻyxati (deploy dan oldin)

- [ ] `npm run build` muvaffaqiyatli oʻtadi
- [ ] TypeScript xatolari yoʻq (`vue-tsc --noEmit`)
- [ ] Barcha sahifalar lokalizatsiya qilingan (RU/UZ)
- [ ] Tashqi markalar mavjud emas
- [ ] `dist/` katalogida `index.html` toʻgʻri yaratilgan
