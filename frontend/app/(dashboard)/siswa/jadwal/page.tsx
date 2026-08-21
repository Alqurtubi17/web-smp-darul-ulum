'use client';

import { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { DAY_NAMES } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const SCHEDULE: Record<number, { time: string; subject: string; teacher: string; room: string; code: string; color: string }[]> = {
  1: [ // Senin
    { time: '07.00–08.40', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.08A', code: 'MTK', color: 'bg-blue-100 border-blue-200 text-blue-800' },
    { time: '08.40–10.20', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', room: 'R.08A', code: 'BIN', color: 'bg-green-100 border-green-200 text-green-800' },
    { time: '10.35–12.15', subject: 'IPA', teacher: 'Budi Santoso, S.Pd.', room: 'Lab IPA', code: 'IPA', color: 'bg-purple-100 border-purple-200 text-purple-800' },
    { time: '13.00–14.40', subject: 'Bahasa Inggris', teacher: 'Hendra Purnomo, S.Pd.', room: 'R.08A', code: 'BING', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' },
  ],
  2: [ // Selasa
    { time: '07.00–08.40', subject: 'IPS', teacher: 'Dewi Susanti, S.Pd.', room: 'R.08A', code: 'IPS', color: 'bg-orange-100 border-orange-200 text-orange-800' },
    { time: '08.40–10.20', subject: 'PKN', teacher: 'Agus Salim, S.Pd.', room: 'R.08A', code: 'PKN', color: 'bg-red-100 border-red-200 text-red-800' },
    { time: '10.35–12.15', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.08A', code: 'MTK', color: 'bg-blue-100 border-blue-200 text-blue-800' },
    { time: '13.00–14.40', subject: 'Seni Budaya', teacher: 'Ratna Dewi, S.Pd.', room: 'R.Seni', code: 'SBD', color: 'bg-pink-100 border-pink-200 text-pink-800' },
  ],
  3: [ // Rabu
    { time: '07.00–08.40', subject: 'PAI', teacher: 'Ustadz Ahmad Malik, Lc.', room: 'R.08A', code: 'PAI', color: 'bg-teal-100 border-teal-200 text-teal-800' },
    { time: '08.40–10.20', subject: 'PJOK', teacher: 'Joko Santoso, S.Pd.', room: 'Lapangan', code: 'PJOK', color: 'bg-lime-100 border-lime-200 text-lime-800' },
    { time: '10.35–12.15', subject: 'TIK', teacher: 'Rudi Hartono, S.Kom.', room: 'Lab Komputer', code: 'TIK', color: 'bg-indigo-100 border-indigo-200 text-indigo-800' },
  ],
  4: [ // Kamis
    { time: '07.00–08.40', subject: 'IPA', teacher: 'Budi Santoso, S.Pd.', room: 'Lab IPA', code: 'IPA', color: 'bg-purple-100 border-purple-200 text-purple-800' },
    { time: '08.40–10.20', subject: 'Bahasa Arab', teacher: 'Ustadzah Fatimah, Lc.', room: 'R.08A', code: 'ARB', color: 'bg-cyan-100 border-cyan-200 text-cyan-800' },
    { time: '10.35–12.15', subject: 'Bahasa Inggris', teacher: 'Hendra Purnomo, S.Pd.', room: 'R.08A', code: 'BING', color: 'bg-yellow-100 border-yellow-200 text-yellow-800' },
    { time: '13.00–14.40', subject: 'Tahfidz', teacher: 'Ustadz Ahmad Malik, Lc.', room: 'Masjid', code: 'THF', color: 'bg-emerald-100 border-emerald-200 text-emerald-800' },
  ],
  5: [ // Jumat
    { time: '07.00–08.00', subject: 'Tahfidz', teacher: 'Ustadz Ahmad Malik, Lc.', room: 'Masjid', code: 'THF', color: 'bg-emerald-100 border-emerald-200 text-emerald-800' },
    { time: '08.00–09.40', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.08A', code: 'MTK', color: 'bg-blue-100 border-blue-200 text-blue-800' },
    { time: '10.00–11.40', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', room: 'R.08A', code: 'BIN', color: 'bg-green-100 border-green-200 text-green-800' },
  ],
  6: [ // Sabtu
    { time: '07.00–08.40', subject: 'Ekskul Pramuka', teacher: 'Pembina Pramuka', room: 'Lapangan', code: 'EKS', color: 'bg-amber-100 border-amber-200 text-amber-800' },
    { time: '08.40–10.20', subject: 'Bimbel OSN', teacher: 'Tim Pembina', room: 'R.OSN', code: 'OSN', color: 'bg-violet-100 border-violet-200 text-violet-800' },
  ],
};

export default function SiswaJadwalPage() {
  const { user } = useAuth();
  const today = new Date().getDay(); // 0=Minggu
  const [activeDay, setActiveDay] = useState(today >= 1 && today <= 6 ? today : 1);

  const todaySchedule = SCHEDULE[activeDay] || [];
  const totalWeekHours = Object.values(SCHEDULE).flat().reduce((a, s) => {
    const [start, end] = s.time.split('–').map(t => {
      const [h, m] = t.split('.').map(Number);
      return h * 60 + m;
    });
    return a + (end - start);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Jadwal Pelajaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {user?.student?.fullName} · Kelas {user?.student?.class?.name} · TA 2024/2025
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Hari Belajar', value: '6 hari/minggu', icon: '📅' },
          { label: 'Total Jam/Minggu', value: `${Math.floor(totalWeekHours / 60)} jam`, icon: '⏱️' },
          { label: 'Mata Pelajaran', value: '12 mapel', icon: '📚' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="font-bold text-gray-900 text-sm">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map(day => {
            const isToday = day === today;
            const isActive = day === activeDay;
            const count = SCHEDULE[day]?.length || 0;
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-[80px] py-3.5 px-2 text-center border-b-2 transition-all ${
                  isActive
                    ? 'border-green-600 bg-green-50'
                    : 'border-transparent hover:bg-gray-50'
                }`}>
                <p className={`text-xs font-semibold ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
                  {DAY_NAMES[day]}
                  {isToday && <span className="ml-1 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full">Hari ini</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{count} pelajaran</p>
              </button>
            );
          })}
        </div>

        {/* Schedule list */}
        <div className="p-4 space-y-3">
          {todaySchedule.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <span className="text-4xl block mb-3">🏖️</span>
              <p className="text-sm">Tidak ada jadwal</p>
            </div>
          ) : (
            todaySchedule.map((s, i) => (
              <div key={i} className={`flex gap-4 p-4 rounded-xl border ${s.color}`}>
                <div className="text-center w-20 flex-shrink-0">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <Clock className="w-3 h-3 opacity-60" />
                    <span className="text-xs font-mono opacity-80">{s.time.split('–')[0]}</span>
                  </div>
                  <span className="text-xs font-mono opacity-60">– {s.time.split('–')[1]}</span>
                </div>
                <div className="w-0.5 bg-current opacity-20 rounded-full self-stretch" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold opacity-70 bg-current/10 px-1.5 py-0.5 rounded">{s.code}</span>
                    <p className="font-semibold text-sm">{s.subject}</p>
                  </div>
                  <p className="text-xs opacity-70">{s.teacher}</p>
                  <p className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{s.room}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly overview grid */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 text-sm">Jadwal Mingguan</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[640px] p-4">
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map(day => (
                <div key={day}>
                  <p className={`text-xs font-semibold text-center mb-2 ${day === today ? 'text-green-600' : 'text-gray-500'}`}>
                    {DAY_NAMES[day]}
                  </p>
                  <div className="space-y-1.5">
                    {(SCHEDULE[day] || []).map((s, i) => (
                      <div key={i} className={`p-2 rounded-lg border text-center ${s.color}`}>
                        <p className="text-[10px] font-bold">{s.code}</p>
                        <p className="text-[9px] opacity-70 mt-0.5">{s.time.split('–')[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
