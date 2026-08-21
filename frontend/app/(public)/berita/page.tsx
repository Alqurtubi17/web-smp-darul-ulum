import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, Tag, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Berita', description: 'Berita dan informasi terbaru dari SMP Darul Ulum Surabaya.' };

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface NewsItem { id: string; title: string; slug: string; excerpt: string; thumbnail: string|null; category: string; viewCount: number; publishedAt: string; }

async function getNews(search='', category='') {
  try {
    const params = new URLSearchParams({ limit:'12', status:'PUBLISHED', ...(search && {search}), ...(category && {category}) });
    const res = await fetch(`${API}/news?${params}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []) as NewsItem[];
  } catch { return []; }
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(new Date(d));
}

const CATS = ['Semua','Prestasi','PPDB','Kegiatan','Akademik','Teknologi','Penghargaan','Informasi'];

import { PageHero } from '@/components/public/PageHero';
import { Newspaper } from 'lucide-react';

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ search?: string; category?: string }> }) {
  const resolvedParams = await searchParams;
  const search = resolvedParams?.search || '';
  const category = resolvedParams?.category || '';
  const news = await getNews(search, category);

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      {/* Hero */}
      <PageHero
        title="Berita & Informasi"
        subtitle="Kabar terkini dan informasi resmi dari SMP Darul Ulum Surabaya."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Berita' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          <form method="GET" action="/berita" className="flex-1 max-w-md">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative">
              <input type="search" name="search" defaultValue={search} placeholder="Cari berita..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"/>
            </div>
          </form>
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(cat => {
              const isSelected = (cat === 'Semua' && !category) || (category === cat);
              const href = cat === 'Semua'
                ? (search ? `/berita?search=${encodeURIComponent(search)}` : '/berita')
                : `/berita?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ''}`;

              return (
                <Link key={cat} href={href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50/70 border border-emerald-100 text-slate-600 hover:bg-emerald-100/70 hover:text-emerald-900'}`}>
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100 p-8 shadow-xs">
            <p className="text-base font-bold text-slate-700 mb-2">Tidak ada berita ditemukan</p>
            <p className="text-xs text-slate-500 mb-4">Coba cari dengan kata kunci lain atau pilih kategori berbeda.</p>
            <Link href="/berita" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">Lihat Semua Berita</Link>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && !search && !category && (
              <Link href={`/berita/${featured.slug}`} className="group block mb-10">
                <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden bg-emerald-50 border border-emerald-100 shadow-sm">
                  {featured.thumbnail ? (
                    <Image src={featured.thumbnail} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                      <span className="text-white/30 text-6xl font-bold">{featured.title[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
                    {featured.category && <span className="inline-block mb-3 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-full w-fit shadow-xs">{featured.category}</span>}
                    <h2 className="text-white text-xl sm:text-2xl font-extrabold mb-2 group-hover:text-emerald-300 transition-colors line-clamp-2">{featured.title}</h2>
                    <div className="flex items-center gap-4 text-emerald-100 text-xs font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-400"/>{formatDate(featured.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-400"/>{featured.viewCount} dibaca</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featured && !search && !category ? rest : news).map(item => (
                <Link key={item.id} href={`/berita/${item.slug}`}
                  className="group bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col">
                  <div className="h-48 bg-emerald-50 relative overflow-hidden flex-shrink-0">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                        <span className="text-emerald-700/40 text-4xl font-bold">{item.title[0]}</span>
                      </div>
                    )}
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs">{item.category}</span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">{item.title}</h3>
                      {item.excerpt && <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2 font-medium">{item.excerpt}</p>}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium"><Calendar className="w-3 h-3 text-emerald-600"/>{formatDate(item.publishedAt)}</span>
                      <span className="text-xs text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all font-bold">Baca <ArrowRight className="w-3 h-3"/></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
