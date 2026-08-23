'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video, X, Eye, Search, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { contentService } from '@/lib/services/content.service';

interface AlbumItem {
  id: string;
  url: string;
  caption: string;
}

interface Album {
  id: string;
  title: string;
  description: string;
  cover: string;
  type: 'FOTO' | 'VIDEO';
  isPublic: boolean;
  createdAt: string;
  items: AlbumItem[];
}

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'alb-1',
    title: 'Dokumentasi Wisuda & Pelepasan Siswa Kelas 9',
    description: 'Dokumentasi prosesi purnawiyata dan pelepasan kelulusan siswa kelas 9 T.A. 2024/2025.',
    cover: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    type: 'FOTO',
    isPublic: true,
    createdAt: '2026-06-20T08:00:00Z',
    items: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80', caption: 'Prosesi Penyerahan Ijazah' },
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80', caption: 'Foto Bersama Dewan Guru & Kepala Sekolah' },
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80', caption: 'Pentas Seni Perpisahan' },
    ],
  },
  {
    id: 'alb-2',
    title: 'Kegiatan Pondok Ramadhan & Pesantren Kilat',
    description: 'Dokumentasi kajian keagamaan, tadarus Al-Qur’an, dan bakti sosial siswa.',
    cover: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    type: 'FOTO',
    isPublic: true,
    createdAt: '2026-03-25T08:00:00Z',
    items: [
      { id: 'img-4', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80', caption: 'Tadarus Bersama di Masjid Sekolah' },
      { id: 'img-5', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80', caption: 'Penyerahan Zakat & Sembako' },
    ],
  },
  {
    id: 'alb-3',
    title: 'Upacara HUT Kemerdekaan RI ke-81 & Pawai Adat',
    description: 'Liputan foto dan video upacara bendera 17 Agustus 2026.',
    cover: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80',
    type: 'FOTO',
    isPublic: true,
    createdAt: '2026-08-17T08:00:00Z',
    items: [
      { id: 'img-6', url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80', caption: 'Pengibaran Bendera Merah Putih oleh Paskibra' },
    ],
  },
];

export default function AdminGaleriPage() {

  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [albums, setAlbums] = useState<Album[]>([]);

  // Fetch live backend albums
  useEffect(() => {
    const fetchAlbumsBackend = async () => {
      try {
        const res = await contentService.getAlbums();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: Album[] = res.data.map((alb: any) => ({
            id: alb.id,
            title: alb.title,
            description: alb.description || alb.title,
            cover: alb.coverUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
            type: 'FOTO',
            isPublic: true,
            createdAt: alb.createdAt ? String(alb.createdAt).split('T')[0] : '2026-08-01',
            items: Array.isArray(alb.items) ? alb.items.map((i: any) => ({ id: i.id, url: i.imageUrl, caption: i.caption || 'Foto' })) : [],
          }));
          setAlbums(mapped);
        }
      } catch (err) {

        console.warn('Backend gallery load warning:', err);
      }

    };

    fetchAlbumsBackend();
  }, []);


  const [search, setSearch] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FOTO' as 'FOTO' | 'VIDEO',
    isPublic: true,
    cover: '',
  });

  const updateForm = (k: string, v: unknown) => setFormData((p) => ({ ...p, [k]: v }));

  const handleOpenAdd = () => {
    setEditingAlbum(null);
    setFormData({
      title: '',
      description: '',
      type: 'FOTO',
      isPublic: true,
      cover: '',
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      description: album.description,
      type: album.type,
      isPublic: album.isPublic,
      cover: album.cover,
    });
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingAlbum) {
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === editingAlbum.id
            ? {
                ...a,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                isPublic: formData.isPublic,
                cover: formData.cover || a.cover,
              }
            : a
        )
      );

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Memperbarui Album Galeri "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Tipe: ${formData.type}, Publik: ${formData.isPublic ? 'Ya' : 'Tidak'}`,
      });

      toast.success('Album Diperbarui', `Album galeri "${formData.title}" telah diperbarui.`);
    } else {
      const newAlbum: Album = {
        id: `alb-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        cover: formData.cover || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
        type: formData.type,
        isPublic: formData.isPublic,
        createdAt: new Date().toISOString(),
        items: [],
      };

      setAlbums((prev) => [newAlbum, ...prev]);

      try {
        await contentService.createAlbum({
          title: formData.title,
          description: formData.description,
          coverUrl: formData.cover,
        });
      } catch (err) {
        console.warn('Backend create album failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Membuat Album Galeri Baru "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Tipe: ${formData.type}, Publik: ${formData.isPublic ? 'Ya' : 'Tidak'}`,
      });

      toast.success('Album Ditambahkan', `Album baru "${formData.title}" berhasil dibuat.`);
    }

    setShowFormModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const target = albums.find((a) => a.id === deletingId);
    setAlbums((prev) => prev.filter((a) => a.id !== deletingId));

    try {
      await contentService.deleteAlbum(deletingId);
    } catch (err) {
      console.warn('Backend delete album failed:', err);
    }

    if (target) {
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menghapus Album Galeri "${target.title}"`,
        module: 'Pengguna',
        severity: 'DANGER',
        details: `ID Album: ${target.id}`,
      });
    }

    toast.success('Album Dihapus', 'Album galeri berhasil dihapus dari portal.');
    setDeletingId(null);
  };

  const filtered = albums.filter((a) => {
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Galeri Foto &amp; Dokumentasi
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola album foto kegiatan sekolah, dokumentasi wisuda, serta galeri momen prestasi.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Album Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari album foto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">ALBUM &amp; SAMPUL</th>
                <th className="px-5 py-3.5">TIPE</th>
                <th className="px-5 py-3.5">JUMLAH FOTO</th>
                <th className="px-5 py-3.5">TANGGAL DIBUAT</th>
                <th className="px-5 py-3.5">AKSES</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((alb) => (
                  <tr key={alb.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img src={alb.cover} alt={alb.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{alb.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{alb.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                        {alb.type === 'VIDEO' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {alb.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-800">
                      {alb.items.length} Berkas
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {formatDate(alb.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          alb.isPublic
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {alb.isPublic ? 'Publik' : 'Privat'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedAlbum(alb)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Lihat Berkas Foto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(alb)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Album"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(alb.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada album yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl text-xs font-semibold text-slate-500">
          <p>
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Berkas Foto */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedAlbum.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedAlbum.description}</p>
              </div>
              <button onClick={() => setSelectedAlbum(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedAlbum.items.length > 0 ? (
                selectedAlbum.items.map((item) => (
                  <div key={item.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group space-y-1 p-1">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200">
                      <img src={item.url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 px-1 py-1 line-clamp-1">{item.caption}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
                  Belum ada foto yang diunggah ke album ini.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedAlbum(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingAlbum ? 'Edit Album' : 'Tambah Album Foto Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Foto Sampul (Cover)</label>
                <CustomImageUploader
                  value={formData.cover}
                  onChange={(url) => updateForm('cover', url)}
                  endpoint="newsImage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Album</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dokumentasi Wisuda Kelas 9..."
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi Album</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan mengenai dokumentasi album ini..."
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipe Media</label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateForm('type', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="FOTO">Foto Galeri</option>
                    <option value="VIDEO">Video Dokumentasi</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => updateForm('isPublic', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Tampilkan Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingAlbum ? 'Simpan Pembaruan' : 'Buat Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Album */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-900 text-base">Hapus Album Galeri?</h3>
            <p className="text-xs text-slate-600 font-medium">
              Apakah Anda yakin ingin menghapus album ini beserta seluruh foto di dalamnya?
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
