'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Download, FileText, X, Loader2 } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { formatDate } from '@/lib/utils';

interface DlFile { id: string; title: string; description: string|null; category: string; fileUrl: string; fileType: string; fileSize: string|null; downloadCount: number; isPublic: boolean; createdAt: string; }

const CATS = ['Formulir PPDB','Administrasi Siswa','Panduan & Buku','Keuangan','Akademik','Lainnya'];
const DEF = { title:'', description:'', category:'', fileUrl:'', fileType:'PDF', fileSize:'', isPublic:true };

export default function AdminDownloadPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEF);
  const [err, setErr] = useState('');
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const qc = useQueryClient();
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin-downloads'],
    queryFn: async () => { const { data } = await apiClient.get('/downloads?limit=100'); return (data.data||[]) as DlFile[]; },
  });

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/downloads', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-downloads'] }); setShowForm(false); setForm(DEF); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/downloads/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-downloads'] }); setDeleteId(null); },
  });

  const grouped = CATS.reduce((acc, cat) => {
    acc[cat] = list.filter(d => d.category === cat);
    return acc;
  }, {} as Record<string, DlFile[]>);

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Upload Dokumen Sekolah</h2>
                <p className="text-[11px] font-semibold text-slate-500">Unggah formulir, panduan, atau berkas unduhan</p>
              </div>
              <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={e=>{ e.preventDefault(); if(!form.title.trim()||!form.fileUrl) { setErr('Judul dan berkas file wajib diisi'); return; } createMut.mutate(form); }}>
              <div className="p-6 space-y-4">
                {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
                
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Dokumen *</label>
                  <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="cth: Formulir Pendaftaran PPDB T.A. 2025/2026"
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Deskripsi Singkat</label>
                  <textarea rows={2} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Keterangan singkat berkas..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"/>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Kategori Dokumen</label>
                  <select value={form.category} onChange={e=>set('category',e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                    <option value="">Pilih Kategori</option>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">Upload File Dokumen (PDF/DOC) *</label>
                  {form.fileUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-950">File Berhasil Diunggah</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{form.fileUrl}</p>
                      </div>
                      <button type="button" onClick={()=>set('fileUrl','')} className="text-xs font-bold text-rose-600 hover:underline flex-shrink-0">Hapus</button>
                    </div>
                  ) : (
                    <CustomImageUploader
                      endpoint="schoolDocument"
                      label="📎 Upload Berkas Dokumen (PDF / DOC)"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onUploadComplete={(url, name) => {
                        set('fileUrl', url);
                        set('fileType', name?.split('.').pop()?.toUpperCase() || 'PDF');
                      }}
                      className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                    />
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input type="checkbox" checked={form.isPublic} onChange={e=>set('isPublic',e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"/>
                  <span className="text-xs font-bold text-slate-800">Tampilkan untuk Unduhan Publik</span>
                </label>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
                <button type="submit" disabled={createMut.isPending||!form.fileUrl} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold shadow-2xs">
                  {createMut.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-emerald-100 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 mb-2">Hapus Dokumen Ini?</h3>
            <p className="text-xs text-slate-500 font-semibold mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
              <button onClick={()=>deleteMut.mutate(deleteId)} className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-2xs">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pusat Download</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{list.length} berkas dokumen tersedia</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Upload Dokumen Baru
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400">
          <Download className="w-10 h-10 mx-auto mb-3 opacity-30"/>
          <p className="text-xs font-semibold text-slate-500">Belum ada berkas dokumen</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATS.filter(cat => grouped[cat]?.length > 0).map(cat => (
            <div key={cat} className="space-y-3">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">{cat}</h2>
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs divide-y divide-emerald-50 overflow-hidden">
                {grouped[cat].map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                    <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5 text-rose-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{doc.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
                        <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">{doc.fileType}</span>
                        {doc.fileSize && <span>{doc.fileSize}</span>}
                        <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-600"/> {doc.downloadCount} kali diunduh</span>
                        <span>{formatDate(doc.createdAt,{day:'numeric',month:'short',year:'numeric'})}</span>
                        {!doc.isPublic && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">Internal</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Download className="w-4 h-4"/></a>
                      <button onClick={()=>setDeleteId(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
