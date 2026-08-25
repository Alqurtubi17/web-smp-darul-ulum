'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap, Users, Award, BookOpen, Calendar,
  ChevronRight, ShieldCheck, Monitor, FlaskConical,

  Building2, Sparkles, HeartHandshake, Compass, Quote, ChevronLeft,
  CheckCircle2, Clock, MapPin, ChevronDown
} from 'lucide-react';

// Hero Slider Data
const heroSlides = [
  {
    image: '/images/hero-school.png',
    title: 'Membentuk Generasi Cerdas, Berakhlak & Berkarakter',
    subtitle: 'Sekolah Menengah Pertama Islam terdepan di Tandes, Surabaya. Berakreditasi A BAN-S/M di bawah naungan LP Ma\'arif NU.',
  },
  {
    image: '/images/school-activity.png',
    title: 'Integrasi Kurikulum Merdeka & Nilai Keislaman',
    subtitle: 'Pembelajaran sains, teknologi, dan akhlakul karimah serta pembiasaan ibadah rutin sejak dini.',
  },
];

// Stats Data
const stats = [
  { label: 'Siswa Aktif', value: '226+', icon: Users, sub: 'Peserta didik terdaftar' },
  { label: 'Guru & Tendik', value: '22', icon: GraduationCap, sub: 'Tenaga pendidik profesional' },
  { label: 'Rombel Kelas', value: '8', icon: BookOpen, sub: 'Rombongan belajar' },
  { label: 'Akreditasi BAN-S/M', value: 'A', icon: ShieldCheck, sub: 'Sangat Baik (NPSN 20532649)' },
];

// Pillars
const pillars = [
  {
    title: 'Integrasi Kurikulum & Keislaman',
    desc: 'Memadukan Kurikulum Merdeka Nasional dengan pembiasaan ibadah rutin, baca tulis Al-Qur\'an, dan aqidah akhlak khas LP Ma\'arif NU.',
    icon: Compass,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Pembentukan Karakter & Kedisiplinan',
    desc: 'Pembiasaan apel pagi rutin pukul 06.30 WIB, sholat berjamaah, dan kegiatan LDKS untuk membentuk siswa yang tangguh dan santun.',
    icon: HeartHandshake,
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    title: 'Fasilitas Digital & Praktikum',
    desc: 'Dilengkapi Laboratorium Komputer untuk ANBK & TI, Lab IPA modern, serta koneksi internet untuk pembelajaran berbasis teknologi.',
    icon: Monitor,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    title: 'Pengembangan Minat & Bakat',
    desc: 'Ragam kegiatan ekstrakurikuler pilihan seperti Pencak Silat Pagar Nusa, Futsal, Pramuka, dan pelatihan komputer.',
    icon: Award,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

// Facilities Data
const facilityCategories = ['Semua', 'Kelas', 'Laboratorium', 'Ibadah & Kesehatan'];
const facilitiesData = [
  { name: 'Ruang Kelas / Teori', cat: 'Kelas', detail: '6 Ruang kelas nyaman bersistem pencahayaan dan sirkulasi udara ideal', icon: Building2, img: '/images/hero-school.png' },
  { name: 'Laboratorium IPA', cat: 'Laboratorium', detail: 'Fasilitas alat peraga praktikum Fisika, Biologi, dan Kimia dasar', icon: FlaskConical, img: '/images/school-activity.png' },
  { name: 'Lab Komputer & ANBK', cat: 'Laboratorium', detail: 'Perangkat komputer terkini untuk simulasi ujian nasional & pelatihan IT', icon: Monitor, img: '/images/hero-school.png' },
  { name: 'Perpustakaan Sekolah', cat: 'Kelas', detail: 'Koleksi buku pelajaran, ensiklopedia, buku fiksi, dan ruang baca', icon: BookOpen, img: '/images/school-activity.png' },
  { name: 'Musala Sekolah', cat: 'Ibadah & Kesehatan', detail: 'Sarana ibadah sholat dhuha dan dhuhur berjamaah seluruh warga sekolah', icon: ShieldCheck, img: '/images/hero-school.png' },
  { name: 'Konseling & UKS', cat: 'Ibadah & Kesehatan', detail: 'Layanan bimbingan konseling dan pertolongan pertama kesehatan siswa', icon: HeartHandshake, img: '/images/school-activity.png' },
];

// Extracurricular Data
const ekstraCategories = ['Semua', 'Wajib', 'Olahraga', 'Seni & Keagamaan', 'TI & Sains'];
const extracurriculars = [
  { name: 'Pramuka', cat: 'Wajib', desc: 'Kedisiplinan, kepemimpinan, dan kemandirian siswa.' },
  { name: 'Pencak Silat Pagar Nusa', cat: 'Seni & Keagamaan', desc: 'Seni bela diri pencak silat khas LP Ma\'arif NU.' },
  { name: 'Tim Futsal', cat: 'Olahraga', desc: 'Latihan taktik dan pembinaan olahraga prestasi.' },
  { name: 'Pelatihan Komputer & IT', cat: 'TI & Sains', desc: 'Pemrograman dasar, desain grafis, dan perkantoran digital.' },
  { name: 'LDKS & Outbound', cat: 'Wajib', desc: 'Latihan dasar kepemimpinan siswa setiap tahun ajaran baru.' },
  { name: 'Studi Wisata & PHBI', cat: 'Seni & Keagamaan', desc: 'Peringatan hari besar Islam dan kunjungan edukatif.' },
];

// News Data
const newsCategories = ['Semua', 'Kegiatan', 'PPDB', 'Ekstrakurikuler'];
const latestNews = [
  {
    id: '1', slug: 'kegiatan-ldks-outbound-smp-darul-ulum',
    title: 'Pelaksanaan LDKS dan Outbound Siswa SMP Darul Ulum Surabaya',
    category: 'Kegiatan', date: '15 Juni 2025',
    excerpt: 'Kegiatan LDKS diselenggarakan untuk membangun kedisiplinan dan jiwa kepemimpinan peserta didik baru.',
    img: '/images/school-activity.png',
  },
  {
    id: '2', slug: 'ppdb-smp-darul-ulum-dibuka',
    title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026',
    category: 'PPDB', date: '10 Juni 2025',
    excerpt: 'Informasi pendaftaran siswa baru SMP Darul Ulum Surabaya untuk jalur reguler dan prestasi.',
    img: '/images/hero-school.png',
  },
  {
    id: '3', slug: 'ekstrakurikuler-pagar-nusa-futsal',
    title: 'Prestasi dan Latihan Rutin Ekstrakurikuler Pencak Silat Pagar Nusa',
    category: 'Ekstrakurikuler', date: '5 Juni 2025',
    excerpt: 'Pengembangan minat dan bakat siswa melalui latihan rutin ekstrakurikuler pencak silat dan futsal.',
    img: '/images/school-activity.png',
  },
];

const upcomingAgenda = [
  { date: '25 Jun', title: 'Rapat Pleno Orang Tua & Pembagian Rapor', time: '08:00 - 12:00 WIB', location: 'Aula Utama Sekolah' },
  { date: '01 Jul', title: 'Pembukaan Pendaftaran PPDB Gelombang 2', time: '08:00 - 14:00 WIB', location: 'Sekretariat PPDB' },
  { date: '15 Jul', title: 'Masa Pengenalan Lingkungan Sekolah (MPLS)', time: '06:30 - 12:00 WIB', location: 'Lapangan SMP Darul Ulum' },
];

const faqs = [
  {
    q: 'Bagaimana cara mendaftar sebagai siswa baru di SMP Darul Ulum Surabaya?',
    a: 'Pendaftaran dapat dilakukan secara online melalui menu PPDB di website ini atau datang langsung ke Sekretariat PPDB di Jl. Raya Manukan Kulon No. 98-100, Tandes, Surabaya pada jam kerja (07.30 - 13.00 WIB).'
  },
  {
    q: 'Apakah SMP Darul Ulum Surabaya terakreditasi?',
    a: 'Ya, SMP Darul Ulum Surabaya terakreditasi A (Sangat Baik) oleh BAN-S/M dengan NPSN resmi 20532649 di bawah naungan LP Ma\'arif NU.'
  },
  {
    q: 'Apa saja fasilitas unggulan yang tersedia di sekolah?',
    a: 'Fasilitas meliputi 6 ruang kelas teori yang nyaman, Laboratorium Komputer & IT untuk ANBK, Laboratorium IPA, Perpustakaan, Musala ibadah, serta fasilitas olahraga.'
  },
  {
    q: 'Jam berapa kegiatan belajar mengajar berlangsung?',
    a: 'Kegiatan diawali dengan pembiasaan Apel Pagi dan doa bersama pukul 06.30 WIB, kemudian dilanjutkan pembelajaran hingga selesai sore hari sesuai jadwal mata pelajaran.'
  }
];

export function InteractiveHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFacilityCat, setSelectedFacilityCat] = useState('Semua');
  const [activeFacility, setActiveFacility] = useState(facilitiesData[0]);
  const [selectedEkstraCat, setSelectedEkstraCat] = useState('Semua');
  const [selectedNewsCat, setSelectedNewsCat] = useState('Semua');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const filteredFacilities = facilitiesData.filter(
    (f) => selectedFacilityCat === 'Semua' || f.cat === selectedFacilityCat
  );

  const filteredEkstra = extracurriculars.filter(
    (e) => selectedEkstraCat === 'Semua' || e.cat === selectedEkstraCat
  );

  const filteredNews = latestNews.filter(
    (n) => selectedNewsCat === 'Semua' || n.category === selectedNewsCat
  );

  return (
    <div className="space-y-0">
      
      {/* ── 1. INTERACTIVE HERO SLIDER ──────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-emerald-100/60 via-emerald-50/40 to-[#fcfdfd] pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-emerald-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {heroSlides[currentSlide].title}
              </h1>

              <p className="text-slate-700 text-sm sm:text-base lg:text-lg leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                {heroSlides[currentSlide].subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/ppdb"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5"
                >
                  Pendaftaran PPDB Online
                </Link>

                <Link
                  href="/profil"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm transition-all shadow-2xs"
                >
                  Profil &amp; Fasilitas
                </Link>
              </div>

              {/* Slider Dots & Controls */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                <div className="flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all ${
                        currentSlide === idx ? 'w-8 bg-emerald-600' : 'w-2.5 bg-emerald-200 hover:bg-emerald-400'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                    className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                    className="p-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-emerald-100 aspect-4/3 group">
                <Image
                  src={heroSlides[currentSlide].image}
                  alt="SMP Darul Ulum Surabaya"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-sm font-extrabold leading-snug">
                    SMP Darul Ulum Surabaya · Tandes
                  </p>
                </div>
              </div>


            </div>

          </div>
        </div>
      </section>

      {/* ── 2. STATISTIK SEKOLAH ───────────────────────────────────────── */}
      <section className="py-10 bg-emerald-50/80 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-2xs hover:border-emerald-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-slate-700">{item.label}</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{item.value}</div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. PILAR KEUNGGULAN SEKOLAH ─────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Mengapa Memilih SMP Darul Ulum Surabaya?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
              Komitmen kami dalam menghadirkan lingkungan belajar kondusif, berlandaskan akhlakul karimah dan kompetensi akademik global.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pilar) => {
              const Icon = pilar.icon;
              return (
                <div key={pilar.title} className="p-6 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${pilar.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mb-2 leading-snug">{pilar.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{pilar.desc}</p>
                  </div>
                  <div className="pt-2">
                    <Link href="/profil" className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1 group">
                      Pelajari Selengkapnya <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 4. SAMBUTAN KEPALA SEKOLAH ──────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-emerald-100 p-8 sm:p-12 shadow-xs grid lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 relative text-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-4xl shadow-md mb-4 border-4 border-white">
                KK
              </div>
              <h3 className="font-black text-slate-900 text-lg">Khusnul Khotimah</h3>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">Kepala Sekolah SMP Darul Ulum Surabaya</p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <Quote className="w-10 h-10 text-emerald-300" />
              <blockquote className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed italic">
                &ldquo;Selamat datang di website resmi SMP Darul Ulum Surabaya. Pendidikan bukan hanya tentang mengtransfer ilmu pengetahuan, tetapi tentang bagaimana membimbing putra-putri kita menjadi pribadi yang jujur, beriman, berbudi pekerti luhur, serta siap bersaing di era digital.&rdquo;
              </blockquote>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Melalui sinergi antara guru, orang tua, dan masyarakat, SMP Darul Ulum Surabaya terus berinovasi dalam pembelajaran Kurikulum Merdeka dan pembiasaan nilai-nilai Ke-NU-an.
              </p>
              <div className="pt-2">
                <Link href="/profil#sejarah" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs">
                  Baca Profil Sekolah Lengkap
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. FASILITAS SHOWCASE ───────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sarana &amp; Fasilitas Sekolah
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Pilih kategori untuk melihat fasilitas penunjang belajar siswa
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-emerald-50 p-1.5 rounded-2xl border border-emerald-100">
              {facilityCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFacilityCat(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFacilityCat === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Highlight Card */}
            <div className="lg:col-span-5 bg-[#fcfdfd] rounded-3xl border border-emerald-100 p-6 space-y-4 shadow-2xs">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-100 aspect-16/10 shadow-xs">
                <Image
                  src={activeFacility.img}
                  alt={activeFacility.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">{activeFacility.name}</h3>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{activeFacility.detail}</p>
              </div>
              <Link href="/profil#fasilitas" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-2">
                Lihat Detail Sarana Lengkap <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Facility Grid */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              {filteredFacilities.map((item) => {
                const Icon = item.icon;
                const isSelected = activeFacility.name === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveFacility(item)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-400 shadow-2xs'
                        : 'bg-white border-emerald-100 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">{item.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. EKSTRAKURIKULER ─────────────────────────────────────────── */}
      <section className="py-16 bg-[#fcfdfd] border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Kegiatan &amp; Ekstrakurikuler
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Wadah minat, bakat, dan pembentukan potensi kepemimpinan siswa
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-emerald-100 shadow-2xs">
              {ekstraCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedEkstraCat(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedEkstraCat === cat
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {filteredEkstra.map((ekstra) => (
              <div key={ekstra.name} className="bg-white rounded-3xl border border-emerald-100 p-6 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-1">{ekstra.name}</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{ekstra.desc}</p>
                </div>
                <div className="pt-2 border-t border-emerald-50">
                  <span className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pembina Profesional
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 7. BERITA & AGENDA ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Left News */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Berita &amp; Informasi Terkini</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Kabar terbaru kegiatan sekolah dan pengumuman resmi</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1 bg-emerald-50 p-1 rounded-xl border border-emerald-100">
                    {newsCategories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedNewsCat(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          selectedNewsCat === c ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-emerald-800'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <Link href="/berita" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-0.5 ml-1">
                    Semua <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {filteredNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/berita/${news.slug}`}
                    className="bg-[#fcfdfd] rounded-2xl border border-emerald-100 p-5 hover:border-emerald-300 hover:shadow-sm transition-all block group"
                  >
                    <p className="text-[10px] font-medium text-slate-400 mb-2">{news.date}</p>
                    <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {news.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Agenda */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-700" /> Agenda Sekolah
                </h2>
                <Link href="/agenda" className="text-xs font-bold text-emerald-700 hover:underline">Semua</Link>
              </div>

              <div className="space-y-3">
                {upcomingAgenda.map((agenda, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3.5">
                    <div className="bg-emerald-600 text-white rounded-xl px-2.5 py-1.5 text-center shrink-0 shadow-2xs">
                      <span className="text-xs font-black block leading-none">{agenda.date}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-900 text-xs truncate leading-snug">{agenda.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" /> {agenda.time}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {agenda.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. FAQ ACCORDION ───────────────────────────────────────────── */}
      <section className="py-16 bg-[#fcfdfd] border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pertanyaan Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Informasi seputar pendaftaran siswa baru, fasilitas, dan kurikulum pembelajaran.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-emerald-700 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed border-t border-emerald-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 9. PPDB BANNER CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black text-emerald-950 tracking-tight">
              Bergabunglah Bersama SMP Darul Ulum Surabaya
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
              Pendaftaran siswa baru dapat dilakukan secara online melalui portal website ini atau langsung di Sekretariat PPDB Jl. Raya Manukan Kulon No. 98-100, Tandes, Surabaya.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/ppdb"
                className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xs"
              >
                Pendaftaran PPDB Online
              </Link>
              <Link
                href="/kontak"
                className="px-7 py-3.5 rounded-2xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs sm:text-sm transition-all shadow-2xs"
              >
                Hubungi Panitia Sekretariat
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
