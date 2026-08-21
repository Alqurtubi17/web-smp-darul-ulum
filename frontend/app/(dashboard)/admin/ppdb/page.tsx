'use client';

import { useState } from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

type Status = 'SEMUA' | 'PENDING' | 'VERIFIKASI' | 'LULUS' | 'DITOLAK';

const SAMPLE_ADMISSIONS = [
  { id:'1', regNum:'PDG-2025-00001', name:'Muhammad Fahri Ramadhan', gender:'L', parentName:'Ir. Ramadhan Putra', parentPhone:'081234567890', school:'SDN Wonorejo 1', status:'PENDING', createdAt:'2025-06-15' },
  { id:'2', regNum:'PDG-2025-00002', name:'Siti Aisyah Mardiyah', gender:'P', parentName:'H. Mardiyah', parentPhone:'082345678901', school:'MI Darul Hikmah', status:'VERIFIKASI', createdAt:'2025-06-14' },
  { id:'3', regNum:'PDG-2025-00003', name:'Rizky Firmansyah', gender:'L', parentName:'Firmansyah, S.E.', parentPhone:'083456789012', school:'SDN Mojo 2', status:'LULUS', createdAt:'2025-06-13', score:88 },
  { id:'4', regNum:'PDG-2025-00004', name:'Dewi Kurniasari', gender:'P', parentName:'Kurniasari', parentPhone:'084567890123', school:'SD Islam Al-Azhar', status:'LULUS', createdAt:'2025-06-12', score:92 },
  { id:'5', regNum:'PDG-2025-00005', name:'Ahmad Zulkifli', gender:'L', parentName:'Zulkifli, S.Pd.', parentPhone:'085678901234', school:'SDN Kenjeran 3', status:'DITOLAK', createdAt:'2025-06-11' },
  { id:'6', regNum:'PDG-2025-00006', name:'Nurul Hidayati', gender:'P', parentName:'Bambang Hidayat', parentPhone:'086789012345', school:'SDN Tandes 1', status:'PENDING', createdAt:'2025-06-10' },
  { id:'7', regNum:'PDG-2025-00007', name:'Fikri Alamsyah', gender:'L', parentName:'Sutrisno', parentPhone:'087890123456', school:'SD Muhammadiyah 4', status:'VERIFIKASI', createdAt:'2025-06-09' },
  { id:'8', regNum:'PDG-2025-00008', name:'Anisa Rahmawati', gender:'P', parentName:'H. Rahmawati', parentPhone:'088901234567', school:'MI NU Manukan', status:'LULUS', createdAt:'2025-06-08', score:95 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  VERIFIKASI: { label: 'Verifikasi', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Eye className="w-3 h-3" /> },
  LULUS: { label: 'Diterima', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  DITOLAK: { label: 'Ditolak', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: <XCircle className="w-3 h-3" /> },
};

const ITEMS_PER_PAGE = 5;

export default function AdminPPDBPage() {
  const [activeStatus, setActiveStatus] = useState<Status>('SEMUA');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = SAMPLE_ADMISSIONS.filter((a) =>
    (activeStatus === 'SEMUA' || a.status === activeStatus) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.regNum.includes(search))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = {
    total: SAMPLE_ADMISSIONS.length,
    pending: SAMPLE_ADMISSIONS.filter(a => a.status === 'PENDING').length,
    verifikasi: SAMPLE_ADMISSIONS.filter(a => a.status === 'VERIFIKASI').length,
    lulus: SAMPLE_ADMISSIONS.filter(a => a.status === 'LULUS').length,
    ditolak: SAMPLE_ADMISSIONS.filter(a => a.status === 'DITOLAK').length,
  };

  const toggleSelect = (id: string) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen PPDB Online</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Penerimaan Peserta Didik Baru T.A. 2025/2026</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 transition-colors shadow-2xs">
            <Download className="w-4 h-4 text-emerald-700" /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Pendaftar', value: stats.total, color: 'text-slate-900', bg: 'bg-white border-emerald-100' },
          { label: 'Menunggu', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50/80 border-amber-100' },
          { label: 'Verifikasi', value: stats.verifikasi, color: 'text-blue-700', bg: 'bg-blue-50/80 border-blue-100' },
          { label: 'Diterima', value: stats.lulus, color: 'text-emerald-700', bg: 'bg-emerald-50/80 border-emerald-100' },
          { label: 'Ditolak', value: stats.ditolak, color: 'text-rose-700', bg: 'bg-rose-50/80 border-rose-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-3xl border p-4 text-center shadow-2xs`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-extrabold text-slate-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input type="search" placeholder="Cari nama calon siswa atau no. pendaftaran..."
              value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs" />
          </div>
          <div className="flex gap-1.5 bg-emerald-50 p-1 rounded-2xl border border-emerald-100 overflow-x-auto">
            {(['SEMUA', 'PENDING', 'VERIFIKASI', 'LULUS', 'DITOLAK'] as Status[]).map((s) => (
              <button key={s} onClick={() => { setActiveStatus(s); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  activeStatus === s ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-950'
                }`}>
                {s === 'SEMUA' ? 'Semua' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="px-6 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <span className="text-xs text-emerald-950 font-extrabold">{selected.length} pendaftar dipilih</span>
            <div className="flex gap-2">
              <button className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition-colors shadow-2xs">Terima Semua</button>
              <button className="text-xs px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold hover:bg-rose-700 transition-colors shadow-2xs">Tolak Semua</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/20">
                <th className="px-5 py-3.5 text-left">
                  <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-600" onChange={(e) => {
                    setSelected(e.target.checked ? paginated.map(f => f.id) : []);
                  }} />
                </th>
                {['No. Reg', 'Nama Calon Siswa', 'Orang Tua & HP', 'Asal Sekolah', 'Tgl Daftar', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-extrabold text-slate-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {paginated.map((a) => {
                const statusCfg = STATUS_CONFIG[a.status];
                return (
                  <tr key={a.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-600"
                        checked={selected.includes(a.id)}
                        onChange={() => toggleSelect(a.id)} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-bold text-slate-600">{a.regNum}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">{a.name}</p>
                        <p className="text-[11px] font-bold text-slate-400">{a.gender === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{a.parentName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{a.parentPhone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-emerald-800">{a.school}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-semibold font-mono">
                      {formatDate(a.createdAt, { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full border ${statusCfg?.color}`}>
                        {statusCfg?.icon} {statusCfg?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors" title="Detail Pendaftar">
                          <Eye className="w-4 h-4" />
                        </button>
                        {a.status === 'PENDING' || a.status === 'VERIFIKASI' ? (
                          <>
                            <button className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors" title="Terima Siswa">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Tolak">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}
