'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
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
    id: 'ann-1',
    title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
    content: 'Penilaian Tengah Semester (PTS) Ganjil dilaksanakan mulai tanggal 5 s.d. 12 September 2026 bagi seluruh siswa kelas 7, 8, dan 9.',
    isPinned: true,
    targetRoles: ['SISWA', 'ORANG_TUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-09-12',
  },
  {
    id: 'ann-kaldik-2',
    title: '[Libur Hari Besar] Maulid Nabi Muhammad SAW 1448 H',
    content: 'Diberitahukan bahwa kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW 1448 H.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-08-25',
  },

  {
    id: 'ann-kaldik-3',
    title: '[Libur Semester 1] Libur Semester Ganjil T.A. 2026/2027',
    content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-12-15',
    expiresAt: '2026-12-31',
  },
  {
    id: 'ann-kaldik-4',
    title: '[Kegiatan Puasa] Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
    content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-02-01',
    expiresAt: '2027-02-10',
  },
  {
    id: 'ann-kaldik-5',
    title: '[Libur Hari Besar] Hari Raya Idul Fitri 1448 H',
    content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H dan Cuti Bersama berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
    isPinned: false,
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
  const [selectedYear, setSelectedYear] = useState<string>('SEMUA');

  useEffect(() => {
    const fetchPublicAnnouncements = async () => {
      try {
        const res = await contentService.getAnnouncements();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const mapped: Ann[] = res.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            isPinned: Boolean(item.isPinned),
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

  // Filter & Search & H+1 Auto-Expiry & Pinned First Sorting Logic
  const filteredList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return list
      .filter((item) => {
        // 1. Auto-remove if date is H+1 or later (i.e. event date has passed + 1 day)
        if (item.expiresAt) {
          const expDate = new Date(item.expiresAt);
          expDate.setHours(0, 0, 0, 0);

          // H+1 Date (Next day after event date -> auto remove on H+1)
          const hPlus1 = new Date(expDate);
          hPlus1.setDate(hPlus1.getDate() + 1);

          // If today is H+1 or later, filter it out automatically!
          if (today >= hPlus1) {
            return false;
          }
        }

        // 2. Search match
        const matchSearch =
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.content.toLowerCase().includes(search.toLowerCase());

        if (!matchSearch) return false;

        const targetDateStr = item.expiresAt || item.publishedAt;
        const dateObj = new Date(targetDateStr);

        // 3. Month Filter check
        if (selectedMonth !== 'SEMUA') {
          if (dateObj.getMonth().toString() !== selectedMonth) {
            return false;
          }
        }

        // 4. Year Filter check
        if (selectedYear !== 'SEMUA') {
          if (dateObj.getFullYear().toString() !== selectedYear) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned announcements ALWAYS appear at the very top!
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
  }, [list, search, selectedMonth, selectedYear]);


  // Extract unique available years dynamically from dataset
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    list.forEach((item) => {
      const dateObj = new Date(item.expiresAt || item.publishedAt);
      if (!isNaN(dateObj.getTime())) {
        yearsSet.add(dateObj.getFullYear().toString());
      }
    });
    return Array.from(yearsSet).sort();
  }, [list]);

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
        
        {/* Search & Separate Month/Year Filter Toolbar */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Separate Month Filter Dropdown */}
            <div className="relative flex-1 sm:w-40">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer pr-8 shadow-2xs"
              >
                <option value="SEMUA">Semua Bulan</option>
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx.toString()}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Separate Year Filter Dropdown */}
            <div className="relative flex-1 sm:w-36">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 appearance-none cursor-pointer pr-8 shadow-2xs"
              >
                <option value="SEMUA">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Clean Unpinned Announcements List */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            Pengumuman Aktif ({filteredList.length})
          </h2>

          {filteredList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-emerald-100 text-slate-400 font-medium shadow-2xs">
              <p className="text-xs font-extrabold text-slate-700">Belum ada pengumuman untuk kriteria pencarian ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-100 bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-2xs">
              {filteredList.map((a) => (
                <div key={a.id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{a.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">{a.content}</p>
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
