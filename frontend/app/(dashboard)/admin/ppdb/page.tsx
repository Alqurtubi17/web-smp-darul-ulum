'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Clock, X, Trash2, AlertTriangle, Layers } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { useAcademicYearStore } from '@/store/academic-year.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { ppdbService } from '@/lib/services/ppdb.service';

type Status = 'SEMUA' | 'PENDING' | 'VERIFIKASI' | 'LULUS' | 'DITOLAK';

interface AdmissionItem {
  id: string;
  regNum: string;
  name: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  school: string;
  status: 'PENDING' | 'VERIFIKASI' | 'LULUS' | 'DITOLAK';
  createdAt: string;
  score?: number;
  nisn?: string;
  address?: string;
}

const INITIAL_ADMISSIONS: AdmissionItem[] = [
  { id: '1', regNum: 'PDG-2025-00001', name: 'Muhammad Fahri Ramadhan', gender: 'L', parentName: 'Ir. Ramadhan Putra', parentPhone: '081234567890', school: 'SDN Wonorejo 1', status: 'PENDING', createdAt: '2025-06-15', nisn: '0123456789', address: 'Jl. Rungkut Asri No. 10, Surabaya' },
  { id: '2', regNum: 'PDG-2025-00002', name: 'Siti Aisyah Mardiyah', gender: 'P', parentName: 'H. Mardiyah', parentPhone: '082345678901', school: 'MI Darul Hikmah', status: 'VERIFIKASI', createdAt: '2025-06-14', nisn: '0123456790', address: 'Jl. Sepanjang Jaya No. 4, Sidoarjo' },
  { id: '3', regNum: 'PDG-2025-00003', name: 'Rizky Firmansyah', gender: 'L', parentName: 'Firmansyah, S.E.', parentPhone: '083456789012', school: 'SDN Mojo 2', status: 'LULUS', createdAt: '2025-06-13', score: 88, nisn: '0123456791', address: 'Jl. Wonokromo No. 88, Surabaya' },
  { id: '4', regNum: 'PDG-2025-00004', name: 'Dewi Kurniasari', gender: 'P', parentName: 'Kurniasari', parentPhone: '084567890123', school: 'SD Islam Al-Azhar', status: 'LULUS', createdAt: '2025-06-12', score: 92, nisn: '0123456792', address: 'Jl. Jemursari No. 15, Surabaya' },
  { id: '5', regNum: 'PDG-2025-00005', name: 'Ahmad Zulkifli', gender: 'L', parentName: 'Zulkifli, S.Pd.', parentPhone: '085678901234', school: 'SDN Kenjeran 3', status: 'DITOLAK', createdAt: '2025-06-11', nisn: '0123456793', address: 'Jl. Kenjeran No. 40, Surabaya' },
  { id: '6', regNum: 'PDG-2025-00006', name: 'Nurul Hidayati', gender: 'P', parentName: 'Bambang Hidayat', parentPhone: '086789012345', school: 'SDN Tandes 1', status: 'PENDING', createdAt: '2025-06-10', nisn: '0123456794', address: 'Jl. Tandes Barat No. 2, Surabaya' },
  { id: '7', regNum: 'PDG-2025-00007', name: 'Fikri Alamsyah', gender: 'L', parentName: 'Sutrisno', parentPhone: '087890123456', school: 'SD Muhammadiyah 4', status: 'VERIFIKASI', createdAt: '2025-06-09', nisn: '0123456795', address: 'Jl. Ngagel Jaya No. 12, Surabaya' },
  { id: '8', regNum: 'PDG-2025-00008', name: 'Anisa Rahmawati', gender: 'P', parentName: 'H. Rahmawati', parentPhone: '088901234567', school: 'MI NU Manukan', status: 'LULUS', createdAt: '2025-06-08', score: 95, nisn: '0123456796', address: 'Jl. Manukan Tama No. 5, Surabaya' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-50 text-amber-800 border-amber-200/80', icon: <Clock className="w-3 h-3" /> },
  VERIFIKASI: { label: 'Verifikasi', color: 'bg-blue-50 text-blue-800 border-blue-200/80', icon: <Eye className="w-3 h-3" /> },
  LULUS: { label: 'Diterima', color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80', icon: <CheckCircle className="w-3 h-3" /> },
  DITOLAK: { label: 'Ditolak', color: 'bg-rose-50 text-rose-800 border-rose-200/80', icon: <XCircle className="w-3 h-3" /> },
};

const ITEMS_PER_PAGE = 6;


export default function AdminPPDBPage() {
  const { activeYear } = useAcademicYearStore();
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [admissions, setAdmissions] = useState<AdmissionItem[]>(INITIAL_ADMISSIONS);

  // Fetch live backend admissions
  useEffect(() => {
    const fetchAdmissionsBackend = async () => {
      try {
        const res = await ppdbService.getAdmissions();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: AdmissionItem[] = res.data.map((item: any) => ({
            id: item.id,
            regNum: item.registrationNumber,
            name: item.fullName,
            gender: item.gender === 'LAKI_LAKI' ? 'L' : 'P',
            parentName: item.parentName || '-',
            parentPhone: item.parentPhone || '-',
            school: item.previousSchool || '-',
            status: item.status,
            createdAt: item.createdAt ? String(item.createdAt).split('T')[0] : '2026-08-01',
            score: item.score,
            nisn: item.nisn,
            address: item.address,
          }));
          setAdmissions(mapped);
          return;
        }
      } catch (err) {
        console.warn('Backend PPDB data load warning:', err);
      }
    };

    fetchAdmissionsBackend();
  }, []);


  const [activeStatus, setActiveStatus] = useState<Status>('SEMUA');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 2-Step Clear All PPDB Modal State
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearStep, setClearStep] = useState<1 | 2>(1);
  const [clearConfirmInput, setClearConfirmInput] = useState('');

  // Filtering
  const filtered = useMemo(() => {
    return admissions.filter(
      (a) =>
        (activeStatus === 'SEMUA' || a.status === activeStatus) &&
        (a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.regNum.toLowerCase().includes(search.toLowerCase()) ||
          a.school.toLowerCase().includes(search.toLowerCase()))
    );
  }, [admissions, activeStatus, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Compact Stats
  const stats = useMemo(
    () => ({
      total: admissions.length,
      pending: admissions.filter((a) => a.status === 'PENDING').length,
      verifikasi: admissions.filter((a) => a.status === 'VERIFIKASI').length,
      lulus: admissions.filter((a) => a.status === 'LULUS').length,
      ditolak: admissions.filter((a) => a.status === 'DITOLAK').length,
    }),
    [admissions]
  );

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginated.map((f) => f.id) : []);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Actions
  const handleUpdateStatus = async (id: string, newStatus: 'LULUS' | 'DITOLAK' | 'VERIFIKASI') => {
    const item = admissions.find((a) => a.id === id);
    if (!item) return;

    setAdmissions((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));

    try {
      await ppdbService.updateAdmissionStatus(id, { status: newStatus });
    } catch (err) {
      console.warn('Backend update admission status failed:', err);
    }

    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengubah status pendaftar PPDB "${item.name}" (${item.regNum}) ke "${newStatus}"`,
      module: 'PPDB',
      severity: newStatus === 'LULUS' ? 'SUCCESS' : newStatus === 'DITOLAK' ? 'WARNING' : 'INFO',
      details: `Status PPDB diperbarui dari ${item.status} menjadi ${newStatus}.`,
    });

    if (newStatus === 'LULUS') {
      toast.success('Pendaftar Diterima!', `${item.name} dinyatakan LULUS PPDB.`);
    } else if (newStatus === 'DITOLAK') {
      toast.warning('Pendaftar Ditolak', `Status pendaftaran ${item.name} telah diubah.`);
    } else {
      toast.info('Status Diperbarui', `Pendaftaran ${item.name} dipindahkan ke Verifikasi.`);
    }
  };

  const handleBulkStatus = (newStatus: 'LULUS' | 'DITOLAK') => {
    setAdmissions((prev) => prev.map((a) => (selectedIds.includes(a.id) ? { ...a, status: newStatus } : a)));
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Memperbarui status PPDB masal (${selectedIds.length} pendaftar) ke "${newStatus}"`,
      module: 'PPDB',
      severity: newStatus === 'LULUS' ? 'SUCCESS' : 'WARNING',
    });
    toast.success('Pembaruan Masal Berhasil', `${selectedIds.length} pendaftar diubah statusnya menjadi ${newStatus}.`);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const headers = 'No Reg,Nama Pendaftar,JK,Nama Orang Tua,No HP,Asal Sekolah,Status,Tanggal\n';
    const rows = filtered
      .map((a) => `"${a.regNum}","${a.name}","${a.gender}","${a.parentName}","${a.parentPhone}","${a.school}","${a.status}","${a.createdAt}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pendaftaran_PPDB_SMP_Darul_Ulum_${activeYear.replace('/', '-')}.csv`;
    link.click();
    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengekspor ${filtered.length} data pendaftar PPDB ke CSV`,
      module: 'PPDB',
      severity: 'INFO',
    });
    toast.info('Export PPDB Dimulai', `Mengunduh berkas pendaftaran PPDB (${filtered.length} data).`);
  };

  const handleOpenClearModal = () => {
    setClearStep(1);
    setClearConfirmInput('');
    setShowClearAllModal(true);
  };

  const handleExecuteClearAllPPDB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clearConfirmInput.trim().toUpperCase() !== 'HAPUS') {
      toast.error('Teks Konfirmasi Salah', "Ketik kata 'HAPUS' untuk mengonfirmasi.");
      return;
    }

    const countBefore = admissions.length;
    setAdmissions([]);
    setSelectedIds([]);

    try {
      await ppdbService.clearAllAdmissions();
    } catch (err) {
      console.warn('Backend clear all admissions failed:', err);
    }


    addLog({
      user: actorName,
      role: 'ADMIN',
      action: 'Pembersihan Total Data PPDB (Ganti Semester/Tahun)',
      module: 'PPDB',
      severity: 'DANGER',
      details: `Mengosongkan seluruh ${countBefore} data pendaftar PPDB untuk persiapan pergantian semester / tahun ajaran baru.`,
    });

    setShowClearAllModal(false);
    setClearStep(1);
    setClearConfirmInput('');
    toast.success('Data PPDB Dihapus', 'Seluruh data pendaftar PPDB berhasil dikosongkan.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen PPDB Online</h1>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
              T.A. {activeYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Verifikasi pendaftaran calon siswa baru, penetapan kelulusan, dan seleksi administrasi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel
          </button>

          <button
            onClick={handleOpenClearModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Kosongkan seluruh data PPDB untuk persiapan ganti semester / tahun ajaran baru"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>

      {/* ── COMPACT PROPORTIONAL MINI STAT BADGES ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Pendaftar', value: stats.total, color: 'text-slate-900', bg: 'bg-white', border: 'border-slate-200/80' },
          { label: 'Menunggu', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200/80' },
          { label: 'Verifikasi', value: stats.verifikasi, color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-200/80' },
          { label: 'Diterima', value: stats.lulus, color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200/80' },
          { label: 'Ditolak', value: stats.ditolak, color: 'text-rose-700', bg: 'bg-rose-50/50', border: 'border-rose-200/80' },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} ${s.border} rounded-xl border px-3.5 py-2.5 flex items-center justify-between shadow-2xs`}
          >
            <span className="text-xs font-semibold text-slate-600">{s.label}</span>
            <span className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR FILTER ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Cari pendaftar, no reg, asal sekolah..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto">
            {(['SEMUA', 'PENDING', 'VERIFIKASI', 'LULUS', 'DITOLAK'] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setActiveStatus(s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeStatus === s
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s === 'SEMUA' ? 'Semua' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Menampilkan <span className="font-semibold text-slate-800">{filtered.length}</span> pendaftar
        </div>
      </div>

      {/* ── DATA TABLE ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="px-5 py-3 bg-emerald-50/80 border-b border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-950">
              {selectedIds.length} pendaftar dipilih
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus('LULUS')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Terima Semua
              </button>
              <button
                onClick={() => handleBulkStatus('DITOLAK')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Tolak Semua
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && paginated.every((f) => selectedIds.includes(f.id))}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5">NO. REG</th>
                <th className="px-4 py-3.5">NAMA CALON SISWA</th>
                <th className="px-4 py-3.5">ORANG TUA &amp; HP</th>
                <th className="px-4 py-3.5">ASAL SEKOLAH</th>
                <th className="px-4 py-3.5">TGL DAFTAR</th>
                <th className="px-4 py-3.5 text-center">STATUS</th>
                <th className="px-4 py-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((a) => {
                  const statusCfg = STATUS_CONFIG[a.status];
                  const isChecked = selectedIds.includes(a.id);

                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(a.id)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* No Reg */}
                      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-slate-700">{a.regNum}</td>

                      {/* Nama Calon Siswa */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                            {a.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 leading-snug">{a.name}</p>
                            <span
                              className={`text-[10px] font-semibold ${
                                a.gender === 'L' ? 'text-sky-600' : 'text-pink-600'
                              }`}
                            >
                              {a.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Orang Tua & HP */}
                      <td className="px-4 py-3.5">
                        <p className="text-xs font-semibold text-slate-800">{a.parentName}</p>
                        <p className="text-[11px] font-mono text-slate-400">{a.parentPhone}</p>
                      </td>

                      {/* Asal Sekolah */}
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-700">{a.school}</td>

                      {/* Tgl Daftar */}
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                        {formatDate(a.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusCfg?.color}`}
                        >
                          {statusCfg?.icon} {statusCfg?.label}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedAdmission(a);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Pendaftar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {a.status !== 'LULUS' && (
                            <button
                              onClick={() => handleUpdateStatus(a.id, 'LULUS')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Terima / Luluskan Siswa"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {a.status !== 'DITOLAK' && (
                            <button
                              onClick={() => handleUpdateStatus(a.id, 'DITOLAK')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Tolak Pendaftaran"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-500 font-medium">
                    Tidak ada pendaftar PPDB yang sesuai.
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

      {/* ── MODAL 2-STEP CONFIRMATION: HAPUS SEMUA DATA PPDB ──────────────── */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>Hapus Semua Data PPDB (Ganti Semester/Tahun)</span>
              </h3>
              <button
                onClick={() => setShowClearAllModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {clearStep === 1 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900">PERINGATAN: Persiapan Ganti Semester / Tahun Ajaran</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Tindakan ini akan menghapus seluruh <strong>{admissions.length} data pendaftar PPDB</strong> dari sistem portal secara permanen.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Hal yang perlu diperhatikan:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-500">
                    <li>Pastikan Anda sudah mendownload rekap data via tombol <strong>Export Excel</strong>.</li>
                    <li>Sistem akan mengosongkan seluruh formulir &amp; riwayat calon pendaftar.</li>
                    <li>Aksi ini akan dicatat ke dalam Audit Trail Log Sistem.</li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowClearAllModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setClearStep(2)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Lanjutkan ke Langkah 2 &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteClearAllPPDB} className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-900">LANGKAH VERIFIKASI TERAKHIR</p>
                    <p className="text-xs text-rose-800">
                      Ketik kata <strong className="underline">HAPUS</strong> di bawah ini untuk mengonfirmasi pembersihan total data PPDB.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Konfirmasi Teks Vertifikasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ketik HAPUS di sini..."
                    value={clearConfirmInput}
                    onChange={(e) => setClearConfirmInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-rose-50/40 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase placeholder:normal-case"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setClearStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    &larr; Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={clearConfirmInput.trim().toUpperCase() !== 'HAPUS'}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Ya, Hapus Semua Data PPDB
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL PENDAFTAR ─────────────────────────────────────────── */}
      {showDetailModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {selectedAdmission.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-snug">{selectedAdmission.name}</h3>
                  <p className="text-xs font-mono text-slate-300">No. Reg: {selectedAdmission.regNum}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs font-normal text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Jenis Kelamin:</span>
                <span className="font-semibold text-slate-900">
                  {selectedAdmission.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">NISN:</span>
                <span className="font-mono font-semibold text-slate-900">{selectedAdmission.nisn || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Asal Sekolah:</span>
                <span className="font-semibold text-emerald-700">{selectedAdmission.school}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Nama Orang Tua:</span>
                <span className="font-semibold text-slate-900">{selectedAdmission.parentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">No. HP Orang Tua:</span>
                <span className="font-mono font-semibold text-emerald-700">{selectedAdmission.parentPhone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Alamat Domisili:</span>
                <span className="font-medium text-slate-900 text-right max-w-[220px]">{selectedAdmission.address || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-medium">Status Pendaftaran:</span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    STATUS_CONFIG[selectedAdmission.status]?.color
                  }`}
                >
                  {STATUS_CONFIG[selectedAdmission.status]?.label}
                </span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedAdmission.id, 'LULUS');
                    setShowDetailModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Terima Siswa
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedAdmission.id, 'DITOLAK');
                    setShowDetailModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Tolak
                </button>
              </div>

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
    </div>
  );
}
