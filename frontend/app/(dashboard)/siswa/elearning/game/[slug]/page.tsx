'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';

import TajwidQuestGame from '../tajwid/page';
import WordMatchGame from '../vocab/page';

export default function DynamicSiswaGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [gameData, setGameData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    apiClient.get(`/elearning-games/${slug}`)
      .then((res) => {
        if (res.data?.data) {
          setGameData(res.data.data);
        } else {
          setError('Game tidak ditemukan');
        }
      })
      .catch(() => {
        setError('Gagal memuat game dari server');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold">Memuat Game Pembelajaran...</p>
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Game Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'Game yang Anda cari mungkin telah dihapus oleh guru.'}</p>
        </div>
        <div>
          <Link
            href="/siswa/elearning"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke E-Learning Siswa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      <div className="flex items-center justify-between px-2">
        <Link
          href="/siswa/elearning"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Mapel: {gameData.subject || 'Umum'}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-md">
        {gameData.mode === 'match' || gameData.slug === 'vocab' || gameData.slug === 'memory' ? (
          <WordMatchGame gameData={gameData} />
        ) : (
          <TajwidQuestGame gameData={gameData} />
        )}
      </div>
    </div>
  );
}
