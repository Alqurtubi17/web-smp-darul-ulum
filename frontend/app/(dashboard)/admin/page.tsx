'use client';

import Link from 'next/link';
import { Users, GraduationCap, BookOpen, Bell, UserCheck, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const recentActivities = [
  { text: 'Pendaftar baru: Muhammad Fahri', time: '5 menit lalu', type: 'ppdb' },
  { text: 'Berita dipublikasikan: OSN 2025', time: '1 jam lalu', type: 'news' },
  { text: 'Pengumuman: Jadwal UTS Ganjil', time: '3 jam lalu', type: 'announcement' },
  { text: 'Siswa baru ditambahkan: Kelas 7A', time: '1 hari lalu', type: 'student' },
  { text: 'Nilai MTK kelas 8A diinput', time: '1 hari lalu', type: 'grade' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

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
    return 'Admin';
  };

  const name = getAdminName();

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {greeting()}, {name}!
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
          {formatDate(new Date())} — Portal Administrasi Sekolah SMP Darul Ulum Surabaya
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-emerald-700" />}
          label="Total Siswa"
          value={isLoading ? '—' : (stats?.totalStudents ?? 0)}
          sub="Siswa aktif"
          color="bg-emerald-100"
        />
        <StatCard
          icon={<GraduationCap className="w-5 h-5 text-blue-700" />}
          label="Total Guru"
          value={isLoading ? '—' : (stats?.totalTeachers ?? 0)}
          sub="Tenaga pendidik"
          color="bg-blue-100"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-purple-700" />}
          label="Orang Tua"
          value={isLoading ? '—' : (stats?.totalParents ?? 0)}
          sub="Terdaftar"
          color="bg-purple-100"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-amber-700" />}
          label="PPDB Pending"
          value={isLoading ? '—' : (stats?.pendingAdmissions ?? 0)}
          sub="Perlu diproses"
          color="bg-amber-100"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-teal-700" />}
          label="Berita"
          value={isLoading ? '—' : (stats?.publishedNews ?? 0)}
          sub="Dipublikasikan"
          color="bg-teal-100"
        />
        <StatCard
          icon={<Bell className="w-5 h-5 text-rose-700" />}
          label="Pengumuman"
          value={isLoading ? '—' : (stats?.activeAnnouncements ?? 0)}
          sub="Aktif"
          color="bg-rose-100"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Aktivitas Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50/40">
            <h2 className="font-extrabold text-slate-900 text-sm">Aktivitas Terbaru</h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">Hari ini</span>
          </div>
          <div className="divide-y divide-emerald-50">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3.5 px-6 py-3.5 hover:bg-emerald-50/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {a.type === 'ppdb' && <UserCheck className="w-4 h-4 text-emerald-700" />}
                  {a.type === 'news' && <BookOpen className="w-4 h-4 text-blue-700" />}
                  {a.type === 'announcement' && <Bell className="w-4 h-4 text-amber-700" />}
                  {a.type === 'student' && <Users className="w-4 h-4 text-purple-700" />}
                  {a.type === 'grade' && <BarChart3 className="w-4 h-4 text-teal-700" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{a.text}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" /> {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/40">
            <h2 className="font-extrabold text-slate-900 text-sm">Aksi Cepat</h2>
          </div>
          <div className="p-4 space-y-2">
            {[
              { label: '+ Tambah Berita Baru', href: '/admin/konten/berita', color: 'bg-emerald-50 border-emerald-100 text-emerald-900 hover:bg-emerald-100' },
              { label: '+ Buat Pengumuman', href: '/admin/konten/pengumuman', color: 'bg-amber-50 border-amber-100 text-amber-900 hover:bg-amber-100' },
              { label: '📋 Kelola PPDB Online', href: '/admin/ppdb', color: 'bg-teal-50 border-teal-100 text-teal-900 hover:bg-teal-100' },
              { label: '👥 Data Siswa & Guru', href: '/admin/pengguna/siswa', color: 'bg-blue-50 border-blue-100 text-blue-900 hover:bg-blue-100' },
              { label: '📊 Lihat Laporan Rekap', href: '/admin/laporan', color: 'bg-purple-50 border-purple-100 text-purple-900 hover:bg-purple-100' },
              { label: '⚙️ Pengaturan Sistem', href: '/admin/pengaturan', color: 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`block px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shadow-2xs ${action.color}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4 border-b border-emerald-100 pb-3">
          <h2 className="font-extrabold text-slate-900 text-sm">Statistik Pengunjung Website</h2>
          <div className="flex gap-1.5">
            {['7H', '30H', '3B'].map((p) => (
              <button key={p} className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${p === '30H' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:bg-emerald-50'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-36 flex items-end gap-2 px-2">
          {[45, 62, 38, 85, 73, 91, 68, 77, 83, 55, 70, 88, 65, 79, 92, 61, 74, 86, 69, 78, 94, 57, 72, 89, 66, 81, 95, 63, 76, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-emerald-200/70 hover:bg-emerald-600 rounded-t transition-colors cursor-pointer"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 px-2 pt-2 border-t border-emerald-50">
          <span className="text-xs font-semibold text-slate-400">1 Jun</span>
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> +12.4% peningkatan pengunjung
          </span>
          <span className="text-xs font-semibold text-slate-400">30 Jun</span>
        </div>
      </div>
    </div>
  );
}
