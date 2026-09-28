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
  Target,
  Sparkles,
  ArrowUpRight,
  Zap,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Goal, NavigationSection, POSState, Principle, Project } from '../../models/types';

interface NorthStarSectionProps {
  state: POSState;
  onUpdatePrinciple: (principle: Principle) => void;
  onAddPrinciple: (principle: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePhilosophyQuotes: (passiveQuote: string, activeQuote: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onNavigateToSection?: (section: NavigationSection) => void;
}

export const NorthStarSection: React.FC<NorthStarSectionProps> = ({
  state,
  onUpdatePrinciple,
  onAddPrinciple,
  onUpdatePhilosophyQuotes,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onNavigateToSection,
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

  // Active Horizon Filter for Goals
  const [selectedHorizon, setSelectedHorizon] = useState<'Today' | 'Q4 2026' | '1-Year' | 'ALL'>('Today');

  // Add Goal Form State
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalMetric, setNewGoalMetric] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<Goal['category']>('Engineering');
  const [newGoalHorizon, setNewGoalHorizon] = useState<Goal['horizon']>('Today');
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>('PRJ-02');
  const [newGoalImpact, setNewGoalImpact] = useState('');

  // Editing existing goal state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalDraft, setGoalDraft] = useState<Goal | null>(null);

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

    const matchedProject = state.projects.find((p) => p.code === selectedProjectCode);

    onAddGoal({
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      horizon: newGoalHorizon,
      targetMetric: newGoalMetric.trim() || '100% Verification Metric Met',
      progress: 0,
      status: 'ACTIVE',
      linkedProjectCode: selectedProjectCode,
      linkedProjectName: matchedProject ? `${matchedProject.title} (${matchedProject.code})` : undefined,
      impactText: newGoalImpact.trim() || (matchedProject ? `Contributes directly to ${matchedProject.code}: ${matchedProject.title}` : undefined),
    });

    setNewGoalTitle('');
    setNewGoalMetric('');
    setNewGoalImpact('');
    setShowAddGoalForm(false);
  };

  const handleToggleGoalCompleted = (goal: Goal) => {
    const isCompleted = goal.status === 'COMPLETED' || goal.progress === 100;
    onUpdateGoal({
      ...goal,
      status: isCompleted ? 'ACTIVE' : 'COMPLETED',
      progress: isCompleted ? 50 : 100,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStartEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalDraft({ ...goal });
  };

  const handleSaveGoalDraft = () => {
    if (goalDraft && goalDraft.title.trim()) {
      onUpdateGoal({
        ...goalDraft,
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingGoalId(null);
    setGoalDraft(null);
  };

  // Helper to find Project from state
  const findProjectByCode = (code?: string): Project | undefined => {
    if (!code) return undefined;
    return state.projects.find((p) => p.code.toLowerCase() === code.toLowerCase());
  };

  // Filtered goals
  const todayGoals = state.goals.filter((g) => g.horizon === 'Today');
  const q4Goals = state.goals.filter((g) => g.horizon === 'Q4 2026');
  const y1Goals = state.goals.filter((g) => g.horizon === '1-Year');

  const visibleGoals = state.goals.filter((g) => {
    if (selectedHorizon === 'ALL') return true;
    return g.horizon === selectedHorizon;
  });

  const todayCompletedCount = todayGoals.filter((g) => g.status === 'COMPLETED' || g.progress === 100).length;
  const todayAverageProgress = todayGoals.length > 0
    ? Math.round(todayGoals.reduce((sum, g) => sum + g.progress, 0) / todayGoals.length)
    : 0;

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/75 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-6"
      id="north-star"
    >
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[12px] text-[#4edea3] font-bold">
            MODULE 01
          </span>
          <div>
            <h2 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold tracking-tight">
              North Star &amp; Apex Philosophy
            </h2>
            <p className="text-xs text-[#bbcabf] font-mono mt-0.5">
              The foundational governing vectors, daily execution targets, and uncompromising competence standard.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#bbcabf]">Autonomous Vector:</span>
          <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[#111318] border border-[#4edea3]/40 text-[#4edea3] font-bold">
            UNCOMPROMISING REALITY
          </span>
        </div>
      </div>

      {/* 5 Competence Vector Badges (Role & Allocation Weights) */}
      <div className="flex flex-wrap items-center gap-2">
        {state.competenceBadges.map((badge, idx) => (
          <div
            key={badge.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111318] border border-[#3c4a42]/40 shadow-sm"
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

      {/* ========================================================================= */}
      {/* SECTION: TODAY'S STRATEGIC GOALS & MILESTONE ADVANCEMENT DIRECTIVES       */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-[#111318] via-[#141a16] to-[#111318] border border-[#4edea3]/40 flex flex-col gap-4 shadow-[0_0_20px_rgba(78,222,163,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Top Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-2 border-b border-[#3c4a42]/30">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm sm:text-base font-bold text-[#e2e2e8] uppercase tracking-wide flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4edea3]" />
                  TODAY'S STRATEGIC DIRECTIVES // MILESTONE ADVANCEMENT
                </h3>
              </div>
              <p className="font-mono text-xs text-[#bbcabf] mt-0.5">
                High-leverage tasks executed today that advance the 5 Milestone Projects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Horizon Filter Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/40">
              <button
                onClick={() => setSelectedHorizon('Today')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedHorizon === 'Today'
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#e2e2e8]'
                }`}
              >
                <span>Today's Focus</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-bold">
                  {todayGoals.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedHorizon('Q4 2026')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedHorizon === 'Q4 2026'
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#e2e2e8]'
                }`}
              >
                <span>Q4 2026</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-bold">
                  {q4Goals.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedHorizon('1-Year')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedHorizon === '1-Year'
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#e2e2e8]'
                }`}
              >
                <span>1-Year</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-bold">
                  {y1Goals.length}
                </span>
              </button>
              <button
                onClick={() => setSelectedHorizon('ALL')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedHorizon === 'ALL'
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#e2e2e8]'
                }`}
              >
                All ({state.goals.length})
              </button>
            </div>

            {/* Add Goal Trigger */}
            <button
              onClick={() => setShowAddGoalForm(!showAddGoalForm)}
              className="px-2.5 py-1 rounded-lg bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/40 text-[#4edea3] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Bar for Today */}
        {selectedHorizon === 'Today' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs relative z-10">
            <div className="p-2.5 rounded-lg bg-[#0c0e12]/80 border border-[#3c4a42]/30 flex flex-col justify-between">
              <span className="text-[10px] text-[#bbcabf] uppercase">Daily Objectives</span>
              <span className="text-base font-bold text-[#e2e2e8]">{todayGoals.length} Active</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c0e12]/80 border border-[#3c4a42]/30 flex flex-col justify-between">
              <span className="text-[10px] text-[#bbcabf] uppercase">Completed Today</span>
              <span className="text-base font-bold text-[#4edea3]">{todayCompletedCount} of {todayGoals.length}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c0e12]/80 border border-[#3c4a42]/30 flex flex-col justify-between">
              <span className="text-[10px] text-[#bbcabf] uppercase">Daily Progress</span>
              <span className="text-base font-bold text-[#4cd7f6]">{todayAverageProgress}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0c0e12]/80 border border-[#3c4a42]/30 flex flex-col justify-between">
              <span className="text-[10px] text-[#bbcabf] uppercase">Milestone Linkage</span>
              <span className="text-base font-bold text-[#c0c1ff]">100% Bound</span>
            </div>
          </div>
        )}

        {/* Inline Add Goal Form */}
        {showAddGoalForm && (
          <form
            onSubmit={handleCreateGoal}
            className="p-4 rounded-xl bg-[#0c0e12] border border-[#4edea3]/50 flex flex-col gap-3 relative z-10 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#3c4a42]/30">
              <span className="font-mono text-xs font-bold text-[#4edea3] uppercase flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                CREATE NEW STRATEGIC DIRECTIVE
              </span>
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="text-[#bbcabf] hover:text-[#e2e2e8] text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[#bbcabf] mb-1">Goal / Directive Title</label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Complete architecture for Finance Management app..."
                  className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div>
                <label className="block text-[#bbcabf] mb-1">Horizon Target</label>
                <select
                  value={newGoalHorizon}
                  onChange={(e) => setNewGoalHorizon(e.target.value as Goal['horizon'])}
                  className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8]"
                >
                  <option value="Today">Today (Daily Focus)</option>
                  <option value="Q4 2026">Q4 2026 (Quarter)</option>
                  <option value="1-Year">1-Year (Annual Vector)</option>
                  <option value="3-Year">3-Year (Distributed Systems)</option>
                  <option value="10-Year">10-Year (Apex Autonomy)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#bbcabf] mb-1">Domain Category</label>
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value as Goal['category'])}
                  className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8]"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Financial">Financial</option>
                  <option value="Cognitive">Cognitive</option>
                  <option value="Physical">Physical</option>
                </select>
              </div>

              <div>
                <label className="block text-[#bbcabf] mb-1">Contributes to Milestone Project</label>
                <select
                  value={selectedProjectCode}
                  onChange={(e) => setSelectedProjectCode(e.target.value)}
                  className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded px-3 py-1.5 font-mono text-xs text-[#4edea3]"
                >
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#bbcabf] mb-1">Target Verification Metric</label>
                <input
                  type="text"
                  required
                  value={newGoalMetric}
                  onChange={(e) => setNewGoalMetric(e.target.value)}
                  placeholder="e.g. Postgres schema + Ledger API spec completed"
                  className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#bbcabf] mb-1 font-mono text-xs">
                Milestone Impact & Strategic Contribution
              </label>
              <input
                type="text"
                value={newGoalImpact}
                onChange={(e) => setNewGoalImpact(e.target.value)}
                placeholder="e.g. Contributes to Milestone Project 02: Multi-Tenant Architecture & Financial Ledger"
                className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xs text-[#e2e2e8] font-mono focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3c4a42]/20">
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="px-3 py-1.5 rounded bg-[#1e2024] text-[#bbcabf] font-mono text-xs cursor-pointer hover:text-[#e2e2e8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold hover:bg-[#4edea3]/90 cursor-pointer shadow-sm"
              >
                Save Directive
              </button>
            </div>
          </form>
        )}

        {/* Goals Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
          {visibleGoals.map((goal) => {
            const isEditing = editingGoalId === goal.id && goalDraft;
            const isCompleted = goal.status === 'COMPLETED' || goal.progress === 100;
            const linkedProject = findProjectByCode(goal.linkedProjectCode);

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all group relative overflow-hidden ${
                  isCompleted
                    ? 'bg-[#121c17]/90 border-[#4edea3]/60 shadow-[0_0_12px_rgba(78,222,163,0.12)]'
                    : 'bg-[#181a1e]/95 border-[#3c4a42]/40 hover:border-[#4edea3]/40 hover:bg-[#1a1c20]'
                }`}
              >
                {/* Header: Horizon, Category, & Quick Complete Checkbox */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleGoalCompleted(goal)}
                        className="text-[#4edea3] hover:scale-110 transition-transform cursor-pointer"
                        title={isCompleted ? 'Mark In Progress' : 'Mark Completed'}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-[#4edea3]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#bbcabf] hover:text-[#4edea3]" />
                        )}
                      </button>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          goal.horizon === 'Today'
                            ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                            : goal.horizon === 'Q4 2026'
                            ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                            : 'bg-[#c0c1ff]/20 text-[#c0c1ff] border border-[#c0c1ff]/40'
                        }`}
                      >
                        {goal.horizon}
                      </span>
                      <span className="font-mono text-[10px] text-[#bbcabf] px-1.5 py-0.5 rounded bg-[#111318]">
                        {goal.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditGoal(goal)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#4edea3] transition-opacity cursor-pointer"
                        title="Edit Goal"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#ffb4ab] transition-opacity cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Goal Title */}
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={goalDraft.title}
                        onChange={(e) => setGoalDraft({ ...goalDraft, title: e.target.value })}
                        className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs text-[#e2e2e8]"
                      />
                      <input
                        type="text"
                        value={goalDraft.targetMetric}
                        onChange={(e) => setGoalDraft({ ...goalDraft, targetMetric: e.target.value })}
                        placeholder="Target Metric..."
                        className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 text-[11px] text-[#4edea3]"
                      />
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => setEditingGoalId(null)}
                          className="px-2 py-1 rounded bg-[#282a2e] text-[#bbcabf] font-mono text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveGoalDraft}
                          className="px-2.5 py-1 rounded bg-[#4edea3] text-[#003824] font-mono text-[10px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4
                        className={`text-sm sm:text-[14px] font-bold font-mono tracking-tight ${
                          isCompleted ? 'text-[#4edea3] line-through opacity-85' : 'text-[#e2e2e8]'
                        }`}
                      >
                        {goal.title}
                      </h4>
                      <div className="text-[11px] font-mono text-[#bbcabf] mt-1.5 flex items-start gap-1">
                        <span className="text-[#4edea3] font-bold">Target:</span>
                        <span>{goal.targetMetric}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Milestone Project Contribution Badge */}
                <div className="mt-3 pt-2.5 border-t border-[#3c4a42]/20 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono bg-[#0c0e12] p-2 rounded border border-[#3c4a42]/30">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3 h-3 text-[#4cd7f6] shrink-0" />
                      <span className="text-[#e2e2e8] truncate text-[11px]">
                        {goal.impactText || (linkedProject ? `Contributes to ${linkedProject.code}` : 'Milestone Advancement')}
                      </span>
                    </div>

                    {goal.linkedProjectCode && (
                      <button
                        onClick={() => onNavigateToSection?.('milestone-projects')}
                        className="inline-flex items-center gap-0.5 text-[10px] text-[#4edea3] hover:underline cursor-pointer shrink-0 ml-1 font-bold"
                        title="View Milestone Project in Module 04"
                      >
                        <span>{goal.linkedProjectCode}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Interactive Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center font-mono text-[10px] text-[#bbcabf]">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#4edea3]" />
                        <span>Execution Progress</span>
                      </span>
                      <span className="text-[#4edea3] font-bold tabular-nums">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden border border-[#3c4a42]/30">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-[#4edea3]' : 'bg-gradient-to-r from-[#4cd7f6] to-[#4edea3]'
                        }`}
                        style={{ width: `${Math.max(2, goal.progress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
                      className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-0.5 text-xs font-bold text-[#e2e2e8]"
                    />
                    <textarea
                      rows={2}
                      value={principleDraft.description}
                      onChange={(e) =>
                        setPrincipleDraft({
                          ...principleDraft,
                          description: e.target.value,
                        })
                      }
                      className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-0.5 text-[11px] text-[#bbcabf]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPrincipleId(null);
                          setPrincipleDraft(null);
                        }}
                        className="px-2 py-0.5 rounded bg-[#282a2e] text-[#bbcabf] font-mono text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePrinciple}
                        className="px-2.5 py-0.5 rounded bg-[#4edea3] text-[#003824] font-mono text-[10px] font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#e2e2e8] group-hover:text-[#4edea3] transition-colors">
                      {p.title}
                    </div>
                    <div className="text-[11px] leading-[16px] text-[#bbcabf] mt-1">
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
