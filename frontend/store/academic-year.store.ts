import { create } from 'zustand';

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

  setActiveYear: (year: string, semester?: 'Ganjil' | 'Genap') => void;
  setActiveSemester: (semester: 'Ganjil' | 'Genap') => void;
  addAcademicYear: (year: string, semester: 'Ganjil' | 'Genap') => void;
  deleteAcademicYear: (id: string) => void;
  toggleYearStatus: (id: string) => void;
  initAcademicYear: () => void;
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

  initAcademicYear: () => {
    // Memory state only - Zero localStorage
  },

  setActiveYear: (year: string, semester?: 'Ganjil' | 'Genap') => {
    const sem = semester || get().activeSemester;
    const updatedList = get().academicYears.map((item) => ({
      ...item,
      isActive: item.year === year && item.semester === sem,
      status: item.year === year && item.semester === sem ? ('Aktif' as const) : item.status === 'Aktif' ? ('Arsip' as const) : item.status,
    }));

    set({ activeYear: year, activeSemester: sem, academicYears: updatedList });
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
  },

  deleteAcademicYear: (id: string) => {
    const target = get().academicYears.find((y) => y.id === id);
    if (!target) return;

    const updated = get().academicYears.filter((y) => y.id !== id);

    // If target was active and there are remaining years, pick the first
    if (target.year === get().activeYear && target.semester === get().activeSemester && updated.length > 0) {
      get().setActiveYear(updated[0].year, updated[0].semester);
    } else {
      set({ academicYears: updated });
    }
  },

  toggleYearStatus: (id: string) => {
    const target = get().academicYears.find((y) => y.id === id);
    if (target) {
      get().setActiveYear(target.year, target.semester);
    }
  },
}));
