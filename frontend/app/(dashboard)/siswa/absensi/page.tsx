'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const ATTENDANCE_DATA: Record<string, { date: string; status: 'HADIR'|'IZIN'|'SAKIT'|'ALPHA'; subject?: string; note?: string }[]> = {
  '2025-06': [
    { date:'2025-06-02', status:'HADIR' }, { date:'2025-06-03', status:'HADIR' },
    { date:'2025-06-04', status:'SAKIT', note:'Demam' }, { date:'2025-06-05', status:'SAKIT', note:'Demam' },
    { date:'2025-06-06', status:'HADIR' }, { date:'2025-06-09', status:'HADIR' },
    { date:'2025-06-10', status:'HADIR' }, { date:'2025-06-11', status:'IZIN', note:'Keperluan keluarga' },
    { date:'2025-06-12', status:'HADIR' }, { date:'2025-06-13', status:'HADIR' },
    { date:'2025-06-16', status:'HADIR' }, { date:'2025-06-17', status:'HADIR' },
    { date:'2025-06-18', status:'HADIR' }, { date:'2025-06-19', status:'HADIR' },
    { date:'2025-06-20', status:'HADIR' }, { date:'2025-06-23', status:'HADIR' },
    { date:'2025-06-24', status:'HADIR' }, { date:'2025-06-25', status:'HADIR' },
    { date:'2025-06-26', status:'HADIR' }, { date:'2025-06-27', status:'HADIR' },
    { date:'2025-06-30', status:'HADIR' },
  ],
};

const STATUS_CONFIG = {
  HADIR: { label:'Hadir', icon:<CheckCircle className="w-4 h-4"/>, color:'text-green-600', bg:'bg-green-100', cell:'bg-green-500' },
  IZIN:  { label:'Izin',  icon:<Clock className="w-4 h-4"/>,       color:'text-blue-600',  bg:'bg-blue-100',  cell:'bg-blue-500' },
  SAKIT: { label:'Sakit', icon:<AlertCircle className="w-4 h-4"/>, color:'text-yellow-600',bg:'bg-yellow-100',cell:'bg-yellow-500'},
  ALPHA: { label:'Alpha', icon:<XCircle className="w-4 h-4"/>,     color:'text-red-600',   bg:'bg-red-100',    cell:'bg-red-500' },
};

export default function SiswaAbsensiPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2025-06');

  const data = ATTENDANCE_DATA[selectedMonth] || [];
  const rekap = {
    hadir: data.filter(d => d.status === 'HADIR').length,
    izin:  data.filter(d => d.status === 'IZIN').length,
    sakit: data.filter(d => d.status === 'SAKIT').length,
    alpha: data.filter(d => d.status === 'ALPHA').length,
    total: data.length,
  };
  const persentase = rekap.total > 0 ? Math.round((rekap.hadir / rekap.total) * 100) : 0;

  // Aggregate semester total (dummy)
  const semTotal = { hadir:82, izin:3, sakit:3, alpha:0, total:88 };
  const semPct = Math.round((semTotal.hadir / semTotal.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Absensi Saya</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.student?.fullName} · Kelas {user?.student?.class?.name}
          </p>
        </div>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          {['2025-06','2025-05','2025-04','2025-03','2025-02','2025-01'].map(m => {
            const [y,mo] = m.split('-');
            return <option key={m} value={m}>{MONTHS[parseInt(mo)-1]} {y}</option>;
          })}
        </select>
      </div>

      {/* Semester summary */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-200 text-xs">Rekap Semester Ganjil 2024/2025</p>
            <p className="text-2xl font-bold mt-0.5">{semPct}% Kehadiran</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-300" />
        </div>
        <div className="h-2 bg-green-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{ width: `${semPct}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4 text-center">
          {[
            { label:'Hadir', val:semTotal.hadir, color:'text-green-300' },
            { label:'Izin',  val:semTotal.izin,  color:'text-blue-300' },
            { label:'Sakit', val:semTotal.sakit, color:'text-yellow-300' },
            { label:'Alpha', val:semTotal.alpha, color:'text-red-300' },
          ].map(s => (
            <div key={s.label}>
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-green-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(rekap).filter(([k]) => k !== 'total').map(([k, v]) => {
          const cfg = STATUS_CONFIG[k.toUpperCase() as keyof typeof STATUS_CONFIG];
          return (
            <div key={k} className={`${cfg.bg} rounded-2xl border border-gray-200 p-4 text-center`}>
              <div className={`flex justify-center mb-2 ${cfg.color}`}>{cfg.icon}</div>
              <p className={`text-2xl font-bold ${cfg.color}`}>{v}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Detail list */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-gray-900 text-sm">
              Detail — {MONTHS[parseInt(selectedMonth.split('-')[1])-1]} {selectedMonth.split('-')[0]}
            </h2>
          </div>
          <span className="text-xs text-gray-400">{data.length} hari sekolah · {persentase}% hadir</span>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tidak ada data absensi untuk bulan ini</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((d, i) => {
              const cfg = STATUS_CONFIG[d.status];
              const dateObj = new Date(d.date);
              const dayName = new Intl.DateTimeFormat('id-ID', { weekday:'long' }).format(dateObj);
              const dateStr = new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(dateObj);
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{dayName}</p>
                    <p className="text-xs text-gray-400">{dateStr}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {d.note && <p className="text-xs text-gray-400 mt-0.5">{d.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
