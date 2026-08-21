# 🏫 Website SMP Darul Ulum Surabaya

Portal resmi SMP Darul Ulum Surabaya — company profile, PPDB online, sistem akademik lengkap.

---

## 🚀 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Auth** | **NextAuth.js v5** (credentials provider) |
| **Backend** | Express.js, TypeScript, Prisma ORM |
| **Database** | PostgreSQL via **Neon** (gratis) |
| **Upload File** | **UploadThing** (gratis, tanpa konfigurasi server) |
| **Email** | **Nodemailer + Gmail** (App Password) |
| **State** | TanStack Query + React Hook Form |
| **Deploy FE** | Vercel (gratis) |
| **Deploy BE** | Railway / Render (gratis) |

---

## 📁 Struktur Proyek

```
smp-darul-ulum/
├── frontend/                   # Next.js 14
│   ├── app/
│   │   ├── (public)/          # Halaman publik
│   │   ├── (dashboard)/       # Portal admin/guru/siswa/ortu
│   │   ├── auth/              # Login
│   │   └── api/               # Route handlers
│   │       ├── auth/          # NextAuth handler
│   │       ├── uploadthing/   # UploadThing handler
│   │       ├── contact/       # Form kontak → Gmail
│   │       └── send-email/    # Notifikasi internal
│   ├── auth.ts                # Konfigurasi NextAuth
│   ├── middleware.ts          # Route protection (NextAuth)
│   ├── hooks/useAuth.ts       # Hook auth (wrap useSession)
│   └── lib/uploadthing.ts     # UploadThing helpers
│
├── backend/                   # Express.js REST API
│   ├── src/
│   │   ├── controllers/       # 9 controllers
│   │   ├── routes/            # Semua endpoint
│   │   ├── middleware/        # JWT auth, error handler
│   │   └── utils/             # prisma, jwt, email, qrcode
│   └── prisma/
│       ├── schema.prisma      # 28 tabel
│       └── seed.ts            # Data awal
│
└── .github/workflows/         # CI/CD + auto backup
```

---

## ⚡ Cara Menjalankan (Tanpa Docker)

### Prasyarat
- Node.js ≥ 20
- Akun [Neon](https://neon.tech) (database gratis)
- Akun [UploadThing](https://uploadthing.com) (upload gratis)
- Gmail dengan App Password aktif

---

### 1. Clone & Setup

```bash
git clone https://github.com/your-repo/smp-darul-ulum.git
cd smp-darul-ulum
```

---

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/smp_darul_ulum?sslmode=require"
JWT_SECRET=isi-random-string-panjang
JWT_REFRESH_SECRET=isi-random-string-panjang-lain
EMAIL_USER="emailkamu@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"   # Gmail App Password
EMAIL_PENERIMA="admin@sekolah.sch.id"
CLIENT_URL=http://localhost:3000
```

```bash
npm install
npm run db:generate   # generate Prisma client
npm run db:push       # push schema ke Neon
npm run db:seed       # isi data awal
npm run dev           # jalankan di port 5000
```

---

### 3. Setup Frontend

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_SECRET=isi-random-string-panjang   # openssl rand -base64 32
AUTH_URL=http://localhost:3000
EMAIL_USER="emailkamu@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"
EMAIL_PENERIMA="admin@sekolah.sch.id"
UPLOADTHING_SECRET=sk_live_xxx              # dari dashboard uploadthing.com
UPLOADTHING_APP_ID=xxxxx
NEXT_PUBLIC_UPLOADTHING_APP_ID=xxxxx
```

```bash
npm install
npm run dev           # jalankan di port 3000
```

---

### 4. Buka Browser

- **Website publik:** http://localhost:3000
- **Login portal:** http://localhost:3000/auth/login
- **API:** http://localhost:5000/api/v1
- **API health:** http://localhost:5000/health

---

## 🔑 Akun Default (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@smpdarul ulum.sch.id` | `Admin@123456!` |
| Admin | `admin@smpdarul ulum.sch.id` | `Admin@123456!` |
| Guru | `siti.rahayu@smpdarul ulum.sch.id` | `Guru@123456!` |
| Siswa | `ahmad.rizki@siswa.smpdarul ulum.sch.id` | `Siswa@2024001` |

---

## 📧 Setup Gmail App Password

1. Buka [myaccount.google.com](https://myaccount.google.com)
2. **Security → 2-Step Verification** (aktifkan dulu)
3. **Security → App passwords**
4. Pilih **Mail** → **Other** → nama "SMP Darul Ulum"
5. Copy 16-digit password → isi di `EMAIL_PASS`

Format di `.env`: `EMAIL_PASS="xxxx xxxx xxxx xxxx"` (dengan spasi)

---

## 📤 Setup UploadThing

1. Daftar di [uploadthing.com](https://uploadthing.com)
2. Buat app baru
3. Copy **Secret Key** dan **App ID** ke `.env.local`
4. Upload langsung dari browser — tidak perlu server upload

---

## 🗄️ Setup Database (Neon)

1. Daftar di [neon.tech](https://neon.tech) (gratis)
2. Buat project baru → copy **Connection String**
3. Paste ke `DATABASE_URL` di `.env`
4. Jalankan: `npm run db:push && npm run db:seed`

---

## 🚀 Deploy ke Production

### Frontend → Vercel (gratis)
```bash
cd frontend
npx vercel
# set env vars di Vercel Dashboard
```

### Backend → Railway (gratis)
```bash
# install railway CLI
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
# set env vars di Railway Dashboard
```

---

## 📋 API Endpoints Utama

```
# Auth
POST   /api/v1/auth/login
POST   /api/v1/auth/register  
GET    /api/v1/auth/profile

# Publik
GET    /api/v1/news
GET    /api/v1/news/:slug
GET    /api/v1/announcements
GET    /api/v1/events
GET    /api/v1/gallery

# PPDB
POST   /api/v1/admissions/submit
GET    /api/v1/admissions/status/:regNumber
GET    /api/v1/admissions              [admin]
PATCH  /api/v1/admissions/:id/status   [admin]

# Akademik
GET    /api/v1/grades/student/:id      [auth]
POST   /api/v1/grades                  [guru]
POST   /api/v1/grades/batch            [guru]
GET    /api/v1/attendance/student/:id  [auth]
POST   /api/v1/attendance              [guru]

# Tugas & Materi (URL dari UploadThing)
GET    /api/v1/assignments             [auth]
POST   /api/v1/assignments             [guru]
POST   /api/v1/assignments/:id/submit  [siswa]

# Keuangan
GET    /api/v1/payments/student/:id    [auth]
POST   /api/v1/payments/bulk-spp       [admin]

# Perpustakaan
GET    /api/v1/books
POST   /api/v1/borrowings              [admin]

# Admin
GET    /api/v1/dashboard/stats         [admin]
GET    /api/v1/students                [admin]
GET    /api/v1/teachers                [admin]
```

---

## 🔧 Scripts

```bash
# Backend
npm run dev          # development server
npm run build        # compile TypeScript
npm run start        # production server
npm run db:generate  # generate Prisma client
npm run db:push      # push schema ke database
npm run db:seed      # seed data awal
npm run db:studio    # Prisma Studio (GUI database)
npm run typecheck    # cek TypeScript

# Frontend
npm run dev          # development server
npm run build        # build production
npm run start        # production server
```

---

## 📄 Lisensi

MIT — SMP Darul Ulum Surabaya © 2025
