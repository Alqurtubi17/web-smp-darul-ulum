'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, UserCheck, Users, Search, Edit3, Trash2, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { contentService } from '@/lib/services/content.service';
import { useToastStore, toast } from '@/store/toast.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { useAuth } from '@/hooks/useAuth';

interface TeacherItem {
  id: string;
  fullName: string;
  nip?: string;
  subject?: string;
}

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  capacity: number;
  academicYear: string;
  homeroomTeacherId?: string | null;
  homeroomTeacher?: TeacherItem | null;
  studentCount?: number;
  isActive: boolean;
}

export default function AdminKelasPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'ALL'>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formGrade, setFormGrade] = useState(7);
  const [formCapacity, setFormCapacity] = useState(32);
  const [formTeacherId, setFormTeacherId] = useState('');

  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await contentService.getClasses();
      const data = res?.data || res;
      if (data) {
        setClasses(data.classes || []);
        setTeachers(data.teachers || []);
      }
    } catch (err) {
      console.warn('Gagal memuat data kelas:', err);
      toast.error('Gagal Memuat Data', 'Tidak dapat mengambil daftar kelas dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setFormName('');
    setFormGrade(7);
    setFormCapacity(32);
    setFormTeacherId('');
    setShowAddModal(true);
  };

  const openEditModal = (c: ClassItem) => {
    setEditingClass(c);
    setFormName(c.name);
    setFormGrade(c.grade);
    setFormCapacity(c.capacity || 32);
    setFormTeacherId(c.homeroomTeacherId || '');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Validasi Gagal', 'Nama kelas wajib diisi.');
      return;
    }

    try {
      if (editingClass) {
        await contentService.updateClass(editingClass.id, {
          name: formName.trim(),
          grade: Number(formGrade),
          capacity: Number(formCapacity),
          homeroomTeacherId: formTeacherId || null,
        });
        toast.success('Kelas Diperbarui!', `Data kelas ${formName.trim()} dan Wali Kelas berhasil disimpan.`);
        addLog({
          user: actorName,
          role: 'ADMIN',
          action: `Memperbarui kelas & Wali Kelas "${formName.trim()}"`,
          module: 'Pengaturan',
          severity: 'SUCCESS',
          details: `Mengubah konfigurasi kelas ${formName.trim()} dan menetapkan Wali Kelas.`,
        });
      } else {
        await contentService.createClass({
          name: formName.trim(),
          grade: Number(formGrade),
          capacity: Number(formCapacity),
          homeroomTeacherId: formTeacherId || null,
        });
        toast.success('Kelas Dibuat!', `Kelas ${formName.trim()} berhasil ditambahkan.`);
        addLog({
          user: actorName,
          role: 'ADMIN',
          action: `Membuat kelas baru "${formName.trim()}"`,
          module: 'Pengaturan',
          severity: 'SUCCESS',
          details: `Menambahkan rombongan belajar baru ${formName.trim()}.`,
        });
      }
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving class:', err);
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data kelas.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kelas ${name}?`)) return;
    try {
      await contentService.deleteClass(id);
      toast.success('Kelas Dihapus', `Kelas ${name} telah dihapus.`);
      fetchData();
    } catch {
      toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus kelas.');
    }
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.homeroomTeacher?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'ALL' || c.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" /> Manajemen Kelas &amp; Wali Kelas
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola rombongan belajar dan tetapkan Guru Pengampu Wali Kelas untuk setiap rombel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Rombel Kelas
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Rombel Kelas</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{classes.length}</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Rombongan belajar aktif</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Wali Kelas Terisi</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {classes.filter((c) => Boolean(c.homeroomTeacherId)).length} / {classes.length}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Telah ditetapkan guru pengampu</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Kapasitas Siswa</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {classes.reduce((acc, c) => acc + (c.capacity || 32), 0)}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Kapasitas ruang belajar</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Guru Siap Pengampu</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{teachers.length}</div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Tenaga pendidik terdaftar</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kelas atau nama Wali Kelas..."
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
                <th className="px-5 py-3.5">NAMA KELAS</th>
                <th className="px-5 py-3.5">TINGKAT</th>
                <th className="px-5 py-3.5">GURU WALI KELAS (PENGAMPU)</th>
                <th className="px-5 py-3.5">JUMLAH SISWA</th>
                <th className="px-5 py-3.5">KAPASITAS</th>
                <th className="px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                    Memuat daftar kelas...
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-500 font-medium">
                    Tidak ada rombongan belajar kelas yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-200/80">
                          {c.name}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">T.A. {c.academicYear || '2024/2025'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-bold text-slate-700">
                      Kelas {c.grade}
                    </td>

                    <td className="px-5 py-3.5">
                      {c.homeroomTeacher ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                            {c.homeroomTeacher.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-tight">{c.homeroomTeacher.fullName}</p>
                            <p className="text-[10px] text-emerald-700 font-semibold">{c.homeroomTeacher.subject || 'Wali Kelas'}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          Belum Ditetapkan
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {c.studentCount || 0} Siswa
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-xs font-medium text-slate-600">
                      {c.capacity || 32} Kursi
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(c)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Wali Kelas
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Kelas"
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

      {/* Modal Form Kelas & Wali Kelas */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingClass ? `Edit Rombel Kelas ${editingClass.name}` : 'Tambah Rombel Kelas Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas (misal: 7A, 8B, 9C)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 7A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={7}>Kelas 7</option>
                    <option value={8}>Kelas 8</option>
                    <option value={9}>Kelas 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas Kursi</label>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Wali Kelas (Pengampu)</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Guru Wali Kelas --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.subject || 'Guru'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 font-normal">
                  Pilih guru pendidik untuk menjadi pengampu Wali Kelas.
                </p>
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
                  Simpan Data Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
