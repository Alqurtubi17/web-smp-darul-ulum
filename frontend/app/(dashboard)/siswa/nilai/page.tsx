'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Download, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const GRADE_DATA = [
  {
    subject: 'Matematika', code: 'MTK', teacher: 'Siti Rahayu, S.Pd.',
    grades: [
      { type: 'Tugas 1', score: 85, max: 100, date: '2025-08-10' },
      { type: 'Tugas 2', score: 90, max: 100, date: '2025-08-20' },
      { type: 'UH 1', score: 78, max: 100, date: '2025-09-05' },
      { type: 'UTS', score: 82, max: 100, date: '2025-10-15' },
    ],
    average: 83.75,
  },
  {
    subject: 'Bahasa Indonesia', code: 'BIN', teacher: 'Rina Widyawati, S.Pd.',
    grades: [
      { type: 'Tugas 1', score: 88, max: 100, date: '2025-08-12' },
      { type: 'Tugas 2', score: 92, max: 100, date: '2025-08-22' },
      { type: 'UH 1', score: 85, max: 100, date: '2025-09-08' },
      { type: 'UTS', score: 87, max: 100, date: '2025-10-15' },
    ],
    average: 88,
  },
  {
    subject: 'IPA', code: 'IPA', teacher: 'Budi Santoso, S.Pd.',
    grades: [
      { type: 'Praktik 1', score: 90, max: 100, date: '2025-08-15' },
      { type: 'Tugas 1', score: 75, max: 100, date: '2025-08-25' },
      { type: 'UH 1', score: 72, max: 100, date: '2025-09-10' },
      { type: 'UTS', score: 78, max: 100, date: '2025-10-15' },
    ],
    average: 78.75,
  },
  {
    subject: 'Bahasa Inggris', code: 'BING', teacher: 'Hendra Purnomo, S.Pd.',
    grades: [
      { type: 'Tugas 1', score: 82, max: 100, date: '2025-08-13' },
      { type: 'UH 1', score: 79, max: 100, date: '2025-09-06' },
      { type: 'UTS', score: 84, max: 100, date: '2025-10-15' },
    ],
    average: 81.67,
  },
  {
    subject: 'PAI', code: 'PAI', teacher: 'Ustadz Ahmad Malik, Lc.',
    grades: [
      { type: 'Hafalan', score: 95, max: 100, date: '2025-08-18' },
      { type: 'Tugas 1', score: 90, max: 100, date: '2025-08-28' },
      { type: 'UTS', score: 92, max: 100, date: '2025-10-15' },
    ],
    average: 92.33,
  },
];

const KKM = 70;

function getGradeLabel(avg: number) {
  if (avg >= 90) return { label: 'A', color: 'text-green-600 bg-green-100' };
  if (avg >= 80) return { label: 'B', color: 'text-blue-600 bg-blue-100' };
  if (avg >= 70) return { label: 'C', color: 'text-yellow-600 bg-yellow-100' };
  return { label: 'D', color: 'text-red-600 bg-red-100' };
}

export default function SiswaNilaiPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [semester, setSemester] = useState(1);

  const overallAvg = GRADE_DATA.reduce((a, b) => a + b.average, 0) / GRADE_DATA.length;
  const belowKKM = GRADE_DATA.filter(g => g.average < KKM).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nilai Saya</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.student?.fullName} · Kelas {user?.student?.class?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[1, 2].map(s => (
              <button key={s} onClick={() => setSemester(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${semester === s ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
                Sem {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Unduh Rapor
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 text-white text-center">
          <Trophy className="w-7 h-7 mx-auto mb-2 text-yellow-300" />
          <p className="text-3xl font-bold">{overallAvg.toFixed(1)}</p>
          <p className="text-xs text-green-200 mt-0.5">Rata-rata Keseluruhan</p>
        </div>
        <div className={`rounded-2xl p-5 text-center ${belowKKM > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          {belowKKM > 0
            ? <TrendingDown className="w-7 h-7 mx-auto mb-2 text-red-500" />
            : <TrendingUp className="w-7 h-7 mx-auto mb-2 text-green-500" />}
          <p className={`text-3xl font-bold ${belowKKM > 0 ? 'text-red-600' : 'text-green-600'}`}>{belowKKM}</p>
          <p className="text-xs text-gray-500 mt-0.5">Mapel di bawah KKM</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{GRADE_DATA.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Mata Pelajaran</p>
          <p className="text-xs text-gray-400 mt-0.5">KKM: {KKM}</p>
        </div>
      </div>

      {/* Grade cards */}
      <div className="space-y-3">
        {GRADE_DATA.map((g) => {
          const gradeLabel = getGradeLabel(g.average);
          const isExpanded = expanded === g.code;
          const isBelow = g.average < KKM;

          return (
            <div key={g.code} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : g.code)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-gray-600">{g.code}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{g.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{g.teacher} · {g.grades.length} nilai</p>
                </div>
                <div className="flex items-center gap-3">
                  {isBelow && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Di bawah KKM</span>
                  )}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{g.average.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">rata-rata</p>
                  </div>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${gradeLabel.color}`}>
                    {gradeLabel.label}
                  </span>
                </div>
              </button>

              {/* Progress bar */}
              <div className="px-5 pb-3 -mt-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isBelow ? 'bg-red-400' : 'bg-green-500'}`}
                    style={{ width: `${g.average}%` }} />
                </div>
              </div>

              {/* Detail rows */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Jenis Penilaian</th>
                          <th className="px-5 py-2.5 text-center text-xs font-medium text-gray-500">Nilai</th>
                          <th className="px-5 py-2.5 text-center text-xs font-medium text-gray-500">Maks</th>
                          <th className="px-5 py-2.5 text-center text-xs font-medium text-gray-500">%</th>
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {g.grades.map((gr, i) => {
                          const pct = Math.round((gr.score / gr.max) * 100);
                          return (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-5 py-2.5 text-gray-700">{gr.type}</td>
                              <td className="px-5 py-2.5 text-center font-semibold text-gray-900">{gr.score}</td>
                              <td className="px-5 py-2.5 text-center text-gray-400">{gr.max}</td>
                              <td className="px-5 py-2.5 text-center">
                                <span className={`text-xs font-medium ${pct >= 85 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-red-600'}`}>
                                  {pct}%
                                </span>
                              </td>
                              <td className="px-5 py-2.5 text-gray-400 text-xs">
                                {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(gr.date))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="px-5 py-2.5 text-xs font-semibold text-gray-600">Rata-rata</td>
                          <td colSpan={4} className="px-5 py-2.5 text-center">
                            <span className={`text-sm font-bold ${g.average >= KKM ? 'text-green-600' : 'text-red-600'}`}>
                              {g.average.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
