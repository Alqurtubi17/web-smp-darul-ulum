'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, CalendarDays, X, Loader2 } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Evt { id: string; title: string; description: string | null; location: string | null; startDate: string; endDate: string | null; isAllDay: boolean; category: string | null; isPublic: boolean; }

const CATS = ['Akademik','Keagamaan','PPDB','Kegiatan','Nasional','Ekskul','Lainnya'];
const DEF = { title:'', description:'', location:'', startDate:'', endDate:'', isAllDay:true, category:'', isPublic:true };

function EvtForm({ editItem, onClose }: { editItem: Evt | null; onClose: () => void }) {
  const [form, setForm] = useState(() => editItem ? {
    title:editItem.title, description:editItem.description||'', location:editItem.location||'',
    startDate:editItem.startDate.split('T')[0], endDate:editItem.endDate?.split('T')[0]||'',
    isAllDay:editItem.isAllDay, category:editItem.category||'', isPublic:editItem.isPublic,
  } : DEF);
  const [err, setErr] = useState('');
  const qc = useQueryClient();
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const mut = useMutation({
    mutationFn: (body: Record<string, unknown>) => editItem ? apiClient.put(`/events/${editItem.id}`, body) : apiClient.post('/events', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); onClose(); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate) { setErr('Judul dan tanggal mulai wajib diisi'); return; }
    mut.mutate({ ...form, startDate: new Date(form.startDate).toISOString(), ...(form.endDate && { endDate: new Date(form.endDate).toISOString() }) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">{editItem ? 'Edit' : 'Tambah'} Agenda Sekolah</h2>
            <p className="text-[11px] font-semibold text-slate-500">Jadwalkan kegiatan atau agenda sekolah</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={submit}>
          <div className="p-6 space-y-4">
            {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
            
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Agenda *</label>
              <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="cth: Ujian Tengah Semester Genap"
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Lokasi Pelaksanaan</label>
              <input type="text" value={form.location} onChange={e=>set('location',e.target.value)} placeholder="cth: Aula Utama / Lapangan Sekolah"
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Deskripsi Singkat</label>
              <textarea rows={2} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Tulis rincian singkat agenda..."
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tanggal Mulai *</label>
                <input type="date" required value={form.startDate} onChange={e=>set('startDate',e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tanggal Selesai</label>
                <input type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Kategori Agenda</label>
              <select value={form.category} onChange={e=>set('category',e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                <option value="">Pilih Kategori</option>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAllDay} onChange={e=>set('isAllDay',e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"/>
                <span className="text-xs font-bold text-slate-800">Acara Seharian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPublic} onChange={e=>set('isPublic',e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"/>
                <span className="text-xs font-bold text-slate-800">Tampilkan di Publik</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">Batal</button>
            <button type="submit" disabled={mut.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs">
              {mut.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
              {editItem ? 'Simpan' : 'Tambah Agenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAgendaPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Evt|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => { const { data } = await apiClient.get('/events?limit=50'); return (data.data||[]) as Evt[]; },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/events/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-events'] }); setDeleteId(null); },
  });

  const byMonth = events.reduce((acc, e) => {
    const m = new Date(e.startDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[m]) acc[m] = [];
    acc[m].push(e);
    return acc;
  }, {} as Record<string, Evt[]>);

  return (
    <div className="space-y-6">
      {showForm && <EvtForm editItem={editItem} onClose={()=>{ setShowForm(false); setEditItem(null); }}/>}
      
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-emerald-100 shadow-2xl">
            <h3 className="font-extrabold text-slate-900 mb-2">Hapus Agenda Ini?</h3>
            <p className="text-xs text-slate-500 font-semibold mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
              <button onClick={()=>deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-2xs">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Agenda Sekolah</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{events.length} agenda terdaftar</p>
        </div>
        <button onClick={()=>{ setEditItem(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Tambah Agenda Baru
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30"/>
          <p className="text-xs font-semibold text-slate-500">Belum ada agenda terdaftar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byMonth).map(([month, evts]) => (
            <div key={month} className="space-y-3">
              <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-1">{month}</h2>
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs divide-y divide-emerald-50 overflow-hidden">
                {evts.map(e => (
                  <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                      <span className="text-sm font-black text-emerald-800 leading-none">{new Date(e.startDate).toLocaleDateString('id-ID',{day:'numeric'})}</span>
                      <span className="text-[10px] font-bold text-emerald-600 mt-0.5 uppercase">{new Date(e.startDate).toLocaleDateString('id-ID',{month:'short'})}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900">{e.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-400">
                        {e.location && <span>📍 {e.location}</span>}
                        {e.endDate && <span>s.d. {formatDate(e.endDate,{day:'numeric',month:'short'})}</span>}
                        {e.category && <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">{e.category}</span>}
                        {!e.isPublic && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">Internal</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={()=>{ setEditItem(e); setShowForm(true); }} className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={()=>setDeleteId(e.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
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
