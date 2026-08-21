import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Jadwal Pelajaran | SMP Darul Ulum Surabaya',
  description: 'Informasi jam kegiatan dan waktu pembelajaran siswa SMP Darul Ulum Surabaya.',
};

const SCHEDULE = [
  { time: '06.30 - 07.15 WIB', activity: 'Apel Pagi / Pembiasaan Pagi & Tadarus' },
  { time: '07.15 - 09.30 WIB', activity: 'KBM Sesi 1' },
  { time: '09.30 - 10.00 WIB', activity: 'Istirahat Pertama' },
  { time: '10.00 - 12.00 WIB', activity: 'KBM Sesi 2' },
  { time: '12.00 - 12.45 WIB', activity: 'Istirahat & Salat Dzuhur Berjamaah' },
  { time: '12.45 - 14.30 WIB', activity: 'KBM Sesi 3 & Pembinaan Ekstrakurikuler' },
];

export default function JadwalPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <div className="bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white border-b border-emerald-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-950">Beranda</Link>
            <span>/</span>
            <span>Akademik</span>
            <span>/</span>
            <span className="text-slate-900">Jadwal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Jadwal Kegiatan Harian</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-xl font-medium">Jam operasional pembelajaran dan rutinitas pembiasaan siswa.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-emerald-100 divide-y divide-emerald-100 shadow-xs">
          {SCHEDULE.map((s, i) => (
            <div key={i} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-slate-900 text-sm">{s.activity}</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">{s.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
