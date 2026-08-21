'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';

interface Student { id: string; fullName: string; nis: string; }
type Status = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPHA';

const STATUS_BTN: { val: Status; label: string; color: string; icon: React.ReactNode }[] = [
  { val:'HADIR', label:'H', color:'bg-green-500 hover:bg-green-600 text-white border-green-500', icon:<CheckCircle className="w-3.5 h-3.5"/> },
  { val:'IZIN',  label:'I', color:'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',   icon:<Clock className="w-3.5 h-3.5"/> },
  { val:'SAKIT', label:'S', color:'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500', icon:<AlertCircle className="w-3.5 h-3.5"/> },
  { val:'ALPHA', label:'A', color:'bg-red-500 hover:bg-red-600 text-white border-red-500',     icon:<XCircle className="w-3.5 h-3.5"/> },
];

const CLASSES = ['7A','7B','7C','8A','8B','8C','9A','9B','9C'];

export default function GuruAbsensiPage() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(today);
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

  const counts = {
    hadir: students.filter(s => (attendance[s.id] || 'HADIR') === 'HADIR').length,
    izin:  students.filter(s => attendance[s.id] === 'IZIN').length,
    sakit: students.filter(s => attendance[s.id] === 'SAKIT').length,
    alpha: students.filter(s => attendance[s.id] === 'ALPHA').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Absensi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catat kehadiran siswa harian</p>
        </div>
        {selectedClass && students.length > 0 && (
          <button onClick={handleSave} disabled={saveMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold">
            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : saved ? <CheckCircle className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
            {saved ? 'Tersimpan!' : saveMut.isPending ? 'Menyimpan...' : 'Simpan Absensi'}
          </button>
        )}
      </div>

      {/* Config row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelas</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setAttendance({}); }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Pilih kelas</option>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={today}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {selectedClass && students.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tandai Semua</label>
            <div className="flex gap-1">
              {STATUS_BTN.map(s => (
                <button key={s.val} onClick={() => setAll(s.val)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${s.color}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {err && <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{err}</div>}

      {/* Summary badges */}
      {selectedClass && students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label:'Hadir', val:counts.hadir, color:'bg-green-50 text-green-700' },
            { label:'Izin',  val:counts.izin,  color:'bg-blue-50 text-blue-700' },
            { label:'Sakit', val:counts.sakit, color:'bg-yellow-50 text-yellow-700' },
            { label:'Alpha', val:counts.alpha, color:'bg-red-50 text-red-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl border border-gray-200 p-3 text-center`}>
              <p className="text-2xl font-bold">{s.val}</p>
              <p className="text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Student list */}
      {!selectedClass ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <p className="text-sm">Pilih kelas untuk mulai absensi</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kelas {selectedClass} — {new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long'}).format(new Date(date))}</span>
            <span className="text-xs text-gray-400">{students.length} siswa</span>
          </div>
          <div className="divide-y divide-gray-100">
            {students.map((s, i) => {
              const status = attendance[s.id] || 'HADIR';
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-6 text-xs text-gray-400 text-right flex-shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.fullName}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.nis}</p>
                  </div>
                  {/* Status buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    {STATUS_BTN.map(btn => (
                      <button key={btn.val} onClick={() => setAttendance(p => ({ ...p, [s.id]: btn.val }))}
                        title={btn.val}
                        className={`w-9 h-9 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center ${
                          status === btn.val
                            ? btn.color
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  {/* Note for non-hadir */}
                  {status !== 'HADIR' && (
                    <input type="text" value={notes[s.id] || ''} onChange={e => setNotes(p => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="Keterangan..."
                      className="w-36 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
