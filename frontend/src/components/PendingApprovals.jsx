import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import RiskGauge from './RiskGauge';
import DecisionBadge from './DecisionBadge';

export default function PendingApprovals({ pendingLogs = [], onApprove, onReject }) {
  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await onApprove(id);
      toast.success(`Action #${id} Authorized`, {
        description: 'Supervisor sign-off granted. Simulated tool executed.',
      });
    } catch (err) {
      toast.error(`Approval Failed`, { description: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      await onReject(id);
      toast.error(`Action #${id} Denied`, {
        description: 'Action cancelled by supervisor. Tool was not executed.',
      });
    } catch (err) {
      toast.error(`Rejection Failed`, { description: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="glass-card p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
              Human-in-the-Loop Pending Approvals
              {pendingLogs.length > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  {pendingLogs.length} Awaiting Review
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High-risk actions flagged by the gateway requiring explicit human supervisor authorization.
            </p>
          </div>
        </div>

        {pendingLogs.length > 0 && (
          <div className="text-xs font-mono text-amber-300 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/30">
            Supervisor Queue Active
          </div>
        )}
      </div>

      {/* Cards Queue with Spring Stacking */}
      <div className="mt-5">
        {pendingLogs.length === 0 ? (
          <div className="py-10 px-4 text-center border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/70 mx-auto mb-2.5" />
            <h3 className="text-sm font-bold text-slate-200">Approval Queue is Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No escalated agent actions currently require human oversight. Run the "Large transfer" demo scenario ($90,000) to queue a review item!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {pendingLogs.map((log) => {
                const isWorking = processingId === log.id;

                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, scale: 0.94, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, scale: 0.92, transition: { duration: 0.28 } }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0e1628]/95 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden"
                  >
                    {/* Amber left accent bar */}
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600" />

                    <div className="space-y-2 flex-1 pl-1">
                      {/* Top metadata tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ACTION #{log.id}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                          {log.agent_id}
                        </span>
                        <span className="text-xs font-mono text-slate-200 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {log.tool}
                        </span>
                        {log.amount !== null && log.amount !== undefined && (
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-800/40">
                            ${Number(log.amount).toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>

                      {/* Target Info */}
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Proposed Target:</span>
                        <code className="text-slate-100 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                          {log.target || '(none)'}
                        </code>
                      </div>

                      {/* Content Payload */}
                      {log.content && (
                        <div className="text-xs text-slate-300 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 font-mono">
                          <span className="text-slate-500 font-sans block text-[10px] uppercase tracking-wider mb-1">
                            Action Payload:
                          </span>
                          "{log.content}"
                        </div>
                      )}

                      {/* Risk Assessment & Rationale */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <RiskGauge score={log.score} variant="bar" />
                        <span className="text-xs text-amber-300/90 italic truncate max-w-lg">
                          {log.reason}
                        </span>
                      </div>
                    </div>

                    {/* Decision Action Buttons with Press Feedback (scale 0.96) */}
                    <div className="flex sm:flex-row lg:flex-col gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                      <motion.button
                        id={`btn-approve-${log.id}`}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleApprove(log.id)}
                        disabled={isWorking}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition active:scale-95 disabled:opacity-50"
                      >
                        {isWorking ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Approve Action</span>
                      </motion.button>

                      <motion.button
                        id={`btn-reject-${log.id}`}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleReject(log.id)}
                        disabled={isWorking}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600/85 hover:bg-red-600 text-white shadow-lg shadow-red-600/25 transition active:scale-95 disabled:opacity-50"
                      >
                        {isWorking ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Reject Action</span>
                      </motion.button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </section>
  );
}
