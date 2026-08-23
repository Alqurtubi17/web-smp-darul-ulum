'use client';

import Link from 'next/link';
import { Trophy, Wallet, Bell, TrendingUp, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatCurrency } from '@/lib/utils';

const childData = {
  name: 'Ahmad Rizki Pratama',
  nis: '2024001',
  class: '7A',
  photo: null,
  attendance: { hadir: 82, izin: 2, sakit: 1, alpha: 0, total: 85, persentase: 96 },
};

const recentGrades = [
  { subject: 'Matematika', type: 'UTS Ganjil', score: 87, max: 100, date: '2026-08-10' },
  { subject: 'Bahasa Indonesia', type: 'Tugas Harian', score: 92, max: 100, date: '2026-08-08' },
  { subject: 'IPA Terpadu', type: 'UTS Ganjil', score: 78, max: 100, date: '2026-08-10' },
  { subject: 'Bahasa Inggris', type: 'Ulangan Harian', score: 84, max: 100, date: '2026-08-05' },
];

const payments = [
  { month: 'Agustus 2026', amount: 350000, status: 'PENDING', due: '2026-08-28' },
  { month: 'Juli 2026', amount: 350000, status: 'PAID', paid: '2026-07-08' },
  { month: 'Juni 2026', amount: 350000, status: 'PAID', paid: '2026-06-05' },
];

const announcements = [
  { title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027', date: '2026-08-20', pinned: true },
  { title: 'Informasi Pembayaran SPP Bulan Agustus 2026', date: '2026-08-15', pinned: false },
  { title: 'Undangan Pertemuan Komite Sekolah & Wali Murid', date: '2026-08-05', pinned: false },
];

export default function OrtuDashboard() {
  const { user } = useAuth();
  const parentName = user?.parent?.fullName || (user as any)?.email?.split('@')[0] || 'Orang Tua / Wali Siswa';
  const avg = recentGrades.reduce((a, b) => a + (b.score / b.max) * 100, 0) / recentGrades.length;
  const pendingPayment = payments.find((p) => p.status === 'PENDING');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner for Parents */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xs relative overflow-hidden border border-emerald-800/80">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-800/90 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700/60 inline-flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Portal Khusus Wali Murid
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Selamat Datang, {parentName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 font-medium max-w-2xl">
              Pantau informasi perkembangan akademik, kehadiran presensi, dan riwayat tagihan putra/putri Anda secara real-time.
            </p>
          </div>

          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/60 backdrop-blur-md rounded-2xl p-4 border border-emerald-700/50 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-white text-emerald-950 rounded-2xl font-black text-lg flex items-center justify-center shadow-2xs shrink-0">
                  {childData.name[0]}
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">{childData.name}</p>
                  <div className="flex items-center gap-2 text-emerald-200/80 text-xs font-semibold mt-0.5">
                    <span>NIS: {childData.nis}</span>
                    <span>•</span>
                    <span>Kelas {childData.class}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 border-t sm:border-t-0 border-emerald-800/80 pt-3 sm:pt-0 justify-between sm:justify-end">
                <div>
                  <p className="text-xl font-extrabold text-white leading-none">{childData.attendance.persentase}%</p>
                  <p className="text-[11px] text-emerald-300 font-semibold mt-1">Kehadiran Kelas</p>
                </div>
                <div className="w-px h-8 bg-emerald-800/80 hidden sm:block" />
                <div>
                  <p className="text-xl font-extrabold text-white leading-none">{avg.toFixed(1)}</p>
                  <p className="text-[11px] text-emerald-300 font-semibold mt-1">Rata-rata Nilai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert SPP */}
      {pendingPayment && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-950">
                Tagihan SPP {pendingPayment.month} Belum Dilunasi
              </p>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                Nominal: <strong className="text-slate-900">{formatCurrency(pendingPayment.amount)}</strong> · Batas jatuh tempo: {formatDate(pendingPayment.due, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <Link
            href="/ortu/pembayaran"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs text-center shrink-0"
          >
            Bayar SPP Sekarang
          </Link>
        </div>
      )}

      {/* Presensi Attendance Proportional Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Hadir', value: childData.attendance.hadir, color: 'text-emerald-700', bg: 'bg-white border-slate-200/80' },
          { label: 'Izin', value: childData.attendance.izin, color: 'text-blue-700', bg: 'bg-white border-slate-200/80' },
          { label: 'Sakit', value: childData.attendance.sakit, color: 'text-teal-700', bg: 'bg-white border-slate-200/80' },
          { label: 'Alpha', value: childData.attendance.alpha, color: 'text-rose-600', bg: 'bg-white border-slate-200/80' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-2xl border p-4 text-center shadow-2xs`}>
            <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Main Split Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Nilai Belajar Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm">Nilai Belajar Siswa Terbaru</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-emerald-800 font-bold">Rata-rata: {avg.toFixed(1)}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {recentGrades.map((g, i) => {
                const pct = Math.round((g.score / g.max) * 100);
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{g.subject}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {g.type} · {formatDate(g.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-extrabold ${pct >= 85 ? 'text-emerald-700' : pct >= 70 ? 'text-blue-700' : 'text-amber-700'}`}>
                        {g.score}
                      </span>
                      <span className="text-xs font-medium text-slate-400">/{g.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-center">
            <Link href="/ortu/nilai" className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
              Lihat Seluruh Rapor Digital Siswa
            </Link>
          </div>

        </div>

        {/* Riwayat SPP */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm">Riwayat &amp; Status Tagihan SPP</h2>
              </div>
              <Link href="/ortu/pembayaran" className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
                Rincian SPP
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    p.status === 'PAID' ? 'bg-emerald-100 border border-emerald-200' : 'bg-amber-100 border border-amber-200'
                  }`}>
                    {p.status === 'PAID'
                      ? <CheckCircle className="w-4 h-4 text-emerald-700" />
                      : <AlertCircle className="w-4 h-4 text-amber-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{p.month}</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {p.status === 'PAID'
                        ? `Lunas: ${formatDate(p.paid, { day: 'numeric', month: 'short' })}`
                        : `Jatuh tempo: ${formatDate(p.due, { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatCurrency(p.amount)}</p>
                    <span className={`text-[10px] font-bold ${p.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {p.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pengumuman & Service Shortcuts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">Pengumuman Sekolah untuk Wali Murid</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors">
                {a.pinned && (
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                    PENTING
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{a.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {formatDate(a.date, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">Pintasan Layanan Wali Murid</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: '💬 Pesan ke Wali Kelas', href: '/ortu/pesan', color: 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100' },
              { label: '📊 Rapor Digital Siswa', href: '/ortu/rapor', color: 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100' },
              { label: '💰 Pembayaran SPP Online', href: '/ortu/pembayaran', color: 'bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100' },
              { label: '📅 Rekap Absensi Presensi', href: '/ortu/absensi', color: 'bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100' },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`block text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all shadow-2xs ${a.color}`}
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
