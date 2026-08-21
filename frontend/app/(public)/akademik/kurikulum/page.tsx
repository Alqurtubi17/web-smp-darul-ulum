import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kurikulum Sekolah | SMP Darul Ulum Surabaya',
  description: 'Informasi kurikulum dan struktur program pembelajaran SMP Darul Ulum Surabaya.',
};

export default function KurikulumPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <div className="bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white border-b border-emerald-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-950">Beranda</Link>
            <span>/</span>
            <span>Akademik</span>
            <span>/</span>
            <span className="text-slate-900">Kurikulum</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kurikulum & Pembelajaran</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-xl font-medium">Penerapan Kurikulum Merdeka terintegrasi dengan nilai-nilai Keislaman Ahlussunnah wal Jamaah.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4 border-b border-emerald-100 pb-3">Kurikulum Merdeka Integratif</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
            SMP Darul Ulum Surabaya menerapkan Kurikulum Merdeka yang disesuaikan dengan penguatan karakter peserta didik (P5 - Projek Penguatan Profil Pelajar Pancasila) serta pembiasaan keagamaan rutin.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Pembelajaran Intrakurikuler berpusat pada minat dan potensi siswa.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Penguatan Pendidikan Karakter (PPK) berbasis nilai-nilai Islam NU.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Program literasi membaca Al-Qur’an dan tadarus pagi.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
