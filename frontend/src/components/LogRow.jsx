import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Terminal, Clock, HelpCircle } from 'lucide-react';
import DecisionBadge from './DecisionBadge';
import RiskGauge from './RiskGauge';

export default function LogRow({ log, isExpanded, onToggleExpand }) {
  const [showScoreTooltip, setShowScoreTooltip] = useState(false);
  const [showEscalateTooltip, setShowEscalateTooltip] = useState(false);

  const dec = (log.decision || '').toLowerCase();

  // Border and glow styles
  let rowBorder = 'hover:bg-slate-800/40 border-l-2 border-l-slate-700/40';
  let dotIndicator = <span className="w-2 h-2 rounded-full bg-slate-500" />;

  if (dec === 'allow') {
    rowBorder = 'hover:bg-emerald-950/20 border-l-2 border-l-emerald-500/70';
    dotIndicator = <span className="w-2 h-2 rounded-full bg-emerald-400" title="Allowed Action" />;
  } else if (dec === 'escalate') {
    rowBorder = 'hover:bg-amber-950/25 border-l-2 border-l-amber-500 shadow-[inset_4px_0_12px_rgba(245,158,11,0.15)]';
    dotIndicator = <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Awaiting Supervisor Authorization" />;
  } else if (dec === 'block') {
    rowBorder = 'hover:bg-red-950/30 border-l-2 border-l-red-500 shadow-[inset_4px_0_15px_rgba(239,68,68,0.2)] animate-pulse';
    dotIndicator = <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Hard Blocked Threat" />;
  }

  const timeFormatted = log.timestamp
    ? new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <>
      <motion.tr
        layout
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={onToggleExpand}
        className={`transition-colors cursor-pointer select-none border-b border-slate-800/60 ${rowBorder} ${
          isExpanded ? 'bg-slate-800/50' : 'bg-transparent'
        }`}
      >
        {/* Status Dot + Time */}
        <td className="py-3 px-3.5 font-mono text-slate-400 whitespace-nowrap text-xs">
          <div className="flex items-center gap-2">
            {dotIndicator}
            <span>{timeFormatted}</span>
          </div>
        </td>

        {/* Agent ID */}
        <td className="py-3 px-3.5 font-mono text-cyan-300 font-medium text-xs">
          {log.agent_id}
        </td>

        {/* Tool */}
        <td className="py-3 px-3.5">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700/80">
            {log.tool}
          </span>
        </td>

        {/* Target / Amount */}
        <td className="py-3 px-3.5 text-xs text-slate-300 max-w-[200px] truncate">
          <span className="font-mono text-slate-200">{log.target || '—'}</span>
          {log.amount !== null && log.amount !== undefined && (
            <span className="ml-2 font-mono font-semibold text-emerald-400">
              (${Number(log.amount).toLocaleString()})
            </span>
          )}
        </td>

        {/* Risk Score Mini Bar with Tooltip */}
        <td className="py-3 px-3.5 relative">
          <div
            className="inline-block"
            onMouseEnter={() => setShowScoreTooltip(true)}
            onMouseLeave={() => setShowScoreTooltip(false)}
          >
            <RiskGauge score={log.score} variant="bar" />

            {/* Risk Score Tooltip */}
            {showScoreTooltip && (
              <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-200 shadow-xl whitespace-nowrap font-sans">
                <strong>Risk Score:</strong> Evaluated based on target domain whitelist, payload patterns, and transaction limits.
              </div>
            )}
          </div>
        </td>

        {/* Decision Pill with Tooltip for Escalate */}
        <td className="py-3 px-3.5 whitespace-nowrap relative">
          <div
            className="inline-block"
            onMouseEnter={() => dec === 'escalate' && setShowEscalateTooltip(true)}
            onMouseLeave={() => dec === 'escalate' && setShowEscalateTooltip(false)}
          >
            <DecisionBadge decision={log.decision} size="sm" />

            {/* Escalate Tooltip */}
            {showEscalateTooltip && (
              <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-amber-200 shadow-xl whitespace-nowrap font-sans">
                <strong>Escalate:</strong> Paused and awaiting supervisor manual authorization in Pending Approvals.
              </div>
            )}
          </div>
        </td>

        {/* Expand Icon */}
        <td className="py-3 px-3.5 text-right text-slate-400">
          <button
            type="button"
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </motion.tr>

      {/* Expandable Drawer */}
      {isExpanded && (
        <tr className="bg-slate-950/80 border-b border-slate-800/80">
          <td colSpan="7" className="p-4">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Policy evaluation explanation */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Guardrail Evaluation Rationale
                  </div>
                  <p className="text-slate-200 font-medium leading-relaxed font-sans">
                    {log.reason || 'No specific rationale supplied.'}
                  </p>
                </div>

                {/* Simulated Tool Execution */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Tool Output</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">STATUS: {log.status}</span>
                  </div>
                  <div className="font-mono text-xs text-emerald-300 bg-slate-950 p-2 rounded-lg border border-slate-800 break-all">
                    {log.tool_result || '(No tool execution output recorded)'}
                  </div>
                </div>
              </div>

              {/* Payload content if available */}
              {log.content && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Intercepted Content Payload</span>
                  </div>
                  <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 whitespace-pre-wrap break-all">
                    {log.content}
                  </pre>
                </div>
              )}
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}
