import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../store/store';

export function ToastContainer() {
  const toasts = useStore((state) => state.toasts);
  const removeToast = useStore((state) => state.removeToast);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`${colors[type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slideInRight`}>
      {icons[type]}
      <span className="flex-1 font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-80 transition-opacity" aria-label="閉じる">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
