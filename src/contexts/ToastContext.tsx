import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  actionTo?: string;
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    action?: { label: string; to: string },
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      action?: { label: string; to: string },
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          actionLabel: action?.label,
          actionTo: action?.to,
        },
      ]);
      window.setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-4 end-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`asatek-toast-in pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg bg-white/95 backdrop-blur-md text-sm ${
              toast.type === 'error'
                ? 'border-[var(--brand-red)] text-[var(--ink)]'
                : toast.type === 'success'
                  ? 'border-[var(--accent-green)] text-[var(--ink)]'
                  : 'border-[var(--line)] text-[var(--ink)]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-[var(--brand-red)] shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[var(--accent-green)] shrink-0" />
            )}
            <span className="flex-1 font-medium">{toast.message}</span>
            {toast.actionLabel && toast.actionTo && (
              <Link
                to={toast.actionTo}
                onClick={() => dismiss(toast.id)}
                className="text-xs font-semibold text-[var(--brand-red)] hover:underline whitespace-nowrap shrink-0"
              >
                {toast.actionLabel}
              </Link>
            )}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Close notification"
              className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] rounded shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}
