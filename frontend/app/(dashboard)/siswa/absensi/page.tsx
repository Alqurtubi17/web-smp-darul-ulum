'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, TrendingUp, Calendar, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/Pagination';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

interface AttendanceRecord {
  date: string;
  timeIn: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';
  note?: string;
}

const ATTENDANCE_DATA: Record<string, AttendanceRecord[]> = {
  '2025-06': [
    { date:'2025-06-02', timeIn:'06.42 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-03', timeIn:'06.45 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-04', timeIn:'-', status:'SAKIT', note:'Demam tinggi (Surat dokter terlampir)' },
    { date:'2025-06-05', timeIn:'-', status:'SAKIT', note:'Istirahat dokter' },
    { date:'2025-06-06', timeIn:'06.38 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-09', timeIn:'06.40 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-10', timeIn:'06.44 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-11', timeIn:'-', status:'IZIN', note:'Keperluan keluarga di luar kota' },
    { date:'2025-06-12', timeIn:'06.41 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-13', timeIn:'06.35 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-16', timeIn:'06.43 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-17', timeIn:'06.45 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-18', timeIn:'06.39 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-19', timeIn:'06.40 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-20', timeIn:'06.42 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-23', timeIn:'06.36 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-24', timeIn:'06.44 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-25', timeIn:'06.45 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-26', timeIn:'06.40 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-27', timeIn:'06.42 WIB', status:'HADIR', note:'Hadir tepat waktu' },
    { date:'2025-06-30', timeIn:'06.37 WIB', status:'HADIR', note:'Hadir tepat waktu' },
  ],
};

const STATUS_CONFIG = {
  HADIR: { label:'Hadir', icon:<CheckCircle className="w-3.5 h-3.5"/>, color:'text-emerald-800 bg-emerald-100 border-emerald-200' },
  IZIN:  { label:'Izin',  icon:<Clock className="w-3.5 h-3.5"/>,       color:'text-blue-800 bg-blue-100 border-blue-200' },
  SAKIT: { label:'Sakit', icon:<AlertCircle className="w-3.5 h-3.5"/>, color:'text-amber-800 bg-amber-100 border-amber-200'},
  ALPHA: { label:'Alpha', icon:<XCircle className="w-3.5 h-3.5"/>,     color:'text-rose-800 bg-rose-100 border-rose-200' },
};

type StatusFilter = 'SEMUA' | 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';
const ITEMS_PER_PAGE = 5;

export default function SiswaAbsensiPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2025-06');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('SEMUA');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const rawData = ATTENDANCE_DATA[selectedMonth] || [];

  const filtered = rawData.filter(d => {
    const matchStatus = statusFilter === 'SEMUA' || d.status === statusFilter;
    const dateObj = new Date(d.date);
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday:'long' }).format(dateObj);
    const dateStr = new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(dateObj);

    const matchSearch =
      d.date.includes(search) ||
      dayName.toLowerCase().includes(search.toLowerCase()) ||
      dateStr.toLowerCase().includes(search.toLowerCase()) ||
      (d.note && d.note.toLowerCase().includes(search.toLowerCase()));

    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const rekap = {
    hadir: rawData.filter(d => d.status === 'HADIR').length,
    izin:  rawData.filter(d => d.status === 'IZIN').length,
    sakit: rawData.filter(d => d.status === 'SAKIT').length,
    alpha: rawData.filter(d => d.status === 'ALPHA').length,
    total: rawData.length,
  };
  const persentase = rekap.total > 0 ? Math.round((rekap.hadir / rekap.total) * 100) : 0;

  // Semester summary
  const semTotal = { hadir:82, izin:3, sakit:3, alpha:0, total:88 };
  const semPct = Math.round((semTotal.hadir / semTotal.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Data Absensi &amp; Kehadiran Siswa</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {user?.student?.fullName || 'Siswa'} · Kelas {user?.student?.class?.name || '8A'} · TA 2024/2025
          </p>
        </div>

        <div className="relative">
          <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
            className="pl-4 pr-9 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-extrabold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
            {['2025-06','2025-05','2025-04','2025-03','2025-02','2025-01'].map(m => {
              const [y,mo] = m.split('-');
              return <option key={m} value={m}>{MONTHS[parseInt(mo)-1]} {y}</option>;
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
        </div>
      </div>

      {/* Semester & Monthly summary banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-emerald-200 text-xs font-extrabold">Rekap Kehadiran Semester Ganjil 2024/2025</p>
            <p className="text-3xl font-black mt-0.5">{semPct}% Kehadiran Akademik</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/15 backdrop-blur-xs">
            <TrendingUp className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-extrabold text-white">Status Sangat Baik</span>
          </div>
        </div>
        <div className="h-2.5 bg-emerald-950/60 rounded-full overflow-hidden border border-emerald-700/50">
          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${semPct}%` }} />
        </div>
      </div>

      {/* Monthly Stats for Selected Month */}
      <div className="space-y-2">
        <p className="text-xs font-extrabold text-slate-700">
          Statistik Presensi Bulan {MONTHS[parseInt(selectedMonth.split('-')[1])-1]} {selectedMonth.split('-')[0]}:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key:'HADIR', val:rekap.hadir, cfg:STATUS_CONFIG.HADIR },
            { key:'IZIN', val:rekap.izin, cfg:STATUS_CONFIG.IZIN },
            { key:'SAKIT', val:rekap.sakit, cfg:STATUS_CONFIG.SAKIT },
            { key:'ALPHA', val:rekap.alpha, cfg:STATUS_CONFIG.ALPHA },
          ].map(item => (
            <div key={item.key} className={`${item.cfg.color} rounded-3xl border p-5 text-center shadow-2xs hover:scale-[1.02] transition-transform`}>
              <div className="flex justify-center mb-1.5">{item.cfg.icon}</div>
              <p className="text-2xl sm:text-3xl font-black">{item.val}</p>
              <p className="text-xs font-extrabold text-slate-700 mt-1">Hari {item.cfg.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        
        {/* Search & Filter Header */}
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="search"
              placeholder="Cari tanggal, hari, atau keterangan absensi..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          <div className="flex gap-1.5 bg-emerald-50/80 rounded-2xl p-1 border border-emerald-100 overflow-x-auto w-full sm:w-auto">
            {(['SEMUA','HADIR','IZIN','SAKIT','ALPHA'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  statusFilter === s ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-950'
                }`}
              >
                {s === 'SEMUA' ? 'Semua' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/20 text-slate-700 font-extrabold">
                <th className="px-6 py-3.5 text-left">Hari &amp; Tanggal</th>
                <th className="px-6 py-3.5 text-left">Jam Presensi Masuk</th>
                <th className="px-6 py-3.5 text-left">Status Kehadiran</th>
                <th className="px-6 py-3.5 text-left">Keterangan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {paginated.map((d, i) => {
                const cfg = STATUS_CONFIG[d.status];
                const dateObj = new Date(d.date);
                const dayName = new Intl.DateTimeFormat('id-ID', { weekday:'long' }).format(dateObj);
                const dateStr = new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(dateObj);

                return (
                  <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900">{dayName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{dateStr}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-700">{d.timeIn}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-600 font-medium">
                        {d.note || 'Tepat waktu'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Calendar className="w-12 h-12 text-emerald-600 opacity-30 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Tidak ada catatan absensi untuk kriteria ini</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
}
