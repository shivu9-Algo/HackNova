import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

class SafeCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn('CountUp animation fallback triggered:', err);
  }

  render() {
    if (this.state.hasError) {
      return <span>{Number(this.props.end || 0).toLocaleString()}</span>;
    }
    return <CountUp {...this.props} />;
  }
}

export default function StatCard({
  id,
  title,
  value = 0,
  sub,
  icon: Icon,
  variant = 'cyan', // 'cyan' | 'emerald' | 'amber' | 'red'
  badgeText,
}) {
  const [flashing, setFlashing] = useState(false);
  const prevValueRef = useRef(value);

  // Trigger brief flash when value increases
  useEffect(() => {
    if (value > prevValueRef.current) {
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), 900);
      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  const variants = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
      flashClass: 'ring-2 ring-cyan-400 bg-cyan-950/40',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      flashClass: 'ring-2 ring-emerald-400 bg-emerald-950/40',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      text: 'text-amber-400',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      flashClass: 'ring-2 ring-amber-400 bg-amber-950/40',
    },
    red: {
      border: 'border-red-500/30 hover:border-red-500/60',
      text: 'text-red-400',
      badge: 'bg-red-500/15 text-red-300 border-red-500/30',
      hoverGlow: 'hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]',
      flashClass: 'ring-2 ring-red-400 bg-red-950/40',
    },
  };

  const v = variants[variant] || variants.cyan;

  return (
    <motion.div
      id={id}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl glass-card transition-all duration-300 relative overflow-hidden ${v.border} ${v.hoverGlow} ${
        flashing ? `${v.flashClass} scale-[1.02]` : ''
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <span className={`p-2 rounded-xl border ${v.badge}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>

      {/* Main counter with SafeCounter fallback */}
      <div className="flex items-baseline justify-between mt-2">
        <div className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${v.text}`}>
          <SafeCounter end={Number(value) || 0} duration={1.2} separator="," />
        </div>
        {sub && (
          <span className="text-xs text-slate-400 font-mono tracking-tight">
            {sub}
          </span>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>GATEWAY TELEMETRY</span>
        {badgeText && <span className="text-slate-400 font-medium">{badgeText}</span>}
      </div>
    </motion.div>
  );
}
