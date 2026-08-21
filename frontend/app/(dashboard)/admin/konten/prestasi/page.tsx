'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Trophy, X, Loader2 } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';

interface Achievement { id: string; title: string; description: string | null; category: string; level: string; year: number; winner: string; imageUrl: string | null; }

const LEVELS = ['internasional','nasional','provinsi','kota','sekolah'];
const CATS = ['siswa','guru','sekolah'];
const DEF = { title:'', description:'', category:'siswa', level:'nasional', year:new Date().getFullYear(), winner:'', imageUrl:'' };

const LEVEL_COLOR: Record<string, string> = {
  internasional:'bg-purple-100 text-purple-800',
  nasional:'bg-rose-100 text-rose-800',
  provinsi:'bg-blue-100 text-blue-800',
  kota:'bg-emerald-100 text-emerald-800',
  sekolah:'bg-slate-100 text-slate-700',
};

function Form({ editItem, onClose }: { editItem: Achievement | null; onClose: () => void }) {
  const [form, setForm] = useState(() => editItem ? { title:editItem.title, description:editItem.description||'', category:editItem.category, level:editItem.level, year:editItem.year, winner:editItem.winner, imageUrl:editItem.imageUrl||'' } : DEF);
  const [err, setErr] = useState('');
  const qc = useQueryClient();
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const mut = useMutation({
    mutationFn: (body: Record<string, unknown>) => editItem ? apiClient.put(`/achievements/${editItem.id}`, body) : apiClient.post('/achievements', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-achievements'] }); onClose(); },
    onError: e => setErr(getErrorMessage(e)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">{editItem ? 'Edit' : 'Tambah'} Prestasi Sekolah</h2>
            <p className="text-[11px] font-semibold text-slate-500">Catat capaian prestasi siswa atau sekolah</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (!form.title.trim()||!form.winner.trim()) { setErr('Judul dan penerima wajib diisi'); return; } mut.mutate({ ...form, year: Number(form.year) }); }}>
          <div className="p-6 space-y-4">
            {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Prestasi *</label>
              <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="cth: Juara 1 OSN Matematika Kota Surabaya"
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Penerima / Nama Tim *</label>
              <input type="text" required value={form.winner} onChange={e=>set('winner',e.target.value)} placeholder="cth: Ahmad Rizki Pratama (Kelas 9A)"
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Deskripsi Singkat</label>
              <textarea rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Keterangan singkat mengenai lomba dan raihan prestasi..."
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"/>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Kategori</label>
                <select value={form.category} onChange={e=>set('category',e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize shadow-2xs">
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tingkat</label>
                <select value={form.level} onChange={e=>set('level',e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize shadow-2xs">
                  {LEVELS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tahun</label>
                <input type="number" value={form.year} onChange={e=>set('year',e.target.value)} min="2000" max="2099"
                  className="w-full px-3 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
              </div>
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">Batal</button>
            <button type="submit" disabled={mut.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs">
              {mut.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
              {editItem ? 'Simpan' : 'Tambah Prestasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPrestasiPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Achievement|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [filter, setFilter] = useState('semua');
  const qc = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: async () => { const { data } = await apiClient.get('/achievements?limit=100'); return (data.data||[]) as Achievement[]; },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/achievements/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-achievements'] }); setDeleteId(null); },
  });

  const filtered = filter === 'semua' ? list : list.filter(a => a.level === filter);

  return (
    <div className="space-y-6">
      {showForm && <Form editItem={editItem} onClose={()=>{ setShowForm(false); setEditItem(null); }}/>}
      
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-emerald-100 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 mb-2">Hapus Catatan Prestasi?</h3>
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
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Prestasi Sekolah</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{list.length} prestasi tercatat</p>
        </div>
        <button onClick={()=>{ setEditItem(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Tambah Prestasi Baru
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 bg-emerald-50 p-1.5 rounded-2xl border border-emerald-100 w-fit flex-wrap">
        {['semua',...LEVELS].map(l=>(
          <button key={l} onClick={()=>setFilter(l)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter===l?'bg-white text-emerald-950 shadow-2xs':'text-slate-600 hover:text-emerald-800'}`}>
            {l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30"/>
          <p className="text-xs font-semibold text-slate-500">Belum ada prestasi di kategori ini</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-3xl border border-emerald-100 p-5 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Trophy className="w-5 h-5 text-amber-600"/>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-full">{a.year}</span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug mb-1">{a.title}</h3>
                <p className="text-xs font-semibold text-emerald-700 mb-2">{a.winner}</p>
                {a.description && <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">{a.description}</p>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-emerald-50">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${LEVEL_COLOR[a.level]||'bg-slate-100 text-slate-600'}`}>{a.level}</span>
                <div className="flex gap-1">
                  <button onClick={()=>{ setEditItem(a); setShowForm(true); }} className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>setDeleteId(a.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
