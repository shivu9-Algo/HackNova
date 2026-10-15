import React, { useState, useEffect } from 'react';
import { X, Sliders, Save, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function RulesModal({ isOpen, onClose }) {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadCurrentRules();
    }
  }, [isOpen]);

  const loadCurrentRules = async () => {
    try {
      setLoading(true);
      const rules = await api.getRules();
      if (rules && Object.keys(rules).length > 0) {
        setJsonText(JSON.stringify(rules, null, 2));
      } else {
        throw new Error('Empty response');
      }
      setStatusMsg(null);
    } catch (err) {
      console.warn('Loading fallback rules:', err);
      // Fallback standard rules so the modal is never empty
      const fallback = {
        "thresholds": { "allow_max": 29, "escalate_max": 70, "block_min": 71 },
        "tools": {
          "transfer_money": { "high_risk_threshold": 50000, "high_risk_penalty": 55, "critical_risk_threshold": 500000, "critical_risk_penalty": 90 },
          "delete_record": { "blocked_targets": ["customers", "customer_records", "users", "audit_logs", "financial_records"], "blocked_target_penalty": 95, "rate_limit": { "max_actions_per_minute": 5, "penalty": 90 } },
          "send_email": { "internal_domains": ["@company.com", "@internal.corp", "@org.local", "@devhost.tech"], "external_domain_penalty": 40, "blocked_domains": ["@evil.com", "@attacker.com", "@phishing.io", "@darkweb.net"], "blocked_domain_penalty": 95 }
        },
        "injection_and_exfiltration": {
          "patterns": ["ignore previous instructions", "disregard previous instructions", "disregard all previous rules", "system prompt override", "leak customer data", "forward all customer data", "send customer records to", "dump database", "drop table", "bypass safety filters", "exfiltrate data"],
          "penalty": 95
        }
      };
      setJsonText(JSON.stringify(fallback, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const parsed = JSON.parse(jsonText);
      await api.updateRules(parsed);
      setStatusMsg({ type: 'success', text: 'rules.json successfully updated! Policies applied live.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Invalid JSON: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security Policy Engine (rules.json)</h3>
              <p className="text-xs text-slate-400">Edit thresholds, blocked tables, injection keywords, and domain whitelist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JSON Editor Body */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>FILE: backend/app/rules.json</span>
            <span>Edits take effect dynamically without restarting server</span>
          </div>

          <div className="flex-1 min-h-[350px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-lg">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              </div>
            ) : (
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 resize-none selection:bg-amber-500/20 leading-relaxed"
                spellCheck="false"
              />
            )}
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              statusMsg.type === 'error'
                ? 'bg-red-950/40 text-red-300 border border-red-500/30'
                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
            }`}>
              {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={loadCurrentRules}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 transition"
            >
              Reset to Current
            </button>

            <button
              id="btn-save-rules"
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Applying...' : 'Save & Apply Policy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
