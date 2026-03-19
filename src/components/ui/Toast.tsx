'use client';

import React, { useState, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, icon?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info', icon?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl border animate-in slide-in-from-right-full fade-in duration-300 shadow-2xl backdrop-blur-md ${
              t.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-100' :
              t.type === 'error' ? 'bg-red-950/80 border-red-500/50 text-red-100' :
              'bg-slate-900/80 border-slate-700/50 text-slate-100'
            }`}
          >
            {t.icon && <span className="text-xl">{t.icon}</span>}
            <span className="text-[11px] font-black uppercase tracking-wider">{t.message}</span>
            <button 
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="ml-4 opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
