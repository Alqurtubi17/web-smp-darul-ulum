'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Pin, Calendar, FileText, Search, Megaphone, CheckCircle2, ChevronDown } from 'lucide-react';
import { PageHero } from '@/components/public/PageHero';
import { contentService } from '@/lib/services/content.service';

interface Ann {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  targetRoles: string[];
  publishedAt: string;
  expiresAt: string | null;
  fileUrl?: string | null;
}

const DEFAULT_ANNOUNCEMENTS: Ann[] = [
  {
    id: 'ann-kaldik-1',
    title: '[Pengumuman Resmi] Libur Hari Besar: HUT Republik Indonesia ke-81',
    content: 'Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa dalam rangka Peringatan Hari Ulang Tahun Kemerdekaan RI ke-81 pada 17 Agustus 2026, kegiatan pembelajaran diliburkan.',
    isPinned: true,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-10',
    expiresAt: '2026-08-17',
  },
  {
    id: 'ann-kaldik-2',
    title: '[Pengumuman Resmi] Libur Hari Besar: Maulid Nabi Muhammad SAW',
    content: 'Diberitahukan bahwa pada hari Selasa, 25 Agustus 2026, kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW 1448 H.',
    isPinned: true,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-08-25',
  },
  {
    id: 'ann-1',
    title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
    content: 'Diberitahukan kepada seluruh siswa kelas 7, 8, dan 9 bahwa Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan mulai tanggal 5 s.d. 12 September 2026. Harap mempersiapkan diri dan melunasi kewajiban administrasi.',
    isPinned: true,
    targetRoles: ['SISWA', 'ORANG_TUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-09-12',
  },
  {
    id: 'ann-kaldik-3',
    title: '[Pengumuman Resmi] Libur Semester 1 (Ganjil) T.A. 2026/2027',
    content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026. Masuk kembali semester genap pada bulan Januari 2027.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-12-15',
    expiresAt: '2026-12-31',
  },
  {
    id: 'ann-kaldik-4',
    title: '[Pengumuman Resmi] Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
    content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa-siswi SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027 di kampus & Masjid Darul Ulum.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-02-01',
    expiresAt: '2027-02-10',
  },
  {
    id: 'ann-kaldik-5',
    title: '[Pengumuman Resmi] Libur Hari Raya Idul Fitri 1448 H',
    content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H dan cuti bersama berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
    isPinned: true,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-03-01',
    expiresAt: '2027-03-11',
  },
];

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function fmtDate(d: string) {
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
  } catch {
    return d;
  }
}

export default function PengumumanPublicPage() {
  const [list, setList] = useState<Ann[]>(DEFAULT_ANNOUNCEMENTS);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('SEMUA');

  useEffect(() => {
    const fetchPublicAnnouncements = async () => {
      try {
        const res = await contentService.getAnnouncements();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Ann[] = res.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            isPinned: item.isPinned || false,
            targetRoles: Array.isArray(item.targetRole) ? item.targetRole : [item.targetRole || 'SEMUA'],
            publishedAt: item.createdAt ? String(item.createdAt).split('T')[0] : '2026-08-01',
            expiresAt: item.expiresAt ? String(item.expiresAt).split('T')[0] : null,
          }));
          setList(mapped);
        }
      } catch (err) {
        console.warn('Backend public announcements load warning:', err);
      }
    };
    fetchPublicAnnouncements();
  }, []);

  // Filter & Search Logic
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (selectedMonth === 'SEMUA') return true;

      const dateObj = new Date(item.publishedAt);
      const mYear = `${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
      return mYear === selectedMonth;
    });
  }, [list, search, selectedMonth]);

  // Extract unique available months for filter tabs
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    list.forEach((item) => {
      const dateObj = new Date(item.publishedAt);
      if (!isNaN(dateObj.getTime())) {
        monthsSet.add(`${MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getFullYear()}`);
      }
    });
    return Array.from(monthsSet);
  }, [list]);

  const pinnedList = filteredList.filter((a) => a.isPinned);
  const regularList = filteredList.filter((a) => !a.isPinned);

  return (
    <div className="bg-[#fcfdfd] text-slate-900 min-h-screen pb-16">
      <PageHero
        title="Pengumuman Resmi Sekolah"
        subtitle="Informasi edaran resmi, jadwal kegiatan akademik, dan hari libur SMP Darul Ulum Surabaya."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Pengumuman' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Search & Month Filter Toolbar */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Month Filter Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedMonth('SEMUA')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                selectedMonth === 'SEMUA'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Semua Bulan
            </button>
            {availableMonths.map((mStr) => (
              <button
                key={mStr}
                onClick={() => setSelectedMonth(mStr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedMonth === mStr
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {mStr}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Announcements */}
        {pinnedList.length > 0 && (
          <div className="space-y-3">
            <h2 className="flex items-center gap-2 text-xs font-extrabold text-rose-700 uppercase tracking-wider">
              <Pin className="w-4 h-4 text-rose-600 fill-rose-600" />
              <span>Pengumuman Penting &amp; Libur Hari Besar</span>
            </h2>

            <div className="space-y-3.5">
              {pinnedList.map((a) => (
                <div key={a.id} className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <Pin className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300">
                          📌 PINNED / PENTING
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          Tgl Siar: {fmtDate(a.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">{a.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">{a.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements Grouped */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Daftar Pengumuman Sekolah ({regularList.length})
          </h2>

          {regularList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-emerald-100 text-slate-400 font-medium shadow-2xs">
              <p className="text-xs font-semibold text-slate-500">Tidak ada pengumuman untuk kriteria pencarian ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-100 bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-2xs">
              {regularList.map((a) => (
                <div key={a.id} className="p-5 hover:bg-emerald-50/40 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {fmtDate(a.publishedAt)}
                      </span>
                      {a.expiresAt && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Berlaku s.d. {fmtDate(a.expiresAt)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{a.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-medium whitespace-pre-line">{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
