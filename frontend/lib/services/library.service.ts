import apiClient from '../api';

export interface BookApiItem {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  year?: number;
  category?: string;
  cover?: string | null;
  totalStock: number;
  availableStock: number;
  location?: string;
}

export interface BorrowingApiItem {
  id: string;
  bookId: string;
  studentId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'DIPINJAM' | 'DIKEMBALIKAN' | 'TERLAMBAT' | 'HILANG';
  fineAmount?: number;
  book?: { title: string; isbn?: string };
  student?: { fullName: string; nis: string; class?: { name: string } };
}

export const libraryService = {
  getBooks: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const res = await apiClient.get('/books', { params });
    return res.data;
  },

  createBook: async (data: Partial<BookApiItem>) => {
    const res = await apiClient.post('/books', data);
    return res.data.data;
  },

  updateBook: async (id: string, data: Partial<BookApiItem>) => {
    const res = await apiClient.put(`/books/${id}`, data);
    return res.data.data;
  },

  deleteBook: async (id: string) => {
    const res = await apiClient.delete(`/books/${id}`);
    return res.data;
  },

  getBorrowings: async (params?: { page?: number; limit?: number; studentId?: string; status?: string }) => {
    const res = await apiClient.get('/borrowings', { params });
    return res.data;
  },

  borrowBook: async (data: { bookId: string; studentId?: string; studentName?: string; nis?: string; dueDate: string }) => {
    const res = await apiClient.post('/borrowings', data);
    return res.data.data;
  },

  returnBook: async (id: string) => {
    const res = await apiClient.patch(`/borrowings/${id}/return`);
    return res.data.data;
  },
};
