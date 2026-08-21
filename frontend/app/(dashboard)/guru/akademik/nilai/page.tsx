'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, Check } from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';

const ChevDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
);

interface StudentRow { id: string; fullName: string; nis: string; currentScore?: number; }

const GRADE_TYPES = [
  { value:'TUGAS', label:'Tugas' },
  { value:'ULANGAN_HARIAN', label:'Ulangan Harian' },
  { value:'UTS', label:'UTS' },
  { value:'UAS', label:'UAS' },
  { value:'PRAKTIK', label:'Praktik' },
];

const CLASSES = ['7A','7B','7C','8A','8B','8C','9A','9B','9C'];

export default function GuruNilaiPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [gradeType, setGradeType] = useState('TUGAS');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');
  const qc = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students-for-grade', selectedClass],
    queryFn: async () => {
      const { data } = await apiClient.get(`/students?classId=${selectedClass}&limit=50`);
      return (data.data || []) as StudentRow[];
    },
    enabled: !!selectedClass,
  });

  const batchMut = useMutation({
    mutationFn: (grades: Record<string, unknown>[]) => apiClient.post('/grades/batch', { grades }),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); qc.invalidateQueries({ queryKey: ['students-for-grade'] }); },
    onError: e => setErr(getErrorMessage(e)),
  });

  const handleSave = () => {
    setErr('');
    const grades = students
      .filter(s => scores[s.id] !== undefined && scores[s.id] !== '')
      .map(s => ({
        studentId: s.id,
        score: parseFloat(scores[s.id]),
        type: gradeType,
        semester: 1,
        academicYear: '2024/2025',
      }));

    if (grades.length === 0) { setErr('Isi minimal satu nilai'); return; }
    batchMut.mutate(grades);
  };

  const setScore = (studentId: string, val: string) => {
    const num = parseFloat(val);
    if (val !== '' && (num < 0 || num > 100)) return;
    setScores(p => ({ ...p, [studentId]: val }));
  };

  const filled = Object.values(scores).filter(v => v !== '').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Input Nilai</h1>
          <p className="text-sm text-gray-500 mt-0.5">Semester Ganjil 2024/2025</p>
        </div>
        {filled > 0 && (
          <button onClick={handleSave} disabled={batchMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold">
            {batchMut.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : saved ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
            {saved ? 'Tersimpan!' : batchMut.isPending ? 'Menyimpan...' : `Simpan ${filled} Nilai`}
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelas</label>
          <div className="relative">
            <select value={selectedClass} onChange={e=>{ setSelectedClass(e.target.value); setScores({}); }}
              className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              <option value="">Pilih kelas</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Penilaian</label>
          <div className="relative">
            <select value={gradeType} onChange={e=>setGradeType(e.target.value)}
              className="w-full px-4 py-2.5 pr-9 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              {GRADE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          </div>
        </div>
      </div>

      {err && <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{err}</div>}

      {!selectedClass ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <p className="text-sm">Pilih kelas untuk mulai input nilai</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kelas {selectedClass} — {GRADE_TYPES.find(t=>t.value===gradeType)?.label}</span>
            <span className="text-xs text-gray-400">{students.length} siswa</span>
          </div>
          <div className="divide-y divide-gray-100">
            {students.map((s, i) => {
              const val = scores[s.id] ?? '';
              const num = parseFloat(val);
              return (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-6 text-xs text-gray-400 text-right flex-shrink-0">{i+1}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.fullName}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.nis}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" max="100" value={val}
                      onChange={e=>setScore(s.id,e.target.value)}
                      placeholder="—"
                      className={`w-20 text-center px-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        val==='' ? 'border-gray-200 bg-white text-gray-400'
                        : num>=75 ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-red-300 bg-red-50 text-red-700'
                      }`}/>
                    {val !== '' && (
                      <span className={`text-xs w-12 font-medium ${num>=75?'text-green-600':'text-red-500'}`}>
                        {num>=75?'Tuntas':'Remidi'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filled > 0 && (
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Rata-rata: <span className="font-bold text-gray-900">
                  {(Object.values(scores).filter(v=>v!=='').reduce((a,b)=>a+parseFloat(b),0)/filled).toFixed(1)}
                </span>
              </div>
              <button onClick={handleSave} disabled={batchMut.isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold">
                {batchMut.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                Simpan {filled} Nilai
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
