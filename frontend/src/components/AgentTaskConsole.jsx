import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Inbox,
  CreditCard,
  Trash2,
  Key,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Terminal,
  ArrowRight,
  RefreshCw,
  User,
  CheckCircle2,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { toast } from 'sonner';
import DecisionBadge from './DecisionBadge';
import RiskGauge from './RiskGauge';

export default function AgentTaskConsole({ onTaskTriggered, isKillSwitchActive }) {
  const [taskText, setTaskText] = useState('');
  const [agentMode, setAgentMode] = useState('auto');
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      type: 'text',
      content: 'AegisGuard runtime online. Provide any operational task or run a preset below. All proposed tool calls will be intercepted before reaching enterprise backends.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [agentStatus, setAgentStatus] = useState(null);

  // API key configuration drawer
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [savedKeyMessage, setSavedKeyMessage] = useState('');

  // Fake inbox drawer
  const [inboxList, setInboxList] = useState([]);
  const [showInboxModal, setShowInboxModal] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isRunning]);

  const refreshAgentStatus = async () => {
    try {
      const st = await api.getAgentStatus();
      setAgentStatus(st);
      if (st.default_mode) {
        setAgentMode(st.default_mode);
      }
    } catch (err) {
      console.warn('Failed to fetch agent status:', err);
    }
  };

  const loadInbox = async () => {
    try {
      const data = await api.getAgentInbox();
      setInboxList(data.inbox || []);
    } catch (err) {
      console.warn('Failed to load inbox:', err);
    }
  };

  useEffect(() => {
    refreshAgentStatus();
    loadInbox();
  }, []);

  const presets = [
    {
      id: 'invoices',
      title: 'Pay pending vendor invoices',
      subtitle: '$1,250 (Safe) & $90,000 (Escalated)',
      prompt: 'Pay pending vendor invoices',
      icon: CreditCard,
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-400 text-amber-300',
      badge: 'Escalation Test'
    },
    {
      id: 'inbox',
      title: 'Process my inbox',
      subtitle: 'Contains poisoned email with data leak injection',
      prompt: 'Process my inbox',
      icon: Inbox,
      color: 'from-rose-500/10 to-red-500/10 border-red-500/30 hover:border-red-400 text-red-300',
      badge: 'Poisoned Prompt'
    },
    {
      id: 'cleanup',
      title: 'Purge old database cache',
      subtitle: 'Attempts delete_record on customers',
      prompt: 'Clean up outdated database logs and temporary tables',
      icon: Trash2,
      color: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-400 text-cyan-300',
      badge: 'Table Guard'
    }
  ];

  const handleRunTask = async (customPrompt = null) => {
    const promptToRun = customPrompt || taskText;
    if (!promptToRun.trim() || isRunning) return;

    // Add user message to chat stream
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      type: 'text',
      content: promptToRun,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTaskText('');
    setIsRunning(true);

    try {
      const res = await api.runAgentTask(
        promptToRun,
        agentMode,
        customApiKey || undefined,
        true
      );

      // Add trace items and final reply
      const botMsg = {
        id: 'agent-' + Date.now(),
        sender: 'agent',
        type: 'result',
        content: res.final_response,
        trace: res.trace || [],
        mode: res.agent_mode,
        fallback: res.fallback_triggered,
        fallbackReason: res.fallback_reason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (onTaskTriggered) onTaskTriggered();
    } catch (err) {
      const errorMsg = {
        id: 'agent-err-' + Date.now(),
        sender: 'agent',
        type: 'error',
        content: `Error executing agent task: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error('Agent Execution Failed', { description: err.message });
    } finally {
      setIsRunning(false);
      refreshAgentStatus();
    }
  };

  const handleSaveApiKey = async () => {
    if (!customApiKey.trim()) return;
    try {
      await api.setAgentApiKey(customApiKey.trim());
      setSavedKeyMessage('✓ Gemini API key saved to session!');
      refreshAgentStatus();
      toast.success('Gemini API Key Saved');
      setTimeout(() => setSavedKeyMessage(''), 3500);
    } catch (err) {
      setSavedKeyMessage(`Error: ${err.message}`);
      toast.error('Failed to Save API Key');
    }
  };

  return (
    <section className="glass-card p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">

      {/* Top Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-md">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Autonomous LLM Agent Task Console
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wide uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Function Calling + Perimeter Guard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chat-driven agent execution. The model autonomous chooses actions; AegisGuard intercepts each tool before runtime.
            </p>
          </div>
        </div>

        {/* Controls: Mode, Inbox, and API Key */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setAgentMode('gemini')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${agentMode === 'gemini'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Real Gemini API function calling"
            >
              🤖 Gemini
            </button>
            <button
              onClick={() => setAgentMode('scripted')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${agentMode === 'scripted'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Deterministic scripted fallback"
            >
              📜 Fallback
            </button>
            <button
              onClick={() => setAgentMode('auto')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${agentMode === 'auto'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Auto: Gemini if configured, else fallback"
            >
              ⚡ Auto
            </button>
          </div>

          {/* Fake Inbox Button */}
          <button
            onClick={() => setShowInboxModal(!showInboxModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all"
            title="Inspect Simulated Inbox"
          >
            <Inbox className="w-3.5 h-3.5 text-rose-400" />
            <span>Fake Inbox</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
          </button>

          {/* API Key Configure Button */}
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${agentStatus?.gemini_api_configured
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{agentStatus?.gemini_api_configured ? 'API Key Active' : 'Configure Key'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Key Drawer */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-cyan-400" />
                Gemini API Key Configuration
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Loaded from <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">GEMINI_API_KEY</code> or dynamic session
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder={agentStatus?.masked_key ? `Current: ${agentStatus.masked_key}` : 'Paste AI Studio API key (AIza...)'}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
              >
                Apply Key
              </button>
            </div>

            {savedKeyMessage && (
              <p className="text-[11px] text-emerald-400 font-mono">{savedKeyMessage}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Fake Inbox Drawer */}
      <AnimatePresence>
        {showInboxModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-2xl bg-slate-950/95 border border-rose-500/30 text-xs text-slate-300 space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-slate-100">Simulated Enterprise Inbox</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
                  Adversarial Prompt Injections
                </span>
              </div>
              <button
                onClick={() => setShowInboxModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {inboxList.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border text-[11px] font-mono flex flex-col justify-between ${msg.is_poisoned
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      {msg.is_poisoned ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/40 font-bold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" /> POISONED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">
                          Routine
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-slate-100 truncate mb-1">
                      {msg.subject}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mb-2">
                      From: {msg.sender}
                    </div>
                    <p className="text-[10px] leading-relaxed line-clamp-3 text-slate-300 whitespace-pre-line">
                      {msg.body}
                    </p>
                  </div>

                  {msg.is_poisoned && (
                    <div className="mt-2.5 pt-2 border-t border-rose-500/30 text-[10px] text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>Hidden prompt injection attempts exfiltration to attacker@evil.com</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset Tasks */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Preset Directives</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => handleRunTask(p.prompt)}
                disabled={isRunning}
                className={`p-3.5 rounded-xl border bg-gradient-to-br text-left transition-all flex flex-col justify-between group disabled:opacity-50 ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {p.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-900/80 border border-slate-700/80">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {p.subtitle}
                  </p>
                </div>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-slate-300 group-hover:translate-x-0.5 transition-transform">
                  <span>Send Directive</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 max-h-[420px] overflow-y-auto space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : (msg.content?.includes('BLOCKED') || msg.content?.includes('SECURITY ALERT') || msg.trace?.some(t => t.decision === 'block' || t.status === 'blocked'))
                        ? 'bg-[#160a0d] border border-red-500/60 text-slate-100 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                        : 'bg-[#0d1424] border border-slate-800 text-slate-200 shadow-sm'
                    }`}
                >
                  {/* Timestamp and Sender */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] font-mono text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      {isUser ? 'Operator' : 'Agent Telemetry'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Security Alert Banner if Blocked Action Detected */}
                  {!isUser && (msg.content?.includes('BLOCKED') || msg.content?.includes('SECURITY ALERT') || msg.trace?.some(t => t.decision === 'block' || t.status === 'blocked')) && (
                    <div className="mb-2.5 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-center gap-2 font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span>CRITICAL SECURITY WARNING: PERIMETER GATEWAY BLOCKED HIGH-RISK ACTION</span>
                    </div>
                  )}

                  {/* Message Body */}
                  <p className="whitespace-pre-line font-sans text-xs">
                    {msg.content}
                  </p>

                  {/* If Result Trace is present */}
                  {msg.trace && msg.trace.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Intercepted Operations ({msg.trace.length} events):
                      </div>

                      <div className="space-y-1.5">
                        {msg.trace.map((ev, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col gap-1 font-mono text-[11px]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-cyan-400 font-bold capitalize">
                                {ev.step.replace(/_/g, ' ')}
                              </span>
                              {ev.decision && (
                                <DecisionBadge decision={ev.decision} size="sm" />
                              )}
                            </div>

                            {ev.tool && (
                              <div className="text-slate-300">
                                Tool: <span className="text-amber-300 font-semibold">{ev.tool}</span>
                                {ev.target && <span> • Target: {ev.target}</span>}
                                {ev.amount && <span> • ${Number(ev.amount).toLocaleString()}</span>}
                              </div>
                            )}

                            {ev.reason && (
                              <div className="text-slate-400 text-[10px] italic">
                                {ev.reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator while Agent is Working */}
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>

              <div className="px-4 py-2.5 rounded-2xl bg-[#0d1424] border border-slate-800 flex items-center gap-1.5 shadow-sm">
                <span className="text-xs font-mono text-cyan-400 mr-1 font-medium">Agent Reasoning</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Style Input Box */}
      <div className="mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunTask();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            id="input-agent-task"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Type instructions for the agent (e.g. 'Pay pending vendor invoices' or 'Process my inbox')..."
            disabled={isRunning}
            className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 shadow-inner font-sans"
          />

          <button
            id="btn-run-agent-task"
            type="submit"
            disabled={isRunning || !taskText.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/20 active:scale-95 disabled:opacity-50 transition-all shrink-0"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run Task'}</span>
          </button>
        </form>
      </div>

    </section>
  );
}
