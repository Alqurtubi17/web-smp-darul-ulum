'use client';

import { useState } from 'react';
import { Upload, Clock, CheckCircle2, AlertCircle, FileText, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type FilterTab = 'semua' | 'belum' | 'dikumpulkan' | 'dinilai' | 'terlambat';

const ASSIGNMENTS = [
  { id: '1', title: 'Essay Bahasa Indonesia: Tema Lingkungan Hidup', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', dueDate: '2025-07-05', maxScore: 100, status: 'BELUM_SUBMIT', description: 'Tulis essay minimal 500 kata tentang pentingnya menjaga lingkungan hidup.' },
  { id: '2', title: 'Laporan Praktikum IPA: Proses Fotosintesis', subject: 'IPA', teacher: 'Budi Santoso, S.Pd.', dueDate: '2025-07-07', maxScore: 100, status: 'BELUM_SUBMIT', description: 'Buat laporan praktikum sesuai format yang telah diberikan di kelas.' },
  { id: '3', title: 'Latihan Soal Matematika Bab 5 (Aljabar)', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', dueDate: '2025-07-10', maxScore: 100, status: 'BELUM_SUBMIT', description: 'Kerjakan soal nomor 1-20 di buku LKS halaman 85-87.' },
  { id: '4', title: 'Reading Comprehension: Tourism in Indonesia', subject: 'Bahasa Inggris', teacher: 'Hendra Purnomo, S.Pd.', dueDate: '2025-06-28', maxScore: 100, status: 'SUBMITTED', submittedAt: '2025-06-25', description: 'Baca teks dan jawab pertanyaan.' },
  { id: '5', title: 'PR IPS: Peta Persebaran SDA Indonesia', subject: 'IPS', teacher: 'Dewi Susanti, S.Pd.', dueDate: '2025-06-20', maxScore: 100, status: 'DINILAI', score: 88, feedback: 'Peta sudah lengkap dan rapi. Keterangan warna perlu diperjelas sedikit.', submittedAt: '2025-06-18' },
  { id: '6', title: 'Hafalan Surat Al-Mulk', subject: 'PAI', teacher: 'Ustadz Ahmad Malik, Lc.', dueDate: '2025-06-15', maxScore: 100, status: 'DINILAI', score: 95, feedback: 'Hafalan sangat lancar dan tajwid benar. Pertahankan!', submittedAt: '2025-06-14' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  BELUM_SUBMIT: { label: 'Belum Dikumpulkan', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="w-3 h-3" /> },
  SUBMITTED:    { label: 'Sudah Dikumpulkan', color: 'text-blue-600 bg-blue-100',   icon: <CheckCircle2 className="w-3 h-3" /> },
  DINILAI:      { label: 'Sudah Dinilai',     color: 'text-green-600 bg-green-100', icon: <CheckCircle2 className="w-3 h-3" /> },
  TERLAMBAT:    { label: 'Terlambat',         color: 'text-red-600 bg-red-100',       icon: <AlertCircle className="w-3 h-3" /> },
};

export default function SiswaTugasPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('semua');
  const [selectedTask, setSelectedTask] = useState<typeof ASSIGNMENTS[0] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [answer, setAnswer] = useState('');

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
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setSelectedTask(null);
    setAnswer('');
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tugas Saya</h1>
        <p className="text-sm text-gray-500 mt-0.5">Semester Ganjil 2024/2025</p>
      </div>

      {/* Submit modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 text-sm">Kumpulkan Tugas</h2>
              <button onClick={() => setSelectedTask(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl p-3.5">
                <p className="font-semibold text-sm text-gray-900">{selectedTask.title}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedTask.subject} · Deadline: {formatDate(selectedTask.dueDate)}</p>
                {selectedTask.description && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{selectedTask.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jawaban / Keterangan</label>
                <textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Tulis jawaban atau keterangan pengumpulan..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload File (opsional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-green-400 cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Klik atau drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                </div>
              </div>
              {isOverdue(selectedTask.dueDate) && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">Tugas ini sudah melewati deadline dan akan ditandai sebagai terlambat.</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setSelectedTask(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={uploading}
                className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold transition-colors">
                {uploading ? 'Mengumpulkan...' : '✅ Kumpulkan Tugas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5 w-fit flex-wrap">
        {([
          { key: 'semua', label: 'Semua' },
          { key: 'belum', label: 'Belum' },
          { key: 'dikumpulkan', label: 'Dikumpulkan' },
          { key: 'dinilai', label: 'Dinilai' },
          { key: 'terlambat', label: 'Terlambat' },
        ] as { key: FilterTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === t.key ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'
            }`}>
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.map(task => {
          const cfg = STATUS_CONFIG[task.status];
          const overdue = isOverdue(task.dueDate) && task.status === 'BELUM_SUBMIT';
          return (
            <div key={task.id}
              className={`bg-white rounded-2xl border overflow-hidden ${overdue ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 leading-snug">{task.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{task.subject} · {task.teacher}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        <Clock className="w-3 h-3" />
                        Deadline: {formatDate(task.dueDate)}
                        {overdue && ' (Terlambat!)'}
                      </span>
                      <span className="text-xs text-gray-400">Nilai maks: {task.maxScore}</span>
                    </div>

                    {/* Score & feedback */}
                    {task.status === 'DINILAI' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-700">
                            Nilai: {(task as typeof task & { score?: number }).score} / {task.maxScore}
                          </span>
                        </div>
                        {(task as typeof task & { feedback?: string }).feedback && (
                          <p className="text-xs text-green-700 italic">
                            "{(task as typeof task & { feedback?: string }).feedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action */}
              {task.status === 'BELUM_SUBMIT' && (
                <div className="px-5 pb-4">
                  <button onClick={() => setSelectedTask(task)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      overdue
                        ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}>
                    {overdue ? '⚠️ Kumpulkan Sekarang (Terlambat)' : '📤 Kumpulkan Tugas'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-sm text-gray-500">Tidak ada tugas di kategori ini</p>
          </div>
        )}
      </div>
    </div>
  );
}
