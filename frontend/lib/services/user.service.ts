import apiClient from '../api';

export const userService = {
  // ── SISWA ──────────────────────────────────────────────────────────────────
  async getStudents(params?: { search?: string; classId?: string }) {
    const { data } = await apiClient.get('/students', { params });
    return data;
  },
  async createStudent(payload: any) {
    const { data } = await apiClient.post('/students', payload);
    return data;
  },

  // ── GURU & TENDIK ──────────────────────────────────────────────────────────
  async getTeachers(params?: { search?: string }) {
    const { data } = await apiClient.get('/teachers', { params });
    return data;
  },
  async createTeacher(payload: any) {
    const { data } = await apiClient.post('/teachers', payload);
    return data;
  },
};
