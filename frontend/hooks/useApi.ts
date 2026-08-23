import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { getErrorMessage } from '@/lib/api';
import { ApiResponse, News, Announcement, Event, Admission } from '@/types';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const { data } = await apiClient.get<ApiResponse<T>>(url, { params });
  return data.data as T;
};

// ─── NEWS ─────────────────────────────────────────────────────────────────────

export const useNewsList = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['news', params],
    queryFn: () => get<News[]>('/news', params),
  });

export const useNewsDetail = (slug: string) =>
  useQuery({
    queryKey: ['news', slug],
    queryFn: () => get<News>(`/news/${slug}`),
    enabled: !!slug,
  });

export const useNewsCategories = () =>
  useQuery({
    queryKey: ['news-categories'],
    queryFn: () => get<{ category: string; _count: { category: number } }[]>('/news/categories'),
  });

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

export const useAnnouncements = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['announcements', params],
    queryFn: () => get<Announcement[]>('/announcements', params),
  });

// ─── EVENTS ──────────────────────────────────────────────────────────────────

export const useEvents = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['events', params],
    queryFn: () => get<Event[]>('/events', params),
  });

export const useUpcomingEvents = () =>
  useQuery({
    queryKey: ['events-upcoming'],
    queryFn: () => get<Event[]>('/events/upcoming'),
  });

// ─── ADMISSIONS ──────────────────────────────────────────────────────────────

export const useAdmissionStatus = (regNumber: string) =>
  useQuery({
    queryKey: ['admission-status', regNumber],
    queryFn: () => get<Admission>(`/admissions/status/${regNumber}`),
    enabled: !!regNumber,
  });

export const useSubmitAdmission = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.post<ApiResponse<{ registrationNumber: string; id: string }>>('/admissions/submit', data);
      return res.data.data!;
    },
  });
};

// ─── ADMIN: NEWS ─────────────────────────────────────────────────────────────

export const useCreateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.post('/news', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};

export const useUpdateNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await apiClient.put(`/news/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};

export const useDeleteNews = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/news/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['news'] }),
  });
};

// ─── ADMIN: ANNOUNCEMENTS ─────────────────────────────────────────────────────

export const useCreateAnnouncement = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.post('/announcements', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
};

// ─── ADMIN: DASHBOARD STATS ──────────────────────────────────────────────────

export interface VisitorStatItem {
  dayLabel: string;
  count: number;
  barPercent: number;
}

export interface VisitorStatsData {
  totalViews: number;
  activeUsersToday: number;
  growthPercentage: number;
  dailySeries: VisitorStatItem[];
}

export interface DashboardStatsResponse {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  pendingAdmissions: number;
  publishedNews: number;
  activeAnnouncements: number;
  payments?: { collected: number; target: number };
  visitorStats?: VisitorStatsData;
}

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => get<DashboardStatsResponse>('/dashboard/stats'),
  });

// ─── ACADEMIC ────────────────────────────────────────────────────────────────

export const useStudentGrades = (studentId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['grades', studentId, params],
    queryFn: () => get<{ grades: unknown[]; summary: unknown[] }>(`/grades/student/${studentId}`, params),
    enabled: !!studentId,
  });

export const useStudentAttendance = (studentId: string, params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['attendance', studentId, params],
    queryFn: () => get<{ attendances: unknown[]; rekap: unknown }>(`/attendance/student/${studentId}`, params),
    enabled: !!studentId,
  });
