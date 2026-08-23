'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, GraduationCap, X, Download, Upload,
  Eye, FileSpreadsheet, AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { Pagination } from '@/components/ui/Pagination';
import {
  TeacherExcelRow, exportGuruExcel, downloadGuruTemplate, parseExcelFile
} from '@/lib/user-excel';
import { useAcademicYearStore } from '@/store/academic-year.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { useToastStore, toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/lib/services/user.service';

interface Staff extends TeacherExcelRow {
  id: string;
}

const INITIAL_STAFF: Staff[] = [
  { id: '1', nip: '198501152010011002', name: 'Khusnul Khotimah, S.Pd.', category: 'Guru', role: 'Kepala Sekolah', subject: 'Manajemen Sekolah', phone: '081234567890', email: 'khusnul@smpdarululum.sch.id', status: true, joined: '2010-07-15', photoUrl: '' },
  { id: '2', nip: '198803202012022001', name: 'Siti Rahayu, S.Pd.', category: 'Guru', role: 'Waka Akademik', subject: 'Matematika', phone: '082345678901', email: 'rahayu@smpdarululum.sch.id', status: true, joined: '2012-07-15', photoUrl: '' },
  { id: '3', nip: '199005102015011003', name: 'Ahmad Fauzi, M.Pd.', category: 'Guru', role: 'Guru Pengajar', subject: 'IPA (Fisika & Biologi)', phone: '083456789012', email: 'fauzi@smpdarululum.sch.id', status: true, joined: '2015-07-15', photoUrl: '' },
  { id: '4', nip: '199208252019022004', name: 'Nur Hidayah, S.Ag.', category: 'Guru', role: 'Guru Pengajar', subject: 'PAI & Ke-NU-an', phone: '084567890123', email: 'hidayah@smpdarululum.sch.id', status: true, joined: '2019-07-15', photoUrl: '' },
  { id: '5', nip: '199403122020011005', name: 'Muhammad Ridwan, S.Kom.', category: 'Tendik', role: 'Kepala Tata Usaha', subject: 'Administrasi & IT', phone: '085678901234', email: 'ridwan@smpdarululum.sch.id', status: true, joined: '2020-07-15', photoUrl: '' },
  { id: '6', nip: '199607182021022006', name: 'Siti Maryam, A.Md.', category: 'Tendik', role: 'Pustakawan Sekolah', subject: 'Perpustakaan Digital', phone: '086789012345', email: 'maryam@smpdarululum.sch.id', status: true, joined: '2021-07-15', photoUrl: '' },
  { id: '7', nip: '199511122021011007', name: 'Bambang Kurniawan, S.Pd.', category: 'Guru', role: 'Guru Pengajar', subject: 'Bahasa Indonesia', phone: '087890123456', email: 'bambang@smpdarululum.sch.id', status: true, joined: '2021-07-15', photoUrl: '' },
  { id: '8', nip: '199709202022011008', name: 'Agus Setiawan', category: 'Tendik', role: 'Staf Keamanan', subject: 'Ketertiban & Keamanan', phone: '088901234567', email: 'agus@smpdarululum.sch.id', status: true, joined: '2022-07-15', photoUrl: '' },
];

const ITEMS_PER_PAGE = 6;


export default function AdminGuruTendikPage() {
  const { activeYear } = useAcademicYearStore();
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [staffList, setStaffList] = useState<Staff[]>(INITIAL_STAFF);

  // Fetch live backend staff/teachers
  useEffect(() => {
    const fetchTeachersBackend = async () => {
      try {
        const res = await userService.getTeachers();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: Staff[] = res.data.map((t: any) => ({
            id: t.id,
            nip: t.nip || t.nuptk || '19900101202001',
            name: t.fullName || t.name,
            category: 'Guru',
            role: t.role || 'Guru Pengajar',
            subject: t.subject || 'Mata Pelajaran',
            phone: t.phone || '-',
            email: t.user?.email || t.email || '-',
            status: true,
            joined: '2020-07-15',
            photoUrl: t.photoUrl || '',
          }));
          setStaffList(mapped);
        }

      } catch (err) {
        console.warn('Backend teachers load warning:', err);
      }

    };
    fetchTeachersBackend();
  }, []);


  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'SEMUA' | 'Guru' | 'Tendik'>('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    fullName: '', nip: '', email: '', category: 'Guru' as 'Guru' | 'Tendik', role: 'Guru Pengajar', subject: '', phone: '', photoUrl: '',
  });

  // Excel import state
  const [importedRows, setImportedRows] = useState<TeacherExcelRow[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  // Metrics
  const totalStaff = staffList.length;

  // Filtered List
  const filtered = useMemo(() => {
    return staffList.filter((s) => {
      const matchCat = filterCategory === 'SEMUA' || s.category === filterCategory;
      const q = search.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.nip.includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [staffList, filterCategory, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const update = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  // Open Handlers
  const handleOpenForm = (staff?: Staff) => {
    if (staff) {
      setSelectedStaff(staff);
      setFormData({
        fullName: staff.name,
        nip: staff.nip,
        email: staff.email || '',
        category: staff.category,
        role: staff.role,
        subject: staff.subject,
        phone: staff.phone,
        photoUrl: staff.photoUrl || '',
      });
    } else {
      setSelectedStaff(null);
      setFormData({
        fullName: '', nip: '', email: '', category: 'Guru', role: 'Guru Pengajar', subject: '', phone: '', photoUrl: '',
      });
    }
    setShowAddEditForm(true);
  };

  const handleOpenDetail = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDetailModal(true);
  };

  const handleOpenDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  // Save Personel
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.nip || !formData.subject) return;

    if (selectedStaff) {
      setStaffList((prev) =>
        prev.map((t) =>
          t.id === selectedStaff.id
            ? {
                ...t,
                name: formData.fullName,
                nip: formData.nip,
                email: formData.email,
                category: formData.category,
                role: formData.role,
                subject: formData.subject,
                phone: formData.phone,
                photoUrl: formData.photoUrl,
              }
            : t
        )
      );
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Memperbarui profil ${formData.category} "${formData.fullName}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `NIP: ${formData.nip}, Jabatan: ${formData.role}, Mapel: ${formData.subject}.`,
      });
      toast.success('Data Berhasil Diperbarui', `Profil ${formData.fullName} telah disimpan.`);
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        nip: formData.nip,
        name: formData.fullName,
        email: formData.email,
        category: formData.category,
        role: formData.role,
        subject: formData.subject,
        phone: formData.phone,
        status: true,
        joined: new Date().toISOString().split('T')[0],
        photoUrl: formData.photoUrl,
      };

      setStaffList((prev) => [newStaff, ...prev]);

      try {
        await userService.createTeacher({
          fullName: formData.fullName,
          nip: formData.nip,
          email: formData.email,
          subject: formData.subject,
          phone: formData.phone,
        });
      } catch (err) {
        console.warn('Backend create teacher failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menambah personel ${formData.category} baru "${formData.fullName}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `NIP: ${formData.nip}, Peran: ${formData.role}.`,
      });
      toast.success('Personel Baru Ditambahkan', `${formData.fullName} berhasil didaftarkan.`);
    }
    setShowAddEditForm(false);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!selectedStaff) return;
    setStaffList((prev) => prev.filter((t) => t.id !== selectedStaff.id));
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Menghapus data ${selectedStaff.category} "${selectedStaff.name}" (NIP: ${selectedStaff.nip})`,
      module: 'Pengguna',
      severity: 'WARNING',
      details: `Penghapusan data pegawai dari direktori portal.`,
    });
    toast.warning('Data Personel Dihapus', `${selectedStaff.name} telah dihapus dari direktori.`);
    setShowDeleteModal(false);
    setSelectedStaff(null);
  };

  // Export Excel
  const handleExportExcel = () => {
    exportGuruExcel(filtered, `Data_Guru_Tendik_SMP_Darul_Ulum.xlsx`);
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengekspor ${filtered.length} data Guru & Tendik ke Excel`,
      module: 'Pengguna',
      severity: 'INFO',
      details: `Berkas Data_Guru_Tendik_SMP_Darul_Ulum.xlsx didownload.`,
    });
    toast.info('Export Excel Dimulai', `Mengunduh ${filtered.length} data personel ke file Excel.`);
  };

  // Excel Upload Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setIsParsingExcel(true);
    try {
      const rawData = await parseExcelFile<any>(file);
      const parsed: TeacherExcelRow[] = rawData.map((row: any, i: number) => ({
        id: `import-guru-${Date.now()}-${i}`,
        nip: String(row['NIP / NUPTK'] || row['nip'] || `19900000000000${i + 10}`),
        name: String(row['Nama Lengkap & Gelar'] || row['nama'] || 'Guru / Staf Baru'),
        category: String(row['Kategori (Guru/Tendik)'] || row['kategori'] || 'Guru').includes('Tendik') ? 'Tendik' : 'Guru',
        role: String(row['Jabatan / Peran'] || row['jabatan'] || 'Guru Pengajar'),
        subject: String(row['Mata Pelajaran / Bidang'] || row['mapel'] || 'Umum'),
        phone: String(row['No HP / WA'] || row['phone'] || ''),
        email: String(row['Email'] || ''),
        status: true,
        joined: new Date().toISOString().split('T')[0],
      }));
      setImportedRows(parsed);
      toast.success('File Excel Terbaca', `${parsed.length} personel terdeteksi.`);
    } catch (err) {
      toast.error('Gagal Membaca File', 'Pastikan format kolom sesuai dengan template Excel.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (importedRows.length === 0) return;
    const mapped: Staff[] = importedRows.map((r) => ({ ...r, id: Date.now().toString() + Math.random() }));
    setStaffList((prev) => [...mapped, ...prev]);
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengimpor ${importedRows.length} data Guru & Tendik dari file Excel (${importFileName})`,
      module: 'Pengguna',
      severity: 'SUCCESS',
      details: `Pengimporan masal data tenaga pendidik & kependidikan baru.`,
    });
    toast.success('Import Berhasil', `${importedRows.length} data personel berhasil diimpor.`);
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Guru &amp; Tendik</h1>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              Tahun Ajaran {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Direktori tenaga pendidik (Guru) dan staf kependidikan (Tendik) sekolah.
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

          {/* Tambah Personel */}
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Personel
          </button>
        </div>
      </div>

      {/* ── TOOLBAR FILTERS ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Cari nama, NIP, jabatan, atau mata pelajaran..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 w-full sm:w-auto justify-center">
          {(['SEMUA', 'Guru', 'Tendik'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat === 'SEMUA' ? `Semua (${totalStaff})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── DATA TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-3.5">PERSONEL</th>
                <th className="px-4 py-3.5">KATEGORI &amp; PERAN</th>
                <th className="px-4 py-3.5">NIP / NUPTK</th>
                <th className="px-4 py-3.5">BIDANG / MAPEL</th>
                <th className="px-4 py-3.5">NO. HP</th>
                <th className="px-4 py-3.5">STATUS</th>
                <th className="px-4 py-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 text-xs font-bold shrink-0 overflow-hidden">
                          {g.photoUrl ? (
                            <Image src={g.photoUrl} alt={g.name} fill className="object-cover" />
                          ) : (
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-snug">{g.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{g.email || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            g.category === 'Guru' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          }`}
                        >
                          {g.category}
                        </span>
                        <span className="text-xs font-medium text-slate-600">{g.role}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-700">{g.nip}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-800 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-lg">
                        {g.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 font-mono">{g.phone || '-'}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aktif
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenDetail(g)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail Profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(g)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Personel"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(g)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Personel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada data guru atau tendik yang sesuai.
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

      {/* Modal Form Tambah / Edit Personel */}
      {showAddEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {selectedStaff ? 'Edit Data Personel' : 'Tambah Guru / Tendik Baru'}
                </h2>
                <p className="text-xs text-slate-500 font-normal">Unggah foto dan isi data tenaga pendidik / staf kependidikan</p>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Foto Profil Personel</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {formData.photoUrl ? (
                        <Image src={formData.photoUrl} alt="Foto Profil" fill className="object-cover" />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-slate-400" />
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Personel *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => update('category', e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Guru">Guru (Tenaga Pendidik)</option>
                      <option value="Tendik">Tendik (Staf Kependidikan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIP / NUPTK *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nomor Induk Pegawai"
                      value={formData.nip}
                      onChange={(e) => update('nip', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="cth: Siti Rahayu, S.Pd. / Muhammad Ridwan, S.Kom."
                    value={formData.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="email@smpdarululum.sch.id"
                    value={formData.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Peran *</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Guru Pengajar / Ka. TU"
                      value={formData.role}
                      onChange={(e) => update('role', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran / Bidang *</label>
                    <input
                      type="text"
                      required
                      placeholder="cth: Matematika / Administrasi TU"
                      value={formData.subject}
                      onChange={(e) => update('subject', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  Simpan Personel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Profil Personel */}
      {showDetailModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                {selectedStaff.photoUrl ? (
                  <Image src={selectedStaff.photoUrl} alt={selectedStaff.name} fill className="object-cover" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm truncate">{selectedStaff.name}</h3>
                <p className="text-xs text-slate-300 font-mono">NIP: {selectedStaff.nip}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/20 text-white inline-block mt-1">
                  {selectedStaff.category} — {selectedStaff.role}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-2.5 text-xs font-normal text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Bidang Tugas / Mapel:</span>
                <span className="font-semibold text-slate-900">{selectedStaff.subject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Email Resmi:</span>
                <span className="font-semibold text-slate-900">{selectedStaff.email || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">No HP / WA:</span>
                <span className="font-mono font-semibold text-emerald-700">{selectedStaff.phone || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Tanggal Bergabung:</span>
                <span className="font-semibold text-slate-900">{selectedStaff.joined || '-'}</span>
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
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Data Personel?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-slate-900">{selectedStaff.name}</span> ({selectedStaff.nip})? Tindakan ini tidak dapat dibatalkan.
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
                Ya, Hapus Data
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
                  <h2 className="font-bold text-slate-900 text-base">Import Data Guru &amp; Tendik dari Excel</h2>
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
                  onClick={downloadGuruTemplate}
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
                    <h4 className="text-xs font-semibold text-slate-900">Pratinjau Data ({importedRows.length} Personel Terdeteksi)</h4>
                    <span className="text-[11px] font-semibold text-emerald-600">✓ Siap Dimasukkan</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 sticky top-0 font-semibold text-slate-700">
                        <tr>
                          <th className="p-2.5">NIP</th>
                          <th className="p-2.5">Nama &amp; Gelar</th>
                          <th className="p-2.5">Kategori</th>
                          <th className="p-2.5">Peran / Mapel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedRows.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono">{r.nip}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{r.name}</td>
                            <td className="p-2.5">{r.category}</td>
                            <td className="p-2.5 font-semibold text-emerald-700">{r.subject}</td>
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
                Simpan &amp; Impor {importedRows.length} Personel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
