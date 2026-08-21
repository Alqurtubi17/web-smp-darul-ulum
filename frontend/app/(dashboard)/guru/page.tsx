'use client';

import { CalendarDays, Users, ClipboardList, BookOpen, Bell, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, DAY_NAMES } from '@/lib/utils';

const todayClasses = [
  { time: '07.00–08.40', class: '8A', subject: 'Matematika', room: 'R.08A', students: 32, done: true },
  { time: '08.40–10.20', class: '7B', subject: 'Matematika', room: 'R.07B', students: 30, done: true },
  { time: '10.35–12.15', class: '9C', subject: 'Matematika', room: 'R.09C', students: 31, done: false },
  { time: '13.00–14.40', class: '8C', subject: 'Matematika', room: 'R.08C', students: 29, done: false },
];

const pendingTasks = [
  { title: 'Nilai UTS Matematika kelas 8A belum diinput', urgency: 'high', count: 32 },
  { title: '3 tugas siswa kelas 7B menunggu penilaian', urgency: 'medium', count: 3 },
  { title: 'Absensi kelas 9C hari ini belum diisi', urgency: 'high', count: null },
  { title: 'Upload materi Bab 6 Aljabar', urgency: 'low', count: null },
];

const recentSubmissions = [
  { name: 'Ahmad Rizki', class: '8A', task: 'Latihan Soal Bab 5', submittedAt: '10 menit lalu', status: 'new' },
  { name: 'Siti Nurhaliza', class: '8A', task: 'Latihan Soal Bab 5', submittedAt: '25 menit lalu', status: 'new' },
  { name: 'Budi Permana', class: '7B', task: 'PR Persamaan Linear', submittedAt: '1 jam lalu', status: 'reviewed' },
  { name: 'Dewi Anggraini', class: '8A', task: 'Latihan Soal Bab 5', submittedAt: '2 jam lalu', status: 'reviewed' },
];

export default function GuruDashboard() {
  const { user } = useAuth();
  const dayName = DAY_NAMES[new Date().getDay()] || 'Hari ini';

  const totalStudents = todayClasses.reduce((a, b) => a + b.students, 0);
  const doneClasses = todayClasses.filter((c) => c.done).length;
  const highPriority = pendingTasks.filter((t) => t.urgency === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm">Portal Guru</p>
        <h1 className="text-xl font-bold mt-0.5">{user?.teacher?.fullName || 'Guru'} 👋</h1>
        <div className="flex flex-wrap gap-3 mt-3">
          <span className="text-sm bg-white/10 rounded-lg px-3 py-1">📚 {user?.teacher?.subject}</span>
          <span className="text-sm bg-white/10 rounded-lg px-3 py-1">📅 {formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span className="text-sm bg-white/10 rounded-lg px-3 py-1">🏫 {doneClasses}/{todayClasses.length} kelas selesai</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Kelas Hari Ini', value: todayClasses.length, icon: <CalendarDays className="w-5 h-5 text-white" />, color: 'bg-blue-500' },
          { label: 'Total Siswa Hari Ini', value: totalStudents, icon: <Users className="w-5 h-5 text-white" />, color: 'bg-green-500' },
          { label: 'Tugas Belum Dinilai', value: recentSubmissions.filter(s => s.status === 'new').length, icon: <ClipboardList className="w-5 h-5 text-white" />, color: 'bg-yellow-500' },
          { label: 'Perlu Perhatian', value: highPriority, icon: <AlertCircle className="w-5 h-5 text-white" />, color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Jadwal Mengajar — {dayName}</h2>
            </div>
            <a href="/guru/jadwal" className="text-xs text-blue-600 hover:text-blue-700">Semua jadwal</a>
          </div>
          <div className="divide-y divide-gray-100">
            {todayClasses.map((c, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${c.done ? 'opacity-60' : ''}`}>
                <div className="text-center w-20 flex-shrink-0">
                  <p className="text-xs font-mono text-gray-500">{c.time.split('–')[0]}</p>
                  <p className="text-xs font-mono text-gray-400">–{c.time.split('–')[1]}</p>
                </div>
                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${c.done ? 'bg-gray-300' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">{c.subject} — Kelas {c.class}</p>
                    {c.done && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Selesai</span>}
                  </div>
                  <p className="text-xs text-gray-500">{c.room} · {c.students} siswa</p>
                </div>
                {!c.done && (
                  <a href="/guru/akademik/absensi" className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex-shrink-0">
                    Absensi
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* To-Do */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Perlu Diselesaikan</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingTasks.map((t, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  t.urgency === 'high' ? 'bg-red-500' : t.urgency === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />
                <div>
                  <p className="text-xs text-gray-700 leading-snug">{t.title}</p>
                  {t.count && <p className="text-xs text-gray-400 mt-0.5">{t.count} item</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tugas Terbaru Dikumpulkan */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Tugas Terbaru Dikumpulkan</h2>
          </div>
          <a href="/guru/akademik/tugas" className="text-xs text-green-600 hover:text-green-700">Lihat semua</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nama Siswa', 'Kelas', 'Tugas', 'Dikumpulkan', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSubmissions.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-xs font-medium text-gray-900">{s.name}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{s.class}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{s.task}</td>
                  <td className="px-5 py-3 text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{s.submittedAt}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.status === 'new'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {s.status === 'new' ? 'Belum dinilai' : 'Sudah dinilai'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '📝 Input Nilai', href: '/guru/akademik/nilai', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { label: '✅ Isi Absensi', href: '/guru/akademik/absensi', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
          { label: '📋 Buat Tugas', href: '/guru/akademik/tugas/baru', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
          { label: '📚 Upload Materi', href: '/guru/akademik/materi/upload', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
        ].map((a) => (
          <a key={a.href} href={a.href}
            className={`block text-center py-3.5 rounded-xl text-sm font-semibold transition-colors ${a.color}`}>
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}
