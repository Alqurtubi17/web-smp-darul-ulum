'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Beranda',
  '/profil': 'Profil Sekolah',
  '/berita': 'Berita & Artikel',
  '/pengumuman': 'Pengumuman Sekolah',
  '/agenda': 'Agenda & Kalender',
  '/galeri': 'Galeri Foto & Video',
  '/prestasi': 'Prestasi Siswa',
  '/download': 'Download Berkas',
  '/ppdb': 'Pendaftaran PPDB Online',
  '/kontak': 'Hubungi Kami',
  '/fasilitas': 'Fasilitas Sekolah',
  '/ekstrakurikuler': 'Ekstrakurikuler',
  '/login': 'Login Portal',

  // Dashboard Admin
  '/admin': 'Dashboard Admin',
  '/admin/konten/berita': 'Kelola Berita',
  '/admin/konten/pengumuman': 'Kelola Pengumuman',
  '/admin/konten/agenda': 'Kelola Agenda & Kalender',
  '/admin/konten/galeri': 'Kelola Galeri',
  '/admin/konten/prestasi': 'Kelola Prestasi',
  '/admin/konten/download': 'Kelola Download',
  '/admin/ppdb': 'Manajemen PPDB',
  '/admin/pengguna/siswa': 'Data Siswa',
  '/admin/pengguna/guru': 'Data Guru & Staf',
  '/admin/laporan': 'Laporan Rekapitulasi',
  '/admin/keuangan': 'Manajemen Keuangan SPP',
  '/admin/perpustakaan': 'Perpustakaan Digital',
  '/admin/log': 'Log Aktivitas System',
  '/admin/pengaturan': 'Pengaturan Sistem',

  // Dashboard Guru
  '/guru': 'Dashboard Guru',
  '/guru/jadwal': 'Jadwal Mengajar',
  '/guru/akademik/nilai': 'Input Nilai Siswa',
  '/guru/akademik/absensi': 'Absensi Kehadiran',
  '/guru/akademik/tugas': 'Kelola Tugas',
  '/guru/akademik/materi': 'Materi Pembelajaran',
  '/guru/elearning': 'E-Learning Guru',
  '/guru/pengumuman': 'Pengumuman Guru',

  // Dashboard Siswa
  '/siswa': 'Dashboard Siswa',
  '/siswa/jadwal': 'Jadwal Pelajaran',
  '/siswa/nilai': 'Nilai Siswa',
  '/siswa/absensi': 'Absensi Saya',
  '/siswa/tugas': 'Tugas Saya',
  '/siswa/materi': 'Materi Belajar',
  '/siswa/elearning': 'E-Learning Interaktif',
  '/siswa/rapor': 'Rapor Digital',
  '/siswa/kartu': 'Kartu Siswa (QR Code)',

  // Dashboard Orang Tua
  '/ortu': 'Dashboard Orang Tua',
  '/ortu/nilai': 'Nilai Perkembangan Anak',
  '/ortu/absensi': 'Absensi Kehadiran Anak',
  '/ortu/pembayaran': 'Pembayaran SPP & Biaya',
};

export function PageTitleManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    let pageTitle = ROUTE_TITLES[pathname];

    if (!pageTitle) {
      if (pathname.startsWith('/siswa/elearning/game/')) {
        const slug = pathname.replace('/siswa/elearning/game/', '');
        if (slug === 'quizizz') pageTitle = 'Quizizz Live Arena';
        else if (slug === 'matematika') pageTitle = 'Game Math Blitz';
        else if (slug === 'tajwid') pageTitle = 'Game Tajwid Quest';
        else if (slug === 'vocab') pageTitle = 'Game Word Match';
        else if (slug === 'scramble') pageTitle = 'Game Word Scramble';
        else if (slug === 'memory') pageTitle = 'Game IPA Memory Match';
        else if (slug === 'quiz-ipa') pageTitle = 'Game Science Quiz';
        else if (slug === 'timeline') pageTitle = 'Game Timeline Sejarah';
        else {
          const formattedSlug = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          pageTitle = `Game ${formattedSlug}`;
        }
      } else if (pathname.startsWith('/berita/')) {
        pageTitle = 'Detail Berita';
      } else if (pathname.startsWith('/pengumuman/')) {
        pageTitle = 'Detail Pengumuman';
      } else {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          pageTitle = lastSegment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }
    }

    const fullTitle = pageTitle ? `${pageTitle} | SMP Darul Ulum` : 'SMP Darul Ulum';
    document.title = fullTitle;
  }, [pathname]);

  return null;
}
