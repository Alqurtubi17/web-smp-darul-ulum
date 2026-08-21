import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download | SMP Darul Ulum Surabaya',
  description: 'Unduh berkas dan dokumen resmi SMP Darul Ulum Surabaya.',
};

const FILES = [
  { name: 'Formulir Pendaftaran PPDB Offline (PDF)', size: '250 KB' },
  { name: 'Brosur Informasi Sekolah 2025/2026 (PDF)', size: '1.2 MB' },
  { name: 'Jadwal Pembiasaan & Tata Tertib Sekolah (PDF)', size: '420 KB' },
];

import { PageHero } from '@/components/public/PageHero';

export default function DownloadPage() {
  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <PageHero
        title="Pusat Download Berkas"
        subtitle="Dokumen dan berkas publik yang dapat diunduh."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Download' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-emerald-100 divide-y divide-emerald-100 shadow-xs">
          {FILES.map((f, i) => (
            <div key={i} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{f.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{f.size}</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs hover:bg-emerald-200 transition-colors flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Unduh
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
