import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, Trophy, Medal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Prestasi | SMP Darul Ulum Surabaya',
  description: 'Prestasi dan kebanggaan siswa-siswi SMP Darul Ulum Surabaya.',
};

const ACHIEVEMENTS = [
  { id: '1', title: 'Juara Ekstrakurikuler Silat Pagar Nusa', year: '2025', level: 'Kota Surabaya', desc: 'Prestasi pencak silat Pagar Nusa tingkat kota.' },
  { id: '2', title: 'Prestasi Tim Futsal SMP Darul Ulum', year: '2025', level: 'Kecamatan Tandes', desc: 'Keberhasilan tim futsal dalam ajang turnamen olahraga.' },
  { id: '3', title: 'Penghargaan Keagamaan & Komputer', year: '2024', level: 'Surabaya', desc: 'Pengembangan bakat keagamaan dan kemampuan IT siswa.' },
];

import { PageHero } from '@/components/public/PageHero';

export default function PrestasiPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <PageHero
        title="Prestasi Siswa & Sekolah"
        subtitle="Kebanggaan dan pencapaian siswa-siswi SMP Darul Ulum Surabaya."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Prestasi' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2 inline-block">
                {a.level} · {a.year}
              </span>
              <h2 className="font-bold text-slate-900 text-base mb-2">{a.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
