import { create } from 'zustand';
import { User, AuthTokens } from '@/types';
import apiClient from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,

  initAuth: () => {
    // Memory state only - Zero localStorage
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data as { user: User } & AuthTokens;

      set({ user, accessToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));

// Role-based helpers
export const useIsAdmin = () => {
  const user = useAuthStore((s) => s.user);
  return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
};

export const useIsGuru = () => {
  const user = useAuthStore((s) => s.user);
  return ['SUPER_ADMIN', 'ADMIN', 'GURU'].includes(user?.role || '');
};
