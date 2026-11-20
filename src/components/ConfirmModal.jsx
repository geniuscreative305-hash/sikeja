import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-md p-6 glass-panel rounded-2xl border border-white/10 shadow-2xl bg-[#0f2d35]/95 text-white">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-lg ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

