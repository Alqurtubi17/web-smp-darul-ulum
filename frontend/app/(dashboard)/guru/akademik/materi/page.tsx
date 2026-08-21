'use client';

import { useState } from 'react';
import { Plus, FileText, Link2, Video, Trash2, Download, Eye, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

const MATERIALS = [
  { id:'1', title:'Modul Bab 5 — Aljabar Linear', type:'document', subject:'Matematika', class:'8A', fileUrl:'#', size:'2.4 MB', downloads:24, date:'2025-06-15' },
  { id:'2', title:'Video Tutorial: Persamaan Kuadrat', type:'video', subject:'Matematika', class:'9A', fileUrl:'https://youtube.com', size:null, downloads:45, date:'2025-06-10' },
  { id:'3', title:'Ringkasan Materi SPLDV', type:'document', subject:'Matematika', class:'8B', fileUrl:'#', size:'1.1 MB', downloads:18, date:'2025-06-05' },
  { id:'4', title:'Link: Khan Academy — Fungsi', type:'link', subject:'Matematika', class:'Semua', fileUrl:'https://khanacademy.org', size:null, downloads:32, date:'2025-05-28' },
];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  document:{ icon:<FileText className="w-4 h-4"/>, label:'Dokumen', color:'text-emerald-800 bg-emerald-100' },
  video:   { icon:<Video className="w-4 h-4"/>, label:'Video', color:'text-blue-800 bg-blue-100' },
  link:    { icon:<Link2 className="w-4 h-4"/>, label:'Link Web', color:'text-purple-800 bg-purple-100' },
};

export default function GuruMateriPage() {
  const [showForm, setShowForm] = useState(false);
  const [uploadType, setUploadType] = useState<'document'|'video'|'link'>('document');
  const [fileUrl, setFileUrl] = useState('');
  const [form, setForm] = useState({ title:'', description:'', classId:'', externalUrl:'' });
  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Katalog Materi Pelajaran</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{MATERIALS.length} berkas materi diunggah</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Upload Materi Baru
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Upload Materi Baru</h2>
                <p className="text-[11px] font-semibold text-slate-500">Unggah berkas modul, video, atau tautan pembelajaran</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex gap-2 p-1.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                {(['document','video','link'] as const).map(t => (
                  <button key={t} onClick={() => setUploadType(t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition-all ${uploadType===t ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-950 hover:bg-white/60'}`}>
                    {TYPE_CONFIG[t].icon}{TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Materi Pembelajaran *</label>
                <input type="text" placeholder="cth: Modul Bab 6 — Statistika &amp; Peluang" value={form.title}
                  onChange={e => update('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Kelas Tujuan</label>
                <select value={form.classId} onChange={e => update('classId', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                  <option value="">Semua kelas yang saya ajar</option>
                  {['7A','7B','8A','8B','9A','9C'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {uploadType === 'link' ? (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">URL / Tautan Luar *</label>
                  <input type="url" value={form.externalUrl} onChange={e => update('externalUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">Upload Berkas Materi *</label>
                  {fileUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                      <span className="text-xs font-semibold text-emerald-950 truncate flex-1">{fileUrl}</span>
                      <button type="button" onClick={()=>setFileUrl('')} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                    </div>
                  ) : (
                    <CustomImageUploader
                      endpoint="materialFile"
                      label={uploadType === 'video' ? '📹 Upload Video Materi' : '📄 Upload Dokumen Materi (PDF/DOC)'}
                      accept={uploadType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                      onUploadComplete={(url) => setFileUrl(url)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs">Simpan Materi</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {MATERIALS.map(m => {
          const cfg = TYPE_CONFIG[m.type];
          return (
            <div key={m.id} className="bg-white rounded-3xl border border-emerald-100 p-6 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${cfg.color}`}>{cfg.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">{m.title}</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">{m.subject} · Kelas {m.class}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
                    <span>{formatDate(m.date, { day:'numeric', month:'short', year:'numeric' })}</span>
                    {m.size && <span>{m.size}</span>}
                    <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-600"/>{m.downloads}× diunduh</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-emerald-50">
                <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold hover:bg-emerald-100 transition-colors shadow-2xs">
                  <Eye className="w-3.5 h-3.5"/> Lihat Materi
                </a>
                <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
