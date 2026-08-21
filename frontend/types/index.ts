// ─── API RESPONSE ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'GURU' | 'SISWA' | 'ORANG_TUA' | 'PENGUNJUNG';

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  student?: StudentProfile;
  teacher?: TeacherProfile;
  parent?: ParentProfile;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// ─── PROFILES ────────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  fullName: string;
  nis: string;
  nisn?: string;
  photo?: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  class?: { id: string; name: string; grade: number };
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  nip?: string;
  photo?: string;
  subject?: string;
}

export interface ParentProfile {
  id: string;
  fullName: string;
  students?: { id: string; fullName: string; nis: string }[];
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────

export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  category?: string;
  tags: string[];
  viewCount: number;
  publishedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
  isPinned: boolean;
  publishedAt: string;
  expiresAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  thumbnail?: string;
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
  category?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  category: string;
  level?: string;
  year: number;
  photo?: string;
}

// ─── ACADEMIC ────────────────────────────────────────────────────────────────

export interface Grade {
  id: string;
  subjectId: string;
  type: 'TUGAS' | 'ULANGAN_HARIAN' | 'UTS' | 'UAS' | 'PRAKTIK';
  score: number;
  maxScore: number;
  title?: string;
  academicYear: string;
  semester: number;
  gradedAt: string;
  subject?: { id: string; name: string; code: string };
}

export interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  subject?: { id: string; name: string; code: string };
  teacher?: { id: string; fullName: string };
}

// ─── PPDB ────────────────────────────────────────────────────────────────────

export type AdmissionStatus = 'PENDING' | 'VERIFIKASI' | 'LULUS' | 'DITOLAK' | 'DAFTAR_ULANG';

export interface Admission {
  id: string;
  registrationNumber: string;
  academicYear: string;
  fullName: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  status: AdmissionStatus;
  score?: number;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}
