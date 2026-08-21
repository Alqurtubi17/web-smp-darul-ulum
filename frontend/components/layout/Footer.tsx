'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail } from 'lucide-react';

const quickLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Profil Sekolah', href: '/profil' },
  { label: 'Berita', href: '/berita' },
  { label: 'Pengumuman', href: '/pengumuman' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Prestasi', href: '/prestasi' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Kontak', href: '/kontak' },
];

const akademikLinks = [
  { label: 'Kurikulum', href: '/akademik/kurikulum' },
  { label: 'Jadwal Pelajaran', href: '/akademik/jadwal' },
  { label: 'E-Learning', href: '/akademik/elearning' },
  { label: 'Ekstrakurikuler', href: '/akademik/ekskul' },
  { label: 'PPDB Online', href: '/ppdb' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-emerald-50/80 text-slate-700 border-t border-emerald-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white border border-emerald-200 shadow-xs flex-shrink-0">
                <Image src="/logo.png" alt="Logo SMP Darul Ulum Surabaya" fill sizes="44px" className="object-cover" />
              </div>
              <div>
                <p className="text-base font-black text-emerald-950 leading-tight">SMP Darul Ulum</p>
                <p className="text-xs text-emerald-700 font-bold leading-tight">Surabaya</p>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              Sekolah Menengah Pertama berbasis Islam di bawah naungan LP Ma&apos;arif NU.
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-4">
              Navigasi
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Akademik */}
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-4">
              Akademik
            </h3>
            <ul className="space-y-2">
              {akademikLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sekretariat */}
          <div>
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-4">
              Sekretariat
            </h3>
            <ul className="space-y-2.5">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-600 leading-relaxed font-medium">
                  Jl. Raya Manukan Kulon No. 98-100, Tandes, Surabaya 60185
                </span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <a href="tel:0317417749" className="text-xs font-medium text-slate-600 hover:text-emerald-700 transition-colors">
                  (031) 7417749
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-5 border-t border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <p>&copy; 2026 SMP Darul Ulum Surabaya</p>
          <div className="flex gap-4">
            <Link href="/profil" className="hover:text-emerald-800">Profil Sekolah</Link>
            <Link href="/kontak" className="hover:text-emerald-800">Kontak Sekretariat</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
