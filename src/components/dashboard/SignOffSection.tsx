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
    <section id="principle-70" className="p-5 sm:p-7 rounded-2xl bg-[#081414] border border-[#162b29] shadow-2xl flex flex-col gap-6 select-none animate-fadeIn relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#162b29] gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#00f5a0]/10 text-[#00f5a0] font-bold border border-[#00f5a0]/25">
            POS://MOD_09
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#e6f4f1] uppercase font-mono flex items-center gap-2">
              THE 70TH PRINCIPLE & OPERATOR SIGN-OFF
            </h2>
            <p className="text-xs text-[#7a9490] font-mono">
              Apex governance standard, operational stop/start matrices, and flight plan commitment.
            </p>
          </div>
        </div>
      </div>

      {/* The 70th Principle Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0b1a19] via-[#0e241f] to-[#0b1a19] border border-[#00f5a0]/30 space-y-3">
        <span className="font-mono text-[10px] text-[#00f5a0] uppercase tracking-widest block font-bold">
          [APEX PRINCIPLE #70 // MANDATORY RATIFICATION]
        </span>
        <blockquote className="font-mono text-base md:text-lg text-[#e6f4f1] font-bold tracking-wide italic border-l-2 border-[#00f5a0] pl-4">
          "{state.apexQuote || 'Discipline equals freedom. System integrity is self-respect.'}"
        </blockquote>
        <p className="font-mono text-xs text-[#7a9490]">
          {state.apexSubquote || 'All tactical execution is subservient to system integrity. No compromise on code craft, no compromise on financial discipline, no compromise on physical vitality.'}
        </p>
      </div>

      {/* Stop Immediately vs Start Immediately Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* STOP IMMEDIATELY */}
        <div className="p-5 rounded-xl bg-[#140a0c]/60 border border-[#f43f5e]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#f43f5e]">
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
              className="flex-1 bg-[#050a0a] border border-[#f43f5e]/30 rounded-lg px-3 py-1.5 font-mono text-xs text-[#ffe4e6] focus:border-[#f43f5e] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 text-[#f43f5e] rounded-lg font-mono text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
          <ul className="space-y-2 pt-1">
            {state.stopImmediatelyList.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-xs font-mono text-[#ffe4e6] bg-[#050a0a] p-2.5 rounded-lg border border-[#f43f5e]/20">
                <span>✕ {item}</span>
                <button
                  onClick={() => onRemoveStopItem(idx)}
                  className="text-[#f43f5e]/60 hover:text-[#f43f5e] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* START IMMEDIATELY */}
        <div className="p-5 rounded-xl bg-[#081a16]/60 border border-[#00f5a0]/30 space-y-3">
          <div className="flex items-center gap-2 text-[#00f5a0]">
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
              className="flex-1 bg-[#050a0a] border border-[#00f5a0]/30 rounded-lg px-3 py-1.5 font-mono text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#00f5a0]/20 hover:bg-[#00f5a0]/30 text-[#00f5a0] rounded-lg font-mono text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
          <ul className="space-y-2 pt-1">
            {state.startImmediatelyList.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2 text-xs font-mono text-[#e6f4f1] bg-[#050a0a] p-2.5 rounded-lg border border-[#00f5a0]/20">
                <span>✓ {item}</span>
                <button
                  onClick={() => onRemoveStartItem(idx)}
                  className="text-[#00f5a0]/60 hover:text-[#00f5a0] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Operator Verification Checklist & Commitment */}
      <div className="p-5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-bold text-[#e6f4f1] uppercase">
              OPERATOR BLUEPRINT VERIFICATION: {state.operatorName}
            </h4>
            <p className="font-mono text-xs text-[#7a9490]">
              Status: <span className="text-[#00f5a0] font-bold">SYSTEMS NOMINAL</span> // 10-Year Horizon Active
            </p>
          </div>
        </div>

        <button
          onClick={handleCommit}
          className="px-6 py-2.5 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-[#00f5a0]/15"
        >
          {committed ? '✓ FLIGHT PLAN RATIFIED' : 'COMMIT & RATIFY FLIGHT PLAN'}
        </button>
      </div>
    </section>
  );
};
