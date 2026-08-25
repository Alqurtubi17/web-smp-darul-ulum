'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NextImage from 'next/image';
import {
  LayoutDashboard, Newspaper, Megaphone, CalendarDays,
  Users, BookOpen, GraduationCap, ClipboardList, Settings,
  ChevronDown, Trophy, UserCheck,
  Wallet, Library, QrCode, FileText, Gamepad2, BookMarked, History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  children?: { label: string; href: string; badge?: string }[];
};

const menuConfig: Record<string, MenuItem[]> = {
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/admin' },
    {
      label: 'Konten',
      icon: <Newspaper className="w-4 h-4" />,
      href: '/admin/konten',
      children: [
        { label: 'Berita', href: '/admin/konten/berita' },
        { label: 'Pengumuman', href: '/admin/konten/pengumuman' },
        { label: 'Agenda', href: '/admin/konten/agenda' },
        { label: 'Galeri', href: '/admin/konten/galeri' },
        { label: 'Prestasi', href: '/admin/konten/prestasi' },
        { label: 'Download', href: '/admin/konten/download' },
      ],
    },
    { label: 'PPDB', icon: <UserCheck className="w-4 h-4" />, href: '/admin/ppdb' },
    {
      label: 'Akademik',
      icon: <GraduationCap className="w-4 h-4" />,
      href: '/admin/akademik',
      children: [
        { label: 'Kelas & Wali Kelas', href: '/admin/akademik/kelas' },
        { label: 'Mata Pelajaran', href: '/admin/akademik/mapel' },
        { label: 'Jadwal Mengajar', href: '/admin/akademik/jadwal' },
      ],
    },
    {
      label: 'Pengguna',
      icon: <Users className="w-4 h-4" />,
      href: '/admin/pengguna',
      children: [
        { label: 'Siswa', href: '/admin/pengguna/siswa' },
        { label: 'Guru', href: '/admin/pengguna/guru' },
      ],
    },
    { label: 'Keuangan', icon: <Wallet className="w-4 h-4" />, href: '/admin/keuangan' },
    { label: 'Perpustakaan', icon: <Library className="w-4 h-4" />, href: '/admin/perpustakaan' },
    { label: 'Log Aktivitas', icon: <History className="w-4 h-4" />, href: '/admin/log' },
    { label: 'Pengaturan', icon: <Settings className="w-4 h-4" />, href: '/admin/pengaturan' },
  ],
  guru: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/guru' },
    { label: 'Jadwal Mengajar', icon: <CalendarDays className="w-4 h-4" />, href: '/guru/jadwal' },
    {
      label: 'Akademik',
      icon: <GraduationCap className="w-4 h-4" />,
      href: '/guru/akademik',
      children: [
        { label: 'Input Nilai', href: '/guru/akademik/nilai' },
        { label: 'Absensi', href: '/guru/akademik/absensi' },
        { label: 'Tugas', href: '/guru/akademik/tugas' },
        { label: 'Materi', href: '/guru/akademik/materi' },
      ],
    },
    {
      label: 'E-Learning',
      icon: <Gamepad2 className="w-4 h-4" />,
      href: '/guru/elearning',
      children: [{ label: 'Modul Saya', href: '/guru/elearning' }],
    },
    { label: 'Pengumuman', icon: <Megaphone className="w-4 h-4" />, href: '/guru/pengumuman' },
  ],
  siswa: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/siswa' },
    { label: 'Jadwal', icon: <CalendarDays className="w-4 h-4" />, href: '/siswa/jadwal' },
    { label: 'Nilai', icon: <Trophy className="w-4 h-4" />, href: '/siswa/nilai' },
    { label: 'Absensi', icon: <ClipboardList className="w-4 h-4" />, href: '/siswa/absensi' },
    { label: 'Tugas', icon: <FileText className="w-4 h-4" />, href: '/siswa/tugas' },
    { label: 'Materi', icon: <BookOpen className="w-4 h-4" />, href: '/siswa/materi' },
    {
      label: 'E-Learning',
      icon: <Gamepad2 className="w-4 h-4" />,
      href: '/siswa/elearning',
      children: [
        { label: '🏠 Dashboard', href: '/siswa/elearning' },
        { label: '⚡ Math Blitz', href: '/siswa/elearning/game/matematika' },
        { label: '🔤 Word Scramble', href: '/siswa/elearning/game/scramble' },
        { label: '🧬 Memory Match', href: '/siswa/elearning/game/memory' },
        { label: '🔭 Science Quiz', href: '/siswa/elearning/game/quiz-ipa' },
        { label: '📅 Timeline', href: '/siswa/elearning/game/timeline' },
      ],
    },
    { label: 'Rapor Digital', icon: <BookMarked className="w-4 h-4" />, href: '/siswa/rapor' },
    { label: 'Kartu Siswa', icon: <QrCode className="w-4 h-4" />, href: '/siswa/kartu' },
  ],
  ortu: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/ortu' },
    { label: 'Nilai Anak', icon: <Trophy className="w-4 h-4" />, href: '/ortu/nilai' },
    { label: 'Absensi Anak', icon: <ClipboardList className="w-4 h-4" />, href: '/ortu/absensi' },
    { label: 'Pembayaran', icon: <Wallet className="w-4 h-4" />, href: '/ortu/pembayaran' },
    { label: 'Pengumuman', icon: <Megaphone className="w-4 h-4" />, href: '/ortu/pengumuman' },
  ],
};

const roleKey = (role: string) => {
  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) return 'admin';
  if (role === 'GURU') return 'guru';
  if (role === 'SISWA') return 'siswa';
  if (role === 'ORANG_TUA') return 'ortu';
  return 'siswa';
};

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const key = roleKey(role || '');
  const menus = menuConfig[key] || [];

  // Single accordion state: ONLY 1 submenu can be open at a time!
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Auto detect active submenu on page load / pathname change
  useEffect(() => {
    const activeParent = menus.find((item) =>
      item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href))
    );
    if (activeParent) {
      setOpenSubmenu(activeParent.label);
    }
  }, [pathname, menus]);

  if (!user) return null;

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside
      className={cn(
        'bg-white text-slate-800 border-r border-emerald-100 flex flex-col h-full overflow-y-auto shadow-2xs transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Header - Matched to h-16 Topbar height */}
      <div className={cn('h-16 border-b border-emerald-100 flex items-center flex-shrink-0 bg-white transition-all', collapsed ? 'justify-center px-2' : 'px-5')}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-emerald-100 flex-shrink-0 bg-white shadow-2xs group-hover:scale-105 transition-transform">
            <NextImage src="/logo.png" alt="Logo SMP Darul Ulum" fill sizes="36px" className="object-cover" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 leading-tight tracking-tight">SMP Darul Ulum</p>
              <p className="text-[11px] text-emerald-700 font-bold leading-tight">Surabaya</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Menu Portal</p>
        )}

        {menus.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${key}` && pathname.startsWith(item.href));
          const isOpen = openSubmenu === item.label;

          if (item.children) {
            return (
              <div key={item.label} className="space-y-0.5">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left',
                    collapsed ? 'justify-center px-0' : 'px-3',
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'
                  )}
                >
                  <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-emerald-700')}>{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      <ChevronDown
                        className={cn('w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0', isOpen && 'rotate-180')}
                      />
                    </>
                  )}
                </button>

                {/* Submenu Accordion (Single-accordion behavior: auto closes other submenus) */}
                {isOpen && !collapsed && (
                  <div className="ml-4 my-1 space-y-0.5 border-l-2 border-emerald-200/80 pl-2.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                          pathname === child.href
                            ? 'text-emerald-800 bg-emerald-100/80 font-extrabold'
                            : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'
                        )}
                      >
                        <span className="truncate">{child.label}</span>
                        {child.badge && (
                          <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                collapsed ? 'justify-center px-0' : 'px-3',
                pathname === item.href
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/70'
              )}
            >
              <span className={cn('flex-shrink-0', pathname === item.href ? 'text-white' : 'text-emerald-700')}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
