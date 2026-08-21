import type { Metadata } from 'next';
import Link from 'next/link';
import { Monitor, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-Learning | SMP Darul Ulum Surabaya',
  description: 'Portal E-Learning dan Pembelajaran Digital SMP Darul Ulum Surabaya.',
};

export default function ElearningPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <div className="bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white border-b border-emerald-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-950">Beranda</Link>
            <span>/</span>
            <span>Akademik</span>
            <span>/</span>
            <span className="text-slate-900">E-Learning</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Portal E-Learning Siswa</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-xl font-medium">Akses materi pembelajaran, pengumpulan tugas, dan materi ujian digital.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
        <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Masuk Portal Pembelajaran</h2>
          <p className="text-xs text-slate-600 mb-6 font-medium max-w-md mx-auto">
            Siswa dan Guru dapat masuk menggunakan akun portal terdaftar untuk mengunggah dan mengunduh materi pelajaran.
          </p>
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all">
            <Lock className="w-4 h-4" /> Masuk Portal Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
