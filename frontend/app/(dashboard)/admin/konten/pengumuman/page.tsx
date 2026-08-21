'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pin, Edit2, Trash2, Bell, X, Loader2 } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Ann { id: string; title: string; content: string; isPinned: boolean; targetRoles: string[]; publishedAt: string; expiresAt: string | null; isActive: boolean; viewCount: number; }

const ROLES = ['SEMUA','SISWA','GURU','ORANG_TUA','ADMIN'];
const DEF = { title:'', content:'', isPinned:false, targetRoles:['SEMUA'] as string[], expiresAt:'' };

function AnnForm({ editItem, onClose }: { editItem: Ann | null; onClose: () => void }) {
  const [form, setForm] = useState(() => editItem ? { title:editItem.title, content:editItem.content, isPinned:editItem.isPinned, targetRoles:editItem.targetRoles, expiresAt:editItem.expiresAt||'' } : DEF);
  const [err, setErr] = useState('');
  const qc = useQueryClient();
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const toggleRole = (r: string) => setForm(p => ({ ...p, targetRoles: p.targetRoles.includes(r) ? p.targetRoles.filter(x=>x!==r) : [...p.targetRoles,r] }));

  const mut = useMutation({
    mutationFn: (body: Record<string, unknown>) => editItem ? apiClient.put(`/announcements/${editItem.id}`, body) : apiClient.post('/announcements', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); onClose(); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setErr('Judul dan isi wajib diisi'); return; }
    mut.mutate({ ...form, ...(form.expiresAt && { expiresAt: form.expiresAt }) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">{editItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h2>
            <p className="text-[11px] font-semibold text-slate-500">Publikasikan pengumuman resmi ke pengguna portal</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Pengumuman *</label>
              <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Judul pengumuman resmi..."
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Isi Pengumuman *</label>
              <textarea rows={5} required value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Tulis rincian pengumuman lengkap..."
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"/>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">Target Penerima</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => (
                  <button key={r} type="button" onClick={()=>toggleRole(r)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition-all ${form.targetRoles.includes(r)?'bg-emerald-600 text-white border-emerald-600 shadow-2xs':'bg-white text-slate-700 border-emerald-200 hover:border-emerald-400'}`}>
                    {r==='SEMUA'?'👥 Semua':r==='ORANG_TUA'?'👨‍👩‍👧 Ortu':`🏫 ${r.charAt(0)+r.slice(1).toLowerCase()}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Berlaku Hingga (Opsional)</label>
              <input type="date" value={form.expiresAt} onChange={e=>set('expiresAt',e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>
            <label className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-200 cursor-pointer hover:bg-emerald-50/40 transition-colors shadow-2xs">
              <input type="checkbox" checked={form.isPinned} onChange={e=>set('isPinned',e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"/>
              <div>
                <p className="text-xs font-extrabold text-slate-900">📌 Sematkan di Teratas</p>
                <p className="text-[11px] text-slate-500 font-semibold">Pengumuman selalu tampil di urutan paling atas dashboard</p>
              </div>
            </label>
          </div>
          
          <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">Batal</button>
            <button type="submit" disabled={mut.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs">
              {mut.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
              {editItem ? 'Simpan Perubahan' : 'Publikasikan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPengumumanPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Ann|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => { const { data } = await apiClient.get('/announcements?limit=50'); return (data.data||[]) as Ann[]; },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/announcements/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); setDeleteId(null); },
  });

  const togglePin = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => apiClient.put(`/announcements/${id}`, { isPinned: !isPinned }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-announcements'] }),
  });

  return (
    <div className="space-y-6">
      {showForm && <AnnForm editItem={editItem} onClose={()=>{ setShowForm(false); setEditItem(null); }}/>}
      
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-emerald-100">
            <h3 className="font-extrabold text-slate-900 mb-2">Hapus Pengumuman?</h3>
            <p className="text-xs text-slate-500 font-semibold mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
              <button onClick={()=>deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-2xs">
                {deleteMut.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pengumuman</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{list.filter(a=>a.isActive).length} aktif · {list.length} total pengumuman</p>
        </div>
        <button onClick={()=>{ setEditItem(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Buat Pengumuman Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-xs font-semibold text-slate-500">Belum ada pengumuman</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-50">
            {list.map(a => (
              <div key={a.id} className={`flex items-start gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors ${!a.isActive?'opacity-50':''}`}>
                <button onClick={()=>togglePin.mutate({ id:a.id, isPinned:a.isPinned })}
                  className={`mt-0.5 ${a.isPinned?'text-amber-500':'text-slate-300'} hover:text-amber-500 transition-colors`} title="Sematkan">
                  <Pin className="w-4 h-4"/>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-extrabold text-slate-900">{a.title}</p>
                    {a.isPinned && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">📌 Pin</span>}
                    {!a.isActive && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Nonaktif</span>}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1 leading-relaxed">{a.content}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-400">
                    <span>{formatDate(a.publishedAt,{day:'numeric',month:'short',year:'numeric'})}</span>
                    <span>👁 {a.viewCount}</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">{a.targetRoles.join(', ')}</span>
                    {a.expiresAt && <span>s.d. {formatDate(a.expiresAt,{day:'numeric',month:'short'})}</span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>{ setEditItem(a); setShowForm(true); }} className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={()=>setDeleteId(a.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
