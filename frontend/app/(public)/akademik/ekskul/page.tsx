import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ekstrakurikuler | SMP Darul Ulum Surabaya',
  description: 'Program ekstrakurikuler dan pengembangan minat bakat SMP Darul Ulum Surabaya.',
};

const EXTRA = [
  { title: 'Pramuka', desc: 'Pengembangan kedisiplinan dan kepramukaan wajib.' },
  { title: 'Pencak Silat Pagar Nusa', desc: 'Seni bela diri tradisional khas Nahdlatul Ulama.' },
  { title: 'Tim Futsal Sekolah', desc: 'Pembinaan bakat olahraga dan fisik siswa.' },
  { title: 'Pelatihan Komputer & IT', desc: 'Keterampilan multimedia dan teknologi digital.' },
  { title: 'Kajian & Seni Al-Qur’an', desc: 'Pengembangan kemampuan seni tilawah dan keagamaan.' },
];

export default function EkskulPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <div className="bg-gradient-to-b from-emerald-50/80 via-emerald-50/30 to-white border-b border-emerald-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-950">Beranda</Link>
            <span>/</span>
            <span>Akademik</span>
            <span>/</span>
            <span className="text-slate-900">Ekstrakurikuler</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kegiatan Ekstrakurikuler</h1>
          <p className="text-slate-600 text-sm mt-2 max-w-xl font-medium">Pengembangan minat, bakat, dan karakter kepemimpinan siswa.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {EXTRA.map((e) => (
            <div key={e.title} className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <h2 className="font-extrabold text-slate-900 text-base">{e.title}</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium pl-7">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
