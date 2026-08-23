import apiClient from '../api';

export const ppdbService = {
  async getAdmissions(params?: { search?: string; status?: string; academicYear?: string }) {
    const { data } = await apiClient.get('/admissions', { params });
    return data;
  },

  async updateAdmissionStatus(id: string, payload: { status: string; score?: number; notes?: string; rejectionReason?: string }) {
    const { data } = await apiClient.patch(`/admissions/${id}/status`, payload);
    return data;
  },

  async clearAllAdmissions() {
    const { data } = await apiClient.delete('/admissions/clear-all');
    return data;
  },
};
