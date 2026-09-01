'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, MapPin, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DAY_NAMES } from '@/lib/utils';
import apiClient from '@/lib/api';

export default function GuruJadwalPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/schedules');
        if (res.data?.data && Array.isArray(res.data.data)) {
          setSchedules(res.data.data);
        }
      } catch (err) {
        console.warn('Fetch guru schedules warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const today = new Date().getDay();

  const scheduleByDay: Record<number, any[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: []
  };

  schedules.forEach((s) => {
    const day = s.dayOfWeek || 1;
    if (!scheduleByDay[day]) scheduleByDay[day] = [];
    scheduleByDay[day].push({
      id: s.id,
      time: `${s.startTime}–${s.endTime}`,
      class: s.class?.name || '7A',
      subject: s.subject?.name || user?.teacher?.subject || 'Matematika',
      room: s.room || `Ruang ${s.class?.name || '7A'}`,
      students: s.class?.capacity || 30,
    });
  });

  const displayList = scheduleByDay[activeDay] || [];

  const totalSessions = schedules.length;
  const uniqueClasses = new Set(schedules.map(s => s.class?.name || s.classId).filter(Boolean)).size;
  const totalStudents = schedules.reduce((a, b) => a + (b.class?.capacity || 30), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-start border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jadwal Mengajar Guru</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {user?.teacher?.fullName || user?.email} · {user?.teacher?.subject || 'Matematika'}
          </p>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon:<Clock className="w-5 h-5"/>, label:'Total Sesi/Minggu', value:totalSessions, color:'text-blue-600', bg:'bg-blue-50 border-blue-200' },
          { icon:<BookOpen className="w-5 h-5"/>, label:'Kelas Diajar', value:uniqueClasses, color:'text-emerald-600', bg:'bg-emerald-50 border-emerald-200' },
          { icon:<Users className="w-5 h-5"/>, label:'Total Siswa Binaan', value:totalStudents, color:'text-purple-600', bg:'bg-purple-50 border-purple-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border p-4 flex gap-3 items-center shadow-2xs`}>
            <div className={s.color}>{s.icon}</div>
            <div>
              <p className={`text-xl font-extrabold ${s.color}`}>{isLoading ? '—' : s.value}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {[1,2,3,4,5].map(day => {
            const count = (scheduleByDay[day] || []).length;
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${activeDay === day ? 'border-emerald-600 bg-white font-extrabold text-emerald-900' : 'border-transparent text-slate-500 hover:bg-slate-100/60'}`}>
                <p className="text-xs font-bold">
                  {DAY_NAMES[day]}
                  {day === today && <span className="ml-1 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">Hari ini</span>}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">{count > 0 ? `${count} sesi` : 'Kosong'}</p>
              </button>
            );
          })}
        </div>

        <div className="p-4 space-y-3">
          {displayList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-8 h-8 text-emerald-600/30 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">Tidak ada jadwal mengajar pada hari {DAY_NAMES[activeDay]}.</p>
            </div>
          ) : (
            displayList.map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs">
                <div className="text-center w-20 flex-shrink-0">
                  <p className="text-xs font-mono font-bold text-slate-700">{s.time.split('–')[0]}</p>
                  <p className="text-[11px] font-mono text-slate-400 font-semibold">– {s.time.split('–')[1]}</p>
                </div>
                <div className="w-1 bg-emerald-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">{s.class}</span>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">{s.subject}</p>
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600"/>{s.room}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600"/>{s.students} siswa</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <a href="/guru/akademik/absensi"
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-center transition-colors shadow-2xs">
                    Absensi
                  </a>
                  <a href="/guru/akademik/nilai"
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-center transition-colors">
                    Nilai
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
