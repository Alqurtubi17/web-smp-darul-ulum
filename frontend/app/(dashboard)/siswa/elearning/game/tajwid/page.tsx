'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Timer, Zap, Heart, Trophy, RotateCcw, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

import apiClient from '@/lib/api';

type Difficulty = 'mudah' | 'sedang' | 'sulit';
type GamePhase = 'menu' | 'playing' | 'result';

interface Question {
  verse: string;
  highlight: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  points: number;
}

const TAJWID_QUESTIONS: Record<Difficulty, Question[]> = {
  mudah: [
    {
      verse: 'مِنْ خَوْفٍ',
      highlight: 'نْ خ',
      question: 'Hukum bacaan Nun Sukun (نْ) bertemu dengan huruf Kho (خ) adalah...',
      options: ['Izhar Halqi', 'Idgham Bighunnah', 'Ikhfa Hakiki', 'Iqlab'],
      answer: 'Izhar Halqi',
      explanation: 'Izhar Halqi terjadi jika Nun Sukun / Tanwin bertemu 6 huruf halq: ء, هـ, ع, ح, غ, خ. Dibaca jelas tanpa dengung.',
      points: 100,
    },
    {
      verse: 'مَنْ يَّعْمَلْ',
      highlight: 'نْ يَّ',
      question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ya (ي) adalah...',
      options: ['Idgham Bighunnah', 'Idgham Bilaghunnah', 'Izhar Syafawi', 'Ikhfa Hakiki'],
      answer: 'Idgham Bighunnah',
      explanation: 'Idgham Bighunnah terjadi jika Nun Sukun/Tanwin bertemu huruf ي, ن, م, و. Dibaca melebur disertai dengung.',
      points: 100,
    },
    {
      verse: 'مِنْ رَّبِّهِمْ',
      highlight: 'نْ رَّ',
      question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ra (ر) adalah...',
      options: ['Idgham Bilaghunnah', 'Idgham Bighunnah', 'Iqlab', 'Izhar Halqi'],
      answer: 'Idgham Bilaghunnah',
      explanation: 'Idgham Bilaghunnah terjadi jika Nun Sukun/Tanwin bertemu huruf ل atau ر. Dibaca melebur tanpa dengung.',
      points: 100,
    },
    {
      verse: 'مِنْ بَعْدِ',
      highlight: 'نْ ب',
      question: 'Hukum bacaan Nun Sukun (نْ) bertemu Ba (ب) adalah...',
      options: ['Iqlab', 'Ikhfa Hakiki', 'Izhar Halqi', 'Idgham Bighunnah'],
      answer: 'Iqlab',
      explanation: 'Iqlab terjadi jika Nun Sukun/Tanwin bertemu huruf Ba (ب). Suara nun diganti menjadi Mim (م) disertai dengung.',
      points: 100,
    },
    {
      verse: 'مِنْ قَبْلِ',
      highlight: 'نْ ق',
      question: 'Hukum bacaan Nun Sukun (نْ) bertemu Qaf (ق) adalah...',
      options: ['Ikhfa Hakiki', 'Izhar Halqi', 'Idgham Bilaghunnah', 'Iqlab'],
      answer: 'Ikhfa Hakiki',
      explanation: 'Ikhfa Hakiki terjadi jika Nun Sukun/Tanwin bertemu 15 huruf ikhfa. Dibaca samar-samar dengan dengung.',
      points: 100,
    },
  ],
  sedang: [
    {
      verse: 'لَهُمْ مَّا يَشَاءُونَ',
      highlight: 'مْ مَّ',
      question: 'Hukum Mim Sukun (مْ) bertemu dengan Mim (م) adalah...',
      options: ['Idgham Mimi (Mitsli)', 'Ikhfa Syafawi', 'Izhar Syafawi', 'Izhar Halqi'],
      answer: 'Idgham Mimi (Mitsli)',
      explanation: 'Idgham Mimi terjadi apabila Mim Sukun bertemu huruf Mim. Dibaca melebur dengan dengung.',
      points: 150,
    },
    {
      verse: 'تَرْمِيهِمْ بِحِجَارَةٍ',
      highlight: 'مْ ب',
      question: 'Hukum Mim Sukun (مْ) bertemu dengan Ba (ب) adalah...',
      options: ['Ikhfa Syafawi', 'Izhar Syafawi', 'Idgham Mimi', 'Iqlab'],
      answer: 'Ikhfa Syafawi',
      explanation: 'Ikhfa Syafawi terjadi apabila Mim Sukun bertemu huruf Ba (ب). Dibaca samar bibir rapat disertai dengung.',
      points: 150,
    },
    {
      verse: 'أَلَمْ تَرَ كَيْفَ',
      highlight: 'مْ ت',
      question: 'Hukum Mim Sukun (مْ) bertemu Ta (ت) adalah...',
      options: ['Izhar Syafawi', 'Ikhfa Syafawi', 'Idgham Bighunnah', 'Iqlab'],
      answer: 'Izhar Syafawi',
      explanation: 'Izhar Syafawi terjadi apabila Mim Sukun bertemu selain huruf Mim dan Ba. Dibaca jelas tanpa dengung.',
      points: 150,
    },
    {
      verse: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      highlight: 'أَحَدٌ',
      question: 'Berapakah jumlah rukun Islam dan rukun Iman secara berturut-turut?',
      options: ['5 dan 6', '6 dan 5', '5 dan 5', '6 dan 6'],
      answer: '5 dan 6',
      explanation: 'Rukun Islam ada 5 perkara dan Rukun Iman ada 6 perkara.',
      points: 150,
    },
  ],
  sulit: [
    {
      verse: 'وَالسَّمَاءِ وَالطَّارِقِ',
      highlight: 'السَّمَاءِ',
      question: 'Hukum Mad pada kata وَالسَّمَاءِ (Hamzah dalam satu kata) adalah...',
      options: ['Mad Wajib Muttashil', 'Mad Jaiz Munfashil', 'Mad Arid Lissukun', 'Mad Badal'],
      answer: 'Mad Wajib Muttashil',
      explanation: 'Mad Wajib Muttashil terjadi jika Mad Thabi’i bertemu Hamzah dalam satu kata. Panjangnya 4-5 harakat.',
      points: 200,
    },
    {
      verse: 'بِمَا أُنْزِلَ إِلَيْكَ',
      highlight: 'بِمَا أُ',
      question: 'Hukum Mad pada بِمَا أُنْزِلَ (Mad Thabi’i bertemu Hamzah di lain kata) adalah...',
      options: ['Mad Jaiz Munfashil', 'Mad Wajib Muttashil', 'Mad Iwadh', 'Mad Shilah'],
      answer: 'Mad Jaiz Munfashil',
      explanation: 'Mad Jaiz Munfashil terjadi jika Mad Thabi’i bertemu Hamzah di kata terpisah. Panjangnya 2, 4, atau 5 harakat.',
      points: 200,
    },
    {
      verse: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      highlight: 'الْعَالَمِينَ',
      question: 'Panjang hukum bacaan Mad Arid Lissukun di akhir ayat di atas adalah...',
      options: ['2, 4, atau 6 Harakat', '1 Harakat saja', '8 Harakat', '3 Harakat saja'],
      answer: '2, 4, atau 6 Harakat',
      explanation: 'Mad Arid Lissukun terjadi jika Mad Thabi’i diiringi huruf hidup yang diwaqafkan (diberhentikan). Boleh 2, 4, atau 6 harakat.',
      points: 200,
    },
  ]
};

export default function TajwidQuestGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('sedang');
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);

  const currentQuestion = questionList[questionIndex];
  const TOTAL_ROUNDS = questionList.length || 5;

  useEffect(() => {
    apiClient.get('/elearning-games/tajwid')
      .then(res => {
        const gameData = res.data?.data;
        if (gameData && gameData.questions?.length > 0) {
          const customMapped: Question[] = gameData.questions.map((q: any) => ({
            verse: q.explanation || 'القرآن الكريم',
            highlight: 'Tajwid',
            question: q.question,
            options: q.options || ['Izhar Halqi', 'Idgham Bighunnah', 'Ikhfa Hakiki', 'Iqlab'],
            answer: q.options?.[q.correct] || q.options?.[0] || 'Izhar Halqi',
            explanation: q.explanation || 'Pembahasan Tajwid dari Database Guru',
            points: q.xpReward || 100,
          }));
          TAJWID_QUESTIONS.mudah = customMapped;
          TAJWID_QUESTIONS.sedang = customMapped;
          TAJWID_QUESTIONS.sulit = customMapped;
        }
      })
      .catch(() => {});
  }, []);

  const startGame = () => {
    const list = [...TAJWID_QUESTIONS[difficulty]].sort(() => Math.random() - 0.5);
    setQuestionList(list);
    setQuestionIndex(0);
    setPhase('playing');
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setCorrect(0);
    setSelected(null);
    setShowResult(false);
    setTimeLeft(difficulty === 'mudah' ? 20 : difficulty === 'sedang' ? 15 : 12);
  };

  useEffect(() => {
    if (phase !== 'playing' || showResult) return;
    if (timeLeft <= 0) {
      setShowResult(true);
      setSelected('__timeout__');
      setLives(l => {
        const nl = l - 1;
        if (nl <= 0) setTimeout(() => setPhase('result'), 1600);
        return nl;
      });
      setStreak(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, showResult]);

  const handleAnswer = (opt: string) => {
    if (showResult || !currentQuestion) return;
    setSelected(opt);
    setShowResult(true);
    const isCorrect = opt === currentQuestion.answer;
    if (isCorrect) {
      const bonus = streak >= 3 ? 1.5 : streak >= 1 ? 1.2 : 1;
      const pts = Math.round(currentQuestion.points * bonus);
      setScore(s => s + pts);
      setStreak(s => { const ns = s + 1; setMaxStreak(m => Math.max(m, ns)); return ns; });
      setCorrect(c => c + 1);
    } else {
      setStreak(0);
      setLives(l => {
        const nl = l - 1;
        if (nl <= 0) setTimeout(() => setPhase('result'), 1600);
        return nl;
      });
    }

    if (questionIndex + 1 >= TOTAL_ROUNDS) {
      setTimeout(() => setPhase('result'), 1800);
    } else {
      setTimeout(() => {
        setQuestionIndex(i => i + 1);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(difficulty === 'mudah' ? 20 : difficulty === 'sedang' ? 15 : 12);
      }, 1800);
    }
  };

  const timerColor = timeLeft > 8 ? 'text-emerald-600' : timeLeft > 4 ? 'text-amber-500' : 'text-rose-600 animate-pulse';
  const timerBg = timeLeft > 8 ? 'bg-emerald-500' : timeLeft > 4 ? 'bg-amber-500' : 'bg-rose-500';

  if (phase === 'menu') {
    return (
      <div className="max-w-lg mx-auto space-y-6 pb-12">
        <Link href="/siswa/elearning" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Kembali ke E-Learning
        </Link>

        <div className="bg-gradient-to-br from-teal-700 via-emerald-600 to-cyan-700 rounded-3xl p-8 text-white text-center shadow-xl relative overflow-hidden">
          <div className="text-6xl mb-3">☪️</div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tajwid &amp; PAI Quest</h1>
          <p className="text-teal-100 text-xs font-medium mt-2 leading-relaxed">
            Asah pemahaman hukum Tajwid dan Al-Qur’an dalam kuis interaktif!<br />Dapatkan XP dan poin combo streak! ✨
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-2xs space-y-4">
          <p className="font-extrabold text-slate-900 text-sm">Pilih Tingkat Kesulitan</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { val: 'mudah', label: '🌱 Pemula', desc: '20s/soal\nIzhar & Idgham', pts: 100 },
              { val: 'sedang', label: '⭐ Menengah', desc: '15s/soal\nMim Sukun & PAI', pts: 150 },
              { val: 'sulit', label: '🔥 Mahir', desc: '12s/soal\nHukum Mad & Waqaf', pts: 200 },
            ] as { val: Difficulty; label: string; desc: string; pts: number }[]).map(d => (
              <button
                key={d.val}
                type="button"
                onClick={() => setDifficulty(d.val)}
                className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  difficulty === d.val ? 'border-emerald-600 bg-emerald-50 shadow-2xs' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <p className="text-xs font-bold text-slate-900">{d.label}</p>
                <p className="text-[10px] text-slate-500 mt-1 whitespace-pre-line leading-tight">{d.desc}</p>
                <p className="text-xs font-extrabold text-emerald-700 mt-1.5">+{d.pts} XP</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50/60 rounded-2xl p-4 text-xs text-emerald-900 space-y-1.5 border border-emerald-100 font-medium">
          <p>🎯 5 Soal Tajwid pilihan per sesi permainan</p>
          <p>❤️ 3 Nyawa — Salah jawab atau habis waktu = -1 nyawa</p>
          <p>🔥 Streak 3+ jawaban benar berturut-turut = Bonus Multiplier XP 1.5x!</p>
        </div>

        <button
          type="button"
          onClick={startGame}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-white" /> Mulai Petualangan!
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="max-w-lg mx-auto space-y-5 pb-12">
        <div className={`rounded-3xl p-8 text-white text-center shadow-xl ${
          score >= 600 ? 'bg-gradient-to-br from-amber-500 to-emerald-600' : 'bg-gradient-to-br from-teal-600 to-emerald-700'
        }`}>
          <div className="text-6xl mb-3">{score >= 600 ? '🏆' : '🕌'}</div>
          <h2 className="text-2xl font-extrabold">{score >= 600 ? 'Subhanallah! Luar Biasa!' : 'Terus Semangat Belajar!'}</h2>
          <p className="text-emerald-100 text-xs font-semibold mt-1">
            Mode {difficulty === 'mudah' ? 'Pemula' : difficulty === 'sedang' ? 'Menengah' : 'Mahir'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '⭐', label: 'Total Skor XP', val: `${score} XP` },
            { icon: '✅', label: 'Jawaban Benar', val: `${correct}/${TOTAL_ROUNDS}` },
            { icon: '🔥', label: 'Max Combo Streak', val: `${maxStreak}x` },
            { icon: '🎯', label: 'Tingkat Akurasi', val: `${Math.round((correct / TOTAL_ROUNDS) * 100)}%` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-emerald-100 p-4 text-center shadow-2xs">
              <span className="text-2xl block mb-1">{s.icon}</span>
              <p className="text-lg font-extrabold text-slate-900">{s.val}</p>
              <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPhase('menu')}
            className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-extrabold text-slate-700 flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Pilih Mode Lain
          </button>
          <button
            type="button"
            onClick={startGame}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" /> Main Lagi!
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isCorrect = selected === currentQuestion.answer;
  const isTimeout = selected === '__timeout__';

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-12">
      {/* HUD Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-emerald-100 px-5 py-3 shadow-2xs">
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-200 fill-current'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {streak >= 3 && <span className="text-xs font-bold text-amber-600 animate-bounce">🔥×{streak}</span>}
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-extrabold text-slate-900 text-sm">{score} XP</span>
        </div>
        <div className={`flex items-center gap-1.5 font-extrabold text-base ${timerColor}`}>
          <Timer className="w-4 h-4" /> {timeLeft}s
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className={`h-full ${timerBg} rounded-full transition-all duration-1000`}
          style={{ width: `${(timeLeft / (difficulty === 'mudah' ? 20 : difficulty === 'sedang' ? 15 : 12)) * 100}%` }}
        />
      </div>

      {/* Progress Dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i < questionIndex ? 'bg-emerald-600' : i === questionIndex ? 'bg-emerald-400 animate-pulse' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Arabic Verse Display */}
      <div className="bg-gradient-to-br from-teal-800 via-emerald-800 to-cyan-900 rounded-3xl p-6 text-white text-center shadow-lg space-y-3">
        <p className="text-[11px] font-bold text-teal-200 uppercase tracking-wide">
          Soal {questionIndex + 1} dari {TOTAL_ROUNDS} · +{currentQuestion.points} XP
        </p>
        <div className="py-2">
          <p className="text-3xl sm:text-4xl font-extrabold font-serif tracking-wider text-amber-300 leading-relaxed">
            {currentQuestion.verse}
          </p>
          {currentQuestion.highlight && (
            <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-teal-100 border border-white/20">
              Potongan: {currentQuestion.highlight}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-white/95 leading-snug">{currentQuestion.question}</p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQuestion.options.map((opt) => {
          let cls = 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-slate-800';
          if (showResult) {
            if (opt === currentQuestion.answer) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold';
            else if (opt === selected) cls = 'border-rose-500 bg-rose-50 text-rose-800 font-extrabold';
            else cls = 'border-slate-100 text-slate-400 opacity-60';
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(opt)}
              disabled={showResult}
              className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${cls} ${
                !showResult ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback Panel */}
      {showResult && (
        <div
          className={`p-4 rounded-2xl border ${
            isTimeout ? 'border-amber-200 bg-amber-50' : isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
          }`}
        >
          <p className={`font-bold text-xs ${isTimeout ? 'text-amber-800' : isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
            {isTimeout ? '⏰ Waktu Habis!' : isCorrect ? `✅ Benar! +${currentQuestion.points} XP${streak >= 3 ? ' 🔥 STREAK!' : ''}` : '❌ Kurang Tepat!'}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{currentQuestion.explanation}</p>
        </div>
      )}
    </div>
  );
}
