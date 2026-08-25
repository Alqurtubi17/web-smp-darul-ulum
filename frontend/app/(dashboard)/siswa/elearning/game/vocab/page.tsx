'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Timer, Heart, RotateCcw, Zap, Sparkles, Check, RefreshCw } from 'lucide-react';

interface CardItem {
  id: number;
  pairId: number;
  text: string;
  subtext: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const PAIRS_DATA = [
  { pairId: 1, text: 'Photosynthesis', subtext: 'Proses pembuat makanan pada tumbuhan hijau' },
  { pairId: 2, text: 'Respiration', subtext: 'Proses pelepasan energi dari glukosa' },
  { pairId: 3, text: 'Linear Equation', subtext: 'Persamaan dengan variabel pangkat 1' },
  { pairId: 4, text: 'Majas Personifikasi', subtext: 'Gaya bahasa yang menganggap benda mati bernyawa' },
  { pairId: 5, text: 'Narrative Text', subtext: 'Teks cerita rekaan untuk menghibur pembaca' },
  { pairId: 6, text: 'Proklamasi 1945', subtext: 'Peristiwa sejarah kemerdekaan Indonesia' },
];

export default function WordMatchGame() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameEnded, setGameEnded] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    let cardList: CardItem[] = [];
    let idCounter = 1;

    PAIRS_DATA.forEach(pair => {
      // Card A (Term)
      cardList.push({
        id: idCounter++,
        pairId: pair.pairId,
        text: pair.text,
        subtext: 'Istilah',
        isFlipped: false,
        isMatched: false,
      });
      // Card B (Definition)
      cardList.push({
        id: idCounter++,
        pairId: pair.pairId,
        text: pair.subtext,
        subtext: 'Definisi',
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    cardList.sort(() => Math.random() - 0.5);
    setCards(cardList);
    setSelectedCards([]);
    setScore(0);
    setMoves(0);
    setTimeLeft(60);
    setGameEnded(false);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (gameEnded) return;
    if (timeLeft <= 0) {
      setGameEnded(true);
      setIsWon(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameEnded]);

  const handleCardClick = (id: number) => {
    if (gameEnded || selectedCards.length >= 2) return;

    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    const newCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(newCards);

    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const firstCard = cards.find(c => c.id === newSelected[0])!;
      const secondCard = clickedCard;

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          setCards(prev => {
            const updated = prev.map(c => c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c);
            if (updated.every(c => c.isMatched)) {
              setGameEnded(true);
              setIsWon(true);
            }
            return updated;
          });
          setScore(s => s + 150);
          setSelectedCards([]);
        }, 500);
      } else {
        // Not matched -> Flip back
        setTimeout(() => {
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, isFlipped: false } : c));
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <Link href="/siswa/elearning" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700">
        <ArrowLeft className="w-4 h-4" /> Kembali ke E-Learning
      </Link>

      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 rounded-3xl p-6 text-white text-center shadow-xl">
        <div className="text-5xl mb-2">🔤</div>
        <h1 className="text-2xl font-extrabold">Word &amp; Concept Match</h1>
        <p className="text-purple-100 text-xs font-medium mt-1">
          Cocokkan kartu istilah dengan definisinya sebelum waktu 60 detik habis! 🧠
        </p>
      </div>

      {/* HUD Bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-purple-100 px-5 py-3 shadow-2xs text-xs font-bold text-slate-800">
        <div className="flex items-center gap-1.5 text-purple-700">
          <Star className="w-4 h-4 fill-purple-600" /> Skor: <span className="font-extrabold text-sm">{score}</span>
        </div>
        <div className="text-slate-500">
          Percobaan: <span className="font-extrabold text-slate-900">{moves}</span>
        </div>
        <div className={`flex items-center gap-1 font-extrabold text-sm ${timeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
          <Timer className="w-4 h-4" /> {timeLeft}s
        </div>
      </div>

      {/* Game Board Grid */}
      {!gameEnded ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {cards.map(card => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped}
              className={`h-24 rounded-2xl p-2 text-center flex flex-col items-center justify-center transition-all duration-300 border-2 cursor-pointer shadow-2xs ${
                card.isMatched
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-60 scale-95'
                  : card.isFlipped
                  ? 'border-purple-500 bg-purple-50 text-purple-950 font-bold shadow-md'
                  : 'border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 hover:border-purple-400 text-purple-700 font-extrabold'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <div>
                  <p className="text-[11px] font-extrabold leading-tight">{card.text}</p>
                  <span className="text-[9px] font-semibold text-slate-500 mt-1 block">{card.subtext}</span>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-xl block">❓</span>
                  <span className="text-[10px] font-bold text-purple-600/80 mt-1 block">Buka</span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        /* Result Box */
        <div className="bg-white rounded-3xl border border-purple-100 p-8 text-center space-y-4 shadow-xl">
          <div className="text-6xl">{isWon ? '🎉' : '⏰'}</div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isWon ? 'Selamat! Kamu Berhasil!' : 'Waktu Habis! Coba Lagi!'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Skor Akhir: <span className="font-bold text-purple-700 text-sm">{score} XP</span> dalam {moves} percobaan.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={initGame}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Main Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
