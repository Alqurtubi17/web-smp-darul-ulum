'use client';
import { useState } from 'react';
import { BookOpen, Download, Link2, Video, FileText, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const MATERIALS = [
  { id:'1', title:'Modul Bab 5 — Aljabar Linear', type:'document', subject:'Matematika', fileUrl:'#', size:'2.4 MB', date:'2025-06-15' },
  { id:'2', title:'Video Tutorial: Persamaan Kuadrat', type:'video', subject:'Matematika', fileUrl:'https://youtube.com', size:null, date:'2025-06-10' },
  { id:'3', title:'Ringkasan Materi SPLDV', type:'document', subject:'Matematika', fileUrl:'#', size:'1.1 MB', date:'2025-06-05' },
  { id:'4', title:'Modul Bahasa Indonesia Bab 4 — Teks Narasi', type:'document', subject:'Bahasa Indonesia', fileUrl:'#', size:'3.2 MB', date:'2025-06-08' },
  { id:'5', title:'Panduan Laporan Praktikum IPA', type:'document', subject:'IPA', fileUrl:'#', size:'1.8 MB', date:'2025-06-03' },
  { id:'6', title:'Link: Khan Academy — Fungsi', type:'link', subject:'Matematika', fileUrl:'https://khanacademy.org', size:null, date:'2025-05-28' },
];
const TYPE_ICON: Record<string,React.ReactNode> = {
  document:<FileText className="w-5 h-5 text-blue-600"/>,
  video:<Video className="w-5 h-5 text-red-600"/>,
  link:<Link2 className="w-5 h-5 text-green-600"/>
};
const SUBJECTS = ['Semua','Matematika','Bahasa Indonesia','IPA','Bahasa Inggris','PAI','IPS'];

export default function SiswaMateriPage() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('Semua');
  const filtered = MATERIALS.filter(m =>
    (subject === 'Semua' || m.subject === subject) &&
    m.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Materi Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">{MATERIALS.length} materi tersedia</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input type="search" placeholder="Cari materi..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${subject===s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                {TYPE_ICON[m.type]}
              </div>
              <div>
                <span className="text-xs text-gray-400">{m.subject}</span>
                <p className="text-xs text-gray-400">
                  {formatDate(m.date, { day:'numeric', month:'short', year:'numeric' })}
                </p>
              </div>
            </div>
            <h3 className="font-semibold text-sm text-gray-900 leading-snug group-hover:text-green-700 transition-colors mb-3">{m.title}</h3>
            {m.size && <p className="text-xs text-gray-400 mb-3">{m.size}</p>}
            <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
              {m.type === 'link' ? <><Link2 className="w-3.5 h-3.5"/> Buka Link</> : <><Download className="w-3.5 h-3.5"/> Unduh</>}
            </a>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
            <p className="text-sm text-gray-500">Tidak ada materi ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
