'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Timer, RotateCcw, Shuffle, CheckCircle, XCircle } from 'lucide-react';

type Phase = 'menu' | 'playing' | 'result';

const WORD_BANK = [
  { word:'PHOTOSYNTHESIS', hint:'Proses tumbuhan membuat makanan dari cahaya', category:'IPA', points:150 },
  { word:'DEMOCRACY', hint:'Sistem pemerintahan dari rakyat, oleh rakyat', category:'IPS', points:120 },
  { word:'PERPENDICULAR', hint:'Garis yang berpotongan membentuk sudut 90°', category:'Matematika', points:150 },
  { word:'ECOSYSTEM', hint:'Komunitas makhluk hidup dan lingkungannya', category:'IPA', points:120 },
  { word:'METABOLISM', hint:'Proses kimia dalam tubuh makhluk hidup', category:'IPA', points:130 },
  { word:'VOCABULARY', hint:'Kumpulan kata-kata dalam suatu bahasa', category:'B. Inggris', points:110 },
  { word:'GEOGRAPHY', hint:'Ilmu yang mempelajari bumi dan isinya', category:'IPS', points:100 },
  { word:'HYPOTHESIS', hint:'Dugaan sementara dalam penelitian ilmiah', category:'IPA', points:130 },
  { word:'ALGORITHM', hint:'Langkah-langkah sistematis memecahkan masalah', category:'Matematika', points:130 },
  { word:'LITERATURE', hint:'Karya tulis yang bernilai seni tinggi', category:'B. Indonesia', points:110 },
  { word:'CHROMOSOME', hint:'Struktur pembawa informasi genetik', category:'IPA', points:140 },
  { word:'PARLIAMENT', hint:'Lembaga legislatif pembuat undang-undang', category:'IPS', points:120 },
  { word:'SYMMETRY', hint:'Keseimbangan bentuk di kedua sisi', category:'Matematika', points:100 },
  { word:'ATMOSPHERE', hint:'Lapisan udara yang menyelimuti bumi', category:'IPA', points:110 },
  { word:'ELECTRICITY', hint:'Aliran muatan listrik dalam suatu rangkaian', category:'IPA', points:120 },
  { word:'NARRATIVE', hint:'Jenis teks yang menceritakan suatu peristiwa', category:'B. Indonesia', points:110 },
  { word:'PROPORTION', hint:'Perbandingan antara dua besaran', category:'Matematika', points:110 },
  { word:'POLLUTION', hint:'Pencemaran lingkungan oleh zat berbahaya', category:'IPA', points:100 },
  { word:'GOVERNMENT', hint:'Sistem yang mengatur suatu negara', category:'IPS', points:100 },
  { word:'ADJECTIVE', hint:'Kata sifat yang menerangkan kata benda', category:'B. Inggris', points:110 },
];

function scramble(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word ? scramble(word) : result;
}

const CAT_COLOR: Record<string, string> = {
  'IPA': 'bg-green-100 text-green-700',
  'IPS': 'bg-orange-100 text-orange-700',
  'Matematika': 'bg-blue-100 text-blue-700',
  'B. Inggris': 'bg-purple-100 text-purple-700',
  'B. Indonesia': 'bg-red-100 text-red-700',
};

export default function WordScrambleGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [words, setWords] = useState<typeof WORD_BANK>([]);
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [letterBtns, setLetterBtns] = useState<{ char: string; used: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correct, setCorrect] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const TOTAL = 10;

  const initRound = useCallback((word: string) => {
    const s = scramble(word);
    setScrambled(s);
    setLetterBtns(s.split('').map(c => ({ char: c, used: false })));
    setInput('');
    setTimeLeft(60);
    setFeedback(null);
    setHintUsed(false);
  }, []);

  const startGame = () => {
    const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5).slice(0, TOTAL);
    setWords(shuffled);
    setIdx(0); setScore(0); setCorrect(0); setSkipped(0);
    setPhase('playing');
    initRound(shuffled[0].word);
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      handleSkip();
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const addLetter = (i: number) => {
    if (letterBtns[i].used) return;
    const newInput = input + letterBtns[i].char;
    setInput(newInput);
    setLetterBtns(prev => prev.map((b, j) => j === i ? { ...b, used: true } : b));
    if (newInput.length === words[idx].word.length) {
      checkAnswer(newInput);
    }
  };

  const removeLast = () => {
    if (!input) return;
    const lastChar = input[input.length - 1];
    const usedIdx = letterBtns.map((b, i) => b.used && b.char === lastChar ? i : -1).filter(i => i !== -1).pop();
    if (usedIdx !== undefined && usedIdx !== -1) {
      setLetterBtns(prev => prev.map((b, i) => i === usedIdx ? { ...b, used: false } : b));
    }
    setInput(prev => prev.slice(0, -1));
  };

  const clearInput = () => {
    setInput('');
    setLetterBtns(prev => prev.map(b => ({ ...b, used: false })));
  };

  const reshuffleLetters = () => {
    const newS = scramble(words[idx].word);
    setScrambled(newS);
    setLetterBtns(newS.split('').map(c => ({ char: c, used: false })));
    setInput('');
  };

  const checkAnswer = (ans: string) => {
    const isCorrect = ans.toUpperCase() === words[idx].word;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 2);
      const pts = words[idx].points + timeBonus + (hintUsed ? 0 : 30);
      setScore(s => s + pts);
      setCorrect(c => c + 1);
    }
    setTimeout(() => goNext(), isCorrect ? 1200 : 1000);
  };

  const goNext = () => {
    const nextIdx = idx + 1;
    if (nextIdx >= TOTAL) { setPhase('result'); return; }
    setIdx(nextIdx);
    initRound(words[nextIdx].word);
  };

  const handleSkip = () => {
    setSkipped(s => s + 1);
    setFeedback('wrong');
    setTimeout(() => goNext(), 800);
  };

  const useHint = () => {
    if (hintUsed || score < 50) return;
    setScore(s => s - 50);
    setHintUsed(true);
  };

  if (phase === 'menu') return (
    <div className="max-w-md mx-auto space-y-3.5">
      <Link href="/siswa/elearning" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold"><ArrowLeft className="w-3.5 h-3.5"/> Kembali</Link>
      <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white text-center shadow-md">
        <div className="text-3xl mb-1.5">🔤</div>
        <h1 className="text-lg font-extrabold mb-1">Word Scramble</h1>
        <p className="text-purple-100 text-xs font-medium">Susun huruf acak menjadi kata yang benar.<br/>Ada 10 kata dari berbagai mata pelajaran!</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-600 space-y-1 border border-gray-200 font-medium">
        <p>🔤 Ketuk huruf secara berurutan membentuk kata</p>
        <p>⏰ 60 detik per kata — semakin cepat semakin banyak poin</p>
        <p>💡 Gunakan hint (-50 poin) jika bingung</p>
        <p>🔀 Shuffle untuk mengacak ulang huruf</p>
      </div>
      <button onClick={startGame} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer">
        🔤 Mulai Main
      </button>
    </div>
  );

  if (phase === 'result') return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-3xl p-8 text-white text-center shadow-2xl ${score >= 1200 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-violet-600'}`}>
        <div className="text-5xl mb-3">{score>=1500?'🏆':score>=1000?'🥇':'🎯'}</div>
        <h2 className="text-3xl font-extrabold">{score>=1500?'Sempurna!':score>=1000?'Luar Biasa!':'Bagus!'}</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{icon:'⭐',l:'Poin',v:score.toLocaleString('id-ID')},{icon:'✅',l:'Benar',v:`${correct}/${TOTAL}`},{icon:'⏭️',l:'Dilewati',v:skipped}].map(s=>(
          <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{s.v}</p>
            <p className="text-xs text-gray-400">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={()=>setPhase('menu')} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"><RotateCcw className="w-4 h-4 inline mr-1"/>Ulang</button>
        <button onClick={startGame} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-sm">Main Lagi!</button>
      </div>
    </div>
  );

  const cur = words[idx];
  const timerPct = (timeLeft / 60) * 100;
  const timerColor = timeLeft > 30 ? 'bg-green-500' : timeLeft > 15 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <span className="text-sm text-gray-500">{idx+1}/{TOTAL}</span>
        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/><span className="font-extrabold text-gray-900">{score.toLocaleString('id-ID')}</span></div>
        <div className={`flex items-center gap-1.5 font-bold ${timeLeft<=15?'text-red-500 animate-pulse':'text-gray-700'}`}>
          <Timer className="w-4 h-4"/>{timeLeft}s
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${timerColor} rounded-full transition-all duration-1000`} style={{width:`${timerPct}%`}}/>
      </div>

      {/* Word card */}
      <div className={`rounded-2xl p-5 text-center transition-all ${feedback==='correct'?'bg-green-50 border-2 border-green-400':feedback==='wrong'?'bg-red-50 border-2 border-red-400':'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CAT_COLOR[cur.category]||'bg-gray-100 text-gray-600'}`}>{cur.category}</span>
          <span className="text-xs text-gray-400">+{cur.points} poin</span>
        </div>
        <p className="text-sm text-gray-500 italic mb-3">"{cur.hint}"</p>
        {hintUsed && (
          <p className="text-xs text-blue-600 mb-2">💡 Petunjuk: kata dimulai dengan <strong>{cur.word[0]}</strong> dan berakhir dengan <strong>{cur.word[cur.word.length-1]}</strong></p>
        )}
        {feedback === 'correct' && <p className="text-green-600 font-extrabold text-xl">✅ {cur.word}</p>}
        {feedback === 'wrong' && <p className="text-red-600 font-extrabold text-xl">❌ {cur.word}</p>}
        {!feedback && (
          <div className="flex items-center justify-center gap-1 min-h-[40px]">
            {cur.word.split('').map((_, i) => (
              <div key={i} className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-extrabold text-lg transition-all ${
                i < input.length ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-300'
              }`}>
                {input[i] || ''}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Letter buttons */}
      {!feedback && (
        <div className="flex flex-wrap gap-2 justify-center">
          {letterBtns.map((b, i) => (
            <button key={i} onClick={() => addLetter(i)} disabled={b.used}
              className={`w-10 h-10 rounded-xl font-extrabold text-lg border-2 transition-all ${b.used ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-110 active:scale-95'}`}>
              {b.char}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      {!feedback && (
        <div className="flex gap-2">
          <button onClick={removeLast} disabled={!input} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40">⌫ Hapus</button>
          <button onClick={clearInput} disabled={!input} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm disabled:opacity-40"><XCircle className="w-4 h-4 text-gray-500"/></button>
          <button onClick={reshuffleLetters} className="py-2.5 px-4 rounded-xl border border-gray-200 text-sm"><Shuffle className="w-4 h-4 text-gray-500"/></button>
          <button onClick={useHint} disabled={hintUsed||score<50} className={`py-2.5 px-4 rounded-xl text-sm font-semibold disabled:opacity-40 ${hintUsed?'border border-gray-100 text-gray-300':'border border-yellow-300 bg-yellow-50 text-yellow-700'}`}>
            💡{hintUsed?'✓':'-50'}
          </button>
          <button onClick={handleSkip} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-500">Skip ⏭</button>
        </div>
      )}
    </div>
  );
}
