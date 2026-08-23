'use client';

import { useState, useEffect } from 'react';
import {
  Wallet, Plus, Download, Search, CheckCircle, AlertCircle, CreditCard,
  Filter, ChevronLeft, ChevronRight, X, Loader2, Calendar, Trash2, Users, Layers, AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { exportSPPExcel } from '@/lib/export';
import { toast } from '@/store/toast.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { paymentService } from '@/lib/services/payment.service';

interface BillItem {
  id: string;
  student: string;
  nis: string;
  class: string;
  type: string;
  month: string;
  year: number;
  amount: number;
  status: 'PAID' | 'PENDING';
  due?: string;
  paid?: string;
  method?: string;
}

const INITIAL_BILLS: BillItem[] = [
  { id: '1', student: 'Ahmad Rizki Pratama', nis: '2026001', class: '7A', type: 'SPP', month: 'Agustus 2026', year: 2026, amount: 350000, status: 'PENDING', due: '2026-08-28' },
  { id: '2', student: 'Siti Nur Aisyah', nis: '2026002', class: '7A', type: 'SPP', month: 'Agustus 2026', year: 2026, amount: 350000, status: 'PAID', paid: '2026-08-05', method: 'TRANSFER' },
  { id: '3', student: 'Budi Permana', nis: '2026003', class: '7B', type: 'SPP', month: 'Agustus 2026', year: 2026, amount: 350000, status: 'PENDING', due: '2026-08-28' },
  { id: '4', student: 'Dewi Anggraini', nis: '2026004', class: '8A', type: 'SPP', month: 'Agustus 2026', year: 2026, amount: 350000, status: 'PAID', paid: '2026-08-08', method: 'QRIS' },
  { id: '5', student: 'Reza Firmansyah', nis: '2026005', class: '9A', type: 'SPP', month: 'Juli 2026', year: 2026, amount: 350000, status: 'PAID', paid: '2026-07-10', method: 'TUNAI' },
  { id: '6', student: 'Amelia Rahmawati', nis: '2026006', class: '8B', type: 'SPP', month: 'Juli 2026', year: 2026, amount: 350000, status: 'PAID', paid: '2026-07-08', method: 'TUNAI' },
  { id: '7', student: 'Daffa Afrizal', nis: '2026007', class: '7A', type: 'SPP', month: 'September 2026', year: 2026, amount: 350000, status: 'PENDING', due: '2026-09-28' },
  { id: '8', student: 'Eva Nurmalasari', nis: '2026008', class: '7B', type: 'SPP', month: 'September 2026', year: 2026, amount: 350000, status: 'PENDING', due: '2026-09-28' },
];

const SAMPLE_STUDENTS_ALL_CLASSES = [
  { student: 'Ahmad Rizki Pratama', nis: '2026001', class: '7A' },
  { student: 'Siti Nur Aisyah', nis: '2026002', class: '7A' },
  { student: 'Daffa Afrizal', nis: '2026007', class: '7A' },
  { student: 'Budi Permana', nis: '2026003', class: '7B' },
  { student: 'Eva Nurmalasari', nis: '2026008', class: '7B' },
  { student: 'Dewi Anggraini', nis: '2026004', class: '8A' },
  { student: 'Faris Hidayat', nis: '2026009', class: '8A' },
  { student: 'Amelia Rahmawati', nis: '2026006', class: '8B' },
  { student: 'Gita Gutawa', nis: '2026010', class: '8B' },
  { student: 'Reza Firmansyah', nis: '2026005', class: '9A' },
  { student: 'Hendra Setiawan', nis: '2026011', class: '9A' },
  { student: 'Indah Permatasari', nis: '2026012', class: '9B' },
];

export default function AdminKeuanganPage() {
  const { addLog } = useActivityLogStore();
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);

  // Load live data from Backend Express API

  useEffect(() => {
    const fetchPaymentsBackend = async () => {
      try {
        const stats = await paymentService.getPaymentStats();
        if (stats && stats.bills && Array.isArray(stats.bills) && stats.bills.length > 0) {
          const mapped: BillItem[] = stats.bills.map((b: any) => ({
            id: b.id,
            student: b.student?.fullName || b.studentName || 'Siswa',
            nis: b.student?.nis || b.nis || '2026001',
            class: b.student?.class?.name || b.className || '7A',
            type: b.type || 'SPP',
            month: b.month ? `${b.month} ${b.year || 2026}` : 'Agustus 2026',
            year: b.year || 2026,
            amount: b.amount || 350000,
            status: b.status,
            due: b.dueDate ? String(b.dueDate).split('T')[0] : '2026-08-28',
            paid: b.paidAt ? String(b.paidAt).split('T')[0] : undefined,
            method: b.method,
          }));
          setBills(mapped);
        }
      } catch (err) {
        console.warn('Menggunakan data tagihan SPP lokal:', err);
      }
    };
    fetchPaymentsBackend();
  }, []);


  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'SEMUA' | 'PAID' | 'PENDING'>('SEMUA');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const pageSize = 5;

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState<BillItem | null>(null);

  // Single Delete 2-Step Modal
  const [showDeleteSingleModal, setShowDeleteSingleModal] = useState<BillItem | null>(null);
  const [singleDeleteStep, setSingleDeleteStep] = useState<1 | 2>(1);
  const [singleConfirmTextInput, setSingleConfirmTextInput] = useState('');

  // Double Confirmation Modal for Delete All SPP
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearStep, setClearStep] = useState<1 | 2>(1);
  const [confirmTextInput, setConfirmTextInput] = useState('');

  // Form States for Single Create
  const [newStudentName, setNewStudentName] = useState('');
  const [newNis, setNewNis] = useState('');
  const [newClass, setNewClass] = useState('7A');
  const [newMonthName, setNewMonthName] = useState('Oktober');
  const [newYearVal, setNewYearVal] = useState('2026');
  const [newAmount, setNewAmount] = useState('350000');

  // Form States for Batch Create
  const [batchMonthName, setBatchMonthName] = useState('Oktober');
  const [batchYearVal, setBatchYearVal] = useState('2026');
  const [batchAmount, setBatchAmount] = useState('350000');
  const [batchTargetClass, setBatchTargetClass] = useState('ALL');

  // Form State for Pay Confirmation
  const [payMethod, setPayMethod] = useState<'TUNAI' | 'QRIS' | 'TRANSFER'>('TUNAI');

  // Fetch Bills from Backend API
  useEffect(() => {
    const fetchBackendBills = async () => {
      try {
        const stats = await paymentService.getPaymentStats();
        if (stats?.payments && Array.isArray(stats.payments) && stats.payments.length > 0) {
          const mapped: BillItem[] = stats.payments.map((p: any) => ({
            id: p.id,
            student: p.student?.fullName || 'Siswa',
            nis: p.student?.nis || '-',
            class: p.student?.class?.name || '7A',
            type: p.type || 'SPP',
            month: `${p.month || 'Agustus'} ${p.year || 2026}`,
            year: p.year || 2026,
            amount: p.amount,
            status: p.status,
            due: p.dueDate ? String(p.dueDate).split('T')[0] : '2026-08-28',
            paid: p.paidAt ? String(p.paidAt).split('T')[0] : undefined,
            method: p.method,
          }));
          setBills(mapped);
        }
      } catch (err) {
        console.warn('Backend bills load warning:', err);
      }

    };
    fetchBackendBills();
  }, []);

  // Dynamically Filtered Bills by Active Filters
  const filtered = bills.filter((b) => {
    const matchStatus = filterStatus === 'SEMUA' || b.status === filterStatus;
    const matchClass = filterClass === 'ALL' || b.class === filterClass;
    const matchMonth = filterMonth === 'ALL' || b.month.toLowerCase().includes(filterMonth.toLowerCase());
    const matchYear = filterYear === 'ALL' || String(b.year) === filterYear || b.month.includes(filterYear);
    const matchSearch =
      b.student.toLowerCase().includes(search.toLowerCase()) ||
      b.nis.includes(search) ||
      b.month.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchClass && matchMonth && matchYear && matchSearch;
  });

  // Dynamic Calculated Summaries
  const totalAmount = filtered.reduce((acc, curr) => acc + curr.amount, 0);
  const paidAmount = filtered.filter((b) => b.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = filtered.filter((b) => b.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);
  const progressPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // Dynamic Filter Period Sub-label
  const filterPeriodLabel = `${filterMonth !== 'ALL' ? filterMonth : 'Semua Bulan'} ${
    filterYear !== 'ALL' ? filterYear : 'Semua Tahun'
  } ${filterClass !== 'ALL' ? `(Kelas ${filterClass})` : '(Seluruh Kelas)'}`;

  // Pagination calculations
  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportSPPExcel({
        month: filterMonth !== 'ALL' ? filterMonth : 'Semua Bulan 2026',
        rows: filtered.map((b) => ({
          nis: b.nis,
          name: b.student,
          class: b.class,
          amount: b.amount,
          status: b.status === 'PAID' ? 'Lunas' : 'Belum Bayar',
          paidAt: b.paid || '-',
        })),
      });

      addLog({
        user: 'Admin Utama',
        role: 'ADMIN',
        action: 'Ekspor Laporan Keuangan SPP',
        module: 'Keuangan',
        severity: 'INFO',
        details: `Mengunduh berkas laporan Keuangan SPP dalam format Excel (${filtered.length} baris data)`,
      });

      toast.success('Unduh Berhasil', 'Laporan Keuangan SPP berhasil disimpan.');
    } catch {
      toast.error('Gagal Unduh', 'Terjadi kesalahan saat membuat dokumen Excel.');
    } finally {
      setExporting(false);
    }
  };

  const handleCreateSingleBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newNis.trim()) {
      toast.error('Data Belum Lengkap', 'Nama Siswa dan NIS wajib diisi.');
      return;
    }

    const fullMonthStr = `${newMonthName} ${newYearVal}`;
    const amountNum = parseInt(newAmount, 10) || 350000;
    const newBill: BillItem = {
      id: String(Date.now()),
      student: newStudentName,
      nis: newNis,
      class: newClass,
      type: 'SPP',
      month: fullMonthStr,
      year: parseInt(newYearVal, 10) || 2026,
      amount: amountNum,
      status: 'PENDING',
      due: `${newYearVal}-10-28`,
    };

    setBills([newBill, ...bills]);

    try {
      await paymentService.createSingleBill({
        studentName: newStudentName,
        nis: newNis,
        month: newMonthName,
        year: parseInt(newYearVal, 10) || 2026,
        amount: amountNum,
      });
    } catch (err) {
      console.warn('Backend create bill API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Penerbitan Tagihan SPP Individu',
      module: 'Keuangan',
      severity: 'SUCCESS',
      details: `Menerbitkan tagihan SPP ${fullMonthStr} untuk ${newStudentName} (NIS: ${newNis}, Kelas: ${newClass})`,
    });

    setShowCreateModal(false);
    setNewStudentName('');
    setNewNis('');
    toast.success('Tagihan Berhasil Dibuat', `Tagihan SPP ${fullMonthStr} untuk ${newStudentName} telah diterbitkan.`);
  };

  const handleCreateBatchBills = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullMonthStr = `${batchMonthName} ${batchYearVal}`;
    const amountNum = parseInt(batchAmount, 10) || 350000;

    const targetStudents =
      batchTargetClass === 'ALL'
        ? SAMPLE_STUDENTS_ALL_CLASSES
        : SAMPLE_STUDENTS_ALL_CLASSES.filter((s) => s.class === batchTargetClass);

    const newGeneratedBills: BillItem[] = targetStudents
      .filter((s) => !bills.some((b) => b.nis === s.nis && b.month === fullMonthStr))
      .map((s, idx) => ({
        id: `batch-${Date.now()}-${idx}`,
        student: s.student,
        nis: s.nis,
        class: s.class,
        type: 'SPP',
        month: fullMonthStr,
        year: parseInt(batchYearVal, 10) || 2026,
        amount: amountNum,
        status: 'PENDING',
        due: `${batchYearVal}-10-28`,
      }));

    if (newGeneratedBills.length === 0) {
      toast.error('Tagihan Sudah Ada', `Tagihan SPP ${fullMonthStr} untuk kelas target sudah diterbitkan sebelumnya.`);
      return;
    }

    setBills([...newGeneratedBills, ...bills]);

    try {
      await paymentService.createBulkSPP({
        month: 10,
        year: parseInt(batchYearVal, 10) || 2026,
        amount: amountNum,
      });
    } catch (err) {
      console.warn('Backend bulk SPP API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Penerbitan Tagihan SPP Serentak',
      module: 'Keuangan',
      severity: 'SUCCESS',
      details: `Menerbitkan ${newGeneratedBills.length} tagihan SPP ${fullMonthStr} untuk ${batchTargetClass === 'ALL' ? 'Semua Kelas (7A - 9B)' : `Kelas ${batchTargetClass}`}`,
    });

    setShowBatchModal(false);
    toast.success(
      'Penerbitan Serentak Berhasil',
      `Berhasil menerbitkan ${newGeneratedBills.length} tagihan SPP ${fullMonthStr} untuk ${
        batchTargetClass === 'ALL' ? 'Semua Kelas (7A - 9B)' : `Kelas ${batchTargetClass}`
      }.`
    );
  };

  const handleOpenSingleDeleteModal = (b: BillItem) => {
    setShowDeleteSingleModal(b);
    setSingleDeleteStep(1);
    setSingleConfirmTextInput('');
  };

  const handleExecuteSingleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeleteSingleModal) return;
    if (singleConfirmTextInput.trim().toUpperCase() !== 'HAPUS') {
      toast.error('Teks Konfirmasi Salah', "Ketik kata 'HAPUS' untuk mengonfirmasi.");
      return;
    }

    const targetId = showDeleteSingleModal.id;
    setBills((prev) => prev.filter((b) => b.id !== targetId));

    try {
      await paymentService.deletePayment(targetId);
    } catch (err) {
      console.warn('Backend delete payment API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Penghapusan Tagihan SPP Individu',
      module: 'Keuangan',
      severity: 'DANGER',
      details: `Penghapusan tagihan SPP ${showDeleteSingleModal.month} atas nama ${showDeleteSingleModal.student} (NIS: ${showDeleteSingleModal.nis}, Kelas: ${showDeleteSingleModal.class})`,
    });

    toast.success('Tagihan Dihapus', `Tagihan SPP atas nama ${showDeleteSingleModal.student} berhasil dihapus.`);
    setShowDeleteSingleModal(null);
    setSingleDeleteStep(1);
    setSingleConfirmTextInput('');
  };

  const handleOpenClearModal = () => {
    setClearStep(1);
    setConfirmTextInput('');
    setShowClearModal(true);
  };

  const handleExecuteClearAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmTextInput.trim().toUpperCase() !== 'HAPUS') {
      toast.error('Teks Konfirmasi Salah', "Ketik kata 'HAPUS' untuk mengonfirmasi.");
      return;
    }

    const countBefore = bills.length;
    setBills([]);

    try {
      await paymentService.clearAllPayments();
    } catch (err) {
      console.warn('Backend clear all payments API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Pembersihan Total Data Tagihan SPP',
      module: 'Keuangan',
      severity: 'DANGER',
      details: `Mengosongkan seluruh data tagihan SPP (${countBefore} tagihan dikosongkan dari basis data portal)`,
    });

    setShowClearModal(false);
    setClearStep(1);
    setConfirmTextInput('');
    toast.success('Data SPP Dihapus', 'Seluruh data tagihan SPP berhasil dihapus.');
  };

  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal) return;

    setBills((prev) =>
      prev.map((b) =>
        b.id === showPayModal.id
          ? { ...b, status: 'PAID', paid: new Date().toISOString().split('T')[0], method: payMethod }
          : b
      )
    );

    try {
      await paymentService.recordPayment(showPayModal.id, { method: payMethod });
    } catch (err) {
      console.warn('Backend record payment API failed:', err);
    }

    addLog({
      user: 'Admin Utama',
      role: 'ADMIN',
      action: 'Konfirmasi Pelunasan SPP',
      module: 'Keuangan',
      severity: 'SUCCESS',
      details: `Konfirmasi pelunasan SPP ${showPayModal.month} atas nama ${showPayModal.student} via metode ${payMethod}`,
    });

    setShowPayModal(null);
    toast.success('Pembayaran Dikonfirmasi', `SPP atas nama ${showPayModal.student} dinyatakan LUNAS.`);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto px-1 sm:px-0 pb-8">
      {/* Header Page Title & Responsive Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Keuangan &amp; Pembayaran SPP Sekolah
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Pengelolaan tagihan SPP bulanan, konfirmasi pembayaran, dan penerbitan kuitansi siswa.
          </p>
        </div>

        {/* Action Buttons: 2x2 Grid on Mobile, Flex Row on Desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="h-9.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Download className="w-3.5 h-3.5 text-emerald-600" />}
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={handleOpenClearModal}
            className="h-9.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold shadow-2xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Hapus SPP</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="h-9.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span className="truncate">Tagihan Semua Kelas</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">Tagihan Individu</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards Proportional Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Target Tagihan</p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(totalAmount)}</p>
              <p className="text-[11px] text-slate-400 font-semibold">{filtered.length} tagihan pada filter ini</p>
            </div>
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs transition-all hover:border-emerald-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sudah Dilunasi</p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 tracking-tight">{formatCurrency(paidAmount)}</p>
              <p className="text-[11px] text-emerald-600 font-bold">
                {filtered.filter((b) => b.status === 'PAID').length} tagihan lunas
              </p>
            </div>
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs transition-all hover:border-amber-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belum Dibayar</p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-700 tracking-tight">{formatCurrency(pendingAmount)}</p>
              <p className="text-[11px] text-amber-700 font-bold">
                {filtered.filter((b) => b.status === 'PENDING').length} tagihan pending
              </p>
            </div>
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm font-bold text-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <span>Pencapaian Pembayaran SPP</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {filterPeriodLabel}
            </span>
          </div>
          <span className="text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-xs font-extrabold w-fit mt-1 sm:mt-0">
            {progressPct}% Terkumpul
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-xs font-semibold text-slate-500 pt-0.5">
          <span>Terkumpul: <strong className="text-slate-900">{formatCurrency(paidAmount)}</strong></span>
          <span>Target Total: <strong className="text-slate-900">{formatCurrency(totalAmount)}</strong></span>
        </div>
      </div>

      {/* Main Filtered Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Search & Mobile Responsive Multi-Filter Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-50/60">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="text"
              placeholder="Cari nama siswa atau NIS..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9.5 pl-9 pr-4 rounded-xl border border-slate-200/90 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
            {/* Filter Dropdowns Grid on Mobile */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              {/* Filter Bulan */}
              <div className="h-9.5 flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl px-2 sm:px-3 shadow-2xs overflow-hidden">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0 hidden sm:inline" />
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    setFilterMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL">Semua Bulan</option>
                  <option value="Juli">Juli</option>
                  <option value="Agustus">Agustus</option>
                  <option value="September">September</option>
                  <option value="Oktober">Oktober</option>
                  <option value="November">November</option>
                  <option value="Desember">Desember</option>
                  <option value="Januari">Januari</option>
                  <option value="Februari">Februari</option>
                  <option value="Maret">Maret</option>
                  <option value="April">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Juni">Juni</option>
                </select>
              </div>

              {/* Filter Tahun */}
              <div className="h-9.5 flex items-center bg-white border border-slate-200/90 rounded-xl px-2 sm:px-3 shadow-2xs overflow-hidden">
                <select
                  value={filterYear}
                  onChange={(e) => {
                    setFilterYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              {/* Filter Kelas */}
              <div className="h-9.5 flex items-center gap-1 bg-white border border-slate-200/90 rounded-xl px-2 sm:px-3 shadow-2xs overflow-hidden">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                <select
                  value={filterClass}
                  onChange={(e) => {
                    setFilterClass(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL">Semua Kelas</option>
                  <option value="7A">7A</option>
                  <option value="7B">7B</option>
                  <option value="8A">8A</option>
                  <option value="8B">8B</option>
                  <option value="9A">9A</option>
                  <option value="9B">9B</option>
                </select>
              </div>
            </div>

            {/* Filter Status Pills: 3 Equal Columns on Mobile */}
            <div className="h-9.5 grid grid-cols-3 sm:flex gap-1 bg-slate-100/90 rounded-xl p-1 border border-slate-200/80 w-full sm:w-auto">
              {(['SEMUA', 'PAID', 'PENDING'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilterStatus(f);
                    setCurrentPage(1);
                  }}
                  className={`px-2 sm:px-3 h-full rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    filterStatus === f
                      ? 'bg-white text-emerald-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'SEMUA' ? 'Semua' : f === 'PAID' ? 'Lunas' : 'Pending'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table with Smooth Mobile Horizontal Scroll */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-4 sm:px-5 py-3.5">SISWA</th>
                <th className="px-4 sm:px-5 py-3.5">KELAS</th>
                <th className="px-4 sm:px-5 py-3.5">PERIODE TAGIHAN</th>
                <th className="px-4 sm:px-5 py-3.5">NOMINAL</th>
                <th className="px-4 sm:px-5 py-3.5">TANGGAL</th>
                <th className="px-4 sm:px-5 py-3.5">STATUS</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-5 py-3.5">
                      <p className="text-xs font-bold text-slate-900">{b.student}</p>
                      <p className="text-[11px] text-slate-400 font-medium">NIS: {b.nis}</p>
                    </td>
                    <td className="px-4 sm:px-5 py-3.5">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        {b.class}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-xs font-semibold text-slate-700">
                      {b.type} — {b.month}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-xs font-extrabold text-slate-900">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-xs font-medium text-slate-500">
                      {b.status === 'PAID'
                        ? `Dibayar: ${formatDate(b.paid || '', { day: 'numeric', month: 'short' })}`
                        : `Jatuh tempo: ${formatDate(b.due || '', { day: 'numeric', month: 'short' })}`}
                    </td>
                    <td className="px-4 sm:px-5 py-3.5">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                          b.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {b.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'PENDING' ? (
                          <button
                            onClick={() => setShowPayModal(b)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center cursor-pointer"
                          >
                            Konfirmasi Bayar
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {b.method || 'TERVERIFIKASI'}
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenSingleDeleteModal(b)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Tagihan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-slate-500 font-medium">
                    Tidak ada tagihan SPP yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Interactive Pagination Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 text-xs font-semibold text-slate-500">
          <p className="text-[11px] sm:text-xs">
            Menampilkan <strong className="text-slate-900">{filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filtered.length)}</strong> dari{' '}
            <strong className="text-slate-900">{filtered.length}</strong> Tagihan
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
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

      {/* Modal: Custom React 2-Step Delete Single Bill */}
      {showDeleteSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-extrabold text-rose-800 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" /> Konfirmasi Hapus Tagihan
              </h3>
              <button onClick={() => setShowDeleteSingleModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {singleDeleteStep === 1 ? (
              <div className="space-y-4">
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1">
                  <p className="text-xs font-bold text-slate-900">{showDeleteSingleModal.student}</p>
                  <p className="text-xs text-slate-500 font-medium">NIS: {showDeleteSingleModal.nis} · Kelas {showDeleteSingleModal.class}</p>
                  <p className="text-xs text-slate-700 font-semibold pt-1">
                    Tagihan: {showDeleteSingleModal.month} — <strong className="text-rose-700">{formatCurrency(showDeleteSingleModal.amount)}</strong>
                  </p>
                </div>

                <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                  Apakah Anda yakin ingin menghapus tagihan SPP atas nama <strong>"{showDeleteSingleModal.student}"</strong> ({showDeleteSingleModal.month})? Data yang sudah dihapus tidak dapat dikembalikan.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDeleteSingleModal(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleDeleteStep(2)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Lanjutkan Hapus
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteSingleDelete} className="space-y-4">
                <div className="p-4 bg-rose-100/70 rounded-2xl border border-rose-300 space-y-2">
                  <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                    Untuk mengonfirmasi penghapusan tagihan <strong>"{showDeleteSingleModal.student}"</strong>, silakan ketik <strong>HAPUS</strong> pada kolom di bawah ini:
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Ketik HAPUS"
                    value={singleConfirmTextInput}
                    onChange={(e) => setSingleConfirmTextInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-xs font-bold text-rose-900 tracking-wider uppercase focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSingleDeleteStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={singleConfirmTextInput.trim().toUpperCase() !== 'HAPUS'}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all uppercase ${
                      singleConfirmTextInput.trim().toUpperCase() === 'HAPUS'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    HAPUS TAGIHAN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Semua SPP */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="font-extrabold text-rose-800 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" /> Konfirmasi Hapus Semua SPP
              </h3>
              <button onClick={() => setShowClearModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {clearStep === 1 ? (
              <div className="space-y-4">
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                  <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                    Apakah Anda yakin ingin menghapus seluruh data tagihan SPP (<strong>{bills.length} tagihan</strong>)? Data yang sudah dihapus tidak dapat dikembalikan.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setClearStep(2)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Lanjutkan Hapus
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecuteClearAll} className="space-y-4">
                <div className="p-4 bg-rose-100/70 rounded-2xl border border-rose-300 space-y-2">
                  <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                    Untuk mengonfirmasi penghapusan seluruh data SPP ({bills.length} tagihan), silakan ketik <strong>HAPUS</strong> pada kolom di bawah ini:
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Ketik HAPUS"
                    value={confirmTextInput}
                    onChange={(e) => setConfirmTextInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-xs font-bold text-rose-900 tracking-wider uppercase focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setClearStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={confirmTextInput.trim().toUpperCase() !== 'HAPUS'}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all uppercase ${
                      confirmTextInput.trim().toUpperCase() === 'HAPUS'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    HAPUS SEMUA SPP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Buat Tagihan SPP Serentak Semua Kelas */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600 shrink-0" /> Penerbitan Tagihan Serentak
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-500">
              Terbitkan tagihan SPP sekaligus untuk seluruh siswa di semua kelas (7A - 9B) untuk bulan yang dipilih.
            </p>

            <form onSubmit={handleCreateBatchBills} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Kelas</label>
                <select
                  value={batchTargetClass}
                  onChange={(e) => setBatchTargetClass(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="ALL">Semua Kelas (7A, 7B, 8A, 8B, 9A, 9B)</option>
                  <option value="7A">Kelas 7A</option>
                  <option value="7B">Kelas 7B</option>
                  <option value="8A">Kelas 8A</option>
                  <option value="8B">Kelas 8B</option>
                  <option value="9A">Kelas 9A</option>
                  <option value="9B">Kelas 9B</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bulan SPP</label>
                  <select
                    value={batchMonthName}
                    onChange={(e) => setBatchMonthName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Juli">Juli</option>
                    <option value="Agustus">Agustus</option>
                    <option value="September">September</option>
                    <option value="Oktober">Oktober</option>
                    <option value="November">November</option>
                    <option value="Desember">Desember</option>
                    <option value="Januari">Januari</option>
                    <option value="Februari">Februari</option>
                    <option value="Maret">Maret</option>
                    <option value="April">April</option>
                    <option value="Mei">Mei</option>
                    <option value="Juni">Juni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun</label>
                  <select
                    value={batchYearVal}
                    onChange={(e) => setBatchYearVal(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nominal per Siswa (Rp)</label>
                <input
                  type="number"
                  required
                  value={batchAmount}
                  onChange={(e) => setBatchAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Terbitkan Tagihan Serentak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Buat Tagihan SPP Individu */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600 shrink-0" /> Penerbitan Tagihan SPP Individu
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleBill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Muhammad Alvin"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NIS Siswa</label>
                  <input
                    type="text"
                    required
                    placeholder="2026009"
                    value={newNis}
                    onChange={(e) => setNewNis(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="8A">Kelas 8A</option>
                    <option value="8B">Kelas 8B</option>
                    <option value="9A">Kelas 9A</option>
                    <option value="9B">Kelas 9B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bulan SPP</label>
                  <select
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Juli">Juli</option>
                    <option value="Agustus">Agustus</option>
                    <option value="September">September</option>
                    <option value="Oktober">Oktober</option>
                    <option value="November">November</option>
                    <option value="Desember">Desember</option>
                    <option value="Januari">Januari</option>
                    <option value="Februari">Februari</option>
                    <option value="Maret">Maret</option>
                    <option value="April">April</option>
                    <option value="Mei">Mei</option>
                    <option value="Juni">Juni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tahun</label>
                  <select
                    value={newYearVal}
                    onChange={(e) => setNewYearVal(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Terbitkan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Pembayaran SPP */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Konfirmasi Pembayaran SPP
              </h3>
              <button onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-900">{showPayModal.student}</p>
              <p className="text-xs text-slate-500 font-medium">NIS: {showPayModal.nis} · Kelas {showPayModal.class}</p>
              <p className="text-xs text-slate-700 font-semibold pt-1">
                Tagihan: {showPayModal.month} — <strong className="text-emerald-700">{formatCurrency(showPayModal.amount)}</strong>
              </p>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'TUNAI', label: 'Tunai' },
                    { id: 'QRIS', label: 'QRIS' },
                    { id: 'TRANSFER', label: 'Transfer Bank' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        payMethod === m.id
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Konfirmasi Lunas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
