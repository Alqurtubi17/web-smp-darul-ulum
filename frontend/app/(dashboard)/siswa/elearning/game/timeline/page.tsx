'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Check, X, RotateCcw, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

type Phase = 'menu' | 'playing' | 'result';

interface Event { id: number; title: string; year: string; desc: string; emoji: string; }

const EVENT_SETS = [
  {
    name: 'Kemerdekaan & Proklamasi',
    events: [
      { id:1, year:'1908', title:'Budi Utomo', desc:'Organisasi pergerakan nasional pertama Indonesia didirikan oleh dr. Wahidin Sudirohusodo', emoji:'🌟' },
      { id:2, year:'1928', title:'Sumpah Pemuda', desc:'Pemuda Indonesia berikrar satu nusa, satu bangsa, satu bahasa Indonesia', emoji:'🤝' },
      { id:3, year:'1942', title:'Pendudukan Jepang', desc:'Jepang menguasai Indonesia setelah mengalahkan Belanda dalam Perang Asia Timur Raya', emoji:'⚔️' },
      { id:4, year:'1945', title:'Proklamasi Kemerdekaan', desc:'Soekarno-Hatta memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945', emoji:'🇮🇩' },
      { id:5, year:'1949', title:'Pengakuan Kedaulatan', desc:'Belanda mengakui kedaulatan Indonesia melalui Konferensi Meja Bundar di Den Haag', emoji:'🕊️' },
    ],
  },
  {
    name: 'Reformasi & Era Modern',
    events: [
      { id:6, year:'1966', title:'Orde Baru',  desc:'Soeharto naik ke tampuk kekuasaan menggantikan era Orde Lama Soekarno', emoji:'🔄' },
      { id:7, year:'1998', title:'Reformasi', desc:'Lengsernya Soeharto setelah 32 tahun berkuasa akibat krisis ekonomi dan gerakan mahasiswa', emoji:'✊' },
      { id:8, year:'1999', title:'Pemilu Pertama Era Reformasi', desc:'Pemilihan umum multipartai pertama pasca reformasi diikuti 48 partai politik', emoji:'🗳️' },
      { id:9, year:'2004', title:'Pemilu Presiden Langsung', desc:'Indonesia pertama kali menggelar pemilihan presiden secara langsung oleh rakyat', emoji:'🗳️' },
      { id:10, year:'2014', title:'Joko Widodo Terpilih', desc:'Joko Widodo terpilih sebagai presiden ke-7 Indonesia dalam pilpres 2014', emoji:'🤴' },
    ],
  },
  {
    name: 'Peristiwa Dunia',
    events: [
      { id:11, year:'1789', title:'Revolusi Perancis', desc:'Rakyat Perancis menggulingkan monarki dan mendirikan republik dengan semboyan Liberté, Égalité, Fraternité', emoji:'🗼' },
      { id:12, year:'1865', title:'Penghapusan Perbudakan (AS)', desc:'Amerika Serikat mengesahkan Amandemen ke-13 yang menghapus perbudakan', emoji:'⛓️' },
      { id:13, year:'1917', title:'Revolusi Rusia', desc:'Kaum Bolshevik pimpinan Lenin menggulingkan Tsar dan mendirikan Uni Soviet', emoji:'☭' },
      { id:14, year:'1945', title:'PD II Berakhir', desc:'Jepang menyerah setelah bom atom dijatuhkan di Hiroshima dan Nagasaki', emoji:'☮️' },
      { id:15, year:'1969', title:'Manusia ke Bulan', desc:'Neil Armstrong menjadi manusia pertama yang menjejakkan kaki di Bulan melalui misi Apollo 11', emoji:'🚀' },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function TimelineGame() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [setIdx, setSetIdx] = useState(0);
  const [items, setItems] = useState<Event[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const ROUNDS = EVENT_SETS.length;

  const startGame = () => {
    setRound(0); setSetIdx(0); setScore(0); setRoundScores([]);
    setItems(shuffle(EVENT_SETS[0].events));
    setChecked(false);
    setPhase('playing');
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    if (checked) return;
    const ni = idx + dir;
    if (ni < 0 || ni >= items.length) return;
    const next = [...items];
    [next[idx], next[ni]] = [next[ni], next[idx]];
    setItems(next);
  };

  const checkAnswer = () => {
    setChecked(true);
    const correct = EVENT_SETS[setIdx].events; // already sorted by year
    let pts = 0;
    items.forEach((item, i) => { if (item.id === correct[i].id) pts += 200; });
    pts += Math.max(0, 500 - (correct.length - items.filter((item, i) => item.id === correct[i].id).length) * 100);
    setScore(s => s + pts);
    setRoundScores(r => [...r, pts]);
  };

  const nextRound = () => {
    const nextRound = round + 1;
    if (nextRound >= ROUNDS) { setPhase('result'); return; }
    setRound(nextRound);
    setSetIdx(nextRound);
    setItems(shuffle(EVENT_SETS[nextRound].events));
    setChecked(false);
  };

  const correctOrder = EVENT_SETS[setIdx]?.events || [];
  const correctCount = checked ? items.filter((item, i) => item.id === correctOrder[i].id).length : 0;

  if (phase === 'menu') return (
    <div className="max-w-md mx-auto space-y-3.5">
      <Link href="/siswa/elearning" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-bold"><ArrowLeft className="w-3.5 h-3.5"/> Kembali</Link>
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white text-center shadow-md">
        <div className="text-3xl mb-1.5">📅</div>
        <h1 className="text-lg font-extrabold mb-1">Sejarah Timeline</h1>
        <p className="text-orange-100 text-xs font-medium">Urutkan peristiwa sejarah dari yang paling awal!<br/>3 set soal, 5 peristiwa tiap set 🏛️</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {EVENT_SETS.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-2 text-center shadow-2xs">
            <span className="text-base">📜</span>
            <p className="text-[11px] font-bold text-gray-900 mt-0.5 truncate">{s.name}</p>
            <p className="text-[9px] text-gray-400">{s.events.length} peristiwa</p>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-600 space-y-1 border border-gray-200 font-medium">
        <p>↕️ Gunakan tombol ↑↓ untuk menggeser urutan peristiwa</p>
        <p>✅ Klik "Cek Jawaban" setelah yakin dengan urutan</p>
        <p>🎯 Setiap posisi benar = +200 poin</p>
        <p>📚 Ada 3 set soal — sejarah Indonesia &amp; dunia!</p>
      </div>
      <button onClick={startGame} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-2xs cursor-pointer">
        📅 Mulai Main
      </button>
    </div>
  );

  if (phase === 'result') {
    const totalPossible = ROUNDS * (EVENT_SETS[0].events.length * 200 + 500);
    const pct = Math.round((score / totalPossible) * 100);
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className={`rounded-3xl p-8 text-white text-center shadow-2xl ${pct>=80?'bg-gradient-to-br from-yellow-400 to-orange-500':'bg-gradient-to-br from-orange-500 to-amber-600'}`}>
          <div className="text-5xl mb-3">{pct>=90?'🏆':pct>=70?'🥇':pct>=50?'🥈':'📚'}</div>
          <h2 className="text-3xl font-extrabold">{pct>=90?'Ahli Sejarah!':pct>=70?'Sangat Bagus!':pct>=50?'Cukup Baik!':'Banyak Belajar Lagi!'}</h2>
          <p className="text-white/80 mt-1">Total: {score.toLocaleString('id-ID')} poin</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Hasil per Set</p>
          {EVENT_SETS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0 border-gray-100">
              <span className="text-sm text-gray-700">{s.name}</span>
              <span className="text-sm font-bold text-orange-600">{(roundScores[i]||0).toLocaleString('id-ID')} poin</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={()=>setPhase('menu')} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"><RotateCcw className="w-4 h-4 inline mr-1"/>Ulang</button>
          <button onClick={startGame} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold">Main Lagi!</button>
        </div>
        <Link href="/siswa/elearning" className="block text-center text-sm text-gray-500 hover:text-green-600">← E-Learning</Link>
      </div>
    );
  }

  const curSet = EVENT_SETS[setIdx];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* HUD */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 px-5 py-3">
        <span className="text-sm font-semibold text-gray-600">Set {round+1}/{ROUNDS}</span>
        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/><span className="font-extrabold text-gray-900">{score.toLocaleString('id-ID')}</span></div>
        {checked && <span className="text-sm font-bold text-green-600">{correctCount}/{items.length} benar</span>}
      </div>

      {/* Set title */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-4 text-white">
        <p className="text-xs text-orange-200 mb-1">Urutkan dari tahun paling awal (atas) ke paling akhir (bawah):</p>
        <h2 className="font-extrabold text-lg">{curSet.name}</h2>
      </div>

      {/* Timeline items */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const isCorrectPos = checked && item.id === correctOrder[i].id;
          const isWrong = checked && item.id !== correctOrder[i].id;
          const correctPosNum = correctOrder.findIndex(e => e.id === item.id);
          return (
            <div key={item.id}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                isCorrectPos ? 'border-green-400 bg-green-50'
                : isWrong ? 'border-red-400 bg-red-50'
                : 'border-gray-200 bg-white'
              }`}>
              {/* Position number */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                isCorrectPos ? 'bg-green-500 text-white'
                : isWrong ? 'bg-red-400 text-white'
                : 'bg-orange-100 text-orange-700'
              }`}>{i + 1}</div>

              {/* Emoji */}
              <span className="text-2xl flex-shrink-0">{item.emoji}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{item.year}</span>
                  <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>
                {isWrong && (
                  <p className="text-xs text-red-500 mt-0.5">✗ Posisi benar: ke-{correctPosNum + 1} ({correctOrder[correctPosNum].year})</p>
                )}
              </div>

              {/* Controls */}
              {!checked && (
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0}
                    className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center disabled:opacity-30 hover:bg-orange-200 transition-colors">
                    <ChevronUp className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1}
                    className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center disabled:opacity-30 hover:bg-orange-200 transition-colors">
                    <ChevronDown className="w-3.5 h-3.5"/>
                  </button>
                </div>
              )}
              {checked && isCorrectPos && <Check className="w-5 h-5 text-green-500 flex-shrink-0"/>}
              {checked && isWrong && <X className="w-5 h-5 text-red-400 flex-shrink-0"/>}
            </div>
          );
        })}
      </div>

      {/* Action button */}
      {!checked ? (
        <button onClick={checkAnswer}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 text-white font-extrabold text-base transition-all hover:scale-105 shadow-lg">
          ✅ Cek Urutan Saya!
        </button>
      ) : (
        <div className="space-y-3">
          <div className={`p-4 rounded-2xl text-center font-bold ${correctCount===items.length?'bg-green-50 text-green-700':correctCount>=3?'bg-blue-50 text-blue-700':'bg-orange-50 text-orange-700'}`}>
            {correctCount === items.length ? '🏆 Sempurna! Semua benar!' : `✅ ${correctCount} dari ${items.length} posisi benar!`}
            <p className="text-sm font-normal mt-1">+{roundScores[round]?.toLocaleString('id-ID')} poin</p>
          </div>
          <button onClick={nextRound}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-base hover:scale-105 transition-all shadow-lg">
            {round + 1 >= ROUNDS ? '🏁 Lihat Hasil Akhir' : `➡️ Set Berikutnya (${round+2}/${ROUNDS})`}
          </button>
        </div>
      )}
    </div>
  );
}
