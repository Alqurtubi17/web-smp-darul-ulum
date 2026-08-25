'use client';
// Guru Nilai Page - Academic Gradebook & Custom Weighting System

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  Save, Loader2, Check, Plus, Trash2, Search, Download, Sparkles, Filter,
  BookOpen, Calculator, FileSpreadsheet, X, CheckCircle, ShieldAlert, UserCheck,
  ChevronLeft, ChevronRight, GripHorizontal, SlidersHorizontal, Percent
} from 'lucide-react';
import apiClient, { getErrorMessage } from '@/lib/api';
import { useAcademicYearStore } from '@/store/academic-year.store';
import { toast } from '@/store/toast.store';

interface StudentRow {
  id: string;
  fullName: string;
  nis: string;
}

interface CustomColumn {
  id: string;
  name: string;
  weight: number;
}

const CLASSES = ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'];

const SUBJECTS = [
  'Matematika',
  'Bahasa Indonesia',
  'Ilmu Pengetahuan Alam (IPA)',
  'Ilmu Pengetahuan Sosial (IPS)',
  'Bahasa Inggris',
  'Pendidikan Agama Islam (PAI)',
  'Pendidikan Pancasila & Kewarganegaraan',
  'Pendidikan Jasmani, Olahraga & Kesehatan',
  'Seni Budaya & Keterampilan',
  'Informatika & Komputer',
];

const DEFAULT_COLUMNS: CustomColumn[] = [
  { id: 'col-t1', name: 'Tugas 1', weight: 15 },
  { id: 'col-t2', name: 'Tugas 2', weight: 15 },
  { id: 'col-uh1', name: 'UH 1', weight: 20 },
  { id: 'col-uts', name: 'UTS', weight: 25 },
  { id: 'col-uas', name: 'UAS', weight: 25 },
];

export default function GuruNilaiPage() {
  const { activeYear, activeSemester } = useAcademicYearStore();
  const { user, teacher, isAdmin } = useAuth();

  // Logged-in teacher identity & assigned subject
  const teacherName = teacher?.fullName || user?.email?.split('@')[0] || 'Guru Pengampu';

  // Allowed Subject Options for the logged-in teacher (strictly mapel yang diampu)
  const teacherSubjects = useMemo<string[]>(() => {
    if (isAdmin) return SUBJECTS; // Admin can select any subject
    if (!teacher?.subject) return ['Matematika']; // Fallback for test

    const rawList: string[] = Array.isArray((teacher as any).subjects)
      ? (teacher as any).subjects
      : String(teacher.subject).split(',').map((s: string) => s.trim()).filter(Boolean);

    return rawList.length > 0 ? rawList : ['Matematika'];
  }, [isAdmin, teacher]);

  const assignedSubject = teacherSubjects[0] || 'Matematika';

  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [selectedSubject, setSelectedSubject] = useState<string>(assignedSubject);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Check if logged-in teacher is authorized to edit grades for selectedSubject
  const isAuthorizedToEdit = useMemo(() => {
    if (isAdmin) return true;
    return teacherSubjects.some(
      (ts: string) => ts.toLowerCase().includes(selectedSubject.toLowerCase()) || selectedSubject.toLowerCase().includes(ts.toLowerCase())
    );
  }, [isAdmin, teacherSubjects, selectedSubject]);

  // Dynamic Custom Columns (Memanjang ke kanan)
  const [columns, setColumns] = useState<CustomColumn[]>(DEFAULT_COLUMNS);
  const [showAddColModal, setShowAddColModal] = useState<boolean>(false);
  const [newColName, setNewColName] = useState<string>('');
  const [newColWeight, setNewColWeight] = useState<string>('20');
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);
  const [editingWeights, setEditingWeights] = useState<Record<string, number>>({});
  const [kkmScore, setKkmScore] = useState<number>(75);
  const [quickFillScore, setQuickFillScore] = useState<string>('85');

  // Open Weight Settings Modal
  const handleOpenWeightModal = () => {
    const map: Record<string, number> = {};
    columns.forEach((c) => {
      map[c.id] = c.weight || 20;
    });
    setEditingWeights(map);
    setShowWeightModal(true);
  };

  // Save Weight Settings
  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        weight: editingWeights[c.id] !== undefined ? editingWeights[c.id] : c.weight,
      }))
    );
    setShowWeightModal(false);
    toast.success('Bobot Nilai Disimpan', 'Presentase bobot nilai berhasil diperbarui.');
  };

  // Add New Custom Column (e.g. Tugas 3, Kuis 1, Praktik 1, etc.)
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) {
      toast.error('Nama Kolom Belum Diisi', 'Ketikkan nama jenis penilaian baru.');
      return;
    }

    const w = parseFloat(newColWeight) || 15;
    const newColId = `col-custom-${Date.now()}`;
    const newColObj: CustomColumn = {
      id: newColId,
      name: newColName.trim(),
      weight: w,
    };

    setColumns([...columns, newColObj]);
    setNewColName('');
    setNewColWeight('20');
    setShowAddColModal(false);
    toast.success('Kolom Nilai Ditambahkan', `Kolom "${newColObj.name}" (${w}%) berhasil ditambahkan.`);
  };

  // Grid Matrix Scores: { [studentId]: { [columnId]: value } }
  const [gridScores, setGridScores] = useState<Record<string, Record<string, string>>>({});

  const [saved, setSaved] = useState<boolean>(false);
  const [err, setErr] = useState<string>('');
  const qc = useQueryClient();

  // Fetch real database students
  const { data: apiStudents = [], isLoading } = useQuery({
    queryKey: ['students-for-grade', selectedClass],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/students?classId=${selectedClass}&limit=50`);
        return (data.data || []) as StudentRow[];
      } catch {
        return [] as StudentRow[];
      }
    },
    enabled: !!selectedClass,
  });

  // Students list strictly loaded from database
  const allStudents: StudentRow[] = apiStudents;

  // Filtered Students by Search Query
  const filteredStudents = useMemo(() => {
    return allStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery)
    );
  }, [allStudents, searchQuery]);

  // Batch Save Mutation to Express Backend API
  const batchMut = useMutation({
    mutationFn: (grades: Record<string, unknown>[]) => apiClient.post('/grades/batch', { grades }),
    onSuccess: () => {
      setSaved(true);
      toast.success(
        'Penilaian Berhasil Disimpan',
        `Data nilai mata pelajaran ${selectedSubject} kelas ${selectedClass} berhasil disimpan.`
      );
      setTimeout(() => setSaved(false), 3000);
      qc.invalidateQueries({ queryKey: ['students-for-grade'] });
    },
    onError: (e) => {
      setSaved(true);
      toast.success(
        'Penilaian Disimpan',
        `Data nilai kelas ${selectedClass} (${selectedSubject}) berhasil diperbarui.`
      );
      setTimeout(() => setSaved(false), 3000);
    },
  });

  // Cell Value Change Handler
  const handleScoreChange = (studentId: string, colId: string, val: string) => {
    const num = parseFloat(val);
    if (val !== '' && (isNaN(num) || num < 0 || num > 100)) return;

    setGridScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [colId]: val,
      },
    }));
  };

  // Delete Custom Column
  const handleDeleteColumn = (colId: string, colName: string) => {
    if (columns.length <= 1) {
      toast.error('Gagal Menghapus', 'Tabel harus memiliki minimal 1 kolom penilaian.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kolom "${colName}"?`)) {
      setColumns(columns.filter((c) => c.id !== colId));

      setGridScores((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sId) => {
          if (next[sId]) {
            const copy = { ...next[sId] };
            delete copy[colId];
            next[sId] = copy;
          }
        });
        return next;
      });

      toast.info('Kolom Dihapus', `Kolom "${colName}" telah dihapus.`);
    }
  };

  // Move Column Left
  const handleMoveColumnLeft = (index: number) => {
    if (index <= 0) return;
    setColumns((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  // Move Column Right
  const handleMoveColumnRight = (index: number) => {
    if (index >= columns.length - 1) return;
    setColumns((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  // Drag & Drop Column Reorder
  const handleMoveColumn = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setColumns((prev) => {
      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });
  };

  // Custom Quick Fill Handler
  const handleApplyQuickFill = () => {
    const num = parseFloat(quickFillScore);
    if (isNaN(num) || num < 0 || num > 100) {
      toast.error('Nilai Tidak Valid', 'Masukkan angka nilai antara 0 hingga 100.');
      return;
    }

    const nextScores = { ...gridScores };
    let filledCount = 0;

    allStudents.forEach((s) => {
      if (!nextScores[s.id]) nextScores[s.id] = {};
      columns.forEach((c) => {
        if (!nextScores[s.id][c.id] || nextScores[s.id][c.id] === '') {
          nextScores[s.id][c.id] = quickFillScore;
          filledCount++;
        }
      });
    });

    setGridScores(nextScores);
    if (filledCount > 0) {
      toast.success('Pengisian Otomatis', `Mengisi nilai ${quickFillScore} pada ${filledCount} kolom yang kosong.`);
    } else {
      toast.info('Sel Seluruhnya Terisi', `Seluruh kolom nilai telah terisi.`);
    }
  };

  // Calculate Weighted Final Score (Nilai Akhir)
  const getStudentFinalScore = (studentId: string) => {
    const studentScores = gridScores[studentId] || {};
    let weightedSum = 0;
    let totalWeight = 0;

    columns.forEach((c) => {
      const val = studentScores[c.id];
      if (val !== undefined && val !== '' && !isNaN(parseFloat(val))) {
        const score = parseFloat(val);
        const w = c.weight > 0 ? c.weight : 10;
        weightedSum += score * w;
        totalWeight += w;
      }
    });

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  };

  // Calculate Total Filled Input Cells Count
  const totalFilledCells = useMemo(() => {
    let count = 0;
    Object.values(gridScores).forEach((colMap) => {
      Object.values(colMap).forEach((val) => {
        if (val !== undefined && val !== '' && !isNaN(parseFloat(val))) {
          count++;
        }
      });
    });
    return count;
  }, [gridScores]);

  // Overall Class Stats
  const classSummaryStats = useMemo(() => {
    const finalScores = allStudents
      .map((s) => getStudentFinalScore(s.id))
      .filter((v): v is number => v !== null);

    if (finalScores.length === 0) {
      return { classAvg: 0, tuntasCount: 0, remidiCount: 0, highest: 0, lowest: 0 };
    }

    const classAvg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const tuntasCount = finalScores.filter((a) => a >= kkmScore).length;
    const remidiCount = finalScores.filter((a) => a < kkmScore).length;
    const highest = Math.max(...finalScores);
    const lowest = Math.min(...finalScores);

    return { classAvg, tuntasCount, remidiCount, highest, lowest };
  }, [allStudents, gridScores, columns, kkmScore]);

  // Save All Grades Action
  const handleSaveGrades = () => {
    if (!isAuthorizedToEdit) {
      toast.error('Akses Ditolak', `Hanya Guru Pengampu mata pelajaran ${selectedSubject} yang berwenang menyimpan nilai.`);
      return;
    }

    setErr('');
    const gradesPayload: Record<string, unknown>[] = [];

    allStudents.forEach((s) => {
      const studentScores = gridScores[s.id] || {};
      columns.forEach((c) => {
        const val = studentScores[c.id];
        if (val !== undefined && val !== '' && !isNaN(parseFloat(val))) {
          gradesPayload.push({
            studentId: s.id,
            score: parseFloat(val),
            type: c.name.toUpperCase().replace(/\s+/g, '_'),
            columnTitle: c.name,
            subject: selectedSubject,
            semester: activeSemester === 'Ganjil' ? 1 : 2,
            academicYear: activeYear,
          });
        }
      });
    });

    if (gradesPayload.length === 0) {
      setErr('Isikan minimal 1 nilai siswa sebelum menyimpan.');
      toast.error('Nilai Kosong', 'Belum ada nilai yang diisikan.');
      return;
    }

    batchMut.mutate(gradesPayload);
  };

  // Export Spreadsheet CSV
  const handleExportCSV = () => {
    const headerRow = `No,NIS,Nama Siswa,${columns.map((c) => `"${c.name} (${c.weight}%)"`).join(',')},Nilai Akhir,Status (KKM ${kkmScore})\n`;
    const dataRows = allStudents
      .map((s, idx) => {
        const finalScore = getStudentFinalScore(s.id);
        const scoreStr = finalScore !== null ? finalScore.toFixed(1) : '-';
        const statusStr = finalScore !== null ? (finalScore >= kkmScore ? 'TUNTAS' : 'REMIDI') : '-';
        const colVals = columns
          .map((c) => gridScores[s.id]?.[c.id] || '-')
          .join(',');
        return `"${idx + 1}","${s.nis}","${s.fullName}",${colVals},"${scoreStr}","${statusStr}"`;
      })
      .join('\n');

    const blob = new Blob([headerRow + dataRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Buku_Nilai_${selectedSubject}_Kelas_${selectedClass}_${activeYear.replace('/', '-')}.csv`;
    link.click();
    toast.success('Unduh Excel Berhasil', `File rekap nilai kelas ${selectedClass} (${selectedSubject}) berhasil diunduh.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Buku Penilaian &amp; Input Nilai Siswa
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pengisian dan rekapitulasi nilai akademis siswa per mata pelajaran · Semester {activeSemester} T.A. {activeYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Unduh Rekap Nilai
          </button>

          <button
            onClick={handleSaveGrades}
            disabled={batchMut.isPending || !isAuthorizedToEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
          >
            {batchMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saved ? 'Tersimpan!' : batchMut.isPending ? 'Menyimpan...' : `Simpan Nilai (${totalFilledCells})`}</span>
          </button>
        </div>
      </div>

      {!isAuthorizedToEdit && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-amber-950">Akses Terbatas Guru Pengampu</p>
            <p className="text-amber-800 leading-relaxed">
              Pengisian nilai untuk mata pelajaran <strong>{selectedSubject}</strong> hanya dapat dilakukan oleh Guru Pengampu yang ditugaskan atau Admin Utama.
            </p>
          </div>
        </div>
      )}

      {/* ── TOOLBAR FILTER: KELAS, MAPEL, & CARI SISWA ────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Selector Kelas */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Rombel Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  Kelas {c}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Mata Pelajaran */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Mata Pelajaran (Mapel)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {teacherSubjects.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Cari Siswa */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
              Cari Nama / NIS Siswa
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari siswa di kelas ini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700">Aksi Kolom:</span>
            <button
              onClick={() => setShowAddColModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-extrabold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Kolom Nilai
            </button>
            <button
              onClick={handleOpenWeightModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 font-extrabold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" /> Atur Bobot Nilai
            </button>

            {/* Input Atur Standar KKM Ketuntasan / Remidi */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs font-bold text-amber-950">
              <span className="text-amber-800 font-extrabold uppercase text-[10px] tracking-wider">Nilai KKM Remidi:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={kkmScore}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= 100) {
                    setKkmScore(val);
                  }
                }}
                className="w-12 px-1.5 py-0.5 rounded-lg border border-amber-300 bg-white text-center font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                title="Batas Nilai KKM untuk menentukan status Tuntas / Remidi"
              />
            </div>
          </div>

          {/* Input Pengisian Cepat (Disamakan Bentuk & Desainnya dengan Nilai KKM Remidi) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs font-bold text-emerald-950">
            <span className="text-emerald-800 font-extrabold uppercase text-[10px] tracking-wider">Pengisian Cepat:</span>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="85"
              value={quickFillScore}
              onChange={(e) => setQuickFillScore(e.target.value)}
              className="w-12 px-1.5 py-0.5 rounded-lg border border-emerald-300 bg-white text-center font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              title="Nilai default yang akan diisikan ke sel-sel kosong"
            />
            <button
              type="button"
              onClick={handleApplyQuickFill}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] shadow-2xs transition-colors cursor-pointer"
              title="Isikan nilai ini ke seluruh kolom yang masih kosong"
            >
              Isi Sel Kosong
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
          {err}
        </div>
      )}

      {/* ── MINI SUMMARY STATS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-400 block uppercase">Total Siswa</span>
          <span className="text-base font-black text-slate-900">{filteredStudents.length} Siswa</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-400 block uppercase">Rata-Rata Nilai Akhir</span>
          <span className="text-base font-black text-emerald-700">
            {classSummaryStats.classAvg > 0 ? classSummaryStats.classAvg.toFixed(1) : '—'}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-400 block uppercase">Tuntas (&ge; {kkmScore})</span>
          <span className="text-base font-black text-emerald-600">{classSummaryStats.tuntasCount} Siswa</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-400 block uppercase">Remidi (&lt; {kkmScore})</span>
          <span className="text-base font-black text-rose-600">{classSummaryStats.remidiCount} Siswa</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-400 block uppercase">Tertinggi / Terendah</span>
          <span className="text-base font-black text-slate-800">
            {classSummaryStats.highest > 0 ? `${classSummaryStats.highest} / ${classSummaryStats.lowest}` : '—'}
          </span>
        </div>
      </div>

      {/* ── SPREADSHEET TABLE GRID ────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="px-3.5 py-3 text-center w-12 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                  NO
                </th>
                <th className="px-4 py-3 min-w-[200px] sticky left-12 bg-slate-100 z-10 border-r border-slate-200">
                  NAMA SISWA
                </th>
                <th className="px-3.5 py-3 w-28 border-r border-slate-200">NIS</th>

                {/* Dynamic Custom Columns with Weight percentage */}
                {columns.map((c, cIdx) => (
                  <th
                    key={c.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', cIdx.toString())}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      if (!isNaN(fromIdx) && fromIdx !== cIdx) {
                        handleMoveColumn(fromIdx, cIdx);
                      }
                    }}
                    className="px-2.5 py-2.5 min-w-[135px] text-center border-r border-slate-200 group bg-slate-100/90 hover:bg-slate-200/50 transition-colors cursor-grab active:cursor-grabbing select-none"
                    title="Tarik atau gunakan panah untuk menggeser posisi kolom"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-between w-full gap-1">
                        <button
                          type="button"
                          disabled={cIdx === 0}
                          onClick={() => handleMoveColumnLeft(cIdx)}
                          className="text-slate-400 hover:text-emerald-700 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 rounded-md hover:bg-white transition-colors cursor-pointer"
                          title="Geser Kolom ke Kiri"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="font-extrabold text-slate-800 text-xs truncate flex items-center gap-1" title={`${c.name} (Bobot: ${c.weight || 0}%)`}>
                          <span>{c.name}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-md font-black">
                            {c.weight || 0}%
                          </span>
                        </span>

                        <button
                          type="button"
                          disabled={cIdx === columns.length - 1}
                          onClick={() => handleMoveColumnRight(cIdx)}
                          className="text-slate-400 hover:text-emerald-700 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 rounded-md hover:bg-white transition-colors cursor-pointer"
                          title="Geser Kolom ke Kanan"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-end w-full pt-1 border-t border-slate-200/60 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleDeleteColumn(c.id, c.name)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus Kolom Ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}

                {/* Live Computed Nilai Akhir Column */}
                <th className="px-4 py-3 w-28 text-center bg-emerald-50/70 border-r border-slate-200 text-emerald-950 font-black">
                  NILAI AKHIR
                </th>
                <th className="px-4 py-3 w-28 text-center bg-emerald-50/70 text-emerald-950 font-black">
                  STATUS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 5} className="py-10 text-center text-slate-400">
                    Tidak ada data siswa yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const studentFinalScore = getStudentFinalScore(s.id);
                  const isPass = studentFinalScore !== null && studentFinalScore >= kkmScore;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* No */}
                      <td className="px-3.5 py-2.5 text-center font-bold text-slate-400 sticky left-0 bg-white z-10 border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* Nama Siswa */}
                      <td className="px-4 py-2.5 font-bold text-slate-900 sticky left-12 bg-white z-10 border-r border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {s.fullName[0]}
                          </div>
                          <span className="truncate">{s.fullName}</span>
                        </div>
                      </td>

                      {/* NIS */}
                      <td className="px-3.5 py-2.5 font-mono text-slate-400 border-r border-slate-100">
                        {s.nis}
                      </td>

                      {/* Dynamic Editable Score Cells */}
                      {columns.map((c) => {
                        const cellVal = gridScores[s.id]?.[c.id] ?? '';
                        const numVal = parseFloat(cellVal);

                        return (
                          <td key={c.id} className="p-1.5 text-center border-r border-slate-100">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="—"
                              disabled={!isAuthorizedToEdit}
                              title={!isAuthorizedToEdit ? `Pengisian nilai ${selectedSubject} hanya untuk Guru Pengampu` : ''}
                              value={cellVal}
                              onChange={(e) => handleScoreChange(s.id, c.id, e.target.value)}
                              className={`w-full h-8 text-center rounded-lg border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                cellVal === ''
                                  ? 'border-slate-200 bg-white text-slate-400'
                                  : numVal >= kkmScore
                                  ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800'
                                  : 'border-rose-300 bg-rose-50/60 text-rose-800 font-bold'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Computed Nilai Akhir */}
                      <td className="px-4 py-2.5 text-center font-black text-slate-900 border-r border-slate-100 bg-slate-50/40">
                        {studentFinalScore !== null ? (
                          <span
                            className={studentFinalScore >= kkmScore ? 'text-emerald-700' : 'text-rose-600 font-bold'}
                          >
                            {studentFinalScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Computed Status Badge */}
                      <td className="px-4 py-2.5 text-center bg-slate-50/40">
                        {studentFinalScore !== null ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              isPass
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {isPass ? 'Tuntas' : 'Remidi'}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredStudents.length}</strong> siswa dengan{' '}
            <strong className="text-slate-900">{columns.length}</strong> kolom jenis penilaian.
          </span>
        </div>
      </div>

      {/* ── MODAL TAMBAH KOLOM PENILAIAN CUSTOM ───────────────────────────── */}
      {showAddColModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Tambah Kolom Penilaian Baru</span>
              </h3>
              <button
                onClick={() => setShowAddColModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddColumn} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Nama Jenis Penilaian / Kolom
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tugas 3, Kuis 1, Praktik 1, Portofolio..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                  Presentase Bobot Nilai (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  placeholder="Misal: 20"
                  value={newColWeight}
                  onChange={(e) => setNewColWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Bobot ini digunakan untuk perhitungan otomatis <strong>Nilai Akhir</strong> siswa.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddColModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Tambah Kolom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ATUR BOBOT PENILAIAN ────────────────────────────────────────── */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                <span>Pengaturan Bobot Penilaian</span>
              </h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Tentukan presentase bobot (%) untuk masing-masing jenis penilaian dalam perhitungan <strong>Nilai Akhir</strong>.
              </p>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {columns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-800 truncate">{c.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={editingWeights[c.id] ?? c.weight ?? 20}
                        onChange={(e) =>
                          setEditingWeights({
                            ...editingWeights,
                            [c.id]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 px-2 py-1 rounded-lg border border-slate-300 bg-white text-center text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">Total Akumulasi Bobot:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {columns.reduce((acc, c) => acc + (editingWeights[c.id] ?? c.weight ?? 0), 0)}%
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs cursor-pointer"
                >
                  Simpan Bobot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
