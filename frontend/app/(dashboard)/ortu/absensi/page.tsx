'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DATA: {date:string;status:'HADIR'|'IZIN'|'SAKIT'|'ALPHA';note?:string}[] = [
  {date:'2025-06-02',status:'HADIR'},{date:'2025-06-03',status:'HADIR'},
  {date:'2025-06-04',status:'SAKIT',note:'Demam'},{date:'2025-06-05',status:'SAKIT',note:'Demam'},
  {date:'2025-06-06',status:'HADIR'},{date:'2025-06-09',status:'HADIR'},
  {date:'2025-06-10',status:'HADIR'},{date:'2025-06-11',status:'IZIN',note:'Keperluan keluarga'},
  {date:'2025-06-12',status:'HADIR'},{date:'2025-06-13',status:'HADIR'},
  {date:'2025-06-16',status:'HADIR'},{date:'2025-06-17',status:'HADIR'},
  {date:'2025-06-18',status:'HADIR'},{date:'2025-06-19',status:'HADIR'},
  {date:'2025-06-20',status:'HADIR'},{date:'2025-06-23',status:'HADIR'},
  {date:'2025-06-24',status:'HADIR'},{date:'2025-06-25',status:'HADIR'},
];
const STATUS_CFG = {
  HADIR:{label:'Hadir',icon:<CheckCircle className="w-4 h-4"/>,color:'text-green-600',bg:'bg-green-100'},
  IZIN:{label:'Izin',icon:<Clock className="w-4 h-4"/>,color:'text-blue-600',bg:'bg-blue-100'},
  SAKIT:{label:'Sakit',icon:<AlertCircle className="w-4 h-4"/>,color:'text-yellow-600',bg:'bg-yellow-100'},
  ALPHA:{label:'Alpha',icon:<XCircle className="w-4 h-4"/>,color:'text-red-600',bg:'bg-red-100'},
};
export default function OrtuAbsensiPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState('2025-06');
  const rekap = { hadir:DATA.filter(d=>d.status==='HADIR').length, izin:DATA.filter(d=>d.status==='IZIN').length, sakit:DATA.filter(d=>d.status==='SAKIT').length, alpha:DATA.filter(d=>d.status==='ALPHA').length };
  const pct = Math.round((rekap.hadir/DATA.length)*100);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Absensi Anak</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.parent?.students?.[0]?.fullName || 'Ahmad Rizki Pratama'} · Kelas 7A</p>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          {['2025-06','2025-05','2025-04'].map(m => { const [y,mo]=m.split('-'); return <option key={m} value={m}>{MONTHS[parseInt(mo)-1]} {y}</option>; })}
        </select>
      </div>
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-purple-200 text-xs">Kehadiran {MONTHS[parseInt(month.split('-')[1])-1]}</p>
            <p className="text-3xl font-bold mt-0.5">{pct}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-300"/>
        </div>
        <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full" style={{width:`${pct}%`}}/>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4 text-center">
          {Object.entries(rekap).map(([k,v]) => {
            const cfg = STATUS_CFG[k.toUpperCase() as keyof typeof STATUS_CFG];
            return <div key={k}><p className="text-xl font-bold text-white">{v}</p><p className="text-xs text-purple-200">{cfg.label}</p></div>;
          })}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
          <Calendar className="w-4 h-4 text-purple-600"/>
          <h2 className="font-semibold text-gray-900 text-sm">Detail Kehadiran</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {DATA.map((d,i) => {
            const cfg = STATUS_CFG[d.status];
            const dateObj = new Date(d.date);
            return (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} ${cfg.color}`}>{cfg.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {new Intl.DateTimeFormat('id-ID',{weekday:'long'}).format(dateObj)}
                  </p>
                  <p className="text-xs text-gray-400">{new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(dateObj)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  {d.note && <p className="text-xs text-gray-400 mt-0.5">{d.note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
