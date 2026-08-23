import { create } from 'zustand';
import apiClient from '@/lib/api';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  role: 'ADMIN' | 'GURU' | 'SISWA' | 'SYSTEM';
  action: string;
  module: 'Pengguna' | 'Autentikasi' | 'Akademik' | 'Keuangan' | 'Pengaturan' | 'PPDB' | 'Perpustakaan';
  ipAddress: string;
  device: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  details?: string;
}

interface ActivityLogState {
  logs: AuditLogItem[];
  initLogs: () => Promise<void>;
  addLog: (log: Omit<AuditLogItem, 'id' | 'timestamp' | 'ipAddress' | 'device'> & { ipAddress?: string; device?: string }) => void;
  clearLogs: () => Promise<void>;
}

const INITIAL_REAL_LOGS: AuditLogItem[] = [
  {
    id: 'log-init-1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleString('id-ID'),
    user: 'Super Admin (System)',
    role: 'ADMIN',
    action: 'Inisialisasi sistem portal & Audit Trail Log',
    module: 'Pengaturan',
    ipAddress: '127.0.0.1',
    device: 'Web Client Portal',
    severity: 'INFO',
    details: 'Audit Log System diaktifkan untuk mencatat seluruh aktivitas real-time.',
  },
];

export const useActivityLogStore = create<ActivityLogState>((set, get) => ({
  logs: INITIAL_REAL_LOGS,

  initLogs: async () => {
    try {
      const res = await apiClient.get('/audit-logs');
      if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: AuditLogItem[] = res.data.data.map((l: any) => ({
          id: l.id,
          timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
          user: l.user?.email ? l.user.email.split('@')[0] : 'Admin Portal',
          role: (l.user?.role as any) || 'ADMIN',
          action: l.action || 'Aktivitas Sistem',
          module: (l.resource as any) || 'Pengaturan',
          ipAddress: l.ipAddress || '127.0.0.1',
          device: l.userAgent ? (l.userAgent.includes('Chrome') ? 'Chrome Browser' : 'Web Browser') : 'Web Client',
          severity: 'INFO',
          details: l.newData ? JSON.stringify(l.newData) : (l.oldData ? JSON.stringify(l.oldData) : undefined),
        }));
        set({ logs: mapped });
        return;
      }
    } catch {
      // Fallback
    }

  initLogs: async () => {
    try {
      const res = await apiClient.get('/audit-logs');
      if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: AuditLogItem[] = res.data.data.map((l: any) => ({
          id: l.id,
          timestamp: l.createdAt ? String(l.createdAt).split('T')[0] : '2026-08-01',
          user: (l.user?.fullName || l.user?.email || 'System') as string,
          role: (l.user?.role as any) || 'ADMIN',
          action: l.action || 'Aktivitas Sistem',
          module: (l.resource as any) || 'Pengaturan',
          ipAddress: l.ipAddress || '127.0.0.1',
          device: l.userAgent ? (l.userAgent.includes('Chrome') ? 'Chrome Browser' : 'Web Browser') : 'Web Client',
          severity: 'INFO',
          details: l.newData ? JSON.stringify(l.newData) : (l.oldData ? JSON.stringify(l.oldData) : undefined),
        }));
        set({ logs: mapped });
      }
    } catch {
      // Memory initial logs state
    }
  },

  addLog: (entry) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')}`;
    const deviceStr = typeof navigator !== 'undefined'
      ? (navigator.userAgent.includes('Chrome') ? 'Chrome Browser' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Web Browser')
      : 'Web Client';

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formattedDate,
      user: entry.user || 'Admin Portal',
      role: entry.role || 'ADMIN',
      action: entry.action,
      module: entry.module,
      ipAddress: entry.ipAddress || '192.168.1.1',
      device: entry.device || deviceStr,
      severity: entry.severity || 'INFO',
      details: entry.details || '',
    };

    const updated = [newLog, ...get().logs];
    set({ logs: updated });

    // Async call to backend audit log
    apiClient.post('/audit-logs', {
      action: entry.action,
      resource: entry.module,
      newData: { details: entry.details, user: entry.user, severity: entry.severity },
    }).catch(() => {});
  },

  clearLogs: async () => {
    set({ logs: [] });

    try {
      await apiClient.delete('/audit-logs/clear');
    } catch {
      // ignore
    }
  },
}));

