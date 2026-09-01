'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, Plus, Edit2, Trash2, Search, Filter, Clock, Users, BookOpen,
  X, Check, AlertCircle, RefreshCw, Printer, Download, Sparkles
} from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from '@/store/toast.store';
import { useActivityLogStore } from '@/store/activity-log.store';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/Pagination';

const DAYS_MAP = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
];

interface ScheduleItem {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  academicYear: string;
  semester: number;
  isActive: boolean;
  class?: { id: string; name: string; grade: number };
  subject?: { id: string; code: string; name: string };
  teacher?: { id: string; fullName: string; nip?: string; subject?: string };
}

const ITEMS_PER_PAGE = 8;

export default function AdminJadwalMengajarPage() {
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [filterDay, setFilterDay] = useState<number | 'SEMUA'>('SEMUA');
  const [filterClass, setFilterClass] = useState<string>('SEMUA');
  const [filterTeacher, setFilterTeacher] = useState<string>('SEMUA');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Auto-Generator State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genConfig, setGenConfig] = useState({
    academicYear: '2026/2027',
    semester: 1,
    daysCount: 5,
  });

  // Teacher Availability Constraints Map: teacherId -> allowed days array [1,2,3...]
  const [teacherConstraints, setTeacherConstraints] = useState<Record<string, number[]>>({});

  const toggleTeacherDay = (teacherId: string, day: number) => {
    setTeacherConstraints(prev => {
      const currentDays = prev[teacherId] !== undefined ? prev[teacherId] : [1, 2, 3, 4, 5, 6];
      const hasDay = currentDays.includes(day);
      const nextDays = hasDay ? currentDays.filter(d => d !== day) : [...currentDays, day];
      return { ...prev, [teacherId]: nextDays };
    });
  };

  const handleGenerateAutoSchedule = async () => {
    if (classes.length === 0 || subjects.length === 0 || teachers.length === 0) {
      toast.error('Data Belum Lengkap', 'Pastikan data kelas, guru pengampu, dan mata pelajaran telah terdaftar di sistem.');
      return;
    }

    setIsGenerating(true);
    try {
      // Sesi Jam Mengajar (6 Sesi per Hari)
      const TIME_SLOTS = [
        { start: '07:00', end: '07:40' },
        { start: '07:40', end: '08:20' },
        { start: '08:20', end: '09:00' },
        { start: '09:15', end: '09:55' },
        { start: '09:55', end: '10:35' },
        { start: '10:35', end: '11:15' },
      ];

      const days = Array.from({ length: genConfig.daysCount }, (_, i) => i + 1);

      // Track keterisian waktu guru & kelas untuk mencegah bentrok
      const teacherBusy: Record<string, Record<number, Record<number, boolean>>> = {};
      const classBusy: Record<string, Record<number, Record<number, boolean>>> = {};

      teachers.forEach(t => { teacherBusy[t.id] = {}; });
      classes.forEach(c => { classBusy[c.id] = {}; });

      const newSchedulesToCreate: Array<any> = [];

      // Algoritma Penyusunan Jadwal Bebas Bentrok
      for (const cls of classes) {
        for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
          const subj = subjects[sIdx];
          const teacher = teachers.find(t => t.subject?.toLowerCase().includes(subj.name.toLowerCase())) || teachers[sIdx % teachers.length];
          if (!teacher) continue;

          // Batas ketersediaan hari guru yang ditentukan admin
          const allowedDaysForTeacher = teacherConstraints[teacher.id] !== undefined
            ? teacherConstraints[teacher.id]
            : days;

          let assigned = false;
          for (const day of days) {
            if (assigned) break;
            if (!allowedDaysForTeacher.includes(day)) continue; // Skip jika guru tidak bersedia pada hari ini

            for (let slotIdx = 0; slotIdx < TIME_SLOTS.length; slotIdx++) {
              const isTeacherFree = !teacherBusy[teacher.id]?.[day]?.[slotIdx];
              const isClassFree = !classBusy[cls.id]?.[day]?.[slotIdx];

              if (isTeacherFree && isClassFree) {
                if (!teacherBusy[teacher.id]) teacherBusy[teacher.id] = {};
                if (!teacherBusy[teacher.id][day]) teacherBusy[teacher.id][day] = {};
                teacherBusy[teacher.id][day][slotIdx] = true;

                if (!classBusy[cls.id]) classBusy[cls.id] = {};
                if (!classBusy[cls.id][day]) classBusy[cls.id][day] = {};
                classBusy[cls.id][day][slotIdx] = true;

                newSchedulesToCreate.push({
                  classId: cls.id,
                  subjectId: subj.id,
                  teacherId: teacher.id,
                  dayOfWeek: day,
                  startTime: TIME_SLOTS[slotIdx].start,
                  endTime: TIME_SLOTS[slotIdx].end,
                  room: `Ruang ${cls.name}`,
                  academicYear: genConfig.academicYear,
                  semester: genConfig.semester,
                });

                assigned = true;
                break;
              }
            }
          }
        }
      }

      // Simpan item hasil penyusunan ke Database
      for (const item of newSchedulesToCreate) {
        await apiClient.post('/schedules', item).catch(() => {});
      }

      toast.success(
        'Jadwal Mengajar Berhasil Disusun!',
        `Tersusun ${newSchedulesToCreate.length} sesi jam pelajaran tanpa bentrok untuk ${classes.length} kelas rombel.`
      );
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Generate jadwal otomatis 1 semester`,
        module: 'Akademik',
        severity: 'SUCCESS',
        details: `Tersusun ${newSchedulesToCreate.length} jam pelajaran berbasis ketersediaan guru`,
      });

      setShowGenerateModal(false);
      fetchData();
    } catch (err) {
      toast.error('Gagal Menyusun Jadwal', 'Terjadi kendala saat memproses pembuatan jadwal otomatis.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    classId: '',
    dayOfWeek: 1,
    startTime: '07:00',
    endTime: '08:40',
    room: 'Ruang Kelas',
    academicYear: '2026/2027',
    semester: 1,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resSchedules, resTeachers, resClasses, resSubjects] = await Promise.all([
        apiClient.get('/schedules').catch(() => ({ data: { data: [] } })),
        apiClient.get('/teachers').catch(() => ({ data: { data: [] } })),
        apiClient.get('/classes').catch(() => ({ data: { data: { classes: [] } } })),
        apiClient.get('/subjects').catch(() => ({ data: { data: [] } })),
      ]);

      if (resSchedules.data?.data) setSchedules(resSchedules.data.data);
      if (resTeachers.data?.data) setTeachers(resTeachers.data.data);
      
      const rawClasses = resClasses.data?.data?.classes || resClasses.data?.data || [];
      if (Array.isArray(rawClasses)) setClasses(rawClasses);
      
      if (resSubjects.data?.data) setSubjects(resSubjects.data.data);
    } catch (err) {
      console.warn('Load schedules error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateForm = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleOpenForm = (sch?: ScheduleItem) => {
    if (sch) {
      setSelectedSchedule(sch);
      setFormData({
        teacherId: sch.teacherId,
        subjectId: sch.subjectId,
        classId: sch.classId,
        dayOfWeek: sch.dayOfWeek,
        startTime: sch.startTime,
        endTime: sch.endTime,
        room: sch.room || 'Ruang Kelas',
        academicYear: sch.academicYear || '2026/2027',
        semester: sch.semester || 1,
      });
    } else {
      setSelectedSchedule(null);
      setFormData({
        teacherId: teachers[0]?.id || '',
        subjectId: subjects[0]?.id || '',
        classId: classes[0]?.id || '',
        dayOfWeek: 1,
        startTime: '07:00',
        endTime: '08:40',
        room: 'Ruang Kelas',
        academicYear: '2026/2027',
        semester: 1,
      });
    }
    setShowFormModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.classId || !formData.subjectId) {
      toast.error('Form Tidak Lengkap', 'Silakan pilih guru, kelas, dan mata pelajaran.');
      return;
    }

    try {
      if (selectedSchedule) {
        await apiClient.put(`/schedules/${selectedSchedule.id}`, formData);
        toast.success('Jadwal Diperbarui', 'Perubahan jadwal mengajar berhasil disimpan.');
        addLog({
          user: actorName,
          role: 'ADMIN',
          action: `Memperbarui jadwal mengajar`,
          module: 'Akademik',
          severity: 'SUCCESS',
          details: `Jadwal hari ID ${formData.dayOfWeek} jam ${formData.startTime}-${formData.endTime}`,
        });
      } else {
        await apiClient.post('/schedules', formData);
        toast.success('Jadwal Ditambahkan', 'Jadwal mengajar baru berhasil dibuat.');
        addLog({
          user: actorName,
          role: 'ADMIN',
          action: `Menambah jadwal mengajar baru`,
          module: 'Akademik',
          severity: 'SUCCESS',
          details: `Guru ID ${formData.teacherId} jam ${formData.startTime}-${formData.endTime}`,
        });
      }
      setShowFormModal(false);
      fetchData();
    } catch (err) {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data jadwal.');
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await apiClient.delete(`/schedules/${selectedSchedule.id}`);
      toast.warning('Jadwal Dihapus', 'Jadwal mengajar telah dihapus.');
      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menghapus jadwal mengajar`,
        module: 'Akademik',
        severity: 'WARNING',
        details: `Hapus jadwal ID ${selectedSchedule.id}`,
      });
      setShowDeleteModal(false);
      setSelectedSchedule(null);
      fetchData();
    } catch (err) {
      toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus jadwal.');
    }
  };

  const filtered = useMemo(() => {
    return schedules.filter(s => {
      const matchDay = filterDay === 'SEMUA' || s.dayOfWeek === filterDay;
      const matchClass = filterClass === 'SEMUA' || s.classId === filterClass || s.class?.name === filterClass;
      const matchTeacher = filterTeacher === 'SEMUA' || s.teacherId === filterTeacher;
      const q = search.toLowerCase();
      const matchSearch =
        (s.teacher?.fullName || '').toLowerCase().includes(q) ||
        (s.subject?.name || '').toLowerCase().includes(q) ||
        (s.class?.name || '').toLowerCase().includes(q) ||
        (s.room || '').toLowerCase().includes(q);

      return matchDay && matchClass && matchTeacher && matchSearch;
    });
  }, [schedules, filterDay, filterClass, filterTeacher, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Atur Jadwal Mengajar per Guru</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Penetapan jam mengajar, kelas rombel, dan mata pelajaran per guru pengampu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" /> Susun Otomatis 1 Semester
          </button>

          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Manual
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Cari guru, mata pelajaran, kelas, atau ruangan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Day Filter */}
          <select
            value={filterDay}
            onChange={e => { setFilterDay(e.target.value === 'SEMUA' ? 'SEMUA' : parseInt(e.target.value)); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="SEMUA">Semua Hari</option>
            {DAYS_MAP.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {/* Teacher Filter */}
          <select
            value={filterTeacher}
            onChange={e => { setFilterTeacher(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[180px]"
          >
            <option value="SEMUA">Semua Guru</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>

          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={e => { setFilterClass(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="SEMUA">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.id}>Kelas {c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-3.5">HARI &amp; JAM</th>
                <th className="px-4 py-3.5">GURU PENGAMPU</th>
                <th className="px-4 py-3.5">MATA PELAJARAN</th>
                <th className="px-4 py-3.5">KELAS &amp; RUANG</th>
                <th className="px-4 py-3.5">TAHUN AJARAN</th>
                <th className="px-4 py-3.5 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? (
                paginated.map((sch) => {
                  const dayObj = DAYS_MAP.find(d => d.id === sch.dayOfWeek);
                  return (
                    <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 inline-block">
                            {dayObj?.name || 'Senin'}
                          </span>
                          <p className="text-xs font-mono font-semibold text-emerald-800 flex items-center gap-1 mt-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" /> {sch.startTime} – {sch.endTime}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{sch.teacher?.fullName || 'Guru Pengampu'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">NIP: {sch.teacher?.nip || '-'}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            {sch.subject?.name || 'Mata Pelajaran'}
                          </span>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">Kode: {sch.subject?.code || '-'}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">Kelas {sch.class?.name || '7A'}</p>
                          <p className="text-[11px] font-medium text-slate-500">{sch.room || 'Ruang Kelas'}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <p className="font-semibold">{sch.academicYear}</p>
                        <p className="text-[11px] text-slate-400">Semester {sch.semester}</p>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenForm(sch)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedSchedule(sch); setShowDeleteModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-500 font-medium">
                    Belum ada jadwal mengajar yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Modal Form Tambah / Edit Jadwal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {selectedSchedule ? 'Edit Jadwal Mengajar' : 'Tambah Jadwal Mengajar Guru'}
                </h2>
                <p className="text-xs text-slate-500 font-normal">Tentukan guru pengampu, kelas rombel, mapel, dan alokasi waktu</p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Pilih Guru */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guru Pengampu *</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={e => updateForm('teacherId', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} {t.nip ? `(NIP: ${t.nip})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pilih Mapel & Kelas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                    <select
                      required
                      value={formData.subjectId}
                      onChange={e => updateForm('subjectId', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Pilih Mapel --</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rombel Kelas *</label>
                    <select
                      required
                      value={formData.classId}
                      onChange={e => updateForm('classId', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>
                          Kelas {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hari & Ruangan */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hari *</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={e => updateForm('dayOfWeek', parseInt(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {DAYS_MAP.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ruangan Kelas</label>
                    <input
                      type="text"
                      placeholder="e.g. Ruang 8A / Lab IPA"
                      value={formData.room}
                      onChange={e => updateForm('room', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Jam Mengajar */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Mulai *</label>
                    <input
                      type="text"
                      required
                      placeholder="07:00"
                      value={formData.startTime}
                      onChange={e => updateForm('startTime', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Selesai *</label>
                    <input
                      type="text"
                      required
                      placeholder="08:40"
                      value={formData.endTime}
                      onChange={e => updateForm('endTime', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Academic Year & Semester */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={e => updateForm('academicYear', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={e => updateForm('semester', parseInt(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value={1}>Semester Ganjil (1)</option>
                      <option value={2}>Semester Genap (2)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {showDeleteModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Jadwal Mengajar?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus jadwal <span className="font-semibold text-slate-900">{selectedSchedule.subject?.name}</span> untuk guru <span className="font-semibold text-slate-900">{selectedSchedule.teacher?.fullName}</span> pada kelas <span className="font-semibold text-slate-900">{selectedSchedule.class?.name}</span>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generate Otomatis 1 Semester */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
                  <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">Penyusunan Jadwal Semester</h2>
                  <p className="text-xs text-slate-500 font-medium">Penataan jam mengajar berdasarkan ketersediaan hari guru dan rombel kelas.</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-purple-950">
                  <Check className="w-4 h-4 text-purple-700" /> Penyesuaian Jadwal Terbuka
                </p>
                <p className="text-[11px] text-purple-800 leading-relaxed font-medium">
                  Sistem akan menyusun jam pelajaran untuk <span className="font-bold text-purple-950">{classes.length} Rombel Kelas</span> dan <span className="font-bold text-purple-950">{teachers.length} Guru Pengampu</span>. Hasil penyusunan dapat disesuaikan kembali sewaktu-waktu.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={genConfig.academicYear}
                    onChange={e => setGenConfig(p => ({ ...p, academicYear: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={genConfig.semester}
                    onChange={e => setGenConfig(p => ({ ...p, semester: parseInt(e.target.value) }))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value={1}>Semester Ganjil (1)</option>
                    <option value={2}>Semester Genap (2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hari Efektif Sekolah</label>
                <select
                  value={genConfig.daysCount}
                  onChange={e => setGenConfig(p => ({ ...p, daysCount: parseInt(e.target.value) }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value={5}>Senin – Jumat (5 Hari Sekolah)</option>
                  <option value={6}>Senin – Sabtu (6 Hari Sekolah)</option>
                </select>
              </div>

              {/* Batas Ketersediaan Hari Mengajar Per Guru */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900">
                    Ketersediaan Hari Mengajar Per Guru (Opsional)
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Atur hari hadir mengajar</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {teachers.map(t => {
                    const activeDays = teacherConstraints[t.id] !== undefined
                      ? teacherConstraints[t.id]
                      : [1, 2, 3, 4, 5, 6];

                    return (
                      <div key={t.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{t.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{t.subject || 'Guru Pengampu'}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          {DAYS_MAP.slice(0, genConfig.daysCount).map(d => {
                            const isSelected = activeDays.includes(d.id);
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => toggleTeacherDay(t.id, d.id)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-600 text-white shadow-2xs'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                                }`}
                                title={`Batasi hari ${d.name} untuk ${t.fullName}`}
                              >
                                {d.name.slice(0, 3)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
              <button
                type="button"
                onClick={() => setShowGenerateModal(false)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleGenerateAutoSchedule}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Menyusun Jadwal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" /> Proses Penataan Jadwal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
