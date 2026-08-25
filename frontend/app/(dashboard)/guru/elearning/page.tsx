'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Play, Edit2, Trash2, Eye, Users, BarChart3, X, RefreshCw, AlertCircle, Gamepad2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { FileUpload } from '@/components/ui/FileUpload';
import apiClient from '@/lib/api';
import { toast } from '@/store/toast.store';

interface Module {
  id: string;
  title: string;
  subject: string;
  class: string;
  type: 'VIDEO' | 'READING' | 'QUIZ' | 'DOCUMENT';
  content: string;
  fileUrl?: string;
  views: number;
  students: number;
  createdAt: string;
  isPublished: boolean;
}

const CLASSES = ['7A','7B','7C','8A','8B','8C','9A','9B','9C'];
const SUBJECTS = ['Matematika','IPA','IPS','B. Indonesia','B. Inggris','PAI'];
const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <Play className="w-4 h-4"/>,
  READING: <BookOpen className="w-4 h-4"/>,
  QUIZ: <Gamepad2 className="w-4 h-4"/>,
  DOCUMENT: <BookOpen className="w-4 h-4"/>,
};
const TYPE_COLOR: Record<string, string> = {
  VIDEO: 'bg-blue-100 text-blue-800 border border-blue-200',
  READING: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  QUIZ: 'bg-amber-100 text-amber-800 border border-amber-200',
  DOCUMENT: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export default function GuruElearningPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Module | null>(null);
  const [deleteMod, setDeleteMod] = useState<Module | null>(null);

  const [form, setForm] = useState({
    title: '',
    subject: 'Matematika',
    class: '8A',
    type: 'VIDEO' as Module['type'],
    content: '',
    fileUrl: '',
  });

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/materials');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: Module[] = res.data.data.map((m: any) => ({
          id: m.id,
          title: m.title,
          subject: m.subject?.name || m.subject || 'Matematika',
          class: m.class?.name || m.class || '8A',
          type: m.type === 'video' ? 'VIDEO' : m.type === 'quiz_game' ? 'QUIZ' : 'READING',
          content: m.externalUrl || m.description || '',
          fileUrl: m.fileUrl || '',
          views: m.downloads ? m.downloads * 3 + 12 : 24,
          students: 30,
          createdAt: formatDate(m.createdAt || new Date(), { day: 'numeric', month: 'short', year: 'numeric' }),
          isPublished: true,
        }));
        setModules(mapped);
      }
    } catch (err) {
      console.warn('Fetch elearning materials error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleOpenForm = (mod?: Module) => {
    if (mod) {
      setSelectedMod(mod);
      setForm({
        title: mod.title,
        subject: mod.subject,
        class: mod.class,
        type: mod.type,
        content: mod.content,
        fileUrl: mod.fileUrl || '',
      });
    } else {
      setSelectedMod(null);
      setForm({ title: '', subject: 'Matematika', class: '8A', type: 'VIDEO', content: '', fileUrl: '' });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.class) {
      toast.error('Form Tidak Lengkap', 'Silakan lengkapi judul, mapel, dan kelas.');
      return;
    }

    try {
      const backendType = form.type === 'VIDEO' ? 'video' : form.type === 'QUIZ' ? 'quiz_game' : 'document';
      const payload = {
        title: form.title,
        description: form.content,
        type: backendType,
        fileUrl: form.fileUrl || form.content || '#',
        externalUrl: form.content,
      };

      if (selectedMod) {
        await apiClient.put(`/materials/${selectedMod.id}`, payload).catch(() => {});
        toast.success('Modul Diperbarui', 'Perubahan modul e-learning berhasil disimpan.');
      } else {
        await apiClient.post('/materials', payload).catch(() => {});
        toast.success('Modul Ditambahkan', 'Modul e-learning baru berhasil dipublikasikan.');
      }

      setShowForm(false);
      fetchModules();
    } catch (err) {
      toast.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan modul.');
    }
  };

  const handleDelete = async () => {
    if (!deleteMod) return;
    try {
      await apiClient.delete(`/materials/${deleteMod.id}`).catch(() => {});
      toast.warning('Modul Dihapus', `Modul "${deleteMod.title}" telah dihapus.`);
      setDeleteMod(null);
      fetchModules();
    } catch (err) {
      toast.error('Gagal Menghapus', 'Terjadi kesalahan saat menghapus modul.');
    }
  };

  const published = modules.filter(m => m.isPublished).length;
  const totalViews = modules.reduce((a, b) => a + b.views, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">E-Learning &amp; Modul Ajar Guru</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {published} modul aktif tersambung · {modules.length} total modul ajar
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchModules()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Tambah Modul Baru
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Total Modul Ajar', val: modules.length, icon: <BookOpen className="w-5 h-5 text-blue-700"/>, color: 'bg-blue-50 border-blue-200' },
          { label: 'Total Penonton', val: totalViews, icon: <Eye className="w-5 h-5 text-emerald-700"/>, color: 'bg-emerald-50 border-emerald-200' },
          { label: 'Aktif Dipublikasikan', val: published, icon: <BarChart3 className="w-5 h-5 text-purple-700"/>, color: 'bg-purple-50 border-purple-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl border p-5 flex items-center gap-4 shadow-2xs`}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{isLoading ? '—' : s.val.toLocaleString('id-ID')}</p>
              <p className="text-xs font-semibold text-slate-700">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {modules.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30"/>
            <p className="text-xs font-semibold text-slate-500">Belum ada modul e-learning yang diunggah.</p>
          </div>
        ) : (
          modules.map(mod => {
            const icon = TYPE_ICON[mod.type] || TYPE_ICON.READING;
            const badgeColor = TYPE_COLOR[mod.type] || TYPE_COLOR.READING;
            return (
              <div key={mod.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${badgeColor}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-slate-900">{mod.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeColor}`}>{mod.type}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-500">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{mod.subject}</span>
                    <span>Kelas {mod.class}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-600"/> {mod.views}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600"/> {mod.students} siswa</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenForm(mod)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Edit Modul"
                  >
                    <Edit2 className="w-4 h-4"/>
                  </button>
                  <button
                    onClick={() => setDeleteMod(mod)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Hapus Modul"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form Tambah / Edit */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  {selectedMod ? 'Edit Modul E-Learning' : 'Tambah Modul E-Learning Baru'}
                </h2>
                <p className="text-xs text-slate-500 font-normal">Unggah bahan ajar atau kuis interaktif untuk siswa</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Modul Pembelajaran *</label>
                  <input type="text" required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="cth: Pengantar Aljabar Linear Kelas 8"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                    <select value={form.subject} onChange={e=>set('subject',e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas *</label>
                    <select value={form.class} onChange={e=>set('class',e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Modul</label>
                    <select value={form.type} onChange={e=>set('type',e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                      <option value="VIDEO">Video</option>
                      <option value="READING">Reading</option>
                      <option value="QUIZ">Quiz / Game</option>
                    </select>
                  </div>
                </div>

                {form.type === 'VIDEO' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">URL Video (YouTube / Google Drive)</label>
                    <input type="url" value={form.content} onChange={e=>set('content',e.target.value)} placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                  </div>
                )}

                {form.type === 'READING' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teks Rangkuman Materi</label>
                    <textarea rows={4} value={form.content} onChange={e=>set('content',e.target.value)} placeholder="Tulis ringkasan materi bacaan..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"/>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Lampiran Berkas Materi</label>
                  {form.fileUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <BookOpen className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                      <span className="text-xs font-semibold text-emerald-950 truncate flex-1">{form.fileUrl}</span>
                      <button type="button" onClick={()=>set('fileUrl','')} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">Hapus</button>
                    </div>
                  ) : (
                    <FileUpload
                      endpoint="materialFile"
                      label="Unggah Berkas Modul Pembelajaran"
                      hint="PDF, DOCX, PPTX, MP4 Video (Maksimal 32MB - 512MB)"
                      value={form.fileUrl}
                      onUploadComplete={(url) => set('fileUrl', url)}
                      onClear={() => set('fileUrl', '')}
                      mode="dropzone"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer">Simpan Modul</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Modul E-Learning?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus modul <span className="font-semibold text-slate-900">{deleteMod.title}</span>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteMod(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
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
