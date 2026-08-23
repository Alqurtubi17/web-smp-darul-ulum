'use client';

import Link from 'next/link';
import { Newspaper, Megaphone, CalendarDays, Image as ImageIcon, Trophy, Download } from 'lucide-react';


export default function AdminKontenOverviewPage() {
  const contentModules = [
    { title: 'Berita Sekolah', desc: 'Publikasikan artikel berita, liputan kegiatan, dan kabar sekolah', href: '/admin/konten/berita', icon: Newspaper, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { title: 'Pengumuman Resmi', desc: 'Buat pengumuman penting bagi siswa, guru, atau orang tua murid', href: '/admin/konten/pengumuman', icon: Megaphone, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    { title: 'Agenda Kegiatan', desc: 'Jadwalkan kegiatan akademik, ujian, dan kalender kegiatan', href: '/admin/konten/agenda', icon: CalendarDays, color: 'bg-emerald-100/60 text-emerald-900 border-emerald-300' },
    { title: 'Galeri Dokumentasi', desc: 'Kelola album foto dan video kegiatan ekstrakurikuler siswa', href: '/admin/konten/galeri', icon: ImageIcon, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { title: 'Prestasi Sekolah', desc: 'Catat raihan prestasi akademik dan non-akademik siswa & guru', href: '/admin/konten/prestasi', icon: Trophy, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { title: 'Pusat Unduhan (Download)', desc: 'Unggah berkas dokumen, formulir PPDB, dan panduan sekolah', href: '/admin/konten/download', icon: Download, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Konten Publik</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Pilih kategori modul konten yang ingin dikelola</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contentModules.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${item.color} shadow-2xs`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Buka Modul</span>
              </div>

            </Link>
          );
        })}
      </div>
    </div>
  );
}
