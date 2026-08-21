'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';

type FilterTab = 'semua' | 'belum' | 'dikumpulkan' | 'dinilai' | 'terlambat';

const ASSIGNMENTS = [
  { id: '1', title: 'Essay Bahasa Indonesia: Tema Pelestarian Lingkungan', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', dueDate: '2025-07-05', maxScore: 100, status: 'BELUM_SUBMIT', description: 'Tulis essay minimal 500 kata tentang pentingnya menjaga lingkungan hidup di Surabaya.' },
  { id: '2', title: 'Laporan Praktikum IPA: Proses Fotosintesis & Klorofil', subject: 'IPA', teacher: 'Ahmad Fauzi, M.Pd.', dueDate: '2025-07-07', maxScore: 100, status: 'BELUM_SUBMIT', description: 'Buat laporan praktikum sesuai format yang telah diberikan di laboratorium IPA.' },
  { id: '3', title: 'Latihan Soal Matematika Bab 5 (Aljabar Linear)', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', dueDate: '2025-07-10', maxScore: 100, status: 'BELUM_SUBMIT', description: 'Kerjakan soal nomor 1-20 di buku LKS halaman 85-87.' },
  { id: '4', title: 'Reading Comprehension: Tourism in Surabaya', subject: 'Bahasa Inggris', teacher: 'Rina Kartika, S.Pd.', dueDate: '2025-06-28', maxScore: 100, status: 'SUBMITTED', submittedAt: '2025-06-25', description: 'Baca teks dan jawab pertanyaan singkat.' },
  { id: '5', title: 'PR IPS: Peta Persebaran Sumber Daya Alam Indonesia', subject: 'IPS', teacher: 'Dewi Susanti, S.Pd.', dueDate: '2025-06-20', maxScore: 100, status: 'DINILAI', score: 88, feedback: 'Peta sudah lengkap dan rapi. Keterangan warna legenda diperjelas.', submittedAt: '2025-06-18' },
  { id: '6', title: 'Hafalan Surat Al-Mulk Ayat 1-15', subject: 'PAI', teacher: 'Nur Hidayah, S.Ag.', dueDate: '2025-06-15', maxScore: 100, status: 'DINILAI', score: 95, feedback: 'Hafalan sangat lancar dan makhraj tajwid sesuai. Pertahankan!', submittedAt: '2025-06-14' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  BELUM_SUBMIT: { label: 'Belum Dikumpulkan', color: 'text-amber-800 bg-amber-100 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  SUBMITTED:    { label: 'Sudah Dikumpulkan', color: 'text-blue-800 bg-blue-100 border-blue-200',   icon: <CheckCircle2 className="w-3 h-3" /> },
  DINILAI:      { label: 'Sudah Dinilai',     color: 'text-emerald-800 bg-emerald-100 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  TERLAMBAT:    { label: 'Terlambat',         color: 'text-rose-800 bg-rose-100 border-rose-200',       icon: <AlertCircle className="w-3 h-3" /> },
};

export default function SiswaTugasPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [selectedTask, setSelectedTask] = useState<typeof ASSIGNMENTS[0] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const filtered = ASSIGNMENTS.filter(a => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'belum') return a.status === 'BELUM_SUBMIT';
    if (activeTab === 'dikumpulkan') return a.status === 'SUBMITTED';
    if (activeTab === 'dinilai') return a.status === 'DINILAI';
    if (activeTab === 'terlambat') return a.status === 'TERLAMBAT';
    return true;
  });

  const counts = {
    semua: ASSIGNMENTS.length,
    belum: ASSIGNMENTS.filter(a => a.status === 'BELUM_SUBMIT').length,
    dikumpulkan: ASSIGNMENTS.filter(a => a.status === 'SUBMITTED').length,
    dinilai: ASSIGNMENTS.filter(a => a.status === 'DINILAI').length,
    terlambat: ASSIGNMENTS.filter(a => a.status === 'TERLAMBAT').length,
  };

  const handleSubmit = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUploading(false);
    setSelectedTask(null);
    setAnswer('');
    setUploadedUrl('');
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Tugas &amp; Pengumpulan Berkas Siswa</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Semester Ganjil TA 2024/2025</p>
      </div>

      {/* Submit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Pengumpulan Tugas Siswa</h2>
                <p className="text-[11px] font-semibold text-slate-500">Kirimkan hasil pengerjaan atau berkas tugas</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
                <p className="font-extrabold text-xs text-slate-900">{selectedTask.title}</p>
                <p className="text-[11px] font-semibold text-emerald-800 mt-1">{selectedTask.subject} · Deadline: {formatDate(selectedTask.dueDate)}</p>
                {selectedTask.description && <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{selectedTask.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Jawaban / Catatan Pengumpulan</label>
                <textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Tulis ringkasan atau keterangan pengumpulan tugas..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none shadow-2xs" />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Upload Berkas Tugas (PDF/DOC/PNG)</label>
                <CustomImageUploader
                  endpoint="assignmentFile"
                  label="Upload Berkas Tugas Siswa"
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
                {uploading ? 'Mengumpulkan...' : 'Kumpulkan Tugas Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex gap-1.5 bg-emerald-50/60 rounded-2xl p-1.5 w-fit flex-wrap border border-emerald-100">
        {([
          { key: 'semua', label: 'Semua' },
          { key: 'belum', label: 'Belum' },
          { key: 'dikumpulkan', label: 'Dikumpulkan' },
          { key: 'dinilai', label: 'Dinilai' },
          { key: 'terlambat', label: 'Terlambat' },
        ] as { key: FilterTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === t.key ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-800'
            }`}>
            {t.label}
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === t.key ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {filtered.map(task => {
          const cfg = STATUS_CONFIG[task.status];
          const overdue = isOverdue(task.dueDate) && task.status === 'BELUM_SUBMIT';
          return (
            <div key={task.id}
              className={`bg-white rounded-3xl border shadow-2xs overflow-hidden ${overdue ? 'border-rose-200' : 'border-emerald-100'}`}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 shadow-2xs">
                    <FileText className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{task.title}</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{task.subject} · {task.teacher}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1 rounded-full border flex-shrink-0 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold ${overdue ? 'text-rose-600 font-extrabold' : 'text-slate-500'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {formatDate(task.dueDate)}
                        {overdue && ' (Terlambat!)'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Nilai Maks: {task.maxScore}</span>
                    </div>

                    {/* Score & feedback */}
                    {task.status === 'DINILAI' && (
                      <div className="mt-4 p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-black text-emerald-900">
                            Nilai Diterima: {(task as typeof task & { score?: number }).score} / {task.maxScore}
                          </span>
                        </div>
                        {(task as typeof task & { feedback?: string }).feedback && (
                          <p className="text-xs font-medium text-emerald-800 italic mt-1">
                            "{(task as typeof task & { feedback?: string }).feedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action button */}
              {task.status === 'BELUM_SUBMIT' && (
                <div className="px-6 pb-5">
                  <button onClick={() => setSelectedTask(task)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-2xs ${
                      overdue
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}>
                    {overdue ? 'Kumpulkan Sekarang (Terlambat)' : 'Kumpulkan Tugas Sekarang'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 shadow-2xs text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-600 opacity-30" />
            <p className="text-xs font-semibold text-slate-500">Tidak ada tugas di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
