import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Play, Terminal, ArrowRight, Activity, Lock, Cpu } from 'lucide-react';

export default function HeroSection({ onRunDemoClick, onViewAuditClick }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative pt-6 pb-12 px-4 sm:px-8 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
      {/* Background Soft Radial Glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      {/* Decorative Cyber Circuit Lines */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">

        {/* Pulsing Shield Icon Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-5"
        >
          {/* Gentle Pulsing Outer Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur-lg opacity-40 animate-pulse" />

          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#0a0e1a] border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Shield className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          </div>
        </motion.div>

        {/* Live System Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 mb-4 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>ZERO-TRUST AI RUNTIME DEFENSE</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-semibold">PRE-EXECUTION PERIMETER</span>
        </motion.div>

        {/* Title "AegisGuard" with Gradient Text Shimmer */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight"
        >
          <span className="text-gradient-shimmer">AegisGuard</span>
        </motion.h1>

        {/* Subtitle Fades in After Title */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-4 text-base sm:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed"
        >
          A safety layer that checks every action an AI agent takes before it runs:
          <span className="text-emerald-400 font-semibold"> allow</span>,
          <span className="text-amber-400 font-semibold"> ask a human</span>, or
          <span className="text-red-400 font-semibold"> block</span>.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            id="hero-btn-demo"
            onClick={() => onRunDemoClick ? onRunDemoClick() : scrollTo('demo-panel')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 border border-cyan-400/30"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Live Demo</span>
          </button>

          <button
            id="hero-btn-audit"
            onClick={() => onViewAuditClick ? onViewAuditClick() : scrollTo('audit-log')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm tracking-wide text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Activity className="w-4 h-4 text-slate-400" />
            <span>View Audit Log</span>
          </button>
        </motion.div>

        {/* Feature Highlights Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-slate-400 w-full max-w-2xl"
        >
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tool Interception</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Risk Scoring</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human In The Loop</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span>Emergency Kill Switch</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
