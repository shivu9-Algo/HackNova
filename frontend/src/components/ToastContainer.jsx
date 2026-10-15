import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer({ toasts = [], onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let borderClass = 'border-slate-700 bg-slate-900';
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;

          if (toast.type === 'blocked' || toast.type === 'error') {
            borderClass = 'border-red-500/60 bg-red-950/90 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
            icon = <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />;
          } else if (toast.type === 'escalated') {
            borderClass = 'border-amber-500/60 bg-amber-950/90 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          } else if (toast.type === 'success') {
            borderClass = 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`p-3.5 rounded-xl border shadow-xl backdrop-blur-md pointer-events-auto flex items-start gap-3 ${borderClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-0.5">
                  {toast.title}
                </div>
                <div className="text-xs opacity-90 font-mono leading-tight">
                  {toast.message}
                </div>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
