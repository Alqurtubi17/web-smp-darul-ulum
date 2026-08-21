import type { Metadata } from 'next';
import Link from 'next/link';
import { Pin, Calendar, FileText, ChevronRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Pengumuman', description: 'Pengumuman resmi dari SMP Darul Ulum Surabaya.' };
export const revalidate = 60;

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Ann { id: string; title: string; content: string; isPinned: boolean; targetRoles: string[]; publishedAt: string; expiresAt: string | null; fileUrl: string | null; }

async function getAnnouncements() {
  try {
    const res = await fetch(`${API}/announcements?limit=50&isPublic=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []) as Ann[];
  } catch { return []; }
}

function fmtDate(d: string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('id-ID', opts || { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
}

import { PageHero } from '@/components/public/PageHero';
import { Megaphone } from 'lucide-react';

export default async function PengumumanPage() {
  const list = await getAnnouncements();
  const pinned = list.filter(a => a.isPinned);
  const regular = list.filter(a => !a.isPinned);

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <PageHero
        title="Pengumuman"
        subtitle="Informasi dan pengumuman resmi dari SMP Darul Ulum Surabaya."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Pengumuman' },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Pinned */}
        {pinned.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-widest mb-4">
              <Pin className="w-4 h-4"/> Pengumuman Penting
            </h2>
            <div className="space-y-3">
              {pinned.map(a => (
                <div key={a.id} className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 shadow-xs">
                  <div className="flex items-start gap-3">
                    <Pin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5"/>
                    <div className="flex-1">
                      <h3 className="font-extrabold text-slate-900 leading-snug">{a.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-rose-600"/> {fmtDate(a.publishedAt)}
                        {a.expiresAt && <span>· s.d. {fmtDate(a.expiresAt)}</span>}
                      </p>
                      <p className="text-sm text-slate-700 mt-2.5 leading-relaxed line-clamp-3 font-medium">{a.content}</p>
                      {a.fileUrl && (
                        <a href={a.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-rose-700 hover:underline">
                          <FileText className="w-3.5 h-3.5"/> Unduh Dokumen
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pengumuman Terbaru</h2>
          {list.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-emerald-100 text-slate-400 font-medium shadow-xs">
              <p className="text-sm">Belum ada pengumuman</p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-100 bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs">
              {regular.map(a => (
                <div key={a.id} className="p-5 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{a.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                        <Calendar className="w-3 h-3 text-emerald-600"/> {fmtDate(a.publishedAt)}
                        {a.expiresAt && <span>· s.d. {fmtDate(a.expiresAt)}</span>}
                      </p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2 font-medium">{a.content}</p>
                      {a.fileUrl && (
                        <a href={a.fileUrl} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700 hover:underline">
                          <FileText className="w-3.5 h-3.5"/> Unduh Dokumen
                        </a>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
