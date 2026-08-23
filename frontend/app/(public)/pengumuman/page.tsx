'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, ChevronDown } from 'lucide-react';
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
    title: 'Pengumuman Libur Hari Besar: HUT Republik Indonesia ke-81',
    content: 'Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa dalam rangka Peringatan Hari Ulang Tahun Kemerdekaan RI ke-81 pada 17 Agustus 2026, kegiatan pembelajaran diliburkan.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-10',
    expiresAt: '2026-08-17',
  },
  {
    id: 'ann-kaldik-2',
    title: 'Pengumuman Libur Hari Besar: Maulid Nabi Muhammad SAW',
    content: 'Diberitahukan bahwa pada hari Selasa, 25 Agustus 2026, kegiatan belajar mengajar SMP Darul Ulum Surabaya diliburkan dalam rangka peringatan Maulid Nabi Muhammad SAW 1448 H.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-08-25',
  },
  {
    id: 'ann-1',
    title: 'Jadwal Penilaian Tengah Semester (PTS) Ganjil T.A. 2026/2027',
    content: 'Diberitahukan kepada seluruh siswa kelas 7, 8, dan 9 bahwa Penilaian Tengah Semester (PTS) Ganjil akan dilaksanakan mulai tanggal 5 s.d. 12 September 2026. Harap mempersiapkan diri dan melunasi kewajiban administrasi.',
    isPinned: false,
    targetRoles: ['SISWA', 'ORANG_TUA'],
    publishedAt: '2026-08-20',
    expiresAt: '2026-09-12',
  },
  {
    id: 'ann-kaldik-3',
    title: 'Pengumuman Libur Semester 1 (Ganjil) T.A. 2026/2027',
    content: 'Pelaksanaan Libur Semester 1 (Ganjil) bagi murid SMP Darul Ulum Surabaya berlangsung mulai tanggal 21 s.d. 31 Desember 2026. Masuk kembali semester genap pada bulan Januari 2027.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2026-12-15',
    expiresAt: '2026-12-31',
  },
  {
    id: 'ann-kaldik-4',
    title: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
    content: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H bagi seluruh siswa-siswi SMP Darul Ulum dilaksanakan pada tanggal 8 s.d. 10 Februari 2027 di kampus & Masjid Darul Ulum.',
    isPinned: false,
    targetRoles: ['SEMUA'],
    publishedAt: '2027-02-01',
    expiresAt: '2027-02-10',
  },
  {
    id: 'ann-kaldik-5',
    title: 'Pengumuman Libur Hari Raya Idul Fitri 1448 H',
    content: 'Diberitahukan bahwa libur Hari Raya Idul Fitri 1448 H dan cuti bersama berlangsung pada tanggal 10 s.d. 11 Maret 2027.',
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
      let deletedList: string[] = [];
      try {
        deletedList = JSON.parse(localStorage.getItem('smp_deleted_announcements') || '[]');
      } catch (e) {}

      try {
        const res = await contentService.getAnnouncements();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: Ann[] = res.data
            .filter((item: any) => !deletedList.includes(item.title) && !deletedList.includes(item.id))
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              content: item.content,
              isPinned: false,
              targetRoles: Array.isArray(item.targetRole) ? item.targetRole : [item.targetRole || 'SEMUA'],
              publishedAt: item.createdAt ? String(item.createdAt).split('T')[0] : '2026-08-01',
              expiresAt: item.expiresAt ? String(item.expiresAt).split('T')[0] : null,
            }));

          // Merge backend items with default Kaldik items, avoiding duplicates or deleted items
          const combined = [...mapped];
          DEFAULT_ANNOUNCEMENTS.forEach((defItem) => {
            if (
              !deletedList.includes(defItem.title) &&
              !deletedList.includes(defItem.id) &&
              !combined.some((x) => x.title === defItem.title || x.id === defItem.id)
            ) {
              combined.push(defItem);
            }
          });
          setList(combined);
        }
      } catch (err) {
        console.warn('Backend public announcements load warning:', err);
      }
    };
    fetchPublicAnnouncements();
  }, []);


  // Filter & Search & H-3 to H+1 Auto-Expiry Logic
  const filteredList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return list.filter((item) => {
      // 1. H-3 Display Start & H+1 Auto-Expiry Removal Check
      if (item.expiresAt) {
        const eventDate = new Date(item.expiresAt);
        eventDate.setHours(0, 0, 0, 0);

        // H+1 Date (Next day after event date -> auto remove on H+1)
        const hPlus1 = new Date(eventDate);
        hPlus1.setDate(hPlus1.getDate() + 1);
        if (today >= hPlus1) return false; // H+1 reached -> auto removed!

        // H-3 Date (3 days before event date -> display starting on H-3)
        const hMinus3 = new Date(eventDate);
        hMinus3.setDate(hMinus3.getDate() - 3);
        if (today < hMinus3) return false; // Before H-3 -> hide for now
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
              <p className="text-xs font-extrabold text-slate-700">Belum ada pengumuman aktif saat ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-emerald-100 bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-2xs">
              {filteredList.map((a) => (
                <div key={a.id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                  <div className="space-y-2">
                    {a.expiresAt && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pelaksanaan / Libur: {fmtDate(a.expiresAt)}</span>
                      </div>
                    )}
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
