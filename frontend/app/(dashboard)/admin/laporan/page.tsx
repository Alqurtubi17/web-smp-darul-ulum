'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, BookOpen, Wallet, Download, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { exportNilaiExcel, exportAbsensiExcel, exportSPPExcel } from '@/lib/export';
import { formatCurrency } from '@/lib/utils';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const DUMMY_ATTENDANCE = [
  { class:'7A', hadir:94, izin:3, sakit:2, alpha:1 }, { class:'7B', hadir:91, izin:4, sakit:3, alpha:2 },
  { class:'8A', hadir:96, izin:2, sakit:1, alpha:1 }, { class:'8B', hadir:89, izin:5, sakit:4, alpha:2 },
  { class:'9A', hadir:95, izin:3, sakit:1, alpha:1 }, { class:'9B', hadir:92, izin:4, sakit:3, alpha:1 },
];

const MONTHLY_VISITORS = [
  {month:'Jan',visits:1240},{month:'Feb',visits:1580},{month:'Mar',visits:1320},
  {month:'Apr',visits:1890},{month:'Mei',visits:2100},{month:'Jun',visits:1760},
  {month:'Jul',visits:2340},{month:'Agu',visits:890},{month:'Sep',visits:0},
  {month:'Okt',visits:0},{month:'Nov',visits:0},{month:'Des',visits:0},
];

const maxVisits = Math.max(...MONTHLY_VISITORS.map(m=>m.visits));

export default function AdminLaporanPage() {
  const [exportingExcel, setExportingExcel] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const { data } = await apiClient.get('/dashboard/stats'); return data.data; },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => { const { data } = await apiClient.get('/payments/stats'); return data.data; },
  });

  const totalStudents = stats?.students?.total || 312;
  const totalSPPTarget = 109_200_000;
  const totalSPPCollected = stats?.payments?.collected || 87_500_000;
  const sppPct = Math.round((totalSPPCollected / totalSPPTarget) * 100);

  const handleExportSPP = async () => {
    setExportingExcel(true);
    try {
      // Demo data — ganti dengan real data dari API
      await exportSPPExcel({
        month: MONTHS[new Date().getMonth()],
        rows: [
          { nis:'2024001', name:'Ahmad Rizki Pratama', class:'7A', amount:350000, status:'PAID', paidAt:'2025-07-03' },
          { nis:'2024002', name:'Siti Nurhaliza', class:'7A', amount:350000, status:'PAID', paidAt:'2025-07-05' },
          { nis:'2024003', name:'Budi Permana', class:'7B', amount:350000, status:'PENDING' },
        ],
      });
    } finally { setExportingExcel(false); }
  };

  const handleExportAbsensi = async () => {
    setExportingExcel(true);
    try {
      await exportAbsensiExcel({
        className: 'Semua Kelas',
        month: MONTHS[new Date().getMonth()],
        rows: DUMMY_ATTENDANCE.map(a => ({
          nis: '-', name: `Kelas ${a.class}`,
          hadir: a.hadir, izin: a.izin, sakit: a.sakit, alpha: a.alpha,
          pct: a.hadir,
        })),
      });
    } finally { setExportingExcel(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Laporan & Statistik</h1>
          <p className="text-sm text-gray-500 mt-0.5">TA 2024/2025 · Semester Ganjil</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportAbsensi} disabled={exportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {exportingExcel ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            Absensi Excel
          </button>
          <button onClick={handleExportSPP} disabled={exportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:bg-green-400">
            {exportingExcel ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
            SPP Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon:<Users className="w-5 h-5"/>, label:'Total Siswa Aktif', value:String(totalStudents), sub:'dari 9 kelas', color:'bg-blue-500', trend:'+12 dari tahun lalu' },
          { icon:<BookOpen className="w-5 h-5"/>, label:'Rata-rata Kehadiran', value:'93.2%', sub:'semester ganjil', color:'bg-green-500', trend:'+1.3% dari semester lalu' },
          { icon:<Wallet className="w-5 h-5"/>, label:'Pembayaran SPP', value:`${sppPct}%`, sub:'dari target', color:'bg-yellow-500', trend:formatCurrency(totalSPPCollected) },
          { icon:<TrendingUp className="w-5 h-5"/>, label:'Rata-rata Nilai', value:'81.4', sub:'seluruh mapel', color:'bg-purple-500', trend:'+2.1 dari UTS lalu' },
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
              <TrendingUp className="w-3 h-3"/>{s.trend}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600"/>Pengunjung Website 2025
            </h2>
            <span className="text-xs text-gray-400">Total: {MONTHLY_VISITORS.reduce((a,b)=>a+b.visits,0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {MONTHLY_VISITORS.map(m=>(
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{height:'128px'}}>
                  {m.visits>0 ? (
                    <div className="w-full bg-green-500 hover:bg-green-600 rounded-t-lg transition-colors cursor-pointer relative group"
                      style={{height:`${(m.visits/maxVisits)*100}%`,minHeight:'4px'}}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {m.visits.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 rounded-t-lg" style={{height:'4px'}}/>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-5">SPP Juli 2025</h2>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-yellow-500 rounded-full transition-all" style={{width:`${sppPct}%`}}/>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label:'Target', value:formatCurrency(totalSPPTarget), c:'text-gray-900' },
              { label:'Terkumpul', value:formatCurrency(totalSPPCollected), c:'text-green-600' },
              { label:'Kurang', value:formatCurrency(totalSPPTarget-totalSPPCollected), c:'text-red-500' },
            ].map(s=>(
              <div key={s.label} className="p-3 bg-gray-50 rounded-xl">
                <p className={`text-base font-bold ${s.c}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance per class */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-sm">Rekap Kehadiran per Kelas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Kelas','Hadir (%)','Izin (%)','Sakit (%)','Alpha (%)','Status'].map(h=>(
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DUMMY_ATTENDANCE.map(row=>(
                <tr key={row.class} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5"><span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{row.class}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width:`${row.hadir}%`}}/>
                      </div>
                      <span className="text-sm font-medium text-green-600">{row.hadir}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-blue-600">{row.izin}%</td>
                  <td className="px-5 py-3.5 text-sm text-yellow-600">{row.sakit}%</td>
                  <td className="px-5 py-3.5 text-sm text-red-500">{row.alpha}%</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${row.hadir>=95?'bg-green-100 text-green-700':row.hadir>=90?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>
                      {row.hadir>=95?'✓ Sangat Baik':row.hadir>=90?'✓ Baik':'⚠ Perlu Perhatian'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
