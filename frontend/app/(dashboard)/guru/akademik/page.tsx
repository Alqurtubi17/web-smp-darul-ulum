'use client';

import Link from 'next/link';
import { Trophy, ClipboardList, FileText, BookOpen, ArrowRight } from 'lucide-react';

export default function GuruAkademikOverviewPage() {
  const academicModules = [
    { title: 'Input Nilai Siswa', desc: 'Input nilai tugas, kuis, UTS, dan UAK siswa per rombel kelas', href: '/guru/akademik/nilai', icon: Trophy, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Presensi / Absensi', title: 'Absensi Harian Kelas', desc: 'Pencatatan daftar hadir siswa harian (Hadir, Izin, Sakit, Alpa)', href: '/guru/akademik/absensi', icon: ClipboardList, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { title: 'Tugas & Penugasan', desc: 'Pemberian tugas online siswa lengkap dengan batas waktu pengerjaan', href: '/guru/akademik/tugas', icon: FileText, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { title: 'Materi Pelajaran', desc: 'Unggah modul ajar, dokumen materi PDF, dan referensi bacaan siswa', href: '/guru/akademik/materi', icon: BookOpen, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Akademik Guru</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Pilih modul pengelolaan kegiatan belajar mengajar</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {academicModules.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${item.color} shadow-2xs`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1.5 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 border-t border-emerald-50 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Buka Modul</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
