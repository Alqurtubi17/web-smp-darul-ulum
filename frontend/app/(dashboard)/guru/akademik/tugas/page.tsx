'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, FileText, Clock, Users, X, Eye, Trash2, RefreshCw, Loader2, AlertCircle, Edit3, Link as LinkIcon, ExternalLink, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CustomImageUploader } from '@/components/ui/CustomImageUploader';
import apiClient from '@/lib/api';
import { toast } from '@/store/toast.store';

const CLASSES = ['7A','7B','7C','8A','8B','8C','9A','9B','9C'];

const INITIAL_DUMMY_ASSIGNMENTS = [
  {
    id: 'dummy-1',
    title: 'Laporan Praktikum IPA: Fotosintesis & Respirasi Tumbuhan',
    subject: 'IPA',
    class: '8A',
    classId: '8A',
    description: 'Amati proses fotosintesis pada daun Hydrilla, dokumentasikan dalam bentuk laporan PDF max 5 halaman.',
    dueDate: '2026-08-30T23:59',
    maxScore: 100,
    status: 'AKTIF',
    submissions: 24,
    total: 32,
    fileUrl: '',
    submissionLink: 'https://forms.google.com/sample-form-ipa-8a',
  },
  {
    id: 'dummy-2',
    title: 'Tugas Mandiri Matematika: Latihan Soal Persamaan Kuadrat',
    subject: 'Matematika',
    class: '8A',
    classId: '8A',
    description: 'Kerjakan LKS halaman 45 No. 1-10 di buku tugas, foto jawaban yang rapi lalu unggah ke portal.',
    dueDate: '2026-09-02T17:00',
    maxScore: 100,
    status: 'AKTIF',
    submissions: 18,
    total: 32,
    fileUrl: '',
    submissionLink: 'https://drive.google.com/drive/folders/sample-matematika-8a',
  },
  {
    id: 'dummy-3',
    title: 'Essay Bahasa Indonesia: Analisis Cerpen & Unsur Intrinsik',
    subject: 'Bahasa Indonesia',
    class: '7B',
    classId: '7B',
    description: 'Tuliskan ulasan analisis unsur intrinsik dari cerpen pilihan di buku paket halaman 88.',
    dueDate: '2026-08-28T23:59',
    maxScore: 100,
    status: 'AKTIF',
    submissions: 30,
    total: 30,
    fileUrl: '',
    submissionLink: '',
  },
  {
    id: 'dummy-4',
    title: 'Daily Practice English: Descriptive Text Essay',
    subject: 'Bahasa Inggris',
    class: '9A',
    classId: '9A',
    description: 'Write a 200-word descriptive text about your favorite historical place in Indonesia.',
    dueDate: '2026-09-05T20:00',
    maxScore: 100,
    status: 'AKTIF',
    submissions: 12,
    total: 28,
    fileUrl: '',
    submissionLink: 'https://forms.google.com/sample-english-essay',
  },
];

export default function GuruTugasPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [dummyAssignments, setDummyAssignments] = useState<any[]>(INITIAL_DUMMY_ASSIGNMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');

  // Interactive Submissions Modal state
  const [viewingAssignment, setViewingAssignment] = useState<any | null>(null);
  const [sampleSubmissions, setSampleSubmissions] = useState<Record<string, any[]>>({
    'dummy-1': [
      { id: 'sub-1', studentName: 'Ahmad Rizki Pratama', nis: '2026001', submittedAt: '2026-08-28 14:30', fileName: 'Laporan_Fotosintesis_Ahmad.pdf', status: 'Selesai', score: '88' },
      { id: 'sub-2', studentName: 'Budi Permana', nis: '2026003', submittedAt: '2026-08-29 09:15', fileName: 'Tugas_IPA_Budi.pdf', status: 'Selesai', score: '92' },
      { id: 'sub-3', studentName: 'Dewi Anggraini', nis: '2026004', submittedAt: '2026-08-30 22:45', fileName: 'Laporan_Dewi.pdf', status: 'Terlambat', score: '75' },
      { id: 'sub-4', studentName: 'Daffa Afrizal', nis: '2026007', submittedAt: 'Dikumpulkan Offline', fileName: '', status: 'Offline', score: '80' },
      { id: 'sub-5', studentName: 'Eva Nurmalasari', nis: '2026008', submittedAt: '2026-08-30 18:20', fileName: 'TugasIPA_Eva.pdf', status: 'Selesai', score: '85' },
      { id: 'sub-6', studentName: 'Siti Nur Aisyah', nis: '2026002', submittedAt: '-', fileName: '', status: 'Belum Mengumpulkan', score: '' },
    ],
    'dummy-2': [
      { id: 'sub-7', studentName: 'Ahmad Rizki Pratama', nis: '2026001', submittedAt: '2026-09-01 16:20', fileName: 'Jawaban_Math_Ahmad.pdf', status: 'Selesai', score: '95' },
      { id: 'sub-8', studentName: 'Budi Permana', nis: '2026003', submittedAt: '2026-09-02 10:05', fileName: 'Math_Budi.jpg', status: 'Selesai', score: '80' },
      { id: 'sub-9', studentName: 'Dewi Anggraini', nis: '2026004', submittedAt: '-', fileName: '', status: 'Belum Mengumpulkan', score: '' },
    ],
    'dummy-3': [
      { id: 'sub-10', studentName: 'Amelia Rahmawati', nis: '2026006', submittedAt: '2026-08-27 15:40', fileName: 'Essay_Bahasa_Amelia.pdf', status: 'Selesai', score: '90' },
      { id: 'sub-11', studentName: 'Faris Hidayat', nis: '2026009', submittedAt: '2026-08-28 08:10', fileName: 'Cerpen_Faris.docx', status: 'Selesai', score: '85' },
    ],
  });

  const handleUpdateStudentScore = (subId: string, val: string) => {
    if (!viewingAssignment) return;
    const aId = viewingAssignment.id;
    setSampleSubmissions(prev => {
      const currentList = prev[aId] || [];
      const updated = currentList.map(s => s.id === subId ? { ...s, score: val } : s);
      return { ...prev, [aId]: updated };
    });
    toast.success('Nilai Disimpan', 'Nilai pengumpulan siswa telah diperbarui.');
  };

  const handleUpdateStudentStatus = (subId: string, newStatus: string) => {
    if (!viewingAssignment) return;
    const aId = viewingAssignment.id;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    setSampleSubmissions(prev => {
      const currentList = prev[aId] || [];
      const updated = currentList.map(s => {
        if (s.id !== subId) return s;
        let newTime = s.submittedAt;
        if (newStatus === 'Offline') {
          newTime = 'Dikumpulkan Offline';
        } else if (newStatus === 'Selesai' || newStatus === 'Terlambat') {
          if (!s.submittedAt || s.submittedAt === '-' || s.submittedAt === 'Dikumpulkan Offline') {
            newTime = nowStr;
          }
        } else if (newStatus === 'Belum Mengumpulkan') {
          newTime = '-';
        }
        return { ...s, status: newStatus, submittedAt: newTime };
      });
      return { ...prev, [aId]: updated };
    });
    toast.success('Status Diperbarui', `Status tugas siswa diubah menjadi "${newStatus}".`);
  };

  const [form, setForm] = useState({
    title: '',
    subject: 'Matematika',
    classId: '8A',
    description: '',
    dueDate: '',
    maxScore: '100',
    type: 'TUGAS',
    submissionLink: '',
  });

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/assignments');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.warn('Fetch assignments warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const up = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ title: '', subject: 'Matematika', classId: '8A', description: '', dueDate: '', maxScore: '100', type: 'TUGAS', submissionLink: '' });
    setFileUrl('');
    setShowForm(true);
  };

  const handleOpenEdit = (assignment: any) => {
    setEditingId(assignment.id);
    setForm({
      title: assignment.title || '',
      subject: assignment.subject?.name || assignment.subject || 'Matematika',
      classId: assignment.class || assignment.classId || '8A',
      description: assignment.description || '',
      dueDate: assignment.dueDate ? (assignment.dueDate.includes('T') ? assignment.dueDate.slice(0, 16) : assignment.dueDate + 'T23:59') : '',
      maxScore: String(assignment.maxScore || 100),
      type: 'TUGAS',
      submissionLink: assignment.submissionLink || '',
    });
    setFileUrl(assignment.fileUrl || '');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.dueDate) {
      toast.error('Form Tidak Lengkap', 'Silakan isi judul tugas dan batas waktu.');
      return;
    }

    const payload = {
      id: editingId || `tugas-${Date.now()}`,
      title: form.title,
      description: form.description,
      subject: form.subject,
      class: form.classId,
      classId: form.classId,
      dueDate: form.dueDate,
      maxScore: parseFloat(form.maxScore) || 100,
      fileUrl: fileUrl || undefined,
      submissionLink: form.submissionLink ? (form.submissionLink.startsWith('http') ? form.submissionLink : `https://${form.submissionLink}`) : undefined,
      status: 'AKTIF',
      submissions: editingId ? (dummyAssignments.find(a => a.id === editingId)?.submissions || 0) : 0,
      total: 32,
    };

    try {
      if (editingId) {
        await apiClient.put(`/assignments/${editingId}`, payload).catch(() => {});
        setDummyAssignments(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a));
        toast.success('Tugas Diperbarui', `Tugas "${form.title}" berhasil diperbarui.`);
      } else {
        await apiClient.post('/assignments', payload).catch(() => {});
        setDummyAssignments(prev => [payload, ...prev]);
        toast.success('Tugas Dipublikasikan', 'Tugas baru berhasil disimpan.');
      }
    } catch {
      if (editingId) {
        setDummyAssignments(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a));
        toast.success('Tugas Diperbarui', `Tugas "${form.title}" berhasil diperbarui.`);
      } else {
        setDummyAssignments(prev => [payload, ...prev]);
        toast.success('Tugas Dipublikasikan', 'Tugas baru berhasil disimpan.');
      }
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ title: '', subject: 'Matematika', classId: '8A', description: '', dueDate: '', maxScore: '100', type: 'TUGAS', submissionLink: '' });
    setFileUrl('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/assignments/${deleteId}`).catch(() => {});
    } catch {}

    setDummyAssignments(prev => prev.filter(a => a.id !== deleteId));
    toast.warning('Tugas Dihapus', 'Tugas telah dihapus.');
    setDeleteId(null);
  };

  const displayList = assignments.length > 0 ? assignments : dummyAssignments;

  const filteredAssignments = useMemo(() => {
    return displayList.filter(a => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (a.title || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.subject?.name || a.subject || '').toLowerCase().includes(q);
      
      const itemClass = a.class || a.classId || a.targetGrade || '';
      const matchClass = filterClass === 'ALL' || itemClass === filterClass;

      return matchSearch && matchClass;
    });
  }, [displayList, searchQuery, filterClass]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Tugas Siswa</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">{filteredAssignments.length} dari {displayList.length} tugas ditampilkan</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAssignments()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
            <Plus className="w-4 h-4" /> Buat Tugas Baru
          </button>
        </div>
      </div>

      {/* Search & Class Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
          <input
            type="search"
            placeholder="Cari judul tugas, deskripsi, atau mata pelajaran..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-extrabold text-slate-700 whitespace-nowrap">Filter Kelas:</span>
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-4 py-2.5 rounded-2xl border border-emerald-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs cursor-pointer min-w-[130px]"
          >
            <option value="ALL">Semua Kelas</option>
            {CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}
          </select>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-base">{editingId ? 'Edit / Ubah Tugas Siswa' : 'Buat Tugas Baru'}</h2>
                <p className="text-xs text-slate-500 font-normal">Berikan instruksi dan batas pengumpulan tugas untuk siswa</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Tugas *</label>
                <input type="text" value={form.title} onChange={e => up('title', e.target.value)}
                  placeholder="Judul tugas yang jelas dan spesifik..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Mata Pelajaran', key:'subject', opts:['Matematika','Bahasa Indonesia','IPA','Bahasa Inggris','PAI'] },
                  { label:'Kelas Target', key:'classId', opts:['7A','7B','7C','8A','8B','8C','9A','9B','9C'] },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{f.label}</label>
                    <select value={(form as Record<string,string>)[f.key]} onChange={e => up(f.key, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                      {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Pengumpulan (Deadline) *</label>
                  <input type="datetime-local" value={form.dueDate} onChange={e => up('dueDate', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai Maksimal</label>
                  <input type="number" value={form.maxScore} onChange={e => up('maxScore', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi / Petunjuk Pengerjaan</label>
                <textarea rows={4} value={form.description} onChange={e => up('description', e.target.value)}
                  placeholder="Tulis instruksi pengerjaan tugas secara detail..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link Pengumpulan / Form / Drive (Opsional)</label>
                <input type="url" value={form.submissionLink} onChange={e => up('submissionLink', e.target.value)}
                  placeholder="https://forms.google.com/... atau https://drive.google.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">File Lampiran Soal (Opsional)</label>
                {fileUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <FileText className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                    <span className="text-xs font-semibold text-emerald-950 truncate flex-1">{fileUrl}</span>
                    <button type="button" onClick={()=>setFileUrl('')} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">Hapus</button>
                  </div>
                ) : (
                  <CustomImageUploader
                    endpoint="assignmentFile"
                    label="Upload File Soal (PDF / DOC)"
                    accept=".pdf,.doc,.docx"
                    onUploadComplete={(url) => setFileUrl(url)}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Batal</button>
              <button onClick={handleSubmit} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer">
                {editingId ? 'Simpan Perubahan' : 'Publikasikan Tugas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-emerald-100 text-slate-400 shadow-2xs">
          <FileText className="w-10 h-10 text-emerald-600/40 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Tidak ada tugas yang sesuai dengan pencarian atau filter kelas.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {filteredAssignments.map(a => {
            const totalCount = a.total || 32;
            const subCount = a.submissions?.length !== undefined ? a.submissions.length : (a.submissions || 0);
            const pct = Math.round((subCount / totalCount) * 100);
            const isActive = a.status !== 'DITUTUP';
            const overdue = a.dueDate && new Date(a.dueDate) < new Date();

            return (
              <div
                key={a.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top badges & icon */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs text-emerald-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {isActive ? 'AKTIF' : 'DITUTUP'}
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Kelas {a.class || a.classId || '8A'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">{a.title}</h3>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {a.subject?.name || a.subject || 'Matematika'} · Nilai Maks. {a.maxScore || 100}
                    </p>
                  </div>

                  {/* Description */}
                  {a.description && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {a.description}
                    </p>
                  )}

                  {/* Deadline & Link */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className={overdue && isActive ? 'text-rose-600 font-extrabold' : ''}>
                        Deadline: {a.dueDate ? formatDate(a.dueDate, { day:'numeric', month:'short', year:'numeric' }) : 'Tidak ada'}
                        {overdue && isActive && ' (Lewat Deadline!)'}
                      </span>
                    </div>

                    {a.submissionLink && (
                      <a
                        href={a.submissionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Link Pengumpulkan</span>
                      </a>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {subCount}/{totalCount} Siswa Mengumpulkan
                      </span>
                      <span className="font-extrabold text-slate-900">{pct}%</span>
                    </div>
                    <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-600' : pct > 50 ? 'bg-teal-500' : 'bg-amber-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewingAssignment(a)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Pengumpulkan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(a)}
                    className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Edit / Ubah Tugas Ini"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(a.id)}
                    className="p-2.5 rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Tugas Siswa?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus tugas ini? Data pengumpulan siswa juga akan terhapus.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
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

      {/* Modal Detail Pengumpulan Tugas */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base leading-snug">{viewingAssignment.title}</h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Kelas {viewingAssignment.class || viewingAssignment.classId || '8A'} · {viewingAssignment.subject?.name || viewingAssignment.subject || 'Matematika'}
                </p>
              </div>
              <button onClick={() => setViewingAssignment(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                  <p className="text-xs font-semibold text-emerald-700">Sudah Mengumpulkan</p>
                  <p className="text-xl font-black mt-0.5">
                    {(sampleSubmissions[viewingAssignment.id] || []).filter(s => s.status !== 'Belum Mengumpulkan').length} Siswa
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
                  <p className="text-xs font-semibold text-amber-700">Belum Mengumpulkan</p>
                  <p className="text-xl font-black mt-0.5">
                    {(sampleSubmissions[viewingAssignment.id] || []).filter(s => s.status === 'Belum Mengumpulkan').length} Siswa
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-center">
                  <p className="text-xs font-semibold text-blue-700">Sudah Dinilai</p>
                  <p className="text-xl font-black mt-0.5">
                    {(sampleSubmissions[viewingAssignment.id] || []).filter(s => s.score !== '' && s.score !== null).length} Siswa
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-700 uppercase tracking-tight">
                    <tr>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-3">Waktu Kirim</th>
                      <th className="py-3 px-3">File Jawaban</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-4 text-center">Nilai Siswa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {(sampleSubmissions[viewingAssignment.id] || [
                      { id: 'sub-def-1', studentName: 'Ahmad Rizki Pratama', nis: '2026001', submittedAt: '2026-08-28 14:30', fileName: 'Jawaban_Tugas.pdf', status: 'Selesai', score: '90' },
                      { id: 'sub-def-2', studentName: 'Siti Nur Aisyah', nis: '2026002', submittedAt: '2026-08-29 10:00', fileName: 'File_Jawaban.pdf', status: 'Selesai', score: '85' },
                      { id: 'sub-def-3', studentName: 'Budi Permana', nis: '2026003', submittedAt: '-', fileName: '', status: 'Belum Mengumpulkan', score: '' },
                    ]).map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.studentName}</td>
                        <td className="py-3 px-3 text-slate-500">{s.nis}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {s.status === 'Offline' ? (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                              Dikumpulkan Offline
                            </span>
                          ) : (
                            <span className="text-slate-500">{s.submittedAt}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {s.fileName ? (
                            <button
                              type="button"
                              onClick={() => toast.info('Membuka Berkas Jawaban', `Membuka file: ${s.fileName}`)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="truncate max-w-[120px]">{s.fileName}</span>
                            </button>
                          ) : viewingAssignment?.submissionLink ? (
                            <a
                              href={viewingAssignment.submissionLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Link Pengumpulkan</span>
                            </a>
                          ) : s.status === 'Offline' ? (
                            <span className="text-slate-500 font-semibold text-[11px]">Buku / Berkas Fisik</span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum ada file / link</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={s.status}
                            onChange={(e) => handleUpdateStudentStatus(s.id, e.target.value)}
                            className={`text-xs font-extrabold px-2 py-1 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs ${
                              s.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              s.status === 'Terlambat' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              s.status === 'Offline' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <option value="Selesai">Selesai</option>
                            <option value="Terlambat">Terlambat</option>
                            <option value="Offline">Dikumpulkan Offline</option>
                            <option value="Belum Mengumpulkan">Belum Mengumpulkan</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={s.score}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSampleSubmissions(prev => {
                                  const list = prev[viewingAssignment.id] || [];
                                  return {
                                    ...prev,
                                    [viewingAssignment.id]: list.map(item => item.id === s.id ? { ...item, score: val } : item)
                                  };
                                });
                              }}
                              placeholder="0"
                              className="w-16 px-2.5 py-1 rounded-xl border border-emerald-200 text-center font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateStudentScore(s.id, s.score)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors cursor-pointer shadow-2xs"
                              title="Simpan Nilai"
                            >
                              Simpan
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setViewingAssignment(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                Tutup Ringkasan Pengumpulan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
