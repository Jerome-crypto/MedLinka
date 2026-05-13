import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  exiting?: boolean;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  return (
    <div
      className={`toast toast--${toast.type}${toast.exiting ? ' exiting' : ''}`}
      style={{ '--toast-duration': `${(toast.duration ?? 4000)}ms` } as React.CSSProperties}
      role="alert"
    >
      <span className="toast__icon">{ICONS[toast.type]}</span>
      <div className="toast__body">
        <div className="toast__title">{toast.title}</div>
        {toast.message && <div className="toast__message">{toast.message}</div>}
      </div>
      <button className="toast__close" onClick={() => onClose(toast.id)} aria-label="Close">✕</button>
      <div className="toast__progress" />
    </div>
  );
}

export function ToastManager({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 280);
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }]);
    const timer = setTimeout(() => removeToast(id), duration);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    const map = timersRef.current;
    return () => { map.forEach(t => clearTimeout(t)); map.clear(); };
  }, []);

  const ctx: ToastContextValue = {
    success: (t, m) => addToast('success', t, m),
    error:   (t, m) => addToast('error',   t, m),
    info:    (t, m) => addToast('info',    t, m),
    warning: (t, m) => addToast('warning', t, m),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {createPortal(
        <div className="toast-container" aria-live="polite">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastManager>');
  return ctx;
}
