'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Timer, RotateCcw, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

type Phase = 'menu' | 'playing' | 'result';

interface Question {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  image?: string;
  subject: string;
  points: number;
}

const QUESTIONS: Question[] = [
  { question:'Organel sel yang berfungsi sebagai "pembangkit listrik" sel adalah...', options:['Ribosom','Mitokondria','Lisosom','Vakuola'], answer:1, explanation:'Mitokondria menghasilkan energi (ATP) melalui respirasi aerob, sehingga disebut pembangkit listrik sel.', subject:'Biologi Sel', points:100 },
  { question:'Hukum Newton I menyatakan bahwa benda diam akan tetap diam jika...', options:['Diberi gaya besar','Tidak ada resultan gaya','Massa benda kecil','Permukaan licin'], answer:1, explanation:'Hukum Inersia: benda diam atau bergerak lurus beraturan selama resultan gaya = 0.', subject:'Fisika', points:100 },
  { question:'Reaksi fotosintesis menghasilkan...', options:['CO₂ dan H₂O','O₂ dan glukosa','N₂ dan ATP','H₂ dan O₂'], answer:1, explanation:'6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂. Produk: glukosa (makanan) dan oksigen.', subject:'Biologi', points:100 },
  { question:'Atom terdiri dari partikel dasar: proton, neutron, dan elektron. Proton bermuatan...', options:['Negatif','Netral','Positif','Bergantung unsur'], answer:2, explanation:'Proton bermuatan positif (+), elektron negatif (-), neutron netral (0).', subject:'Kimia', points:100 },
  { question:'Gaya gravitasi antara dua benda bergantung pada...', options:['Warna benda','Massa dan jarak','Suhu udara','Volume benda'], answer:1, explanation:'F = G(m₁×m₂)/r². Gaya gravitasi berbanding lurus massa dan berbanding terbalik kuadrat jarak.', subject:'Fisika', points:120 },
  { question:'Proses perubahan wujud dari cair ke gas disebut...', options:['Kondensasi','Sublimasi','Evaporasi','Deposisi'], answer:2, explanation:'Evaporasi (penguapan) adalah perubahan wujud dari cair ke gas. Kondensasi adalah kebalikannya.', subject:'Fisika', points:100 },
  { question:'Sel prokariotik berbeda dari sel eukariotik karena...', options:['Tidak memiliki membran sel','Tidak memiliki membran inti','Lebih besar','Tidak memiliki sitoplasma'], answer:1, explanation:'Prokariotik (bakteri) tidak memiliki membran inti. DNA berada langsung di sitoplasma (nukleoid).', subject:'Biologi Sel', points:120 },
  { question:'Zat yang mempercepat reaksi kimia tanpa ikut bereaksi disebut...', options:['Reaktan','Produk','Katalis','Pelarut'], answer:2, explanation:'Katalis mempercepat reaksi dengan menurunkan energi aktivasi, tanpa habis dipakai.', subject:'Kimia', points:100 },
  { question:'Kecepatan rata-rata dihitung dengan rumus...', options:['v = a × t','v = s / t','v = F / m','v = m × a'], answer:1, explanation:'v = s/t dimana s = jarak tempuh (m) dan t = waktu (s). Hasilnya dalam m/s.', subject:'Fisika', points:100 },
  { question:'Sistem peredaran darah besar mengalirkan darah dari...', options:['Paru-paru ke jantung','Jantung ke seluruh tubuh','Jantung ke paru-paru','Usus ke hati'], answer:1, explanation:'Sirkulasi sistemik (besar): darah kaya O₂ dari jantung kiri → seluruh tubuh → kembali ke jantung kanan.', subject:'Biologi', points:120 },
  { question:'Rumus kimia garam dapur adalah...', options:['NaOH','KCl','NaCl','CaCO₃'], answer:2, explanation:'Garam dapur = Natrium Klorida (NaCl). Terbentuk dari reaksi HCl + NaOH → NaCl + H₂O.', subject:'Kimia', points:100 },
  { question:'Frekuensi gelombang adalah...', options:['Panjang satu gelombang','Banyak gelombang per detik','Kecepatan merambat','Amplitude gelombang'], answer:1, explanation:'Frekuensi (f) = jumlah gelombang per satuan waktu. Satuan: Hz (Hertz = 1/detik).', subject:'Fisika', points:100 },
];

const SUBJECT_COLOR: Record<string, string> = {
  'Biologi Sel': 'bg-green-100 text-green-700',
  'Fisika': 'bg-blue-100 text-blue-700',
  'Biologi': 'bg-emerald-100 text-emerald-700',
  'Kimia': 'bg-purple-100 text-purple-700',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function ScienceQuizGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [results, setResults] = useState<boolean[]>([]);
  const TOTAL = 10;

  const startGame = () => {
    const q = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL);
    setQuestions(q); setIdx(0); setScore(0); setSelected(null);
    setShowExplanation(false); setResults([]); setTimeLeft(25);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing' || selected !== null) return;
    if (timeLeft <= 0) {
      handleAnswer(-1); return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, selected]);

  const handleAnswer = (optIdx: number) => {
    if (selected !== null) return;
    setSelected(optIdx);
    setShowExplanation(true);
    const q = questions[idx];
    const isCorrect = optIdx === q.answer;
    if (isCorrect) {
      const bonus = Math.floor(timeLeft / 5) * 10;
      setScore(s => s + q.points + bonus);
    }
    setResults(r => [...r, isCorrect]);
  };

  const goNext = () => {
    const nextIdx = idx + 1;
    if (nextIdx >= TOTAL) { setPhase('result'); return; }
    setIdx(nextIdx); setSelected(null); setShowExplanation(false); setTimeLeft(25);
  };

  if (phase === 'menu') return (
    <div className="max-w-lg mx-auto space-y-5">
      <Link href="/siswa/elearning" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4"/> Kembali</Link>
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 text-white text-center shadow-2xl">
        <div className="text-6xl mb-3">🔭</div>
        <h1 className="text-3xl font-extrabold mb-2">Science Quiz!</h1>
        <p className="text-teal-100 text-sm">10 soal IPA — Fisika, Biologi & Kimia.<br/>Setiap jawaban ada penjelasan lengkap! 📚</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{icon:'🔬',l:'10 Soal',v:'Beragam topik'},{icon:'⏱️',l:'25 detik',v:'Per soal'},{icon:'💡',l:'Penjelasan',v:'Setiap jawaban'}].map(s=>(
          <div key={s.l} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <span className="text-xl">{s.icon}</span>
            <p className="text-xs font-bold text-gray-900 mt-1">{s.l}</p>
            <p className="text-[10px] text-gray-400">{s.v}</p>
          </div>
        ))}
      </div>
      <button onClick={startGame} className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-extrabold text-lg hover:scale-105 transition-all shadow-lg">
        🔭 Mulai Kuis!
      </button>
    </div>
  );

  if (phase === 'result') {
    const correctCount = results.filter(Boolean).length;
    const pct = Math.round((correctCount / TOTAL) * 100);
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className={`rounded-3xl p-8 text-white text-center shadow-2xl ${pct>=80?'bg-gradient-to-br from-yellow-400 to-orange-500':pct>=60?'bg-gradient-to-br from-green-500 to-emerald-600':'bg-gradient-to-br from-teal-500 to-cyan-600'}`}>
          <div className="text-5xl mb-3">{pct>=90?'🏆':pct>=70?'🥇':pct>=50?'🥈':'📚'}</div>
          <h2 className="text-3xl font-extrabold">{pct>=90?'Sempurna!':pct>=70?'Sangat Bagus!':pct>=50?'Cukup Baik!':'Perlu Belajar Lagi!'}</h2>
          <p className="text-white/80 text-sm mt-1">Nilai: {pct}/100</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[{icon:'⭐',l:'Poin',v:score.toLocaleString('id-ID')},{icon:'✅',l:'Benar',v:`${correctCount}/${TOTAL}`},{icon:'📊',l:'Nilai',v:`${pct}%`}].map(s=>(
            <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xl font-extrabold text-gray-900 mt-1">{s.v}</p>
              <p className="text-xs text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Hasil per Soal</p>
          <div className="flex gap-1.5 flex-wrap">
            {results.map((r, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${r?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                {r ? '✓' : '✗'}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setPhase('menu')} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"><RotateCcw className="w-4 h-4 inline mr-1"/>Ulang</button>
          <button onClick={startGame} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-sm">Main Lagi!</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const timerPct = (timeLeft / 25) * 100;
  const timerColor = timeLeft > 15 ? 'bg-teal-500' : timeLeft > 8 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <div className="flex gap-1">
          {Array.from({length:TOTAL}).map((_,i)=>(
            <div key={i} className={`w-2 h-2 rounded-full ${i<results.length?(results[i]?'bg-green-500':'bg-red-400'):i===idx?'bg-teal-400 animate-pulse':'bg-gray-200'}`}/>
          ))}
        </div>
        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/><span className="font-extrabold text-gray-900 text-sm">{score.toLocaleString('id-ID')}</span></div>
        <div className={`font-bold text-sm flex items-center gap-1 ${timeLeft<=8?'text-red-500 animate-pulse':'text-gray-700'}`}>
          <Timer className="w-4 h-4"/>{timeLeft}s
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${timerColor} rounded-full transition-all duration-1000`} style={{width:`${timerPct}%`}}/>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SUBJECT_COLOR[q.subject]||'bg-gray-100 text-gray-600'}`}>{q.subject}</span>
          <span className="text-xs text-gray-400">Soal {idx+1}/{TOTAL}</span>
          <span className="ml-auto text-xs font-bold text-teal-600">+{q.points} poin</span>
        </div>
        <p className="font-semibold text-gray-900 leading-relaxed text-base">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          let cls = 'border-gray-200 bg-white text-gray-900 hover:border-teal-400 hover:bg-teal-50';
          if (selected !== null) {
            if (i === q.answer) cls = 'border-green-500 bg-green-50 text-green-700';
            else if (i === selected) cls = 'border-red-400 bg-red-50 text-red-600';
            else cls = 'border-gray-100 bg-gray-50 text-gray-400 opacity-60';
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${cls} ${selected===null?'hover:scale-[1.01] active:scale-[0.99]':''}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${selected!==null&&i===q.answer?'bg-green-500 text-white':selected!==null&&i===selected?'bg-red-400 text-white':'bg-gray-100 text-gray-600'}`}>
                {OPTION_LABELS[i]}
              </span>
              <span className="text-sm font-medium">{opt}</span>
              {selected !== null && i === q.answer && <CheckCircle className="w-5 h-5 text-green-500 ml-auto flex-shrink-0"/>}
              {selected !== null && i === selected && i !== q.answer && <XCircle className="w-5 h-5 text-red-400 ml-auto flex-shrink-0"/>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`p-4 rounded-2xl border ${selected===q.answer?'bg-green-50 border-green-200':'bg-blue-50 border-blue-200'}`}>
          <p className={`font-semibold text-sm mb-1 ${selected===q.answer?'text-green-700':'text-blue-700'}`}>
            {selected === -1 ? '⏰ Waktu habis!' : selected === q.answer ? '✅ Benar!' : '❌ Salah!'} Penjelasan:
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">{q.explanation}</p>
          <button onClick={goNext}
            className="mt-3 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold flex items-center justify-center gap-2">
            {idx+1 >= TOTAL ? '🏁 Lihat Hasil' : 'Soal Berikutnya'} <ChevronRight className="w-4 h-4"/>
          </button>
        </div>
      )}
    </div>
  );
}
