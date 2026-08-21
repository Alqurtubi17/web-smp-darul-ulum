'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Lock, CheckCircle, BookOpen, FileText, Gamepad2, ChevronRight } from 'lucide-react';

const SUBJECT_DATA: Record<string, {
  name: string; icon: string; color: string; desc: string;
  chapters: { id: number; title: string; topics: { id: number; title: string; type: 'video'|'reading'|'quiz'; done: boolean; duration: string }[] }[];
  games: { id: string; name: string; icon: string }[];
}> = {
  matematika: {
    name:'Matematika', icon:'🔢', color:'from-blue-500 to-indigo-600', desc:'Aljabar, Geometri, Statistika',
    chapters: [
      { id:1, title:'Bilangan Bulat & Pecahan', topics:[
        { id:1, title:'Operasi Bilangan Bulat', type:'video', done:true, duration:'12 menit' },
        { id:2, title:'Pecahan Biasa & Campuran', type:'video', done:true, duration:'15 menit' },
        { id:3, title:'Kuis: Bilangan', type:'quiz', done:true, duration:'10 menit' },
      ]},
      { id:2, title:'Aljabar Linear', topics:[
        { id:4, title:'Persamaan Linear Satu Variabel', type:'video', done:true, duration:'18 menit' },
        { id:5, title:'Sistem Persamaan Linear', type:'reading', done:false, duration:'10 menit' },
        { id:6, title:'Latihan Soal PLSV', type:'quiz', done:false, duration:'15 menit' },
      ]},
      { id:3, title:'Geometri', topics:[
        { id:7, title:'Luas & Keliling Bangun Datar', type:'video', done:false, duration:'20 menit' },
        { id:8, title:'Volume Bangun Ruang', type:'video', done:false, duration:'18 menit' },
        { id:9, title:'Teorema Pythagoras', type:'reading', done:false, duration:'12 menit' },
      ]},
    ],
    games: [{ id:'matematika', name:'Math Blitz', icon:'⚡' }],
  },
  ipa: {
    name:'IPA', icon:'🔬', color:'from-green-500 to-emerald-600', desc:'Fisika, Kimia & Biologi',
    chapters: [
      { id:1, title:'Sel — Unit Kehidupan', topics:[
        { id:1, title:'Struktur dan Fungsi Sel', type:'video', done:true, duration:'15 menit' },
        { id:2, title:'Perbedaan Sel Hewan & Tumbuhan', type:'reading', done:true, duration:'8 menit' },
        { id:3, title:'Kuis: Sel', type:'quiz', done:false, duration:'10 menit' },
      ]},
      { id:2, title:'Gerak & Gaya', topics:[
        { id:4, title:'Hukum Newton I, II, III', type:'video', done:false, duration:'20 menit' },
        { id:5, title:'Gerak Lurus Beraturan', type:'video', done:false, duration:'15 menit' },
      ]},
      { id:3, title:'Listrik & Magnet', topics:[
        { id:6, title:'Rangkaian Listrik Seri & Paralel', type:'video', done:false, duration:'18 menit' },
        { id:7, title:'Kemagnetan', type:'reading', done:false, duration:'12 menit' },
      ]},
    ],
    games: [{ id:'memory', name:'IPA Memory', icon:'🧬' }, { id:'quiz-ipa', name:'Science Quiz', icon:'🔭' }],
  },
};

const DEFAULT_SUBJECT = {
  name:'Mata Pelajaran', icon:'📚', color:'from-gray-500 to-gray-600', desc:'Konten segera hadir',
  chapters: [], games: [],
};

const TYPE_CONFIG = {
  video:   { icon:<Play className="w-3.5 h-3.5"/>,     label:'Video',   color:'text-blue-600' },
  reading: { icon:<FileText className="w-3.5 h-3.5"/>, label:'Bacaan',  color:'text-green-600' },
  quiz:    { icon:<BookOpen className="w-3.5 h-3.5"/>, label:'Kuis',    color:'text-orange-600' },
};

export default function SubjectDetailPage({ params }: { params: { subjectId: string } }) {
  const subject = SUBJECT_DATA[params.subjectId] || DEFAULT_SUBJECT;
  const [openChapter, setOpenChapter] = useState<number>(1);

  const totalTopics = subject.chapters.reduce((a, c) => a + c.topics.length, 0);
  const doneTopics = subject.chapters.reduce((a, c) => a + c.topics.filter(t => t.done).length, 0);
  const pct = totalTopics ? Math.round((doneTopics / totalTopics) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/siswa/elearning" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-600"/>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{subject.name}</h1>
          <p className="text-sm text-gray-500">{subject.desc}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`bg-gradient-to-r ${subject.color} rounded-2xl p-5 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{subject.icon}</span>
            <div>
              <p className="font-bold">{subject.name}</p>
              <p className="text-xs text-white/70">{doneTopics}/{totalTopics} topik selesai</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{pct}%</p>
            <p className="text-xs text-white/70">Progress</p>
          </div>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{width:`${pct}%`}}/>
        </div>
      </div>

      {/* Games shortcut */}
      {subject.games.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-purple-500"/> Game untuk {subject.name}
          </p>
          <div className="flex gap-3">
            {subject.games.map(g => (
              <Link key={g.id} href={`/siswa/elearning/game/${g.id}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group">
                <span className="text-xl">{g.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">{g.name}</span>
                <Play className="w-3.5 h-3.5 text-purple-500 ml-1"/>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Chapters */}
      <div className="space-y-3">
        {subject.chapters.map((ch, chIdx) => {
          const chDone = ch.topics.filter(t => t.done).length;
          const isOpen = openChapter === ch.id;
          const isLocked = chIdx > 0 && subject.chapters[chIdx-1].topics.filter(t=>t.done).length < subject.chapters[chIdx-1].topics.length / 2;
          return (
            <div key={ch.id} className={`bg-white rounded-2xl border overflow-hidden ${isLocked?'border-gray-100 opacity-60':'border-gray-200'}`}>
              <button onClick={() => !isLocked && setOpenChapter(isOpen ? -1 : ch.id)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${chDone >= ch.topics.length ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {isLocked ? <Lock className="w-4 h-4 text-gray-400"/> : chDone >= ch.topics.length ? <CheckCircle className="w-5 h-5 text-green-600"/> : <span className="text-lg">📖</span>}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{ch.title}</p>
                  <p className="text-xs text-gray-400">{chDone}/{ch.topics.length} selesai</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${subject.color} rounded-full`} style={{width:`${ch.topics.length?Math.round((chDone/ch.topics.length)*100):0}%`}}/>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen?'rotate-90':''}`}/>
                </div>
              </button>

              {isOpen && !isLocked && (
                <div className="border-t border-gray-100 divide-y divide-gray-100">
                  {ch.topics.map(topic => {
                    const cfg = TYPE_CONFIG[topic.type];
                    return (
                      <div key={topic.id} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 cursor-pointer ${topic.done?'':'opacity-80'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${topic.done?'bg-green-100 text-green-600':'bg-gray-100 text-gray-500'}`}>
                          {topic.done ? <CheckCircle className="w-4 h-4"/> : cfg.icon}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${topic.done?'text-gray-500 line-through':'text-gray-900'}`}>{topic.title}</p>
                          <p className={`text-xs mt-0.5 flex items-center gap-1 ${cfg.color}`}>{cfg.icon} {cfg.label} · {topic.duration}</p>
                        </div>
                        {!topic.done && (
                          <button className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold flex items-center gap-1">
                            <Play className="w-3 h-3 fill-white"/> Mulai
                          </button>
                        )}
                        {topic.done && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
