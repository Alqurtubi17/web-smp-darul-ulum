'use client';

import { useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, Users, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Status = 'SEMUA' | 'PENDING' | 'VERIFIKASI' | 'LULUS' | 'DITOLAK';

const SAMPLE_ADMISSIONS = [
  { id:'1', regNum:'PDG-2025-00001', name:'Muhammad Fahri Ramadhan', gender:'L', parentName:'Ir. Ramadhan Putra', parentPhone:'081234567890', school:'SDN Wonorejo 1', status:'PENDING', createdAt:'2025-06-15' },
  { id:'2', regNum:'PDG-2025-00002', name:'Siti Aisyah Mardiyah', gender:'P', parentName:'H. Mardiyah', parentPhone:'082345678901', school:'MI Darul Hikmah', status:'VERIFIKASI', createdAt:'2025-06-14' },
  { id:'3', regNum:'PDG-2025-00003', name:'Rizky Firmansyah', gender:'L', parentName:'Firmansyah, S.E.', parentPhone:'083456789012', school:'SDN Mojo 2', status:'LULUS', createdAt:'2025-06-13', score:88 },
  { id:'4', regNum:'PDG-2025-00004', name:'Dewi Kurniasari', gender:'P', parentName:'Kurniasari', parentPhone:'084567890123', school:'SD Islam Al-Azhar', status:'LULUS', createdAt:'2025-06-12', score:92 },
  { id:'5', regNum:'PDG-2025-00005', name:'Ahmad Zulkifli', gender:'L', parentName:'Zulkifli, S.Pd.', parentPhone:'085678901234', school:'SDN Kenjeran 3', status:'DITOLAK', createdAt:'2025-06-11' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  VERIFIKASI: { label: 'Verifikasi', color: 'bg-blue-100 text-blue-700', icon: <Eye className="w-3 h-3" /> },
  LULUS: { label: 'Diterima', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  DITOLAK: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
  DAFTAR_ULANG: { label: 'Daftar Ulang', color: 'bg-purple-100 text-purple-700', icon: <CheckCircle className="w-3 h-3" /> },
};

export default function AdminPPDBPage() {
  const [activeStatus, setActiveStatus] = useState<Status>('SEMUA');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = SAMPLE_ADMISSIONS.filter((a) =>
    (activeStatus === 'SEMUA' || a.status === activeStatus) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.regNum.includes(search))
  );

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen PPDB</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tahun Ajaran 2025/2026</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Pendaftar', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Menunggu', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Verifikasi', value: stats.verifikasi, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Diterima', value: stats.lulus, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Ditolak', value: stats.ditolak, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="Cari nama atau no. pendaftaran..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
            {(['SEMUA', 'PENDING', 'VERIFIKASI', 'LULUS', 'DITOLAK'] as Status[]).map((s) => (
              <button key={s} onClick={() => setActiveStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeStatus === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {s === 'SEMUA' ? 'Semua' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="px-4 py-2.5 bg-green-50 border-b border-green-100 flex items-center gap-3">
            <span className="text-sm text-green-700 font-medium">{selected.length} dipilih</span>
            <div className="flex gap-2 ml-auto">
              <button className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">Terima Semua</button>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600">Tolak Semua</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="rounded text-green-600" onChange={(e) => {
                    setSelected(e.target.checked ? filtered.map(f => f.id) : []);
                  }} />
                </th>
                {['No. Daftar', 'Nama Calon Siswa', 'Orang Tua', 'Asal Sekolah', 'Tanggal Daftar', 'Status', 'Aksi'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => {
                const statusCfg = STATUS_CONFIG[a.status];
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5">
                      <input type="checkbox" className="rounded text-green-600"
                        checked={selected.includes(a.id)}
                        onChange={() => toggleSelect(a.id)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-500">{a.regNum}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm text-gray-700">{a.parentName}</p>
                        <p className="text-xs text-gray-400">{a.parentPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{a.school}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {formatDate(a.createdAt, { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg?.color}`}>
                        {statusCfg?.icon} {statusCfg?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        {a.status === 'PENDING' || a.status === 'VERIFIKASI' ? (
                          <>
                            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Terima">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Tolak">
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

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>Menampilkan {filtered.length} dari {SAMPLE_ADMISSIONS.length} data</span>
          <div className="flex gap-1">
            {[1,2,3].map(p => (
              <button key={p} className={`w-7 h-7 rounded-lg text-xs ${p===1 ? 'bg-green-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
