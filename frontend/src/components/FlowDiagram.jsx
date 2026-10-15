import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Shield, Scale, LayoutDashboard, ArrowRight, Zap, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function FlowDiagram({ latestAction = null }) {
  const [activeDecision, setActiveDecision] = useState(null);

  // When a new action arrives, flash the dynamic color through the flow
  useEffect(() => {
    if (latestAction && latestAction.decision) {
      setActiveDecision(latestAction.decision);
      const timer = setTimeout(() => {
        // Keep active or fade to subtle
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [latestAction?.id, latestAction?.decision]);

  // Determine semantic color and glow based on latest action
  let dotColor = '#38bdf8'; // cyan default
  let glowColor = 'rgba(56, 189, 248, 0.4)';
  let decisionBadge = { text: 'Tri-State Logic', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30' };

  if (activeDecision === 'allow') {
    dotColor = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.6)';
    decisionBadge = { text: 'ALLOW (Execute)', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' };
  } else if (activeDecision === 'escalate') {
    dotColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.6)';
    decisionBadge = { text: 'ESCALATE (Review)', color: 'text-amber-400 bg-amber-950/70 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]' };
  } else if (activeDecision === 'block') {
    dotColor = '#ef4444'; // red
    glowColor = 'rgba(239, 68, 68, 0.7)';
    decisionBadge = { text: 'BLOCK (Halted)', color: 'text-red-400 bg-red-950/70 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]' };
  }

  const nodes = [
    {
      id: 'agent',
      step: '01',
      title: 'Agent',
      role: 'Autonomous LLM',
      desc: 'Proposes tool actions (send_email, transfer_money, delete_record)',
      icon: Bot,
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      iconColor: 'text-cyan-400 bg-cyan-500/10',
    },
    {
      id: 'guard',
      step: '02',
      title: 'Guard',
      role: 'Safety Gateway',
      desc: 'Intercepts calls pre-execution, evaluates rules & risk algorithms (0-100)',
      icon: Shield,
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      id: 'decision',
      step: '03',
      title: 'Decision',
      role: 'Policy Engine',
      desc: 'Triages action into Allow (≤29), Escalate (30-70), or Block (≥71)',
      icon: Scale,
      borderColor: activeDecision === 'block' 
        ? 'border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        : activeDecision === 'escalate'
        ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
        : activeDecision === 'allow'
        ? 'border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        : 'border-amber-500/40 hover:border-amber-400',
      iconColor: activeDecision === 'block'
        ? 'text-red-400 bg-red-500/20'
        : activeDecision === 'escalate'
        ? 'text-amber-400 bg-amber-500/20'
        : activeDecision === 'allow'
        ? 'text-emerald-400 bg-emerald-500/20'
        : 'text-amber-400 bg-amber-500/10',
    },
    {
      id: 'dashboard',
      step: '04',
      title: 'Dashboard',
      role: 'SOC Control Room',
      desc: 'Human approval queue, audit telemetry logging & perimeter kill switch',
      icon: LayoutDashboard,
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
    },
  ];

  return (
    <div className="glass-card p-6 shadow-xl relative overflow-hidden border border-slate-800/80">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              How It Works: Zero-Trust Interception Pipeline
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every autonomous agent action is intercepted, policy-verified, and triaged before reaching enterprise backends.
          </p>
        </div>

        {/* Real-time Action State Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Live Verdict:</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all duration-300 ${decisionBadge.color}`}>
            {decisionBadge.text}
          </span>
        </div>
      </div>

      {/* 4 Connected Nodes with Animated Traveling Action Dots */}
      <div className="mt-8 relative">
        
        {/* Desktop Connecting Line & Traveling Dots */}
        <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-slate-800 -z-0">
          {/* Animated Traveling Action Dot */}
          <motion.div
            className="w-3.5 h-3.5 rounded-full absolute -top-[5px] -left-1 shadow-lg"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 12px 3px ${glowColor}`,
            }}
            animate={{
              left: ['0%', '100%'],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Secondary trailing particle for depth */}
          <motion.div
            className="w-2 h-2 rounded-full absolute -top-[3px] -left-1 opacity-70"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
            animate={{
              left: ['0%', '100%'],
            }}
            transition={{
              duration: 3.2,
              delay: 0.25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* 4 Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {nodes.map((node, index) => {
            const Icon = node.icon;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`p-4 rounded-2xl bg-[#0d1424]/90 border backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${node.borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      NODE {node.step}
                    </span>
                    <span className={`p-2 rounded-xl border border-white/5 ${node.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {node.title}
                  </h3>
                  <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-2">
                    {node.role}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {node.desc}
                  </p>
                </div>

                {/* Node Bottom Telemetry Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>STATUS</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Real-time Interception Indicator */}
      {latestAction && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Last Action Intercepted:</span>
            <span className="text-cyan-300 font-bold">{latestAction.tool}</span>
            {latestAction.target && (
              <>
                <span className="text-slate-500">→</span>
                <span className="text-slate-200">{latestAction.target}</span>
              </>
            )}
            {latestAction.amount !== null && latestAction.amount !== undefined && (
              <span className="text-emerald-400 font-bold">(${Number(latestAction.amount).toLocaleString()})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Score:</span>
            <span className="text-slate-200 font-bold">{latestAction.score ?? latestAction.risk_score ?? 0}/100</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Evaluated in:</span>
            <span className="text-cyan-400 font-bold">~1.2ms</span>
          </div>
        </motion.div>
      )}

    </div>
  );
}
