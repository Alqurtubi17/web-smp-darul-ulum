'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Image as ImageIcon, Video, X, Loader2, Upload } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { formatDate } from '@/lib/utils';

interface Album { id: string; title: string; description: string | null; cover: string | null; type: 'FOTO' | 'VIDEO'; isPublic: boolean; createdAt: string; _count: { items: number }; }
interface AlbumItem { id: string; url: string; caption: string | null; order: number; }

const DEF_ALBUM = { title: '', description: '', type: 'FOTO' as 'FOTO' | 'VIDEO', isPublic: true };

export default function AdminGaleriPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [form, setForm] = useState(DEF_ALBUM);
  const [coverUrl, setCoverUrl] = useState('');
  const [err, setErr] = useState('');
  const qc = useQueryClient();
  const set = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => { const { data } = await apiClient.get('/gallery?limit=50'); return (data.data || []) as Album[]; },
  });

  const { data: items = [] } = useQuery({
    queryKey: ['gallery-items', selectedAlbum?.id],
    queryFn: async () => { const { data } = await apiClient.get(`/gallery/${selectedAlbum!.id}`); return (data.data?.items || []) as AlbumItem[]; },
    enabled: !!selectedAlbum,
  });

  const createAlbum = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/gallery', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); setShowForm(false); setForm(DEF_ALBUM); setCoverUrl(''); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const addItems = useMutation({
    mutationFn: ({ albumId, urls }: { albumId: string; urls: string[] }) => apiClient.post(`/gallery/${albumId}/items`, { urls }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gallery-items', selectedAlbum?.id] }); qc.invalidateQueries({ queryKey: ['admin-gallery'] }); },
  });

  const deleteAlbum = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/gallery/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); setSelectedAlbum(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Judul album wajib diisi'); return; }
    createAlbum.mutate({ ...form, coverUrl: coverUrl || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Create Album Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Buat Album Galeri Baru</h2>
                <p className="text-[11px] font-semibold text-slate-500">Kelompokkan foto kegiatan sekolah</p>
              </div>
              <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Judul Album *</label>
                  <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="cth: Wisuda Kelas 9 T.A. 2024/2025"
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Deskripsi Album</label>
                  <textarea rows={2} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Deskripsi singkat mengenai album foto..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tipe Album</label>
                    <select value={form.type} onChange={e=>set('type',e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
                      <option value="FOTO">Album Foto Dokumentasi</option>
                      <option value="VIDEO">Album Video Kegiatan</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isPublic} onChange={e=>set('isPublic',e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600"/>
                      <span className="text-xs font-bold text-slate-800">Tampilkan di Publik</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Sampul Cover Album</label>
                  {coverUrl ? (
                    <div className="flex items-center gap-3 bg-emerald-50/60 p-2 rounded-2xl border border-emerald-100">
                      <img src={coverUrl} alt="cover" className="w-16 h-12 rounded-xl object-cover border border-emerald-200 shadow-2xs"/>
                      <button type="button" onClick={()=>setCoverUrl('')} className="text-xs font-bold text-rose-600 hover:underline">Hapus</button>
                    </div>
                  ) : (
                    <CustomImageUploader
                      label="Upload Sampul Cover"
                      onUploadComplete={url => setCoverUrl(url)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
                <button type="button" onClick={()=>setShowForm(false)} className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50">Batal</button>
                <button type="submit" disabled={createAlbum.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs">
                  {createAlbum.isPending && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Buat Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Album Detail Item Drawer/Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">{selectedAlbum.title}</h2>
                <p className="text-xs text-slate-500 font-semibold">{items.length} Foto Dokumentasi</p>
              </div>
              <button onClick={()=>setSelectedAlbum(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
            </div>

            {/* Custom File Uploader for Album Items */}
            <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold text-slate-800">Tambah Foto ke Album Ini</p>
                <p className="text-[11px] text-slate-500 font-medium">Unggah foto dokumentasi baru secara instan</p>
              </div>
              <CustomImageUploader
                label="Tambah Foto Baru"
                onUploadComplete={(url) => {
                  addItems.mutate({ albumId: selectedAlbum.id, urls: [url] });
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer shrink-0"
              />
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Upload className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600"/>
                  <p className="text-xs font-semibold text-slate-500">Belum ada foto di album ini</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {items.map(item => (
                    <div key={item.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-emerald-100 shadow-2xs">
                      <img src={item.url} alt={item.caption||''} className="w-full h-full object-cover group-hover:scale-105 transition-transform"/>
                      <button onClick={()=>apiClient.delete(`/gallery/items/${item.id}`).then(()=>qc.invalidateQueries({ queryKey: ['gallery-items',selectedAlbum.id] }))}
                        className="absolute top-2 right-2 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-extrabold shadow-md">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Galeri Sekolah</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{albums.length} album terpublikasi</p>
        </div>
        <button onClick={()=>setShowForm(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
          <Plus className="w-4 h-4"/> Buat Album Baru
        </button>
      </div>

      {/* Albums Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30"/>
          <p className="text-xs font-semibold text-slate-500">Belum ada album galeri</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map(album => (
            <div key={album.id} className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all group">
              <div className="h-44 bg-emerald-50 relative overflow-hidden cursor-pointer" onClick={()=>setSelectedAlbum(album)}>
                {album.cover ? (
                  <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {album.type === 'FOTO' ? <ImageIcon className="w-10 h-10 text-emerald-300"/> : <Video className="w-10 h-10 text-emerald-300"/>}
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-extrabold bg-emerald-600/90 px-3.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-105 shadow-md">Kelola Foto →</span>
                </div>
                <span className="absolute top-3 right-3 text-[10px] font-extrabold bg-slate-900/80 text-white px-2.5 py-1 rounded-full shadow-2xs">
                  {album._count.items} Foto
                </span>
              </div>
              <div className="p-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{album.title}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">{formatDate(album.createdAt,{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
                <button onClick={()=>deleteAlbum.mutate(album.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl flex-shrink-0 transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
