import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Grid3X3, Video } from 'lucide-react';

export const metadata: Metadata = { title: 'Galeri', description: 'Galeri foto dan video kegiatan SMP Darul Ulum Surabaya.' };
export const revalidate = 300;

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface Album { id: string; title: string; description: string | null; cover: string | null; type: 'FOTO' | 'VIDEO'; _count: { items: number }; createdAt: string; }

async function getAlbums() {
  try {
    const res = await fetch(`${API}/gallery?limit=24&isPublic=true`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []) as Album[];
  } catch { return []; }
}

import { PageHero } from '@/components/public/PageHero';

export default async function GaleriPage() {
  const albums = await getAlbums();
  const photos = albums.filter(a => a.type === 'FOTO');
  const videos = albums.filter(a => a.type === 'VIDEO');

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen">
      <PageHero
        title="Galeri Sekolah"
        subtitle="Dokumentasi kegiatan dan momen berharga di SMP Darul Ulum Surabaya."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Galeri' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {albums.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100 text-slate-400 font-medium shadow-xs">
            <Grid3X3 className="w-12 h-12 mx-auto mb-3 text-emerald-300 opacity-60"/>
            <p>Belum ada album galeri</p>
          </div>
        ) : (
          <>
            {photos.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 mb-6">
                  <Grid3X3 className="w-5 h-5 text-emerald-600"/> Album Foto
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map(album => (
                    <Link key={album.id} href={`/galeri/${album.id}`}
                      className="group bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col">
                      <div className="h-40 bg-emerald-50 relative overflow-hidden flex-shrink-0">
                        {album.cover ? (
                          <Image src={album.cover} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-emerald-300">
                            <Grid3X3 className="w-10 h-10" />
                          </div>
                        )}
                        <span className="absolute bottom-2 right-2 text-xs bg-slate-900/70 text-white font-bold px-2 py-0.5 rounded-full">
                          {album._count.items} foto
                        </span>
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                          {album.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          {new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(album.createdAt))}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {videos.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 mb-6">
                  <Video className="w-5 h-5 text-emerald-600"/> Video
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videos.map(album => (
                    <Link key={album.id} href={`/galeri/${album.id}`}
                      className="group bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all">
                      <div className="h-44 bg-emerald-950 relative overflow-hidden">
                        {album.cover ? (
                          <Image src={album.cover} alt={album.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-t-transparent border-b-transparent border-l-emerald-800 ml-1"/>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">{album.title}</h3>
                        {album.description && <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{album.description}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
