'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle, XCircle, Clock, AlertCircle, Search } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { Pagination } from '@/components/ui/Pagination';

interface Student { id: string; fullName: string; nis: string; }
type Status = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';

const STATUS_BTN: { val: Status; label: string; color: string; icon: React.ReactNode }[] = [
  { val:'HADIR', label:'H', color:'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600', icon:<CheckCircle className="w-3.5 h-3.5"/> },
  { val:'IZIN',  label:'I', color:'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',   icon:<Clock className="w-3.5 h-3.5"/> },
  { val:'SAKIT', label:'S', color:'bg-amber-600 hover:bg-amber-700 text-white border-amber-600', icon:<AlertCircle className="w-3.5 h-3.5"/> },
  { val:'ALPHA', label:'A', color:'bg-rose-600 hover:bg-rose-700 text-white border-rose-600',     icon:<XCircle className="w-3.5 h-3.5"/> },
];

const CLASSES = ['7A','7B','7C','8A','8B','8C','9A','9B','9C'];
const ITEMS_PER_PAGE = 5;

export default function GuruAbsensiPage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedClass, setSelectedClass] = useState('8A');
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const qc = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students-attendance', selectedClass],
    queryFn: async () => {
      const { data } = await apiClient.get(`/students?classId=${selectedClass}&limit=50`);
      return (data.data || []) as Student[];
    },
    enabled: !!selectedClass,
  });

  useEffect(() => {
    if (students.length > 0) {
      const def: Record<string, Status> = {};
      students.forEach((s: Student) => { def[s.id] = 'HADIR'; });
      setAttendance(def);
    }
  }, [students]);

  const saveMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post('/attendance', body),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); qc.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (e) => setErr(getErrorMessage(e)),
  });

  const handleSave = () => {
    setErr('');
    const records = students.map(s => ({
      studentId: s.id,
      status: attendance[s.id] || 'HADIR',
      note: notes[s.id] || undefined,
      date,
    }));
    saveMut.mutate({ records, classId: selectedClass, date });
  };

  const setAll = (status: Status) => {
    const all: Record<string, Status> = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search)
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const counts = {
    hadir: students.filter(s => (attendance[s.id] || 'HADIR') === 'HADIR').length,
    izin:  students.filter(s => attendance[s.id] === 'IZIN').length,
    sakit: students.filter(s => attendance[s.id] === 'SAKIT').length,
    alpha: students.filter(s => attendance[s.id] === 'ALPHA').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Input Presensi &amp; Absensi Harian Siswa</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Catat daftar kehadiran peserta didik per kelas</p>
        </div>
        {selectedClass && students.length > 0 && (
          <button onClick={handleSave} disabled={saveMut.isPending}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-2xs">
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : saved ? <CheckCircle className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
            {saved ? 'Absensi Tersimpan!' : saveMut.isPending ? 'Menyimpan...' : 'Simpan Absensi Kelas'}
          </button>
        )}
      </div>

      {/* Config row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Pilih Kelas *</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setAttendance({}); setCurrentPage(1); }}
            className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs">
            <option value="">Pilih kelas</option>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tanggal Presensi *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today}
            className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
        </div>
        {selectedClass && students.length > 0 && (
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tandai Semua Siswa</label>
            <div className="flex gap-1">
              {STATUS_BTN.map(s => (
                <button key={s.val} onClick={() => setAll(s.val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-colors shadow-2xs ${s.color}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {err && <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">{err}</div>}

      {/* Summary badges */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:'Hadir', val:counts.hadir, color:'bg-emerald-50 border-emerald-200 text-emerald-800' },
            { label:'Izin',  val:counts.izin,  color:'bg-blue-50 border-blue-200 text-blue-800' },
            { label:'Sakit', val:counts.sakit, color:'bg-amber-50 border-amber-200 text-amber-800' },
            { label:'Alpha', val:counts.alpha, color:'bg-rose-50 border-rose-200 text-rose-800' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-3xl border p-4 text-center shadow-2xs`}>
              <p className="text-2xl font-black">{s.val}</p>
              <p className="text-xs font-extrabold mt-0.5">Hari {s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Student Table Container */}
      {!selectedClass ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Pilih kelas di atas untuk melihat daftar presensi siswa</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600"/></div>
      ) : (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
          <div className="p-5 bg-emerald-50/30 border-b border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input
                type="search"
                placeholder="Cari nama siswa atau NIS..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>
            <span className="text-xs font-extrabold text-slate-600 whitespace-nowrap">Kelas {selectedClass} ({students.length} Siswa)</span>
          </div>

          <div className="divide-y divide-emerald-50">
            {paginatedStudents.map((s, i) => {
              const status = attendance[s.id] || 'HADIR';
              return (
                <div key={s.id} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                  <span className="w-6 text-xs font-extrabold text-slate-400 text-right flex-shrink-0">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-2xs">
                    {s.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">{s.fullName}</p>
                    <p className="text-[11px] text-slate-400 font-mono font-semibold">{s.nis}</p>
                  </div>
                  {/* Status buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    {STATUS_BTN.map(btn => (
                      <button key={btn.val} onClick={() => setAttendance(p => ({ ...p, [s.id]: btn.val }))}
                        title={btn.val}
                        className={`w-9 h-9 rounded-xl border-2 text-xs font-black transition-all flex items-center justify-center shadow-2xs ${
                          status === btn.val
                            ? btn.color
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-300'
                        }`}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  {/* Note for non-hadir */}
                  {status !== 'HADIR' && (
                    <input type="text" value={notes[s.id] || ''} onChange={e => setNotes(p => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="Catatan izin/sakit..."
                      className="w-40 px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"/>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredStudents.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
}
