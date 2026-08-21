'use client';

import { useState } from 'react';
import { BookOpen, Download, Link2, Video, FileText, Search, Play, CheckCircle2, Sparkles, X, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const MATERIALS = [
  { id: '1', title: 'Modul Bab 5 — Aljabar Linear & Persamaan Garis Lurus', type: 'document', subject: 'Matematika', fileUrl: '#', size: '2.4 MB', date: '2025-06-15', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', isCompleted: true },
  { id: '2', title: 'Video Pembelajaran: Persamaan Kuadrat & Garis Singgung', type: 'video', subject: 'Matematika', fileUrl: 'https://youtube.com', size: null, date: '2025-06-10', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', isCompleted: false },
  { id: '3', title: 'Ringkasan Rangkuman Materi Sistem SPLDV', type: 'document', subject: 'Matematika', fileUrl: '#', size: '1.1 MB', date: '2025-06-05', videoUrl: null, isCompleted: true },
  { id: '4', title: 'Modul Bahasa Indonesia Bab 4 — Struktur Teks Narasi & Gagasan Utama', type: 'document', subject: 'Bahasa Indonesia', fileUrl: '#', size: '3.2 MB', date: '2025-06-08', videoUrl: null, isCompleted: false },
  { id: '5', title: 'Panduan Laporan Praktikum IPA: Fotosintesis & Klorofil Sel', type: 'document', subject: 'IPA', fileUrl: '#', size: '1.8 MB', date: '2025-06-03', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', isCompleted: true },
  { id: '6', title: 'Akses Platform Simulasi Interactive Science Lab', type: 'link', subject: 'IPA', fileUrl: 'https://khanacademy.org', size: null, date: '2025-05-28', videoUrl: null, isCompleted: false },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
  document: <FileText className="w-5 h-5 text-emerald-700" />,
  video: <Video className="w-5 h-5 text-rose-600" />,
  link: <Link2 className="w-5 h-5 text-blue-600" />,
};

const SUBJECTS = ['Semua', 'Matematika', 'Bahasa Indonesia', 'IPA', 'Bahasa Inggris', 'PAI', 'IPS'];

export default function SiswaMateriPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('Semua');
  const [activeVideo, setActiveVideo] = useState<typeof MATERIALS[0] | null>(null);

  const filtered = MATERIALS.filter(m =>
    (subject === 'Semua' || m.subject === subject) &&
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">RuangBelajar &amp; Modul Pembelajaran</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{MATERIALS.length} materi interaktif terdaftar</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>E-Learning Terintegrasi</span>
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">{activeVideo.title}</h2>
                <p className="text-[11px] font-semibold text-emerald-800">{activeVideo.subject}</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800 shadow-md">
                <div className="text-center p-6 text-white space-y-3">
                  <Play className="w-12 h-12 text-emerald-400 mx-auto fill-emerald-400 animate-pulse" />
                  <p className="font-extrabold text-sm text-slate-200">Video Pembelajaran Interaktif</p>
                  <p className="text-xs text-slate-400 font-mono">Modul ini siap diputar untuk kelas {activeVideo.subject}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setActiveVideo(null)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">
                Tutup
              </button>
              <a href={activeVideo.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold text-center shadow-2xs">
                Unduh Berkas Lengkap
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
          <input type="search" placeholder="Cari materi pembelajaran..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
        </div>
        <div className="flex gap-1.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-1.5 flex-wrap">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${subject === s ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-800'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Material Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-3xl border border-emerald-100 p-6 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {TYPE_ICON[m.type]}
                </div>
                <div className="flex items-center gap-2">
                  {m.isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Selesai
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {formatDate(m.date, { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                {m.subject}
              </span>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors mt-2">
                {m.title}
              </h3>
            </div>

            <div className="space-y-2 pt-2 border-t border-emerald-50">
              {m.videoUrl && (
                <button
                  onClick={() => setActiveVideo(m)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold border border-rose-200 transition-colors shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-rose-700" /> Tonton Video Interaktif
                </button>
              )}

              <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200 transition-colors shadow-2xs">
                {m.type === 'link' ? <><Link2 className="w-3.5 h-3.5" /> Buka Tautan Eksternal</> : <><Download className="w-3.5 h-3.5" /> Unduh Berkas ({m.size})</>}
              </a>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400 shadow-2xs">
            <BookOpen className="w-12 h-12 text-emerald-600 opacity-30 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Tidak ada materi pembelajaran ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
