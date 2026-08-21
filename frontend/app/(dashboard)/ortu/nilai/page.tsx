'use client';
import { useState } from 'react';
import { Trophy, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const GRADES = [
  { subject:'Matematika', avg:83.75, uts:82, uas:null, tugas:87.5 },
  { subject:'Bahasa Indonesia', avg:88, uts:87, uas:null, tugas:90 },
  { subject:'IPA', avg:78.75, uts:78, uas:null, tugas:82.5 },
  { subject:'Bahasa Inggris', avg:81.67, uts:84, uas:null, tugas:80 },
  { subject:'PAI', avg:92.33, uts:92, uas:null, tugas:93 },
  { subject:'IPS', avg:79, uts:76, uas:null, tugas:82 },
];
const overallAvg = GRADES.reduce((a,b) => a + b.avg, 0) / GRADES.length;
const KKM = 70;

export default function OrtuNilaiPage() {
  const { user } = useAuth();
  const [semester, setSemester] = useState(1);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nilai Anak</h1>
          <p className="text-sm text-gray-500 mt-0.5">Semester Ganjil 2024/2025</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[1,2].map(s => (
              <button key={s} onClick={() => setSemester(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${semester===s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
                Sem {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4"/> Rapor
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.parent?.students?.[0]?.fullName?.[0] || 'A'}
          </div>
          <div>
            <p className="text-purple-200 text-xs">Siswa</p>
            <p className="font-bold">{user?.parent?.students?.[0]?.fullName || 'Ahmad Rizki Pratama'}</p>
            <p className="text-purple-200 text-sm">Kelas 7A · TA 2024/2025</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-bold text-yellow-300">{overallAvg.toFixed(1)}</p>
            <p className="text-purple-200 text-xs">Rata-rata semua mapel</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500"/>
          <h2 className="font-semibold text-gray-900 text-sm">Nilai Per Mata Pelajaran</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Mata Pelajaran','Tugas','UTS','UAS','Rata-rata','Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {GRADES.map(g => {
                const pct = Math.round(g.avg);
                const isBelow = g.avg < KKM;
                return (
                  <tr key={g.subject} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{g.subject}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{g.tugas}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{g.uts}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{g.uas ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isBelow ? 'text-red-600' : 'text-green-600'}`}>{g.avg.toFixed(1)}</span>
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isBelow ? 'bg-red-500' : 'bg-green-500'}`} style={{ width:`${pct}%` }}/>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBelow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isBelow ? 'Di bawah KKM' : 'Tuntas'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
