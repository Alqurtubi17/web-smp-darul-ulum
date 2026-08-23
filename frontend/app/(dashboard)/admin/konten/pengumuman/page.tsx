'use client';

import { useState, useEffect } from 'react';
import { Plus, Pin, Edit2, Trash2, Bell, X, Eye, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/lib/services/content.service';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  targetRoles: string[];
  publishedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  viewCount: number;
}

const ROLES_LIST = ['SEMUA', 'SISWA', 'GURU', 'ORANG_TUA', 'ADMIN'];

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-kaldik-1',
    title: '[Libur Hari Besar] HUT Republik Indonesia ke-81',
    content: 'Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa kegiatan pembelajaran diliburkan dalam rangka HUT RI ke-81.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-10',
    expiresAt: '2026-08-17',
    isActive: true,
    viewCount: 720,
  },
  {
    id: 'ann-kaldik-2',
    title: '[Libur Hari Besar] Maulid Nabi Muhammad SAW 1448 H',
    content: 'Diberitahukan bahwa kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW 1448 H.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-08-25',
    isActive: true,
    viewCount: 540,
  },
  {
    id: 'ann-1',
    title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
    content: 'Penilaian Tengah Semester (PTS) Ganjil dilaksanakan mulai tanggal 5 s.d. 12 September 2026 bagi seluruh siswa kelas 7, 8, dan 9.',
    isPinned: true,
    targetRoles: ['SISWA', 'ORANG_TUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-09-12',
    isActive: true,
    viewCount: 680,
  },
  {
    id: 'ann-kaldik-3',
    title: '[Libur Semester 1] Libur Semester Ganjil T.A. 2026/2027',
    content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-12-15',
    expiresAt: '2026-12-31',
    isActive: true,
    viewCount: 890,
  },
  {
    id: 'ann-kaldik-4',
    title: '[Kegiatan Puasa] Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
    content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-02-01',
    expiresAt: '2027-02-10',
    isActive: true,
    viewCount: 430,
  },
  {
    id: 'ann-kaldik-5',
    title: '[Libur Hari Besar] Hari Raya Idul Fitri 1448 H',
    content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H dan Cuti Bersama berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-03-01',
    expiresAt: '2027-03-11',
    isActive: true,
    viewCount: 950,
  },
];

export default function AdminPengumumanPage() {
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);

  // Fetch live backend announcements from Express PostgreSQL API
  useEffect(() => {
    const fetchAnnouncementsBackend = async () => {
      try {
        const res = await contentService.getAnnouncements();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: AnnouncementItem[] = res.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            isPinned: item.isPinned || false,
            targetRoles: Array.isArray(item.targetRole) ? item.targetRole : [item.targetRole || 'SEMUA'],
            publishedAt: item.createdAt ? String(item.createdAt).split('T')[0] : '2026-08-01',
            expiresAt: item.expiresAt ? String(item.expiresAt).split('T')[0] : null,
            isActive: true,
            viewCount: 150,
          }));
          setAnnouncements(mapped);
        }
      } catch (err) {
        console.warn('Backend announcements load warning:', err);
      }
    };
    fetchAnnouncementsBackend();
  }, []);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    targetRoles: ['SEMUA'] as string[],
    expiresAt: '',
  });

  const updateForm = (k: string, v: unknown) => setFormData((p) => ({ ...p, [k]: v }));

  const toggleRole = (r: string) => {
    if (r === 'SEMUA') {
      setFormData((p) => ({ ...p, targetRoles: ['SEMUA'] }));
      return;
    }
    const current = formData.targetRoles.filter((x) => x !== 'SEMUA');
    if (current.includes(r)) {
      const next = current.filter((x) => x !== r);
      setFormData((p) => ({ ...p, targetRoles: next.length === 0 ? ['SEMUA'] : next }));
    } else {
      setFormData((p) => ({ ...p, targetRoles: [...current, r] }));
    }
  };

  const filtered = announcements.filter((a) => {
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      isPinned: false,
      targetRoles: ['SEMUA'],
      expiresAt: '',
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      isPinned: item.isPinned,
      targetRoles: item.targetRoles,
      expiresAt: item.expiresAt || '',
    });
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingItem) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingItem.id
            ? {
                ...a,
                title: formData.title,
                content: formData.content,
                isPinned: formData.isPinned,
                targetRoles: formData.targetRoles,
                expiresAt: formData.expiresAt || null,
              }
            : a
        )
      );

      try {
        await contentService.updateAnnouncement(editingItem.id, {
          title: formData.title,
          content: formData.content,
          isPinned: formData.isPinned,
          targetRole: formData.targetRoles[0] || 'SEMUA',
          expiresAt: formData.expiresAt || null,
        });
      } catch (err) {
        console.warn('Backend update announcement failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Mengubah Pengumuman "${formData.title}"`,
        module: 'Pengguna',
        severity: 'INFO',
        details: `Disunting oleh admin portal.`,
      });

      toast.success('Pengumuman Diperbarui', `Informasi "${formData.title}" berhasil disimpan.`);
    } else {
      const newAnn: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned,
        targetRoles: formData.targetRoles,
        publishedAt: new Date().toISOString().split('T')[0],
        expiresAt: formData.expiresAt || null,
        isActive: true,
        viewCount: 0,
      };

      setAnnouncements((prev) => [newAnn, ...prev]);

      try {
        await contentService.createAnnouncement({
          title: formData.title,
          content: formData.content,
          isPinned: formData.isPinned,
          targetRole: formData.targetRoles[0] || 'SEMUA',
          expiresAt: formData.expiresAt || null,
        });
      } catch (err) {
        console.warn('Backend create announcement failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Mempublikasikan Pengumuman Baru "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Pinned: ${formData.isPinned ? 'Ya' : 'Tidak'}, Sasaran: ${formData.targetRoles.join(', ')}`,
      });

      toast.success('Pengumuman Diterbitkan', `Informasi "${formData.title}" berhasil disiarkan.`);
    }

    setShowFormModal(false);
  };

  const handleTogglePin = async (item: AnnouncementItem) => {
    const nextState = !item.isPinned;
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, isPinned: nextState } : a))
    );

    try {
      await contentService.updateAnnouncement(item.id, { title: item.title, isPinned: nextState });
    } catch (err) {
      console.warn('Backend toggle pin failed:', err);
    }


    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `${nextState ? 'Menyematkan' : 'Melepas Sematan'} Pengumuman "${item.title}"`,
      module: 'Pengguna',
      severity: 'INFO',
      details: `Disematkan di posisi teratas pengumuman portal.`,
    });

    toast.info('Status Sematan Diubah', `Pengumuman "${item.title}" ${nextState ? 'disematkan di atas' : 'dilepas sematnya'}.`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    const target = announcements.find((a) => a.id === deletingId);

    setAnnouncements((prev) => prev.filter((a) => a.id !== deletingId));

    try {
      await contentService.deleteAnnouncement(deletingId);
    } catch (err) {
      console.warn('Backend delete announcement failed:', err);
    }

    if (target) {
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menghapus Pengumuman "${target.title}"`,
        module: 'Pengguna',
        severity: 'DANGER',
        details: `ID Pengumuman: ${target.id}`,
      });
    }

    toast.success('Pengumuman Dihapus', 'Catatan pengumuman berhasil dihapus.');
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengumuman Resmi Sekolah
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Siarkan pengumuman penting, jadwal PTS/PAS, serta edaran resmi untuk siswa, guru, dan orang tua.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm hover:shadow shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="relative max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Judul Pengumuman</th>
                <th className="py-3.5 px-4">Sasaran Roles</th>
                <th className="py-3.5 px-4">Tanggal Siar</th>
                <th className="py-3.5 px-4">Tenggat Expire</th>
                <th className="py-3.5 px-4 text-center">Pinned</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada pengumuman yang sesuai.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          {item.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                              <Pin className="w-3 h-3 fill-amber-500" /> Pinned
                            </span>
                          )}
                          <span className="font-bold text-slate-900 leading-snug line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                          {item.content}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.targetRoles.map((role) => (
                          <span
                            key={role}
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {formatDate(item.publishedAt)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {item.expiresAt ? formatDate(item.expiresAt) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePin(item)}
                        title={item.isPinned ? 'Lepas Sematan' : 'Sematkan Pengumuman'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          item.isPinned
                            ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(item);
                            setShowDetailModal(true);
                          }}
                          title="Lihat Detail"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Pengumuman"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          title="Hapus Pengumuman"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal (Add / Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jadwal Penilaian Akhir Semester (PAS)..."
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Isi / Deskripsi Pengumuman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan detail rincian informasi..."
                  value={formData.content}
                  onChange={(e) => updateForm('content', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Tenggat Expire (Opsional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => updateForm('expiresAt', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => updateForm('isPinned', e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Sematkan di Atas
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Sasaran Penerima (Roles)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES_LIST.map((role) => {
                    const active = formData.targetRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                          active
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Detail Pengumuman</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Judul Informasi
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {selectedAnnouncement.title}
                </h4>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Rincian Isi
                </span>
                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {selectedAnnouncement.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Tanggal Siar</span>
                  <span className="font-extrabold text-slate-800">
                    {formatDate(selectedAnnouncement.publishedAt)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block">Tenggat Expire</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedAnnouncement.expiresAt ? formatDate(selectedAnnouncement.expiresAt) : 'Tidak Ada'}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Hapus Catatan Pengumuman?</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Tindakan ini akan menghapus informasi dari portal pengumuman secara permanen.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
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
