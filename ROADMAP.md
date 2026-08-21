# 🗺️ ROADMAP — Website SMP Darul Ulum Surabaya

## ✅ Phase 1 — Foundation (SELESAI)
- [x] Setup Next.js 14 + TypeScript + Tailwind CSS + NextAuth.js v5
- [x] Setup Express.js + TypeScript + Prisma ORM + PostgreSQL (Neon)
- [x] Setup Gmail Nodemailer (App Password)
- [x] Setup UploadThing (menggantikan Cloudinary)
- [x] Auth: NextAuth credentials provider → backend JWT
- [x] Middleware route protection (per role)
- [x] Prisma schema (28 tabel) + seed data
- [x] robots.txt + next-sitemap
- [x] 404 / 500 error pages
- [x] .env.example lengkap
- [x] GitHub Actions CI/CD + auto backup harian
- [x] start.sh quick start script
- [x] Hapus: Docker, Redis, Midtrans, Fonnte, Cloudinary, Multer

## ✅ Phase 2 — Public Pages + Admin CMS (SELESAI)
- [x] Halaman publik: Beranda, Profil, Berita, PPDB, Kontak, Pengumuman, Agenda, Prestasi, Galeri, Download
- [x] **Public pages connect ke real backend API** (server components)
- [x] Admin Berita — CRUD + **TipTap rich text editor** + UploadThing thumbnail
- [x] Admin Pengumuman — CRUD + pin + target role + expiry
- [x] Admin Galeri — Album CRUD + **UploadDropzone** multi-upload foto
- [x] Admin Agenda — CRUD + filter per bulan
- [x] Admin Prestasi — CRUD + filter level
- [x] Admin Download — CRUD + UploadThing file
- [x] Admin Perpustakaan — CRUD buku + sistem peminjaman/pengembalian
- [x] Admin PPDB — list pendaftar + update status + kirim email konfirmasi
- [x] Admin Siswa — CRUD + filter kelas
- [x] Admin Keuangan — SPP billing + konfirmasi pembayaran
- [x] Admin Laporan — statistik kehadiran, nilai, SPP
- [x] Admin Pengaturan — profil sekolah, PPDB config, notifikasi, keamanan
- [x] Forgot password + Reset password via email (Gmail)
- [x] Berita detail page dengan OpenGraph meta + artikel terkait

## ✅ Phase 3 — Dashboard Akademik (SELESAI)
- [x] Guru: Jadwal mengajar
- [x] Guru: **Input nilai batch** → real API `/grades/batch`
- [x] Guru: **Input absensi** → real API `/attendance`
- [x] Guru: Manajemen tugas (CRUD + UploadThing)
- [x] Guru: Upload materi (dokumen/video/link)
- [x] Siswa: Dashboard, Nilai, Jadwal, Absensi, Tugas, Materi, Kartu QR
- [x] Orang tua: Dashboard, Nilai anak, Absensi anak, Pembayaran QRIS
- [x] Auth: useAuth hook (NextAuth-based, menggantikan Zustand)

## ✅ Phase 4 — Email Notifikasi Otomatis (SELESAI)
- [x] Template email HTML (PPDB konfirmasi, nilai, SPP reminder, pengumuman)
- [x] Form kontak → Gmail (langsung, tanpa queue)
- [x] Forgot/reset password via Gmail
- [x] Notifikasi nilai → trigger otomatis saat guru input nilai
- [x] Notifikasi SPP → cron job harian (jatuh tempo) — node-cron
- [x] Notifikasi pengumuman → broadcast email saat publish

## ✅ Phase 5 — Fitur Lanjutan (SELESAI)
- [x] Rapor PDF generation (jsPDF + autotable) — client-side
- [x] Export Excel: nilai, absensi, SPP (SheetJS)
- [x] Kalender agenda interaktif (admin CRUD)
- [x] Floating WhatsApp button
- [x] Open Graph + JSON-LD structured data

## ✅ Phase 6 — Optimasi & Polish (SELESAI)
- [x] Dark mode toggle persisten (next-themes)
- [x] PWA manifest + service worker (next-pwa)
- [x] Image optimization (Next.js Image + lazy load)
- [x] SEO: OpenGraph, JSON-LD, robots.txt, sitemap.xml
- [x] Loading skeleton components (Skeleton, CardSkeleton, dll)
- [x] Berita: featured + grid, galeri: album grid

---

## Stack Final

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth.js v5 (credentials) |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL via Neon |
| Upload | UploadThing |
| Email | Nodemailer + Gmail App Password |
| Editor | TipTap Rich Text Editor |
| State | TanStack Query + React Hook Form |

## Yang Dihapus
- ❌ Docker (dev langsung `npm run dev`)
- ❌ Redis / BullMQ (no queue)
- ❌ Midtrans (pembayaran manual)
- ❌ Fonnte WhatsApp API
- ❌ Cloudinary (ganti UploadThing)
- ❌ Multer (upload handle di frontend)
- ❌ Zustand auth store (ganti NextAuth useSession)
- ❌ express-rate-limit
