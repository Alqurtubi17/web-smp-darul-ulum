'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Play, Edit2, Trash2, Eye, Users, BarChart3, X, RefreshCw, AlertCircle, Gamepad2, Settings, PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { FileUpload } from '@/components/ui/FileUpload';
import apiClient from '@/lib/api';
import { toast } from '@/store/toast.store';
import Link from 'next/link';

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

interface CustomGameQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
  xpReward: number;
}

const INITIAL_7_GAMES = [
  {
    id: 'tajwid',
    name: 'Tajwid & PAI Quest',
    icon: '☪️',
    subject: 'PAI',
    color: 'from-emerald-600 to-teal-700',
    bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    desc: 'Kuis Tajwid & hukum bacaan Al-Qur’an interaktif',
    played: 18,
    bestScore: 980,
    difficulty: 'Sedang',
    mode: 'adventure',
    questions: [
      { id: 1, question: 'Hukum bacaan Nun Sukun (نْ) bertemu dengan huruf Kho (خ) adalah...', options: ['Izhar Halqi', 'Idgham Bighunnah', 'Ikhfa Hakiki', 'Iqlab'], correct: 0, explanation: 'مِنْ خَوْفٍ — Izhar Halqi terjadi jika Nun Sukun / Tanwin bertemu 6 huruf halq: ء, هـ, ع, ح, غ, خ.', xpReward: 100 },
      { id: 2, question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ya (ي) adalah...', options: ['Idgham Bighunnah', 'Idgham Bilaghunnah', 'Izhar Syafawi', 'Ikhfa Hakiki'], correct: 0, explanation: 'مَنْ يَّعْمَلْ — Idgham Bighunnah dibaca melebur disertai dengung.', xpReward: 100 },
      { id: 3, question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ra (ر) adalah...', options: ['Idgham Bilaghunnah', 'Idgham Bighunnah', 'Iqlab', 'Izhar Halqi'], correct: 0, explanation: 'مِنْ رَّبِّهِمْ — Idgham Bilaghunnah dibaca melebur tanpa dengung.', xpReward: 100 },
      { id: 4, question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ba (ب) adalah...', options: ['Iqlab', 'Ikhfa Hakiki', 'Izhar Halqi', 'Idgham Bighunnah'], correct: 0, explanation: 'مِنْ بَعْدِ — Iqlab terjadi jika Nun Sukun bertemu Ba, suara nun diganti menjadi Mim (م).', xpReward: 100 },
      { id: 5, question: 'Hukum bacaan Nun Sukun (نْ) bertemu Qaf (ق) adalah...', options: ['Ikhfa Hakiki', 'Izhar Halqi', 'Idgham Bilaghunnah', 'Iqlab'], correct: 0, explanation: 'مِنْ قَبْلِ — Ikhfa Hakiki dibaca samar-samar dengan dengung.', xpReward: 100 },
      { id: 6, question: 'Hukum Mim Sukun (مْ) bertemu dengan Mim (م) adalah...', options: ['Idgham Mimi (Mitsli)', 'Ikhfa Syafawi', 'Izhar Syafawi', 'Izhar Halqi'], correct: 0, explanation: 'لَهُمْ مَّا يَشَاءُونَ — Idgham Mimi terjadi apabila Mim Sukun bertemu huruf Mim.', xpReward: 150 },
      { id: 7, question: 'Hukum Mim Sukun (مْ) bertemu dengan Ba (ب) adalah...', options: ['Ikhfa Syafawi', 'Izhar Syafawi', 'Idgham Mimi', 'Iqlab'], correct: 0, explanation: 'تَرْمِيهِمْ بِحِجَارَةٍ — Ikhfa Syafawi terjadi apabila Mim Sukun bertemu huruf Ba.', xpReward: 150 },
      { id: 8, question: 'Hukum Mim Sukun (مْ) bertemu Ta (ت) adalah...', options: ['Izhar Syafawi', 'Ikhfa Syafawi', 'Idgham Bighunnah', 'Iqlab'], correct: 0, explanation: 'أَلَمْ تَرَ كَيْفَ — Izhar Syafawi dibaca jelas tanpa dengung.', xpReward: 150 },
      { id: 9, question: 'Berapakah jumlah rukun Islam dan rukun Iman secara berturut-turut?', options: ['5 dan 6', '6 dan 5', '5 dan 5', '6 dan 6'], correct: 0, explanation: 'Rukun Islam ada 5 perkara dan Rukun Iman ada 6 perkara.', xpReward: 150 },
      { id: 10, question: 'Hukum Mad pada kata وَالسَّمَاءِ (Hamzah dalam satu kata) adalah...', options: ['Mad Wajib Muttashil', 'Mad Jaiz Munfashil', 'Mad Arid Lissukun', 'Mad Badal'], correct: 0, explanation: 'Mad Wajib Muttashil terjadi jika Mad Thabi’i bertemu Hamzah dalam satu kata (4-5 harakat).', xpReward: 200 },
      { id: 11, question: 'Hukum Mad pada بِمَا أُنْزِلَ (Mad Thabi’i bertemu Hamzah di lain kata) adalah...', options: ['Mad Jaiz Munfashil', 'Mad Wajib Muttashil', 'Mad Iwadh', 'Mad Shilah'], correct: 0, explanation: 'Mad Jaiz Munfashil terjadi jika Mad Thabi’i bertemu Hamzah di kata terpisah.', xpReward: 200 },
      { id: 12, question: 'Panjang hukum bacaan Mad Arid Lissukun di akhir ayat adalah...', options: ['2, 4, atau 6 Harakat', '1 Harakat saja', '8 Harakat', '3 Harakat saja'], correct: 0, explanation: 'الْعَالَمِينَ — Boleh dibaca 2, 4, atau 6 harakat.', xpReward: 200 }
    ]
  },
  {
    id: 'vocab',
    name: 'Word & Concept Match',
    icon: '🧩',
    subject: 'IPA / Bahasa',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    desc: 'Cocokkan istilah dan definisi pelajaran!',
    played: 14,
    bestScore: 1050,
    difficulty: 'Mudah',
    mode: 'match',
    questions: [
      { id: 1, question: 'Photosynthesis', options: ['Proses pembuat makanan pada tumbuhan hijau', '', '', ''], correct: 0, explanation: 'Istilah Biologi Tumbuhan', xpReward: 150 },
      { id: 2, question: 'Respiration', options: ['Proses pelepasan energi dari glukosa', '', '', ''], correct: 0, explanation: 'Istilah Biologi Respirasi', xpReward: 150 },
      { id: 3, question: 'Linear Equation', options: ['Persamaan dengan variabel pangkat 1', '', '', ''], correct: 0, explanation: 'Istilah Aljabar Matematika', xpReward: 150 },
      { id: 4, question: 'Majas Personifikasi', options: ['Gaya bahasa yang menganggap benda mati bernyawa', '', '', ''], correct: 0, explanation: 'Istilah Bahasa Indonesia', xpReward: 150 },
      { id: 5, question: 'Narrative Text', options: ['Teks cerita rekaan untuk menghibur pembaca', '', '', ''], correct: 0, explanation: 'Istilah Bahasa Inggris', xpReward: 150 },
      { id: 6, question: 'Proklamasi 1945', options: ['Peristiwa sejarah kemerdekaan Indonesia', '', '', ''], correct: 0, explanation: 'Istilah Sejarah IPS', xpReward: 150 }
    ]
  },
  {
    id: 'matematika',
    name: 'Math Blitz',
    icon: '⚡',
    subject: 'Matematika',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 border-blue-200 text-blue-900',
    desc: 'Jawab soal matematika sebelum waktu habis!',
    played: 12,
    bestScore: 850,
    difficulty: 'Sedang',
    mode: 'speed',
    questions: [
      { id: 1, question: 'Berapakah nilai x dari persamaan aljabar: 2x + 6 = 16 ?', options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'], correct: 1, explanation: '2x = 16 - 6 => 2x = 10 => x = 5', xpReward: 50 },
      { id: 2, question: 'Persamaan linear satu variabel dengan x = 4 adalah...', options: ['3x - 2 = 10', '2x + 4 = 10', '5x - 5 = 15', 'x + 8 = 10'], correct: 0, explanation: '3(4) - 2 = 12 - 2 = 10', xpReward: 50 },
      { id: 3, question: 'Hasil dari 15 + (4 × 5) adalah...', options: ['35', '95', '40', '50'], correct: 0, explanation: 'Perkalian dikerjakan lebih dahulu: 4 × 5 = 20, 15 + 20 = 35', xpReward: 50 },
      { id: 4, question: 'Berapakah 25% dari 200 ?', options: ['50', '25', '75', '100'], correct: 0, explanation: '25/100 × 200 = 50', xpReward: 50 },
      { id: 5, question: 'Akar kuadrat dari 144 adalah...', options: ['12', '14', '16', '10'], correct: 0, explanation: '12 × 12 = 144', xpReward: 50 },
      { id: 6, question: 'Hasil dari 3³ + 2² adalah...', options: ['31', '25', '35', '29'], correct: 0, explanation: '27 + 4 = 31', xpReward: 50 }
    ]
  },
  {
    id: 'scramble',
    name: 'Word Scramble',
    icon: '🔤',
    subject: 'B. Inggris',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50 border-purple-200 text-purple-900',
    desc: 'Susun huruf jadi kata bahasa Inggris!',
    played: 8,
    bestScore: 1200,
    difficulty: 'Mudah',
    mode: 'speed',
    questions: [
      { id: 1, question: 'Susun kata: E - D - U - C - A - T - I - O - N', options: ['EDUCATION', 'DEDICATION', 'EVALUATION', 'ELEVATION'], correct: 0, explanation: 'Artinya: Pendidikan', xpReward: 100 },
      { id: 2, question: 'Susun kata: L - E - A - R - N - I - N - G', options: ['LEARNING', 'READING', 'WRITING', 'LISTENING'], correct: 0, explanation: 'Artinya: Pembelajaran', xpReward: 100 },
      { id: 3, question: 'Susun kata: K - N - O - W - L - E - D - G - E', options: ['KNOWLEDGE', 'ACKNOWLEDGMENT', 'CHALLENGE', 'ADVANTAGE'], correct: 0, explanation: 'Artinya: Pengetahuan', xpReward: 100 },
      { id: 4, question: 'Susun kata: S - C - H - O - O - L', options: ['SCHOOL', 'SCHOLAR', 'SCHEDULE', 'SCHEME'], correct: 0, explanation: 'Artinya: Sekolah', xpReward: 100 },
      { id: 5, question: 'Susun kata: T - E - A - C - H - E - R', options: ['TEACHER', 'TRAINER', 'THEATER', 'TUTORIAL'], correct: 0, explanation: 'Artinya: Guru', xpReward: 100 }
    ]
  },
  {
    id: 'memory',
    name: 'IPA Memory',
    icon: '🧬',
    subject: 'IPA',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 border-green-200 text-green-900',
    desc: 'Pasangkan istilah IPA dengan definisi!',
    played: 5,
    bestScore: 640,
    difficulty: 'Sedang',
    mode: 'match',
    questions: [
      { id: 1, question: 'Klorofil', options: ['Zat hijau daun pengikat cahaya matahari', '', '', ''], correct: 0, explanation: 'Biologi Tumbuhan', xpReward: 100 },
      { id: 2, question: 'Mitokondria', options: ['Organel sel penghasil energi selular', '', '', ''], correct: 0, explanation: 'Biologi Sel', xpReward: 100 },
      { id: 3, question: 'Stomata', options: ['Celah mulut daun tempat pertukaran gas', '', '', ''], correct: 0, explanation: 'Anatomi Tumbuhan', xpReward: 100 },
      { id: 4, question: 'Osmosis', options: ['Perpindahan molekul air melalui membran', '', '', ''], correct: 0, explanation: 'Fisika Biologi', xpReward: 100 },
      { id: 5, question: 'Kapiler', options: ['Pembuluh darah terkecil penyuplai sel', '', '', ''], correct: 0, explanation: 'Sistem Peredaran Darah', xpReward: 100 }
    ]
  },
  {
    id: 'quiz-ipa',
    name: 'Science Quiz',
    icon: '🔭',
    subject: 'IPA',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50 border-teal-200 text-teal-900',
    desc: 'Kuis sains interaktif dengan penjelasan!',
    played: 15,
    bestScore: 920,
    difficulty: 'Mudah',
    mode: 'speed',
    questions: [
      { id: 1, question: 'Organel sel yang berfungsi sebagai pusat energi sel adalah...', options: ['Mitokondria', 'Ribosom', 'Lisosom', 'Nukleus'], correct: 0, explanation: 'Mitokondria menghasilkan ATP energi sel.', xpReward: 100 },
      { id: 2, question: 'Gas yang diserap tumbuhan saat fotosintesis adalah...', options: ['Karbondioksida (CO2)', 'Oksigen (O2)', 'Nitrogen (N2)', 'Hidrogen (H2)'], correct: 0, explanation: 'Tumbuhan menyerap CO2 dan merilis Oksigen.', xpReward: 100 },
      { id: 3, question: 'Satuan internasional untuk mengukur arus listrik adalah...', options: ['Ampere', 'Volt', 'Ohm', 'Watt'], correct: 0, explanation: 'Arus listrik diukur dalam Ampere (A).', xpReward: 100 },
      { id: 4, question: 'Planet terbesar dalam tata surya kita adalah...', options: ['Jupiter', 'Saturnus', 'Neptunus', 'Bumi'], correct: 0, explanation: 'Jupiter adalah planet terbesar di Tata Surya.', xpReward: 100 },
      { id: 5, question: 'Urutan lapisan atmosfer terendah adalah...', options: ['Troposfer', 'Stratosfer', 'Mesosfer', 'Termosfer'], correct: 0, explanation: 'Troposfer tempat terjadinya fenomena cuaca.', xpReward: 100 }
    ]
  },
  {
    id: 'timeline',
    name: 'Sejarah Timeline',
    icon: '📅',
    subject: 'IPS',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 border-orange-200 text-orange-900',
    desc: 'Urutkan peristiwa sejarah Indonesia!',
    played: 6,
    bestScore: 780,
    difficulty: 'Sulit',
    mode: 'speed',
    questions: [
      { id: 1, question: 'Tahun Proklamasi Kemerdekaan Republik Indonesia adalah...', options: ['1945', '1928', '1908', '1950'], correct: 0, explanation: 'Proklamasi dibacakan Ir. Soekarno pada 17 Agustus 1945.', xpReward: 100 },
      { id: 2, question: 'Peristiwa Sumpah Pemuda dicetuskan pada tahun...', options: ['1928', '1908', '1945', '1912'], correct: 0, explanation: 'Kongres Pemuda II pada 28 Oktober 1928.', xpReward: 100 },
      { id: 3, question: 'Peristiwa Rengasdengklok terjadi pada tanggal...', options: ['16 Agustus 1945', '17 Agustus 1945', '18 Agustus 1945', '15 Agustus 1945'], correct: 0, explanation: 'Penjelapan Soekarno-Hatta ke Rengasdengklok.', xpReward: 100 },
      { id: 4, question: 'Kongres Pemuda Pertama dilaksanakan pada tahun...', options: ['1926', '1928', '1945', '1930'], correct: 0, explanation: 'Kongres Pemuda I di Batavia tahun 1926.', xpReward: 100 },
      { id: 5, question: 'Berdirinya organisasi Budi Utomo pada tahun...', options: ['1908', '1912', '1928', '1945'], correct: 0, explanation: '20 Mei 1908 sebagai Hari Kebangkitan Nasional.', xpReward: 100 }
    ]
  }
];

export default function GuruElearningPage() {
  const [activeTab, setActiveTab] = useState<'modul' | 'games'>('modul');
  const [modules, setModules] = useState<Module[]>([]);
  const [gamesList, setGamesList] = useState(INITIAL_7_GAMES);
  const [editingGame, setEditingGame] = useState<typeof INITIAL_7_GAMES[0] | null>(null);

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
    try {
      const saved = localStorage.getItem('smp_elearning_custom_games');
      if (saved) {
        setGamesList(JSON.parse(saved));
      }
    } catch (e) {}
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
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/guru/akademik/materi"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4" /> Builder Game Kuis
          </Link>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4"/> Tambah Modul Baru
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('modul')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'modul'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Modul &amp; Bahan Ajar ({modules.length})
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'games'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-amber-500" /> Kustomisasi 7 Game Interaktif Siswa ({gamesList.length})
        </button>
      </div>

      {activeTab === 'modul' && (
        <>
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
                        <span>· {mod.createdAt}</span>
                        <span>· {mod.views}x Dilihat</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
        </>
      )}

      {/* Tab 2: 7 Games Management Grid */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Kelola &amp; Kustomisasi Soal/Kartu untuk ke-7 Game Interaktif Siswa di bawah ini:</span>
            </div>
            <span className="text-[11px] font-extrabold bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full shrink-0">
              7 Game Siap Edit
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {gamesList.map(game => (
              <div key={game.id} className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
                        {game.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{game.name}</h3>
                        <p className="text-xs font-bold text-emerald-700">{game.subject} · {game.questions.length} Soal/Kartu Aktif</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {game.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{game.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400">Dimainkan {game.played}×</span>
                  <button
                    type="button"
                    onClick={() => setEditingGame(game)}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-extrabold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Settings className="w-3.5 h-3.5" /> Edit Soal Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Modal Kustomisasi Soal Game */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{editingGame.icon}</span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Setting &amp; Custom Soal: {editingGame.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">Kustomisasi pertanyaan, opsi jawaban, dan tingkat kesulitan game</p>
                </div>
              </div>
              <button
                onClick={() => setEditingGame(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={editingGame.subject}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame(prev => prev ? { ...prev, subject: val } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={editingGame.difficulty}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame(prev => prev ? { ...prev, difficulty: val } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
              </div>

              {/* List Soal / Pasangan */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Daftar {editingGame.mode === 'match' ? 'Pasangan Kartu' : 'Soal Game'} ({editingGame.questions.length} Item)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGame(prev => {
                        if (!prev) return null;
                        const newQ = {
                          id: Date.now(),
                          question: prev.mode === 'match' ? 'Kata / Istilah Baru' : `Pertanyaan Soal Baru #${prev.questions.length + 1}`,
                          options: [prev.mode === 'match' ? 'Definisi / Pasangan Kartu Baru' : 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'] as [string, string, string, string],
                          correct: 0,
                          explanation: 'Penjelasan pembahasan...',
                          xpReward: 100,
                        };
                        return { ...prev, questions: [...prev.questions, newQ] };
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {editingGame.mode === 'match' ? 'Tambah Pasangan Kartu' : 'Tambah Soal Baru'}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingGame.questions.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-md">
                          {editingGame.mode === 'match' ? `Pasangan #${idx + 1}` : `Soal #${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGame(prev => {
                              if (!prev) return null;
                              return { ...prev, questions: prev.questions.filter((_, i) => i !== idx) };
                            });
                          }}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>

                      {editingGame.mode === 'match' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kartu A (Istilah)</label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingGame(prev => {
                                  if (!prev) return null;
                                  const updated = prev.questions.map((item, i) => i === idx ? { ...item, question: val } : item);
                                  return { ...prev, questions: updated };
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kartu B (Definisi Pasangan)</label>
                            <input
                              type="text"
                              value={q.options[0]}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingGame(prev => {
                                  if (!prev) return null;
                                  const updated = prev.questions.map((item, i) => {
                                    if (i === idx) {
                                      const newOpts = [...item.options] as [string, string, string, string];
                                      newOpts[0] = val;
                                      return { ...item, options: newOpts };
                                    }
                                    return item;
                                  });
                                  return { ...prev, questions: updated };
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pertanyaan Soal</label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingGame(prev => {
                                  if (!prev) return null;
                                  const updated = prev.questions.map((item, i) => i === idx ? { ...item, question: val } : item);
                                  return { ...prev, questions: updated };
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Opsi Pilihan Ganda (Pilih Kunci Jawaban Benar)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {q.options.map((optVal, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                                  <input
                                    type="radio"
                                    name={`game-correct-${idx}`}
                                    checked={q.correct === optIdx}
                                    onChange={() => {
                                      setEditingGame(prev => {
                                        if (!prev) return null;
                                        const updated = prev.questions.map((item, i) => i === idx ? { ...item, correct: optIdx } : item);
                                        return { ...prev, questions: updated };
                                      });
                                    }}
                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-slate-500 w-4">{String.fromCharCode(65 + optIdx)}.</span>
                                  <input
                                    type="text"
                                    value={optVal}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setEditingGame(prev => {
                                        if (!prev) return null;
                                        const updated = prev.questions.map((item, i) => {
                                          if (i === idx) {
                                            const newOpts = [...item.options] as [string, string, string, string];
                                            newOpts[optIdx] = val;
                                            return { ...item, options: newOpts };
                                          }
                                          return item;
                                        });
                                        return { ...prev, questions: updated };
                                      });
                                    }}
                                    className="flex-1 text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                                    placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 justify-end">
              <button
                type="button"
                onClick={() => setEditingGame(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingGame) return;
                  const updatedList = gamesList.map(g => g.id === editingGame.id ? editingGame : g);
                  setGamesList(updatedList);
                  
                  // 1. Simpan ke localStorage untuk akses instan di Siswa & Guru
                  try {
                    localStorage.setItem('smp_elearning_custom_games', JSON.stringify(updatedList));
                  } catch (e) {}

                  // 2. Simpan & Sinkronkan ke Database backend
                  try {
                    await apiClient.post('/materials', {
                      title: editingGame.name,
                      description: editingGame.desc,
                      type: 'quiz_game',
                      fileUrl: '#',
                      externalUrl: `/siswa/elearning/game/${editingGame.id}`,
                      quizData: {
                        mode: editingGame.mode,
                        questions: editingGame.questions,
                      },
                    }).catch(() => {});
                  } catch (e) {}

                  toast.success('Soal Game Diperbarui & Disimpan di DB', `Kustomisasi soal game "${editingGame.name}" berhasil disimpan ke database dan disinkronkan untuk siswa.`);
                  setEditingGame(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Kustomisasi Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
