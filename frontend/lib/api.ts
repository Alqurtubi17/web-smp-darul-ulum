import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Inject token NextAuth ke setiap request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  const token = (session?.user as any)?.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isSigningOut = false;

// Handle 401: Gunakan signOut dari NextAuth agar cookie disapu bersih sebelum redirect
apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !isSigningOut) {
        isSigningOut = true;
        signOut({ callbackUrl: '/auth/login' });
      }
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
