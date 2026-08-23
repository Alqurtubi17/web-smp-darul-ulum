'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Trophy, Eye, Search, X, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';

import { contentService } from '@/lib/services/content.service';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'siswa' | 'guru' | 'sekolah';
  level: 'internasional' | 'nasional' | 'provinsi' | 'kota' | 'sekolah';
  year: number;
  winner: string;
  imageUrl?: string;
}

export default function AdminPrestasiPage() {
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Fetch live achievements from Express Backend PostgreSQL API
  useEffect(() => {
    const fetchAchievementsBackend = async () => {
      try {
        const res = await contentService.getAchievements();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: Achievement[] = res.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            category: (item.category || 'siswa') as any,
            level: (item.level || 'kota') as any,
            year: item.year || 2026,
            winner: item.winner || item.description || '-',
            imageUrl: item.photo || '',
          }));

          setAchievements(mapped);
        }
      } catch (err) {
        console.warn('Backend achievements fetch warning:', err);
      }
    };
    fetchAchievementsBackend();
  }, []);

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('semua');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [detailItem, setDetailItem] = useState<Achievement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    winner: '',
    description: '',
    category: 'siswa' as 'siswa' | 'guru' | 'sekolah',
    level: 'kota' as Achievement['level'],
    year: 2026,
    imageUrl: '',
  });

  const updateForm = (k: string, v: unknown) => setFormData((p) => ({ ...p, [k]: v }));

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      winner: '',
      description: '',
      category: 'siswa',
      level: 'kota',
      year: 2026,
      imageUrl: '',
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: Achievement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      winner: item.winner,
      description: item.description,
      category: item.category,
      level: item.level,
      year: item.year,
      imageUrl: item.imageUrl || '',
    });
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.winner.trim()) return;

    if (editingItem) {
      setAchievements((prev) =>
        prev.map((a) => (a.id === editingItem.id ? { ...a, ...formData } : a))
      );

      try {
        contentService.createAchievement({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          year: formData.year,
          winner: formData.winner,
          imageUrl: formData.imageUrl,
        }).catch((err) => console.warn('Update achievement backend warning:', err));
      } catch {
        // ignore
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Memperbarui Data Prestasi "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Pemenang: ${formData.winner}, Tingkat: ${formData.level}`,
      });

      toast.success('Prestasi Diperbarui', `Data prestasi "${formData.title}" berhasil disimpan.`);
    } else {
      const newItem: Achievement = {
        id: `ach-${Date.now()}`,
        ...formData,
      };

      setAchievements((prev) => [newItem, ...prev]);

      try {
        contentService.createAchievement({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          year: formData.year,
          winner: formData.winner,
          imageUrl: formData.imageUrl,
        }).catch((err) => console.warn('Create achievement backend warning:', err));
      } catch {
        // ignore
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menambahkan Prestasi Baru "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Pemenang: ${formData.winner}, Tingkat: ${formData.level}`,
      });

      toast.success('Prestasi Ditambahkan', `Prestasi baru "${formData.title}" berhasil dicatat.`);
    }

    setShowFormModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const target = achievements.find((a) => a.id === deletingId);
    setAchievements((prev) => prev.filter((a) => a.id !== deletingId));

    try {
      await contentService.deleteAchievement(deletingId, { title: target?.title });
    } catch (err) {
      console.warn('Backend delete achievement warning:', err);
    }

    if (target) {
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menghapus Data Prestasi "${target.title}"`,
        module: 'Pengguna',
        severity: 'DANGER',
        details: `ID Prestasi: ${target.id}`,
      });
    }

    toast.success('Prestasi Dihapus', 'Data prestasi berhasil dihapus secara permanen.');
    setDeletingId(null);
  };


  const filtered = achievements.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.winner.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'semua' || a.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Prestasi &amp; Penghargaan
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Catatan rekam jejak prestasi akademik &amp; non-akademik siswa, guru, dan institusi sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Prestasi Baru</span>
        </button>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kejuaraan, pemenang..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none cursor-pointer"
          >
            <option value="semua">Semua Tingkat Kejuaraan</option>
            <option value="internasional">Internasional</option>
            <option value="nasional">Nasional</option>
            <option value="provinsi">Provinsi</option>
            <option value="kota">Kota / Kabupaten</option>
            <option value="sekolah">Sekolah</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">JUDUL PRESTASI</th>
                <th className="px-5 py-3.5">PERAIH / PEMENANG</th>
                <th className="px-5 py-3.5">TINGKAT</th>
                <th className="px-5 py-3.5">TAHUN</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-amber-50 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Trophy className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-slate-800">{item.winner}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
                        {item.level}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-medium text-slate-700">{item.year}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit Prestasi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Prestasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada data prestasi yang sesuai.
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

      {/* Modal Detail */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Detail Prestasi</h3>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailItem.imageUrl && (
              <div className="w-full h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img src={detailItem.imageUrl} alt={detailItem.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase">
                Tingkat {detailItem.level} ({detailItem.year})
              </span>
              <h2 className="text-base font-black text-slate-900 pt-1">{detailItem.title}</h2>
              <p className="text-xs text-slate-600 font-bold">Pemenang: {detailItem.winner}</p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {detailItem.description}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingItem ? 'Edit Data Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Foto / Dokumentasi Piagam</label>
                <CustomImageUploader
                  value={formData.imageUrl}
                  onChange={(url) => updateForm('imageUrl', url)}
                  endpoint="newsImage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Kejuaraan / Prestasi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Juara 1 OSN Matematika..."
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Peraih / Pemenang</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmad Fauzi (Kelas 9A)"
                  value={formData.winner}
                  onChange={(e) => updateForm('winner', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="sekolah">Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tingkat</label>
                  <select
                    value={formData.level}
                    onChange={(e) => updateForm('level', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="internasional">Internasional</option>
                    <option value="nasional">Nasional</option>
                    <option value="provinsi">Provinsi</option>
                    <option value="kota">Kota / Kabupaten</option>
                    <option value="sekolah">Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateForm('year', parseInt(e.target.value, 10) || 2026)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi Prestasi</label>
                <textarea
                  rows={3}
                  placeholder="Keterangan singkat kejuaraan..."
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
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
                  {editingItem ? 'Simpan Pembaruan' : 'Tambah Prestasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-900 text-base">Hapus Data Prestasi?</h3>
            <p className="text-xs text-slate-600 font-medium">
              Apakah Anda yakin ingin menghapus catatan prestasi ini?
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
