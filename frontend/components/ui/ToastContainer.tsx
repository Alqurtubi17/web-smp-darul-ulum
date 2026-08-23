'use client';

import { useToastStore, ToastMessage } from '@/store/toast.store';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const styles = {
    success: {
      border: 'border-emerald-200/90',
      bg: 'bg-emerald-50/90 text-emerald-950',
      iconBg: 'bg-emerald-600 text-white',
      icon: <CheckCircle2 className="w-5 h-5" />,
      bar: 'bg-emerald-600',
    },
    error: {
      border: 'border-rose-200/90',
      bg: 'bg-rose-50/90 text-rose-950',
      iconBg: 'bg-rose-600 text-white',
      icon: <AlertOctagon className="w-5 h-5" />,
      bar: 'bg-rose-600',
    },
    warning: {
      border: 'border-amber-200/90',
      bg: 'bg-amber-50/90 text-amber-950',
      iconBg: 'bg-amber-500 text-white',
      icon: <AlertTriangle className="w-5 h-5" />,
      bar: 'bg-amber-500',
    },
    info: {
      border: 'border-sky-200/90',
      bg: 'bg-sky-50/90 text-sky-950',
      iconBg: 'bg-sky-600 text-white',
      icon: <Info className="w-5 h-5" />,
      bar: 'bg-sky-600',
    },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden backdrop-blur-md bg-white/95 border ${style.border} rounded-2xl p-4 shadow-xl flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4`}
    >
      <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
        {style.icon}
      </div>

      <div className="flex-1 min-w-0 pr-2 pt-0.5">
        <h4 className="text-xs font-extrabold tracking-tight leading-snug text-slate-900">{toast.title}</h4>
        {toast.message && <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>

      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto dismiss progress bar indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/80">
        <div
          className={`h-full ${style.bar} animate-toast-progress`}
          style={{ animation: 'toast-shrink 3.5s linear forwards' }}
        />
      </div>
    </div>
  );
}
