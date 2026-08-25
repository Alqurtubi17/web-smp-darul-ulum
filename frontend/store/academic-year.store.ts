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
      const settingsData = res?.data || res;
      if (settingsData && typeof settingsData === 'object') {
        const backendYear = settingsData.active_academic_year || get().activeYear;
        const backendSemester = (settingsData.active_academic_semester as 'Ganjil' | 'Genap') || get().activeSemester;

        let dbYears: AcademicYearItem[] = get().academicYears;

        if (Array.isArray(settingsData.academicYears) && settingsData.academicYears.length > 0) {
          dbYears = settingsData.academicYears.map((ay: any) => ({
            id: ay.id,
            year: ay.year,
            semester: ay.semester,
            isActive: Boolean(ay.isActive),
            status: ay.status || (ay.isActive ? 'Aktif' : 'Arsip'),
            startDate: ay.startDate ? String(ay.startDate).split('T')[0] : undefined,
            endDate: ay.endDate ? String(ay.endDate).split('T')[0] : undefined,
          }));
        } else if (settingsData.academic_years_json) {
          try {
            dbYears = JSON.parse(settingsData.academic_years_json);
          } catch {
            // fallback
          }
        }

        const activeItem = dbYears.find((y) => y.isActive);
        const finalYear = activeItem ? activeItem.year : backendYear;
        const finalSemester = activeItem ? activeItem.semester : backendSemester;

        set({
          activeYear: finalYear,
          activeSemester: finalSemester,
          academicYears: dbYears,
          isLoaded: true,
        });
      }
    } catch (err) {
      console.warn('Academic year init backend warning:', err);
    }
  },

  setActiveYear: async (idOrYear: string, semester?: 'Ganjil' | 'Genap') => {
    let target = get().academicYears.find((item) => item.id === idOrYear);
    if (!target) {
      const sem = semester || get().activeSemester;
      target = get().academicYears.find((item) => item.year === idOrYear && item.semester === sem) || get().academicYears.find((item) => item.year === idOrYear);
    }

    if (!target) return;

    const targetYear = target.year;
    const targetSem = target.semester;

    const updatedList = get().academicYears.map((item) => ({
      ...item,
      isActive: item.id === target!.id,
      status: item.id === target!.id ? ('Aktif' as const) : ('Arsip' as const),
    }));

    set({ activeYear: targetYear, activeSemester: targetSem, academicYears: updatedList });

    try {
      await contentService.setActiveAcademicYear(target.id);
    } catch (err) {
      console.warn('Set active academic year warning:', err);
    }

    contentService.updateSettings({
      active_academic_year: targetYear,
      active_academic_semester: targetSem,
      academic_years_json: JSON.stringify(updatedList),
    }).catch((err) => console.warn('Save academic year settings warning:', err));
  },

  setActiveSemester: (semester: 'Ganjil' | 'Genap') => {
    get().setActiveYear(get().activeYear, semester);
  },

  addAcademicYear: async (year: string, semester: 'Ganjil' | 'Genap') => {
    try {
      const res = await contentService.addAcademicYear({ year, semester });
      const created = res?.data || res;
      if (created && created.id) {
        const newItem: AcademicYearItem = {
          id: created.id,
          year: created.year,
          semester: created.semester,
          isActive: Boolean(created.isActive),
          status: created.status || 'Mendatang',
        };
        const updated = [newItem, ...get().academicYears];
        set({ academicYears: updated });
        return;
      }
    } catch (err) {
      console.warn('Add academic year API warning:', err);
    }

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

  deleteAcademicYear: async (id: string) => {
    const target = get().academicYears.find((y) => y.id === id);
    if (!target) return;

    try {
      await contentService.deleteAcademicYear(id);
    } catch (err) {
      console.warn('Delete academic year API warning:', err);
    }

    const updated = get().academicYears.filter((y) => y.id !== id);

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
