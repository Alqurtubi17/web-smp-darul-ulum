'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Gamepad2, Trophy, Clock, Play, ChevronRight, Star, Flame, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';

const SUBJECTS = [
  { id:'matematika', name:'Matematika', icon:'🔢', color:'from-blue-500 to-indigo-600', bg:'bg-blue-50', topics:24, done:8, games:3 },
  { id:'ipa',        name:'IPA',        icon:'🔬', color:'from-green-500 to-emerald-600', bg:'bg-green-50', topics:20, done:12, games:2 },
  { id:'ips',        name:'IPS',        icon:'🌏', color:'from-orange-500 to-amber-600', bg:'bg-orange-50', topics:18, done:5, games:2 },
  { id:'bindo',      name:'B. Indonesia',icon:'📖', color:'from-red-500 to-rose-600', bg:'bg-red-50', topics:16, done:6, games:2 },
  { id:'bing',       name:'B. Inggris', icon:'🗣️', color:'from-purple-500 to-violet-600', bg:'bg-purple-50', topics:20, done:10, games:3 },
  { id:'pai',        name:'PAI',        icon:'☪️', color:'from-teal-500 to-cyan-600', bg:'bg-teal-50', topics:14, done:7, games:1 },
];

const GAMES = [
  { id:'quizizz',    name:'Quizizz Live Arena', icon:'🎯', color:'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600', desc:'Arena Kuis Live persis Quizizz! Bisa masuk via QR Code/PIN sebagai Siswa atau Tamu!', bestScore:1450, played:42, difficulty:'Sedang', questionsCount: 15 },
  { id:'tajwid',     name:'Tajwid & PAI Quest', icon:'☪️', color:'bg-gradient-to-br from-emerald-600 to-teal-700', desc:'Kuis Tajwid & hukum bacaan Al-Qur’an interaktif!', bestScore:980, played:18, difficulty:'Sedang', questionsCount: 12 },
  { id:'vocab',      name:'Word & Concept Match', icon:'🧩', color:'bg-gradient-to-br from-indigo-500 to-purple-600', desc:'Cocokkan istilah dan definisi pelajaran!', bestScore:1050, played:14, difficulty:'Mudah', questionsCount: 6 },
  { id:'matematika', name:'Math Blitz', icon:'⚡', color:'bg-gradient-to-br from-blue-500 to-indigo-600', desc:'Jawab soal matematika sebelum waktu habis!', bestScore:850, played:12, difficulty:'Sedang', questionsCount: 6 },
  { id:'scramble',   name:'Word Scramble', icon:'🔤', color:'bg-gradient-to-br from-purple-500 to-violet-600', desc:'Susun huruf jadi kata bahasa Inggris!', bestScore:1200, played:8, difficulty:'Mudah', questionsCount: 5 },
  { id:'memory',     name:'IPA Memory', icon:'🧬', color:'bg-gradient-to-br from-green-500 to-emerald-600', desc:'Pasangkan istilah IPA dengan definisi!', bestScore:640, played:5, difficulty:'Sedang', questionsCount: 5 },
  { id:'quiz-ipa',   name:'Science Quiz', icon:'🔭', color:'bg-gradient-to-br from-teal-500 to-cyan-600', desc:'Kuis sains interaktif dengan penjelasan!', bestScore:920, played:15, difficulty:'Mudah', questionsCount: 5 },
  { id:'timeline',   name:'Sejarah Timeline', icon:'📅', color:'bg-gradient-to-br from-orange-500 to-amber-600', desc:'Urutkan peristiwa sejarah Indonesia!', bestScore:780, played:6, difficulty:'Sulit', questionsCount: 5 },
];

const RECENT_ACTIVITY = [
  { type:'game', name:'Math Blitz', score:850, time:'2 jam lalu', icon:'⚡' },
  { type:'module', name:'Persamaan Linear - Matematika', progress:75, time:'kemarin', icon:'📖' },
  { type:'quiz', name:'Kuis IPA Bab 3 — Sel', score:90, time:'2 hari lalu', icon:'🔬' },
];

const DIFFICULTY_COLOR = { Mudah:'text-green-600 bg-green-100', Sedang:'text-yellow-600 bg-yellow-100', Sulit:'text-red-600 bg-red-100' };

export default function SiswaElearningPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'modul'|'games'|'progress'>('modul');
  const [dbGames, setDbGames] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/elearning-games')
      .then(res => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((g: any) => ({
            id: g.id,
            slug: g.slug || g.id,
            name: g.name,
            icon: g.icon,
            subject: g.subject || 'Umum',
            color: `bg-gradient-to-br ${g.color || 'from-emerald-600 to-teal-700'}`,
            desc: g.desc,
            bestScore: g.bestScore || 1000,
            played: g.played || 0,
            difficulty: g.difficulty || 'Sedang',
            questionsCount: g.questions?.length || 5,
          }));
          setDbGames(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const allGames = dbGames.length > 0 ? dbGames : GAMES;

  const totalDone = SUBJECTS.reduce((a,b) => a+b.done, 0);
  const totalTopics = SUBJECTS.reduce((a,b) => a+b.topics, 0);
  const pct = Math.round((totalDone/totalTopics)*100);
  const totalScore = GAMES.reduce((a,b) => a+b.bestScore, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-800 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-8 right-20 w-28 h-28 bg-white/5 rounded-full"/>
        <div className="relative">
          <h1 className="text-xl font-bold mb-0.5">Halo, {(user as any)?.student?.fullName?.split(' ')[0] || 'Siswa'}!</h1>
          <p className="text-green-200 text-sm">Lanjutkan perjalanan belajarmu hari ini</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{pct}%</p>
              <p className="text-xs text-green-200 mt-0.5">Progress</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{totalDone}</p>
              <p className="text-xs text-green-200 mt-0.5">Topik Selesai</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{totalScore.toLocaleString('id-ID')}</p>
              <p className="text-xs text-green-200 mt-0.5">Total Poin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1.5">
        {([
          { k:'modul', l:'📚 Modul Belajar' },
          { k:'games', l:'🎮 Games Interaktif' },
          { k:'progress', l:'📊 Progress' },
        ] as { k: 'modul'|'games'|'progress'; l: string }[]).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tab===t.k?'bg-white text-green-700 shadow-sm':'text-gray-500'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* MODUL TAB */}
      {tab === 'modul' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map(sub => {
            const pctSub = Math.round((sub.done/sub.topics)*100);
            return (
              <Link key={sub.id} href={`/siswa/elearning/${sub.id}`}
                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sub.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {sub.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-400">{sub.done}/{sub.topics} topik</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">{sub.name}</h3>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Progress</span><span>{pctSub}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${sub.color} rounded-full transition-all`} style={{width:`${pctSub}%`}}/>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>🎮 {sub.games} games</span>
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    Lanjutkan <ChevronRight className="w-3 h-3"/>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* GAMES TAB */}
      {tab === 'games' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <Flame className="w-5 h-5 text-yellow-600 flex-shrink-0"/>
            <p className="text-sm text-yellow-800">Main games untuk kumpulkan poin! Skor tertinggi kamu akan masuk leaderboard kelas. 🏆</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {allGames.map(game => (
              <Link key={game.id || game.slug} href={`/siswa/elearning/game/${game.slug || game.id}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`${game.color} p-5 relative overflow-hidden`}>
                  <div className="absolute -right-4 -top-4 text-7xl opacity-20 leading-none">{game.icon}</div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl block">{game.icon}</span>
                      {game.subject && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/30">
                          {game.subject}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-white text-lg">{game.name}</h3>
                    <p className="text-white/80 text-xs mt-1">{game.desc}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[game.difficulty as keyof typeof DIFFICULTY_COLOR]}`}>{game.difficulty}</span>
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {game.questionsCount || 5} Soal/Kartu
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">Dimainkan {game.played || 0}×</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
                      <span className="text-sm font-bold text-gray-900">{(game.bestScore || 1000).toLocaleString('id-ID')}</span>
                      <span className="text-xs text-gray-400">best score</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 group-hover:gap-2.5 transition-all">
                      <Play className="w-4 h-4 fill-green-600"/> Main
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESS TAB */}
      {tab === 'progress' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600"/> Progress per Mapel
              </h3>
              <div className="space-y-3">
                {SUBJECTS.map(sub => {
                  const pctSub = Math.round((sub.done/sub.topics)*100);
                  return (
                    <div key={sub.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 flex items-center gap-1">{sub.icon} {sub.name}</span>
                        <span className="text-gray-500">{sub.done}/{sub.topics}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${sub.color} rounded-full`} style={{width:`${pctSub}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600"/> Aktivitas Terakhir
              </h3>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl flex-shrink-0">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                      <p className="text-xs text-gray-400">{a.time}</p>
                    </div>
                    {a.type === 'game' || a.type === 'quiz' ? (
                      <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500"/>{a.score}</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600">{(a as {progress?:number}).progress}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard mini */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500"/> Leaderboard Kelas — Top 5
            </h3>
            <div className="space-y-2">
              {[
                { rank:1, name:'Ahmad Rizki Pratama', score:4250, you:true },
                { rank:2, name:'Siti Nurhaliza', score:3980, you:false },
                { rank:3, name:'Budi Permana', score:3750, you:false },
                { rank:4, name:'Dewi Anggraini', score:3420, you:false },
                { rank:5, name:'Reza Firmansyah', score:3100, you:false },
              ].map(p => (
                <div key={p.rank} className={`flex items-center gap-3 p-3 rounded-xl ${p.you?'bg-green-50 border border-green-200':''}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${p.rank===1?'bg-yellow-400 text-yellow-900':p.rank===2?'bg-gray-300 text-gray-700':p.rank===3?'bg-amber-600 text-white':'bg-gray-100 text-gray-600'}`}>
                    {p.rank}
                  </span>
                  <span className={`flex-1 text-sm ${p.you?'font-bold text-green-700':'text-gray-700'}`}>
                    {p.name} {p.you && '(Kamu)'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"/>{p.score.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
