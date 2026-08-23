import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastState {
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (title: string, message?: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast: ToastMessage = { id, title, message, type };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto dismiss after 3500ms
    setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Quick helper functions
export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().showToast(title, message, 'success'),
  error: (title: string, message?: string) => useToastStore.getState().showToast(title, message, 'error'),
  warning: (title: string, message?: string) => useToastStore.getState().showToast(title, message, 'warning'),
  info: (title: string, message?: string) => useToastStore.getState().showToast(title, message, 'info'),
};
