'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, Download, ChevronDown, ChevronUp, Award, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Pagination } from '@/components/ui/Pagination';

interface GradeItem {
  type: string;
  score: number;
  max: number;
  date: string;
}

interface SubjectGrade {
  subject: string;
  code: string;
  teacher: string;
  grades: GradeItem[];
  average: number;
}

const GRADE_DATA: SubjectGrade[] = [
  {
    subject: 'Matematika', code: 'MTK', teacher: 'Siti Rahayu, S.Pd.',
    grades: [
      { type: 'Tugas 1 (Aljabar)', score: 85, max: 100, date: '2025-08-10' },
      { type: 'Tugas 2 (Persamaan)', score: 90, max: 100, date: '2025-08-20' },
      { type: 'UH 1', score: 78, max: 100, date: '2025-09-05' },
      { type: 'UTS Mid Sem', score: 82, max: 100, date: '2025-10-15' },
    ],
    average: 83.75,
  },
  {
    subject: 'Bahasa Indonesia', code: 'BIN', teacher: 'Rina Widyawati, S.Pd.',
    grades: [
      { type: 'Tugas 1 (Essay)', score: 88, max: 100, date: '2025-08-12' },
      { type: 'Tugas 2 (Puisi)', score: 92, max: 100, date: '2025-08-22' },
      { type: 'UH 1', score: 85, max: 100, date: '2025-09-08' },
      { type: 'UTS Mid Sem', score: 87, max: 100, date: '2025-10-15' },
    ],
    average: 88.0,
  },
  {
    subject: 'IPA (Fisika & Biologi)', code: 'IPA', teacher: 'Ahmad Fauzi, M.Pd.',
    grades: [
      { type: 'Praktikum Lab', score: 90, max: 100, date: '2025-08-15' },
      { type: 'Tugas 1 (Fotosintesis)', score: 75, max: 100, date: '2025-08-25' },
      { type: 'UH 1', score: 72, max: 100, date: '2025-09-10' },
      { type: 'UTS Mid Sem', score: 78, max: 100, date: '2025-10-15' },
    ],
    average: 78.75,
  },
  {
    subject: 'Bahasa Inggris', code: 'BING', teacher: 'Rina Kartika, S.Pd.',
    grades: [
      { type: 'Listening Quiz', score: 82, max: 100, date: '2025-08-13' },
      { type: 'UH 1 Grammar', score: 79, max: 100, date: '2025-09-06' },
      { type: 'UTS Mid Sem', score: 84, max: 100, date: '2025-10-15' },
    ],
    average: 81.67,
  },
  {
    subject: 'PAI & Ke-NU-an', code: 'PAI', teacher: 'Nur Hidayah, S.Ag.',
    grades: [
      { type: 'Setoran Hafalan', score: 95, max: 100, date: '2025-08-18' },
      { type: 'Tugas Fikih', score: 90, max: 100, date: '2025-08-28' },
      { type: 'UTS Mid Sem', score: 92, max: 100, date: '2025-10-15' },
    ],
    average: 92.33,
  },
  {
    subject: 'IPS (Sejarah & Geografi)', code: 'IPS', teacher: 'Dewi Susanti, S.Pd.',
    grades: [
      { type: 'Tugas Peta SDA', score: 88, max: 100, date: '2025-08-14' },
      { type: 'UTS Mid Sem', score: 86, max: 100, date: '2025-10-15' },
    ],
    average: 87.0,
  },
];

const KKM = 70;
const ITEMS_PER_PAGE = 5;

function getGradeLabel(avg: number) {
  if (avg >= 90) return { label: 'A', color: 'text-emerald-800 bg-emerald-100 border-emerald-200' };
  if (avg >= 80) return { label: 'B', color: 'text-blue-800 bg-blue-100 border-blue-200' };
  if (avg >= 70) return { label: 'C', color: 'text-amber-800 bg-amber-100 border-amber-200' };
  return { label: 'D', color: 'text-rose-800 bg-rose-100 border-rose-200' };
}

export default function SiswaNilaiPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>('MTK');
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState<string>('2024/2025');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filtered = GRADE_DATA.filter(g =>
    g.subject.toLowerCase().includes(search.toLowerCase()) ||
    g.code.toLowerCase().includes(search.toLowerCase()) ||
    g.teacher.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const overallAvg = GRADE_DATA.reduce((a, b) => a + b.average, 0) / GRADE_DATA.length;
  const belowKKM = GRADE_DATA.filter(g => g.average < KKM).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Nilai &amp; Rapor Akademik Siswa</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {user?.student?.fullName || 'Siswa'} · Kelas {user?.student?.class?.name || '8A'} · TA {academicYear}
          </p>
        </div>

        {/* Separated Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Dropdown Semester */}
          <div className="relative">
            <select
              value={semester}
              onChange={e => { setSemester(Number(e.target.value)); setCurrentPage(1); }}
              className="pl-4 pr-9 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-extrabold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs cursor-pointer"
            >
              <option value={1}>Semester 1 (Ganjil)</option>
              <option value={2}>Semester 2 (Genap)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
          </div>

          {/* Dropdown Tahun Ajaran */}
          <div className="relative">
            <select
              value={academicYear}
              onChange={e => { setAcademicYear(e.target.value); setCurrentPage(1); }}
              className="pl-4 pr-9 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-extrabold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs cursor-pointer"
            >
              <option value="2024/2025">T.A. 2024/2025</option>
              <option value="2023/2024">T.A. 2023/2024</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs">
            <Download className="w-4 h-4" /> Unduh Rapor PDF
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 rounded-3xl p-6 text-white text-center shadow-md">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-300 animate-bounce" />
          <p className="text-3xl sm:text-4xl font-black">{overallAvg.toFixed(1)}</p>
          <p className="text-xs font-extrabold text-emerald-100 mt-1">Rata-rata Rapor Akademik</p>
        </div>

        <div className={`rounded-3xl p-6 text-center shadow-2xs border ${belowKKM > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50/80 border-emerald-100'}`}>
          {belowKKM > 0
            ? <TrendingDown className="w-8 h-8 mx-auto mb-2 text-rose-600" />
            : <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-700" />}
          <p className={`text-3xl sm:text-4xl font-black ${belowKKM > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{belowKKM}</p>
          <p className="text-xs font-extrabold text-slate-700 mt-1">Mapel di Bawah KKM</p>
        </div>

        <div className="bg-blue-50/80 border border-blue-100 rounded-3xl p-6 text-center shadow-2xs">
          <Award className="w-8 h-8 mx-auto mb-2 text-blue-700" />
          <p className="text-3xl sm:text-4xl font-black text-blue-900">{GRADE_DATA.length}</p>
          <p className="text-xs font-extrabold text-slate-700 mt-1">Mata Pelajaran (KKM: {KKM})</p>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="search"
              placeholder="Cari mata pelajaran atau nama guru pengampu..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Interactive Grade Cards List */}
        <div className="divide-y divide-emerald-50">
          {paginated.map((g) => {
            const gradeLabel = getGradeLabel(g.average);
            const isExpanded = expanded === g.code;
            const isBelow = g.average < KKM;

            return (
              <div key={g.code} className="transition-all">
                <button
                  onClick={() => setExpanded(isExpanded ? null : g.code)}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-emerald-50/30 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-800 text-xs font-black shadow-2xs">
                    {g.code}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-slate-900">{g.subject}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{g.teacher} · {g.grades.length} Penilaian</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {isBelow && (
                      <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-3 py-1 rounded-full border border-rose-200">Di bawah KKM</span>
                    )}
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">{g.average.toFixed(1)}</p>
                      <p className="text-[11px] font-extrabold text-slate-400">Rata-rata</p>
                    </div>
                    <span className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-sm font-black shadow-2xs ${gradeLabel.color}`}>
                      {gradeLabel.label}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-emerald-700" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Progress bar */}
                <div className="px-6 pb-4 -mt-2">
                  <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                    <div className={`h-full rounded-full transition-all ${isBelow ? 'bg-rose-500' : 'bg-emerald-600'}`}
                      style={{ width: `${g.average}%` }} />
                  </div>
                </div>

                {/* Detail Table */}
                {isExpanded && (
                  <div className="border-t border-emerald-100 bg-emerald-50/20">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-emerald-100 bg-emerald-50/40">
                            <th className="px-6 py-3 text-left font-extrabold text-slate-700">Jenis Penilaian</th>
                            <th className="px-6 py-3 text-center font-extrabold text-slate-700">Nilai Siswa</th>
                            <th className="px-6 py-3 text-center font-extrabold text-slate-700">Maksimum</th>
                            <th className="px-6 py-3 text-center font-extrabold text-slate-700">Persentase</th>
                            <th className="px-6 py-3 text-left font-extrabold text-slate-700">Tanggal Ujian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-50 bg-white">
                          {g.grades.map((gr, i) => {
                            const pct = Math.round((gr.score / gr.max) * 100);
                            return (
                              <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="px-6 py-3.5 font-extrabold text-slate-900">{gr.type}</td>
                                <td className="px-6 py-3.5 text-center font-black text-emerald-800 text-sm">{gr.score}</td>
                                <td className="px-6 py-3.5 text-center font-semibold text-slate-400">{gr.max}</td>
                                <td className="px-6 py-3.5 text-center">
                                  <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${pct >= 85 ? 'bg-emerald-100 text-emerald-800' : pct >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {pct}%
                                  </span>
                                </td>
                                <td className="px-6 py-3.5 text-slate-500 font-mono font-semibold">
                                  {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(gr.date))}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Trophy className="w-12 h-12 text-emerald-600 opacity-30 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Tidak ada nilai ditemukan untuk kata kunci ini</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
}
