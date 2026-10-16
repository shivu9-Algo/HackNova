import React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Power,
  Sliders,
  RotateCcw,
  Activity,
  Radio
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({
  killSwitch,
  onToggleKillSwitch,
  onOpenRules,
  onOpenSandbox,
  onResetLogs,
  loadingKillSwitch,
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0a0e1a]/95 backdrop-blur-xl px-4 sm:px-8 py-3.5 transition-colors duration-500 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-2xl border transition-all duration-500 ${killSwitch
              ? 'bg-red-500/15 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
            }`}>
            {killSwitch ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : (
              <Shield className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                AegisGuard
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  v1.0 SOC
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide font-medium">
              Autonomous AI Agent Safety & Tool Interception Gateway
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Status Dot and Mode Pill */}
          <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold transition-all duration-300 ${killSwitch
              ? 'bg-red-950/70 border-red-500/60 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
              : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            }`}>
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${killSwitch ? 'bg-red-400' : 'bg-emerald-400'
                }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${killSwitch ? 'bg-red-500' : 'bg-emerald-500'
                }`} />
            </span>
            <span>{killSwitch ? 'KILL SWITCH ENGAGED' : 'GATEWAY ARMED & ACTIVE'}</span>
          </div>

          {/* Quick Action Buttons */}
          <button
            id="btn-open-sandbox"
            onClick={onOpenSandbox}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm hover:border-slate-500"
            title="Inject custom action payload"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sandbox</span>
          </button>

          <button
            id="btn-open-rules"
            onClick={onOpenRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm hover:border-slate-500"
            title="Inspect rules.json policy"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Rules</span>
          </button>

          <button
            id="btn-reset-logs"
            onClick={onResetLogs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-all shadow-sm"
            title="Clear all logs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Large, Prominent Kill Switch Toggle */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <button
              id="btn-kill-switch"
              onClick={onToggleKillSwitch}
              disabled={loadingKillSwitch}
              className={`group relative flex items-center gap-2.5 px-4 py-2 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-md ${killSwitch
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] border border-red-400 animate-pulse'
                  : 'bg-slate-950 hover:bg-red-950/80 text-red-400 hover:text-red-200 border border-red-900/60 hover:border-red-600 shadow-sm'
                }`}
            >
              <Power className={`w-4 h-4 transition-transform group-hover:scale-110 ${killSwitch ? 'animate-spin' : ''}`} />
              <span>{killSwitch ? 'DISARM KILL SWITCH' : 'KILL SWITCH'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
