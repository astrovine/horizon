import React from 'react';
import { useToast } from '../context/ToastContext';

const variantStyles = {
  default: 'bg-card/80 text-foreground border border-border',
  success: 'bg-green-500/15 text-green-400 border border-green-600/40',
  error: 'bg-red-500/15 text-red-400 border border-red-600/40',
};

const ToastContainer = () => {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`backdrop-blur-md rounded-md px-4 py-3 shadow-lg ${variantStyles[t.variant] || variantStyles.default}`}>
          {t.title && <div className="font-semibold text-sm">{t.title}</div>}
          {t.description && <div className="text-sm opacity-80">{t.description}</div>}
          <button onClick={() => remove(t.id)} className="text-xs opacity-70 hover:opacity-100 mt-1">Dismiss</button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
