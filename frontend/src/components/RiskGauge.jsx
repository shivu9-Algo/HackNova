import React from 'react';
import { motion } from 'framer-motion';

export default function RiskGauge({ score = 0, variant = 'bar', showLabel = true }) {
  const normalized = Math.min(Math.max(Number(score) || 0, 0), 100);

  let color = '#10b981'; // emerald
  let textClass = 'text-emerald-400';
  let bgGlow = 'rgba(16, 185, 129, 0.2)';
  let label = 'Low Risk';

  if (normalized >= 71) {
    color = '#ef4444'; // red
    textClass = 'text-red-400 font-bold';
    bgGlow = 'rgba(239, 68, 68, 0.35)';
    label = 'Critical Risk';
  } else if (normalized >= 30) {
    color = '#f59e0b'; // amber
    textClass = 'text-amber-400 font-semibold';
    bgGlow = 'rgba(245, 158, 11, 0.25)';
    label = 'Medium Risk';
  }

  if (variant === 'semicircle') {
    // Semicircle gauge (radius 36, circumference ~ 113.1)
    const radius = 38;
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference - (normalized / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center p-2 relative">
        <svg width="100" height="58" className="overflow-visible">
          {/* Background Arc */}
          <path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Animated Value Arc */}
          <motion.path
            d="M 12 50 A 38 38 0 0 1 88 50"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${bgGlow})` }}
          />
        </svg>

        <div className="absolute bottom-1 flex flex-col items-center">
          <span className={`font-mono text-lg font-bold leading-none ${textClass}`}>
            {normalized}
          </span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
            / 100
          </span>
        </div>
      </div>
    );
  }

  // Default Mini Bar for Tables and Compact Cards
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50 p-[1px]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${bgGlow}` }}
          initial={{ width: 0 }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className={`font-mono text-xs ${textClass} px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0`}>
        {normalized}/100
      </span>
    </div>
  );
}
