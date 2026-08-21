import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agenda | SMP Darul Ulum Surabaya',
  description: 'Jadwal dan agenda kegiatan SMP Darul Ulum Surabaya.',
};

const EVENTS = [
  { id: '1', title: 'Apel Pagi & Pembiasaan Karakter', date: '2025-06-16', time: '06.30 - 07.15 WIB', location: 'Halaman Utama Sekolah', category: 'Akademik' },
  { id: '2', title: 'Penerimaan Peserta Didik Baru (PPDB)', date: '2025-06-01', time: '07.30 - 14.00 WIB', location: 'Sekretariat PPDB', category: 'PPDB' },
  { id: '3', title: 'LDKS dan Outbound Siswa', date: '2025-06-20', time: '06.30 - 15.00 WIB', location: 'Area Outbound', category: 'Kegiatan' },
];

import { PageHero } from '@/components/public/PageHero';

export default function AgendaPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <PageHero
        title="Agenda & Kalender Kegiatan"
        subtitle="Jadwal kegiatan akademik dan non-akademik SMP Darul Ulum Surabaya."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Agenda' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        {EVENTS.map((e) => (
          <div key={e.id} className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                {e.category}
              </span>
              <h2 className="text-base font-bold text-slate-900 mb-1">{e.title}</h2>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium mt-2">
                <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5 text-emerald-600" /> {e.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-600" /> {e.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {e.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
