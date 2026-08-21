import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, GraduationCap } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';

export const metadata: Metadata = {
  title: 'Profil Sekolah | SMP Darul Ulum Surabaya',
  description: 'Profil lengkap SMP Darul Ulum Surabaya. NPSN 20532649, Akreditasi A, LP Ma\'arif NU.',
};

const schoolData = [
  { label: 'Nama Sekolah', value: 'SMP DARUL ULUM SURABAYA' },
  { label: 'NPSN', value: '20532649' },
  { label: 'Status Sekolah', value: 'Swasta (Islam NU)' },
  { label: 'Akreditasi', value: 'A (Sangat Baik)' },
  { label: 'Kepala Sekolah', value: 'Khusnul Khotimah' },
  { label: 'Tanggal Pendirian', value: '29 Mei 1991' },
  { label: 'Yayasan / Naungan', value: 'LP Ma\'arif NU' },
  { label: 'Alamat Yayasan', value: 'Jl. Makam Peneleh 70-76, Surabaya' },
  { label: 'Alamat Sekolah', value: 'Jl. Raya Manukan Kulon No. 98-100, Tandes, Surabaya 60185' },
  { label: 'Telepon', value: '(031) 7417749' },
];

const rekapData = [
  { label: 'Guru & Tenaga Pendidik', value: '22 Orang' },
  { label: 'Tenaga Kependidikan (Tendik)', value: '6 Orang' },
  { label: 'Peserta Didik (Siswa)', value: '226 Siswa' },
  { label: 'Rombongan Belajar', value: '8 Rombel' },
];

const staffShowcase = [
  { name: 'Khusnul Khotimah, S.Pd.', role: 'Kepala Sekolah', category: 'Guru', subject: 'Manajemen Sekolah', photo: '' },
  { name: 'Siti Rahayu, S.Pd.', role: 'Waka Akademik', category: 'Guru', subject: 'Matematika', photo: '' },
  { name: 'Ahmad Fauzi, M.Pd.', role: 'Guru Pengajar', category: 'Guru', subject: 'IPA (Fisika & Biologi)', photo: '' },
  { name: 'Nur Hidayah, S.Ag.', role: 'Guru Pengajar', category: 'Guru', subject: 'PAI & Ke-NU-an', photo: '' },
  { name: 'Muhammad Ridwan, S.Kom.', role: 'Kepala Tata Usaha', category: 'Tendik', subject: 'Administrasi & IT', photo: '' },
  { name: 'Siti Maryam, A.Md.', role: 'Pustakawan Sekolah', category: 'Tendik', subject: 'Perpustakaan Digital', photo: '' },
  { name: 'Bambang Kurniawan, S.Pd.', role: 'Guru Pengajar', category: 'Guru', subject: 'Bahasa Indonesia', photo: '' },
  { name: 'Agus Setiawan', role: 'Staf Keamanan', category: 'Tendik', subject: 'Ketertiban & Keamanan', photo: '' },
];

const facilities = [
  '6 Ruang Kelas / Teori',
  '1 Laboratorium IPA',
  '1 Lab Komputer & Multimedia',
  '1 Ruang Perpustakaan',
  '1 Ruang Ibadah / Musala',
  'Ruang Guru & Ruang Kepala Sekolah',
  'Ruang Tata Usaha (TU) & Ruang BP/BK',
  'Ruang OSIS & Ruang UKS',
  'Fasilitas Sanitasi Siswa (Kamar Mandi Laki-laki & Perempuan)',
];

const activities = [
  'Pramuka',
  'Pencak Silat Pagar Nusa',
  'Tim Futsal',
  'LDKS & Outbound',
  'Pelatihan Komputer & IT',
  'Study Wisata & Budaya',
  'Apel Pagi (06.30 WIB Senin–Jumat)',
  'Peringatan Hari Besar Islam (PHBI) & Qurban',
];

export default function ProfilPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      {/* Header Hero */}
      <PageHero
        title="Profil SMP Darul Ulum Surabaya"
        subtitle="Informasi kelembagaan, visi misi, dewan guru &amp; tendik, statistik rekapitulasi, serta sarana dan prasarana sekolah."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Profil Sekolah' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* ── SEJARAH & KETERANGAN ────────────────────────────────────── */}
        <section id="sejarah" className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs scroll-mt-24">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Sejarah Singkat &amp; Pengelolaan
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                SMP Darul Ulum Surabaya berdiri sejak tanggal 29 Mei 1991 di Kecamatan Tandes, Surabaya. Sekolah ini beroperasi di bawah naungan LP Ma&apos;arif NU dan menyelenggarakan pendidikan jenjang SMP yang terakreditasi A oleh BAN-S/M.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Dalam proses pembelajaran, SMP Darul Ulum Surabaya mengintegrasikan kurikulum nasional dengan pendidikan akhlak dan pembiasaan ibadah rutin untuk membentuk peserta didik yang unggul secara akademik dan berkarakter Islami.
              </p>
            </div>

            {/* Statistik Rekap */}
            <div className="lg:col-span-5 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6">
              <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider mb-4 border-b border-emerald-200 pb-2">
                Rekap Data Sekolah
              </h3>
              <div className="space-y-3">
                {rekapData.map((item) => (
                  <div key={item.label} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="font-extrabold text-emerald-950">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DEWAN GURU & TENAGA KEPENDIDIKAN (TENDIK) ───────────────── */}
        <section id="guru" className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Dewan Guru &amp; Tenaga Kependidikan (Tendik)</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Tenaga pendidik dan staf administrasi profesional SMP Darul Ulum Surabaya</p>
            </div>
            <Link href="/admin/pengguna/guru" className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl hover:bg-emerald-100 transition-colors w-fit">
              Kelola Data Guru &amp; Tendik
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {staffShowcase.map((t) => (
              <div key={t.name} className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-5 text-center flex flex-col items-center hover:border-emerald-300 hover:shadow-xs transition-all">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-emerald-200 shadow-2xs mb-3.5 flex items-center justify-center">
                  {t.photo ? (
                    <Image src={t.photo} alt={t.name} fill className="object-cover" />
                  ) : (
                    <GraduationCap className="w-9 h-9 text-emerald-600" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${t.category === 'Guru' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {t.category}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-600 bg-white border border-emerald-100 px-2 py-0.5 rounded-md">
                    {t.role}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs leading-snug mb-1">{t.name}</h3>
                <p className="text-[11px] text-slate-500 font-semibold">{t.subject}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── DATA RESMI KELEMBAGAAN & KURIKULUM ──────────────────────── */}
        <section id="kurikulum" className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs scroll-mt-24">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 border-b border-emerald-100 pb-3">
            Data Kelembagaan &amp; Kurikulum
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {schoolData.map((item) => (
              <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-100 gap-1">
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span className="font-extrabold text-slate-900 sm:text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── VISI & MISI ────────────────────────────────────────────── */}
        <section id="visi-misi" className="grid md:grid-cols-2 gap-8 scroll-mt-24">
          <div className="bg-emerald-50/90 border border-emerald-200 text-slate-900 rounded-3xl p-8 shadow-xs">
            <h3 className="text-xl font-extrabold mb-3 text-emerald-950">Visi Sekolah</h3>
            <blockquote className="text-base leading-relaxed text-slate-800 font-medium italic border-l-3 border-emerald-600 pl-4 py-1">
              &ldquo;Menjadi lembaga pendidikan menengah pertama berbasis Islam yang membentuk peserta didik berakhlakul karimah, berilmu, bertakwa, dan berdaya saing.&rdquo;
            </blockquote>
          </div>

          <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Misi Sekolah</h3>
            <ul className="space-y-3.5 text-sm text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Menyelenggarakan pembelajaran terpadu antara kurikulum nasional dan nilai keislaman.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Membiasakan karakter kedisiplinan melalui apel pagi rutin jam 06.30 WIB dan ibadah berjamaah.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Mengembangkan potensi kecerdasan sains, teknologi, dan minat bakat ekstrakurikuler siswa.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── FASILITAS & EKSTRAKURIKULER ────────────────────────────── */}
        <section id="fasilitas" className="grid md:grid-cols-2 gap-8 scroll-mt-24">
          <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Sarana &amp; Prasarana</h3>
            <ul className="space-y-3 text-sm text-slate-700 font-medium">
              {facilities.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs">
            <h3 className="text-xl font-extrabold text-slate-900 mb-4">Kegiatan &amp; Ekstrakurikuler</h3>
            <ul className="space-y-3 text-sm text-slate-700 font-medium">
              {activities.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
