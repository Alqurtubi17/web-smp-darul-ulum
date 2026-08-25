'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Pin, Clock, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import apiClient from '@/lib/api';

export default function GuruPengumumanPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/announcements');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setAnnouncements(res.data.data);
        }
      } catch (err) {
        console.warn('Fetch announcements warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const displayList = announcements.length > 0 ? announcements : [
    { id: '1', title: 'Rapat Pleno Guru & Tendik Persiapan PTS Semester Genap', createdAt: new Date().toISOString(), content: 'Diberitahukan kepada seluruh Bapak/Ibu Guru untuk menghadiri Rapat Pleno Persiapan Penilaian Tengah Semester pada hari Rabu pukul 13.00 WIB di Aula Utama Sekolah.', isPinned: true },
    { id: '2', title: 'Batas Akhir Input Nilai Rapor Semester Ganjil', createdAt: new Date().toISOString(), content: 'Batas akhir pengisian nilai tugas dan ujian harian pada portal akademik diselesaikan paling lambat hari Jumat pukul 23.59 WIB.', isPinned: false },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-start border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pengumuman Internal Guru</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Informasi dan edaran resmi dari pihak sekolah</p>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {displayList.map((item) => (
          <div key={item.id} className="p-6 hover:bg-slate-50/70 transition-colors space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                {item.isPinned && (
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> {formatDate(item.createdAt || new Date(), { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed pl-6">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
