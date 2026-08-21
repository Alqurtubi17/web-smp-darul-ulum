'use client';

import { Trophy, ClipboardList, Wallet, Bell, MessageSquare, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
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
  { subject: 'Matematika', type: 'UTS', score: 87, max: 100, date: '2025-06-10' },
  { subject: 'Bahasa Indonesia', type: 'Tugas', score: 92, max: 100, date: '2025-06-08' },
  { subject: 'IPA', type: 'UTS', score: 78, max: 100, date: '2025-06-10' },
  { subject: 'Bahasa Inggris', type: 'UH', score: 84, max: 100, date: '2025-06-05' },
];

const payments = [
  { month: 'Juli 2025', amount: 350000, status: 'PENDING', due: '2025-07-10' },
  { month: 'Juni 2025', amount: 350000, status: 'PAID', paid: '2025-06-08' },
  { month: 'Mei 2025', amount: 350000, status: 'PAID', paid: '2025-05-05' },
];

const announcements = [
  { title: 'Jadwal UTS Semester Ganjil 2024/2025', date: '2025-06-20', pinned: true },
  { title: 'Pembayaran SPP Juli 2025 Segera Dilunasi', date: '2025-06-28', pinned: false },
  { title: 'Libur Hari Raya Idul Adha 1446 H', date: '2025-06-05', pinned: false },
];

export default function OrtuDashboard() {
  const { user } = useAuth();
  const avg = recentGrades.reduce((a, b) => a + (b.score / b.max) * 100, 0) / recentGrades.length;
  const pendingPayment = payments.find((p) => p.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header - child info */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl p-6 text-white">
        <p className="text-purple-200 text-sm">Selamat datang, {user?.parent?.fullName || 'Orang Tua'}</p>
        <h1 className="text-xl font-bold mt-0.5">Dashboard Orang Tua</h1>
        <div className="mt-4 flex items-center gap-4 bg-white/10 rounded-xl p-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-xl font-bold">
            {childData.name[0]}
          </div>
          <div>
            <p className="font-semibold">{childData.name}</p>
            <div className="flex gap-3 text-purple-200 text-sm mt-0.5">
              <span>NIS: {childData.nis}</span>
              <span>Kelas {childData.class}</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-green-300">{childData.attendance.persentase}%</p>
            <p className="text-xs text-purple-200">Kehadiran</p>
          </div>
        </div>
      </div>

      {/* Alert SPP */}
      {pendingPayment && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              SPP {pendingPayment.month} belum dibayar
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Tagihan {formatCurrency(pendingPayment.amount)} · Jatuh tempo: {formatDate((pendingPayment as { due: string }).due)}
            </p>
          </div>
          <a href="/ortu/pembayaran" className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg flex-shrink-0">
            Bayar Sekarang
          </a>
        </div>
      )}

      {/* Rekap Kehadiran */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Hadir', value: childData.attendance.hadir, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Izin', value: childData.attendance.izin, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Sakit', value: childData.attendance.sakit, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Alpha', value: childData.attendance.alpha, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-2xl border border-gray-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Nilai Terbaru */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Nilai Terbaru</h2>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Rata-rata: {avg.toFixed(1)}</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentGrades.map((g, i) => {
              const pct = Math.round((g.score / g.max) * 100);
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{g.subject}</p>
                    <p className="text-xs text-gray-400">{g.type} · {formatDate(g.date, { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${pct >= 85 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {g.score}
                    </span>
                    <span className="text-xs text-gray-400">/{g.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4">
            <a href="/ortu/nilai" className="block text-center text-xs text-purple-600 hover:text-purple-700 font-medium">
              Lihat semua nilai →
            </a>
          </div>
        </div>

        {/* Pembayaran SPP */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Riwayat Pembayaran SPP</h2>
            </div>
            <a href="/ortu/pembayaran" className="text-xs text-green-600 hover:text-green-700">Lihat semua</a>
          </div>
          <div className="divide-y divide-gray-100">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  p.status === 'PAID' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {p.status === 'PAID'
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <AlertCircle className="w-4 h-4 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{p.month}</p>
                  <p className="text-xs text-gray-400">
                    {p.status === 'PAID' ? `Dibayar: ${formatDate((p as { paid: string }).paid, { day: 'numeric', month: 'short' })}` : `Jatuh tempo: ${formatDate((p as { due: string }).due, { day: 'numeric', month: 'short' })}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.amount)}</p>
                  <span className={`text-xs ${p.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {p.status === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pengumuman & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Pengumuman Sekolah</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {announcements.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                {a.pinned && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0">Penting</span>}
                <div>
                  <p className="text-sm text-gray-800 leading-snug">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(a.date, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-sm">Aksi Cepat</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: '💬 Pesan ke Guru Wali', href: '/ortu/pesan', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: '📊 Rapor Digital', href: '/ortu/rapor', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { label: '💰 Bayar SPP', href: '/ortu/pembayaran', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: '📅 Absensi Anak', href: '/ortu/absensi', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            ].map((a) => (
              <a key={a.href} href={a.href}
                className={`block text-sm font-medium px-4 py-2.5 rounded-xl transition-colors ${a.color}`}>
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
