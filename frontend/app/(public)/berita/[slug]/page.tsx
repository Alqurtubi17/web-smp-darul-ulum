import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Eye, ArrowLeft, Tag } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function getNews(slug: string) {
  try {
    const res = await fetch(`${API}/news/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch { return null; }
}

async function getRelated(category: string, currentSlug: string) {
  try {
    const res = await fetch(`${API}/news?status=PUBLISHED&category=${category}&limit=3`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).filter((n: { slug: string }) => n.slug !== currentSlug).slice(0, 3);
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) return { title: 'Berita tidak ditemukan' };
  return {
    title: news.title,
    description: news.excerpt || news.title,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.thumbnail ? [news.thumbnail] : [],
      type: 'article',
    },
  };
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' }).format(new Date(d));
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();

  const related = news.category ? await getRelated(news.category, slug) : [];

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      {/* Thumbnail hero */}
      {news.thumbnail && (
        <div className="relative h-64 sm:h-96 bg-emerald-50 border-b border-emerald-100">
          <Image src={news.thumbnail} alt={news.title} fill className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"/>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6">
          <Link href="/" className="hover:text-emerald-700">Beranda</Link>
          <span>/</span>
          <Link href="/berita" className="hover:text-emerald-700">Berita</Link>
          <span>/</span>
          <span className="text-slate-900 line-clamp-1">{news.title}</span>
        </div>

        <article className="bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs">
          <div className="p-6 sm:p-10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {news.category && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">{news.category}</span>
              )}
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600"/>{formatDate(news.publishedAt)}</span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Eye className="w-4 h-4 text-emerald-600"/>{news.viewCount} dibaca</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-6">{news.title}</h1>

            {/* Content */}
            <div
              className="prose prose-sm sm:prose max-w-none text-slate-700 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            {/* Tags */}
            {news.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-emerald-600"/>
                {news.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Back + Related */}
        <div className="mt-8 flex items-center gap-3">
          <Link href="/berita" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors shadow-xs">
            <ArrowLeft className="w-4 h-4 text-emerald-600"/> Kembali ke Berita
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-extrabold text-slate-900 mb-5">Berita Terkait</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((item: { id: string; slug: string; title: string; thumbnail: string|null; publishedAt: string; }) => (
                <Link key={item.id} href={`/berita/${item.slug}`}
                  className="group bg-white rounded-2xl border border-emerald-100 overflow-hidden hover:shadow-md transition-all shadow-xs">
                  <div className="h-32 bg-emerald-50 relative">
                    {item.thumbnail && <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform"/>}
                  </div>
                  <div className="p-3.5">
                    <p className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-700">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{formatDate(item.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
