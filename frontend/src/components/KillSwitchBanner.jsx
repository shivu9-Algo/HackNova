import React from 'react';
import { AlertOctagon, Power, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KillSwitchBanner({ killSwitch, onDeactivate }) {
  return (
    <AnimatePresence>
      {killSwitch && (
        <motion.div
          initial={{ opacity: 0, y: -25, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -25, height: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="sticky top-[73px] z-30 bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-500/80 px-4 sm:px-8 py-3.5 shadow-[0_10px_35px_rgba(239,68,68,0.4)] relative overflow-hidden backdrop-blur-md"
        >
          {/* Subtle animated hazard stripes background */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:24px_24px] pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <span className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/50 animate-bounce shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase flex items-center justify-center sm:justify-start gap-2">
                  <span>KILL SWITCH ACTIVE: all agent actions blocked</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-200 border border-red-400">
                    PERIMETER DROP
                  </span>
                </h2>
                <p className="text-xs text-red-200/90 mt-0.5">
                  Emergency override engaged. Every action proposed by autonomous AI agents is hard-blocked immediately before execution.
                </p>
              </div>
            </div>

            <button
              onClick={onDeactivate}
              className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white hover:bg-red-50 text-red-950 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0 border border-white/50"
            >
              <Power className="w-3.5 h-3.5 text-red-700" />
              <span>Resume Operations</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
