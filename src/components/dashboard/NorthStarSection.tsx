import React, { useState } from 'react';
import {
  Terminal,
  TrendingUp,
  PiggyBank,
  Network,
  PenTool,
  XCircle,
  CheckCircle2,
  Plus,
  Edit3,
  Check,
  Trash2,
} from 'lucide-react';
import { Goal, POSState, Principle } from '../../models/types';

interface NorthStarSectionProps {
  state: POSState;
  onUpdatePrinciple: (principle: Principle) => void;
  onAddPrinciple: (principle: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePhilosophyQuotes: (passiveQuote: string, activeQuote: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const NorthStarSection: React.FC<NorthStarSectionProps> = ({
  state,
  onUpdatePrinciple,
  onAddPrinciple,
  onUpdatePhilosophyQuotes,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [editingQuotes, setEditingQuotes] = useState(false);
  const [passiveDraft, setPassiveDraft] = useState(state.passiveAccumulationQuote);
  const [activeDraft, setActiveDraft] = useState(state.activeCapabilityQuote);

  const [editingPrincipleId, setEditingPrincipleId] = useState<string | null>(null);
  const [principleDraft, setPrincipleDraft] = useState<Principle | null>(null);

  const [showAddPrinciple, setShowAddPrinciple] = useState(false);
  const [newPrincipleCode, setNewPrincipleCode] = useState(`V.0${state.principles.length + 1}`);
  const [newPrincipleTitle, setNewPrincipleTitle] = useState('');
  const [newPrincipleDesc, setNewPrincipleDesc] = useState('');

  const [showGoalsDrawer, setShowGoalsDrawer] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalMetric, setNewGoalMetric] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('Engineering');
  const [newGoalHorizon, setNewGoalHorizon] = useState<Goal['horizon']>('Q4 2026');

  const getBadgeIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Terminal className="w-4 h-4 text-[#4edea3]" />;
      case 1:
        return <TrendingUp className="w-4 h-4 text-[#4cd7f6]" />;
      case 2:
        return <PiggyBank className="w-4 h-4 text-[#c0c1ff]" />;
      case 3:
        return <Network className="w-4 h-4 text-[#e2e2e8]" />;
      default:
        return <PenTool className="w-4 h-4 text-[#4edea3]" />;
    }
  };

  const handleSavePrinciple = () => {
    if (principleDraft && principleDraft.title.trim()) {
      onUpdatePrinciple({
        ...principleDraft,
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingPrincipleId(null);
    setPrincipleDraft(null);
  };

  const handleCreatePrinciple = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrincipleTitle.trim()) return;
    onAddPrinciple({
      code: newPrincipleCode.trim() || `V.${state.principles.length + 1}`,
      title: newPrincipleTitle.trim(),
      description: newPrincipleDesc.trim(),
      category: 'engineering',
      accent: 'primary',
    });
    setNewPrincipleTitle('');
    setNewPrincipleDesc('');
    setShowAddPrinciple(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    onAddGoal({
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      horizon: newGoalHorizon,
      targetMetric: newGoalMetric.trim() || '100% System Execution',
      progress: 0,
      status: 'ACTIVE',
    });
    setNewGoalTitle('');
    setNewGoalMetric('');
  };

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/75 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-5"
      id="north-star"
    >
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[12px] text-[#4edea3] font-bold">
            MODULE 01
          </span>
          <h2 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold">
            North Star &amp; Apex Philosophy
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGoalsDrawer(!showGoalsDrawer)}
            className="px-2.5 py-1 rounded bg-[#1e2024] hover:bg-[#282a2e] border border-[#4edea3]/30 font-mono text-[11px] text-[#4edea3] transition-colors cursor-pointer"
          >
            {showGoalsDrawer
              ? 'Hide Active Goals'
              : `Manage Goals (${state.goals.filter((g) => g.status === 'ACTIVE').length})`}
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#bbcabf]">Competence Horizon:</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#333539] text-[#4edea3]">
              Uncompromising Reality
            </span>
          </div>
        </div>
      </div>

      {/* 5 Competence Vector Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {state.competenceBadges.map((badge, idx) => (
          <div
            key={badge.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40"
          >
            {getBadgeIcon(idx)}
            <span className="font-mono text-[12px] text-[#e2e2e8]">{badge.role}</span>
            <span
              className={`font-mono text-[10px] font-bold tabular-nums ${
                badge.accent === 'secondary'
                  ? 'text-[#4cd7f6]'
                  : badge.accent === 'tertiary'
                  ? 'text-[#c0c1ff]'
                  : badge.accent === 'neutral'
                  ? 'text-[#e2e2e8]'
                  : 'text-[#4edea3]'
              }`}
            >
              {badge.allocationText}
            </span>
          </div>
        ))}
      </div>

      {/* High-Leverage vs Low-Leverage Contrast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Leverage / Red Card */}
        <div className="p-5 rounded-xl bg-[#93000a]/10 border border-[#ffb4ab]/30 flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Passive Accumulation (False Competence)
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#ffb4ab]/20 text-[#ffb4ab]">
                PROHIBITED
              </span>
            </div>
            {editingQuotes ? (
              <textarea
                rows={3}
                value={passiveDraft}
                onChange={(e) => setPassiveDraft(e.target.value)}
                className="mt-2 bg-[#0c0e12] border border-[#ffb4ab]/40 rounded p-2 text-sm text-[#e2e2e8]"
              />
            ) : (
              <p className="text-[15px] leading-[20px] text-[#e2e2e8] italic mt-2">
                {state.passiveAccumulationQuote}
              </p>
            )}
            <div className="text-[12px] leading-[18px] text-[#bbcabf] mt-2">
              Yields zero production resilience, fragile cognitive models, and illusory confidence that dissolves upon production fires.
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#ffb4ab]/20 flex items-center justify-between font-mono text-[10px] text-[#ffb4ab]">
            <span>Compounding Rate: 0.0x</span>
            <span>Cognitive Trap</span>
          </div>
        </div>

        {/* High Leverage / Green Card */}
        <div className="p-5 rounded-xl bg-[#4edea3]/10 border border-[#4edea3]/40 flex flex-col justify-between shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#4edea3] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Active Capability (True Competence)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (editingQuotes) {
                      onUpdatePhilosophyQuotes(passiveDraft, activeDraft);
                      setEditingQuotes(false);
                    } else {
                      setPassiveDraft(state.passiveAccumulationQuote);
                      setActiveDraft(state.activeCapabilityQuote);
                      setEditingQuotes(true);
                    }
                  }}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1e2024] border border-[#4edea3]/40 text-[#4edea3] hover:bg-[#4edea3]/20 cursor-pointer"
                >
                  {editingQuotes ? 'Save Quotes' : 'Edit Standard'}
                </button>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3]">
                  Apex Standard
                </span>
              </div>
            </div>
            {editingQuotes ? (
              <textarea
                rows={3}
                value={activeDraft}
                onChange={(e) => setActiveDraft(e.target.value)}
                className="mt-2 bg-[#0c0e12] border border-[#4edea3]/40 rounded p-2 text-sm text-[#e2e2e8]"
              />
            ) : (
              <p className="text-[15px] leading-[20px] text-[#e2e2e8] font-semibold mt-2">
                {state.activeCapabilityQuote}
              </p>
            )}
            <div className="text-[12px] leading-[18px] text-[#bbcabf] mt-2">
              {state.apexPhilosophySupporting}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#4edea3]/20 flex items-center justify-between font-mono text-[10px] text-[#4edea3]">
            <span>Compounding Rate: Exponential (1.01³⁶⁵)</span>
            <span>Skin in the Game</span>
          </div>
        </div>
      </div>

      {/* Collapsible Goals Management Panel */}
      {showGoalsDrawer && (
        <div
          id="goals"
          className="p-4 rounded-xl bg-[#0c0e12] border border-[#4edea3]/30 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#4edea3] uppercase font-bold">
              North Star Operational Goals &amp; Milestones
            </span>
            <span className="font-mono text-[10px] text-[#bbcabf]">
              Primary Principle: {state.northStarCorePrinciple}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {state.goals.map((goal) => (
              <div
                key={goal.id}
                className="p-3 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40 flex flex-col justify-between gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-[#4edea3] font-bold">{goal.category}</span>
                      <span className="text-[#86948a]">·</span>
                      <span className="text-[#4cd7f6]">{goal.horizon}</span>
                      <span className="text-[#86948a]">·</span>
                      <span
                        className={
                          goal.status === 'COMPLETED' ? 'text-[#4edea3]' : 'text-[#bbcabf]'
                        }
                      >
                        {goal.status}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold text-[#e2e2e8] mt-0.5">
                      {goal.title}
                    </div>
                    <div className="text-[11px] text-[#bbcabf] mt-0.5">
                      Target: {goal.targetMetric}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1 rounded text-[#86948a] hover:text-[#ffb4ab] cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={goal.progress}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onUpdateGoal({
                        ...goal,
                        progress: val,
                        status: val === 100 ? 'COMPLETED' : 'ACTIVE',
                        updatedAt: new Date().toISOString(),
                      });
                    }}
                    className="flex-1 accent-[#4edea3] cursor-pointer h-1.5 bg-[#0c0e12] rounded"
                  />
                  <span className="font-mono text-[11px] text-[#4edea3] font-bold tabular-nums w-10 text-right">
                    {goal.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Goal Form */}
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2 border-t border-[#3c4a42]/20">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="New North Star goal title..."
              className="sm:col-span-2 bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
            />
            <input
              type="text"
              value={newGoalMetric}
              onChange={(e) => setNewGoalMetric(e.target.value)}
              placeholder="Target verification metric..."
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
            />
            <select
              value={newGoalCategory}
              onChange={(e) => setNewGoalCategory(e.target.value as Goal['category'])}
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#e2e2e8]"
            >
              <option value="Engineering">Engineering</option>
              <option value="Commercial">Commercial</option>
              <option value="Financial">Financial</option>
              <option value="Cognitive">Cognitive</option>
              <option value="Physical">Physical</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold hover:bg-[#4edea3]/90 cursor-pointer"
            >
              + Add Goal
            </button>
          </form>
        </div>
      )}

      {/* 9 Core Personal Development Vectors Matrix Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
            The {state.principles.length} Core Personal Development Vectors (Click any vector to edit)
          </span>
          <button
            onClick={() => {
              setNewPrincipleCode(`V.0${state.principles.length + 1}`);
              setShowAddPrinciple(!showAddPrinciple);
            }}
            className="font-mono text-[10px] text-[#4edea3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Vector
          </button>
        </div>

        {showAddPrinciple && (
          <form
            onSubmit={handleCreatePrinciple}
            className="p-3 rounded-lg bg-[#0c0e12] border border-[#4edea3]/40 grid grid-cols-1 sm:grid-cols-5 gap-2"
          >
            <input
              type="text"
              value={newPrincipleCode}
              onChange={(e) => setNewPrincipleCode(e.target.value)}
              placeholder="Code (e.g. V.10)"
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#4edea3]"
            />
            <input
              type="text"
              value={newPrincipleTitle}
              onChange={(e) => setNewPrincipleTitle(e.target.value)}
              placeholder="Principle title..."
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
            />
            <input
              type="text"
              value={newPrincipleDesc}
              onChange={(e) => setNewPrincipleDesc(e.target.value)}
              placeholder="Operational description..."
              className="sm:col-span-2 bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold cursor-pointer"
            >
              Save Vector
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {state.principles.map((p) => {
            const isEditing = editingPrincipleId === p.id && principleDraft;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isEditing) {
                    setEditingPrincipleId(p.id);
                    setPrincipleDraft({ ...p });
                  }
                }}
                className="p-3 rounded bg-[#1e2024] border border-[#3c4a42]/30 hover:border-[#4edea3]/40 transition-colors flex items-start gap-3 cursor-pointer group"
              >
                <span
                  className={`font-mono text-[10px] font-bold tabular-nums pt-0.5 ${
                    p.accent === 'secondary'
                      ? 'text-[#4cd7f6]'
                      : p.accent === 'tertiary'
                      ? 'text-[#c0c1ff]'
                      : 'text-[#4edea3]'
                  }`}
                >
                  {p.code}
                </span>
                {isEditing ? (
                  <div
                    className="flex-1 flex flex-col gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={principleDraft.title}
                      onChange={(e) =>
                        setPrincipleDraft({ ...principleDraft, title: e.target.value })
                      }
                      className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs font-semibold text-[#e2e2e8]"
                    />
                    <input
                      type="text"
                      value={principleDraft.description}
                      onChange={(e) =>
                        setPrincipleDraft({
                          ...principleDraft,
                          description: e.target.value,
                        })
                      }
                      className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 text-[11px] text-[#bbcabf]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingPrincipleId(null)}
                        className="px-2 py-0.5 rounded bg-[#282a2e] text-[10px] font-mono text-[#bbcabf]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePrinciple}
                        className="px-2 py-0.5 rounded bg-[#4edea3] text-[10px] font-mono text-[#003824] font-bold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-[15px] leading-[20px] font-medium text-[#e2e2e8]">
                        {p.title}
                      </div>
                      <Edit3 className="w-3 h-3 text-[#bbcabf] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <div className="text-[12px] leading-[18px] text-[#bbcabf] mt-0.5">
                      {p.description}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
