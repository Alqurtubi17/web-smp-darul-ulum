'use client';

import { useState } from 'react';
import { Plus, FileText, Clock, Users, X, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

const ASSIGNMENTS = [
  { id:'1', title:'Essay Bahasa Indonesia: Tema Lingkungan', subject:'Bahasa Indonesia', class:'8A', dueDate:'2025-07-05', maxScore:100, status:'AKTIF', submissions:28, total:32 },
  { id:'2', title:'Laporan Praktikum IPA: Fotosintesis', subject:'IPA', class:'8A', dueDate:'2025-07-07', maxScore:100, status:'AKTIF', submissions:15, total:32 },
  { id:'3', title:'Soal Latihan Matematika Bab 5', subject:'Matematika', class:'8A', dueDate:'2025-07-10', maxScore:100, status:'AKTIF', submissions:0, total:32 },
  { id:'4', title:'Reading Comprehension: Tourism', subject:'Bahasa Inggris', class:'7B', dueDate:'2025-06-28', maxScore:100, status:'DITUTUP', submissions:30, total:30 },
];

export default function GuruTugasPage() {
  const [showForm, setShowForm] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [form, setForm] = useState({ title:'', subject:'Matematika', classId:'8A', description:'', dueDate:'', maxScore:'100', type:'TUGAS' });
  const up = (k: string, v: string) => setForm(p => ({...p, [k]:v}));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Tugas Siswa</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{ASSIGNMENTS.length} tugas siswa aktif</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4" /> Buat Tugas Baru
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Buat Tugas Baru</h2>
                <p className="text-[11px] font-semibold text-slate-500">Berikan instruksi dan batas pengumpulan tugas</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Tugas *</label>
                <input type="text" value={form.title} onChange={e => up('title', e.target.value)}
                  placeholder="Judul tugas yang jelas dan spesifik..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Mata Pelajaran', key:'subject', opts:['Matematika','B. Indonesia','IPA','B. Inggris','PAI'] },
                  { label:'Kelas Target', key:'classId', opts:['7A','7B','7C','8A','8B','8C','9A','9B','9C'] },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">{f.label}</label>
                    <select value={(form as Record<string,string>)[f.key]} onChange={e => up(f.key, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Batas Pengumpulan (Deadline) *</label>
                  <input type="datetime-local" value={form.dueDate} onChange={e => up('dueDate', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Nilai Maksimal</label>
                  <input type="number" value={form.maxScore} onChange={e => up('maxScore', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Deskripsi / Petunjuk Pengerjaan</label>
                <textarea rows={4} value={form.description} onChange={e => up('description', e.target.value)}
                  placeholder="Tulis instruksi pengerjaan tugas secara detail..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs" />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">File Lampiran Soal (Opsional)</label>
                {fileUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                    <span className="text-xs font-semibold text-emerald-950 truncate flex-1">{fileUrl}</span>
                    <button type="button" onClick={()=>setFileUrl('')} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                  </div>
                ) : (
                  <CustomImageUploader
                    endpoint="assignmentFile"
                    label="📄 Upload File Soal (PDF / DOC)"
                    accept=".pdf,.doc,.docx"
                    onUploadComplete={(url) => setFileUrl(url)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">Batal</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs">
                Publikasikan Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {ASSIGNMENTS.map(a => {
          const pct = Math.round((a.submissions / a.total) * 100);
          const isActive = a.status === 'AKTIF';
          const overdue = new Date(a.dueDate) < new Date();
          return (
            <div key={a.id} className="bg-white rounded-3xl border border-emerald-100 p-6 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs text-emerald-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {a.class}
                    </span>
                  </div>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug mb-1">{a.title}</h3>
                <p className="text-xs font-semibold text-emerald-700 mb-3">{a.subject} · Nilai Maks. {a.maxScore}</p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-4">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className={overdue && isActive ? 'text-rose-600 font-extrabold' : ''}>
                    Deadline: {formatDate(a.dueDate, { day:'numeric', month:'short', year:'numeric' })}
                    {overdue && isActive && ' (Lewat Deadline!)'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600"/>{a.submissions}/{a.total} Siswa Mengumpulkan</span>
                    <span className="font-extrabold text-slate-900">{pct}%</span>
                  </div>
                  <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                    <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-600' : pct > 50 ? 'bg-teal-500' : 'bg-amber-500'}`}
                      style={{ width:`${pct}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" /> Lihat Pengumpulan
                </button>
                <button className="p-2.5 rounded-2xl border border-emerald-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
