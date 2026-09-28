import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Cpu,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Target,
  Sparkles,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Flag,
  Radio,
} from 'lucide-react';
import {
  Goal,
  HorizonMetric,
  NavigationSection,
  POSState,
  Project,
  RoadmapItem,
} from '../../models/types';

interface HorizonSectionProps {
  state: POSState;
  onUpdateHorizonMetric: (metric: HorizonMetric) => void;
  onUpdateHorizonText: (title: string, subtitle: string) => void;
  onSelectCreedStage: (stageId: string) => void;
  onUpdateRoadmapItem: (itemId: string, updates: Partial<RoadmapItem>) => void;
  onAddRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'updatedAt'>) => void;
  onDeleteRoadmapItem: (itemId: string) => void;
  onUpdateGoal?: (goal: Goal) => void;
  onNavigateToSection?: (section: NavigationSection) => void;
}

export const HorizonSection: React.FC<HorizonSectionProps> = ({
  state,
  onUpdateHorizonMetric,
  onUpdateHorizonText,
  onSelectCreedStage,
  onUpdateRoadmapItem,
  onAddRoadmapItem,
  onDeleteRoadmapItem,
  onUpdateGoal,
  onNavigateToSection,
}) => {
  // Manifesto state
  const [editingHeader, setEditingHeader] = useState(false);
  const [titleDraft, setTitleDraft] = useState(state.horizonTitle);
  const [subtitleDraft, setSubtitleDraft] = useState(state.horizonSubtitle);

  // Metric edit state
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [metricDraft, setMetricDraft] = useState<HorizonMetric | null>(null);

  // Roadmap Phase Modal / Form state
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [phaseForm, setPhaseForm] = useState({
    yearPhase: '',
    badge: 'Expansion',
    title: '',
    description: '',
    targetText: '',
    linkedProjectName: '',
    accent: 'primary' as 'primary' | 'secondary' | 'tertiary',
    isApex: false,
  });

  // Filter / Focus state for timeline stepper
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string | 'ALL'>('ALL');
  const [goalHorizonFilter, setGoalHorizonFilter] = useState<'ALL' | '10-Year' | '3-Year'>('ALL');

  // Days Calculation (Start: Sept 25, 2026; Horizon: 10 Years = 3,652 Days)
  const startDate = new Date('2026-09-25T00:00:00Z');
  const currentDate = new Date();
  const diffTime = Math.max(0, currentDate.getTime() - startDate.getTime());
  const daysElapsed = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const totalHorizonDays = 3652;
  const elapsedPercentage = Math.min(100, Number(((daysElapsed / totalHorizonDays) * 100).toFixed(2)));

  const startEditMetric = (m: HorizonMetric) => {
    setEditingMetricId(m.id);
    setMetricDraft({ ...m });
  };

  const saveMetric = () => {
    if (metricDraft) {
      onUpdateHorizonMetric({
        ...metricDraft,
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingMetricId(null);
    setMetricDraft(null);
  };

  const saveHeader = () => {
    if (titleDraft.trim()) {
      onUpdateHorizonText(titleDraft.trim(), subtitleDraft.trim());
    }
    setEditingHeader(false);
  };

  const openAddPhaseModal = () => {
    setPhaseForm({
      yearPhase: '2028 // PHASE 3',
      badge: 'Architecture',
      title: '',
      description: '',
      targetText: 'Target: ',
      linkedProjectName: 'Milestone Project',
      accent: 'secondary',
      isApex: false,
    });
    setEditingPhaseId(null);
    setIsAddingPhase(true);
  };

  const startEditPhase = (item: RoadmapItem) => {
    setPhaseForm({
      yearPhase: item.yearPhase,
      badge: item.badge,
      title: item.title,
      description: item.description,
      targetText: item.targetText,
      linkedProjectName: item.linkedProjectName,
      accent: item.accent,
      isApex: !!item.isApex,
    });
    setEditingPhaseId(item.id);
    setIsAddingPhase(true);
  };

  const handleSavePhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phaseForm.title.trim() || !phaseForm.yearPhase.trim()) return;

    if (editingPhaseId) {
      onUpdateRoadmapItem(editingPhaseId, {
        yearPhase: phaseForm.yearPhase.trim(),
        badge: phaseForm.badge.trim(),
        title: phaseForm.title.trim(),
        description: phaseForm.description.trim(),
        targetText: phaseForm.targetText.trim(),
        linkedProjectName: phaseForm.linkedProjectName.trim(),
        accent: phaseForm.accent,
        isApex: phaseForm.isApex,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddRoadmapItem({
        yearPhase: phaseForm.yearPhase.trim(),
        badge: phaseForm.badge.trim(),
        title: phaseForm.title.trim(),
        description: phaseForm.description.trim(),
        targetText: phaseForm.targetText.trim(),
        linkedProjectName: phaseForm.linkedProjectName.trim(),
        accent: phaseForm.accent,
        isApex: phaseForm.isApex,
      });
    }

    setIsAddingPhase(false);
    setEditingPhaseId(null);
  };

  // Helper to find matched Project from state
  const findLinkedProject = (projectName: string): Project | undefined => {
    return state.projects.find(
      (p) =>
        projectName.toLowerCase().includes(p.title.toLowerCase()) ||
        projectName.toLowerCase().includes(p.code.toLowerCase()) ||
        p.title.toLowerCase().includes(projectName.toLowerCase())
    );
  };

  // Long-Horizon Goals filter (3-Year and 10-Year)
  const longHorizonGoals = state.goals.filter((g) => {
    if (goalHorizonFilter === 'ALL') {
      return g.horizon === '10-Year' || g.horizon === '3-Year';
    }
    return g.horizon === goalHorizonFilter;
  });

  const creedStageDescriptions: Record<string, string> = {
    learn: 'Encode first-principles concepts from primary technical sources without AI crutches.',
    understand: 'Derive why the mechanism works and articulate its failure boundary conditions.',
    apply: 'Execute canonical problem implementations in an isolated code sandbox.',
    build: 'Architect and write production-grade systems solving real bottlenecks.',
    ship: 'Pass all 14 Definition of Done gates and deploy to live commercial infrastructure.',
    sell: 'Run the 7-Step Commercial Experiment Loop and convert capability into revenue.',
    measure: 'Audit telemetry, latency, retention, and Free Cash Flow unit economics.',
    improve: 'Refactor bottlenecks, eliminate technical debt, and harden system resilience.',
    compound: 'Reinvest 100% surplus FCF and cognitive heuristics into the 10-year trajectory.',
  };

  const filteredRoadmap = state.roadmap.filter((item) => {
    if (selectedPhaseFilter === 'ALL') return true;
    return item.id === selectedPhaseFilter;
  });

  return (
    <section className="flex flex-col gap-6" id="horizon-flight-plan">
      {/* Top Terminal Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[#bbcabf] border-b border-[#3c4a42]/30 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#4edea3] font-bold">POS://MOD_08</span>
          <span>/</span>
          <span className="text-[#e2e2e8] uppercase font-semibold">10-Year Horizon Flight Plan (2026–2036)</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-[#4cd7f6]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>VECTOR ACTIVE // 10-YEAR HORIZON</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#4edea3]">
            <Clock className="w-3.5 h-3.5" />
            <span>DAY {daysElapsed} OF {totalHorizonDays} ({elapsedPercentage}%)</span>
          </span>
        </div>
      </div>

      {/* Hero Manifesto & Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-[#111318] p-5 rounded-xl border border-[#3c4a42]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 max-w-4xl relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 w-max">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-widest">
              Autonomous Capability & Commercial Architecture
            </span>
          </div>

          {editingHeader ? (
            <div className="flex flex-col gap-2 mt-1 bg-[#1a1c20] p-4 rounded-lg border border-[#4edea3]/40">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-2 text-xl font-bold text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                placeholder="Manifesto Title"
              />
              <textarea
                rows={2}
                value={subtitleDraft}
                onChange={(e) => setSubtitleDraft(e.target.value)}
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-2 text-sm text-[#bbcabf] focus:outline-none focus:border-[#4edea3]"
                placeholder="Manifesto Subtitle"
              />
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  onClick={() => setEditingHeader(false)}
                  className="px-3 py-1.5 rounded bg-[#282a2e] text-[#bbcabf] font-mono text-xs flex items-center gap-1.5 cursor-pointer hover:text-[#e2e2e8]"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  onClick={saveHeader}
                  className="px-3.5 py-1.5 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#4edea3]/90"
                >
                  <Check className="w-3.5 h-3.5" /> Save Manifesto
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl text-[#e2e2e8] font-bold tracking-tight">
                  {state.horizonTitle}
                </h1>
                <button
                  onClick={() => {
                    setTitleDraft(state.horizonTitle);
                    setSubtitleDraft(state.horizonSubtitle);
                    setEditingHeader(true);
                  }}
                  className="opacity-70 group-hover:opacity-100 p-1.5 rounded bg-[#1e2024] border border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#4edea3] transition-all cursor-pointer"
                  title="Edit Horizon Manifesto Title & Subtitle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-[#bbcabf] mt-1.5">
                {state.horizonSubtitle}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={openAddPhaseModal}
            className="px-3.5 py-2 rounded-lg bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>ADD HORIZON PHASE</span>
          </button>
        </div>
      </div>

      {/* Dynamic Chronological HUD Gauges (4 Core Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Time Horizon Progress */}
        <div className="p-4 rounded-xl bg-[#1a1c20]/90 border border-[#3c4a42]/30 flex flex-col justify-between hover:border-[#4edea3]/40 transition-all">
          <div className="flex items-center justify-between text-[#bbcabf] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#4cd7f6]">
              Temporal Vector
            </span>
            <Calendar className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-bold text-[#e2e2e8] font-mono tabular-nums">
              DAY {daysElapsed} <span className="text-xs text-[#bbcabf] font-normal">/ {totalHorizonDays}</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-[#111318] h-2 rounded-full mt-2 overflow-hidden border border-[#3c4a42]/30">
              <div
                className="bg-gradient-to-r from-[#4cd7f6] to-[#4edea3] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, elapsedPercentage)}%` }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-[10px] text-[#bbcabf]">
            <span>Horizon: 2026 – 2036</span>
            <span className="text-[#4edea3] font-bold">{elapsedPercentage}% Completed</span>
          </div>
        </div>

        {/* Card 2: Current Active Phase */}
        <div className="p-4 rounded-xl bg-[#1a1c20]/90 border border-[#3c4a42]/30 flex flex-col justify-between hover:border-[#4edea3]/40 transition-all">
          <div className="flex items-center justify-between text-[#bbcabf] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#4edea3]">
              Active Flight Phase
            </span>
            <Flag className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="my-1">
            <div className="text-lg sm:text-xl font-bold text-[#e2e2e8] font-mono truncate">
              PHASE 1 (2026)
            </div>
            <div className="text-xs text-[#4edea3] font-mono mt-0.5">
              Systems & Personal Tooling
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-[10px] text-[#bbcabf]">
            <span>Target Gate</span>
            <span className="text-[#e2e2e8] font-semibold">PRJ-01 & PRJ-02 Live</span>
          </div>
        </div>

        {/* Card 3: Commercial ARR Trajectory */}
        <div className="p-4 rounded-xl bg-[#1a1c20]/90 border border-[#3c4a42]/30 flex flex-col justify-between hover:border-[#4edea3]/40 transition-all">
          <div className="flex items-center justify-between text-[#bbcabf] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#c0c1ff]">
              Financial Velocity Curve
            </span>
            <TrendingUp className="w-4 h-4 text-[#c0c1ff]" />
          </div>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-bold text-[#e2e2e8] font-mono">
              R0 <span className="text-xs text-[#4edea3]">➔ R10k/mo</span>
            </div>
            <div className="text-[11px] text-[#bbcabf] font-mono mt-0.5">
              Phase 1 Floor ➔ Phase 2 Run-Rate
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-[10px] text-[#bbcabf]">
            <span>Decade Peak</span>
            <span className="text-[#c0c1ff] font-bold">R100k+/mo Net FCF</span>
          </div>
        </div>

        {/* Card 4: Autonomous Systems & Leverage */}
        <div className="p-4 rounded-xl bg-[#1a1c20]/90 border border-[#3c4a42]/30 flex flex-col justify-between hover:border-[#4edea3]/40 transition-all">
          <div className="flex items-center justify-between text-[#bbcabf] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#c9a227]">
              Sovereign Leverage
            </span>
            <Cpu className="w-4 h-4 text-[#c9a227]" />
          </div>
          <div className="my-1">
            <div className="text-xl sm:text-2xl font-bold text-[#e2e2e8] font-mono">
              {state.projects.filter((p) => p.status === 'IN PROGRESS' || p.status === 'COMPLETED').length} Active
            </div>
            <div className="text-[11px] text-[#bbcabf] font-mono mt-0.5">
              14 DoD Gates Enforced
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-[10px] text-[#bbcabf]">
            <span>Apex Directive</span>
            <span className="text-[#c9a227] font-bold">Self-Sustaining Equity</span>
          </div>
        </div>
      </div>

      {/* Chronological Trajectory Stepper (Phase Timeline Scrubber) */}
      <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4edea3]" />
            <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase">
              10-YEAR CHRONOLOGICAL TRAJECTORY (2026 — 2036)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedPhaseFilter('ALL')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] cursor-pointer transition-colors ${
                selectedPhaseFilter === 'ALL'
                  ? 'bg-[#4edea3] text-[#003822] font-bold'
                  : 'bg-[#1a1c20] text-[#bbcabf] hover:text-[#e2e2e8]'
              }`}
            >
              All Phases ({state.roadmap.length})
            </button>
          </div>
        </div>

        {/* Visual Stepper Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {state.roadmap.map((item, idx) => {
            const isSelected = selectedPhaseFilter === item.id;
            const isCurrent = idx === 0; // Phase 1 is the 2026 active vector
            return (
              <button
                key={item.id}
                onClick={() => setSelectedPhaseFilter(isSelected ? 'ALL' : item.id)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1a1c20] border-[#4edea3] shadow-[0_0_12px_rgba(78,222,163,0.15)]'
                    : isCurrent
                    ? 'bg-[#1a1c20]/80 border-[#4edea3]/60 hover:border-[#4edea3]'
                    : 'bg-[#111318] border-[#3c4a42]/40 hover:border-[#4cd7f6]/50'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4edea3]" />
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                    <span className={isCurrent ? 'text-[#4edea3] font-bold' : item.isApex ? 'text-[#c9a227] font-bold' : 'text-[#4cd7f6]'}>
                      {item.yearPhase.split('//')[0]?.trim()}
                    </span>
                    <span className="text-[#bbcabf] font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-[#0c0e12]">
                      {item.badge}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#e2e2e8] truncate group-hover:text-[#4edea3] transition-colors">
                    {item.title}
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-[#3c4a42]/20 font-mono text-[9px] text-[#bbcabf] flex items-center justify-between">
                  <span>{isCurrent ? 'ACTIVE' : item.isApex ? 'APEX' : 'QUEUED'}</span>
                  <ChevronRight className="w-3 h-3 text-[#bbcabf] group-hover:text-[#4edea3] transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Roadmap Phase Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#4edea3]" />
            <h2 className="font-mono text-sm font-bold text-[#e2e2e8] uppercase">
              Phase Flight Vectors ({filteredRoadmap.length} {filteredRoadmap.length === 1 ? 'Phase' : 'Phases'})
            </h2>
          </div>
          {selectedPhaseFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedPhaseFilter('ALL')}
              className="font-mono text-xs text-[#4edea3] hover:underline cursor-pointer"
            >
              Reset to view all 6 phases ➔
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoadmap.map((item, index) => {
            const isFirst = index === 0;
            const linkedPrj = findLinkedProject(item.linkedProjectName);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all group relative overflow-hidden ${
                  item.isApex
                    ? 'bg-gradient-to-br from-[#1a1c20] to-[#1e1a12] border-[#c9a227]/50 shadow-[0_0_15px_rgba(201,162,39,0.1)]'
                    : isFirst
                    ? 'bg-gradient-to-br from-[#1a1c20] to-[#121c17] border-[#4edea3]/50 shadow-[0_0_15px_rgba(78,222,163,0.08)]'
                    : 'bg-[#1a1c20] border-[#3c4a42]/30 hover:border-[#4cd7f6]/40'
                }`}
              >
                {/* Header: Phase & Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          item.isApex
                            ? 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/40'
                            : isFirst
                            ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                            : 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                        }`}
                      >
                        {item.yearPhase}
                      </span>
                      {isFirst && (
                        <span className="font-mono text-[10px] text-[#4edea3] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                          ACTIVE NOW
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#111318] text-[#bbcabf] border border-[#3c4a42]/30 uppercase font-semibold">
                        {item.badge}
                      </span>
                      <button
                        onClick={() => startEditPhase(item)}
                        className="opacity-60 group-hover:opacity-100 p-1.5 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#4edea3] transition-all cursor-pointer"
                        title="Edit Horizon Phase"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete horizon phase "${item.title}"?`)) {
                            onDeleteRoadmapItem(item.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#ffb4ab] transition-all cursor-pointer"
                        title="Delete Phase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#e2e2e8] group-hover:text-[#4edea3] transition-colors font-mono">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#bbcabf] leading-relaxed mt-1.5 font-mono">
                    {item.description}
                  </p>
                </div>

                {/* Footer: Target Deliverable & Linked Project */}
                <div className="mt-4 pt-3 border-t border-[#3c4a42]/20 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#bbcabf]">Deliverable:</span>
                    <span className="text-[#4edea3] font-bold">{item.targetText}</span>
                  </div>

                  {/* Linked Project Badge / Deep Link */}
                  <div className="flex items-center justify-between text-xs font-mono bg-[#111318] p-2 rounded border border-[#3c4a42]/30">
                    <div className="flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
                      <span className="text-[#e2e2e8] truncate">{item.linkedProjectName}</span>
                    </div>

                    {linkedPrj ? (
                      <button
                        onClick={() => onNavigateToSection?.('milestone-projects')}
                        className="inline-flex items-center gap-1 text-[11px] text-[#4edea3] hover:underline cursor-pointer shrink-0 ml-2"
                        title={`View ${linkedPrj.code} in Module 04`}
                      >
                        <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/10 font-bold border border-[#4edea3]/30">
                          {linkedPrj.status}
                        </span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#bbcabf] px-1.5 py-0.5 rounded bg-[#1e2024]">
                        PLANNED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decade Horizon Goals Alignment Section (3-Year & 10-Year Goals) */}
      <div className="p-5 rounded-xl bg-[#111318] border border-[#3c4a42]/40 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#3c4a42]/30">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#c0c1ff]" />
            <div>
              <h3 className="font-mono text-sm font-bold text-[#e2e2e8] uppercase">
                STRATEGIC DECADE GOALS ALIGNMENT (3-YEAR & 10-YEAR VECTORS)
              </h3>
              <p className="font-mono text-xs text-[#bbcabf]">
                Directives that roll up daily execution into decade-level sovereign freedom.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', '3-Year', '10-Year'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setGoalHorizonFilter(filter)}
                className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer transition-colors ${
                  goalHorizonFilter === filter
                    ? 'bg-[#c0c1ff] text-[#121324] font-bold'
                    : 'bg-[#1a1c20] text-[#bbcabf] hover:text-[#e2e2e8]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {longHorizonGoals.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs text-[#bbcabf] bg-[#0c0e12] rounded-lg">
            No long-horizon goals found for current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {longHorizonGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-3.5 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-2 hover:border-[#c0c1ff]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/30 font-bold uppercase">
                    {goal.horizon}
                  </span>
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase">
                    {goal.category}
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-[#e2e2e8]">
                  {goal.title}
                </div>
                <div className="font-mono text-[11px] text-[#bbcabf]">
                  Target: <span className="text-[#4edea3] font-semibold">{goal.targetMetric}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between font-mono text-[10px] text-[#bbcabf]">
                    <span>Progress</span>
                    <span className="text-[#4edea3] font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-[#0c0e12] h-1.5 rounded-full overflow-hidden border border-[#3c4a42]/30">
                    <div
                      className="bg-[#c0c1ff] h-full rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={() => onNavigateToSection?.('north-star')}
            className="font-mono text-xs text-[#4edea3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage all Directives & Goals in Module 01 (North Star)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compounding Creed (9-Stage Recursive Execution Cycle) */}
      <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-[#bbcabf] uppercase tracking-wider font-semibold">
            The Compounding Creed // 9-Stage Recursive Loop
          </span>
          <span className="font-mono text-[10px] text-[#4edea3] font-bold bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
            CONTINUOUS REINVESTMENT
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs py-1">
          {state.creedStages.map((stage, idx) => {
            const isSelected = state.activeCreedStageId === stage.id;
            const isCompound = stage.id === 'compound';
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => onSelectCreedStage(stage.id)}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer whitespace-nowrap text-xs ${
                    isCompound
                      ? 'bg-[#4edea3]/20 border border-[#4edea3] text-[#4edea3] font-bold shadow-[0_0_8px_rgba(78,222,163,0.3)]'
                      : isSelected || stage.highlight
                      ? 'bg-[#1e2024] border border-[#4edea3]/60 text-[#4edea3] font-bold hover:bg-[#4edea3]/10'
                      : 'bg-[#1e2024] border border-[#3c4a42]/40 text-[#e2e2e8] hover:border-[#4cd7f6]'
                  }`}
                >
                  {stage.label}
                </button>
                {idx < state.creedStages.length - 1 && (
                  <span className="text-[#3c4a42] select-none text-xs">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {state.activeCreedStageId && (
          <div className="pt-2 border-t border-[#3c4a42]/20 flex items-center justify-between text-xs text-[#bbcabf] font-mono">
            <span>
              <strong className="text-[#4edea3] uppercase mr-2 font-bold">
                [{state.activeCreedStageId}]:
              </strong>
              {creedStageDescriptions[state.activeCreedStageId]}
            </span>
          </div>
        )}
      </div>

      {/* Add / Edit Phase Modal Dialog */}
      {isAddingPhase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111318] border border-[#3c4a42]/60 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3c4a42]/40 pb-3">
              <h3 className="font-mono text-sm font-bold text-[#e2e2e8] uppercase flex items-center gap-2">
                <Target className="w-4 h-4 text-[#4edea3]" />
                {editingPhaseId ? 'Edit Horizon Flight Phase' : 'Add New Horizon Flight Phase'}
              </h3>
              <button
                onClick={() => setIsAddingPhase(false)}
                className="text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhase} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#bbcabf] mb-1">Year & Phase Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2028 // PHASE 3"
                    value={phaseForm.yearPhase}
                    onChange={(e) => setPhaseForm({ ...phaseForm, yearPhase: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#bbcabf] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Expansion"
                    value={phaseForm.badge}
                    onChange={(e) => setPhaseForm({ ...phaseForm, badge: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#bbcabf] mb-1">Phase Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Architecture & Clusters"
                  value={phaseForm.title}
                  onChange={(e) => setPhaseForm({ ...phaseForm, title: e.target.value })}
                  className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#bbcabf] mb-1">Description & Strategic Intent</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the engineering posture, commercial floor, and leverage goals..."
                  value={phaseForm.description}
                  onChange={(e) => setPhaseForm({ ...phaseForm, description: e.target.value })}
                  className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#bbcabf] mb-1">Deliverable Target</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Target: Project 03 Shipped"
                    value={phaseForm.targetText}
                    onChange={(e) => setPhaseForm({ ...phaseForm, targetText: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#bbcabf] mb-1">Linked Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Project 03 Full-Stack SaaS"
                    value={phaseForm.linkedProjectName}
                    onChange={(e) => setPhaseForm({ ...phaseForm, linkedProjectName: e.target.value })}
                    className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isApexCheck"
                  checked={phaseForm.isApex}
                  onChange={(e) => setPhaseForm({ ...phaseForm, isApex: e.target.checked })}
                  className="accent-[#4edea3] rounded"
                />
                <label htmlFor="isApexCheck" className="text-[#bbcabf] text-xs">
                  Mark as APEX Horizon Milestone (2036 Sovereign Autonomy)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#3c4a42]/40">
                <button
                  type="button"
                  onClick={() => setIsAddingPhase(false)}
                  className="px-3 py-1.5 rounded bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#4edea3] text-[#003822] font-bold hover:bg-[#4edea3]/90 cursor-pointer"
                >
                  {editingPhaseId ? 'Update Phase' : 'Create Phase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
