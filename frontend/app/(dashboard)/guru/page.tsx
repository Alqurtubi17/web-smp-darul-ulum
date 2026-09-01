'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Users, ClipboardList, BookOpen, Clock, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, DAY_NAMES } from '@/lib/utils';
import apiClient from '@/lib/api';

export default function GuruDashboard() {
  const { user } = useAuth();
  const todayDay = new Date().getDay();
  const currentDayOfWeek = todayDay >= 1 && todayDay <= 6 ? todayDay : 1;
  const dayName = DAY_NAMES[currentDayOfWeek] || 'Hari ini';

  const [classList, setClassList] = useState<any[]>([]);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [assignmentList, setAssignmentList] = useState<any[]>([]);
  const [materialList, setMaterialList] = useState<any[]>([]);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuruData = async () => {
      setIsLoading(true);
      try {
        const [resClasses, resSchedules, resAssignments, resMaterials, resStudents] = await Promise.all([
          apiClient.get('/classes').catch(() => ({ data: { data: [] } })),
          apiClient.get('/schedules').catch(() => ({ data: { data: [] } })),
          apiClient.get('/assignments').catch(() => ({ data: { data: [] } })),
          apiClient.get('/materials').catch(() => ({ data: { data: [] } })),
          apiClient.get('/students').catch(() => ({ data: { data: [] } })),
        ]);

        if (resClasses.data?.data && Array.isArray(resClasses.data.data)) {
          setClassList(resClasses.data.data);
        }
        if (resSchedules.data?.data && Array.isArray(resSchedules.data.data)) {
          setScheduleList(resSchedules.data.data);
        }
        if (resAssignments.data?.data && Array.isArray(resAssignments.data.data)) {
          setAssignmentList(resAssignments.data.data);
        }
        if (resMaterials.data?.data && Array.isArray(resMaterials.data.data)) {
          setMaterialList(resMaterials.data.data);
        }
        if (resStudents.data?.data && Array.isArray(resStudents.data.data)) {
          setStudentList(resStudents.data.data);
        }
      } catch (err) {
        console.warn('Backend guru data load warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuruData();
  }, []);

  const teacherSubject = user?.teacher?.subject || 'Matematika';

  // Jadwal Hari Ini
  const todaySchedules = scheduleList.filter((s) => (s.dayOfWeek || 1) === currentDayOfWeek);

  const displayTodayClasses = todaySchedules.map((s, idx) => ({
    time: `${s.startTime || '07.00'}–${s.endTime || '08.40'}`,
    class: s.class?.name || '7A',
    subject: s.subject?.name || teacherSubject,
    room: s.room || `Ruang ${s.class?.name || '7A'}`,
    students: s.class?.capacity || 30,
    done: false,
  }));

  const doneClasses = displayTodayClasses.filter((c) => c.done).length;

  const totalStudentsCount = studentList.length || scheduleList.reduce((a, b) => a + (b.class?.capacity || 30), 0);

  // Submissions & Tasks
  const recentSubmissions = assignmentList.flatMap((a) =>
    (a.submissions || []).map((s: any) => ({
      name: s.student?.fullName || s.studentName || 'Siswa SMP',
      class: s.student?.classId || a.classId || '8A',
      task: a.title,
      submittedAt: s.submittedAt ? formatDate(s.submittedAt, { day: 'numeric', month: 'short' }) : 'Baru saja',
      status: s.score !== null && s.score !== undefined ? 'reviewed' : 'new',
    }))
  );

  const unsubmittedCount = recentSubmissions.filter((s) => s.status === 'new').length;

  const pendingTasks = [
    { title: `Tugas Pembelajaran Aktif`, urgency: assignmentList.length > 0 ? 'high' : 'low', count: assignmentList.length },
    { title: `Modul & Bahan Ajar Terpublikasi`, urgency: 'medium', count: materialList.length },
    { title: `Tugas Menguji / Belum Dinilai`, urgency: unsubmittedCount > 0 ? 'high' : 'low', count: unsubmittedCount },
  ];

  const highPriority = pendingTasks.filter((t) => t.urgency === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xs">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-emerald-200 text-xs font-semibold">Portal Akademik Guru</p>
            <h1 className="text-xl font-extrabold mt-0.5">{user?.teacher?.fullName || user?.email || 'Bapak/Ibu Guru'}</h1>
          </div>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-200" />}
        </div>
        <div className="flex flex-wrap gap-2.5 mt-3">
          <span className="text-xs font-semibold bg-white/10 rounded-xl px-3 py-1 border border-white/10">📚 {teacherSubject}</span>
          <span className="text-xs font-semibold bg-white/10 rounded-xl px-3 py-1 border border-white/10">📅 {formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <span className="text-xs font-semibold bg-white/10 rounded-xl px-3 py-1 border border-white/10">🏫 {displayTodayClasses.length} sesi mengajar hari ini</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sesi Mengajar Hari Ini', value: displayTodayClasses.length, icon: <CalendarDays className="w-5 h-5 text-white" />, color: 'bg-emerald-600' },
          { label: 'Total Siswa Binaan', value: totalStudentsCount, icon: <Users className="w-5 h-5 text-white" />, color: 'bg-teal-600' },
          { label: 'Tugas Belum Dinilai', value: unsubmittedCount, icon: <ClipboardList className="w-5 h-5 text-white" />, color: 'bg-amber-600' },
          { label: 'Perlu Perhatian', value: highPriority, icon: <AlertCircle className="w-5 h-5 text-white" />, color: 'bg-rose-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{isLoading ? '—' : s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color} shadow-2xs`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Jadwal Mengajar — {dayName}</h2>
            </div>
            <a href="/guru/jadwal" className="text-xs font-semibold text-emerald-700 hover:underline">Semua jadwal</a>
          </div>

          <div className="divide-y divide-slate-100">
            {displayTodayClasses.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Clock className="w-7 h-7 text-emerald-600/30 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada jadwal mengajar pada hari {dayName}.</p>
              </div>
            ) : (
              displayTodayClasses.map((c, i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-3.5 ${c.done ? 'opacity-60' : ''}`}>
                  <div className="text-center w-20 flex-shrink-0">
                    <p className="text-xs font-mono font-bold text-slate-600">{c.time.split('–')[0]}</p>
                    <p className="text-[11px] font-mono text-slate-400">–{c.time.split('–')[1]}</p>
                  </div>
                  <div className={`w-1 h-10 rounded-full flex-shrink-0 ${c.done ? 'bg-slate-300' : 'bg-emerald-600'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs sm:text-sm text-slate-900">{c.subject} — Kelas {c.class}</p>
                      {c.done && <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">Selesai</span>}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{c.room} · {c.students} siswa</p>
                  </div>
                  {!c.done && (
                    <a href="/guru/akademik/absensi" className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors">
                      Absensi
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* To-Do */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-sm">Perlu Diselesaikan</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingTasks.map((t, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  t.urgency === 'high' ? 'bg-rose-500' : t.urgency === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">{t.title}</p>
                  {t.count !== null && t.count !== undefined && <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{t.count} item</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tugas Terbaru Dikumpulkan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">Tugas Terbaru Dikumpulkan Siswa</h2>
          </div>
          <a href="/guru/akademik/tugas" className="text-xs font-semibold text-emerald-700 hover:underline">Lihat semua</a>
        </div>
        
        {recentSubmissions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText className="w-7 h-7 text-emerald-600/30 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-600">Belum ada pengumpulan tugas siswa terbaru di database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {['Nama Siswa', 'Kelas', 'Judul Tugas', 'Tanggal Dikumpulkan', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSubmissions.slice(0, 5).map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-900">{s.name}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-emerald-800">{s.class}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700">{s.task}</td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />{s.submittedAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        s.status === 'new'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {s.status === 'new' ? 'Belum dinilai' : 'Sudah dinilai'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '📝 Input Nilai Siswa', href: '/guru/akademik/nilai', color: 'bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100' },
          { label: '✅ Presensi Kehadiran', href: '/guru/akademik/absensi', color: 'bg-teal-50 text-teal-950 border border-teal-200 hover:bg-teal-100' },
          { label: '📋 Kelola Tugas Siswa', href: '/guru/akademik/tugas', color: 'bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100' },
          { label: '📚 Upload Modul / Materi', href: '/guru/akademik/materi', color: 'bg-purple-50 text-purple-950 border border-purple-200 hover:bg-purple-100' },
        ].map((a) => (
          <a key={a.href} href={a.href}
            className={`block text-center py-3 rounded-xl text-xs font-bold transition-all shadow-2xs ${a.color}`}>
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}
