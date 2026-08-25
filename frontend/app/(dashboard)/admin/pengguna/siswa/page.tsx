'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Users, Download, Upload, ArrowRightLeft,
  X, Eye, FileSpreadsheet, AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { Pagination } from '@/components/ui/Pagination';
import {
  StudentExcelRow, exportSiswaExcel, downloadSiswaTemplate, parseExcelFile
} from '@/lib/user-excel';
import { useAcademicYearStore } from '@/store/academic-year.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/lib/services/user.service';

interface Student extends StudentExcelRow {
  id: string;
}

const INITIAL_STUDENTS: Student[] = [
  { id: '1', nis: '2023001', nisn: '0081234567', name: 'Ahmad Fauzi', class: '9A', gender: 'L', parentPhone: '081234567890', address: 'Jl. Wonokromo No. 12', status: true, photoUrl: '' },
  { id: '2', nis: '2023002', nisn: '0081234568', name: 'Siti Nurhaliza', class: '9A', gender: 'P', parentPhone: '081234567891', address: 'Jl. Rungkut Asri No. 5', status: true, photoUrl: '' },
  { id: '3', nis: '2023003', nisn: '0081234569', name: 'Muhammad Rizky', class: '9B', gender: 'L', parentPhone: '081234567892', address: 'Jl. Sepanjang No. 88', status: true, photoUrl: '' },
  { id: '4', nis: '2024001', nisn: '0091234570', name: 'Dewi Anjani', class: '8A', gender: 'P', parentPhone: '081234567893', address: 'Jl. Jemursari No. 34', status: true, photoUrl: '' },
  { id: '5', nis: '2024002', nisn: '0091234571', name: 'Budi Santoso', class: '8A', gender: 'L', parentPhone: '081234567894', address: 'Jl. Ngagel No. 15', status: true, photoUrl: '' },
  { id: '6', nis: '2024003', nisn: '0091234572', name: 'Fatimah Az-Zahra', class: '8B', gender: 'P', parentPhone: '081234567895', address: 'Jl. Darmo No. 100', status: true, photoUrl: '' },
  { id: '7', nis: '2025001', nisn: '0101234573', name: 'Ali Zainal Abidin', class: '7A', gender: 'L', parentPhone: '081234567896', address: 'Jl. Krukah No. 3', status: true, photoUrl: '' },
  { id: '8', nis: '2025002', nisn: '0101234574', name: 'Zahra Khairunnisa', class: '7B', gender: 'P', parentPhone: '081234567897', address: 'Jl. Menanggal No. 22', status: true, photoUrl: '' },
];

const ITEMS_PER_PAGE = 6;


export default function AdminSiswaPage() {
  const { activeYear } = useAcademicYearStore();
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  // Fetch live backend students
  useEffect(() => {
    const fetchStudentsBackend = async () => {
      try {
        const res = await userService.getStudents();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: Student[] = res.data.map((s: any) => ({
            id: s.id,
            nis: s.nis || '2025' + String(s.id).slice(-3),
            nisn: s.nisn || '010' + String(s.id).slice(-7),
            name: s.fullName || s.name,
            class: s.class?.name || '7A',
            gender: s.gender === 'PEREMPUAN' ? 'P' : 'L',
            parentPhone: s.parentPhone || '-',
            address: s.address || '-',
            status: true,
            photoUrl: s.photoUrl || '',
          }));
          setStudents(mapped);
        }

      } catch (err) {
        console.warn('Backend students load warning:', err);
      }

    };

    fetchStudentsBackend();
  }, []);


  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMoveClassModal, setShowMoveClassModal] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    fullName: '', nis: '', nisn: '', class: '7A', gender: 'L' as 'L' | 'P', parentPhone: '', address: '', photoUrl: '',
  });

  const [targetMoveClass, setTargetMoveClass] = useState('8A');

  // Excel import state
  const [importedRows, setImportedRows] = useState<StudentExcelRow[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  // Metrics
  const totalStudents = students.length;

  // Filtered List
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchClass = filterClass === 'SEMUA' || s.class === filterClass;
      const q = search.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.nis.includes(q) ||
        s.nisn.includes(q) ||
        s.class.toLowerCase().includes(q);
      return matchClass && matchSearch;
    });
  }, [students, filterClass, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const update = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  // Checkbox handlers
  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginated.map((s) => s.id) : []);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Open Handlers
  const handleOpenForm = (student?: Student) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        fullName: student.name,
        nis: student.nis,
        nisn: student.nisn,
        class: student.class,
        gender: student.gender,
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        photoUrl: student.photoUrl || '',
      });
    } else {
      setSelectedStudent(null);
      setFormData({
        fullName: '', nis: '', nisn: '', class: '7A', gender: 'L', parentPhone: '', address: '', photoUrl: '',
      });
    }
    setShowAddEditForm(true);
  };

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  // Save Siswa
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.nis) return;

    if (selectedStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id
            ? {
                ...s,
                name: formData.fullName,
                nis: formData.nis,
                nisn: formData.nisn,
                class: formData.class,
                gender: formData.gender,
                parentPhone: formData.parentPhone,
                address: formData.address,
                photoUrl: formData.photoUrl,
              }
            : s
        )
      );
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Memperbarui data siswa "${formData.fullName}" (NIS: ${formData.nis})`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Kelas: ${formData.class}, Gender: ${formData.gender}, No HP Ortu: ${formData.parentPhone}.`,
      });
      toast.success('Data Berhasil Diperbarui', `Profil siswa ${formData.fullName} telah disimpan.`);
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        nis: formData.nis,
        nisn: formData.nisn,
        name: formData.fullName,
        class: formData.class,
        gender: formData.gender,
        parentPhone: formData.parentPhone,
        address: formData.address,
        status: true,
        photoUrl: formData.photoUrl,
      };

      setStudents((prev) => [newStudent, ...prev]);

      try {
        await userService.createStudent({
          fullName: formData.fullName,
          nis: formData.nis,
          nisn: formData.nisn,
          gender: formData.gender === 'P' ? 'PEREMPUAN' : 'LAKI_LAKI',
          parentPhone: formData.parentPhone,
          address: formData.address,
        });
      } catch (err) {
        console.warn('Backend create student failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menambah siswa baru "${formData.fullName}" (NIS: ${formData.nis})`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Mendaftarkan siswa baru ke kelas ${formData.class}.`,
      });
      toast.success('Siswa Baru Ditambahkan', `${formData.fullName} berhasil didaftarkan.`);
    }
    setShowAddEditForm(false);
  };

  // Delete Siswa
  const handleConfirmDelete = () => {
    if (!selectedStudent) return;
    setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Menghapus data siswa "${selectedStudent.name}" (NIS: ${selectedStudent.nis})`,
      module: 'Pengguna',
      severity: 'WARNING',
      details: `Penghapusan data siswa dari kelas ${selectedStudent.class}.`,
    });
    toast.warning('Data Siswa Dihapus', `${selectedStudent.name} telah dihapus dari direktori.`);
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  // Pindah Kelas Masal
  const handleConfirmMoveClass = () => {
    if (selectedIds.length === 0) return;
    setStudents((prev) =>
      prev.map((s) => (selectedIds.includes(s.id) ? { ...s, class: targetMoveClass } : s))
    );
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Memindahkan ${selectedIds.length} siswa ke kelas ${targetMoveClass}`,
      module: 'Pengguna',
      severity: 'SUCCESS',
      details: `Kenaikan / pemindahan kelas masal ke ${targetMoveClass}.`,
    });
    toast.success('Pindah Kelas Berhasil', `${selectedIds.length} siswa berhasil dipindahkan ke kelas ${targetMoveClass}.`);
    setShowMoveClassModal(false);
    setSelectedIds([]);
  };

  // Export Excel
  const handleExportExcel = () => {
    exportSiswaExcel(filtered, `Data_Siswa_SMP_Darul_Ulum_${filterClass}.xlsx`);
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengekspor ${filtered.length} data siswa ke file Excel`,
      module: 'Pengguna',
      severity: 'INFO',
      details: `Berkas Excel Data_Siswa_SMP_Darul_Ulum_${filterClass}.xlsx didownload.`,
    });
    toast.info('Export Excel Dimulai', `Mengunduh ${filtered.length} data siswa ke file Excel.`);
  };

  // Excel Upload Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setIsParsingExcel(true);
    try {
      const rawData = await parseExcelFile<any>(file);
      const parsed: StudentExcelRow[] = rawData.map((row: any, i: number) => ({
        id: `import-${Date.now()}-${i}`,
        nis: String(row['NIS'] || row['nis'] || `202500${i + 10}`),
        nisn: String(row['NISN'] || row['nisn'] || `01012345${i + 10}`),
        name: String(row['Nama Lengkap'] || row['nama'] || 'Siswa Baru'),
        class: String(row['Kelas'] || row['kelas'] || '7A'),
        gender: String(row['Jenis Kelamin (L/P)'] || row['gender'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
        parentPhone: String(row['No HP Ortu'] || row['phone'] || ''),
        address: String(row['Alamat'] || row['address'] || ''),
        status: true,
      }));
      setImportedRows(parsed);
      toast.success('File Excel Terbaca', `${parsed.length} data siswa terdeteksi.`);
    } catch (err) {
      toast.error('Gagal Membaca File', 'Pastikan format kolom sesuai dengan template Excel.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (importedRows.length === 0) return;
    const mapped: Student[] = importedRows.map((r) => ({ ...r, id: Date.now().toString() + Math.random() }));
    setStudents((prev) => [...mapped, ...prev]);
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengimpor ${importedRows.length} data siswa dari file Excel (${importFileName})`,
      module: 'Pengguna',
      severity: 'SUCCESS',
      details: `Pengimporan masal data siswa baru.`,
    });
    toast.success('Import Berhasil', `${importedRows.length} data siswa berhasil diimpor.`);
    setShowImportModal(false);
    setImportedRows([]);
    setImportFileName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Data Siswa</h1>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Tahun Ajaran {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Direktori siswa aktif, kenaikan kelas masal, serta pengimporan data siswa dari file Excel.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Import Excel */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" /> Import Excel
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>

          {/* Tambah Siswa */}
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        </div>
      </div>

      {/* ── TOOLBAR FILTERS ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Cari nama, NIS, NISN, atau kelas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto">
          {(['SEMUA', '7A', '7B', '8A', '8B', '9A', '9B'] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => {
                setFilterClass(cls);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterClass === cls
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cls === 'SEMUA' ? `Semua (${totalStudents})` : `Kelas ${cls}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── DATA TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="px-5 py-3 bg-emerald-50/80 border-b border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-950">
              {selectedIds.length} siswa dipilih
            </span>
            <button
              onClick={() => setShowMoveClassModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Pindahkan Ke Kelas Lain
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every((s) => selectedIds.includes(s.id))}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">SISWA</th>
                <th className="px-4 py-3.5">NIS / NISN</th>
                <th className="px-4 py-3.5">KELAS</th>
                <th className="px-4 py-3.5">NO. HP ORTU</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((s) => {
                  const isChecked = selectedIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(s.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 text-xs font-bold shrink-0 overflow-hidden">
                            {s.photoUrl ? (
                              <Image src={s.photoUrl} alt={s.name} fill className="object-cover" />
                            ) : (
                              <span>{s.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 leading-snug">{s.name}</p>
                            <span
                              className={`text-[10px] font-semibold ${
                                s.gender === 'L' ? 'text-sky-600' : 'text-pink-600'
                              }`}
                            >
                              {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-700">
                        <p className="font-semibold">{s.nis}</p>
                        <p className="text-[11px] text-slate-400">{s.nisn}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {s.class}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">{s.parentPhone || '-'}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(s)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenForm(s)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada data siswa yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Modal Form Tambah / Edit Siswa */}
      {showAddEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {selectedStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h2>
                <p className="text-xs text-slate-500 font-normal">Unggah foto dan isi kelengkapan profil data siswa</p>
              </div>
              <button
                onClick={() => setShowAddEditForm(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Upload Foto */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Foto Profil Siswa</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {formData.photoUrl ? (
                        <Image src={formData.photoUrl} alt="Foto Profil" fill className="object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CustomImageUploader
                        endpoint="profilePhoto"
                        label="Unggah Foto Profil"
                        onUploadComplete={(url) => update('photoUrl', url)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 font-normal mt-1">Format JPG, PNG (Maks 4MB)</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIS *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nomor Induk Sekolah"
                      value={formData.nis}
                      onChange={(e) => update('nis', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NISN</label>
                    <input
                      type="text"
                      placeholder="Nomor Induk Siswa Nasional"
                      value={formData.nisn}
                      onChange={(e) => update('nisn', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap sesuai ijazah"
                    value={formData.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas *</label>
                    <select
                      value={formData.class}
                      onChange={(e) => update('class', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {['7A', '7B', '8A', '8B', '9A', '9B'].map((c) => (
                        <option key={c} value={c}>
                          Kelas {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => update('gender', e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WA Orang Tua</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.parentPhone}
                    onChange={(e) => update('parentPhone', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili</label>
                  <textarea
                    rows={2}
                    placeholder="Alamat rumah lengkap"
                    value={formData.address}
                    onChange={(e) => update('address', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddEditForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Profil Siswa */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                {selectedStudent.photoUrl ? (
                  <Image src={selectedStudent.photoUrl} alt={selectedStudent.name} fill className="object-cover" />
                ) : (
                  <span>{selectedStudent.name[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm truncate">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-300 font-mono">NIS: {selectedStudent.nis} | NISN: {selectedStudent.nisn}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/20 text-white inline-block mt-1">
                  Kelas {selectedStudent.class}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-2.5 text-xs font-normal text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Jenis Kelamin:</span>
                <span className="font-semibold text-slate-900">
                  {selectedStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">No HP Ortu:</span>
                <span className="font-mono font-semibold text-emerald-700">{selectedStudent.parentPhone || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Alamat:</span>
                <span className="font-medium text-slate-900 text-right max-w-[200px]">{selectedStudent.address || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status Keaktifan:</span>
                <span className="font-semibold px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aktif
                </span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Data Siswa?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-900">{selectedStudent.name}</span> (NIS: {selectedStudent.nis})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pindah Kelas Masal */}
      {showMoveClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Pindahkan Siswa Terpilih</h3>
              <button onClick={() => setShowMoveClassModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Memindahkan <strong className="text-slate-900">{selectedIds.length} siswa</strong> yang dipilih ke kelas tujuan baru.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Kelas Tujuan</label>
              <select
                value={targetMoveClass}
                onChange={(e) => setTargetMoveClass(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {['7A', '7B', '8A', '8B', '9A', '9B'].map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-3 justify-end border-t border-slate-100">
              <button
                onClick={() => setShowMoveClassModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmMoveClass}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Pindahkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Import Data Siswa dari Excel</h2>
                  <p className="text-xs text-slate-500 font-normal">Unggah berkas Excel (.xlsx / .csv) untuk mengimpor data masal</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-950">Belum punya format Excel?</p>
                  <p className="text-[11px] text-emerald-700">Unduh template standar sekolah agar struktur kolom sesuai.</p>
                </div>
                <button
                  onClick={downloadSiswaTemplate}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih File Excel / CSV</label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-700 file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer border border-slate-200 rounded-xl p-1 bg-white"
                />
                {isParsingExcel && (
                  <p className="text-xs font-semibold text-emerald-600 mt-2 animate-pulse">Membaca data file Excel...</p>
                )}
              </div>

              {importedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-900">Pratinjau Data ({importedRows.length} Siswa Terdeteksi)</h4>
                    <span className="text-[11px] font-semibold text-emerald-600">✓ Siap Dimasukkan</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 sticky top-0 font-semibold text-slate-700">
                        <tr>
                          <th className="p-2.5">NIS</th>
                          <th className="p-2.5">Nama Lengkap</th>
                          <th className="p-2.5">Kelas</th>
                          <th className="p-2.5">JK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono">{r.nis}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{r.name}</td>
                            <td className="p-2.5">{r.class}</td>
                            <td className="p-2.5 font-semibold">{r.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={importedRows.length === 0}
                onClick={handleConfirmImport}
                className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  importedRows.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Simpan &amp; Impor {importedRows.length} Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
