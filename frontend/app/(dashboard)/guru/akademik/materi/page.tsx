'use client';

import { useState, useEffect } from 'react';
import {
  Plus, FileText, Link2, Video, Trash2, Download, Eye, X, Gamepad2, Zap,
  PlusCircle, HelpCircle, Edit2, Play, CheckCircle2, Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { FileUpload } from '@/components/ui/FileUpload';
import apiClient from '@/lib/api';
import { toast } from '@/store/toast.store';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  document:  { icon:<FileText className="w-4 h-4"/>, label:'Dokumen', color:'text-emerald-800 bg-emerald-100 border-emerald-200' },
  video:     { icon:<Video className="w-4 h-4"/>, label:'Video Pembelajaran', color:'text-blue-800 bg-blue-100 border-blue-200' },
  link:      { icon:<Link2 className="w-4 h-4"/>, label:'Tautan Luar', color:'text-purple-800 bg-purple-100 border-purple-200' },
  quiz_game: { icon:<Gamepad2 className="w-4 h-4"/>, label:'Game Kuis Custom', color:'text-amber-800 bg-amber-100 border-amber-200' },
};

const INITIAL_MATERIALS = [
  {
    id: '1',
    title: 'Modul Bab 5 — Aljabar Linear & Persamaan',
    type: 'document',
    subject: 'Matematika',
    class: '8A',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size: '2.4 MB',
    downloads: 24,
    date: '2026-08-15',
  },
  {
    id: '2',
    title: 'Video Tutorial: Cara Mudah Memahami Persamaan Kuadrat',
    type: 'video',
    subject: 'Matematika',
    class: '9A',
    fileUrl: 'https://youtube.com',
    size: 'Video Youtube',
    downloads: 45,
    date: '2026-08-10',
  },
  {
    id: '3',
    title: 'Kuis Interaktif: Tantangan Aljabar & Persamaan Linear',
    type: 'quiz_game',
    subject: 'Matematika',
    class: '8A',
    fileUrl: '/siswa/elearning/game/matematika',
    size: '3 Soal Custom (50 XP)',
    downloads: 58,
    date: '2026-08-08',
    quizData: {
      mode: 'speed',
      questions: [
        {
          id: 1,
          question: 'Berapakah nilai x dari persamaan aljabar: 2x + 6 = 16 ?',
          options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
          correct: 1,
          explanation: '2x = 16 - 6 => 2x = 10 => x = 5',
          xpReward: 50,
        },
        {
          id: 2,
          question: 'Persamaan linear satu variabel berikut yang memiliki penyelesaian x = 4 adalah...',
          options: ['3x - 2 = 10', '2x + 4 = 10', '5x - 5 = 15', 'x + 8 = 10'],
          correct: 0,
          explanation: '3(4) - 2 = 12 - 2 = 10 (Benar!)',
          xpReward: 50,
        }
      ]
    }
  },
  {
    id: '4',
    title: 'Game Interaktif: Tajwid & Hukum Bacaan Al-Qur’an',
    type: 'quiz_game',
    subject: 'PAI',
    class: '8A',
    fileUrl: '/siswa/elearning/game/tajwid',
    size: '5 Level Quest (100 XP)',
    downloads: 72,
    date: '2026-08-20',
    quizData: {
      mode: 'adventure',
      questions: [
        {
          id: 101,
          question: 'Hukum bacaan Nun Sukun (نْ) bertemu dengan huruf Kho (خ) adalah...',
          options: ['Izhar Halqi', 'Idgham Bighunnah', 'Ikhfa Hakiki', 'Iqlab'],
          correct: 0,
          explanation: 'Izhar Halqi terjadi jika Nun Sukun / Tanwin bertemu 6 huruf halq: ء, هـ, ع, ح, غ, خ.',
          xpReward: 100,
        }
      ]
    }
  },
  {
    id: '5',
    title: 'Game Interaktif: Word Match & Concept Match Kosakata Sains',
    type: 'quiz_game',
    subject: 'IPA',
    class: '8A',
    fileUrl: '/siswa/elearning/game/vocab',
    size: 'Match Memory (150 XP)',
    downloads: 64,
    date: '2026-08-22',
    quizData: {
      mode: 'match',
      questions: [
        {
          id: 201,
          question: 'Cocokkan istilah Photosynthesis dengan definisinya yang tepat!',
          options: ['Proses pembuatan makanan pada tumbuhan hijau', 'Pelepasan energi', 'Persamaan 1 variabel', 'Gaya bahasa personifikasi'],
          correct: 0,
          explanation: 'Fotosintesis adalah proses tumbuhan hijau mengubah air dan CO2 menjadi glukosa.',
          xpReward: 150,
        }
      ]
    }
  },
];

export default function GuruMateriPage() {
  const [materials, setMaterials] = useState<any[]>(INITIAL_MATERIALS);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal state
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [uploadType, setUploadType] = useState<'document'|'video'|'link'|'quiz_game'>('document');
  const [fileUrl, setFileUrl] = useState('');
  const [form, setForm] = useState({ title:'', description:'', classId:'8A', externalUrl:'' });

  // Preview & Delete Modals state
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);
  const [deleteMaterial, setDeleteMaterial] = useState<any | null>(null);

  // Custom Game Builder State
  const [quizMode, setQuizMode] = useState<'speed' | 'adventure' | 'match'>('speed');
  const [customQuestions, setCustomQuestions] = useState<Array<{
    id: number;
    question: string;
    options: [string, string, string, string];
    correct: number;
    explanation: string;
    xpReward: number;
  }>>([
    {
      id: 1,
      question: 'Berapakah nilai x dari persamaan aljabar: 2x + 6 = 16 ?',
      options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
      correct: 1,
      explanation: '2x = 16 - 6 => 2x = 10 => x = 5',
      xpReward: 50,
    }
  ]);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/materials');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.warn('Load materials warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleOpenForm = (mat?: any) => {
    if (mat) {
      setSelectedMaterial(mat);
      setForm({
        title: mat.title || '',
        description: mat.description || '',
        classId: mat.class || mat.classId || '8A',
        externalUrl: mat.externalUrl || mat.fileUrl || '',
      });
      setUploadType(mat.type || 'document');
      setFileUrl(mat.fileUrl || '');
      if (mat.quizData?.questions) {
        setQuizMode(mat.quizData.mode || 'speed');
        setCustomQuestions(mat.quizData.questions);
      }
    } else {
      setSelectedMaterial(null);
      setForm({ title:'', description:'', classId:'8A', externalUrl:'' });
      setUploadType('document');
      setFileUrl('');
      setCustomQuestions([
        {
          id: Date.now(),
          question: 'Soal Kuis 1: Tuliskan kalimat pertanyaan kuis di sini...',
          options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
          correct: 0,
          explanation: 'Penjelasan singkat pembahasan jawaban...',
          xpReward: 50,
        }
      ]);
    }
    setShowForm(true);
  };

  const addQuestion = () => {
    setCustomQuestions(prev => [
      ...prev,
      {
        id: Date.now(),
        question: `Pertanyaan Kuis #${prev.length + 1}`,
        options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
        correct: 0,
        explanation: 'Pembahasan jawaban benar...',
        xpReward: 50,
      }
    ]);
  };

  const removeQuestion = (id: number) => {
    if (customQuestions.length <= 1) {
      toast.warning('Minimal 1 Soal', 'Kuis harus memiliki minimal 1 soal.');
      return;
    }
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setCustomQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateQuestionOption = (id: number, optIdx: number, val: string) => {
    setCustomQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const newOpts = [...q.options] as [string, string, string, string];
        newOpts[optIdx] = val;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleSaveMaterial = async () => {
    if (!form.title) {
      toast.error('Form Tidak Lengkap', 'Silakan isi judul modul / game kuis.');
      return;
    }

    try {
      const payload = {
        title: form.title,
        description: form.description,
        type: uploadType,
        fileUrl: uploadType === 'link' ? form.externalUrl : fileUrl || '#',
        externalUrl: form.externalUrl,
        quizData: uploadType === 'quiz_game' ? { mode: quizMode, questions: customQuestions } : null,
      };

      if (selectedMaterial) {
        await apiClient.put(`/materials/${selectedMaterial.id}`, payload).catch(() => {});
        setMaterials(prev => prev.map(m => m.id === selectedMaterial.id ? { ...m, ...payload } : m));
        toast.success('Materi Diperbarui', 'Perubahan modul / game kuis berhasil disimpan.');
      } else {
        const res = await apiClient.post('/materials', payload).catch(() => null);
        const newObj = res?.data?.data || {
          id: String(Date.now()),
          ...payload,
          subject: 'Matematika',
          class: form.classId || '8A',
          downloads: 0,
          date: new Date().toISOString(),
        };
        setMaterials(prev => [newObj, ...prev]);
        toast.success('Materi Berhasil Disimpan', uploadType === 'quiz_game' ? 'Game kuis custom telah dipublikasikan ke siswa!' : 'Berkas materi pembelajaran berhasil diunggah.');
      }

      setShowForm(false);
    } catch (err) {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan materi.');
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deleteMaterial) return;
    try {
      await apiClient.delete(`/materials/${deleteMaterial.id}`).catch(() => {});
      setMaterials(prev => prev.filter(m => m.id !== deleteMaterial.id));
      toast.warning('Materi Dihapus', `Modul "${deleteMaterial.title}" telah dihapus.`);
      setDeleteMaterial(null);
    } catch (err) {
      toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus materi.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Katalog &amp; Custom Game Builder E-Learning</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Kelola modul berkas PDF/Video dan kustomisasi kuis game interaktif untuk siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMaterials()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Buat Modul / Game Kuis Baru
          </button>
        </div>
      </div>

      {/* Material Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {materials.map(m => {
          const cfg = TYPE_CONFIG[m.type] || TYPE_CONFIG.document;
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800">Kelas {m.class || m.classId || '8A'}</span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug mt-1.5">{m.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-400">
                    <span>{formatDate(m.date || new Date(), { day:'numeric', month:'short', year:'numeric' })}</span>
                    {m.size && <span>· {m.size}</span>}
                    <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-emerald-600"/>{m.downloads || 0}× diunduh</span>
                  </div>
                </div>
              </div>
              
              {/* Tombol Aksi Lengkap & Aktif */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setPreviewMaterial(m)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5"/> {m.type === 'quiz_game' ? 'Pratinjau Kuis' : 'Lihat Modul'}
                </button>

                <button
                  onClick={() => handleOpenForm(m)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Edit Modul / Kuis"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteMaterial(m)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Hapus Modul"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form Builder */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {selectedMaterial ? 'Edit Modul & Game Kuis' : 'Buat Modul & Game Kuis E-Learning'}
                </h2>
                <p className="text-xs text-slate-500 font-normal">Kustomisasi pertanyaan, pilihan jawaban, pembahasan, dan reward XP</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['document','video','link','quiz_game'] as const).map(t => (
                  <button key={t} onClick={() => setUploadType(t)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${uploadType===t ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}>
                    {TYPE_CONFIG[t].icon}{TYPE_CONFIG[t].label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Modul / Nama Game Kuis *</label>
                <input type="text" placeholder="cth: Tantangan Kuis Aljabar &amp; Persamaan Linear" value={form.title}
                  onChange={e => update('title', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas Tujuan</label>
                  <select value={form.classId} onChange={e => update('classId', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                    {['7A','7B','8A','8B','9A','9B','9C'].map(c => <option key={c} value={c}>Kelas {c}</option>)}
                  </select>
                </div>

                {uploadType === 'quiz_game' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mode Tampilan Game</label>
                    <select value={quizMode} onChange={e => setQuizMode(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                      <option value="speed">⚡ Speed Quiz (Kuis Cepat XP)</option>
                      <option value="adventure">🎮 Adventure Quest (Petualangan Belajar)</option>
                      <option value="match">🧩 Term Matcher (Pencocokan Istilah)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Custom Game Questions Builder Section */}
              {uploadType === 'quiz_game' ? (
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Kustomisasi Soal Kuis ({customQuestions.length} Soal)
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">Atur pertanyaan, opsi A-D, kunci jawaban, dan pembahasan.</p>
                    </div>

                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Tambah Soal
                    </button>
                  </div>

                  <div className="space-y-4">
                    {customQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-md">
                            Soal #{qIdx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                              +{q.xpReward} XP
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus Soal Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pertanyaan Soal</label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                            placeholder="Tuliskan pertanyaan kuis..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* 4 Pilihan Jawaban */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Opsi Pilihan Ganda (Tandai Kunci Jawaban Benar)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((optVal, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correct === optIdx}
                                  onChange={() => updateQuestion(q.id, 'correct', optIdx)}
                                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-slate-500 w-4">{String.fromCharCode(65 + optIdx)}.</span>
                                <input
                                  type="text"
                                  value={optVal}
                                  onChange={e => updateQuestionOption(q.id, optIdx, e.target.value)}
                                  className="flex-1 text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                                  placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pembahasan */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Penjelasan / Pembahasan Jawaban</label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={e => updateQuestion(q.id, 'explanation', e.target.value)}
                            placeholder="Penjelasan pembahasan jawaban benar..."
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : uploadType === 'link' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL / Tautan Luar *</label>
                  <input type="url" value={form.externalUrl} onChange={e => update('externalUrl', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Berkas Materi *</label>
                  {fileUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                      <span className="text-xs font-semibold text-emerald-950 truncate flex-1">{fileUrl}</span>
                      <button type="button" onClick={()=>setFileUrl('')} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">Hapus</button>
                    </div>
                  ) : (
                    <FileUpload
                      endpoint="materialFile"
                      label={uploadType === 'video' ? 'Unggah Video Pembelajaran' : 'Unggah Dokumen Materi'}
                      hint="PDF, DOCX, PPTX, MP4 Video (Maksimal 32MB - 512MB)"
                      value={fileUrl}
                      onUploadComplete={(url) => setFileUrl(url)}
                      onClear={() => setFileUrl('')}
                      mode="dropzone"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Batal</button>
              <button onClick={handleSaveMaterial} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer">Simpan Modul / Game</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Game Kuis / Dokumen */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-500" />
                <div>
                  <h2 className="font-bold text-slate-900 text-base">{previewMaterial.title}</h2>
                  <p className="text-xs text-slate-500 font-medium">Pratinjau Modul / Game Kuis Guru</p>
                </div>
              </div>
              <button onClick={() => setPreviewMaterial(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {previewMaterial.type === 'quiz_game' && previewMaterial.quizData?.questions ? (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Mode: {previewMaterial.quizData.mode || 'Speed Quiz'}</span>
                    <span className="text-xs font-extrabold text-emerald-800">{previewMaterial.quizData.questions.length} Soal Custom</span>
                  </div>

                  {previewMaterial.quizData.questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-900">
                        Soal #{idx + 1}: {q.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt: string, oIdx: number) => (
                          <div key={oIdx} className={`p-2 rounded-lg text-xs font-semibold border ${oIdx === q.correct ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}>
                            {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correct && '✓'}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 pt-1 font-medium">
                          💡 Pembahasan: {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900">{previewMaterial.title}</p>
                  <a
                    href={previewMaterial.fileUrl || previewMaterial.externalUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
                  >
                    Buka Berkas / Tautan Materi
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Modul / Game Kuis?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus modul <span className="font-semibold text-slate-900">{deleteMaterial.title}</span>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteMaterial(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMaterial}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
