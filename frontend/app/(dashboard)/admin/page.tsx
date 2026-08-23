'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, GraduationCap, BookOpen, Bell, UserCheck, BarChart3, TrendingUp, Clock,
  Wallet, Download, Loader2, FileSpreadsheet, Eye, Info
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatCurrency } from '@/lib/utils';
import { exportAbsensiExcel, exportSPPExcel } from '@/lib/export';
import { toast } from '@/store/toast.store';

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-semibold">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} shadow-2xs`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const DUMMY_ATTENDANCE = [
  { class: '7A', hadir: 94, izin: 3, sakit: 2, alpha: 1 },
  { class: '7B', hadir: 91, izin: 4, sakit: 3, alpha: 2 },
  { class: '8A', hadir: 96, izin: 2, sakit: 1, alpha: 1 },
  { class: '8B', hadir: 89, izin: 5, sakit: 4, alpha: 2 },
  { class: '9A', hadir: 95, izin: 3, sakit: 1, alpha: 1 },
  { class: '9B', hadir: 92, izin: 4, sakit: 3, alpha: 1 },
];

const recentActivities = [
  { text: 'Pendaftaran PPDB Baru: Muhammad Fahri (Lulus Berkas)', time: '5 menit yang lalu', type: 'ppdb' },
  { text: 'Publikasi Berita: Siswa SMP Darul Ulum Raih Medali Emas OSN', time: '1 jam yang lalu', type: 'news' },
  { text: 'Pengumuman Resmi: Jadwal Penilaian Tengah Semester (PTS)', time: '3 jam yang lalu', type: 'announcement' },
  { text: 'Pembaruan Data Siswa: Kelas 7A (Ahmad Fauzi)', time: '1 hari yang lalu', type: 'student' },
  { text: 'Entri Nilai Pelajaran Matematika Kelas 8A', time: '1 hari yang lalu', type: 'grade' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const [exportingExcel, setExportingExcel] = useState(false);
  const [selectedRange, setSelectedRange] = useState<'7 Hari' | '30 Hari' | '3 Bulan'>('30 Hari');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getAdminName = () => {
    if (user?.teacher?.fullName) return user.teacher.fullName;
    if (user?.student?.fullName) return user.student.fullName;
    if (user?.parent?.fullName) return user.parent.fullName;
    if (user?.email) {
      const username = user.email.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return 'Administrator';
  };

  const name = getAdminName();

  // Financial Stats
  const totalSPPTarget = 109_200_000;
  const totalSPPCollected = stats?.payments?.collected || 87_500_000;
  const sppPct = Math.round((totalSPPCollected / totalSPPTarget) * 100);

  // Strict Real Database Visitor Analytics (No Fake Numbers)
  const visitorStats = stats?.visitorStats;
  const rawDailySeries = visitorStats?.dailySeries || [];

  // Filter series based on selected period
  const displaySeries = selectedRange === '7 Hari'
    ? rawDailySeries.slice(-7)
    : selectedRange === '3 Bulan'
    ? rawDailySeries.filter((_, idx) => idx % 2 === 0)
    : rawDailySeries;

  const totalViews = visitorStats?.totalViews ?? 0;
  const activeUsersToday = visitorStats?.activeUsersToday ?? 0;
  const growthPct = visitorStats?.growthPercentage ?? 0;
  const hasVisits = displaySeries.some((item) => item.count > 0);

  const handleExportSPP = async () => {
    setExportingExcel(true);
    try {
      await exportSPPExcel({
        month: 'Agustus 2026',
        rows: [
          { nis: '2026001', name: 'Ahmad Fauzi', class: '9A', amount: 350000, status: 'PAID', paidAt: '2026-08-03' },
          { nis: '2026002', name: 'Siti Nur Aisyah', class: '8B', amount: 350000, status: 'PAID', paidAt: '2026-08-05' },
          { nis: '2026003', name: 'Budi Permana', class: '7B', amount: 350000, status: 'PENDING' },
        ],
      });
      toast.success('Unduh Excel Berhasil', 'Laporan Keuangan SPP berhasil disimpan.');
    } catch {
      toast.error('Gagal Mengunduh', 'Terjadi kesalahan saat mengunduh berkas Excel.');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportAbsensi = async () => {
    setExportingExcel(true);
    try {
      await exportAbsensiExcel({
        className: 'Semua Kelas',
        month: 'Agustus 2026',
        rows: DUMMY_ATTENDANCE.map((a) => ({
          nis: '-',
          name: `Kelas ${a.class}`,
          hadir: a.hadir,
          izin: a.izin,
          sakit: a.sakit,
          alpha: a.alpha,
          pct: a.hadir,
        })),
      });
      toast.success('Unduh Excel Berhasil', 'Dokumen Rekap Presensi Kehadiran berhasil disimpan.');
    } catch {
      toast.error('Gagal Mengunduh', 'Terjadi kesalahan saat mengunduh berkas Excel.');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {greeting()}, {name}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            {formatDate(new Date())} — Dashboard Pengelolaan Sistem Portal SMP Darul Ulum Surabaya
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAbsensi}
            disabled={exportingExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
          >
            {exportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            Unduh Rekap Presensi (Excel)
          </button>
          <button
            onClick={handleExportSPP}
            disabled={exportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all disabled:bg-emerald-400"
          >
            {exportingExcel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Unduh Laporan SPP (Excel)
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-emerald-700" />}
          label="Total Siswa"
          value={isLoading ? '—' : (stats?.totalStudents ?? 312)}
          sub="Peserta didik aktif"
          color="bg-emerald-100/70 border border-emerald-200"
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-blue-700" />}
          label="Total Guru"
          value={isLoading ? '—' : (stats?.totalTeachers ?? 28)}
          sub="Tenaga pendidik"
          color="bg-blue-100/70 border border-blue-200"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-purple-700" />}
          label="Orang Tua / Wali"
          value={isLoading ? '—' : (stats?.totalParents ?? 295)}
          sub="Terdaftar"
          color="bg-purple-100/70 border border-purple-200"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-amber-700" />}
          label="Pendaftar PPDB"
          value={isLoading ? '—' : (stats?.pendingAdmissions ?? 14)}
          sub="Perlu verifikasi"
          color="bg-amber-100/70 border border-amber-200"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-teal-700" />}
          label="Artikel Berita"
          value={isLoading ? '—' : (stats?.publishedNews ?? 8)}
          sub="Dipublikasikan"
          color="bg-teal-100/70 border border-teal-200"
        />
        <StatCard
          icon={<Bell className="w-5 h-5 text-rose-700" />}
          label="Pengumuman Aktif"
          value={isLoading ? '—' : (stats?.activeAnnouncements ?? 4)}
          sub="Informasi umum"
          color="bg-rose-100/70 border border-rose-200"
        />
      </div>

      {/* Laporan & Rekap Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Rekapitualisasi &amp; Laporan Statistik Sekolah</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rekap Kehadiran per Kelas Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Laporan Riwayat Kehadiran Siswa per Kelas</h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Agustus 2026
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2.5">KELAS</th>
                    <th className="px-4 py-2.5">KEHADIRAN (%)</th>
                    <th className="px-4 py-2.5">IZIN</th>
                    <th className="px-4 py-2.5">SAKIT</th>
                    <th className="px-4 py-2.5">ALPHA</th>
                    <th className="px-4 py-2.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DUMMY_ATTENDANCE.map((row) => (
                    <tr key={row.class} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-xs text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {row.class}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${row.hadir}%` }} />
                          </div>
                          <span className="text-xs font-bold text-emerald-700">{row.hadir}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-blue-600">{row.izin}%</td>
                      <td className="px-4 py-3 text-xs font-medium text-teal-600">{row.sakit}%</td>
                      <td className="px-4 py-3 text-xs font-medium text-rose-500">{row.alpha}%</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.hadir >= 95
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : row.hadir >= 90
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {row.hadir >= 95 ? 'Sangat Baik' : row.hadir >= 90 ? 'Baik' : 'Perhatian'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Laporan Keuangan SPP Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Ringkasan Pembayaran SPP Bulanan
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {sppPct}% Terkumpul
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Pencapaian Pembayaran Bulan Ini</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalSPPCollected)}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${sppPct}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Target Anggaran</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{formatCurrency(totalSPPTarget)}</p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-700 font-semibold uppercase">Dana Terkumpul</p>
                  <p className="text-xs font-bold text-emerald-950 mt-0.5">{formatCurrency(totalSPPCollected)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportSPP}
              disabled={exportingExcel}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Unduh Laporan SPP (Excel)
            </button>
          </div>
        </div>
      </div>

      {/* Chart & Activity Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 text-sm">Riwayat Aktivitas &amp; Pemberitahuan Sistem</h2>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Hari ini</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3.5 px-5 py-3 hover:bg-slate-50/80 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {a.type === 'ppdb' && <UserCheck className="w-4 h-4 text-emerald-700" />}
                  {a.type === 'news' && <BookOpen className="w-4 h-4 text-blue-700" />}
                  {a.type === 'announcement' && <Bell className="w-4 h-4 text-teal-700" />}
                  {a.type === 'student' && <Users className="w-4 h-4 text-purple-700" />}
                  {a.type === 'grade' && <BarChart3 className="w-4 h-4 text-emerald-700" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{a.text}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 text-sm">Pintasan Akses Pengelolaan</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: '+ Buat Berita Artikel Baru', href: '/admin/konten/berita', color: 'bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100' },
              { label: '+ Publikasikan Pengumuman', href: '/admin/konten/pengumuman', color: 'bg-teal-50 border-teal-200 text-teal-950 hover:bg-teal-100' },
              { label: 'Kelola Pendaftaran PPDB', href: '/admin/ppdb', color: 'bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100' },
              { label: 'Kelola Data Siswa & Guru', href: '/admin/pengguna/siswa', color: 'bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100' },
              { label: 'Manajemen Keuangan SPP', href: '/admin/keuangan', color: 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100' },
              { label: 'Pengaturan Sistem & TA', href: '/admin/pengaturan', color: 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`block px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${action.color}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Strict 100% Real Database Visitor Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" /> Grafik Kunjungan Portal Resmi Sekolah
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Akumulasi <strong className="text-slate-900">{totalViews.toLocaleString('id-ID')} Total Kunjungan Halaman</strong> · {activeUsersToday} Pengguna Aktif Hari Ini
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {(['7 Hari', '30 Hari', '3 Bulan'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedRange(period)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedRange === period
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Real Bar Chart Container */}
        {hasVisits ? (
          <div className="h-40 flex items-end gap-1 sm:gap-2 px-1 pt-4 pb-2 border-b border-slate-100">
            {displaySeries.map((item, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-100 hover:bg-emerald-600 rounded-t-md transition-all cursor-pointer relative group h-full flex items-end"
              >
                <div
                  className="w-full bg-emerald-600 rounded-t-md group-hover:bg-emerald-700 transition-all"
                  style={{ height: `${item.barPercent}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap z-30 shadow-md pointer-events-none">
                  {item.dayLabel}: <strong>{item.count} Kunjungan</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 my-2 text-center p-4">
            <Info className="w-6 h-6 text-slate-400 mb-1.5" />
            <p className="text-xs font-bold text-slate-700">Belum Ada Kunjungan Teratat Pada Periode Ini</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Data kunjungan halaman portal akan otomatis terakumulasi di database saat pengguna membuka halaman portal.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mt-3 px-2">
          <span className="text-xs font-semibold text-slate-500">
            {displaySeries[0]?.dayLabel || 'Awal Periode'}
          </span>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> +{growthPct}% Tren Aktivitas Portal ({selectedRange})
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {displaySeries[displaySeries.length - 1]?.dayLabel || 'Akhir Periode'}
          </span>
        </div>
      </div>
    </div>
  );
}
