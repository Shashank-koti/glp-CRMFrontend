import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm bg-white ${
                item.type === 'success'
                  ? 'border-emerald-300 text-slate-800'
                  : item.type === 'error'
                  ? 'border-rose-300 text-slate-800'
                  : item.type === 'warning'
                  ? 'border-orange-300 text-slate-800'
                  : 'border-slate-200 text-slate-800'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                {item.type === 'info' && <Info className="w-5 h-5 text-sky-600" />}
              </div>
              <div className="flex-1 font-medium leading-snug">{item.message}</div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 -mr-1 -mt-1 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
