import React, { useState } from 'react';
import { CheckCircle2, Plus, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { POSState } from '../../models/types';

interface SignOffSectionProps {
  state: POSState;
  onAddStopItem: (text: string) => void;
  onRemoveStopItem: (idx: number) => void;
  onAddStartItem: (text: string) => void;
  onRemoveStartItem: (idx: number) => void;
  onSignOffCommit: () => void;
}

export const SignOffSection: React.FC<SignOffSectionProps> = ({
  state,
  onAddStopItem,
  onRemoveStopItem,
  onAddStartItem,
  onRemoveStartItem,
  onSignOffCommit,
}) => {
  const [newStopText, setNewStopText] = useState('');
  const [newStartText, setNewStartText] = useState('');
  const [committed, setCommitted] = useState(false);

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopText.trim()) return;
    onAddStopItem(newStopText.trim());
    setNewStopText('');
  };

  const handleAddStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartText.trim()) return;
    onAddStartItem(newStartText.trim());
    setNewStartText('');
  };

  const handleCommit = () => {
    onSignOffCommit();
    setCommitted(true);
    setTimeout(() => setCommitted(false), 4000);
  };

  return (
    <section id="principle-70" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3c4a42]/30 gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-bold border border-[#4edea3]/30">
            MOD_09
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#e2e2e8] uppercase font-mono flex items-center gap-2">
              THE 70TH PRINCIPLE & OPERATOR SIGN-OFF
            </h2>
            <p className="text-xs text-[#bbcabf] font-mono">
              Apex governance standard, operational stop/start matrices, and flight plan commitment.
            </p>
          </div>
        </div>
      </div>

      {/* The 70th Principle Banner */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-[#1a1c20] via-[#14231a] to-[#1a1c20] border border-[#4edea3]/40 space-y-3">
        <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-widest block font-bold">
          [APEX PRINCIPLE #70 // MANDATORY RATIFICATION]
        </span>
        <blockquote className="font-mono text-base md:text-lg text-[#d0fbe0] font-bold tracking-wide italic border-l-2 border-[#4edea3] pl-4">
          "{state.apexQuote || 'Discipline equals freedom. System integrity is self-respect.'}"
        </blockquote>
        <p className="font-mono text-xs text-[#bbcabf]">
          {state.apexSubquote || 'All tactical execution is subservient to system integrity. No compromise on code craft, no compromise on financial discipline, no compromise on physical vitality.'}
        </p>
      </div>

      {/* Stop Immediately vs Start Immediately Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STOP IMMEDIATELY */}
        <div className="p-4 rounded-lg bg-[#201a1a]/60 border border-[#ffb4ab]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#ffb4ab]">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
              STOP IMMEDIATELY (FRICTION & DRAG)
            </h3>
          </div>
          <form onSubmit={handleAddStop} className="flex gap-2">
            <input
              type="text"
              placeholder="Add behavior to stop..."
              value={newStopText}
              onChange={(e) => setNewStopText(e.target.value)}
              className="flex-1 bg-[#111318] border border-[#ffb4ab]/30 rounded px-2.5 py-1 font-mono text-xs text-[#ffdad6] focus:border-[#ffb4ab] focus:outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 text-[#ffb4ab] rounded font-mono text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
          <ul className="space-y-2 pt-1">
            {state.stopImmediatelyList.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-xs font-mono text-[#ffdad6] bg-[#111318]/60 p-2 rounded border border-[#ffb4ab]/20">
                <span>✕ {item}</span>
                <button
                  onClick={() => onRemoveStopItem(idx)}
                  className="text-[#ffb4ab]/60 hover:text-[#ffb4ab] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* START IMMEDIATELY */}
        <div className="p-4 rounded-lg bg-[#14231a]/60 border border-[#4edea3]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#4edea3]">
            <CheckCircle2 className="w-4 h-4" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
              START IMMEDIATELY (COMPOUNDING VECTORS)
            </h3>
          </div>
          <form onSubmit={handleAddStart} className="flex gap-2">
            <input
              type="text"
              placeholder="Add behavior to start..."
              value={newStartText}
              onChange={(e) => setNewStartText(e.target.value)}
              className="flex-1 bg-[#111318] border border-[#4edea3]/30 rounded px-2.5 py-1 font-mono text-xs text-[#d0fbe0] focus:border-[#4edea3] focus:outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#4edea3]/20 hover:bg-[#4edea3]/30 text-[#4edea3] rounded font-mono text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
          <ul className="space-y-2 pt-1">
            {state.startImmediatelyList.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-xs font-mono text-[#d0fbe0] bg-[#111318]/60 p-2 rounded border border-[#4edea3]/20">
                <span>✓ {item}</span>
                <button
                  onClick={() => onRemoveStartItem(idx)}
                  className="text-[#4edea3]/60 hover:text-[#4edea3] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Operator Verification Checklist & Commitment */}
      <div className="p-5 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-bold text-[#e2e2e8] uppercase">
              OPERATOR BLUEPRINT VERIFICATION: {state.operatorName}
            </h4>
            <p className="font-mono text-xs text-[#bbcabf]">
              Status: <span className="text-[#4edea3] font-bold">SYSTEMS NOMINAL</span> // 10-Year Horizon Active
            </p>
          </div>
        </div>

        <button
          onClick={handleCommit}
          className="px-6 py-2.5 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-[#4edea3]/10"
        >
          {committed ? '✓ FLIGHT PLAN RATIFIED' : 'COMMIT & RATIFY FLIGHT PLAN'}
        </button>
      </div>
    </section>
  );
};
