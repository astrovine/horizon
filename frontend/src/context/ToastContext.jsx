import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(({ title, description, variant = 'default', duration = 3000 }) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    if (duration) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const value = { push, remove, toasts };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export default ToastContext;

