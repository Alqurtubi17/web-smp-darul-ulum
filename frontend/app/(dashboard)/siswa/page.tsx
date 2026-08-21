'use client';

import { Trophy, CalendarDays, ClipboardList, BookOpen, Bell, QrCode, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStudentGrades, useStudentAttendance } from '@/hooks/useApi';
import { formatDate, DAY_NAMES } from '@/lib/utils';

const todaySchedule = [
  { time: '07.00–08.40', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'R.01' },
  { time: '08.40–10.20', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', room: 'R.01' },
  { time: '10.35–12.15', subject: 'IPA', teacher: 'Budi Santoso, S.Pd.', room: 'Lab IPA' },
  { time: '13.00–14.40', subject: 'Bahasa Inggris', teacher: 'Hendra Purnomo, S.Pd.', room: 'R.01' },
];

const recentGrades = [
  { subject: 'Matematika', type: 'UTS', score: 87, max: 100 },
  { subject: 'Bahasa Indonesia', type: 'Tugas', score: 92, max: 100 },
  { subject: 'IPA', type: 'UTS', score: 78, max: 100 },
  { subject: 'Bahasa Inggris', type: 'Ulangan Harian', score: 84, max: 100 },
];

const pendingTasks = [
  { title: 'Essay Bahasa Indonesia: Lingkungan Hidup', subject: 'B. Indonesia', due: '2025-07-05', status: 'urgent' },
  { title: 'Laporan Praktikum IPA: Fotosintesis', subject: 'IPA', due: '2025-07-07', status: 'normal' },
  { title: 'Soal Latihan Matematika Bab 5', subject: 'Matematika', due: '2025-07-10', status: 'normal' },
];

export default function SiswaDashboard() {
  const { user } = useAuth();
  const studentId = user?.student?.id || '';

  const { data: gradeData } = useStudentGrades(studentId, {
    academicYear: '2024/2025', semester: 1,
  });

  const { data: attendanceData } = useStudentAttendance(studentId, {
    academicYear: '2024/2025', semester: 1,
  });

  const rekap = (attendanceData as { rekap?: { hadir: number; izin: number; sakit: number; alpha: number; persentase: number } })?.rekap;
  const dayName = DAY_NAMES[new Date().getDay()] || 'Hari ini';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-900 rounded-2xl p-6 text-white">
        <p className="text-green-200 text-sm">Selamat datang kembali,</p>
        <h1 className="text-xl font-bold mt-0.5">{user?.student?.fullName} 👋</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1">
            📋 NIS: {user?.student?.nis}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1">
            🏫 Kelas {user?.student?.class?.name}
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1">
            📅 {formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Rekap kehadiran */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Hadir', value: rekap?.hadir ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Izin', value: rekap?.izin ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Sakit', value: rekap?.sakit ?? 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Alpha', value: rekap?.alpha ?? 0, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-2xl border border-gray-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Jadwal {dayName}</h2>
            </div>
            <a href="/siswa/jadwal" className="text-xs text-green-600 hover:text-green-700">Lihat semua</a>
          </div>
          <div className="divide-y divide-gray-100">
            {todaySchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="text-center w-20 flex-shrink-0">
                  <p className="text-xs font-mono text-gray-500 leading-tight">{s.time.split('–')[0]}</p>
                  <p className="text-xs font-mono text-gray-400">–{s.time.split('–')[1]}</p>
                </div>
                <div className="w-0.5 h-10 bg-green-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{s.subject}</p>
                  <p className="text-xs text-gray-500">{s.teacher} · {s.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tugas Menunggu */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-yellow-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Tugas Menunggu</h2>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingTasks.map((t, i) => (
              <div key={i} className="px-5 py-3.5">
                <div className="flex items-start gap-2">
                  {t.status === 'urgent'
                    ? <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">Mendesak</span>
                    : <CheckCircle2 className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 leading-snug">{t.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.subject} · Deadline: {formatDate(t.due, { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <a href="/siswa/tugas" className="block text-center text-xs text-green-600 hover:text-green-700 font-medium">
              Lihat semua tugas →
            </a>
          </div>
        </div>
      </div>

      {/* Nilai Terbaru */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Nilai Terbaru</h2>
          </div>
          <a href="/siswa/nilai" className="text-xs text-green-600 hover:text-green-700">Lihat semua</a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
          {recentGrades.map((g, i) => {
            const pct = Math.round((g.score / g.max) * 100);
            const color = pct >= 85 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-yellow-600';
            return (
              <div key={i} className="bg-white p-5">
                <p className="text-xs text-gray-500 mb-1">{g.subject}</p>
                <p className="text-xs text-gray-400 mb-2">{g.type}</p>
                <div className="flex items-end gap-1">
                  <span className={`text-2xl font-bold ${color}`}>{g.score}</span>
                  <span className="text-sm text-gray-400 mb-0.5">/{g.max}</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
