'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="id">
      <body className="bg-[#fcfdfd] text-slate-900">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md w-full bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5">
            <div className="text-8xl font-black text-emerald-600 mb-2 tracking-tight">500</div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Terjadi Kesalahan Sistem
            </h1>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              Mohon maaf, terjadi kendala pada sistem. Silakan coba muat ulang halaman.
            </p>
            <button onClick={reset}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-xs">
              🔄 Coba Lagi
            </button>
            <p className="text-xs text-slate-400 mt-8 font-medium">SMP Darul Ulum Surabaya</p>
          </div>
        </div>
      </body>
    </html>
  );
}
