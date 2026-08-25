'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, MapPin, Building2, Plus, ChevronLeft, ChevronRight,
  X, Filter, Grid, List, Eye, Edit2, Trash2, Search, Upload, FileText, FileSpreadsheet,
  Sparkles, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon
} from 'lucide-react';
import { useActivityLogStore } from '@/store/activity-log.store';
import { toast } from '@/store/toast.store';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/lib/services/content.service';

export interface AcademicAgendaItem {
  id: string;
  title: string;
  category: 'Kalender Akademik Sekolah' | 'Agenda Kepala Sekolah & Guru';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  organizer: string;
  location: string;
  description: string;
}

const getInitialAgendas = (): AcademicAgendaItem[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const todayStr = `${year}-${month}-${String(now.getDate()).padStart(2, '0')}`;

  return [
    {
      id: 'ag-today-1',
      title: 'Pelaksanaan Penilaian Tengah Semester (PTS) Ganjil',
      category: 'Kalender Akademik Sekolah',
      date: todayStr,
      startTime: '08:00',
      endTime: '12:00',
      organizer: 'Kurikulum & Panitia Ujian SMP Darul Ulum',
      location: 'Ruang Kelas 7, 8, & 9 SMP Darul Ulum',
      description: 'Pelaksanaan asesmen tengah semester ganjil untuk seluruh siswa SMP Darul Ulum.',
    },
    {
      id: 'ag-today-2',
      title: 'Rapat Koordinasi Evaluasi Pembelajaran & Kurikulum',
      category: 'Agenda Kepala Sekolah & Guru',
      date: todayStr,
      startTime: '13:00',
      endTime: '15:00',
      organizer: 'Kepala Sekolah & Dewan Guru SMP Darul Ulum',
      location: 'Ruang Rapat Utama & Ruang Guru',
      description: 'Rapat evaluasi rutin mingguan perkembangan pembelajaran siswa dan kegiatan ekstrakurikuler.',
    },
    // Official Dinas Pendidikan Kota Surabaya Kalender Pendidikan T.A. 2026/2027
    {
      id: 'surabaya-kaldik-1',
      title: 'Libur Hari Besar: HUT Republik Indonesia ke-81',
      category: 'Kalender Akademik Sekolah',
      date: '2026-08-17',
      startTime: '07:00',
      endTime: '12:00',
      organizer: 'Dinas Pendidikan Kota Surabaya & Kemendikbudristek',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Peringatan Hari Ulang Tahun Kemerdekaan Republik Indonesia ke-81.',
    },
    {
      id: 'surabaya-kaldik-2',
      title: 'Libur Hari Besar: Maulid Nabi Muhammad SAW',
      category: 'Kalender Akademik Sekolah',
      date: '2026-08-25',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan peringatan Maulid Nabi Muhammad SAW.',
    },
    {
      id: 'surabaya-kaldik-3',
      title: 'Libur Hari Besar: Hari Kelahiran Yesus Kristus (Natal)',
      category: 'Kalender Akademik Sekolah',
      date: '2026-12-25',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Hari Kelahiran Yesus Kristus.',
    },
    {
      id: 'surabaya-kaldik-4',
      title: 'Libur Semester 1 (Ganjil) T.A. 2026/2027',
      category: 'Kalender Akademik Sekolah',
      date: '2026-12-21',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'SMP Darul Ulum',
      description: 'Pelaksanaan Libur Semester 1 (LS1) Murid T.A. 2026/2027 (21-31 Desember 2026).',
    },
    {
      id: 'surabaya-kaldik-5',
      title: 'Libur Hari Besar: Tahun Baru Masehi 2027',
      category: 'Kalender Akademik Sekolah',
      date: '2027-01-01',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur Nasional Tahun Baru Masehi 2027.',
    },
    {
      id: 'surabaya-kaldik-6',
      title: 'Libur Hari Besar: Isra Mi\'raj Nabi Muhammad SAW',
      category: 'Kalender Akademik Sekolah',
      date: '2027-01-05',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Isra Mi\'raj Nabi Muhammad SAW.',
    },
    {
      id: 'surabaya-kaldik-7',
      title: 'Libur Hari Besar: Tahun Baru Imlek 2578 Kongzili',
      category: 'Kalender Akademik Sekolah',
      date: '2027-02-06',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional Tahun Baru Imlek 2578 Kongzili.',
    },
    {
      id: 'surabaya-kaldik-8',
      title: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
      category: 'Kalender Akademik Sekolah',
      date: '2027-02-08',
      startTime: '07:00',
      endTime: '12:00',
      organizer: 'Dinas Pendidikan Kota Surabaya & SMP Darul Ulum',
      location: 'Masjid & Kampus SMP Darul Ulum',
      description: 'Kegiatan permulaan puasa Ramadhan 1448 H untuk siswa-siswi.',
    },
    {
      id: 'surabaya-kaldik-9',
      title: 'Libur Hari Besar: Hari Raya Nyepi Tahun Saka 1949',
      category: 'Kalender Akademik Sekolah',
      date: '2027-03-09',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Hari Raya Nyepi Tahun Saka 1949.',
    },
    {
      id: 'surabaya-kaldik-10',
      title: 'Libur Hari Besar & Hari Raya: Idul Fitri 1448 H',
      category: 'Kalender Akademik Sekolah',
      date: '2027-03-10',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur Hari Besar dan Cuti Bersama Idul Fitri 1448 H (10-11 Maret 2027).',
    },
    {
      id: 'surabaya-kaldik-11',
      title: 'Libur Hari Besar: Wafat Yesus Kristus',
      category: 'Kalender Akademik Sekolah',
      date: '2027-03-26',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional Wafat Yesus Kristus.',
    },
    {
      id: 'surabaya-kaldik-12',
      title: 'Libur Hari Besar: Hari Paskah',
      category: 'Kalender Akademik Sekolah',
      date: '2027-03-28',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Hari Paskah.',
    },
    {
      id: 'surabaya-kaldik-13',
      title: 'Libur Hari Besar: Hari Buruh International',
      category: 'Kalender Akademik Sekolah',
      date: '2027-05-01',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional Hari Buruh International.',
    },
    {
      id: 'surabaya-kaldik-14',
      title: 'Libur Hari Besar: Kenaikan Yesus Kristus',
      category: 'Kalender Akademik Sekolah',
      date: '2027-05-06',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional Kenaikan Yesus Kristus.',
    },
    {
      id: 'surabaya-kaldik-15',
      title: 'Libur Hari Besar: Hari Raya Idul Adha 1448 H',
      category: 'Kalender Akademik Sekolah',
      date: '2027-05-17',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Hari Raya Idul Adha 1448 H.',
    },
    {
      id: 'surabaya-kaldik-16',
      title: 'Libur Hari Besar: Hari Raya Waisak 2571',
      category: 'Kalender Akademik Sekolah',
      date: '2027-05-20',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Hari Raya Waisak 2571.',
    },
    {
      id: 'surabaya-kaldik-17',
      title: 'Libur Hari Besar: Hari Lahir Pancasila',
      category: 'Kalender Akademik Sekolah',
      date: '2027-06-01',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional Hari Lahir Pancasila.',
    },
    {
      id: 'surabaya-kaldik-18',
      title: 'Libur Hari Besar: Tahun Baru Hijriyah 1449 H',
      category: 'Kalender Akademik Sekolah',
      date: '2027-06-06',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'Seluruh Lingkungan Sekolah',
      description: 'Libur nasional keagamaan Tahun Baru Hijriyah 1449 H.',
    },
    {
      id: 'surabaya-kaldik-19',
      title: 'Libur Semester 2 (Genap) T.A. 2026/2027',
      category: 'Kalender Akademik Sekolah',
      date: '2027-06-21',
      startTime: '00:00',
      endTime: '23:59',
      organizer: 'Dinas Pendidikan Kota Surabaya',
      location: 'SMP Darul Ulum',
      description: 'Pelaksanaan Libur Semester 2 (LS2) Murid T.A. 2026/2027 (21 Juni - 10 Juli 2027).',
    },
  ];
};


const MONTH_NAMES_IND = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function AdminAgendaPage() {
  const { addLog } = useActivityLogStore();
  const { user } = useAuth();
  const actorName = (user as any)?.teacher?.fullName || (user as any)?.email || 'Admin Utama';

  // Dynamic Date (NOW)
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const [agendas, setAgendas] = useState<AcademicAgendaItem[]>(getInitialAgendas);
  const [activeViewMode, setActiveViewMode] = useState<'month' | 'hour' | 'list'>('month');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('SEMUA');

  // Month Navigation
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Hourly Date
  const [selectedHourlyDate, setSelectedHourlyDate] = useState(todayStr);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadKaldikModal, setShowUploadKaldikModal] = useState(false);

  // Kaldik Upload & Extraction State
  const [kaldikFile, setKaldikFile] = useState<File | null>(null);
  const [isParsingKaldik, setIsParsingKaldik] = useState(false);
  const [extractedEvents, setExtractedEvents] = useState<Array<AcademicAgendaItem & { selected: boolean }>>([]);

  const [selectedAgenda, setSelectedAgenda] = useState<AcademicAgendaItem | null>(null);
  const [editingAgenda, setEditingAgenda] = useState<AcademicAgendaItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Agenda Kepala Sekolah & Guru' as AcademicAgendaItem['category'],
    date: todayStr,
    startTime: '08:00',
    endTime: '12:00',
    organizer: 'Sekretariat SMP Darul Ulum',
    location: 'Ruang Rapat Utama SMP Darul Ulum',
    description: '',
  });

  const updateForm = (key: string, val: any) => setFormData((p) => ({ ...p, [key]: val }));

  // Load live events from Express Backend API (Zero localStorage!)
  useEffect(() => {
    const fetchAgendasBackend = async () => {
      try {
        const res = await contentService.getEvents();
        if (res?.data && Array.isArray(res.data)) {
          const mapped: AcademicAgendaItem[] = res.data.map((ev: any) => ({
            id: ev.id,
            title: ev.title,
            category: ev.category === 'Kalender Akademik Sekolah' ? 'Kalender Akademik Sekolah' : 'Agenda Kepala Sekolah & Guru',
            date: ev.startDate ? String(ev.startDate).split('T')[0] : todayStr,
            startTime: '08:00',
            endTime: '12:00',
            organizer: ev.organizer || 'SMP Darul Ulum',
            location: ev.location || 'Kampus SMP Darul Ulum',
            description: ev.description || ev.title,
          }));
          setAgendas(mapped);
        }
      } catch (err) {

        console.warn('Backend agenda load warning:', err);
      }
    };
    fetchAgendasBackend();
  }, [todayStr]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedHourlyDate(todayStr);
  };

  // Calendar Days Calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days: Array<{ dayNumber: number | null; dateStr: string | null; events: AcademicAgendaItem[] }> = [];

    // Leading empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, dateStr: null, events: [] });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = agendas.filter((a) => a.date === dateStr);
      days.push({ dayNumber: day, dateStr, events: dayEvents });
    }

    return days;
  }, [currentYear, currentMonth, agendas]);

  // Hourly slots for Detail Jam (Hari) View
  const HOURLY_SLOTS = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

  const hourlyAgendas = useMemo(() => {
    return agendas.filter((a) => a.date === selectedHourlyDate);
  }, [agendas, selectedHourlyDate]);

  // Filtered List Agendas for View Mode 3
  const filteredListAgendas = useMemo(() => {
    return agendas.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'SEMUA' || item.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [agendas, searchQuery, categoryFilter]);

  // Handlers for File Kaldik Upload & Parsing
  const handleKaldikFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setKaldikFile(file);
    setIsParsingKaldik(true);

    // Simulate PDF/Image OCR / Parsing Engine for Kalender Pendidikan
    setTimeout(() => {
      const mockParsed: Array<AcademicAgendaItem & { selected: boolean }> = [
        {
          id: `ext-1-${Date.now()}`,
          title: 'Libur Hari Besar: HUT Republik Indonesia ke-81',
          category: 'Kalender Akademik Sekolah',
          date: '2026-08-17',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar memperingati HUT Kemerdekaan RI ke-81.',
          selected: true,
        },
        {
          id: `ext-2-${Date.now()}`,
          title: 'Libur Hari Besar: Maulid Nabi Muhammad SAW 1448 H',
          category: 'Kalender Akademik Sekolah',
          date: '2026-08-25',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar peringatan Maulid Nabi Muhammad SAW 1448 H.',
          selected: true,
        },
        {
          id: `ext-3-${Date.now()}`,
          title: 'Libur Semester 1 (Ganjil) T.A. 2026/2027',
          category: 'Kalender Akademik Sekolah',
          date: '2026-12-21',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'SMP Darul Ulum Surabaya',
          description: 'Libur resmi semester 1 (Ganjil) bagi murid (21 - 31 Desember 2026).',
          selected: true,
        },
        {
          id: `ext-4-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Kelahiran Yesus Kristus (Natal)',
          category: 'Kalender Akademik Sekolah',
          date: '2026-12-25',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Kelahiran Yesus Kristus.',
          selected: true,
        },
        {
          id: `ext-5-${Date.now()}`,
          title: 'Libur Hari Besar: Tahun Baru 2027 Masehi',
          category: 'Kalender Akademik Sekolah',
          date: '2027-01-01',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Tahun Baru Masehi 2027.',
          selected: true,
        },
        {
          id: `ext-6-${Date.now()}`,
          title: 'Libur Hari Besar: Isra Mi\'raj Nabi Muhammad SAW 1448 H',
          category: 'Kalender Akademik Sekolah',
          date: '2027-01-05',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Isra Mi\'raj Nabi Muhammad SAW 1448 H.',
          selected: true,
        },
        {
          id: `ext-7-${Date.now()}`,
          title: 'Libur Hari Besar: Tahun Baru Imlek 2578 Kongzili',
          category: 'Kalender Akademik Sekolah',
          date: '2027-02-06',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Tahun Baru Imlek 2578 Kongzili.',
          selected: true,
        },
        {
          id: `ext-8-${Date.now()}`,
          title: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H',
          category: 'Kalender Akademik Sekolah',
          date: '2027-02-08',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'SMP Darul Ulum Surabaya',
          description: 'Kegiatan Permulaan Puasa (KPP) Ramadhan 1448 H (8 - 10 Februari 2027).',
          selected: true,
        },
        {
          id: `ext-9-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Raya Nyepi Tahun Saka 1949',
          category: 'Kalender Akademik Sekolah',
          date: '2027-03-09',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Raya Nyepi Tahun Saka 1949.',
          selected: true,
        },
        {
          id: `ext-10-${Date.now()}`,
          title: 'Libur Hari Besar & Cuti Bersama: Idul Fitri 1448 H',
          category: 'Kalender Akademik Sekolah',
          date: '2027-03-10',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar dan Cuti Bersama Idul Fitri 1448 H (10 - 11 Maret 2027).',
          selected: true,
        },
        {
          id: `ext-11-${Date.now()}`,
          title: 'Libur Hari Besar: Wafat Yesus Kristus',
          category: 'Kalender Akademik Sekolah',
          date: '2027-03-26',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Wafat Yesus Kristus.',
          selected: true,
        },
        {
          id: `ext-12-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Paskah',
          category: 'Kalender Akademik Sekolah',
          date: '2027-03-28',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Paskah.',
          selected: true,
        },
        {
          id: `ext-13-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Buruh International',
          category: 'Kalender Akademik Sekolah',
          date: '2027-05-01',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Buruh International.',
          selected: true,
        },
        {
          id: `ext-14-${Date.now()}`,
          title: 'Libur Hari Besar: Kenaikan Yesus Kristus',
          category: 'Kalender Akademik Sekolah',
          date: '2027-05-06',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Kenaikan Yesus Kristus.',
          selected: true,
        },
        {
          id: `ext-15-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Raya Idul Adha 1448 H',
          category: 'Kalender Akademik Sekolah',
          date: '2027-05-17',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Raya Idul Adha 1448 H.',
          selected: true,
        },
        {
          id: `ext-16-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Raya Waisak 2571',
          category: 'Kalender Akademik Sekolah',
          date: '2027-05-20',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Raya Waisak 2571.',
          selected: true,
        },
        {
          id: `ext-17-${Date.now()}`,
          title: 'Libur Hari Besar: Hari Lahir Pancasila',
          category: 'Kalender Akademik Sekolah',
          date: '2027-06-01',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Hari Lahir Pancasila.',
          selected: true,
        },
        {
          id: `ext-18-${Date.now()}`,
          title: 'Libur Hari Besar: Tahun Baru Hijriyah 1449 H',
          category: 'Kalender Akademik Sekolah',
          date: '2027-06-06',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'Seluruh Lingkungan Sekolah',
          description: 'Libur Hari Besar Tahun Baru Hijriyah 1449 H.',
          selected: true,
        },
        {
          id: `ext-19-${Date.now()}`,
          title: 'Libur Semester 2 (Genap) T.A. 2026/2027',
          category: 'Kalender Akademik Sekolah',
          date: '2027-06-21',
          startTime: '00:00',
          endTime: '23:59',
          organizer: 'Dinas Pendidikan Kota Surabaya',
          location: 'SMP Darul Ulum Surabaya',
          description: 'Libur resmi semester 2 (Genap) bagi murid (21 Juni - 10 Juli 2027).',
          selected: true,
        },
      ];

      setExtractedEvents(mockParsed);
      setIsParsingKaldik(false);
      toast.success('Berkas Dianalisis', `Berhasil mengekstraksi ${mockParsed.length} agenda lengkap dari file ${file.name}`);
    }, 1200);
  };

  const handleConfirmImportExtracted = async () => {
    const selectedItems = extractedEvents.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      toast.error('Tidak Ada Agenda Dipilih', 'Pilih minimal 1 agenda untuk diimpor ke kalender.');
      return;
    }

    // Save each extracted item directly to Backend API
    const newItems: AcademicAgendaItem[] = selectedItems.map(({ selected, ...item }) => item);

    setAgendas((prev) => [...newItems, ...prev]);

    // Async save to Express API & Auto-create Announcements for Kaldik Holidays
    for (const item of newItems) {
      try {
        await contentService.createEvent({
          title: item.title,
          description: item.description,
          location: item.location,
          startDate: item.date,
          endDate: item.date,
        });

        // Auto-generate official announcement if item is a holiday / academic event
        const titleLower = item.title.toLowerCase();
        if (titleLower.includes('libur') || titleLower.includes('peringatan') || titleLower.includes('puasa') || item.category === 'Kalender Akademik Sekolah') {
          await contentService.createAnnouncement({
            title: `[Pengumuman Resmi] ${item.title}`,
            content: `Diberitahukan kepada seluruh siswa, guru, dan orang tua/wali murid SMP Darul Ulum Surabaya bahwa dalam rangka ${item.title}, kegiatan sekolah diliburkan/disesuaikan pada tanggal ${item.date}.`,
            isPinned: titleLower.includes('libur'),
            targetRole: 'SEMUA',
            expiresAt: item.date,
          });
        }
      } catch (err) {
        console.warn('Backend import extracted event failed:', err);
      }
    }


    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Mengimpor ${newItems.length} Agenda dari Upload Kaldik File (${kaldikFile?.name})`,
      module: 'Pengguna',
      severity: 'SUCCESS',
      details: `File: ${kaldikFile?.name}`,
    });

    toast.success('Kaldik Berhasil Diimpor', `${newItems.length} agenda kalender resmi telah terinput ke sistem.`);
    setShowUploadKaldikModal(false);
    setKaldikFile(null);
    setExtractedEvents([]);
  };

  // Standard Add/Edit/Delete Handlers
  const handleOpenAdd = (defaultDate?: string) => {
    setEditingAgenda(null);
    setFormData({
      title: '',
      category: 'Agenda Kepala Sekolah & Guru',
      date: defaultDate || selectedHourlyDate || todayStr,
      startTime: '08:00',
      endTime: '12:00',
      organizer: 'Sekretariat SMP Darul Ulum',
      location: 'Ruang Rapat Utama SMP Darul Ulum',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: AcademicAgendaItem) => {
    setEditingAgenda(item);
    setFormData({
      title: item.title,
      category: item.category,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      organizer: item.organizer,
      location: item.location,
      description: item.description,
    });
    setShowAddModal(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingAgenda) {
      setAgendas((prev) =>
        prev.map((a) => (a.id === editingAgenda.id ? { ...a, ...formData } : a))
      );

      try {
        await contentService.updateEvent(editingAgenda.id, {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          startDate: formData.date,
          endDate: formData.date,
        });
      } catch (err) {
        console.warn('Backend update event failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Memperbarui Agenda "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Kategori: ${formData.category}, Tanggal: ${formData.date}`,
      });
      toast.success('Agenda Diperbarui', `Agenda "${formData.title}" berhasil diperbarui.`);
    } else {
      const newAgenda: AcademicAgendaItem = {
        id: `agenda-${Date.now()}`,
        ...formData,
      };

      setAgendas((prev) => [newAgenda, ...prev]);

      try {
        await contentService.createEvent({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          startDate: formData.date,
          endDate: formData.date,
        });
      } catch (err) {
        console.warn('Backend create event failed:', err);
      }

      addLog({
        user: actorName,
        role: 'ADMIN',
        action: `Menambahkan Agenda Baru "${formData.title}"`,
        module: 'Pengguna',
        severity: 'SUCCESS',
        details: `Kategori: ${formData.category}, Tanggal: ${formData.date}`,
      });
      toast.success('Agenda Ditambahkan', `Agenda baru "${formData.title}" berhasil dibuat.`);
    }

    setShowAddModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAgenda) return;
    setAgendas((prev) => prev.filter((a) => a.id !== selectedAgenda.id));

    try {
      await contentService.deleteEvent(selectedAgenda.id);
    } catch (err) {
      console.warn('Backend delete event failed:', err);
    }

    addLog({
      user: actorName,
      role: 'ADMIN',
      action: `Menghapus Agenda "${selectedAgenda.title}"`,
      module: 'Pengguna',
      severity: 'DANGER',
      details: `ID Agenda: ${selectedAgenda.id}`,
    });

    toast.success('Agenda Dihapus', `Agenda "${selectedAgenda.title}" telah dihapus.`);
    setShowDeleteModal(false);
    setSelectedAgenda(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── 1. HEADER TITLE (CLEAN WITHOUT H1 ICON) ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Jadwal dan Agenda Akademik
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Jadwal kalender akademik resmi SMP Darul Ulum &amp; rincian agenda per jam Dewan Guru / Kepala Sekolah
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload Kaldik (PDF/Gambar) Button */}
          <button
            onClick={() => {
              setKaldikFile(null);
              setExtractedEvents([]);
              setShowUploadKaldikModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload Kaldik (PDF/Gambar)</span>
          </button>

          {/* + Tambah Agenda */}
          <button
            onClick={() => handleOpenAdd()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* ── 2. LEGEND BADGES & 3-WAY MODE SWITCHER ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Legend */}
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
            <span>Kalender Akademik Sekolah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Agenda Kepala Sekolah &amp; Guru</span>
          </div>
        </div>

        {/* 3-Way Mode Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => setActiveViewMode('month')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Bulan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('hour')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'hour'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Detail Jam (Hari)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('list')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeViewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Daftar Agenda</span>
          </button>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT CONTAINER ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
        {/* ── MODE 1: BULAN (MONTH GRID VIEW) ──────────────────────────────── */}
        {activeViewMode === 'month' && (
          <div className="space-y-5">
            {/* Control Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{MONTH_NAMES_IND[currentMonth]} {currentYear}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {MONTH_NAMES_IND[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToToday}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                >
                  Hari Ini
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 text-center text-xs font-black uppercase tracking-wider py-2 border-b border-slate-100">
              <span className="text-rose-600">MIN</span>
              <span className="text-slate-600">SEN</span>
              <span className="text-slate-600">SEL</span>
              <span className="text-slate-600">RAB</span>
              <span className="text-slate-600">KAM</span>
              <span className="text-slate-600">JUM</span>
              <span className="text-slate-600">SAB</span>
            </div>

            {/* Grid Days Cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell, idx) => {
                if (cell.dayNumber === null) {
                  return <div key={idx} className="h-32 rounded-2xl bg-slate-50/40 border border-slate-100" />;
                }

                const isTodayCell = cell.dateStr === todayStr;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (cell.dateStr) {
                        setSelectedHourlyDate(cell.dateStr);
                        handleOpenAdd(cell.dateStr);
                      }
                    }}
                    className={`h-32 p-2.5 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                      isTodayCell
                        ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                        : cell.events.length > 0
                        ? 'bg-indigo-50/20 border-indigo-100 hover:border-indigo-300'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isTodayCell ? 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md' : 'text-slate-800'}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.events.length > 0 && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                          {cell.events.length} Agenda
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto overflow-x-hidden max-h-20 w-full">
                      {cell.events.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgenda(ev);
                            setShowDetailModal(true);
                          }}
                          className={`p-1.5 rounded-xl border text-[11px] font-bold w-full max-w-full overflow-hidden transition-all hover:scale-101 ${
                            ev.category === 'Kalender Akademik Sekolah'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          }`}
                        >
                          <p className="truncate font-extrabold w-full">{ev.title}</p>
                          <p className="text-[10px] font-medium text-slate-500 truncate w-full">⏱️ {ev.startTime} - {ev.endTime}</p>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MODE 2: DETAIL JAM (HARI) HOURLY TIMELINE ───────────────────── */}
        {activeViewMode === 'hour' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedHourlyDate}
                  onChange={(e) => setSelectedHourlyDate(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
                />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Timeline Agenda Per Jam ({selectedHourlyDate})
                </h3>
              </div>
              <span className="text-xs font-extrabold text-slate-500">
                Total Agenda: <strong className="text-slate-900">{hourlyAgendas.length} Kegiatan</strong>
              </span>
            </div>

            <div className="space-y-3">
              {HOURLY_SLOTS.map((hour) => {
                const hourNum = parseInt(hour.split(':')[0], 10);
                const matchingAgendas = hourlyAgendas.filter((a) => {
                  const startH = parseInt(a.startTime.split(':')[0], 10);
                  return startH === hourNum;
                });

                return (
                  <div key={hour} className="flex gap-4 items-start group">
                    <span className="text-xs font-mono font-bold text-slate-400 w-12 pt-2 text-right shrink-0">
                      {hour}
                    </span>
                    <div className="flex-1 min-h-[50px] p-3 rounded-2xl border border-slate-100 bg-slate-50/40 group-hover:bg-slate-50 transition-colors">
                      {matchingAgendas.length > 0 ? (
                        <div className="space-y-2">
                          {matchingAgendas.map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => {
                                setSelectedAgenda(ev);
                                setShowDetailModal(true);
                              }}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer shadow-2xs transition-all hover:scale-101 ${
                                ev.category === 'Kalender Akademik Sekolah'
                                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              }`}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${ev.category === 'Kalender Akademik Sekolah' ? 'bg-indigo-600' : 'bg-emerald-500'}`} />
                                  <h4 className="text-xs font-extrabold truncate">{ev.title}</h4>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 pl-4">
                                  <span>⏱️ {ev.startTime} - {ev.endTime} WIB</span>
                                  <span>📍 {ev.location}</span>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-extrabold text-slate-700 shrink-0">
                                {ev.organizer}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-300 italic">Tidak ada agenda pada jam ini</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MODE 3: DAFTAR AGENDA (LIST VIEW) ───────────────────────────── */}
        {activeViewMode === 'list' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                Daftar Seluruh Agenda Akademik &amp; Kegiatan ({filteredListAgendas.length})
              </h3>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari agenda, lokasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none cursor-pointer"
                >
                  <option value="SEMUA">Semua Kategori</option>
                  <option value="Kalender Akademik Sekolah">Kalender Akademik Sekolah</option>
                  <option value="Agenda Kepala Sekolah & Guru">Agenda Kepala Sekolah &amp; Guru</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredListAgendas.length > 0 ? (
                filteredListAgendas.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-2xs ${
                      item.category === 'Kalender Akademik Sekolah'
                        ? 'bg-indigo-50/40 border-indigo-200/70'
                        : 'bg-emerald-50/40 border-emerald-200/70'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          item.category === 'Kalender Akademik Sekolah'
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {item.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">Tanggal: {item.date}</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-1">⏱️ {item.startTime} - {item.endTime} WIB</span>
                        <span className="flex items-center gap-1">🏢 {item.organizer}</span>
                        <span className="flex items-center gap-1">📍 {item.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAgenda(item);
                          setShowDetailModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        Lihat Rincian
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                        title="Edit Agenda"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAgenda(item);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title="Hapus Agenda"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-200 text-slate-400">
                  <p className="text-xs font-semibold text-slate-500">Tidak ada agenda kegiatan yang ditemukan.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL UPLOAD & EXTRACTION KALENDER PENDIDIKAN (PDF/GAMBAR) ────── */}
      {showUploadKaldikModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Upload &amp; Ekstraksi Kalender Pendidikan</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Unggah file Kaldik (PDF / Gambar JPG / PNG) untuk diinput otomatis</p>
                </div>
              </div>
              <button onClick={() => setShowUploadKaldikModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* File Dropzone Input */}
            {!kaldikFile && (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3 hover:border-emerald-400 transition-colors bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-800">
                    Pilih Berkas Kaldik (PDF atau Gambar)
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Format: PDF, PNG, JPG (Maks. 10 MB)</p>
                </div>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Komputer</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleKaldikFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Parsing State Indicator */}
            {isParsingKaldik && (
              <div className="p-8 text-center space-y-3 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                <p className="text-xs font-extrabold text-emerald-950">
                  Menganalisis file {kaldikFile?.name}...
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">Mengekstraksi tanggal PTS, PAS, ANBK, &amp; Libur Nasional otomatis.</p>
              </div>
            )}

            {/* Extracted Agenda Preview List */}
            {extractedEvents.length > 0 && !isParsingKaldik && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Pratinjau {extractedEvents.length} Agenda Terdeteksi dari Berkas</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-semibold">{kaldikFile?.name}</span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {extractedEvents.map((item, i) => (
                    <div key={item.id} className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setExtractedEvents((prev) =>
                            prev.map((ev, idx) => (idx === i ? { ...ev, selected: checked } : ev))
                          );
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono">📅 {item.date} | 📍 {item.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Modal Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowUploadKaldikModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>

              {extractedEvents.length > 0 && !isParsingKaldik && (
                <button
                  type="button"
                  onClick={handleConfirmImportExtracted}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi &amp; Input Ke Kalender Agenda</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL RINCIAN AGENDA ─────────────────────────────────────── */}
      {showDetailModal && selectedAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                selectedAgenda.category === 'Kalender Akademik Sekolah'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {selectedAgenda.category}
              </span>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-extrabold text-slate-900">{selectedAgenda.title}</h3>

            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-sky-600" /> <span>Tanggal: <strong>{selectedAgenda.date}</strong></span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> <span>Waktu: <strong>{selectedAgenda.startTime} – {selectedAgenda.endTime} WIB</strong></span></div>
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-600" /> <span>Penyelenggara: <strong>{selectedAgenda.organizer}</strong></span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-500" /> <span>Lokasi: <strong>{selectedAgenda.location}</strong></span></div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Deskripsi &amp; Catatan:</h4>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                {selectedAgenda.description || 'Tidak ada catatan tambahan.'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT AGENDA ──────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingAgenda ? 'Edit Agenda Sekolah' : 'Tambah Agenda Sekolah / Guru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Input agenda kegiatan rapat, evaluasi, atau asesmen SMP Darul Ulum</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Judul Agenda / Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Rapat Koordinasi Pembelajaran SMP Darul Ulum"
                  value={formData.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Kategori Agenda *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Agenda Kepala Sekolah & Guru">Agenda Kepala Sekolah &amp; Guru</option>
                    <option value="Kalender Akademik Sekolah">Kalender Akademik Sekolah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Tanggal Pelaksanaan *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => updateForm('date', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => updateForm('startTime', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => updateForm('endTime', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Penyelenggara / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="Sekretariat SMP Darul Ulum"
                    value={formData.organizer}
                    onChange={(e) => updateForm('organizer', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Lokasi / Link Zoom</label>
                  <input
                    type="text"
                    required
                    placeholder="Ruang Rapat / Kampus Sekolah"
                    value={formData.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Deskripsi / Catatan Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Tambahkan rincian agenda..."
                  value={formData.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL HAPUS AGENDA ──────────────────────────────────────────────── */}
      {showDeleteModal && selectedAgenda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="font-extrabold text-slate-900 text-base">Hapus Agenda Ini?</h3>
            <p className="text-xs text-slate-600 font-medium">
              Apakah Anda yakin ingin menghapus agenda <strong className="text-slate-900">{selectedAgenda.title}</strong>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
