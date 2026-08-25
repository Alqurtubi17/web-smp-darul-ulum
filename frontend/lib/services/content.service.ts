import apiClient from '../api';

export const contentService = {
  // ── BERITA (NEWS) ──────────────────────────────────────────────────────────
  async getNews() {
    const { data } = await apiClient.get('/news');
    return data;
  },
  async createNews(payload: any) {
    const { data } = await apiClient.post('/news', payload);
    return data;
  },
  async updateNews(id: string, payload: any) {
    const { data } = await apiClient.put(`/news/${id}`, payload);
    return data;
  },
  async deleteNews(id: string) {
    const { data } = await apiClient.delete(`/news/${id}`);
    return data;
  },

  // ── PENGUMUMAN (ANNOUNCEMENTS) ──────────────────────────────────────────────
  async getAnnouncements() {
    const { data } = await apiClient.get('/announcements');
    return data;
  },
  async createAnnouncement(payload: any) {
    const { data } = await apiClient.post('/announcements', payload);
    return data;
  },
  async updateAnnouncement(id: string, payload: any) {
    const { data } = await apiClient.put(`/announcements/${id}`, payload);
    return data;
  },
  async deleteAnnouncement(id: string) {
    const { data } = await apiClient.delete(`/announcements/${id}`);
    return data;
  },

  // ── AGENDA (EVENTS) ─────────────────────────────────────────────────────────
  async getEvents() {
    const { data } = await apiClient.get('/events');
    return data;
  },
  async createEvent(payload: any) {
    const { data } = await apiClient.post('/events', payload);
    return data;
  },
  async updateEvent(id: string, payload: any) {
    const { data } = await apiClient.put(`/events/${id}`, payload);
    return data;
  },
  async deleteEvent(id: string) {
    const { data } = await apiClient.delete(`/events/${id}`);
    return data;
  },

  // ── GALERI (GALLERY) ────────────────────────────────────────────────────────
  async getAlbums() {
    const { data } = await apiClient.get('/gallery');
    return data;
  },
  async createAlbum(payload: any) {
    const { data } = await apiClient.post('/gallery', payload);
    return data;
  },
  async deleteAlbum(id: string) {
    const { data } = await apiClient.delete(`/gallery/${id}`);
    return data;
  },

  // ── UNDUHAN (DOWNLOADS) ──────────────────────────────────────────────────────
  async getDownloads() {
    const { data } = await apiClient.get('/downloads');
    return data;
  },
  async createDownload(payload: any) {
    const { data } = await apiClient.post('/downloads', payload);
    return data;
  },
  async deleteDownload(id: string, params?: any) {
    const { data } = await apiClient.delete(`/downloads/${id}`, { params });
    return data;
  },

  // ── PRESTASI (ACHIEVEMENTS) ────────────────────────────────────────────────
  async getAchievements() {
    const { data } = await apiClient.get('/achievements');
    return data;
  },
  async createAchievement(payload: any) {
    const { data } = await apiClient.post('/achievements', payload);
    return data;
  },
  async deleteAchievement(id: string, params?: any) {
    const { data } = await apiClient.delete(`/achievements/${id}`, { params });
    return data;
  },

  // ── PENGATURAN (SETTINGS) & TAHUN AJARAN ───────────────────────────────────
  async getSettings() {
    const { data } = await apiClient.get('/settings');
    return data;
  },
  async updateSettings(payload: any) {
    const { data } = await apiClient.post('/settings', payload);
    return data;
  },
  async addAcademicYear(payload: { year: string; semester: 'Ganjil' | 'Genap' }) {
    const { data } = await apiClient.post('/settings/academic-years', payload);
    return data;
  },
  async setActiveAcademicYear(id: string) {
    const { data } = await apiClient.patch(`/settings/academic-years/${id}/active`);
    return data;
  },
  async deleteAcademicYear(id: string) {
    const { data } = await apiClient.delete(`/settings/academic-years/${id}`);
    return data;
  },

  // ── KELAS & WALI KELAS ──────────────────────────────────────────────────────
  async getClasses() {
    const { data } = await apiClient.get('/classes');
    return data;
  },
  async createClass(payload: any) {
    const { data } = await apiClient.post('/classes', payload);
    return data;
  },
  async updateClass(id: string, payload: any) {
    const { data } = await apiClient.put(`/classes/${id}`, payload);
    return data;
  },
  async deleteClass(id: string) {
    const { data } = await apiClient.delete(`/classes/${id}`);
    return data;
  },

  // ── MATA PELAJARAN (SUBJECTS) ───────────────────────────────────────────────
  async getSubjects() {
    const { data } = await apiClient.get('/subjects');
    return data;
  },
  async createSubject(payload: any) {
    const { data } = await apiClient.post('/subjects', payload);
    return data;
  },
  async updateSubject(id: string, payload: any) {
    const { data } = await apiClient.put(`/subjects/${id}`, payload);
    return data;
  },
  async deleteSubject(id: string) {
    const { data } = await apiClient.delete(`/subjects/${id}`);
    return data;
  },
};




