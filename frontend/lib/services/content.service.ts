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
};
