import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database SMP Darul Ulum...\n');

  // ── USERS & ROLES ────────────────────────────────────────────────────────
  const hash = (p: string) => bcrypt.hash(p, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@smpdarul ulum.sch.id' },
    update: {},
    create: {
      email: 'superadmin@smpdarul ulum.sch.id',
      password: await hash('Admin@123456!'),
      role: Role.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smpdarul ulum.sch.id' },
    update: {},
    create: {
      email: 'admin@smpdarul ulum.sch.id',
      password: await hash('Admin@123456!'),
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('✅ Super Admin & Admin dibuat');

  // ── TEACHERS ────────────────────────────────────────────────────────────
  const teacherData = [
    { email: 'ahmad.fauzi@smpdarul ulum.sch.id', fullName: 'Drs. H. Ahmad Fauzi, M.Pd.', nip: '196501012000031001', subject: 'Kepala Sekolah', gender: Gender.LAKI_LAKI },
    { email: 'siti.rahayu@smpdarul ulum.sch.id', fullName: 'Siti Rahayu, S.Pd.', nip: '198003152005012001', subject: 'Matematika', gender: Gender.PEREMPUAN },
    { email: 'budi.santoso@smpdarul ulum.sch.id', fullName: 'Budi Santoso, S.Pd.', nip: '197507202003011002', subject: 'IPA', gender: Gender.LAKI_LAKI },
    { email: 'rina.wati@smpdarul ulum.sch.id', fullName: 'Rina Widyawati, S.Pd.', nip: '198812102010012003', subject: 'Bahasa Indonesia', gender: Gender.PEREMPUAN },
    { email: 'hendra.purnomo@smpdarul ulum.sch.id', fullName: 'Hendra Purnomo, S.Pd.', nip: '199001052015031001', subject: 'Bahasa Inggris', gender: Gender.LAKI_LAKI },
  ];

  for (const t of teacherData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        password: await hash('Guru@123456!'),
        role: Role.GURU,
        isActive: true,
        isEmailVerified: true,
      },
    });
    await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fullName: t.fullName, nip: t.nip, subject: t.subject, gender: t.gender },
    });
  }
  console.log('✅ 5 Guru dibuat');

  // ── CLASSES ─────────────────────────────────────────────────────────────
  const classData = [
    { name: '7A', grade: 7 }, { name: '7B', grade: 7 }, { name: '7C', grade: 7 },
    { name: '8A', grade: 8 }, { name: '8B', grade: 8 }, { name: '8C', grade: 8 },
    { name: '9A', grade: 9 }, { name: '9B', grade: 9 }, { name: '9C', grade: 9 },
  ];

  const classes: Record<string, string> = {};
  for (const c of classData) {
    const cls = await prisma.class.upsert({
      where: { id: `cls-${c.name.toLowerCase()}` },
      update: {},
      create: { id: `cls-${c.name.toLowerCase()}`, name: c.name, grade: c.grade, academicYear: '2024/2025' },
    });
    classes[c.name] = cls.id;
  }
  console.log('✅ 9 Kelas dibuat');

  // ── SUBJECTS ────────────────────────────────────────────────────────────
  const subjects = [
    { code: 'MTK', name: 'Matematika', creditHours: 4 },
    { code: 'BIN', name: 'Bahasa Indonesia', creditHours: 4 },
    { code: 'BING', name: 'Bahasa Inggris', creditHours: 4 },
    { code: 'IPA', name: 'Ilmu Pengetahuan Alam', creditHours: 4 },
    { code: 'IPS', name: 'Ilmu Pengetahuan Sosial', creditHours: 3 },
    { code: 'PKN', name: 'Pendidikan Kewarganegaraan', creditHours: 2 },
    { code: 'PAI', name: 'Pendidikan Agama Islam', creditHours: 3 },
    { code: 'PJOK', name: 'Pendidikan Jasmani', creditHours: 2 },
    { code: 'SBD', name: 'Seni Budaya & Prakarya', creditHours: 2 },
    { code: 'TIK', name: 'Teknologi Informasi', creditHours: 2 },
    { code: 'ARB', name: 'Bahasa Arab', creditHours: 2 },
    { code: 'THF', name: 'Tahfidz Al-Quran', creditHours: 2 },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }
  console.log('✅ 12 Mata Pelajaran dibuat');

  // ── STUDENTS SAMPLE ──────────────────────────────────────────────────────
  const studentSamples = [
    { email: 'ahmad.rizki@siswa.smpdarul ulum.sch.id', fullName: 'Ahmad Rizki Pratama', nis: '2024001', className: '7A' },
    { email: 'siti.nurhaliza@siswa.smpdarul ulum.sch.id', fullName: 'Siti Nurhaliza', nis: '2024002', className: '7A' },
    { email: 'budi.permana@siswa.smpdarul ulum.sch.id', fullName: 'Budi Permana', nis: '2024003', className: '7B' },
    { email: 'dewi.anggraini@siswa.smpdarul ulum.sch.id', fullName: 'Dewi Anggraini', nis: '2024004', className: '8A' },
    { email: 'reza.firmansyah@siswa.smpdarul ulum.sch.id', fullName: 'Reza Firmansyah', nis: '2023001', className: '9A' },
  ];

  for (const s of studentSamples) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        password: await hash(`Siswa@${s.nis}`),
        role: Role.SISWA,
        isActive: true,
        isEmailVerified: true,
      },
    });
    await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: s.fullName,
        nis: s.nis,
        gender: s.nis.endsWith('2') || s.nis.endsWith('4') ? Gender.PEREMPUAN : Gender.LAKI_LAKI,
        classId: classes[s.className],
        enrolledAt: new Date('2024-07-15'),
      },
    });
  }
  console.log('✅ 5 Siswa sample dibuat');

  // ── NEWS SAMPLE ──────────────────────────────────────────────────────────
  const newsSamples = [
    {
      title: 'Siswa SMP Darul Ulum Raih Juara 1 OSN Matematika Tingkat Provinsi Jawa Timur',
      slug: 'siswa-smp-darul-ulum-raih-juara-osn-matematika-2025',
      excerpt: 'Tiga siswa SMP Darul Ulum berhasil menorehkan prestasi membanggakan di ajang Olimpiade Sains Nasional 2025.',
      content: '<p>Selamat kepada Ahmad Rizki Pratama, siswa kelas 9A yang berhasil meraih Juara 1 Olimpiade Sains Nasional bidang Matematika tingkat Provinsi Jawa Timur tahun 2025.</p><p>Prestasi ini merupakan buah dari kerja keras siswa dan bimbingan intensif dari para guru pembimbing selama berbulan-bulan.</p>',
      category: 'Prestasi',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'PPDB Tahun Ajaran 2025/2026 Resmi Dibuka, Segera Daftar!',
      slug: 'ppdb-2025-2026-resmi-dibuka',
      excerpt: 'Penerimaan Peserta Didik Baru SMP Darul Ulum Surabaya tahun ajaran 2025/2026 telah resmi dibuka.',
      content: '<p>SMP Darul Ulum Surabaya dengan bangga mengumumkan pembukaan PPDB tahun ajaran 2025/2026. Pendaftaran dibuka mulai 1 Juni hingga 31 Juli 2025.</p><p>Tersedia kuota 300 siswa baru untuk 9 kelas (7A sampai 7I). Daftarkan putra-putri Anda sekarang!</p>',
      category: 'PPDB',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'SMP Darul Ulum Luncurkan Platform E-Learning dan Sistem Informasi Akademik Terbaru',
      slug: 'launching-elearning-dan-sia-terbaru',
      excerpt: 'Platform pembelajaran digital baru resmi diluncurkan untuk mendukung kegiatan belajar mengajar.',
      content: '<p>SMP Darul Ulum Surabaya secara resmi meluncurkan platform e-learning dan Sistem Informasi Akademik (SIA) terbaru yang dapat diakses oleh siswa, guru, dan orang tua.</p>',
      category: 'Teknologi',
      status: 'PUBLISHED' as const,
    },
  ];

  for (const n of newsSamples) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {},
      create: { ...n, publishedAt: new Date(), tags: [n.category], viewCount: Math.floor(Math.random() * 200) },
    });
  }
  console.log('✅ 3 Berita sample dibuat');

  // ── ANNOUNCEMENTS SAMPLE ──────────────────────────────────────────────────
  await prisma.announcement.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'ann-001',
        title: 'Jadwal Ujian Tengah Semester (UTS) Ganjil 2024/2025',
        content: 'UTS Ganjil akan dilaksanakan pada 14-18 Oktober 2024. Siswa diharapkan mempersiapkan diri dengan baik.',
        isPinned: true,
        targetRoles: [Role.SISWA, Role.GURU, Role.ORANG_TUA],
        publishedAt: new Date('2024-09-30'),
        expiresAt: new Date('2024-10-20'),
      },
      {
        id: 'ann-002',
        title: 'Libur Maulid Nabi Muhammad SAW 1446 H',
        content: 'Diberitahukan kepada seluruh warga sekolah bahwa sekolah akan libur dalam rangka memperingati Maulid Nabi Muhammad SAW.',
        isPinned: false,
        targetRoles: [Role.SISWA, Role.GURU, Role.ORANG_TUA],
        publishedAt: new Date('2024-09-10'),
      },
    ],
  });
  console.log('✅ 2 Pengumuman sample dibuat');

  // ── EVENTS SAMPLE ─────────────────────────────────────────────────────────
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'evt-001',
        title: 'Ujian Tengah Semester (UTS) Ganjil',
        description: 'Pelaksanaan UTS Semester Ganjil Tahun Ajaran 2024/2025',
        startDate: new Date('2024-10-14'),
        endDate: new Date('2024-10-18'),
        isAllDay: true,
        category: 'Akademik',
        isPublic: true,
      },
      {
        id: 'evt-002',
        title: 'Hari Kemerdekaan RI ke-80',
        description: 'Upacara Bendera memperingati HUT RI ke-80',
        startDate: new Date('2025-08-17'),
        isAllDay: true,
        category: 'Nasional',
        isPublic: true,
      },
      {
        id: 'evt-003',
        title: 'PPDB Gelombang 1 Open',
        description: 'Pembukaan PPDB Tahun Ajaran 2025/2026 Gelombang 1',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-07-31'),
        isAllDay: true,
        category: 'PPDB',
        isPublic: true,
      },
    ],
  });
  console.log('✅ 3 Agenda sample dibuat');

  // ── SITE SETTINGS ─────────────────────────────────────────────────────────
  const settings = [
    { key: 'school_name', value: 'SMP Darul Ulum Surabaya', group: 'general', label: 'Nama Sekolah' },
    { key: 'school_npsn', value: '20000001', group: 'general', label: 'NPSN' },
    { key: 'school_address', value: 'Jl. Raya Darul Ulum No. 1, Surabaya, Jawa Timur 60XXX', group: 'contact', label: 'Alamat' },
    { key: 'school_phone', value: '031-XXXXXXX', group: 'contact', label: 'Telepon' },
    { key: 'school_email', value: 'info@smpdarul ulum.sch.id', group: 'contact', label: 'Email' },
    { key: 'school_wa', value: '6281234567890', group: 'contact', label: 'WhatsApp' },
    { key: 'school_instagram', value: 'smpdarul ulum_sby', group: 'social', label: 'Instagram' },
    { key: 'school_facebook', value: 'smpdarul ulumsurabaya', group: 'social', label: 'Facebook' },
    { key: 'ppdb_open', value: 'true', type: 'boolean', group: 'ppdb', label: 'PPDB Dibuka' },
    { key: 'ppdb_year', value: '2025/2026', group: 'ppdb', label: 'Tahun PPDB' },
    { key: 'ppdb_quota', value: '300', group: 'ppdb', label: 'Kuota PPDB' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Site settings dibuat');

  console.log('\n🎉 Seeding selesai!\n');
  console.log('📋 Akun default:');
  console.log('   Super Admin : superadmin@smpdarul ulum.sch.id / Admin@123456!');
  console.log('   Admin       : admin@smpdarul ulum.sch.id / Admin@123456!');
  console.log('   Guru (contoh): siti.rahayu@smpdarul ulum.sch.id / Guru@123456!');
  console.log('   Siswa (contoh): ahmad.rizki@siswa.smpdarul ulum.sch.id / Siswa@2024001\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
