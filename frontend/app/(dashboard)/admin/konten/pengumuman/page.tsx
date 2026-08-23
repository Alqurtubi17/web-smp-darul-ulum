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
    title: '[Pengumuman Resmi] Libur Hari Besar: HUT Republik Indonesia ke-81',
    content: 'Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa dalam rangka Peringatan Hari Ulang Tahun Kemerdekaan RI ke-81 pada 17 Agustus 2026, kegiatan pembelajaran diliburkan.',
    isPinned: true,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-10T08:00:00Z',
    expiresAt: '2026-08-17',
    isActive: true,
    viewCount: 720,
  },
  {
    id: 'ann-kaldik-2',
    title: '[Pengumuman Resmi] Libur Hari Besar: Maulid Nabi Muhammad SAW',
    content: 'Diberitahukan bahwa pada hari Selasa, 25 Agustus 2026, kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW 1448 H.',
    isPinned: true,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-20T08:00:00Z',
    expiresAt: '2026-08-25',
    isActive: true,
    viewCount: 540,
  },
  {
    id: 'ann-1',
    title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
    content: 'Diberitahukan kepada seluruh siswa kelas 7, 8, dan 9 bahwa Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan mulai tanggal 5 s.d. 12 September 2026. Harap mempersiapkan diri dan melunasi kewajiban administrasi.',
    isPinned: true,
    targetRoles: ['SISWA', 'ORANG_TUA'],
    publishedAt: '2026-08-20T08:00:00Z',
    expiresAt: '2026-09-12',
    isActive: true,
    viewCount: 680,
  },
  {
    id: 'ann-kaldik-3',
    title: '[Pengumuman Resmi] Libur Semester 1 (Ganjil) T.A. 2026/2027',
    content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026. Masuk kembali semester genap pada bulan Januari 2027.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-12-15T08:00:00Z',
    expiresAt: '2026-12-31',
    isActive: true,
    viewCount: 890,
  },
  {
    id: 'ann-kaldik-4',
    title: '[Pengumuman Resmi] Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
    content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa-siswi SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027 di kampus & Masjid Darul Ulum.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-02-01T08:00:00Z',
    expiresAt: '2027-02-10',
    isActive: true,
    viewCount: 430,
  },
  {
    id: 'ann-kaldik-5',
    title: '[Pengumuman Resmi] Libur Hari Raya Idul Fitri 1448 H',
    content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H dan cuti bersama berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
    isPinned: true,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-03-01T08:00:00Z',
    expiresAt: '2027-03-11',
    isActive: true,
    viewCount: 950,
  },
  {
    id: 'ann-2',
    title: 'Informasi Verifikasi Berkas & Daftar Ulang Siswa Baru PPDB',
    content: 'Wali murid calon siswa baru yang dinyatakan LULUS pada PPDB Gelombang 1 diwajibkan menyerahkan berkas fisik ke sekretariat PPDB paling lambat 28 Agustus 2026.',
    isPinned: false,
    targetRoles: ['ORANG_TUA'],
    publishedAt: '2026-08-15T09:00:00Z',
    expiresAt: '2026-08-28',
    isActive: true,
    viewCount: 410,
  },
];


export default function AdminPengumumanPage() {

  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);

  // Fetch live backend announcements
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
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [detailItem, setDetailItem] = useState<AnnouncementItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
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
        action: `Memperbarui Pengumuman "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Pinned: ${formData.isPinned ? 'Ya' : 'Tidak'}, Sasaran: ${formData.targetRoles.join(', ')}`,
      });

      toast.success('Pengumuman Diperbarui', `Informasi "${formData.title}" telah diperbarui.`);
    } else {
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        isPinned: formData.isPinned,
        targetRoles: formData.targetRoles,
        publishedAt: new Date().toISOString(),
        expiresAt: formData.expiresAt || null,
        isActive: true,
        viewCount: 0,
      };

      setAnnouncements((prev) => [newItem, ...prev]);

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
      await contentService.updateAnnouncement(item.id, { isPinned: nextState });
    } catch (err) {
      console.warn('Backend toggle pin failed:', err);
    }

    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `${nextState ? 'Sematkan' : 'Lepas Semat'} Pengumuman "${item.title}"`,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengumuman Resmi Sekolah
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-1">
            Siarkan pengumuman penting, jadwal PTS/PAS, serta edaran resmi untuk siswa, guru, dan orang tua.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
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
                <th className="px-5 py-3.5">JUDUL PENGUMUMAN</th>
                <th className="px-5 py-3.5">SASARAN ROLES</th>
                <th className="px-5 py-3.5">TANGGAL SIAR</th>
                <th className="px-5 py-3.5">TENGGAT EXPIRE</th>
                <th className="px-5 py-3.5 text-center">PINNED</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.content}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.targetRoles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-extrabold text-slate-700"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {formatDate(item.publishedAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                      {item.expiresAt ? item.expiresAt : '-'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleTogglePin(item)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                          item.isPinned
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                        }`}
                        title={item.isPinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
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
                          title="Edit Pengumuman"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Pengumuman"
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
                    Tidak ada pengumuman yang sesuai.
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Detail Pengumuman</h3>
              <button onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {detailItem.isPinned && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-black">
                    PINNED
                  </span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  Tgl Siar: {formatDate(detailItem.publishedAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">{detailItem.title}</h2>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {detailItem.content}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
              <span>Tenggat: <strong>{detailItem.expiresAt || 'Tidak Ada'}</strong></span>
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
                {editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="Judul informasi pengumuman..."
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Isi Pengumuman</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan pesan / edaran resmi di sini..."
                  value={formData.content}
                  onChange={(e) => updateForm('content', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Sasaran Penerima Pengumuman</label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES_LIST.map((r) => {
                    const active = formData.targetRoles.includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRole(r)}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tenggat Kadaluarsa</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => updateForm('expiresAt', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => updateForm('isPinned', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Sematkan di Atas (Pinned)</span>
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
                  {editingItem ? 'Simpan Pembaruan' : 'Siarkan Pengumuman'}
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
            <h3 className="font-extrabold text-slate-900 text-base">Hapus Pengumuman?</h3>
            <p className="text-xs text-slate-600 font-medium">
              Apakah Anda yakin ingin menghapus pengumuman ini?
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
