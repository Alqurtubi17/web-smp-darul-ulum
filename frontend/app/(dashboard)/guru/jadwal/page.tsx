'use client';

import { useState } from 'react';
import { Clock, Users, MapPin, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DAY_NAMES } from '@/lib/utils';

const SCHEDULE: Record<number, { time: string; class: string; subject: string; room: string; students: number }[]> = {
  1: [
    { time:'07.00–08.40', class:'8A', subject:'Matematika', room:'R.08A', students:32 },
    { time:'08.40–10.20', class:'7B', subject:'Matematika', room:'R.07B', students:30 },
    { time:'13.00–14.40', class:'9C', subject:'Matematika', room:'R.09C', students:31 },
  ],
  2: [
    { time:'07.00–08.40', class:'7A', subject:'Matematika', room:'R.07A', students:33 },
    { time:'10.35–12.15', class:'8B', subject:'Matematika', room:'R.08B', students:29 },
    { time:'13.00–14.40', class:'9A', subject:'Matematika', room:'R.09A', students:30 },
  ],
  3: [
    { time:'07.00–08.40', class:'8C', subject:'Matematika', room:'R.08C', students:28 },
    { time:'08.40–10.20', class:'9B', subject:'Matematika', room:'R.09B', students:32 },
  ],
  4: [
    { time:'07.00–08.40', class:'7C', subject:'Matematika', room:'R.07C', students:31 },
    { time:'08.40–10.20', class:'8A', subject:'Matematika', room:'R.08A', students:32 },
    { time:'13.00–14.40', class:'7B', subject:'Matematika', room:'R.07B', students:30 },
  ],
  5: [
    { time:'07.00–08.00', class:'9A', subject:'Pembinaan OSN', room:'R.OSN', students:12 },
    { time:'08.00–09.40', class:'8C', subject:'Matematika', room:'R.08C', students:28 },
  ],
};

export default function GuruJadwalPage() {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
  });

  const today = new Date().getDay();
  const total = Object.values(SCHEDULE).flat().length;
  const totalStudents = Object.values(SCHEDULE).flat().reduce((a, b) => a + b.students, 0);
  const uniqueClasses = new Set(Object.values(SCHEDULE).flat().map(s => s.class)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Jadwal Mengajar</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {user?.teacher?.fullName} · {user?.teacher?.subject}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon:<Clock className="w-5 h-5"/>, label:'Total Sesi/Minggu', value:total, color:'text-blue-600', bg:'bg-blue-50' },
          { icon:<BookOpen className="w-5 h-5"/>, label:'Kelas Diajar', value:uniqueClasses, color:'text-green-600', bg:'bg-green-50' },
          { icon:<Users className="w-5 h-5"/>, label:'Total Siswa', value:totalStudents, color:'text-purple-600', bg:'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-200 p-4 flex gap-3 items-center`}>
            <div className={s.color}>{s.icon}</div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[1,2,3,4,5].map(day => {
            const count = SCHEDULE[day]?.length || 0;
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`flex-1 py-3.5 text-center border-b-2 transition-all ${activeDay === day ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}>
                <p className={`text-xs font-semibold ${activeDay === day ? 'text-blue-700' : 'text-gray-500'}`}>
                  {DAY_NAMES[day]}
                  {day === today && <span className="ml-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Hari ini</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{count} sesi</p>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-3">
          {(SCHEDULE[activeDay] || []).length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-3">🏖️</p>
              <p className="text-sm">Tidak ada jadwal mengajar</p>
            </div>
          ) : (
            (SCHEDULE[activeDay] || []).map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-blue-300 transition-colors">
                <div className="text-center w-20 flex-shrink-0">
                  <p className="text-xs font-mono text-gray-500">{s.time.split('–')[0]}</p>
                  <p className="text-xs font-mono text-gray-400">– {s.time.split('–')[1]}</p>
                </div>
                <div className="w-0.5 bg-blue-500 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{s.class}</span>
                    <p className="font-semibold text-sm text-gray-900">{s.subject}</p>
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{s.room}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3"/>{s.students} siswa</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <a href="/guru/akademik/absensi"
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-center">
                    Absensi
                  </a>
                  <a href="/guru/akademik/nilai"
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 text-center">
                    Nilai
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly overview */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-sm">Ringkasan Mingguan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                {['Waktu','Senin','Selasa','Rabu','Kamis','Jumat'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {['07.00–08.40','08.40–10.20','10.35–12.15','13.00–14.40'].map(timeSlot => (
                <tr key={timeSlot} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-mono text-gray-400 whitespace-nowrap">{timeSlot}</td>
                  {[1,2,3,4,5].map(day => {
                    const match = (SCHEDULE[day] || []).find(s => s.time === timeSlot);
                    return (
                      <td key={day} className="px-4 py-3">
                        {match ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5">
                            <p className="text-[10px] font-bold text-blue-700">{match.class}</p>
                            <p className="text-[9px] text-blue-500">{match.room}</p>
                          </div>
                        ) : (
                          <span className="text-gray-200 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
