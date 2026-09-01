'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Play, Edit2, Trash2, Eye, Users, BarChart3, X, RefreshCw, AlertCircle, Gamepad2, Settings, PlusCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { FileUpload } from '@/components/ui/FileUpload';
import apiClient from '@/lib/api';
import { toast } from '@/store/toast.store';
import Link from 'next/link';

import TajwidQuestGame from '../../siswa/elearning/game/tajwid/page';
import WordMatchGame from '../../siswa/elearning/game/vocab/page';
import MathBlitzGame from '../../siswa/elearning/game/matematika/page';
import WordScrambleGame from '../../siswa/elearning/game/scramble/page';
import MemoryMatchGame from '../../siswa/elearning/game/memory/page';
import ScienceQuizGame from '../../siswa/elearning/game/quiz-ipa/page';
import SejarahTimelineGame from '../../siswa/elearning/game/timeline/page';
import { QuizizzGameArena } from '@/components/game/QuizizzGameArena';

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

const INITIAL_MASTER_GAMES = [
  {
    id: 'quizizz',
    slug: 'quizizz',
    name: 'Quizizz Live Arena',
    icon: '🎯',
    subject: 'Umum / Semua Mapel',
    color: 'from-amber-500 via-orange-600 to-rose-600',
    bgColor: 'bg-amber-50 border-amber-200 text-amber-900',
    desc: 'Arena Kuis Live persis Quizizz dengan QR Code & PIN Akses Siswa / Tamu!',
    played: 42,
    bestScore: 1450,
    difficulty: 'Sedang',
    mode: 'quizizz',
    questions: [
      { id: 1, question: 'Berapakah nilai x dari 3x - 9 = 12 ?', options: ['x = 7', 'x = 5', 'x = 9', 'x = 3'], correct: 0, explanation: '3x = 21 => x = 7', xpReward: 200 },
      { id: 2, question: 'Organel sel tempat fotosintesis adalah...', options: ['Kloroplas', 'Mitokondria', 'Ribosom', 'Golgi'], correct: 0, explanation: 'Kloroplas mengandung klorofil', xpReward: 200 },
    ]
  },
  {
    id: 'tajwid',
    slug: 'tajwid',
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
    ]
  },
  {
    id: 'vocab',
    slug: 'vocab',
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
    ]
  },
  {
    id: 'matematika',
    slug: 'matematika',
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
    ]
  },
  {
    id: 'scramble',
    slug: 'scramble',
    name: 'Word Scramble',
    icon: '🔤',
    subject: 'B. Inggris',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50 border-purple-200 text-purple-900',
    desc: 'Susun huruf jadi kata bahasa Inggris!',
    played: 8,
    bestScore: 1200,
    difficulty: 'Mudah',
    mode: 'scramble',
    questions: [
      { id: 1, question: 'Susun kata: E - D - U - C - A - T - I - O - N', options: ['EDUCATION', 'DEDICATION', 'EVALUATION', 'ELEVATION'], correct: 0, explanation: 'Artinya: Pendidikan', xpReward: 100 },
      { id: 2, question: 'Susun kata: L - E - A - R - N - I - N - G', options: ['LEARNING', 'READING', 'WRITING', 'LISTENING'], correct: 0, explanation: 'Artinya: Pembelajaran', xpReward: 100 },
    ]
  },
  {
    id: 'memory',
    slug: 'memory',
    name: 'IPA Memory',
    icon: '🧬',
    subject: 'IPA',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 border-green-200 text-green-900',
    desc: 'Pasangkan istilah IPA dengan definisi!',
    played: 5,
    bestScore: 640,
    difficulty: 'Sedang',
    mode: 'memory',
    questions: [
      { id: 1, question: 'Klorofil', options: ['Zat hijau daun pengikat cahaya matahari', '', '', ''], correct: 0, explanation: 'Biologi Tumbuhan', xpReward: 100 },
      { id: 2, question: 'Mitokondria', options: ['Organel sel penghasil energi selular', '', '', ''], correct: 0, explanation: 'Biologi Sel', xpReward: 100 },
    ]
  },
  {
    id: 'quiz-ipa',
    slug: 'quiz-ipa',
    name: 'Science Quiz',
    icon: '🔭',
    subject: 'IPA',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50 border-teal-200 text-teal-900',
    desc: 'Kuis sains interaktif dengan penjelasan!',
    played: 15,
    bestScore: 920,
    difficulty: 'Mudah',
    mode: 'quiz',
    questions: [
      { id: 1, question: 'Organel sel yang berfungsi sebagai pusat energi sel adalah...', options: ['Mitokondria', 'Ribosom', 'Lisosom', 'Nukleus'], correct: 0, explanation: 'Mitokondria menghasilkan ATP energi sel.', xpReward: 100 },
      { id: 2, question: 'Gas yang diserap tumbuhan saat fotosintesis adalah...', options: ['Karbondioksida (CO2)', 'Oksigen (O2)', 'Nitrogen (N2)', 'Hidrogen (H2)'], correct: 0, explanation: 'Tumbuhan menyerap CO2 dan merilis Oksigen.', xpReward: 100 },
    ]
  },
  {
    id: 'timeline',
    slug: 'timeline',
    name: 'Sejarah Timeline',
    icon: '📅',
    subject: 'IPS',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 border-orange-200 text-orange-900',
    desc: 'Urutkan peristiwa sejarah Indonesia!',
    played: 6,
    bestScore: 780,
    difficulty: 'Sulit',
    mode: 'timeline',
    questions: [
      { id: 1, question: 'Tahun Proklamasi Kemerdekaan Republik Indonesia adalah...', options: ['1945', '1928', '1908', '1950'], correct: 0, explanation: 'Proklamasi dibacakan Ir. Soekarno pada 17 Agustus 1945.', xpReward: 100 },
      { id: 2, question: 'Peristiwa Sumpah Pemuda dicetuskan pada tahun...', options: ['1928', '1908', '1945', '1912'], correct: 0, explanation: 'Kongres Pemuda II pada 28 Oktober 1928.', xpReward: 100 },
    ]
  }
];

const ALL_SUBJECTS = ['Semua Mapel', 'PAI', 'Matematika', 'IPA', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPS', 'PPKn', 'Seni Budaya', 'PJOK', 'Informatika'];
const EMOJI_ICONS = ['🎯', '🎮', '⚡', '🧩', '🔤', '🧬', '🔭', '📅', '☪️', '🔢', '🧪', '📕', '🏆', '💡', '🎨', '🚀'];
const COLOR_THEMES = [
  { label: 'Emerald Teal', val: 'from-emerald-600 to-teal-700' },
  { label: 'Indigo Purple', val: 'from-indigo-500 to-purple-600' },
  { label: 'Blue Sky', val: 'from-blue-500 to-indigo-600' },
  { label: 'Purple Violet', val: 'from-purple-500 to-violet-600' },
  { label: 'Orange Amber', val: 'from-orange-500 to-amber-600' },
  { label: 'Rose Red', val: 'from-rose-500 to-red-600' },
  { label: 'Teal Cyan', val: 'from-teal-500 to-cyan-600' },
];

export default function GuruElearningPage() {
  const [activeTab, setActiveTab] = useState<'modul' | 'games'>('modul');
  const [modules, setModules] = useState<Module[]>([]);
  const [gamesList, setGamesList] = useState<any[]>(INITIAL_MASTER_GAMES);

  const [editingGame, setEditingGame] = useState<any | null>(null);
  const [previewGame, setPreviewGame] = useState<any | null>(null);
  const [deleteGameTarget, setDeleteGameTarget] = useState<any | null>(null);
  const [showCreateGameModal, setShowCreateGameModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Module | null>(null);
  const [deleteMod, setDeleteMod] = useState<Module | null>(null);

  const [attachmentMode, setAttachmentMode] = useState<'file' | 'url'>('file');

  const [form, setForm] = useState({
    title: '',
    subject: 'Matematika',
    class: '8A',
    type: 'VIDEO' as Module['type'],
    content: '',
    fileUrl: '',
  });

  const [newGameForm, setNewGameForm] = useState({
    name: '',
    icon: '🎯',
    subject: 'Matematika',
    mode: 'quizizz' as 'quizizz' | 'speed' | 'match' | 'scramble' | 'adventure' | 'memory' | 'quiz' | 'timeline',
    difficulty: 'Sedang',
    color: 'from-amber-500 via-orange-600 to-rose-600',
    desc: '',
    questions: [
      {
        id: Date.now(),
        question: 'Contoh Pertanyaan Soal #1',
        options: ['Opsi Jawaban A', 'Opsi Jawaban B', 'Opsi Jawaban C', 'Opsi Jawaban D'] as [string, string, string, string],
        correct: 0,
        explanation: 'Penjelasan pembahasan soal...',
        xpReward: 100,
      }
    ]
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

  const fetchGamesFromDb = async () => {
    try {
      const res = await apiClient.get('/elearning-games');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const dbMap = new Map<string, any>();
        res.data.data.forEach((g: any) => {
          const key = g.slug || g.id;
          dbMap.set(key, g);
        });

        // 1. Update initial master games with live Database stats (played & bestScore & questions)
        const updatedInitial = INITIAL_MASTER_GAMES.map(initGame => {
          const key = initGame.slug || initGame.id;
          const dbGame = dbMap.get(key);
          if (dbGame) {
            return {
              ...initGame,
              name: dbGame.name || initGame.name,
              icon: dbGame.icon || initGame.icon,
              subject: dbGame.subject || initGame.subject,
              played: dbGame.played !== undefined ? dbGame.played : initGame.played,
              bestScore: dbGame.bestScore !== undefined ? dbGame.bestScore : initGame.bestScore,
              difficulty: dbGame.difficulty || initGame.difficulty,
              mode: dbGame.mode || initGame.mode,
              questions: dbGame.questions?.length > 0 ? dbGame.questions.map((q: any) => ({
                id: q.id,
                question: q.question,
                options: q.options || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
                correct: q.correct || 0,
                explanation: q.explanation || '',
                xpReward: q.xpReward || 100,
              })) : initGame.questions,
            };
          }
          return initGame;
        });

        // 2. Add any custom games created by teachers in DB
        const initialKeys = new Set(INITIAL_MASTER_GAMES.map(g => g.slug || g.id));
        const customDbGames = res.data.data
          .filter((g: any) => !initialKeys.has(g.slug) && !initialKeys.has(g.id))
          .map((g: any) => ({
            id: g.id,
            slug: g.slug || g.id,
            name: g.name,
            icon: g.icon,
            subject: g.subject,
            color: g.color || 'from-emerald-600 to-teal-700',
            bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            desc: g.desc,
            played: g.played || 0,
            bestScore: g.bestScore || 1000,
            difficulty: g.difficulty || 'Sedang',
            mode: g.mode || 'speed',
            questions: g.questions?.map((q: any) => ({
              id: q.id,
              question: q.question,
              options: q.options || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
              correct: q.correct || 0,
              explanation: q.explanation || '',
              xpReward: q.xpReward || 100,
            })) || [],
          }));

        setGamesList([...updatedInitial, ...customDbGames]);
      }
    } catch (e) {
      console.warn('Fetch elearning games error:', e);
    }
  };

  useEffect(() => {
    fetchModules();
    fetchGamesFromDb();
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

  const handleCreateGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameForm.name || !newGameForm.subject) {
      toast.error('Form Tidak Lengkap', 'Silakan lengkapi nama game dan mata pelajaran.');
      return;
    }

    try {
      const payload = {
        name: newGameForm.name,
        icon: newGameForm.icon,
        subject: newGameForm.subject,
        mode: newGameForm.mode,
        difficulty: newGameForm.difficulty,
        color: newGameForm.color,
        desc: newGameForm.desc || `Game pembelajaran ${newGameForm.subject}`,
        questions: newGameForm.questions,
      };

      if (editingGame) {
        setGamesList(prev => prev.map(g => (g.id === editingGame.id || g.slug === editingGame.slug) ? { ...g, ...payload } : g));
        toast.success('Soal & Game Berhasil Diperbarui! 🎉', `Game "${newGameForm.name}" telah diperbarui.`);
      } else {
        await apiClient.post('/elearning-games', payload);
        toast.success('Game Pembelajaran Berhasil Dibuat!', `Game "${newGameForm.name}" telah tersimpan dan dapat dimainkan oleh siswa.`);
      }

      setShowCreateGameModal(false);
      setEditingGame(null);
      fetchGamesFromDb();
    } catch (err) {
      toast.error('Gagal Menyimpan Game', 'Terjadi kesalahan saat menyimpan game.');
    }
  };

  const handleDeleteGame = async () => {
    if (!deleteGameTarget) return;
    try {
      const slug = deleteGameTarget.slug || deleteGameTarget.id;
      await apiClient.delete(`/elearning-games/${slug}`);
      toast.warning('Game Dihapus', `Game "${deleteGameTarget.name}" berhasil dihapus.`);
      setDeleteGameTarget(null);
      fetchGamesFromDb();
    } catch (err) {
      toast.error('Gagal Menghapus Game', 'Terjadi kesalahan saat menghapus game.');
    }
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Modul &amp; Game Pembelajaran E-Learning</h1>
          <p className="text-xs text-slate-500 font-medium">Kelola bahan ajar dan Master Game Studio interaktif untuk siswa</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchModules(); fetchGamesFromDb(); }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setNewGameForm({
                name: '',
                icon: '🎮',
                subject: 'Matematika',
                mode: 'speed',
                difficulty: 'Sedang',
                color: 'from-emerald-600 to-teal-700',
                desc: '',
                questions: [
                  {
                    id: Date.now(),
                    question: 'Pertanyaan Soal Pertama',
                    options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
                    correct: 0,
                    explanation: 'Penjelasan pembahasan soal...',
                    xpReward: 100,
                  }
                ]
              });
              setShowCreateGameModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Buat Game Baru
          </button>
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
          <Gamepad2 className="w-4 h-4 text-amber-500" /> Master Game Studio ({gamesList.length})
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

      {/* Tab 2: Master Game Studio Grid */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          {/* Header Banner Master Game Studio */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <h2 className="text-lg font-extrabold tracking-tight">Master Game Studio — Buat Game per Mapel</h2>
              </div>
              <p className="text-white/90 text-xs font-medium max-w-2xl leading-relaxed">
                Pilih mata pelajaran atau materi yang ingin digamifikasi! Pilih mekanik game (Speed Quiz, Concept Match, Word Scramble, Adventure Quest), buat soal kustom, dan publikasikan langsung ke siswa.
              </p>
            </div>
            <button
              onClick={() => {
                setNewGameForm({
                  name: '',
                  icon: '🎮',
                  subject: 'Matematika',
                  mode: 'speed',
                  difficulty: 'Sedang',
                  color: 'from-emerald-600 to-teal-700',
                  desc: '',
                  questions: [
                    {
                      id: Date.now(),
                      question: 'Contoh Pertanyaan Soal #1',
                      options: ['Opsi Jawaban A', 'Opsi Jawaban B', 'Opsi Jawaban C', 'Opsi Jawaban D'],
                      correct: 0,
                      explanation: 'Penjelasan pembahasan soal...',
                      xpReward: 100,
                    }
                  ]
                });
                setShowCreateGameModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold text-xs transition-all hover:bg-slate-100 hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" /> Buat Game Pembelajaran Baru
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {gamesList.map(game => (
              <div key={game.id || game.slug} className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-2.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-2xs">
                        {game.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{game.name}</h3>
                        <p className="text-xs font-bold text-emerald-700">{game.subject} · {game.questions?.length || 0} Soal/Kartu</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {game.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{game.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400">Dimainkan {game.played || 0}×</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewGame(game)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGame(game);
                        setNewGameForm({
                          name: game.name || '',
                          icon: game.icon || '🎯',
                          subject: game.subject || 'Matematika',
                          mode: game.mode || 'quizizz',
                          difficulty: game.difficulty || 'Sedang',
                          color: game.color || 'from-amber-500 via-orange-600 to-rose-600',
                          desc: game.desc || '',
                          questions: game.questions || [],
                        });
                        setShowCreateGameModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-extrabold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" /> Edit Game
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteGameTarget(game)}
                      className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Game"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Form Master Studio: Buat Game Baru */}
      {showCreateGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-500 to-emerald-600 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎮</span>
                <div>
                  <h2 className="font-extrabold text-base">Game Master Studio: Buat Game Baru</h2>
                  <p className="text-xs text-amber-100 font-medium">Buat game pembelajaran kustom untuk mapel atau materi tertentu</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateGameModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGameSubmit}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Game Pembelajaran *</label>
                    <input
                      type="text"
                      required
                      value={newGameForm.name}
                      onChange={e => setNewGameForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="cth: Kuis Persamaan Linear 8A"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran (Mapel) *</label>
                    <select
                      value={newGameForm.subject}
                      onChange={e => setNewGameForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mode Mechanics Game *</label>
                    <select
                      value={newGameForm.mode}
                      onChange={e => setNewGameForm(p => ({ ...p, mode: e.target.value as any }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="quizizz">🎯 Quizizz Live Arena (Arena Live, QR Code &amp; Power-Ups)</option>
                      <option value="speed">⚡ Math Blitz / Speed Quiz (Pilihan Ganda Cepat)</option>
                      <option value="match">🧩 Concept &amp; Word Match (Pasangan Kartu Istilah)</option>
                      <option value="adventure">☪️ Tajwid &amp; PAI Quest (Kuis Bertingkat &amp; Pembahasan)</option>
                      <option value="scramble">🔤 Word Scramble (Menyusun Huruf Acak Materi)</option>
                      <option value="memory">🧬 IPA &amp; Sains Memory Match (Mengingat Pasangan Kartu)</option>
                      <option value="quiz">🔭 Science &amp; General Quiz (Kuis Sains Penjelasan Rinci)</option>
                      <option value="timeline">📅 Sejarah &amp; Timeline (Urutan Peristiwa Sejarah)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kesulitan *</label>
                    <select
                      value={newGameForm.difficulty}
                      onChange={e => setNewGameForm(p => ({ ...p, difficulty: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Mudah">🌱 Mudah (20 detik / soal · 100 XP)</option>
                      <option value="Sedang">⭐ Sedang (15 detik / soal · 150 XP)</option>
                      <option value="Sulit">🔥 Sulit (12 detik / soal · 200 XP)</option>
                    </select>
                    <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-medium leading-tight">
                      {newGameForm.difficulty === 'Mudah' && (
                        <span className="text-emerald-700 font-bold block">
                          🌱 <strong>Mode Pemula (Mudah)</strong>: Alokasi 20 detik/soal · Poin +100 XP
                        </span>
                      )}
                      {newGameForm.difficulty === 'Sedang' && (
                        <span className="text-amber-700 font-bold block">
                          ⭐ <strong>Mode Menengah (Sedang)</strong>: Alokasi 15 detik/soal · Poin +150 XP
                        </span>
                      )}
                      {newGameForm.difficulty === 'Sulit' && (
                        <span className="text-rose-700 font-bold block">
                          🔥 <strong>Mode Mahir (Sulit)</strong>: Alokasi 12 detik/soal · Poin +200 XP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji Icon Game</label>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {newGameForm.icon || '🎮'}
                    </div>
                    <input
                      type="text"
                      value={newGameForm.icon}
                      onChange={e => setNewGameForm(p => ({ ...p, icon: e.target.value }))}
                      placeholder="Ketik atau paste emoji kustom (misal: ⚽, 🚀, 🕌, 🏆)..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-2 flex-wrap text-sm bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 mr-1">Rekomendasi Cepat:</span>
                    {EMOJI_ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setNewGameForm(p => ({ ...p, icon: ic }))}
                        className={`w-7 h-7 rounded-lg hover:bg-white transition-all cursor-pointer flex items-center justify-center ${newGameForm.icon === ic ? 'bg-white shadow-2xs border border-emerald-400 scale-110' : ''}`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat Game</label>
                  <input
                    type="text"
                    value={newGameForm.desc}
                    onChange={e => setNewGameForm(p => ({ ...p, desc: e.target.value }))}
                    placeholder="cth: Asah pemahaman aljabar dan variabel sebelum waktu habis!"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Editor Soal / Pasangan Kartu */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Daftar {newGameForm.mode === 'match' || newGameForm.mode === 'memory' ? 'Pasangan Kartu' : 'Soal Game'} ({newGameForm.questions.length} Item)
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setNewGameForm(prev => {
                          const newQ = {
                            id: Date.now(),
                            question: prev.mode === 'match' ? 'Kata / Istilah Baru' : `Pertanyaan Soal Baru #${prev.questions.length + 1}`,
                            options: [prev.mode === 'match' ? 'Definisi / Pasangan Kartu' : 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'] as [string, string, string, string],
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
                      {newGameForm.mode === 'match' ? 'Tambah Pasangan Kartu' : 'Tambah Soal Baru'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newGameForm.questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-md">
                            {newGameForm.mode === 'match' ? `Pasangan #${idx + 1}` : `Soal #${idx + 1}`}
                          </span>
                          {newGameForm.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewGameForm(prev => ({
                                  ...prev,
                                  questions: prev.questions.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        {newGameForm.mode === 'match' || newGameForm.mode === 'memory' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kartu A (Istilah)</label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={e => {
                                  const val = e.target.value;
                                  setNewGameForm(prev => {
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
                                  setNewGameForm(prev => {
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
                                  setNewGameForm(prev => {
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
                                      name={`new-game-correct-${idx}`}
                                      checked={q.correct === optIdx}
                                      onChange={() => {
                                        setNewGameForm(prev => {
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
                                        setNewGameForm(prev => {
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
                  onClick={() => setShowCreateGameModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Publis Game Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Modul */}
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
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Lampiran Berkas Modul Pembelajaran</label>

                  <div className="flex items-center gap-1.5 mb-3 bg-slate-100 p-1 rounded-xl w-fit text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAttachmentMode('file')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        attachmentMode === 'file'
                          ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📁 Upload File (Maks 10MB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachmentMode('url')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        attachmentMode === 'url'
                          ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      🔗 Input Link / URL (&gt; 10MB)
                    </button>
                  </div>

                  {form.fileUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <BookOpen className="w-5 h-5 text-emerald-700 flex-shrink-0"/>
                      <span className="text-xs font-semibold text-emerald-950 truncate flex-1">{form.fileUrl}</span>
                      <button type="button" onClick={()=>set('fileUrl','')} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">Hapus</button>
                    </div>
                  ) : attachmentMode === 'url' ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={form.fileUrl}
                        onChange={e => set('fileUrl', e.target.value)}
                        placeholder="https://drive.google.com/... atau https://youtube.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-[11px] text-amber-800 font-medium bg-amber-50 border border-amber-200 p-2.5 rounded-xl leading-relaxed">
                        💡 <strong>Saran Berkas &gt; 10MB</strong>: Silakan upload video/PDF/PPT ke Google Drive, YouTube, atau Cloud Storage Anda, lalu tempelkan link tautannya di atas.
                      </p>
                    </div>
                  ) : (
                    <FileUpload
                      endpoint="materialFile"
                      label=""
                      hint="PDF, DOCX, PPTX, MP4 Video (Maksimal 10MB). Jika file > 10MB silakan gunakan opsi Link / URL di atas."
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

      {/* Modal Hapus Modul */}
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

      {/* Modal Hapus Game Pembelajaran */}
      {deleteGameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hapus Game Pembelajaran?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Apakah Anda yakin ingin menghapus game <span className="font-semibold text-slate-900">{deleteGameTarget.name}</span>? Data game dan skor siswa akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteGameTarget(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteGame}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Ya, Hapus Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kustomisasi / Edit Game */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{editingGame.icon}</span>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Pengaturan Game: {editingGame.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">Kelola nama, mapel, pertanyaan, pilihan jawaban, dan tingkat kesulitan</p>
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
              {/* Nama Game & Mapel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Game *</label>
                  <input
                    type="text"
                    value={editingGame.name}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame((prev: any) => prev ? { ...prev, name: val } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Pelajaran (Mapel) *</label>
                  <select
                    value={editingGame.subject}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame((prev: any) => prev ? { ...prev, subject: val } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Mode Game & Tingkat Kesulitan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode Game Mechanics *</label>
                  <select
                    value={editingGame.mode}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame((prev: any) => prev ? { ...prev, mode: val } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="speed">⚡ Math Blitz / Speed Quiz (Pilihan Ganda Cepat)</option>
                    <option value="match">🧩 Concept &amp; Word Match (Pasangan Kartu Istilah)</option>
                    <option value="adventure">☪️ Tajwid &amp; PAI Quest (Kuis Bertingkat &amp; Pembahasan)</option>
                    <option value="scramble">🔤 Word Scramble (Menyusun Huruf Acak Materi)</option>
                    <option value="memory">🧬 IPA &amp; Sains Memory Match (Mengingat Pasangan Kartu)</option>
                    <option value="quiz">🔭 Science &amp; General Quiz (Kuis Sains Penjelasan Rinci)</option>
                    <option value="timeline">📅 Sejarah &amp; Timeline (Urutan Peristiwa Sejarah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kesulitan *</label>
                  <select
                    value={editingGame.difficulty}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame((prev: any) => prev ? { ...prev, difficulty: val } : null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Mudah">🌱 Mudah (20 detik / soal · 100 XP)</option>
                    <option value="Sedang">⭐ Sedang (15 detik / soal · 150 XP)</option>
                    <option value="Sulit">🔥 Sulit (12 detik / soal · 200 XP)</option>
                  </select>
                  <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-medium leading-tight">
                    {editingGame.difficulty === 'Mudah' && (
                      <span className="text-emerald-700 font-bold block">
                        🌱 <strong>Mode Pemula (Mudah)</strong>: Alokasi 20 detik/soal · Poin +100 XP
                      </span>
                    )}
                    {editingGame.difficulty === 'Sedang' && (
                      <span className="text-amber-700 font-bold block">
                        ⭐ <strong>Mode Menengah (Sedang)</strong>: Alokasi 15 detik/soal · Poin +150 XP
                      </span>
                    )}
                    {editingGame.difficulty === 'Sulit' && (
                      <span className="text-rose-700 font-bold block">
                        🔥 <strong>Mode Mahir (Sulit)</strong>: Alokasi 12 detik/soal · Poin +200 XP
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Emoji Icon Game */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji Icon Game</label>
                <div className="flex items-center gap-2">
                  <div className="text-2xl w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {editingGame.icon || '🎮'}
                  </div>
                  <input
                    type="text"
                    value={editingGame.icon || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingGame((prev: any) => prev ? { ...prev, icon: val } : null);
                    }}
                    placeholder="Ketik atau paste emoji kustom (misal: ⚽, 🚀, 🕌, 🏆)..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap text-sm bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Rekomendasi Cepat:</span>
                  {EMOJI_ICONS.map(ic => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditingGame((prev: any) => prev ? { ...prev, icon: ic } : null)}
                      className={`w-6 h-6 rounded-md hover:bg-white transition-all cursor-pointer flex items-center justify-center text-xs ${editingGame.icon === ic ? 'bg-white shadow-2xs border border-emerald-400 scale-110' : ''}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Soal / Pasangan */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Daftar {editingGame.mode === 'match' || editingGame.mode === 'memory' ? 'Pasangan Kartu' : 'Soal Game'} ({editingGame.questions?.length || 0} Item)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGame((prev: any) => {
                        if (!prev) return null;
                        const isCard = prev.mode === 'match' || prev.mode === 'memory';
                        const newQ = {
                          id: Date.now(),
                          question: isCard ? 'Kata / Istilah Baru' : `Pertanyaan Soal Baru #${(prev.questions?.length || 0) + 1}`,
                          options: [isCard ? 'Definisi / Pasangan Kartu Baru' : 'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'] as [string, string, string, string],
                          correct: 0,
                          explanation: 'Penjelasan pembahasan...',
                          xpReward: 100,
                        };
                        return { ...prev, questions: [...(prev.questions || []), newQ] };
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {editingGame.mode === 'match' || editingGame.mode === 'memory' ? 'Tambah Pasangan Kartu' : 'Tambah Soal Baru'}
                  </button>
                </div>

                <div className="space-y-3">
                  {editingGame.questions?.map((q: any, idx: number) => (
                    <div key={q.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-md">
                          {editingGame.mode === 'match' || editingGame.mode === 'memory' ? `Pasangan #${idx + 1}` : `Soal #${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGame((prev: any) => {
                              if (!prev) return null;
                              return { ...prev, questions: prev.questions.filter((_: any, i: number) => i !== idx) };
                            });
                          }}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>

                      {editingGame.mode === 'match' || editingGame.mode === 'memory' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kartu A (Istilah)</label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingGame((prev: any) => {
                                  if (!prev) return null;
                                  const updated = prev.questions.map((item: any, i: number) => i === idx ? { ...item, question: val } : item);
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
                              value={q.options?.[0] || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingGame((prev: any) => {
                                  if (!prev) return null;
                                  const updated = prev.questions.map((item: any, i: number) => {
                                    if (i === idx) {
                                      const newOpts = [...(item.options || ['','','',''])] as [string, string, string, string];
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
                                setEditingGame((prev: any) => {
                                  if (!prev) return null;
                                  const updated = prev.questions.map((item: any, i: number) => i === idx ? { ...item, question: val } : item);
                                  return { ...prev, questions: updated };
                                });
                              }}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Opsi Pilihan Ganda (Pilih Kunci Jawaban Benar)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(q.options || ['','','','']).map((optVal: string, optIdx: number) => (
                                <div key={optIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                                  <input
                                    type="radio"
                                    name={`game-correct-${idx}`}
                                    checked={q.correct === optIdx}
                                    onChange={() => {
                                      setEditingGame((prev: any) => {
                                        if (!prev) return null;
                                        const updated = prev.questions.map((item: any, i: number) => i === idx ? { ...item, correct: optIdx } : item);
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
                                      setEditingGame((prev: any) => {
                                        if (!prev) return null;
                                        const updated = prev.questions.map((item: any, i: number) => {
                                          if (i === idx) {
                                            const newOpts = [...(item.options || ['','','',''])] as [string, string, string, string];
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
                  const slug = editingGame.slug || editingGame.id;
                  try {
                    await apiClient.put(`/elearning-games/${slug}`, {
                      name: editingGame.name,
                      icon: editingGame.icon,
                      subject: editingGame.subject,
                      difficulty: editingGame.difficulty,
                      mode: editingGame.mode,
                      questions: editingGame.questions,
                    });
                    toast.success('Game Diperbarui', `Game "${editingGame.name}" berhasil disimpan di Database.`);
                    fetchGamesFromDb();
                  } catch (e) {
                    toast.error('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan ke database.');
                  }
                  setEditingGame(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Simpan Perubahan Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Live Game Siswa (Render Component Siswa Langsung) */}
      {previewGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white text-slate-900 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{previewGame.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-sm">Preview: {previewGame.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {previewGame.subject}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingGame(previewGame);
                    setNewGameForm({
                      name: previewGame.name || '',
                      icon: previewGame.icon || '🎯',
                      subject: previewGame.subject || 'Matematika',
                      mode: previewGame.mode || 'quizizz',
                      difficulty: previewGame.difficulty || 'Sedang',
                      color: previewGame.color || 'from-amber-500 via-orange-600 to-rose-600',
                      desc: previewGame.desc || '',
                      questions: previewGame.questions || [],
                    });
                    setShowCreateGameModal(true);
                    setPreviewGame(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Settings className="w-3.5 h-3.5" /> Edit Soal
                </button>
                <button
                  onClick={() => setPreviewGame(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 overflow-y-auto max-h-[75vh] bg-slate-50 text-slate-900 rounded-b-2xl">
              {previewGame.slug === 'quizizz' || previewGame.id === 'quizizz' || previewGame.mode === 'quizizz' ? (
                <QuizizzGameArena gameData={previewGame} />
              ) : previewGame.slug === 'quiz-ipa' || previewGame.id === 'quiz-ipa' || previewGame.mode === 'quiz' ? (
                <ScienceQuizGame />
              ) : previewGame.slug === 'matematika' || previewGame.id === 'matematika' || previewGame.mode === 'speed' ? (
                <MathBlitzGame />
              ) : previewGame.slug === 'vocab' || previewGame.id === 'vocab' || previewGame.mode === 'match' ? (
                <WordMatchGame gameData={previewGame} />
              ) : previewGame.slug === 'tajwid' || previewGame.id === 'tajwid' || previewGame.mode === 'adventure' ? (
                <TajwidQuestGame gameData={previewGame} />
              ) : previewGame.slug === 'scramble' || previewGame.id === 'scramble' || previewGame.mode === 'scramble' ? (
                <WordScrambleGame />
              ) : previewGame.slug === 'memory' || previewGame.id === 'memory' || previewGame.mode === 'memory' ? (
                <MemoryMatchGame />
              ) : (
                <SejarahTimelineGame />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
