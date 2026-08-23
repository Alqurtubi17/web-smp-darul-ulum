import { create } from 'zustand';
import { contentService } from '@/lib/services/content.service';

export interface AcademicYearItem {
  id: string;
  year: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  status: 'Aktif' | 'Arsip' | 'Mendatang';
}

interface AcademicYearState {
  activeYear: string;
  activeSemester: 'Ganjil' | 'Genap';
  academicYears: AcademicYearItem[];
  isLoaded: boolean;

  setActiveYear: (year: string, semester?: 'Ganjil' | 'Genap') => void;
  setActiveSemester: (semester: 'Ganjil' | 'Genap') => void;
  addAcademicYear: (year: string, semester: 'Ganjil' | 'Genap') => void;
  deleteAcademicYear: (id: string) => void;
  toggleYearStatus: (id: string) => void;
  initAcademicYear: () => Promise<void>;
}

const DEFAULT_YEARS: AcademicYearItem[] = [
  { id: '1', year: '2024/2025', semester: 'Ganjil', isActive: true, status: 'Aktif', startDate: '2024-07-15', endDate: '2024-12-20' },
  { id: '2', year: '2023/2024', semester: 'Genap', isActive: false, status: 'Arsip', startDate: '2024-01-08', endDate: '2024-06-25' },
  { id: '3', year: '2023/2024', semester: 'Ganjil', isActive: false, status: 'Arsip', startDate: '2023-07-17', endDate: '2023-12-22' },
  { id: '4', year: '2025/2026', semester: 'Ganjil', isActive: false, status: 'Mendatang', startDate: '2025-07-14', endDate: '2025-12-19' },
];

export const useAcademicYearStore = create<AcademicYearState>((set, get) => ({
  activeYear: '2024/2025',
  activeSemester: 'Ganjil',
  academicYears: DEFAULT_YEARS,
  isLoaded: false,

  initAcademicYear: async () => {
    try {
      const res = await contentService.getSettings();
      if (res?.data) {
        const backendYear = res.data.active_academic_year;
        const backendSemester = res.data.active_academic_semester as 'Ganjil' | 'Genap';
        let parsedYears = get().academicYears;

        if (res.data.academic_years_json) {
          try {
            parsedYears = JSON.parse(res.data.academic_years_json);
          } catch {
            // fallback
          }
        }

        const updatedYears = parsedYears.map((item) => ({
          ...item,
          isActive: item.year === backendYear && item.semester === backendSemester,
          status: item.year === backendYear && item.semester === backendSemester ? ('Aktif' as const) : item.status,
        }));

        set({
          activeYear: backendYear || get().activeYear,
          activeSemester: backendSemester || get().activeSemester,
          academicYears: updatedYears,
          isLoaded: true,
        });
      }
    } catch (err) {
      console.warn('Academic year init backend warning:', err);
    }
  },

  setActiveYear: (year: string, semester?: 'Ganjil' | 'Genap') => {
    const sem = semester || get().activeSemester;
    const updatedList = get().academicYears.map((item) => ({
      ...item,
      isActive: item.year === year && item.semester === sem,
      status: item.year === year && item.semester === sem ? ('Aktif' as const) : item.status === 'Aktif' ? ('Arsip' as const) : item.status,
    }));

    set({ activeYear: year, activeSemester: sem, academicYears: updatedList });

    // Persist to PostgreSQL via Express API
    contentService.updateSettings({
      active_academic_year: year,
      active_academic_semester: sem,
      academic_years_json: JSON.stringify(updatedList),
    }).catch((err) => console.warn('Save academic year warning:', err));
  },

  setActiveSemester: (semester: 'Ganjil' | 'Genap') => {
    get().setActiveYear(get().activeYear, semester);
  },

  addAcademicYear: (year: string, semester: 'Ganjil' | 'Genap') => {
    const newItem: AcademicYearItem = {
      id: Date.now().toString(),
      year,
      semester,
      isActive: false,
      status: 'Mendatang',
    };
    const updated = [newItem, ...get().academicYears];
    set({ academicYears: updated });

    contentService.updateSettings({
      academic_years_json: JSON.stringify(updated),
    }).catch((err) => console.warn('Save academic years list warning:', err));
  },

  deleteAcademicYear: (id: string) => {
    const target = get().academicYears.find((y) => y.id === id);
    if (!target) return;

    const updated = get().academicYears.filter((y) => y.id !== id);

    if (target.year === get().activeYear && target.semester === get().activeSemester && updated.length > 0) {
      get().setActiveYear(updated[0].year, updated[0].semester);
    } else {
      set({ academicYears: updated });
      contentService.updateSettings({
        academic_years_json: JSON.stringify(updated),
      }).catch((err) => console.warn('Save academic years delete warning:', err));
    }
  },

  toggleYearStatus: (id: string) => {
    const target = get().academicYears.find((y) => y.id === id);
    if (target) {
      get().setActiveYear(target.year, target.semester);
    }
  },
}));
