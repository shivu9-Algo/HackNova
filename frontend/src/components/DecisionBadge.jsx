import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function DecisionBadge({ decision, size = 'md', className = '' }) {
  const norm = (decision || '').toLowerCase();

  if (norm === 'allow') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>ALLOW</span>
      </span>
    );
  }

  if (norm === 'escalate') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)] ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>ESCALATE</span>
      </span>
    );
  }

  if (norm === 'block') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase rounded-full border bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)] ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>BLOCK</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase rounded-full border bg-slate-800 text-slate-300 border-slate-700 ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <span>{decision || 'PENDING'}</span>
    </span>
  );
}
