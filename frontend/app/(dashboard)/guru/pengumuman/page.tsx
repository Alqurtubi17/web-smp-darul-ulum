'use client';

import { Megaphone, Pin, Clock } from 'lucide-react';

const ANNOUNCEMENTS = [
  { id: '1', title: 'Rapat Pleno Guru & Tendik Persiapan PTS Semester Genap', date: '2025-06-25', content: 'Diberitahukan kepada seluruh Bapak/Ibu Guru untuk menghadiri Rapat Pleno Persiapan Penilaian Tengah Semester pada hari Rabu pukul 13.00 WIB di Aula Utama Sekolah.', isPinned: true },
  { id: '2', title: 'Batas Akhir Input Nilai Rapor Semester Ganjil', date: '2025-06-20', content: 'Batas akhir pengisian nilai tugas dan ujian harian pada portal akademik diselesaikan paling lambat hari Jumat pukul 23.59 WIB.', isPinned: false },
  { id: '3', title: 'Pelatihan Kurikulum Merdeka & Pembelajaran Digital', date: '2025-06-15', content: 'Pelatihan penyusunan Modul Ajar Kurikulum Merdeka bagi seluruh tenaga pendidik SMP Darul Ulum Surabaya.', isPinned: false },
];

export default function GuruPengumumanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengumuman Internal Guru</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Informasi dan edaran resmi dari pihak sekolah</p>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs divide-y divide-emerald-50 overflow-hidden">
        {ANNOUNCEMENTS.map((item) => (
          <div key={item.id} className="p-6 hover:bg-emerald-50/30 transition-colors space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                {item.isPinned && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" /> {item.date}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed pl-6">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
