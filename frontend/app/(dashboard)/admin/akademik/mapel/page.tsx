'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit3, Trash2, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { useToastStore, toast } from '@/store/toast.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { useAuth } from '@/hooks/useAuth';

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  grade?: number | null;
  creditHours: number;
  description?: string | null;
  isActive: boolean;
}

export default function AdminMapelPage() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState<string>('ALL');
  const [formHours, setFormHours] = useState(2);
  const [formDesc, setFormDesc] = useState('');

  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin';

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await contentService.getSubjects();
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setSubjects(data);
      }
    } catch (err) {
      console.warn('Gagal memuat data mata pelajaran:', err);
      toast.error('Gagal Memuat Data', 'Tidak dapat mengambil daftar mata pelajaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormCode('');
    setFormName('');
    setFormGrade('ALL');
    setFormHours(2);
    setFormDesc('');
    setShowAddModal(true);
  };

  const openEditModal = (s: SubjectItem) => {
    setEditingSubject(s);
    setFormCode(s.code);
    setFormName(s.name);
    setFormGrade(s.grade ? String(s.grade) : 'ALL');
    setFormHours(s.creditHours || 2);
    setFormDesc(s.description || '');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      toast.error('Validasi Gagal', 'Kode dan nama mata pelajaran wajib diisi.');
      return;
    }

    try {
      const payload = {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        grade: formGrade === 'ALL' ? null : Number(formGrade),
        creditHours: Number(formHours),
        description: formDesc.trim() || null,
      };

      if (editingSubject) {
        await contentService.updateSubject(editingSubject.id, payload);
        toast.success('Mapel Diperbarui!', `Mata Pelajaran ${formName.trim()} berhasil disimpan.`);
        addLog({
          user: actorName,
          role: 'ADMIN',
          action: `Memperbarui Mata Pelajaran "${formName.trim()}" (${formCode.trim().toUpperCase()})`,
          module: 'Pengaturan',
          severity: 'SUCCESS',
        });
      } else {
        await contentService.createSubject(payload);
        toast.success('Mapel Ditambahkan!', `Mata Pelajaran ${formName.trim()} berhasil dibuat.`);
        addLog({
          user: actorName,
          role: 'ADMIN',
          action: `Menambahkan Mata Pelajaran baru "${formName.trim()}" (${formCode.trim().toUpperCase()})`,
          module: 'Pengaturan',
          severity: 'SUCCESS',
        });
      }

      setShowAddModal(false);
      fetchSubjects();
    } catch (err: any) {
      console.error('Error saving subject:', err);
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data mata pelajaran.';
      toast.error('Gagal Menyimpan', msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus mata pelajaran ${name}?`)) return;
    try {
      await contentService.deleteSubject(id);
      toast.success('Mapel Dihapus', `Mata Pelajaran ${name} telah dihapus.`);
      fetchSubjects();
    } catch {
      toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus mata pelajaran.');
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const matchesGrade = selectedGrade === 'ALL' || s.grade === selectedGrade || !s.grade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Manajemen Mata Pelajaran (Mapel)
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola daftar mata pelajaran kurikulum nasional &amp; muatan lokal keislaman
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubjects}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Mata Pelajaran</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{subjects.length}</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Mata pelajaran terdaftar</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Mapel Muatan Lokal / Ke-NU-an</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {subjects.filter((s) => ['PAI', 'ARB', 'THF'].includes(s.code)).length}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Pendidikan Agama &amp; Tahfidz</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Mapel Umum &amp; Sains</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {subjects.filter((s) => ['MTK', 'IPA', 'IPS', 'BIN', 'BING', 'TIK'].includes(s.code)).length}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Sains, IT &amp; Bahasa</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Beban Jam / SKS</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {subjects.reduce((acc, s) => acc + (s.creditHours || 2), 0)} Jam
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Jam tatap muka per minggu</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto">
          {[
            { label: 'Semua Tingkat', value: 'ALL' },
            { label: 'Kelas 7', value: 7 },
            { label: 'Kelas 8', value: 8 },
            { label: 'Kelas 9', value: 9 },
          ].map((t) => (
            <button
              key={String(t.value)}
              onClick={() => setSelectedGrade(t.value as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === t.value
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">KODE</th>
                <th className="px-5 py-3.5">NAMA MATA PELAJARAN</th>
                <th className="px-5 py-3.5">PERUNTUKAN TINGKAT</th>
                <th className="px-5 py-3.5">BEBAN JAM</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                    Memuat daftar mata pelajaran...
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-500 font-medium">
                    Tidak ada mata pelajaran yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-black text-xs">
                        {s.code}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-extrabold text-slate-900 text-xs">{s.name}</p>
                      {s.description && (
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">{s.description}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs font-bold text-slate-700">
                      {s.grade ? `Kelas ${s.grade}` : 'Semua Tingkat (7, 8, 9)'}
                    </td>

                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.creditHours || 2} Jam / Minggu
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> AKTIF
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Mapel
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Mapel"
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
      </div>

      {/* Modal Form Mata Pelajaran */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingSubject ? `Edit Mata Pelajaran "${editingSubject.name}"` : 'Tambah Mata Pelajaran Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Mapel (misal: MTK)</label>
                  <input
                    type="text"
                    required
                    placeholder="MTK"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Beban Jam / Minggu</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formHours}
                    onChange={(e) => setFormHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peruntukan Tingkat</label>
                <select
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Tingkat (Kelas 7, 8, &amp; 9)</option>
                  <option value="7">Khusus Kelas 7</option>
                  <option value="8">Khusus Kelas 8</option>
                  <option value="9">Khusus Kelas 9</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Kurikulum</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan mengenai kelompok mata pelajaran..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
