'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Timer, Zap, Heart, Trophy, RotateCcw } from 'lucide-react';

type Difficulty = 'mudah' | 'sedang' | 'sulit';
type GamePhase = 'menu' | 'playing' | 'result';

interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  points: number;
}

function generateQuestion(difficulty: Difficulty, round: number): Question {
  const level = difficulty === 'mudah' ? 1 : difficulty === 'sedang' ? 2 : 3;
  const types = level === 1
    ? ['add','sub','mul']
    : level === 2
    ? ['mul','div','algebra','persen']
    : ['algebra','quadratic','pecahan','statistik'];

  const type = types[Math.floor(Math.random() * types.length)];
  let q = '', ans = 0, explanation = '';

  if (type === 'add') {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    ans = a + b; q = `${a} + ${b} = ?`; explanation = `${a} + ${b} = ${ans}`;
  } else if (type === 'sub') {
    const a = Math.floor(Math.random() * 80) + 20;
    const b = Math.floor(Math.random() * a);
    ans = a - b; q = `${a} - ${b} = ?`; explanation = `${a} - ${b} = ${ans}`;
  } else if (type === 'mul') {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    ans = a * b; q = `${a} × ${b} = ?`; explanation = `${a} × ${b} = ${ans}`;
  } else if (type === 'div') {
    const b = Math.floor(Math.random() * 11) + 2;
    const ans_ = Math.floor(Math.random() * 10) + 2;
    const a = b * ans_;
    ans = ans_; q = `${a} ÷ ${b} = ?`; explanation = `${a} ÷ ${b} = ${ans}`;
  } else if (type === 'persen') {
    const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
    const base = [100, 200, 400, 500, 800][Math.floor(Math.random() * 5)];
    ans = (pct / 100) * base; q = `${pct}% dari ${base} = ?`; explanation = `${pct}/100 × ${base} = ${ans}`;
  } else if (type === 'algebra') {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 20) + 5;
    ans = Math.floor(Math.random() * 10) + 1;
    const c = a * ans + b;
    q = `${a}x + ${b} = ${c}, x = ?`; explanation = `${a}x = ${c} - ${b} = ${c-b}, x = ${c-b}/${a} = ${ans}`;
  } else if (type === 'quadratic') {
    const r1 = Math.floor(Math.random() * 6) + 1;
    const r2 = Math.floor(Math.random() * 6) + 1;
    const b2 = -(r1 + r2); const c2 = r1 * r2;
    const sign = b2 >= 0 ? '+' : '';
    q = `x² ${sign}${b2}x + ${c2} = 0, salah satu akarnya?`; ans = r1;
    explanation = `(x-${r1})(x-${r2})=0 → x=${r1} atau x=${r2}`;
  } else if (type === 'pecahan') {
    const num = Math.floor(Math.random() * 3) + 1;
    const den = Math.floor(Math.random() * 3) + 2;
    const num2 = Math.floor(Math.random() * 3) + 1;
    const den2 = den;
    ans = num + num2; q = `${num}/${den} + ${num2}/${den2} = ?/${den}`;
    explanation = `Penyebut sama (${den}): pembilang ${num}+${num2} = ${ans}`;
  } else {
    const data = Array.from({length:5}, () => Math.floor(Math.random()*20)+1);
    ans = Math.round(data.reduce((a,b)=>a+b,0)/data.length);
    q = `Rata-rata dari ${data.join(', ')} = ?`; explanation = `Jumlah: ${data.reduce((a,b)=>a+b,0)}, n=5, rata-rata=${ans}`;
  }

  const pts = difficulty === 'mudah' ? 100 : difficulty === 'sedang' ? 150 : 200;
  const wrong = [ans-3,ans-1,ans+2,ans+5,ans-7].filter(x=>x!==ans&&x>0).slice(0,3);
  const options = [...wrong.map(String), String(ans)].sort(() => Math.random() - 0.5);

  return { question: q, options, answer: String(ans), explanation, points: pts + round * 10 };
}

export default function MathBlitzGame() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('sedang');
  const [question, setQuestion] = useState<Question | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const TOTAL_ROUNDS = 10;

  const nextQuestion = useCallback(() => {
    if (round >= TOTAL_ROUNDS) { setPhase('result'); return; }
    setQuestion(generateQuestion(difficulty, round));
    setSelected(null);
    setShowResult(false);
    setTimeLeft(difficulty === 'mudah' ? 20 : difficulty === 'sedang' ? 15 : 10);
  }, [round, difficulty]);

  const startGame = () => {
    setPhase('playing'); setScore(0); setLives(3);
    setRound(0); setStreak(0); setMaxStreak(0); setCorrect(0);
    setQuestion(generateQuestion(difficulty, 0));
    setSelected(null); setShowResult(false);
    setTimeLeft(difficulty === 'mudah' ? 20 : difficulty === 'sedang' ? 15 : 10);
  };

  useEffect(() => {
    if (phase !== 'playing' || showResult) return;
    if (timeLeft <= 0) {
      setShowResult(true);
      setSelected('__timeout__');
      setLives(l => {
        const nl = l - 1;
        if (nl <= 0) setTimeout(() => setPhase('result'), 1500);
        return nl;
      });
      setStreak(0);
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, showResult]);

  const handleAnswer = (opt: string) => {
    if (showResult || !question) return;
    setSelected(opt);
    setShowResult(true);
    const isCorrect = opt === question.answer;
    if (isCorrect) {
      const bonus = streak >= 3 ? 1.5 : streak >= 1 ? 1.2 : 1;
      const pts = Math.round(question.points * bonus * (timeLeft / (difficulty==='mudah'?20:difficulty==='sedang'?15:10) + 0.5));
      setScore(s => s + pts);
      setStreak(s => { const ns = s+1; setMaxStreak(m => Math.max(m,ns)); return ns; });
      setCorrect(c => c+1);
    } else {
      setStreak(0);
      setLives(l => { const nl = l-1; if(nl<=0) setTimeout(()=>setPhase('result'),1800); return nl; });
    }
    if (round + 1 >= TOTAL_ROUNDS) {
      setTimeout(() => setPhase('result'), 1800);
    } else {
      setTimeout(() => { setRound(r => r+1); nextQuestion(); }, 1800);
    }
  };

  const timerColor = timeLeft > 8 ? 'text-green-500' : timeLeft > 4 ? 'text-yellow-500' : 'text-red-500 animate-pulse';
  const timerBg = timeLeft > 8 ? 'bg-green-500' : timeLeft > 4 ? 'bg-yellow-500' : 'bg-red-500';

  if (phase === 'menu') return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link href="/siswa/elearning" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4"/> Kembali ke E-Learning
      </Link>
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white text-center shadow-2xl">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-3xl font-extrabold mb-2">Math Blitz!</h1>
        <p className="text-blue-100 text-sm">Jawab soal matematika sebelum waktu habis.<br/>Combo streak = bonus poin! 🔥</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="font-semibold text-gray-900 mb-3">Pilih Tingkat Kesulitan</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { val:'mudah', label:'😊 Mudah', desc:'20 detik/soal\nBilangan & Persen', pts:100 },
            { val:'sedang', label:'🤔 Sedang', desc:'15 detik/soal\nAljabar & Persentase', pts:150 },
            { val:'sulit', label:'🔥 Sulit', desc:'10 detik/soal\nKuadrat & Statistik', pts:200 },
          ] as {val:Difficulty; label:string; desc:string; pts:number}[]).map(d => (
            <button key={d.val} onClick={() => setDifficulty(d.val)}
              className={`p-3.5 rounded-xl border-2 text-center transition-all ${difficulty===d.val?'border-blue-500 bg-blue-50':'border-gray-200 hover:border-blue-300'}`}>
              <p className="text-sm font-bold text-gray-900">{d.label}</p>
              <p className="text-[10px] text-gray-400 mt-1 whitespace-pre-line">{d.desc}</p>
              <p className="text-xs font-bold text-blue-600 mt-1">+{d.pts} pts</p>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
        <p>🎯 10 soal per permainan</p>
        <p>❤️ 3 nyawa — jawab salah atau waktu habis = -1 nyawa</p>
        <p>🔥 Streak 3+ jawaban benar = bonus poin ×1.5!</p>
        <p>⚡ Jawab cepat = poin lebih banyak</p>
      </div>
      <button onClick={startGame}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-lg transition-all hover:scale-105 shadow-lg">
        ⚡ Mulai Main!
      </button>
    </div>
  );

  if (phase === 'result') return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-3xl p-8 text-white text-center shadow-2xl ${score >= 1000 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : score >= 500 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
        <div className="text-6xl mb-3">{score>=1500?'🏆':score>=1000?'🥇':score>=500?'🥈':'🎯'}</div>
        <h2 className="text-3xl font-extrabold">{score>=1500?'Luar Biasa!':score>=1000?'Bagus Sekali!':score>=500?'Hebat!':'Terus Berlatih!'}</h2>
        <p className="text-white/80 text-sm mt-1">{difficulty === 'mudah' ? 'Mode Mudah' : difficulty === 'sedang' ? 'Mode Sedang' : 'Mode Sulit'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon:'⭐', label:'Total Poin', val:score.toLocaleString('id-ID') },
          { icon:'✅', label:'Benar', val:`${correct}/${TOTAL_ROUNDS}` },
          { icon:'🔥', label:'Max Streak', val:`${maxStreak}×` },
          { icon:'🎯', label:'Akurasi', val:`${Math.round((correct/TOTAL_ROUNDS)*100)}%` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="text-xl font-extrabold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setPhase('menu')} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4"/> Ganti Mode
        </button>
        <button onClick={startGame} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2">
          <Zap className="w-4 h-4"/> Main Lagi!
        </button>
      </div>
      <Link href="/siswa/elearning" className="block text-center text-sm text-gray-500 hover:text-green-600">
        ← Kembali ke E-Learning
      </Link>
    </div>
  );

  if (!question) return null;

  const isCorrect = selected === question.answer;
  const isTimeout = selected === '__timeout__';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <div className="flex gap-1">
          {Array.from({length:3}).map((_,i) => (
            <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-200 fill-current'}`}/>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {streak >= 3 && <span className="text-xs font-bold text-orange-500 animate-bounce">🔥×{streak}</span>}
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
          <span className="font-extrabold text-gray-900 text-sm">{score.toLocaleString('id-ID')}</span>
        </div>
        <div className={`flex items-center gap-1.5 font-extrabold text-lg ${timerColor}`}>
          <Timer className="w-4 h-4"/> {timeLeft}
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${timerBg} rounded-full transition-all duration-1000`}
          style={{width:`${(timeLeft/(difficulty==='mudah'?20:difficulty==='sedang'?15:10))*100}%`}}/>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {Array.from({length:TOTAL_ROUNDS}).map((_,i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full ${i<round?'bg-blue-500':i===round?'bg-blue-300 animate-pulse':'bg-gray-200'}`}/>
        ))}
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white text-center shadow-lg">
        <p className="text-xs text-blue-200 mb-3">Soal {round+1} dari {TOTAL_ROUNDS} · +{question.points} poin</p>
        <p className="text-2xl sm:text-3xl font-extrabold leading-snug">{question.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => {
          let cls = 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-900';
          if (showResult) {
            if (opt === question.answer) cls = 'border-green-500 bg-green-50 text-green-700';
            else if (opt === selected) cls = 'border-red-500 bg-red-50 text-red-700';
            else cls = 'border-gray-100 text-gray-400 opacity-60';
          }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)} disabled={showResult}
              className={`p-4 rounded-2xl border-2 font-bold text-xl transition-all ${cls} ${!showResult?'hover:scale-105 active:scale-95':''}`}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={`p-4 rounded-2xl border ${isTimeout?'border-yellow-200 bg-yellow-50':isCorrect?'border-green-200 bg-green-50':'border-red-200 bg-red-50'}`}>
          <p className={`font-bold text-sm ${isTimeout?'text-yellow-700':isCorrect?'text-green-700':'text-red-700'}`}>
            {isTimeout ? '⏰ Waktu Habis!' : isCorrect ? `✅ Benar! +${question.points} poin${streak>=3?' 🔥 STREAK!':''}` : '❌ Salah!'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
