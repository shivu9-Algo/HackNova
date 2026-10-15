import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Search, 
  Inbox, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import LogRow from './LogRow';

export default function ActivityFeed({ logs = [] }) {
  const [filter, setFilter] = useState('all'); // all | allow | escalate | block
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'all' || log.decision === filter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      (log.agent_id && log.agent_id.toLowerCase().includes(term)) ||
      (log.tool && log.tool.toLowerCase().includes(term)) ||
      (log.target && log.target.toLowerCase().includes(term)) ||
      (log.reason && log.reason.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  return (
    <section id="audit-log" className="glass-card p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
      
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              Live Audit Log & Interception Stream
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time policy evaluation records intercepted at the perimeter gateway.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search agent, tool, target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-56 font-sans shadow-inner"
            />
          </div>

          {/* Decision Filter Pills */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('allow')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'allow'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Allowed
            </button>
            <button
              onClick={() => setFilter('escalate')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'escalate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Escalated
            </button>
            <button
              onClick={() => setFilter('block')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'block'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      {/* Feed Table with Sticky Header & Smooth Scrolling */}
      <div className="mt-4 overflow-x-auto max-h-[520px] rounded-xl border border-slate-800/80 bg-slate-950/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-[#0d1424] border-b border-slate-800 shadow-sm backdrop-blur-md">
            <tr className="text-slate-400 font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3.5">Time</th>
              <th className="py-3 px-3.5">Agent</th>
              <th className="py-3 px-3.5">Tool</th>
              <th className="py-3 px-3.5">Target / Amount</th>
              <th className="py-3 px-3.5">Risk Score</th>
              <th className="py-3 px-3.5">Decision</th>
              <th className="py-3 px-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            <AnimatePresence initial={false}>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <span className="text-sm font-semibold text-slate-300">
                        No Intercepted Actions
                      </span>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {searchTerm || filter !== 'all'
                          ? 'No logs match your filter criteria. Try clearing search.'
                          : 'Run a live demo scenario above or trigger an agent task to see logs stream in real-time.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <LogRow
                    key={log.id}
                    log={log}
                    isExpanded={expandedRowId === log.id}
                    onToggleExpand={() => toggleExpand(log.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
        <span>POLLING: 2s Interval (delta update)</span>
        <span>Showing {filteredLogs.length} of {logs.length} logged events</span>
      </div>

    </section>
  );
}
