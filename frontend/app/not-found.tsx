'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfdfd] text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Main 404 Hero Container */}
      <main className="max-w-md w-full text-center space-y-6 bg-white border border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden my-auto">
        {/* Subtle Glow Circle */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Content */}
        <div className="relative z-10 space-y-3">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full shadow-2xs">
            Kesalahan 404
          </span>
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-emerald-900">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
            Maaf, halaman yang Anda tuju tidak tersedia, telah dihapus, atau tautan tidak valid.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-2xs"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="text-center py-4 text-xs font-semibold text-slate-400">
        © 2026 SMP Darul Ulum Surabaya
      </footer>
    </div>
  );
}
