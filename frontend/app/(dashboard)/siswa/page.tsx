'use client';

import { useState } from 'react';
import { Trophy, CalendarDays, ClipboardList, BookOpen, QrCode, ArrowRight, Gamepad2, Sparkles, CheckCircle2, Clock, Zap, Play, Flame, Award, ChevronRight, X, RotateCcw, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, DAY_NAMES } from '@/lib/utils';

// Dummy Quiz Questions for Interactive Quick Challenge
const QUICK_QUIZ = [
  {
    id: 1,
    question: 'Berapakah nilai x dari persamaan aljabar: 3x + 9 = 24 ?',
    options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
    correct: 1, // index 1: x = 5
    explanation: '3x = 24 - 9 => 3x = 15 => x = 5',
  },
  {
    id: 2,
    question: 'Organel sel yang berfungsi sebagai pusat penghasil energi (powerhouse) adalah?',
    options: ['Ribosom', 'Kloroplas', 'Mitokondria', 'Badan Golgi'],
    correct: 2, // Mitokondria
    explanation: 'Mitokondria mengolah nutrisi menjadi energi ATP bagi sel.',
  },
  {
    id: 3,
    question: 'Manakah penulisan kata baku dalam Bahasa Indonesia yang benar?',
    options: ['Apotik', 'Apotek', 'Apotik', 'Apotekh'],
    correct: 1, // Apotek
    explanation: 'Menurut KBBI, kata baku yang tepat adalah "Apotek".',
  },
];

const SUBJECT_JOURNEY = [
  { id: 'mtk', name: 'Matematika 8A', topics: 12, completed: 9, percent: 75, color: 'from-emerald-600 to-teal-700', nextLesson: 'Bab 5 — Persamaan Aljabar Linear' },
  { id: 'ipa', name: 'IPA (Fisika & Biologi)', topics: 10, completed: 7, percent: 70, color: 'from-teal-600 to-cyan-700', nextLesson: 'Bab 4 — Fotosintesis & Klorofil Sel' },
  { id: 'bin', name: 'Bahasa Indonesia', topics: 8, completed: 8, percent: 100, color: 'from-blue-600 to-indigo-700', nextLesson: 'Selesai — Siap Ujian Akhir' },
  { id: 'bing', name: 'Bahasa Inggris', topics: 10, completed: 6, percent: 60, color: 'from-purple-600 to-pink-700', nextLesson: 'Unit 3 — Narrative Text & Grammar' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Siti Nurhaliza', xp: 2450, badge: '🥇 Juara 1', class: '8A' },
  { rank: 2, name: 'Fatimah Az-Zahra', xp: 2180, badge: '🥈 Juara 2', class: '8A' },
  { rank: 3, name: 'Ahmad Rizki Pratama (Kamu)', xp: 1950, badge: '🥉 Juara 3', class: '8A', isSelf: true },
  { rank: 4, name: 'Budi Permana', xp: 1820, badge: 'Top 5', class: '8A' },
  { rank: 5, name: 'Dewi Anggraini', xp: 1690, badge: 'Top 5', class: '8A' },
];

const TODAY_SCHEDULE = [
  { time: '07.00–08.40', subject: 'Matematika', teacher: 'Siti Rahayu, S.Pd.', room: 'Ruang 8A', status: 'Selesai' },
  { time: '08.40–10.20', subject: 'Bahasa Indonesia', teacher: 'Rina Widyawati, S.Pd.', room: 'Ruang 8A', status: 'Berlangsung' },
  { time: '10.35–12.15', subject: 'IPA (Fisika & Biologi)', teacher: 'Ahmad Fauzi, M.Pd.', room: 'Lab IPA', status: 'Akan Datang' },
];

export default function SiswaDashboard() {
  const { user } = useAuth();
  const studentName = user?.student?.fullName || 'Ahmad Rizki Pratama';

  // Gamification & Quiz state
  const [userXp, setUserXp] = useState(1950);
  const [streakDays, setStreakDays] = useState(7);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const dayName = DAY_NAMES[new Date().getDay()] || 'Hari ini';

  // Handle quiz option click
  const handleAnswerSelect = (index: number) => {
    if (selectedAns !== null) return; // Prevent changing answer
    setSelectedAns(index);

    const q = QUICK_QUIZ[currentQIndex];
    if (index === q.correct) {
      setQuizScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < QUICK_QUIZ.length) {
      setCurrentQIndex(i => i + 1);
      setSelectedAns(null);
    } else {
      // Finished quiz
      setQuizCompleted(true);
      const earnedXp = quizScore * 50 + 50;
      setUserXp(prev => prev + earnedXp);
    }
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedAns(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowQuizModal(false);
  };

  return (
    <div className="space-y-6">

      {/* Ruangguru Gamified Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-emerald-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-2xs">
                <Flame className="w-4 h-4 fill-amber-950 text-amber-950" /> {streakDays} Hari Streak Belajar!
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-xs font-extrabold text-emerald-200 backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-amber-300" /> {userXp.toLocaleString('id-ID')} XP
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white border border-white/15">
                🏫 Kelas 8A SMP Darul Ulum
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Ruang Belajar Siswa — {studentName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl">
              Tingkatkan XP kamu dengan menyelesaikan tantangan kuis harian &amp; simak modul E-Learning interaktif!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => { resetQuiz(); setShowQuizModal(true); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-all shadow-md hover:scale-105"
            >
              <Zap className="w-4 h-4 text-amber-950 fill-amber-950" /> Tantangan Kuis Harian (+50 XP)
            </button>
            <Link href="/siswa/elearning" className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 font-extrabold text-xs transition-all shadow-xs">
              <Gamepad2 className="w-4 h-4 text-emerald-700" /> Game E-Learning
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Quick Quiz Challenge */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <div>
                  <h2 className="font-black text-slate-900 text-base">Tantangan Kuis Harian</h2>
                  <p className="text-[11px] font-bold text-slate-500">Soal {currentQIndex + 1} dari {QUICK_QUIZ.length}</p>
                </div>
              </div>
              <button onClick={() => setShowQuizModal(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!quizCompleted ? (
              <div className="p-6 space-y-5">
                {/* Progress bar */}
                <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100">
                  <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${((currentQIndex + 1) / QUICK_QUIZ.length) * 100}%` }} />
                </div>

                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                  <p className="font-extrabold text-sm text-slate-900 leading-snug">
                    {QUICK_QUIZ[currentQIndex].question}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {QUICK_QUIZ[currentQIndex].options.map((opt, idx) => {
                    const isSelected = selectedAns === idx;
                    const isCorrect = idx === QUICK_QUIZ[currentQIndex].correct;
                    let btnStyle = 'bg-white border-emerald-200 text-slate-800 hover:bg-emerald-50';

                    if (selectedAns !== null) {
                      if (isCorrect) btnStyle = 'bg-emerald-600 text-white border-emerald-600 font-extrabold';
                      else if (isSelected) btnStyle = 'bg-rose-500 text-white border-rose-500 font-extrabold';
                      else btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={selectedAns !== null}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between shadow-2xs ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedAns !== null && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>

                {selectedAns !== null && (
                  <div className="p-4 bg-emerald-100/70 border border-emerald-200 rounded-2xl space-y-3">
                    <p className="text-xs font-bold text-emerald-950">
                      💡 <strong>Penjelasan:</strong> {QUICK_QUIZ[currentQIndex].explanation}
                    </p>
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-all"
                    >
                      {currentQIndex + 1 < QUICK_QUIZ.length ? 'Lanjut ke Soal Berikutnya →' : 'Lihat Hasil Kuis ✨'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Kuis Selesai! 🎉</h3>
                <p className="text-xs font-bold text-slate-600">
                  Kamu menjawab <strong className="text-emerald-700">{quizScore}</strong> dari {QUICK_QUIZ.length} soal dengan benar!
                </p>
                <div className="inline-block px-4 py-2 rounded-2xl bg-amber-400 text-amber-950 font-black text-sm shadow-2xs">
                  +{(quizScore * 50 + 50)} XP Ditambahkan!
                </div>
                <button
                  onClick={resetQuiz}
                  className="block w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-all"
                >
                  Tutup &amp; Kembali ke Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RuangBelajar Subject Journey Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900 text-base">Progress RuangBelajar Mata Pelajaran</h2>
          </div>
          <Link href="/siswa/materi" className="text-xs font-extrabold text-emerald-700 hover:underline">
            Semua Materi →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUBJECT_JOURNEY.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl border border-emerald-100 p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {s.completed}/{s.topics} Topik
                  </span>
                  <span className="text-xs font-black text-emerald-800">{s.percent}%</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">{s.name}</h3>
                <p className="text-xs text-slate-500 font-semibold line-clamp-1">{s.nextLesson}</p>
              </div>

              <div>
                <div className="h-2 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100 mb-3">
                  <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${s.percent}%` }} />
                </div>

                <Link
                  href="/siswa/materi"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold transition-all border border-emerald-200 shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-800" /> Lanjutkan Belajar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Leaderboard & Schedule Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Papan Peringkat (Leaderboard) */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/40">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-extrabold text-slate-900 text-sm">Papan Peringkat Kelas 8A</h2>
              </div>
              <span className="text-xs font-extrabold text-emerald-700">Top 5</span>
            </div>

            <div className="divide-y divide-emerald-50">
              {LEADERBOARD.map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-center justify-between px-6 py-3.5 transition-colors ${
                    item.isSelf ? 'bg-amber-50/80 font-extrabold border-l-4 border-amber-400' : 'hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-xs font-black shrink-0">
                      {item.rank}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{item.name}</p>
                      <p className="text-[11px] font-semibold text-slate-400">{item.badge}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                    {item.xp.toLocaleString('id-ID')} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/20 border-t border-emerald-50 text-center">
            <span className="text-xs font-bold text-slate-500">Peringkat diperbarui secara otomatis setiap hari</span>
          </div>
        </div>

        {/* Jadwal Pelajaran Hari Ini */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/40">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-emerald-700" />
                <h2 className="font-extrabold text-slate-900 text-sm">Jadwal Pelajaran — {dayName}</h2>
              </div>
              <Link href="/siswa/jadwal" className="text-xs font-extrabold text-emerald-700 hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-emerald-50">
              {TODAY_SCHEDULE.map((s, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-emerald-50/30 transition-colors">
                  <div className="text-center w-24 flex-shrink-0">
                    <p className="text-xs font-mono font-extrabold text-slate-900">{s.time.split('–')[0]}</p>
                    <p className="text-[11px] font-mono text-slate-400 font-semibold">–{s.time.split('–')[1]}</p>
                  </div>

                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${s.status === 'Berlangsung' ? 'bg-emerald-600 animate-pulse' : s.status === 'Selesai' ? 'bg-slate-300' : 'bg-teal-400'}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{s.subject}</p>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.status === 'Berlangsung' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.teacher} · <span className="text-emerald-700 font-bold">{s.room}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-emerald-50 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Apel Pagi Pukul 06.30 WIB</span>
            <Link href="/siswa/jadwal" className="text-emerald-700 font-extrabold hover:underline">
              Jadwal Lengkap →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
