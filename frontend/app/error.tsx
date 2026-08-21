'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Terjadi Kesalahan Halaman
        </h1>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Mohon maaf, sistem mengalami kendala saat memuat halaman ini. Silakan coba muat ulang halaman.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-xs"
          >
            <RefreshCw className="w-4 h-4" /> Coba Muat Ulang
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60 font-semibold text-sm transition-all"
          >
            <Home className="w-4 h-4" /> Ke Beranda
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8 font-medium">SMP Darul Ulum Surabaya</p>
      </div>
    </div>
  );
}
