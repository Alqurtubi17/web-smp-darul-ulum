'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, ChevronDown, Gamepad2, LogIn } from 'lucide-react';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';

const navItems = [
  { label:'Beranda', href:'/' },
  {
    label:'Profil', href:'/profil',
    children:[
      { label:'Profil Sekolah', href:'/profil' },
      { label:'Visi & Misi', href:'/profil#visi-misi' },
      { label:'Sarana & Prasarana', href:'/profil#fasilitas' },
    ],
  },
  {
    label:'Akademik', href:'#',
    children:[
      { label:'📚 E-Learning', href:'/elearning', badge:'Baru!' },
      { label:'Kurikulum', href:'/profil#kurikulum' },
    ],
  },
  { label:'PPDB', href:'/ppdb' },
  { label:'Berita', href:'/berita' },
  { label:'Pengumuman', href:'/pengumuman' },
  { label:'Agenda', href:'/agenda' },
  { label:'Prestasi', href:'/prestasi' },
  { label:'Galeri', href:'/galeri' },
  { label:'Kontak', href:'/kontak' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className={`sticky top-0 z-50 transition-shadow ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100' : 'bg-white border-b border-emerald-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white border border-emerald-100 shadow-2xs group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Logo SMP Darul Ulum Surabaya" fill sizes="40px" className="object-cover" priority />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight">SMP Darul Ulum</p>
              <p className="text-[11px] text-emerald-700 font-bold leading-tight">Surabaya</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map(item => (
              <div key={item.label} className="relative group"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}>
                {item.children ? (
                  <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'}`}>
                    {item.label}
                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-200"/>
                  </button>
                ) : (
                  <Link href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'}`}>
                    {item.label}
                  </Link>
                )}

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50">
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                        {child.label}
                        {(child as {badge?: string}).badge && (
                          <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">{(child as {badge?: string}).badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/auth/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs">
              <LogIn className="w-3.5 h-3.5"/> Portal Login
            </Link>
            <button className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-emerald-50"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
          <Link href="/elearning"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-200"
            onClick={() => setMobileOpen(false)}>
            <Gamepad2 className="w-4 h-4"/> 🎮 E-Learning Interaktif
            <span className="ml-auto text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">Baru!</span>
          </Link>
          {navItems.map(item => (
            item.children ? (
              <div key={item.label}>
                <p className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wide">{item.label}</p>
                {item.children.map(child => (
                  <Link key={child.href} href={child.href}
                    className="block px-6 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl"
                    onClick={() => setMobileOpen(false)}>
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={item.href} href={item.href}
                className={`block px-4 py-2.5 text-sm rounded-xl transition-colors ${isActive(item.href) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-700 hover:bg-emerald-50'}`}
                onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            )
          ))}
          <div className="pt-2 pb-1">
            <Link href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs"
              onClick={() => setMobileOpen(false)}>
              <LogIn className="w-4 h-4"/> Login Portal Siswa / Guru
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
