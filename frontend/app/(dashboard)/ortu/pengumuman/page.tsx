'use client';

import { Megaphone, Pin, Clock } from 'lucide-react';

const ANNOUNCEMENTS = [
  { id: '1', title: 'Undangan Rapat Pleno Orang Tua & Pembagian Rapor Semester', date: '2025-06-22', content: 'Mengharap kehadiran Bapak/Ibu Wali Murid siswa kelas 7, 8, dan 9 pada acara Pembagian Rapor dan Evaluasi Pembelajaran pada hari Sabtu pukul 08.00 WIB di Aula Sekolah.', isPinned: true },
  { id: '2', title: 'Pemberitahuan Kegiatan LDKS & Outbound Siswa Baru', date: '2025-06-18', content: 'Informasi persiapan perlengkapan siswa untuk kegiatan Latihan Dasar Kepemimpinan Siswa (LDKS) T.A. 2025/2026.', isPinned: false },
  { id: '3', title: 'Pembayaran SPP dan Administrasi Sekolah via Transfer', date: '2025-06-10', content: 'Dihimbau kepada seluruh Wali Murid untuk melakukan pembayaran SPP bulanan sebelum tanggal 10 setiap bulannya melalui rekening resmi sekolah.', isPinned: false },
];

export default function OrtuPengumumanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Pengumuman untuk Orang Tua / Wali Murid</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Informasi resmi kegiatan dan edaran sekolah</p>
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
