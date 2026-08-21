'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, Eye, Globe, FileText, X, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import apiClient, { getErrorMessage } from '@/lib/api';

const RichEditor = dynamic(() => import('@/components/ui/RichEditor'), { ssr: false });

type NS = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
interface NewsItem { id: string; title: string; slug: string; excerpt: string; content: string; thumbnail: string | null; category: string; tags: string[]; status: NS; viewCount: number; publishedAt: string | null; }

const CATS = ['Prestasi','PPDB','Kegiatan','Akademik','Teknologi','Penghargaan','Informasi'];
const DEF = { title:'', excerpt:'', content:'', thumbnail:'', category:'', tags:'', status:'DRAFT' as NS };

function NewsForm({ editItem, onClose }: { editItem: NewsItem | null; onClose: () => void }) {
  const [form, setForm] = useState(() => editItem ? { title:editItem.title, excerpt:editItem.excerpt||'', content:editItem.content, thumbnail:editItem.thumbnail||'', category:editItem.category||'', tags:editItem.tags?.join(', ')||'', status:editItem.status } : DEF);
  const [err, setErr] = useState('');
  const qc = useQueryClient();
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const mut = useMutation({
    mutationFn: (body: Record<string, unknown>) => editItem ? apiClient.put(`/news/${editItem.id}`, body) : apiClient.post('/news', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-news'] }); onClose(); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setErr('Judul dan konten wajib diisi'); return; }
    mut.mutate({ ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : [] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-4xl my-8 overflow-hidden">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">{editItem ? 'Edit Berita' : 'Tambah Berita Baru'}</h2>
            <p className="text-[11px] font-semibold text-slate-500">Isi formulir untuk mempublikasikan artikel berita sekolah</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {err && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                {err}
              </div>
            )}

            {/* Judul & Thumbnail Header Grid */}
            <div className="grid sm:grid-cols-12 gap-5 items-start">
              <div className="sm:col-span-8">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Berita *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e=>set('title',e.target.value)}
                  placeholder="Masukkan judul berita utama..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Thumbnail Utama</label>
                {form.thumbnail ? (
                  <div className="flex items-center gap-3 bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100">
                    <img src={form.thumbnail} alt="thumb" className="w-16 h-12 rounded-xl object-cover border border-emerald-200 shadow-2xs"/>
                    <button type="button" onClick={()=>set('thumbnail','')} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                  </div>
                ) : (
                  <CustomImageUploader
                    label="Upload Thumbnail"
                    onUploadComplete={url => set('thumbnail', url)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Kategori</label>
                <select
                  value={form.category}
                  onChange={e=>set('category',e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                >
                  <option value="">Pilih Kategori</option>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Status Publikasi</label>
                <select
                  value={form.status}
                  onChange={e=>set('status',e.target.value as NS)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Publikasikan</option>
                  <option value="ARCHIVED">Arsip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tags (Dipisah Koma)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e=>set('tags',e.target.value)}
                  placeholder="osn, prestasi, kegiatan"
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Ringkasan Excerpt */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Ringkasan Berita (Excerpt)</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={e=>set('excerpt',e.target.value)}
                placeholder="Tulis ringkasan singkat berita..."
                className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"
              />
            </div>

            {/* Rich Text Editor dengan Tombol Upload Gambar Lengkap */}
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Konten Berita Lengkap *</label>
              <RichEditor
                value={form.content}
                onChange={v=>set('content',v)}
                placeholder="Tulis konten berita lengkap. Gunakan tombol 'Upload Gambar ke Konten' di toolbar untuk menambahkan foto ke dalam isi berita..."
                minHeight="320px"
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={mut.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs"
            >
              {mut.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
              {editItem ? 'Simpan Perubahan' : 'Buat Berita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBeritaPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem|null>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const qc = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin-news', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50', ...(search && { search }), ...(statusFilter && { status: statusFilter }) });
      const { data } = await apiClient.get(`/news?${params}`);
      return (data.data || []) as NewsItem[];
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/news/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-news'] }); setDeleteId(null); },
  });

  const counts = { all: list.length, pub: list.filter(n=>n.status==='PUBLISHED').length, draft: list.filter(n=>n.status==='DRAFT').length };

  return (
    <div className="space-y-6">
      {showForm && <NewsForm editItem={editItem} onClose={()=>{ setShowForm(false); setEditItem(null); }}/>}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Hapus Berita?</h3>
            <p className="text-sm text-gray-500 mb-5">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm">Batal</button>
              <button onClick={()=>deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold">
                {deleteMut.isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Berita</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{counts.pub} dipublikasikan · {counts.draft} draft</p>
        </div>
        <button onClick={()=>{ setEditItem(null); setShowForm(true); }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Tambah Berita Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-emerald-100 flex flex-col sm:flex-row gap-3 bg-emerald-50/40">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700"/>
            <input type="search" placeholder="Cari berita..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"/>
          </div>
          <div className="flex gap-1 bg-emerald-100/60 rounded-xl p-1">
            {[{v:'',l:`Semua (${counts.all})`},{v:'PUBLISHED',l:`Publik (${counts.pub})`},{v:'DRAFT',l:`Draft (${counts.draft})`}].map(f=>(
              <button key={f.v} onClick={()=>setStatusFilter(f.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter===f.v?'bg-white text-emerald-900 shadow-2xs':'text-slate-600 hover:text-emerald-800'}`}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30"/>
            <p className="text-xs font-semibold text-slate-500">Belum ada berita</p>
            <button onClick={()=>setShowForm(true)} className="mt-3 text-xs font-bold text-emerald-700 hover:underline">+ Buat berita pertama</button>
          </div>
        ) : (
          <div className="divide-y divide-emerald-50">
            {list.map(news=>(
              <div key={news.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                {news.thumbnail ? (
                  <img src={news.thumbnail} alt="" className="w-14 h-11 rounded-xl object-cover flex-shrink-0 border border-emerald-100 shadow-2xs"/>
                ) : (
                  <div className="w-14 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600"/>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 truncate leading-snug">{news.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-slate-500">
                    <span>{news.category||'—'}</span>
                    {news.publishedAt && <span>{formatDate(news.publishedAt,{day:'numeric',month:'short',year:'numeric'})}</span>}
                    <span className="flex items-center gap-0.5 text-emerald-700 font-bold"><Eye className="w-3 h-3"/> {news.viewCount}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex-shrink-0 ${news.status==='PUBLISHED'?'bg-emerald-100 text-emerald-800':news.status==='ARCHIVED'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-600'}`}>
                  {news.status==='PUBLISHED'?'Publik':news.status==='ARCHIVED'?'Arsip':'Draft'}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <a href={`/berita/${news.slug}`} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Eye className="w-4 h-4"/></a>
                  <button onClick={()=>{ setEditItem(news); setShowForm(true); }} className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={()=>setDeleteId(news.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
