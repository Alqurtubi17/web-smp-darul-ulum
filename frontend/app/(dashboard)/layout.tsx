'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Search, Menu, LogOut, X, PanelLeftClose, Calendar, ChevronDown } from 'lucide-react';

import { Skeleton } from '@/components/ui/Skeleton';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useAuth } from '@/hooks/useAuth';
import { useAcademicYearStore } from '@/store/academic-year.store';
import { cn } from '@/lib/utils';

interface SearchItem {
  label: string;
  href: string;
  category: string;
  keywords?: string;
}

const SEARCHABLE_ITEMS: SearchItem[] = [
  // Admin & General
  { label: 'Dashboard Utama', href: '/admin', category: 'Dashboard', keywords: 'home utama beranda' },
  { label: 'Berita Sekolah', href: '/admin/konten/berita', category: 'Konten', keywords: 'kabar pengumuman artikel' },
  { label: 'Pengumuman Sekolah', href: '/admin/konten/pengumuman', category: 'Konten', keywords: 'info pemberitahuan' },
  { label: 'Agenda & Kalender', href: '/admin/konten/agenda', category: 'Konten', keywords: 'jadwal kegiatan event' },
  { label: 'Galeri Foto & Video', href: '/admin/konten/galeri', category: 'Konten', keywords: 'foto media dokumentasi' },
  { label: 'Prestasi Siswa', href: '/admin/konten/prestasi', category: 'Konten', keywords: 'lomba juara penghargaan' },
  { label: 'Download Berkas', href: '/admin/konten/download', category: 'Konten', keywords: 'dokumen surat formulir' },
  { label: 'Pendaftaran PPDB', href: '/admin/ppdb', category: 'Pendaftaran', keywords: 'siswa baru calon registrasi' },
  { label: 'Data Siswa', href: '/admin/pengguna/siswa', category: 'Pengguna', keywords: 'murid peserta didik' },
  { label: 'Data Guru & Staf', href: '/admin/pengguna/guru', category: 'Pengguna', keywords: 'pengajar ustadz guru' },
  { label: 'Laporan Rekapitulasi', href: '/admin/laporan', category: 'Laporan', keywords: 'statistik rekap grafik' },
  { label: 'Keuangan & SPP', href: '/admin/keuangan', category: 'Keuangan', keywords: 'bayar spp tagihan bayaran' },
  { label: 'Perpustakaan Digital', href: '/admin/perpustakaan', category: 'Perpustakaan', keywords: 'buku pustaka e-book' },
  { label: 'Log Aktivitas System', href: '/admin/log', category: 'Audit Log', keywords: 'log audit jejak aktivitas history tracker' },
  { label: 'Pengaturan Sistem', href: '/admin/pengaturan', category: 'Pengaturan', keywords: 'setting profil akun' },

  // Guru
  { label: 'Dashboard Guru', href: '/guru', category: 'Guru', keywords: 'home guru utama' },
  { label: 'Jadwal Mengajar', href: '/guru/jadwal', category: 'Akademik', keywords: 'jam kelas mengajar' },
  { label: 'Input Nilai Siswa', href: '/guru/akademik/nilai', category: 'Akademik', keywords: 'nilai ujian tugas ulangan' },
  { label: 'Absensi Kehadiran', href: '/guru/akademik/absensi', category: 'Akademik', keywords: 'presensi hadir izin sakit' },
  { label: 'Kelola Tugas', href: '/guru/akademik/tugas', category: 'Akademik', keywords: 'pr tugas latihan' },
  { label: 'Materi Pembelajaran', href: '/guru/akademik/materi', category: 'Akademik', keywords: 'modul bahan ajar' },
  { label: 'E-Learning Guru', href: '/guru/elearning', category: 'E-Learning', keywords: 'modul game kuis' },

  // Siswa
  { label: 'Dashboard Siswa', href: '/siswa', category: 'Siswa', keywords: 'home siswa' },
  { label: 'Jadwal Pelajaran', href: '/siswa/jadwal', category: 'Akademik', keywords: 'jam pelajaran kelas' },
  { label: 'Nilai Siswa', href: '/siswa/nilai', category: 'Akademik', keywords: 'hasil ujian kelulusan' },
  { label: 'Absensi Saya', href: '/siswa/absensi', category: 'Akademik', keywords: 'kehadiran presensi' },
  { label: 'Tugas Saya', href: '/siswa/tugas', category: 'Akademik', keywords: 'pr kumpul tugas' },
  { label: 'Materi Belajar', href: '/siswa/materi', category: 'Akademik', keywords: 'download modul' },
  { label: 'E-Learning Interaktif', href: '/siswa/elearning', category: 'E-Learning', keywords: 'game kuis blitz' },
  { label: 'Game Math Blitz', href: '/siswa/elearning/game/matematika', category: 'Games', keywords: 'matematika hitung aljabar' },
  { label: 'Game Word Scramble', href: '/siswa/elearning/game/scramble', category: 'Games', keywords: 'inggris kata susun' },
  { label: 'Game IPA Memory Match', href: '/siswa/elearning/game/memory', category: 'Games', keywords: 'sains ipa cocok' },
  { label: 'Game Science Quiz', href: '/siswa/elearning/game/quiz-ipa', category: 'Games', keywords: 'kuis ipa fisika biologi' },
  { label: 'Game Timeline Sejarah', href: '/siswa/elearning/game/timeline', category: 'Games', keywords: 'ips sejarah urut' },
  { label: 'Rapor Digital', href: '/siswa/rapor', category: 'Rapor', keywords: 'nilai akhir semester' },
  { label: 'Kartu Siswa (QR Code)', href: '/siswa/kartu', category: 'Identitas', keywords: 'cetak kartu id qr' },

  // Ortu
  { label: 'Dashboard Orang Tua', href: '/ortu', category: 'Orang Tua', keywords: 'home ortu wali' },
  { label: 'Nilai Perkembangan Anak', href: '/ortu/nilai', category: 'Akademik', keywords: 'rapor hasil belajar' },
  { label: 'Absensi Kehadiran Anak', href: '/ortu/absensi', category: 'Akademik', keywords: 'presensi sekolah' },
  { label: 'Pembayaran SPP & Biaya', href: '/ortu/pembayaran', category: 'Keuangan', keywords: 'spp rekening transfer bayar' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const { user, role } = useAuth();
  const { activeYear, activeSemester, academicYears, setActiveYear, initAcademicYear } = useAcademicYearStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAcademicYear();
  }, [initAcademicYear]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const displayName = (user as any)?.student?.fullName || (user as any)?.teacher?.fullName || (user as any)?.parent?.fullName || (user as any)?.email || 'User';

  const filteredItems = searchQuery.trim()
    ? SEARCHABLE_ITEMS.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.keywords && item.keywords.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelectSearchResult = (href: string) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    router.push(href);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex">
        <div className="hidden lg:flex w-64 bg-white border-r border-emerald-100 flex-col">
          <div className="p-5 border-b border-emerald-100">
            <Skeleton className="h-8 w-36 bg-emerald-100/50" />
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 bg-emerald-100/50" />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-14 bg-white border-b border-emerald-100 flex items-center px-4">
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="flex min-h-screen bg-[#f8faf9]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className={cn('fixed left-0 top-0 bottom-0 z-30 transition-all duration-300', desktopCollapsed ? 'w-20' : 'w-64')}>
          <Sidebar collapsed={desktopCollapsed} />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', desktopCollapsed ? 'lg:pl-20' : 'lg:pl-64')}>
        {/* Topbar Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 h-16 flex items-center justify-between px-4 sm:px-6 gap-4 shadow-2xs">
          
          {/* Left: Desktop Toggle / Mobile Menu & Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={() => setDesktopCollapsed((v) => !v)}
              className="hidden lg:flex p-2 text-slate-600 hover:bg-emerald-50 rounded-xl transition-colors"
              title={desktopCollapsed ? 'Buka Sidebar' : 'Sembunyikan Sidebar'}
            >
              <PanelLeftClose className={cn('w-5 h-5 text-emerald-700 transition-transform duration-200', desktopCollapsed && 'rotate-180')} />
            </button>

            {/* Mobile Sidebar Open Toggle */}
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-emerald-50 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Functional Search Container */}
            <div className="relative w-full" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700" />
                <input
                  type="text"
                  placeholder="Cari menu, berita, data..."
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-emerald-100 shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto p-2 space-y-1">
                  <div className="px-3 py-1.5 border-b border-emerald-50 flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase">
                    <span>Hasil Pencarian</span>
                    <span>{filteredItems.length} Ditemukan</span>
                  </div>

                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.href + item.label}
                        onClick={() => handleSelectSearchResult(item.href)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/80 transition-colors text-left group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{item.label}</p>
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {item.category}
                          </span>
                        </div>

                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">
                      Tidak ada menu atau data yang cocok dengan &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Academic Year, User Profile & Quick Logout */}
          <div className="flex items-center gap-3">
            {/* Active Academic Year Badge */}
            <div className="hidden sm:flex items-center gap-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl px-3 py-1.5 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-0.5">T.A. AKTIF</span>
                <span className="text-xs font-bold text-slate-900">{activeYear} — {activeSemester}</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl px-3 py-1.5">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-2xs flex-shrink-0">
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 truncate leading-snug max-w-[140px]">{displayName}</p>
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                  {(role || '').toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              title="Keluar Portal"
              className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
