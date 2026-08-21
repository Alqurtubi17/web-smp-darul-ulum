'use client';

import { useState } from 'react';
import { Clock, MapPin, CalendarDays, BookOpen } from 'lucide-react';
import { DAY_NAMES } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const SCHEDULE: Record<number, { time: string; subject: string; teacher: string; room: string; code: string; color: string }[]> = {
  1: [ // Senin
    { time: '07.00–08.40', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.08A', code: 'MTK', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { time: '08.40–10.20', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', room: 'R.08A', code: 'BIN', color: 'bg-blue-50 border-blue-200 text-blue-900' },
    { time: '10.35–12.15', subject: 'IPA', teacher: 'Budi Santoso, S.Pd.', room: 'Lab IPA', code: 'IPA', color: 'bg-purple-50 border-purple-200 text-purple-900' },
    { time: '13.00–14.40', subject: 'Bahasa Inggris', teacher: 'Hendra Purnomo, S.Pd.', room: 'R.08A', code: 'BING', color: 'bg-teal-50 border-teal-200 text-teal-900' },
  ],
  2: [ // Selasa
    { time: '07.00–08.40', subject: 'IPS', teacher: 'Dewi Susanti, S.Pd.', room: 'R.08A', code: 'IPS', color: 'bg-amber-50 border-amber-200 text-amber-900' },
    { time: '08.40–10.20', subject: 'PKN', teacher: 'Agus Salim, S.Pd.', room: 'R.08A', code: 'PKN', color: 'bg-rose-50 border-rose-200 text-rose-900' },
    { time: '10.35–12.15', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.08A', code: 'MTK', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { time: '13.00–14.40', subject: 'Seni Budaya', teacher: 'Ratna Dewi, S.Pd.', room: 'R.Seni', code: 'SBD', color: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
  ],
  3: [ // Rabu
    { time: '07.00–08.40', subject: 'PAI & Ke-NU-an', teacher: 'Nur Hidayah, S.Ag.', room: 'R.08A', code: 'PAI', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { time: '08.40–10.20', subject: 'PJOK', teacher: 'Joko Santoso, S.Pd.', room: 'Lapangan', code: 'PJOK', color: 'bg-teal-50 border-teal-200 text-teal-900' },
    { time: '10.35–12.15', subject: 'TIK & Komputer', teacher: 'Rudi Hartono, S.Kom.', room: 'Lab Komputer', code: 'TIK', color: 'bg-blue-50 border-blue-200 text-blue-900' },
  ],
  4: [ // Kamis
    { time: '07.00–08.40', subject: 'IPA', teacher: 'Ahmad Fauzi, M.Pd.', room: 'Lab IPA', code: 'IPA', color: 'bg-purple-50 border-purple-200 text-purple-900' },
    { time: '08.40–10.20', subject: 'Bahasa Arab', teacher: 'Ustadzah Fatimah, Lc.', room: 'R.08A', code: 'ARB', color: 'bg-cyan-50 border-cyan-200 text-cyan-900' },
    { time: '10.35–12.15', subject: 'Bahasa Inggris', teacher: 'Rina Kartika, S.Pd.', room: 'R.08A', code: 'BING', color: 'bg-teal-50 border-teal-200 text-teal-900' },
    { time: '13.00–14.40', subject: 'Tahfidz Al-Qur\'an', teacher: 'Ustadz Ahmad Malik, Lc.', room: 'Musala', code: 'THF', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
  ],
  5: [ // Jumat
    { time: '07.00–08.00', subject: 'Pembiasaan Sholat & Tahfidz', teacher: 'Ustadz Ahmad Malik, Lc.', room: 'Musala', code: 'THF', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { time: '08.00–09.40', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.08A', code: 'MTK', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
    { time: '10.00–11.40', subject: 'Bahasa Indonesia', teacher: 'Bambang Kurniawan, S.Pd.', room: 'R.08A', code: 'BIN', color: 'bg-blue-50 border-blue-200 text-blue-900' },
  ],
  6: [ // Sabtu
    { time: '07.00–08.40', subject: 'Ekstrakurikuler Pramuka', teacher: 'Pembina Pramuka', room: 'Lapangan', code: 'EKS', color: 'bg-amber-50 border-amber-200 text-amber-900' },
    { time: '08.40–10.20', subject: 'Bimbel OSN & Klub Sains', teacher: 'Tim Pembina', room: 'Lab IPA', code: 'OSN', color: 'bg-purple-50 border-purple-200 text-purple-900' },
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
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Jadwal Pelajaran Siswa</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          {user?.student?.fullName || 'Siswa'} · Kelas {user?.student?.class?.name || '8A'} · Tahun Ajaran 2024/2025
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Hari Belajar', value: '6 Hari/Minggu', color: 'text-emerald-700 bg-emerald-50/80 border-emerald-100' },
          { label: 'Total Jam/Minggu', value: `${Math.floor(totalWeekHours / 60)} Jam`, color: 'text-blue-700 bg-blue-50/80 border-blue-100' },
          { label: 'Mata Pelajaran', value: '12 Mapel', color: 'text-purple-700 bg-purple-50/80 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-3xl border p-5 text-center shadow-2xs`}>
            <p className="font-black text-slate-900 text-xl sm:text-2xl">{s.value}</p>
            <p className="text-xs font-extrabold text-slate-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="flex border-b border-emerald-100 overflow-x-auto bg-emerald-50/30 p-2 gap-1">
          {[1, 2, 3, 4, 5, 6].map(day => {
            const isToday = day === today;
            const isActive = day === activeDay;
            const count = SCHEDULE[day]?.length || 0;
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-[90px] py-3 px-3 text-center rounded-2xl transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                    : 'bg-white text-slate-700 hover:bg-emerald-100/60 font-bold border border-emerald-100'
                }`}>
                <p className="text-xs">
                  {DAY_NAMES[day]}
                  {isToday && <span className="ml-1 text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.5 rounded-md">Hari ini</span>}
                </p>
                <p className={`text-[11px] mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{count} Pelajaran</p>
              </button>
            );
          })}
        </div>

        {/* Schedule list */}
        <div className="p-6 space-y-4">
          {todaySchedule.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">
              <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-600" />
              <p className="text-xs">Tidak ada jadwal pelajaran di hari ini</p>
            </div>
          ) : (
            todaySchedule.map((s, i) => (
              <div key={i} className={`flex gap-4 p-5 rounded-3xl border ${s.color} hover:shadow-xs transition-all`}>
                <div className="text-center w-24 flex-shrink-0">
                  <div className="flex items-center gap-1 justify-center mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-xs font-mono font-extrabold">{s.time.split('–')[0]}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold opacity-70">– {s.time.split('–')[1]}</span>
                </div>
                <div className="w-1 bg-emerald-600 rounded-full self-stretch flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">{s.code}</span>
                    <p className="font-extrabold text-sm text-slate-900">{s.subject}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">{s.teacher}</p>
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> Ruang: {s.room}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly overview grid */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/40">
          <h2 className="font-extrabold text-slate-900 text-sm">Ringkasan Jadwal Mingguan</h2>
        </div>
        <div className="overflow-x-auto p-6">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map(day => (
                <div key={day}>
                  <p className={`text-xs font-extrabold text-center mb-2.5 px-2 py-1 rounded-xl ${day === today ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-slate-800'}`}>
                    {DAY_NAMES[day]}
                  </p>
                  <div className="space-y-2">
                    {(SCHEDULE[day] || []).map((s, i) => (
                      <div key={i} className={`p-2.5 rounded-2xl border text-center ${s.color}`}>
                        <p className="text-xs font-black">{s.code}</p>
                        <p className="text-[10px] font-mono font-semibold opacity-80 mt-0.5">{s.time.split('–')[0]}</p>
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
