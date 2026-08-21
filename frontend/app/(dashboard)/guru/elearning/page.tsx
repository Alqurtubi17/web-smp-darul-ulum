'use client';
import { useState } from 'react';
import { Plus, BookOpen, Play, Edit2, Trash2, Upload, Eye, Users, BarChart3, X, Loader2 } from 'lucide-react';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

interface Module {
  id: string; title: string; subject: string; class: string;
  type: 'VIDEO' | 'READING' | 'QUIZ'; content: string;
  views: number; students: number; createdAt: string; isPublished: boolean;
}

const DUMMY: Module[] = [
  { id:'1', title:'Pengantar Aljabar Linear', subject:'Matematika', class:'8A', type:'VIDEO', content:'https://youtube.com/watch?v=xxx', views:145, students:28, createdAt:'2025-07-01', isPublished:true },
  { id:'2', title:'Rangkuman Hukum Newton', subject:'IPA', class:'7B', type:'READING', content:'<p>Materi hukum Newton...</p>', views:89, students:22, createdAt:'2025-07-03', isPublished:true },
  { id:'3', title:'Kuis Persamaan Linear', subject:'Matematika', class:'8A', type:'QUIZ', content:'{}', views:67, students:28, createdAt:'2025-07-05', isPublished:false },
];

const CLASSES = ['7A','7B','7C','8A','8B','8C','9A','9B','9C'];
const SUBJECTS = ['Matematika','IPA','IPS','B. Indonesia','B. Inggris','PAI'];
const TYPE_ICON = { VIDEO:<Play className="w-4 h-4"/>, READING:<BookOpen className="w-4 h-4"/>, QUIZ:<BarChart3 className="w-4 h-4"/> };
const TYPE_COLOR = { VIDEO:'bg-blue-100 text-blue-800', READING:'bg-emerald-100 text-emerald-800', QUIZ:'bg-amber-100 text-amber-800' };

export default function GuruElearningPage() {
  const [modules, setModules] = useState<Module[]>(DUMMY);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', subject:'', class:'', type:'VIDEO' as Module['type'], content:'', fileUrl:'' });
  const [err, setErr] = useState('');
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.class) { setErr('Lengkapi semua field wajib'); return; }
    const newMod: Module = { id: Date.now().toString(), ...form, views:0, students:0, createdAt:new Date().toISOString().split('T')[0], isPublished:false };
    setModules(m => [newMod, ...m]);
    setShowForm(false);
    setForm({ title:'', subject:'', class:'', type:'VIDEO', content:'', fileUrl:'' });
    setErr('');
  };

  const togglePublish = (id: string) =>
    setModules(m => m.map(mod => mod.id === id ? { ...mod, isPublished: !mod.isPublished } : mod));

  const deleteModule = (id: string) => setModules(m => m.filter(mod => mod.id !== id));

  const published = modules.filter(m => m.isPublished).length;
  const totalViews = modules.reduce((a,b) => a+b.views, 0);

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg my-6 overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Tambah Modul E-Learning</h2>
                <p className="text-[11px] font-semibold text-slate-500">Unggah bahan ajar atau kuis interaktif</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Modul Pembelajaran *</label>
                  <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="cth: Pengantar Aljabar Linear Kelas 8"
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'Mata Pelajaran *', key:'subject', opts:SUBJECTS },
                    { label:'Kelas *', key:'class', opts:CLASSES },
                    { label:'Tipe Modul', key:'type', opts:['VIDEO','READING','QUIZ'] },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">{f.label}</label>
                      <select value={(form as Record<string,string>)[f.key]} onChange={e=>set(f.key,e.target.value)}
                        className="w-full px-3 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                        <option value="">Pilih</option>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {form.type === 'VIDEO' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">URL Video (YouTube / Google Drive)</label>
                      <input type="url" value={form.content} onChange={e=>set('content',e.target.value)} placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-700 mb-1.5">Atau Upload Berkas Video Langsung:</p>
                      <CustomImageUploader
                        endpoint="materialFile"
                        label="📹 Upload File Video"
                        accept="video/*"
                        onUploadComplete={(url) => set('content', url)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {form.type === 'READING' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Teks Rangkuman Materi</label>
                      <textarea rows={4} value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Tulis ringkasan materi bacaan..."
                        className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"/>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-700 mb-1.5">Atau Upload File Dokumen (PDF/DOC):</p>
                      <CustomImageUploader
                        endpoint="materialFile"
                        label="📄 Upload File Dokumen Materi"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onUploadComplete={(url) => set('fileUrl', url)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                      />
                      {form.fileUrl && <p className="text-xs font-bold text-emerald-700 mt-1.5">✓ File dokumen terupload</p>}
                    </div>
                  </div>
                )}

                {form.type === 'QUIZ' && (
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                    <p className="text-xs font-extrabold text-amber-900 mb-1">📝 Mode Kuis Interaktif</p>
                    <p className="text-[11px] font-semibold text-amber-700">Soal kuis interaktif akan dikonfigurasi melalui editor kuis setelah modul ini disimpan.</p>
                    <input type="text" value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Deskripsi kuis (opsional)..."
                      className="w-full mt-2 px-3 py-2 rounded-xl border border-amber-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none"/>
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs">Simpan Modul</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">E-Learning &amp; Modul Ajar</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{published} modul dipublikasikan · {modules.length} total modul</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Tambah Modul Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label:'Total Modul', val:modules.length, icon:'📚', color:'text-blue-700 bg-blue-50/80 border-blue-100' },
          { label:'Total Penonton', val:totalViews, icon:'👁️', color:'text-emerald-700 bg-emerald-50/80 border-emerald-100' },
          { label:'Dipublikasikan', val:published, icon:'🌐', color:'text-purple-700 bg-purple-50/80 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-3xl border p-5 flex items-center gap-4 shadow-2xs`}>
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className={`text-2xl font-black ${s.color.split(' ')[0]}`}>{s.val.toLocaleString('id-ID')}</p>
              <p className="text-xs font-extrabold text-slate-700">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs divide-y divide-emerald-50 overflow-hidden">
        {modules.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30"/>
            <p className="text-xs font-semibold text-slate-500">Belum ada modul e-learning</p>
          </div>
        ) : (
          modules.map(mod => (
            <div key={mod.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${TYPE_COLOR[mod.type]}`}>
                {TYPE_ICON[mod.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-extrabold text-slate-900">{mod.title}</p>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${TYPE_COLOR[mod.type]}`}>{mod.type}</span>
                  {!mod.isPublished && <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">Draft</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">{mod.subject}</span>
                  <span>Kelas {mod.class}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-600"/> {mod.views}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600"/> {mod.students}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(mod.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-2xs ${mod.isPublished ? 'bg-emerald-100 text-emerald-900 hover:bg-rose-100 hover:text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900'}`}>
                  {mod.isPublished ? '✓ Publik' : '→ Publish'}
                </button>
                <button className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4"/></button>
                <button onClick={() => deleteModule(mod.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
