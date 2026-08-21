'use client';

import { useState } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, FileText, X, Zap, Award, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import { Pagination } from '@/components/ui/Pagination';

type FilterTab = 'semua' | 'belum' | 'dikumpulkan' | 'dinilai' | 'terlambat';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  maxScore: number;
  xpReward: number;
  difficulty: string;
  status: 'BELUM_SUBMIT' | 'SUBMITTED' | 'DINILAI' | 'TERLAMBAT';
  score?: number;
  feedback?: string;
  submittedAt?: string;
  description?: string;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Essay Bahasa Indonesia: Tema Pelestarian Lingkungan Surabaya',
    subject: 'Bahasa Indonesia',
    teacher: 'Rina Widyawati, S.Pd.',
    dueDate: '2025-07-05',
    maxScore: 100,
    xpReward: 120,
    difficulty: 'Sedang',
    status: 'BELUM_SUBMIT',
    description: 'Tulis essay minimal 500 kata tentang pentingnya menjaga kebersihan saluran air dan taman di Surabaya.'
  },
  {
    id: '2',
    title: 'Laporan Praktikum IPA: Proses Fotosintesis & Klorofil Sel',
    subject: 'IPA',
    teacher: 'Ahmad Fauzi, M.Pd.',
    dueDate: '2025-07-07',
    maxScore: 100,
    xpReward: 150,
    difficulty: 'Tinggi',
    status: 'BELUM_SUBMIT',
    description: 'Buat laporan praktikum sesuai format yang telah diuji coba di laboratorium IPA.'
  },
  {
    id: '3',
    title: 'Latihan Soal Matematika Bab 5 (Aljabar Linear & Persamaan)',
    subject: 'Matematika',
    teacher: 'Siti Rahayu, S.Pd.',
    dueDate: '2025-07-10',
    maxScore: 100,
    xpReward: 100,
    difficulty: 'Mudah',
    status: 'BELUM_SUBMIT',
    description: 'Kerjakan soal nomor 1-20 di buku LKS halaman 85-87 secara mandiri.'
  },
  {
    id: '4',
    title: 'Reading Comprehension: Tourism in Surabaya & Cultural Heritage',
    subject: 'Bahasa Inggris',
    teacher: 'Rina Kartika, S.Pd.',
    dueDate: '2025-06-28',
    maxScore: 100,
    xpReward: 100,
    difficulty: 'Sedang',
    status: 'SUBMITTED',
    submittedAt: '2025-06-25',
    description: 'Baca artikel dan jawab pertanyaan pemahaman teks.'
  },
  {
    id: '5',
    title: 'PR IPS: Peta Persebaran Sumber Daya Alam Nusantara',
    subject: 'IPS',
    teacher: 'Dewi Susanti, S.Pd.',
    dueDate: '2025-06-20',
    maxScore: 100,
    xpReward: 140,
    difficulty: 'Sedang',
    status: 'DINILAI',
    score: 88,
    feedback: 'Peta sudah sangat rapi dan lengkap. Legenda warna lebih jelas pada wilayah perairan.',
    submittedAt: '2025-06-18'
  },
  {
    id: '6',
    title: 'Setoran Hafalan Surat Al-Mulk Ayat 1-15',
    subject: 'PAI',
    teacher: 'Nur Hidayah, S.Ag.',
    dueDate: '2025-06-15',
    maxScore: 100,
    xpReward: 150,
    difficulty: 'Tinggi',
    status: 'DINILAI',
    score: 95,
    feedback: 'Hafalan sangat lancar dan tajwid makhraj tepat. Tingkatkan terus!',
    submittedAt: '2025-06-14'
  },
  {
    id: '7',
    title: 'Analisis Karakter Tokoh Cerita Pendek Nusantara',
    subject: 'Bahasa Indonesia',
    teacher: 'Bambang Kurniawan, S.Pd.',
    dueDate: '2025-07-12',
    maxScore: 100,
    xpReward: 110,
    difficulty: 'Sedang',
    status: 'BELUM_SUBMIT',
    description: 'Tentukan sifat dan watak tokoh utama dalam cerpen halaman 42.'
  },
  {
    id: '8',
    title: 'Kuis Singkat Hukum Newton I, II, & III',
    subject: 'IPA',
    teacher: 'Ahmad Fauzi, M.Pd.',
    dueDate: '2025-07-15',
    maxScore: 100,
    xpReward: 130,
    difficulty: 'Sedang',
    status: 'BELUM_SUBMIT',
    description: 'Jawab 10 soal uraian singkat hukum gerak Newton.'
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  BELUM_SUBMIT: { label: 'Belum Dikumpulkan', color: 'text-amber-800 bg-amber-100 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  SUBMITTED:    { label: 'Sudah Dikumpulkan', color: 'text-blue-800 bg-blue-100 border-blue-200',   icon: <CheckCircle2 className="w-3 h-3" /> },
  DINILAI:      { label: 'Sudah Dinilai',     color: 'text-emerald-800 bg-emerald-100 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  TERLAMBAT:    { label: 'Terlambat',         color: 'text-rose-800 bg-rose-100 border-rose-200',       icon: <AlertCircle className="w-3 h-3" /> },
};

const SUBJECTS = ['Semua Mapel', 'Matematika', 'Bahasa Indonesia', 'IPA', 'Bahasa Inggris', 'PAI', 'IPS'];
const ITEMS_PER_PAGE = 5;

export default function SiswaTugasPage() {
  const [taskList, setTaskList] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [selectedSubject, setSelectedSubject] = useState('Semua Mapel');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal & Celebration States
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [viewFeedbackTask, setViewFeedbackTask] = useState<Assignment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const filtered = taskList.filter(a => {
    const matchStatus =
      activeTab === 'semua' ? true :
      activeTab === 'belum' ? a.status === 'BELUM_SUBMIT' :
      activeTab === 'dikumpulkan' ? a.status === 'SUBMITTED' :
      activeTab === 'dinilai' ? a.status === 'DINILAI' :
      activeTab === 'terlambat' ? a.status === 'TERLAMBAT' : true;

    const matchSubject = selectedSubject === 'Semua Mapel' || a.subject === selectedSubject;

    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.teacher.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSubject && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const counts = {
    semua: taskList.length,
    belum: taskList.filter(a => a.status === 'BELUM_SUBMIT').length,
    dikumpulkan: taskList.filter(a => a.status === 'SUBMITTED').length,
    dinilai: taskList.filter(a => a.status === 'DINILAI').length,
    terlambat: taskList.filter(a => a.status === 'TERLAMBAT').length,
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));

    setTaskList(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: 'SUBMITTED', submittedAt: new Date().toISOString().split('T')[0] } : t));
    
    setEarnedXp(selectedTask.xpReward);
    setUploading(false);
    setSelectedTask(null);
    setAnswer('');
    setUploadedUrl('');
    setShowCelebration(true);
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Tabel Tugas &amp; Misi Siswa</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{taskList.length} total tugas akademik terdaftar di semester ini</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 text-xs font-black shadow-2xs">
          <Zap className="w-4 h-4 fill-amber-950" />
          <span>Kumpulkan Tugas = Ambil XP</span>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
              <Award className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Tugas Terkirim! 🎉</h3>
            <p className="text-xs font-bold text-slate-600">
              Tugas telah diserahkan ke guru pengajar. Kamu mendapatkan bonus:
            </p>
            <div className="inline-block px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 font-black text-sm shadow-2xs">
              +{earnedXp} XP Ditambahkan!
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="block w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-all"
            >
              Kembali ke Tabel Tugas
            </button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Kumpulkan Tugas Siswa</h2>
                <p className="text-[11px] font-semibold text-slate-500">Unggah berkas atau tuliskan jawaban pengerjaan tugas</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                    +{selectedTask.xpReward} XP Reward
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    Tingkat: {selectedTask.difficulty}
                  </span>
                </div>
                <p className="font-extrabold text-xs text-slate-900">{selectedTask.title}</p>
                <p className="text-[11px] font-semibold text-emerald-800">{selectedTask.subject} · Deadline: {formatDate(selectedTask.dueDate)}</p>
                {selectedTask.description && <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">{selectedTask.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Jawaban / Catatan Pengerjaan</label>
                <textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban atau keterangan pengumpulkan tugas..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs" />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Unggah Berkas Tugas (PDF/DOC/PNG)</label>
                <CustomImageUploader
                  endpoint="assignmentFile"
                  label="Upload Berkas Pengerjaan Siswa"
                  onUploadComplete={(url) => setUploadedUrl(url)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                />
                {uploadedUrl && <p className="text-xs font-extrabold text-emerald-700 mt-2">✓ Berkas berhasil diunggah</p>}
              </div>

              {isOverdue(selectedTask.dueDate) && (
                <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-rose-700">Tugas ini melewati tenggat waktu dan akan ditandai terlambat.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setSelectedTask(null)}
                className="flex-1 py-2.5 rounded-2xl border border-emerald-200 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 shadow-2xs">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-extrabold transition-all shadow-xs">
                {uploading ? 'Mengumpulkan...' : 'Kumpulkan & Ambil XP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback View Modal */}
      {viewFeedbackTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Hasil Evaluasi &amp; Catatan Guru</h2>
                <p className="text-[11px] font-semibold text-slate-500">{viewFeedbackTask.subject}</p>
              </div>
              <button onClick={() => setViewFeedbackTask(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Nilai Akhir</p>
                  <p className="text-3xl font-black text-emerald-800">{viewFeedbackTask.score} <span className="text-xs font-bold text-slate-400">/ {viewFeedbackTask.maxScore}</span></p>
                </div>
                <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-xl">Grade A</span>
              </div>

              <div>
                <p className="text-xs font-extrabold text-slate-800 mb-1">Catatan Evaluasi Guru ({viewFeedbackTask.teacher}):</p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-700 italic">
                  "{viewFeedbackTask.feedback || 'Pengerjaan sudah sangat baik dan sesuai instruksi.'}"
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-emerald-100 bg-emerald-50/40">
              <button onClick={() => setViewFeedbackTask(null)} className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
        
        {/* Table Filters & Search Header */}
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex flex-col lg:flex-row gap-3 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="search"
              placeholder="Cari judul tugas, mata pelajaran, atau nama guru..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>

          {/* Subject Filter */}
          <div className="relative w-full lg:w-48">
            <select
              value={selectedSubject}
              onChange={e => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
              className="w-full pl-4 pr-9 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-extrabold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            >
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1.5 bg-emerald-50/80 rounded-2xl p-1 border border-emerald-100 overflow-x-auto w-full lg:w-auto">
            {([
              { key: 'semua', label: 'Semua' },
              { key: 'belum', label: 'Belum' },
              { key: 'dikumpulkan', label: 'Dikumpulkan' },
              { key: 'dinilai', label: 'Dinilai' },
              { key: 'terlambat', label: 'Terlambat' },
            ] as { key: FilterTab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                  activeTab === t.key ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-950'
                }`}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-emerald-100 bg-emerald-50/20 text-slate-700 font-extrabold">
                <th className="px-5 py-3.5 text-left">Misi / Judul Tugas</th>
                <th className="px-5 py-3.5 text-left">Mapel &amp; Guru</th>
                <th className="px-5 py-3.5 text-left">Batas Waktu (Deadline)</th>
                <th className="px-5 py-3.5 text-left">Status / Hasil</th>
                <th className="px-5 py-3.5 text-center">Aksi Pengerjaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              {paginated.map((task) => {
                const cfg = STATUS_CONFIG[task.status];
                const overdue = isOverdue(task.dueDate) && task.status === 'BELUM_SUBMIT';

                return (
                  <tr key={task.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-1 max-w-sm">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-amber-950" /> +{task.xpReward} XP
                          </span>
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                            {task.difficulty}
                          </span>
                        </div>
                        <p className="font-extrabold text-slate-900 leading-snug">{task.title}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <span className="font-extrabold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          {task.subject}
                        </span>
                        <p className="text-[11px] font-semibold text-slate-500 mt-1">{task.teacher}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className={`font-mono font-bold ${overdue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatDate(task.dueDate)}
                        </p>
                        {overdue ? (
                          <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Terlambat!</span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">Nilai Maks: {task.maxScore}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>

                        {task.status === 'DINILAI' && (
                          <div>
                            <button
                              onClick={() => setViewFeedbackTask(task)}
                              className="text-[11px] font-black text-emerald-700 hover:underline block"
                            >
                              Nilai: {task.score}/{task.maxScore} (Lihat Feedback)
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {task.status === 'BELUM_SUBMIT' ? (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all shadow-2xs inline-flex items-center gap-1.5 ${
                            overdue
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" /> Kumpulkan
                        </button>
                      ) : (
                        <span className="text-xs font-extrabold text-slate-400">✓ Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 opacity-30 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Tidak ada tugas ditemukan</p>
          </div>
        )}

        {/* Pagination Component */}
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
