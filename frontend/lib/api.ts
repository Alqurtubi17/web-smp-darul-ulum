import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  timeout: 15000,
});


// Inject token NextAuth ke setiap request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    const token = (session?.user as any)?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Mencegah auto-logout agresif yang tiba-tiba menendang pengguna ke halaman login
apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    // Log error secara silent tanpa memaksa signOut mendadak
    if (error.response?.status === 401) {
      console.warn('[API Client] Received 401 Unauthorized for URL:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'Terjadi kesalahan';
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan';
};
