import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertTriangle, Plus, Trash2, ChevronDown, ShieldAlert, Globe, Building } from 'lucide-react';
import { toast } from 'sonner';

const INITIAL_ADDRESSES = [
  { id: 1, email: 'alice@company.com', isInternal: true, label: 'Alice (Team Lead)' },
  { id: 2, email: 'finance-team@company.com', isInternal: true, label: 'Finance Team' },
  { id: 3, email: 'operations@internal.corp', isInternal: true, label: 'Ops Internal' },
  { id: 4, email: 'external-vendor@partner.org', isInternal: false, label: 'Vendor Partner' },
  { id: 5, email: 'contractor@gmail.com', isInternal: false, label: 'External Contractor' },
];

export default function DefaultRecipientCard({ onDefaultChange }) {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedId, setSelectedId] = useState(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const selectedRecipient = addresses.find((a) => a.id === selectedId) || addresses[0];

  const checkIsInternal = (email) => {
    const internalDomains = ['@company.com', '@internal.corp', '@org.local', '@devhost.tech'];
    return internalDomains.some((d) => email.toLowerCase().endsWith(d));
  };

  const handleSelect = (addr) => {
    setSelectedId(addr.id);
    setIsDropdownOpen(false);
    if (!addr.isInternal) {
      toast.warning('External Default Recipient Selected', {
        description: `${addr.email} is an external domain and will incur risk penalties (+40).`,
      });
    } else {
      toast.success('Internal Recipient Set', {
        description: `${addr.email} set as verified default recipient.`,
      });
    }
    if (onDefaultChange) onDefaultChange(addr);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      toast.error('Invalid Email', { description: 'Please provide a valid email address.' });
      return;
    }

    const isInt = checkIsInternal(newEmail.trim());
    const newEntry = {
      id: Date.now(),
      email: newEmail.trim(),
      label: newLabel.trim() || newEmail.trim().split('@')[0],
      isInternal: isInt,
    };

    setAddresses((prev) => [...prev, newEntry]);
    setSelectedId(newEntry.id);
    setNewEmail('');
    setNewLabel('');
    setIsAdding(false);
    toast.success('Recipient Added', {
      description: `Added ${newEntry.email} (${isInt ? 'Internal' : 'External'}).`,
    });
  };

  const handleRemove = (id, e) => {
    e.stopPropagation();
    if (addresses.length <= 1) {
      toast.error('Cannot Remove', { description: 'At least one recipient must be saved.' });
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) {
      const remaining = addresses.filter((a) => a.id !== id);
      setSelectedId(remaining[0].id);
    }
    toast.info('Recipient Removed');
  };

  return (
    <div className="glass-card p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Mail className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100 tracking-tight">
              Default Recipient & Whitelist Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure the agent's pre-approved email target. Outgoing communications are evaluated against internal security boundaries.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="mt-5 space-y-4">
        
        {/* Recipient Dropdown Selector */}
        <div className="relative">
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
            Active Default Recipient
          </label>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 text-left transition-all shadow-inner focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${
                selectedRecipient?.isInternal
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}>
                {selectedRecipient?.isInternal ? <Building className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>{selectedRecipient?.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    selectedRecipient?.isInternal
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {selectedRecipient?.isInternal ? 'Internal' : 'External'}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  {selectedRecipient?.email}
                </div>
              </div>
            </div>

            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Smooth Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute z-30 left-0 right-0 mt-2 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl space-y-1 max-h-64 overflow-y-auto"
              >
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelect(addr)}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-slate-800/90 text-white border border-slate-700'
                          : 'hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          addr.isInternal
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {addr.isInternal ? 'Internal' : 'External'}
                        </span>
                        <div>
                          <span className="font-semibold">{addr.label}</span>
                          <span className="text-slate-400 font-mono ml-2">({addr.email})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        <button
                          type="button"
                          onClick={(e) => handleRemove(addr.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition"
                          title="Remove address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animated Add Form Drawer */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleAddAddress}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              <div className="text-xs font-semibold text-slate-200">Add New Recipient Address</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  placeholder="Email address (e.g. bob@company.com)"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <input
                  type="text"
                  placeholder="Friendly label (e.g. Bob DevOps)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-md"
                >
                  Save Recipient
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Warning Message Expands with Animation when External Address Chosen */}
        <AnimatePresence>
          {!selectedRecipient?.isInternal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-3 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <div className="font-bold tracking-wide uppercase text-[11px] text-amber-300">
                  External Domain Warning
                </div>
                <p className="text-amber-200/90 leading-relaxed font-sans">
                  The selected default recipient (<code className="font-mono text-amber-100 bg-amber-900/60 px-1 py-0.5 rounded">{selectedRecipient?.email}</code>) is outside the enterprise internal domain whitelist. Outgoing emails will incur an automatic <strong className="text-amber-300 font-mono">+40 risk penalty</strong> and may require human supervisor authorization before sending.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
