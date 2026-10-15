import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import KillSwitchBanner from './components/KillSwitchBanner';
import HeroSection from './components/HeroSection';
import FlowDiagram from './components/FlowDiagram';
import StatCards from './components/StatCards';
import BeforeAfterToggle from './components/BeforeAfterToggle';
import DemoScenarios from './components/DemoScenarios';
import AgentTaskConsole from './components/AgentTaskConsole';
import PendingApprovals from './components/PendingApprovals';
import DefaultRecipientCard from './components/DefaultRecipientCard';
import ActiveRulesSection from './components/ActiveRulesSection';
import ActivityFeed from './components/ActivityFeed';
import ActionSandboxModal from './components/ActionSandboxModal';
import RulesModal from './components/RulesModal';
import ToastContainer from './components/ToastContainer';
import { Toaster, toast } from 'sonner';
import { api } from './services/api';
import { Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function App() {
  const [stats, setStats] = useState({ total: 0, allowed: 0, escalated: 0, blocked: 0, pending: 0 });
  const [logs, setLogs] = useState([]);
  const [killSwitch, setKillSwitch] = useState(false);
  const [loadingKillSwitch, setLoadingKillSwitch] = useState(false);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [latestInterceptedAction, setLatestInterceptedAction] = useState(null);

  // Modals & Legacy Toasts support
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Ref to track seen log IDs to fire toasts only on newly arriving logs
  const seenLogIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  const addToast = (type, title, message) => {
    if (type === 'blocked' || type === 'error') {
      toast.error(title, { description: message });
    } else if (type === 'escalated') {
      toast.warning(title, { description: message });
    } else {
      toast.success(title, { description: message });
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch live state from backend
  const fetchGatewayState = async () => {
    try {
      const [statsData, logsData, ksData] = await Promise.all([
        api.getStats(),
        api.getLogs(),
        api.getKillSwitch(),
      ]);

      setStats(statsData);
      setLogs(logsData);
      setKillSwitch(ksData.kill_switch);

      if (logsData.length > 0) {
        setLatestInterceptedAction(logsData[0]);
      }

      // Check for newly intercepted blocked or escalated events to trigger toasts
      if (!isFirstLoadRef.current) {
        logsData.forEach((l) => {
          if (!seenLogIdsRef.current.has(l.id)) {
            if (l.decision === 'block') {
              addToast('blocked', `🚨 Action Blocked: ${l.tool}`, `Agent ${l.agent_id} halted. ${l.reason}`);
            } else if (l.decision === 'escalate') {
              addToast('escalated', `⚠️ Action Escalated: ${l.tool}`, `Requires supervisor authorization: ${l.reason}`);
            }
          }
        });
      }

      // Mark all current logs as seen
      logsData.forEach((l) => seenLogIdsRef.current.add(l.id));
      isFirstLoadRef.current = false;
    } catch (err) {
      console.warn('Backend sync poll error:', err.message);
    }
  };

  // Polling cycle: every 2 seconds
  useEffect(() => {
    fetchGatewayState();
    const interval = setInterval(fetchGatewayState, 2000);
    return () => clearInterval(interval);
  }, []);

  // Emergency Kill Switch Toggle Handler
  const handleToggleKillSwitch = async () => {
    try {
      setLoadingKillSwitch(true);
      const res = await api.toggleKillSwitch();
      setKillSwitch(res.kill_switch);
      if (res.kill_switch) {
        toast.error('KILL SWITCH ACTIVATED: all agent actions blocked', {
          description: 'Emergency stop perimeter active. All tool executions halted.',
        });
      } else {
        toast.success('KILL SWITCH DISARMED', {
          description: 'Autonomous AI agent runtime restored.',
        });
      }
      fetchGatewayState();
    } catch (err) {
      toast.error('Failed to toggle Kill Switch', { description: err.message });
    } finally {
      setLoadingKillSwitch(false);
    }
  };

  // Approve escalated action
  const handleApprove = async (logId) => {
    try {
      await api.approveAction(logId, 'Authorized from Security Operations Center');
      await fetchGatewayState();
    } catch (err) {
      throw err;
    }
  };

  // Reject escalated action
  const handleReject = async (logId) => {
    try {
      await api.rejectAction(logId, 'Denied by supervisor');
      await fetchGatewayState();
    } catch (err) {
      throw err;
    }
  };

  // Run Demo Scenario (1, 2, or 3)
  const handleRunScenario = async (scenarioId, amount = null) => {
    try {
      setIsRunningScenario(true);
      const res = await api.runScenario(scenarioId, amount);
      if (res && res.decision_result) {
        setLatestInterceptedAction(res.decision_result);
      }
      await fetchGatewayState();
      return res;
    } finally {
      setIsRunningScenario(false);
    }
  };

  // Run All Demo Scenarios sequentially
  const handleRunAll = async () => {
    try {
      setIsRunningScenario(true);
      await api.runAllScenarios();
      await fetchGatewayState();
    } finally {
      setIsRunningScenario(false);
    }
  };

  // Submit custom action from sandbox
  const handleSubmitAction = async (payload) => {
    const res = await api.sendAction(payload);
    setLatestInterceptedAction(res);
    await fetchGatewayState();
    return res;
  };

  // Reset logs
  const handleResetLogs = async () => {
    try {
      await api.resetLogs();
      seenLogIdsRef.current.clear();
      setLatestInterceptedAction(null);
      toast.success('Audit Logs Reset', { description: 'Gateway memory and table cleared for demo.' });
      await fetchGatewayState();
    } catch (err) {
      toast.error('Reset failed', { description: err.message });
    }
  };

  // Filter pending items
  const pendingLogs = logs.filter((l) => l.status === 'pending');

  return (
    <div className={`min-h-screen text-slate-100 flex flex-col transition-all duration-700 ${
      killSwitch ? 'kill-switch-active-app' : 'bg-[#0a0e1a] bg-grid-cyber'
    }`}>
      
      {/* Top Navigation */}
      <Navbar
        killSwitch={killSwitch}
        onToggleKillSwitch={handleToggleKillSwitch}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSandbox={() => setIsSandboxOpen(true)}
        onResetLogs={handleResetLogs}
        loadingKillSwitch={loadingKillSwitch}
      />

      {/* Emergency Kill Switch Alert Banner */}
      <KillSwitchBanner
        killSwitch={killSwitch}
        onDeactivate={handleToggleKillSwitch}
      />

      {/* Main Security Operations Center Container with Page-load Stagger */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* 1. Hero Section */}
        <HeroSection
          onRunDemoClick={() => document.getElementById('demo-panel')?.scrollIntoView({ behavior: 'smooth' })}
          onViewAuditClick={() => document.getElementById('audit-log')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* 2. "How It Works" Interception Flow */}
        <FlowDiagram latestAction={latestInterceptedAction} />

        {/* 3. Stat Cards with Animated Numbers */}
        <StatCards stats={stats} />

        {/* 4. Before vs After Guard Toggle */}
        <BeforeAfterToggle />

        {/* 5. Interactive Live Demo Panel */}
        <DemoScenarios
          onRunScenario={handleRunScenario}
          onRunAll={handleRunAll}
          isRunningAny={isRunningScenario}
          onActionIntercepted={(dec) => setLatestInterceptedAction(dec)}
        />

        {/* 6. Human-in-the-Loop Pending Approvals Queue */}
        <PendingApprovals
          pendingLogs={pendingLogs}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* 7. Default Recipient & Whitelist Configuration Card */}
        <DefaultRecipientCard />

        {/* 8. Autonomous LLM Agent Chat Box */}
        <AgentTaskConsole
          onTaskTriggered={fetchGatewayState}
          isKillSwitchActive={killSwitch}
        />

        {/* 9. Active Security Policy Rules Engine */}
        <ActiveRulesSection onOpenEditModal={() => setIsRulesOpen(true)} />

        {/* 10. Live Audit Stream & Interception Feed */}
        <ActivityFeed logs={logs} />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-[#070a14] py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <p>AgentGuard Security Gateway • DevHost 2026 Hackathon • Zero-Trust AI Agent Safety & Control</p>
      </footer>

      {/* Modals & Dialogs */}
      <ActionSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onSubmitAction={handleSubmitAction}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Dark Styled Sonner Toaster at bottom-right */}
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
