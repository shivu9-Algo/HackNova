import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  DollarSign, 
  Mail, 
  Trash2, 
  FileCode, 
  Edit3, 
  ChevronDown, 
  ChevronUp,
  Lock,
  Globe
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_FALLBACK_RULES = {
  thresholds: {
    allow_max: 29,
    escalate_max: 70,
    block_min: 71,
  },
  tools: {
    transfer_money: {
      high_risk_threshold: 50000,
      high_risk_penalty: 55,
      critical_risk_threshold: 500000,
      critical_risk_penalty: 90,
    },
    delete_record: {
      blocked_targets: ['customers', 'customer_records', 'users', 'audit_logs', 'financial_records'],
      blocked_target_penalty: 95,
      rate_limit: { max_actions_per_minute: 5, penalty: 90 },
    },
    send_email: {
      internal_domains: ['@company.com', '@internal.corp', '@org.local', '@devhost.tech'],
      external_domain_penalty: 40,
      blocked_domains: ['@evil.com', '@attacker.com', '@phishing.io', '@darkweb.net'],
      blocked_domain_penalty: 95,
    },
  },
  injection_and_exfiltration: {
    patterns: [
      'ignore previous instructions',
      'disregard previous instructions',
      'disregard all previous rules',
      'system prompt override',
      'leak customer data',
      'forward all customer data',
      'send customer records to',
      'dump database',
      'drop table',
      'bypass safety filters',
      'exfiltrate data',
    ],
    penalty: 95,
  },
};

export default function ActiveRulesSection({ onOpenEditModal }) {
  const [rules, setRules] = useState(DEFAULT_FALLBACK_RULES);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const data = await api.getRules();
        if (data && data.thresholds) {
          setRules(data);
        }
      } catch (err) {
        console.warn('Using default fallback rules:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const th = rules.thresholds || DEFAULT_FALLBACK_RULES.thresholds;
  const tm = rules.tools?.transfer_money || DEFAULT_FALLBACK_RULES.tools.transfer_money;
  const em = rules.tools?.send_email || DEFAULT_FALLBACK_RULES.tools.send_email;
  const dr = rules.tools?.delete_record || DEFAULT_FALLBACK_RULES.tools.delete_record;
  const inj = rules.injection_and_exfiltration || DEFAULT_FALLBACK_RULES.injection_and_exfiltration;

  return (
    <section id="rules-section" className="glass-card p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Active Security Policy Engine & Rules (<span className="font-mono text-cyan-300">rules.json</span>)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Live Enforced
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active risk scoring thresholds, tool constraints, blocked target tables, and adversarial injection signatures.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Rules JSON</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            title={isExpanded ? 'Collapse Section' : 'Expand Section'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rules Grid Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-6 space-y-5"
          >
            {/* 1. Decision Thresholds */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Tri-State Risk Thresholds</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-emerald-400 mb-1">
                    <span>ALLOW</span>
                    <span>0 - {th.allow_max} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Safe routine operations. Automatically authorized without supervisor friction.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-amber-400 mb-1">
                    <span>ESCALATE</span>
                    <span>{th.allow_max + 1} - {th.escalate_max} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    High risk actions paused for human supervisor sign-off in Pending Approvals.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs">
                  <div className="flex items-center justify-between font-mono font-bold text-red-400 mb-1">
                    <span>BLOCK</span>
                    <span>{th.block_min} - 100 pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Critical threat or injection attempt. Immediately halted at the perimeter.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Tool-Specific Guardrails */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Tool-Specific Policy Constraints</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Transfer Money */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="font-mono">transfer_money</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>High Risk (Review):</span>
                      <span className="text-amber-400 font-bold">&gt; ${Number(tm.high_risk_threshold).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical (Hard Block):</span>
                      <span className="text-red-400 font-bold">&gt; ${Number(tm.critical_risk_threshold).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] pt-1">
                      Penalties: +{tm.high_risk_penalty}pts / +{tm.critical_risk_penalty}pts
                    </div>
                  </div>
                </div>

                {/* Send Email */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono">send_email</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Internal: </span>
                      <span className="text-emerald-400">{em.internal_domains?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Blacklisted: </span>
                      <span className="text-red-400">{em.blocked_domains?.join(', ')}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] pt-1">
                      External: +{em.external_domain_penalty}pts • Blacklist: +{em.blocked_domain_penalty}pts
                    </div>
                  </div>
                </div>

                {/* Delete Record */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span className="font-mono">delete_record</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Protected Tables: </span>
                      <span className="text-red-400">{dr.blocked_targets?.slice(0, 3).join(', ')}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limit:</span>
                      <span className="text-cyan-400 font-bold">Max {dr.rate_limit?.max_actions_per_minute}/min</span>
                    </div>
                    <div className="text-slate-500 text-[10px] pt-1">
                      Target penalty: +{dr.blocked_target_penalty}pts
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Adversarial Injection Patterns */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>3. Adversarial Prompt Injection Signatures ({inj.patterns?.length || 0} patterns)</span>
                </span>
                <span className="text-[10px] font-mono text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                  Penalty: +{inj.penalty} Risk Points (Automatic Block)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {inj.patterns?.map((pattern, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-mono"
                  >
                    "{pattern}"
                  </span>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
