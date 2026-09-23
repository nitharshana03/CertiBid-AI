// CertiBid AI - Toast Notification Context
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-[#0B3442] border-[#1B5968] text-white';
          let icon = <Info className="w-5 h-5 text-[#14D9D5] shrink-0" />;

          if (toast.type === 'success') {
            bgClass = 'bg-[#064e3b] border-[#10b981]/50 text-white';
            icon = <CheckCircle2 className="w-5 h-5 text-[#20C997] shrink-0" />;
          } else if (toast.type === 'error') {
            bgClass = 'bg-[#4c0519] border-[#f43f5e]/50 text-white';
            icon = <XCircle className="w-5 h-5 text-[#FF6B7A] shrink-0" />;
          } else if (toast.type === 'warning') {
            bgClass = 'bg-[#451a03] border-[#f59e0b]/50 text-white';
            icon = <AlertCircle className="w-5 h-5 text-[#F4C95D] shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl border shadow-xl flex items-start gap-3 pointer-events-auto transition-all transform translate-y-0 ${bgClass}`}
            >
              {icon}
              <div className="flex-1 text-xs font-semibold leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
