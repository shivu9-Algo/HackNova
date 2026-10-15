import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Check, X, Sparkles } from 'lucide-react';

export default function BeforeAfterToggle() {
  const [isGuardOn, setIsGuardOn] = useState(true);

  return (
    <div className="glass-card p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
      
      {/* Header and Toggle Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              Impact Comparison: Without vs With AgentGuard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toggle the safety layer to witness how raw LLM agent tool execution compares to active zero-trust interception.
          </p>
        </div>

        {/* The Toggle Switch */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <span className={`text-xs font-mono font-bold transition-colors ${!isGuardOn ? 'text-red-400' : 'text-slate-500'}`}>
            Guard OFF
          </span>

          <button
            id="toggle-guard-comparison"
            onClick={() => setIsGuardOn(!isGuardOn)}
            className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 relative focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
              isGuardOn ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center ${
                isGuardOn ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {isGuardOn ? (
                <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
              ) : (
                <X className="w-3 h-3 text-red-700 stroke-[3]" />
              )}
            </motion.div>
          </button>

          <span className={`text-xs font-mono font-bold transition-colors ${isGuardOn ? 'text-emerald-400' : 'text-slate-500'}`}>
            Guard ON
          </span>
        </div>
      </div>

      {/* Dynamic Animated Banner Transition */}
      <div className="mt-5 min-h-[90px] flex items-center">
        <AnimatePresence mode="wait">
          {!isGuardOn ? (
            <motion.div
              key="guard-off"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full p-4 rounded-xl bg-red-950/60 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-red-600/30 text-red-400 border border-red-500/50 animate-bounce">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/30 text-red-200 uppercase border border-red-500/40">
                      CRITICAL DATA LEAK
                    </span>
                    <span className="text-xs font-mono text-red-300">Tool Executed Directly</span>
                  </div>
                  <p className="text-sm font-semibold text-red-100 mt-1">
                    Customer data sent to <span className="font-mono text-red-300 underline">attacker@evil.com</span>
                  </p>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    Untrusted input bypassed agent reasoning: exfiltrated 1,420 customer PII records.
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-700/50 text-xs font-mono text-red-300 font-bold shrink-0">
                STATUS: BREACH COMPLETED
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="guard-on"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/50">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-200 uppercase border border-emerald-500/40">
                      ATTACK BLOCKED
                    </span>
                    <span className="text-xs font-mono text-emerald-300">Perimeter Interception</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-100 mt-1">
                    Prompt injection detected and dropped before execution
                  </p>
                  <p className="text-xs text-emerald-300/80 mt-0.5">
                    Target <span className="font-mono text-emerald-200">attacker@evil.com</span> blacklisted. Enterprise databases remain 100% secure.
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-emerald-900/40 border border-emerald-700/50 text-xs font-mono text-emerald-300 font-bold shrink-0">
                STATUS: DEFENSE ACTIVE
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
