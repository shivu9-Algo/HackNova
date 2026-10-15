import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import StatCard from './StatCard';

export default function StatCards({ stats = { total: 0, allowed: 0, escalated: 0, blocked: 0, pending: 0 } }) {
  const total = stats.total || 0;
  const allowed = stats.allowed || 0;
  const escalated = stats.escalated || 0;
  const blocked = stats.blocked || 0;

  const allowedPct = total > 0 ? Math.round((allowed / total) * 100) : 0;
  const escalatedPct = total > 0 ? Math.round((escalated / total) * 100) : 0;
  const blockedPct = total > 0 ? Math.round((blocked / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        id="stat-total"
        title="Total Intercepted"
        value={total}
        sub={`${stats.pending || 0} pending review`}
        icon={Layers}
        variant="cyan"
        badgeText="Pre-execution stream"
      />

      <StatCard
        id="stat-allowed"
        title="Allowed (Safe)"
        value={allowed}
        sub={`${allowedPct}% passed`}
        icon={ShieldCheck}
        variant="emerald"
        badgeText="Score ≤ 29"
      />

      <StatCard
        id="stat-escalated"
        title="Escalated (Review)"
        value={escalated}
        sub={`${escalatedPct}% human gate`}
        icon={AlertTriangle}
        variant="amber"
        badgeText="Score 30 - 70"
      />

      <StatCard
        id="stat-blocked"
        title="Blocked (Threats)"
        value={blocked}
        sub={`${blockedPct}% perimeter drop`}
        icon={ShieldAlert}
        variant="red"
        badgeText="Score ≥ 71"
      />
    </div>
  );
}
