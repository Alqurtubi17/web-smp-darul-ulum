'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Timer, Star, RotateCcw, Trophy } from 'lucide-react';

type Phase = 'menu' | 'playing' | 'result';
type Card = { id: number; content: string; pairId: number; type: 'term' | 'def'; flipped: boolean; matched: boolean; };

const PAIRS = [
  { term:'Mitosis', def:'Pembelahan sel menghasilkan 2 sel anak identik' },
  { term:'Fotosintesis', def:'Proses tumbuhan membuat makanan dari CO₂ dan H₂O' },
  { term:'Osmosis', def:'Perpindahan zat cair dari larutan encer ke pekat' },
  { term:'Respirasi', def:'Proses pembakaran glukosa menghasilkan energi' },
  { term:'DNA', def:'Molekul pembawa informasi genetik makhluk hidup' },
  { term:'Enzim', def:'Protein yang mempercepat reaksi kimia dalam tubuh' },
  { term:'Ekosistem', def:'Komunitas makhluk hidup dan lingkungan fisiknya' },
  { term:'Difusi', def:'Perpindahan zat dari konsentrasi tinggi ke rendah' },
  { term:'Simbiosis', def:'Hubungan antara dua makhluk hidup berbeda spesies' },
  { term:'Evolusi', def:'Perubahan makhluk hidup secara bertahap dari generasi ke generasi' },
  { term:'Homeostasis', def:'Kemampuan tubuh mempertahankan kondisi stabil internal' },
  { term:'Metabolisme', def:'Seluruh reaksi kimia yang terjadi dalam sel makhluk hidup' },
];

const LEVEL_CONFIG = {
  mudah:  { pairs: 6,  time: 90,  label:'😊 Mudah', desc:'6 pasang · 90 detik' },
  sedang: { pairs: 9,  time: 120, label:'🤔 Sedang', desc:'9 pasang · 120 detik' },
  sulit:  { pairs: 12, time: 150, label:'🔥 Sulit', desc:'12 pasang · 150 detik' },
};
type Level = keyof typeof LEVEL_CONFIG;

function buildCards(n: number): Card[] {
  const selected = [...PAIRS].sort(() => Math.random() - 0.5).slice(0, n);
  const cards: Card[] = [];
  selected.forEach((p, i) => {
    cards.push({ id: i*2,   content: p.term, pairId: i, type: 'term', flipped: false, matched: false });
    cards.push({ id: i*2+1, content: p.def,  pairId: i, type: 'def',  flipped: false, matched: false });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryMatchGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [level, setLevel] = useState<Level>('sedang');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [matched, setMatched] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState<number[]>([]);

  const cfg = LEVEL_CONFIG[level];

  const startGame = () => {
    setCards(buildCards(cfg.pairs));
    setFlipped([]); setScore(0); setMoves(0);
    setTimeLeft(cfg.time); setMatched(0); setCombo(0);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    if (matched >= cfg.pairs || timeLeft <= 0) { setTimeout(()=>setPhase('result'),500); return; }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, matched, cfg.pairs]);

  const flipCard = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched || flipped.length >= 2) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid)!);
      if (a.pairId === b.pairId && a.type !== b.type) {
        // Match!
        const newCombo = combo + 1;
        setCombo(newCombo);
        const pts = 100 + newCombo * 20 + Math.floor(timeLeft / 5);
        setScore(s => s + pts);
        setMatched(m => m + 1);
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
          setFlipped([]);
        }, 600);
      } else {
        setCombo(0);
        setShake(newFlipped);
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setShake([]);
        }, 1000);
      }
    }
  };

  const pct = matched / cfg.pairs;
  const timerColor = timeLeft > cfg.time*0.5 ? 'bg-green-500' : timeLeft > cfg.time*0.25 ? 'bg-yellow-500' : 'bg-red-500';
  const cols = cfg.pairs <= 6 ? 'grid-cols-4' : cfg.pairs <= 9 ? 'grid-cols-6' : 'grid-cols-6';

  if (phase === 'menu') return (
    <div className="max-w-md mx-auto space-y-3.5">
      <Link href="/siswa/elearning" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold"><ArrowLeft className="w-3.5 h-3.5"/> Kembali</Link>
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white text-center shadow-md">
        <div className="text-3xl mb-1.5">🧬</div>
        <h1 className="text-lg font-extrabold mb-1">IPA Memory Match</h1>
        <p className="text-green-100 text-xs font-medium">Pasangkan istilah IPA dengan definisinya!<br/>Combo match = bonus poin! 🔥</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 shadow-2xs">
        <p className="font-bold text-xs text-gray-900">Pilih Level</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(LEVEL_CONFIG) as [Level, typeof cfg][]).map(([k, v]) => (
            <button key={k} onClick={()=>setLevel(k)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${level===k?'border-green-500 bg-green-50 shadow-2xs':'border-gray-200'}`}>
              <p className="text-xs font-bold text-gray-900">{v.label}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{v.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-600 space-y-1 border border-gray-200 font-medium">
        <p>🧬 Ketuk kartu untuk membaliknya</p>
        <p>🔗 Pasangkan istilah dengan definisinya</p>
        <p>🔥 Combo match berturut-turut = bonus poin!</p>
      </div>
      <button onClick={startGame} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer">
        🧬 Mulai Main
      </button>
    </div>
  );

  if (phase === 'result') return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className={`rounded-3xl p-8 text-white text-center shadow-2xl ${matched>=cfg.pairs?'bg-gradient-to-br from-yellow-400 to-orange-500':'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
        <div className="text-5xl mb-3">{matched>=cfg.pairs?'🏆':'⏰'}</div>
        <h2 className="text-3xl font-extrabold">{matched>=cfg.pairs?'Selesai!':'Waktu Habis!'}</h2>
        <p className="text-white/80 text-sm mt-1">{matched} dari {cfg.pairs} pasang berhasil ditemukan</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{icon:'⭐',l:'Poin',v:score.toLocaleString('id-ID')},{icon:'🔗',l:'Match',v:`${matched}/${cfg.pairs}`},{icon:'🎯',l:'Langkah',v:moves}].map(s=>(
          <div key={s.l} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-xl font-extrabold text-gray-900 mt-1">{s.v}</p>
            <p className="text-xs text-gray-400">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={()=>setPhase('menu')} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"><RotateCcw className="w-4 h-4 inline mr-1"/>Ganti Level</button>
        <button onClick={startGame} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm">Main Lagi!</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <div className="flex items-center gap-2">
          {combo >= 2 && <span className="text-xs font-bold text-orange-500 animate-bounce">🔥 COMBO ×{combo}!</span>}
        </div>
        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/><span className="font-extrabold text-gray-900">{score.toLocaleString('id-ID')}</span></div>
        <div className={`font-bold ${timeLeft<=30?'text-red-500 animate-pulse':'text-gray-700'} flex items-center gap-1`}>
          <Timer className="w-4 h-4"/>{timeLeft}s
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${timerColor} rounded-full transition-all duration-1000`} style={{width:`${(timeLeft/cfg.time)*100}%`}}/>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">{matched}/{cfg.pairs} pasang</span>
      </div>

      {/* Cards grid */}
      <div className={`grid ${cols} gap-2`}>
        {cards.map(card => (
          <button key={card.id} onClick={() => flipCard(card.id)}
            className={`aspect-square rounded-xl border-2 text-center transition-all duration-300 relative overflow-hidden ${
              card.matched
                ? 'border-green-400 bg-green-50 cursor-default'
                : card.flipped
                ? shake.includes(card.id)
                  ? 'border-red-400 bg-red-50 animate-pulse'
                  : 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50 hover:scale-105'
            }`}>
            {card.flipped || card.matched ? (
              <div className="p-1.5 flex items-center justify-center h-full">
                <p className={`text-[9px] leading-tight font-semibold ${card.type==='term'?'text-blue-700':'text-gray-700'} ${card.matched?'text-green-700':''}`}>
                  {card.type === 'term' ? '🔬 ' : ''}{card.content}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-xl">🧬</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="text-center text-xs text-gray-400">
        Langkah: {moves} · Sisa kartu: {cards.filter(c=>!c.matched).length/2} pasang
      </div>
    </div>
  );
}
