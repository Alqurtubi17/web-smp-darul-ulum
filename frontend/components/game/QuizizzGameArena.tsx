'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  QrCode, Users, Flame, Zap, Trophy, Timer, Shield, Volume2, VolumeX,
  Share2, Play, CheckCircle2, XCircle, ArrowRight, RotateCcw, UserCheck,
  UserCheck2, Copy, Check, LogIn, ChevronLeft, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toast.store';
import apiClient from '@/lib/api';
import { QRCodeImage } from '@/components/ui/QRCodeImage';

// ─── AVATAR OPTIONS FOR GUESTS ────────────────────────────────────────────────
const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Singa' },
  { id: 'rocket', emoji: '🚀', name: 'Roket' },
  { id: 'blitz', emoji: '⚡', name: 'Petir' },
  { id: 'owl', emoji: '🦉', name: 'Hantu' },
  { id: 'king', emoji: '👑', name: 'Raja' },
  { id: 'target', emoji: '🎯', name: 'Target' },
  { id: 'fire', emoji: '🔥', name: 'Api' },
  { id: 'champ', emoji: '🏆', name: 'Juara' },
];

// ─── DEFAULT QUESTION SETS FOR QUIZIZZ ARENA ──────────────────────────────────
export const DEFAULT_QUIZ_SETS = [
  {
    id: 'matematika',
    title: 'Matematika Blitz & Aljabar',
    subject: 'Matematika',
    icon: '📐',
    questions: [
      {
        question: 'Berapakah nilai x dari persamaan aljabar: 3x - 9 = 12 ?',
        options: ['x = 5', 'x = 7', 'x = 9', 'x = 3'],
        correct: 1,
        explanation: '3x = 12 + 9 => 3x = 21 => x = 7',
        points: 200,
      },
      {
        question: 'Sebuah persegi memiliki keliling 48 cm. Berapakah luas persegi tersebut?',
        options: ['121 cm²', '144 cm²', '100 cm²', '169 cm²'],
        correct: 1,
        explanation: 'Sisi = 48 / 4 = 12 cm. Luas = 12 × 12 = 144 cm²',
        points: 250,
      },
      {
        question: 'Hasil pengerjaan dari (-15) × 4 + 75 ÷ (-5) adalah...',
        options: ['-75', '-45', '-60', '-30'],
        correct: 0,
        explanation: '(-15 × 4) + (75 ÷ -5) = (-60) + (-15) = -75',
        points: 250,
      },
    ],
  },
  {
    id: 'ipa',
    title: 'IPA Sains & Biologi Terpadu',
    subject: 'IPA',
    icon: '🔬',
    questions: [
      {
        question: 'Bagian sel tumbuhan yang berfungsi sebagai tempat terjadinya fotosintesis adalah...',
        options: ['Mitokondria', 'Kloroplas', 'Ribosom', 'Badan Golgi'],
        correct: 1,
        explanation: 'Kloroplas mengandung klorofil untuk menyerap energi cahaya pada fotosintesis.',
        points: 200,
      },
    ],
  },
];

interface QuizizzGameProps {
  initialPin?: string;
  gameData?: any;
}

export function QuizizzGameArena({ initialPin, gameData }: QuizizzGameProps) {
  const { user } = useAuth();

  const generateRandomPin = () => String(Math.floor(100000 + Math.random() * 900000));
  
  const [pin, setPin] = useState(() => initialPin || generateRandomPin());
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [userMode, setUserMode] = useState<'student' | 'guest'>('student');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const activeQuizSets = useMemo(() => {
    if (gameData?.questions && Array.isArray(gameData.questions) && gameData.questions.length > 0) {
      return [{
        id: gameData.id || 'custom-game',
        title: gameData.name || gameData.title || 'Soal Pembelajaran',
        subject: gameData.subject || 'Umum',
        icon: gameData.icon || '🎯',
        questions: gameData.questions.map((q: any) => ({
          question: q.question,
          options: q.options || ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'],
          correct: q.correct !== undefined ? q.correct : 0,
          explanation: q.explanation || 'Pembahasan kunci jawaban.',
          points: q.xpReward || 150,
        })),
      }];
    }
    return DEFAULT_QUIZ_SETS;
  }, [gameData]);

  const [selectedSetId, setSelectedSetId] = useState(activeQuizSets[0].id);

  // Game Engine States
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'question_result' | 'podium'>('lobby');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Power-ups State
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [doublePoinUsed, setDoublePoinUsed] = useState(false);
  const [timeFreezeUsed, setTimeFreezeUsed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [isDoubleActive, setIsDoubleActive] = useState(false);

  // User details
  const playerName = useMemo(() => {
    if (userMode === 'student' && user) {
      return (user as any)?.student?.fullName || user.email?.split('@')[0] || 'Siswa SMP';
    }
    return nickname || 'Tamu';
  }, [userMode, user, nickname]);

  const playerAvatar = useMemo(() => {
    if (userMode === 'student') return '🎓';
    return selectedAvatar.emoji;
  }, [userMode, selectedAvatar]);

  const currentSet = useMemo(() => {
    return activeQuizSets.find(s => s.id === selectedSetId) || activeQuizSets[0];
  }, [activeQuizSets, selectedSetId]);

  const currentQuestion = currentSet.questions[currentQIndex];

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; avatar: string; score: number; streak: number; rank: number }>>([]);

  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/game/quizizz?pin=${pin}`;
    }
    return `https://smpdarululum.sch.id/game/quizizz?pin=${pin}`;
  }, [pin]);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&color=047857&format=svg`;

  const handleRegeneratePin = () => {
    const newPin = generateRandomPin();
    setPin(newPin);
    toast.success('PIN Diperbarui', `Kode PIN baru: ${newPin}`);
  };

  // Start Game
  const handleStartGame = () => {
    if (userMode === 'guest' && !nickname.trim()) {
      toast.warning('Nama Belum Diisi', 'Silakan masukkan nama Anda terlebih dahulu.');
      return;
    }

    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCurrentQIndex(0);
    setFiftyFiftyUsed(false);
    setDoublePoinUsed(false);
    setTimeFreezeUsed(false);
    setEliminatedOptions([]);
    setIsDoubleActive(false);
    setSelectedOption(null);
    setTimeLeft(20);

    setGameState('playing');

    setLeaderboard([
      { name: playerName, avatar: playerAvatar, score: 0, streak: 0, rank: 1 },
      { name: 'Ahmad Rizki', avatar: '⚡', score: 180, streak: 2, rank: 2 },
      { name: 'Siti Nur Aisyah', avatar: '👑', score: 150, streak: 1, rank: 3 },
      { name: 'Budi Permana', avatar: '🚀', score: 120, streak: 0, rank: 4 },
    ]);
  };

  // Countdown Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      handleSelectOption(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Answer Choice Handler
  const handleSelectOption = useCallback((optionIdx: number) => {
    if (selectedOption !== null || gameState !== 'playing') return;

    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.correct;

    let addedScore = 0;
    if (isCorrect) {
      const speedMultiplier = Math.max(1, Math.round((timeLeft / 20) * 100));
      const basePoints = currentQuestion.points || 150;
      const currentStreak = streak + 1;
      const streakBonus = Math.round(basePoints * (currentStreak * 0.15));

      addedScore = basePoints + speedMultiplier + streakBonus;
      if (isDoubleActive) addedScore *= 2;

      setScore(prev => prev + addedScore);
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });

      toast.success('Jawaban Benar', `+${addedScore} XP (${isDoubleActive ? '2x Poin' : `Streak ${streak + 1}x`})`);
    } else {
      setStreak(0);
      toast.error('Jawaban Salah', `Kunci jawaban: ${currentQuestion.options[currentQuestion.correct]}`);
    }

    setIsDoubleActive(false);

    setLeaderboard(prev => {
      const updated = prev.map(p => {
        if (p.name === playerName) {
          const newScore = p.score + addedScore;
          const newStreak = isCorrect ? p.streak + 1 : 0;
          return { ...p, score: newScore, streak: newStreak };
        }
        const botBonus = Math.floor(Math.random() * 120);
        return { ...p, score: p.score + botBonus };
      });

      return updated.sort((a, b) => b.score - a.score).map((p, idx) => ({ ...p, rank: idx + 1 }));
    });

    setGameState('question_result');
  }, [selectedOption, gameState, currentQuestion, timeLeft, streak, maxStreak, isDoubleActive, playerName]);

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < currentSet.questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setEliminatedOptions([]);
      setTimeLeft(20);
      setGameState('playing');
    } else {
      setGameState('podium');
      apiClient.post(`/elearning-games/${currentSet.id || 'quizizz'}/score`, {
        score: score,
        studentName: playerName,
      }).catch(() => {});
    }
  };

  const handleUse5050 = () => {
    if (fiftyFiftyUsed || gameState !== 'playing') return;
    setFiftyFiftyUsed(true);

    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== currentQuestion.correct);
    const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(toEliminate);
    toast.info('Power-Up 50:50', '2 pilihan salah dihilangkan.');
  };

  const handleUseDoublePoin = () => {
    if (doublePoinUsed || gameState !== 'playing') return;
    setDoublePoinUsed(true);
    setIsDoubleActive(true);
    toast.info('Power-Up Double Poin', 'Skor dikalikan 2x.');
  };

  const handleUseTimeFreeze = () => {
    if (timeFreezeUsed || gameState !== 'playing') return;
    setTimeFreezeUsed(true);
    setTimeLeft(prev => prev + 10);
    toast.info('Power-Up Waktu', '+10 detik ditambahkan.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Tautan Disalin', 'Tautan game berhasil disalin.');
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans flex flex-col justify-start rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
      {/* ─── TOP NAVBAR ARENA ─────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white px-4 py-2.5 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/siswa/elearning"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Kembali"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase tracking-wide">
                  QUIZIZZ LIVE
                </span>
                <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  PIN: {pin}
                </span>
              </div>
              <h1 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5 truncate max-w-xs">
                {currentSet.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" /> <span className="hidden sm:inline">QR Code</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? 'Matikan Suara' : 'Aktifkan Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ARENA (PROPORTIONAL SPACING) ────────────────────────── */}
      <main className="max-w-3xl w-full mx-auto p-3.5 sm:p-5 flex flex-col justify-start">

        {/* ══════════════════════════════════════════════════════════════════════
            1. LOBBY STATE (COMPACT & PROPORTIONAL)
           ══════════════════════════════════════════════════════════════════════ */}
        {gameState === 'lobby' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Quizizz Live Arena
              </h2>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                Scan QR Code atau gunakan PIN 6-digit untuk bergabung.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5 items-start">
              {/* Left Box: Identity */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-2xs">
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Identitas Pemain
                  </h3>

                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setUserMode('student')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        userMode === 'student'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Akun Siswa
                    </button>
                    <button
                      onClick={() => setUserMode('guest')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        userMode === 'guest'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck2 className="w-3.5 h-3.5" /> Tamu
                    </button>
                  </div>
                </div>

                {userMode === 'student' ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-2xs">
                        🎓
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{playerName}</p>
                        <p className="text-[11px] text-emerald-800 font-medium">
                          {user ? `NIS: ${(user as any)?.student?.nis || '2026001'}` : 'Siswa SMP'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Tamu *</label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        placeholder="Masukkan nama..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Avatar</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {AVATARS.map(av => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av)}
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                              selectedAvatar.id === av.id
                                ? 'bg-amber-100 border-amber-400 text-lg scale-105 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-base hover:bg-slate-100'
                            }`}
                            title={av.name}
                          >
                            {av.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Topik Soal</label>
                  <div className="space-y-1.5">
                    {activeQuizSets.map(set => (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => setSelectedSetId(set.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedSetId === set.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{set.icon}</span>
                          <div>
                            <p className="font-bold text-xs text-slate-900">{set.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{set.questions.length} Soal · {set.subject}</p>
                          </div>
                        </div>
                        {selectedSetId === set.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Box: PIN & QR */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      PIN &amp; QR Code
                    </h3>
                    <button
                      onClick={handleRegeneratePin}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                      title="Acak PIN"
                    >
                      <RefreshCw className="w-3 h-3 text-emerald-600" /> Acak PIN
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">KODE PIN GAME</p>
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-36 text-center text-2xl font-mono font-black tracking-widest px-2 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 border border-slate-200">
                      <QRCodeImage text={shareUrl} size={120} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">QR Code Permainan</p>
                      <p className="text-[10px] text-slate-500">Scan untuk bergabung</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Salin Tautan"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Mulai Permainan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            2. PLAYING STATE (COMPACT & PROPORTIONAL)
           ══════════════════════════════════════════════════════════════════════ */}
        {(gameState === 'playing' || gameState === 'question_result') && currentQuestion && (
          <div className="space-y-3.5">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">{playerAvatar}</span>
                <div>
                  <p className="font-bold text-xs text-slate-900 truncate max-w-[120px]">{playerName}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">Peringkat #{leaderboard.find(p => p.name === playerName)?.rank || 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${
                  timeLeft <= 5
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  <Timer className="w-3.5 h-3.5 text-emerald-600" /> {timeLeft}s
                </div>

                {streak > 1 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-600" /> {streak}x
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold">XP</p>
                <p className="text-sm font-black text-amber-600">{score.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Timer Bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>

            {/* Booster Buttons */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleUse5050}
                disabled={fiftyFiftyUsed || gameState !== 'playing'}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  fiftyFiftyUsed
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 cursor-pointer shadow-2xs'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" /> 50:50
              </button>

              <button
                onClick={handleUseDoublePoin}
                disabled={doublePoinUsed || gameState !== 'playing'}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  doublePoinUsed
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 cursor-pointer shadow-2xs'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" /> 2x Poin
              </button>

              <button
                onClick={handleUseTimeFreeze}
                disabled={timeFreezeUsed || gameState !== 'playing'}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  timeFreezeUsed
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-teal-50 border-teal-200 text-teal-900 hover:bg-teal-100 cursor-pointer shadow-2xs'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-teal-600" /> +10s
              </button>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 pb-2.5">
                <span className="text-emerald-700">Soal #{currentQIndex + 1} dari {currentSet.questions.length}</span>
                <span className="truncate max-w-[150px]">{currentSet.title}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* 4 Answer Tiles */}
              <div className="grid sm:grid-cols-2 gap-2.5">
                {currentQuestion.options.map((opt: string, idx: number) => {
                  const isEliminated = eliminatedOptions.includes(idx);
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correct;
                  const isResultPhase = gameState === 'question_result';

                  let tileStyle = 'bg-white border-slate-200 text-slate-900';
                  const COLORS = [
                    'bg-purple-50/80 border-purple-200 text-purple-950 hover:bg-purple-100',
                    'bg-blue-50/80 border-blue-200 text-blue-950 hover:bg-blue-100',
                    'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-100',
                    'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:bg-emerald-100',
                  ];

                  if (!isResultPhase && !isEliminated) {
                    tileStyle = COLORS[idx % 4];
                  }

                  if (isEliminated) {
                    tileStyle = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-30';
                  }

                  if (isResultPhase) {
                    if (isCorrect) {
                      tileStyle = 'bg-emerald-600 border-emerald-700 text-white font-bold shadow-2xs';
                    } else if (isSelected && !isCorrect) {
                      tileStyle = 'bg-rose-600 border-rose-700 text-white font-bold opacity-90';
                    } else {
                      tileStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isEliminated || gameState !== 'playing'}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${tileStyle}`}
                    >
                      <span>{opt}</span>
                      {isResultPhase && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                      {isResultPhase && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {gameState === 'question_result' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-800">Pembahasan Jawaban</p>
                    <button
                      onClick={handleNextQuestion}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Lanjut <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            3. PODIUM / VICTORY CELEBRATION STATE
           ══════════════════════════════════════════════════════════════════════ */}
        {gameState === 'podium' && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-2xl shadow-2xs mx-auto">
              🏆
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Permainan Selesai</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Seluruh soal telah selesai dikerjakan.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold">TOTAL XP</p>
                <p className="text-base font-bold text-amber-600 mt-0.5">{score.toLocaleString('id-ID')}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold">STREAK</p>
                <p className="text-base font-bold text-emerald-600 mt-0.5">{maxStreak}x</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold">RANK</p>
                <p className="text-base font-bold text-teal-600 mt-0.5">#{leaderboard.find(p => p.name === playerName)?.rank || 1}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 max-w-md mx-auto space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                Papan Peringkat
              </h3>
              <div className="divide-y divide-slate-100">
                {leaderboard.slice(0, 5).map((player, idx) => (
                  <div key={idx} className={`py-2 px-2.5 flex items-center justify-between rounded-lg ${player.name === playerName ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-amber-600 w-4">#{idx + 1}</span>
                      <span className="text-base">{player.avatar}</span>
                      <span className="font-bold text-xs text-slate-900">{player.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-amber-600">{player.score} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setGameState('lobby')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Main Lagi
              </button>
              <Link
                href="/siswa/elearning"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Kembali ke E-Learning
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL QR CODE POPUP ─────────────────────────────────────────────── */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 max-w-xs w-full text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-xs text-slate-900">QR Code Permainan</h3>
              <button onClick={() => setIsQrOpen(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer">
                Tutup ✕
              </button>
            </div>

            <div className="w-48 h-48 bg-white p-2 rounded-xl mx-auto flex items-center justify-center border border-slate-200">
              <QRCodeImage text={shareUrl} size={250} />
            </div>

            <div>
              <p className="font-mono font-bold text-emerald-800 text-base">PIN: {pin}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Scan QR di atas untuk bergabung.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRegeneratePin}
                className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600" /> Acak PIN
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3" /> Salin Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
