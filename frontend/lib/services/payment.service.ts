import apiClient from '../api';

export interface PaymentBillApiItem {
  id: string;
  studentId: string;
  student?: { fullName: string; nis: string; class?: { name: string } };
  type: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
  status: 'PAID' | 'PENDING';
  method?: string;
  month?: number;
  year?: number;
  academicYear?: string;
}

export const paymentService = {
  getPaymentStats: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/payments/stats', { params });
    return res.data.data;
  },

  getStudentPayments: async (studentId: string, params?: Record<string, any>) => {
    const res = await apiClient.get(`/payments/student/${studentId}`, { params });
    return res.data.data;
  },

  createSingleBill: async (data: {
    studentId?: string;
    studentName?: string;
    nis?: string;
    classId?: string;
    type?: string;
    month?: number | string;
    year?: number;
    amount: number;
    academicYear?: string;
    dueDate?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/payments', data);
    return res.data.data;
  },

  createBulkSPP: async (data: {
    classId?: string;
    month: number;
    year: number;
    amount: number;
    academicYear?: string;
    dueDate?: string;
  }) => {
    const res = await apiClient.post('/payments/bulk-spp', data);
    return res.data.data;
  },

  recordPayment: async (id: string, data: { method: 'TUNAI' | 'QRIS' | 'TRANSFER'; transactionId?: string }) => {
    const res = await apiClient.patch(`/payments/${id}/pay`, data);
    return res.data.data;
  },

  deletePayment: async (id: string) => {
    const res = await apiClient.delete(`/payments/${id}`);
    return res.data;
  },

  clearAllPayments: async () => {
    const res = await apiClient.delete('/payments/clear-all');
    return res.data;
  },
};
