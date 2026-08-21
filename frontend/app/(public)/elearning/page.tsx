import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Gamepad2, Trophy, Users, Star, Play, ChevronRight, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-Learning — SMP Darul Ulum',
  description: 'Platform belajar online interaktif dengan modul, video, kuis, dan games edukatif SMP Darul Ulum Surabaya.',
};

const SUBJECTS = [
  { id:'matematika', name:'Matematika', icon:'🔢', color:'from-blue-500 to-indigo-600', topics:24, games:3, desc:'Aljabar, geometri, statistika & fungsi' },
  { id:'ipa',        name:'IPA',        icon:'🔬', color:'from-green-500 to-emerald-600', topics:20, games:2, desc:'Fisika, kimia & biologi terpadu' },
  { id:'ips',        name:'IPS',        icon:'🌏', color:'from-orange-500 to-amber-600',  topics:18, games:2, desc:'Sejarah, geografi, ekonomi & sosiologi' },
  { id:'bindo',      name:'B. Indonesia',icon:'📖', color:'from-red-500 to-rose-600',    topics:16, games:2, desc:'Sastra, tata bahasa & menulis kreatif' },
  { id:'bing',       name:'B. Inggris', icon:'🗣️', color:'from-purple-500 to-violet-600',topics:20, games:3, desc:'Grammar, vocabulary & speaking' },
  { id:'pai',        name:'PAI',        icon:'☪️', color:'from-teal-500 to-cyan-600',   topics:14, games:1, desc:'Fiqih, akidah, akhlak & Al-Quran' },
];

const GAMES = [
  { id:'matematika', name:'Math Blitz', icon:'⚡', color:'bg-blue-500', desc:'Tantang kemampuan matematikamu! Jawab soal sebelum waktu habis.', tags:['Kelas 7-9','Aljabar','Aritmatika'] },
  { id:'scramble',   name:'Word Scramble', icon:'🔤', color:'bg-purple-500', desc:'Susun huruf acak menjadi kosakata Bahasa Inggris yang benar!', tags:['Kelas 7-9','Vocabulary','Spelling'] },
  { id:'memory',     name:'IPA Memory Match', icon:'🧬', color:'bg-green-500', desc:'Pasangkan istilah IPA dengan definisinya dalam waktu singkat.', tags:['Kelas 7-9','Biologi','Kimia'] },
  { id:'quiz-ipa',   name:'Science Quiz', icon:'🔭', color:'bg-emerald-500', desc:'Kuis sains interaktif dengan animasi dan penjelasan lengkap.', tags:['Kelas 7-9','Fisika','IPA'] },
  { id:'timeline',   name:'Sejarah Timeline', icon:'📅', color:'bg-orange-500', desc:'Urutkan peristiwa sejarah Indonesia dari yang paling awal!', tags:['Kelas 7-9','Sejarah','IPS'] },
];

const STATS = [
  { icon:<BookOpen className="w-6 h-6"/>, val:'92+', label:'Modul Belajar', color:'text-blue-600 bg-blue-100' },
  { icon:<Gamepad2 className="w-6 h-6"/>, val:'5', label:'Game Interaktif', color:'text-purple-600 bg-purple-100' },
  { icon:<Users className="w-6 h-6"/>, val:'300+', label:'Siswa Aktif', color:'text-green-600 bg-green-100' },
  { icon:<Trophy className="w-6 h-6"/>, val:'1.2K+', label:'Kuis Diselesaikan', color:'text-yellow-600 bg-yellow-100' },
];

export default function ElearningLandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900">
      {/* Hero */}
      <div className="relative overflow-hidden py-16 px-4 bg-gradient-to-b from-emerald-50/70 via-emerald-50/20 to-white border-b border-emerald-100">
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight text-slate-900 tracking-tight">
            Belajar Lebih <span className="text-emerald-700">Seru & Interaktif</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium">
            Pelajari mata pelajaran SMP lewat modul ringkas, kuis online, dan game edukatif interaktif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs">
              <Play className="w-4 h-4 fill-white"/> Mulai Belajar Sekarang
            </Link>
            <a href="#games"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-900 font-semibold text-sm transition-all">
              <Gamepad2 className="w-4 h-4"/> Lihat Games
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white border border-emerald-100 rounded-2xl p-5 text-center shadow-xs">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-extrabold text-slate-900">{s.val}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2 tracking-tight">📚 Mata Pelajaran</h2>
        <p className="text-slate-600 text-center text-sm mb-8 font-medium">Modul belajar lengkap sesuai kurikulum SMP</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map(sub => (
            <Link key={sub.id} href="/auth/login"
              className="group bg-white border border-emerald-100 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sub.color} flex items-center justify-center text-2xl mb-3 text-white shadow-xs`}>
                {sub.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{sub.name}</h3>
              <p className="text-xs text-slate-600 mb-3 font-medium">{sub.desc}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>📖 {sub.topics} topik</span>
                <span>🎮 {sub.games} games</span>
                <span className="text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1 font-bold">Mulai <ChevronRight className="w-3 h-3"/></span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Games */}
      <div id="games" className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2 tracking-tight">🎮 Game Edukatif Interaktif</h2>
        <p className="text-slate-600 text-center text-sm mb-8 font-medium">Belajar sambil bermain — game edukatif untuk latihan siswa</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map(game => (
            <Link key={game.id} href="/auth/login"
              className="group bg-white border border-emerald-100 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 text-6xl opacity-5 leading-none p-2">{game.icon}</div>
              <div className={`w-10 h-10 rounded-xl ${game.color} text-white flex items-center justify-center text-xl mb-3 shadow-xs`}>{game.icon}</div>
              <h3 className="font-bold text-slate-900 mb-1">{game.name}</h3>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">{game.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map(t => (
                  <span key={t} className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                <Play className="w-3 h-3 fill-emerald-600"/> Main Sekarang
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-20 text-center">
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-10 shadow-xs">
          <p className="text-2xl font-extrabold text-emerald-950 mb-2 tracking-tight">Siap Belajar?</p>
          <p className="text-slate-600 text-sm mb-6 font-medium">Login dengan akun sekolah untuk mengakses semua modul e-learning</p>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs">
            <Star className="w-4 h-4 fill-white"/> Login & Mulai Belajar
          </Link>
        </div>
      </div>
    </div>
  );
}
