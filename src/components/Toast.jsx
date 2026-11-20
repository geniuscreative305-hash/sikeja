import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none no-print">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClasses = 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200';

        if (toast.type === 'error') {
          Icon = XCircle;
          colorClasses = 'border-red-500/40 bg-red-950/80 text-red-200';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClasses = 'border-amber-500/40 bg-amber-950/80 text-amber-200';
        } else if (toast.type === 'info') {
          Icon = Info;
          colorClasses = 'border-sky-500/40 bg-sky-950/80 text-sky-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-fade-in ${colorClasses}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

