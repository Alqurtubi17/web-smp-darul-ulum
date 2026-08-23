'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  History, Search, Download, Eye,
  CheckCircle2, Info, AlertTriangle, X, RefreshCw, Trash2
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { useActivityLogStore, AuditLogItem } from '@/store/activity-log.store';
import { useToastStore, toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';

const MODULES = ['Semua Modul', 'Pengguna', 'Autentikasi', 'Akademik', 'Keuangan', 'Pengaturan', 'PPDB', 'Perpustakaan'];
const SEVERITIES = ['Semua Status', 'INFO', 'SUCCESS', 'WARNING', 'DANGER'];
const ITEMS_PER_PAGE = 7;

export default function AdminLogPage() {
  const { logs, initLogs, clearLogs, addLog } = useActivityLogStore();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('Semua Modul');
  const [severityFilter, setSeverityFilter] = useState('Semua Status');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initLogs();
  }, [initLogs]);

  const handleRefreshLogs = () => {
    setRefreshing(true);
    initLogs();
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Log Diperbarui', 'Data audit log aktivitas telah diperbarui.');
    }, 350);
  };

  // Filtering real logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.user.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress.includes(search);
      const matchModule = moduleFilter === 'Semua Modul' || l.module === moduleFilter;
      const matchSeverity = severityFilter === 'Semua Status' || l.severity === severityFilter;
      return matchSearch && matchModule && matchSeverity;
    });
  }, [logs, search, moduleFilter, severityFilter]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginated = filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenDetail = (log: AuditLogItem) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const handleClearLogsConfirm = () => {
    clearLogs();
    toast.warning('Log Aktivitas Dibersihkan', 'Seluruh riwayat audit log sebelumnya telah dikosongkan.');
    setShowClearConfirmModal(false);
  };

  const handleExportLogsCSV = () => {
    const headers = 'ID,Waktu,Pengguna,Peran,Modul,Aktivitas,IP Address,Severity,Detail\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.user}","${l.role}","${l.module}","${l.action.replace(/"/g, '""')}","${l.ipAddress}","${l.severity}","${(l.details || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Log_Aktivitas_SMP_Darul_Ulum_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.info('Export Log Dimulai', `Mengunduh ${filteredLogs.length} entri audit log ke CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & TOOLBAR ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Log Aktivitas Sistem</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Catatan rekam jejak aktivitas pengguna, pembaruan data, serta transaksi sistem secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs cursor-pointer"
            title="Kosongkan Riwayat Log"
          >
            <Trash2 className="w-3.5 h-3.5" /> Bersihkan Log
          </button>

          <button
            onClick={handleRefreshLogs}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Log
          </button>

          <button
            onClick={handleExportLogsCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Log (.csv)
          </button>
        </div>
      </div>

      {/* ── FILTER CONTROLS ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Cari pengguna, aksi, IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {MODULES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {SEVERITIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
          Menampilkan <span className="font-semibold text-slate-800">{filteredLogs.length}</span> log aktivitas nyata
        </div>
      </div>

      {/* ── LOG TABLE ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-3.5">WAKTU &amp; TANGGAL</th>
                <th className="px-4 py-3.5">PENGGUNA / AKTOR</th>
                <th className="px-4 py-3.5">AKTIVITAS &amp; MODUL</th>
                <th className="px-4 py-3.5">IP ADDRESS &amp; PERANGKAT</th>
                <th className="px-4 py-3.5 text-center">STATUS</th>
                <th className="px-4 py-3.5 text-center">DETAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Waktu */}
                    <td className="px-4 py-3.5 text-xs font-mono font-medium text-slate-500 whitespace-nowrap">
                      {l.timestamp}
                    </td>

                    {/* Pengguna */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                          {l.user[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-snug">{l.user}</p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                              l.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                : l.role === 'GURU'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : l.role === 'SISWA'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {l.role}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Aktivitas & Modul */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-slate-800 leading-snug">{l.action}</p>
                      <span className="text-[10px] font-medium text-slate-400">Modul: {l.module}</span>
                    </td>

                    {/* IP & Device */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-mono font-medium text-slate-700">{l.ipAddress}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{l.device}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          l.severity === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : l.severity === 'WARNING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : l.severity === 'DANGER'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-sky-50 text-sky-700 border border-sky-200/60'
                        }`}
                      >
                        {l.severity === 'SUCCESS' && <CheckCircle2 className="w-3 h-3" />}
                        {l.severity === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
                        {l.severity === 'INFO' && <Info className="w-3 h-3" />}
                        {l.severity}
                      </span>
                    </td>

                    {/* Detail */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenDetail(l)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Lihat Detail Log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-500 font-medium">
                    Belum ada log aktivitas terrekam. Lakukan aktivitas di portal untuk mencatat log baru.
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
          totalItems={filteredLogs.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* ── MODAL DETAIL LOG ────────────────────────────────────────────────── */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Detail Real Audit Log</h3>
                  <p className="text-[11px] font-mono text-slate-300">ID Log: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-normal text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Waktu Audit:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedLog.timestamp}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Aktor / Pengguna:</span>
                  <span className="font-semibold text-slate-900">{selectedLog.user}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Peran System:</span>
                  <span className="font-semibold text-emerald-700">{selectedLog.role}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-medium">Modul Target:</span>
                  <span className="font-semibold text-slate-900">{selectedLog.module}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">IP Address &amp; Client:</span>
                  <span className="font-mono text-slate-800 text-right">{selectedLog.ipAddress} ({selectedLog.device})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Aktivitas Nyata:</label>
                <p className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/80 font-medium text-slate-800">
                  {selectedLog.action}
                </p>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">Rincian Payload / Parameter:</label>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto">
                    {selectedLog.details}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRM CLEAR LOG ─────────────────────────────────────────── */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Kosongkan Riwayat Log?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus seluruh riwayat audit log aktivitas? Seluruh catatan rekam jejak sebelumnya akan dikosongkan.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearLogsConfirm}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Ya, Kosongkan Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
