import React, { useState } from 'react';
import {
  Radio,
  Clock,
  Calendar,
  TrendingUp,
  Code2,
  Cpu,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { DashboardViewMode, HorizonMetric, POSState } from '../../models/types';

interface HorizonSectionProps {
  state: POSState;
  viewMode: DashboardViewMode;
  onChangeViewMode: (mode: DashboardViewMode) => void;
  onUpdateHorizonMetric: (metric: HorizonMetric) => void;
  onUpdateHorizonText: (title: string, subtitle: string) => void;
  onSelectCreedStage: (stageId: string) => void;
}

export const HorizonSection: React.FC<HorizonSectionProps> = ({
  state,
  viewMode,
  onChangeViewMode,
  onUpdateHorizonMetric,
  onUpdateHorizonText,
  onSelectCreedStage,
}) => {
  const [editingHeader, setEditingHeader] = useState(false);
  const [titleDraft, setTitleDraft] = useState(state.horizonTitle);
  const [subtitleDraft, setSubtitleDraft] = useState(state.horizonSubtitle);

  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [metricDraft, setMetricDraft] = useState<HorizonMetric | null>(null);

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

  const getMetricIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Calendar className="w-4 h-4 text-[#4cd7f6]" />;
      case 1:
        return <TrendingUp className="w-4 h-4 text-[#4edea3]" />;
      case 2:
        return <Code2 className="w-4 h-4 text-[#c0c1ff]" />;
      default:
        return <Cpu className="w-4 h-4 text-[#4edea3]" />;
    }
  };

  const getAccentTextClass = (accent: HorizonMetric['accent']) => {
    switch (accent) {
      case 'secondary':
        return 'text-[#4cd7f6]';
      case 'tertiary':
        return 'text-[#c0c1ff]';
      case 'gold':
        return 'text-[#c9a227]';
      default:
        return 'text-[#4edea3]';
    }
  };

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

  return (
    <section className="flex flex-col gap-5" id="telemetry-hud">
      {/* Breadcrumb / Status Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[#bbcabf] border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px]">
          <span className="text-[#4edea3] font-bold">POS://TERMINAL</span>
          <span>/</span>
          <span>BLUEPRINT_CORE</span>
          <span>/</span>
          <span className="text-[#e2e2e8]">HORIZON_2026_2036.md</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] sm:text-[11px]">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span>UPLINK: ACTIVE</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>CADENCE: DAILY HIGH-THROUGHPUT</span>
          </span>
        </div>
      </div>

      {/* Main Title & Subtitle + View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-1">
        <div className="flex flex-col gap-2 max-w-4xl flex-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 w-max">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-widest">
              Autonomous Capability Architecture
            </span>
          </div>

          {editingHeader ? (
            <div className="flex flex-col gap-2 mt-1 bg-[#1a1c20] p-3 rounded-lg border border-[#4edea3]/40">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xl font-bold text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
              />
              <textarea
                rows={2}
                value={subtitleDraft}
                onChange={(e) => setSubtitleDraft(e.target.value)}
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-sm text-[#bbcabf] focus:outline-none focus:border-[#4edea3]"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setEditingHeader(false)}
                  className="px-2.5 py-1 rounded bg-[#282a2e] text-[#bbcabf] font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  onClick={saveHeader}
                  className="px-3 py-1 rounded bg-[#4edea3] text-[#003824] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Save Manifesto
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-[30px] sm:leading-[38px] text-[#e2e2e8] font-bold tracking-tight">
                  {state.horizonTitle}
                </h1>
                <button
                  onClick={() => {
                    setTitleDraft(state.horizonTitle);
                    setSubtitleDraft(state.horizonSubtitle);
                    setEditingHeader(true);
                  }}
                  className="opacity-60 group-hover:opacity-100 p-1.5 rounded bg-[#1e2024] border border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#4edea3] transition-opacity cursor-pointer"
                  title="Edit Horizon Manifesto Title & Subtitle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[14px] sm:text-[16px] leading-relaxed text-[#bbcabf] mt-1">
                {state.horizonSubtitle}
              </p>
            </div>
          )}
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center p-1 rounded bg-[#1a1c20] border border-[#3c4a42]/30 self-start lg:self-end shrink-0">
          <button
            onClick={() => onChangeViewMode('single-tab')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'single-tab'
                ? 'bg-[#282a2e] text-[#4edea3] font-medium border border-[#3c4a42]/40'
                : 'text-[#bbcabf] hover:text-[#e2e2e8]'
            }`}
          >
            {viewMode === 'single-tab' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            )}
            Single-Tab View
          </button>
          <button
            onClick={() => onChangeViewMode('continuous-blueprint')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'continuous-blueprint'
                ? 'bg-[#282a2e] text-[#4edea3] font-medium border border-[#3c4a42]/40'
                : 'text-[#bbcabf] hover:text-[#e2e2e8]'
            }`}
          >
            {viewMode === 'continuous-blueprint' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            )}
            Full Overview
          </button>
          <button
            onClick={() => onChangeViewMode('roadmap')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'roadmap'
                ? 'bg-[#282a2e] text-[#4edea3] font-medium border border-[#3c4a42]/40'
                : 'text-[#bbcabf] hover:text-[#e2e2e8]'
            }`}
          >
            {viewMode === 'roadmap' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            )}
            Roadmap Grid
          </button>
          <button
            onClick={() => onChangeViewMode('scoreboard')}
            className={`px-3 py-1.5 rounded font-mono text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              viewMode === 'scoreboard'
                ? 'bg-[#282a2e] text-[#4edea3] font-medium border border-[#3c4a42]/40'
                : 'text-[#bbcabf] hover:text-[#e2e2e8]'
            }`}
          >
            {viewMode === 'scoreboard' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
            )}
            Scoreboard View
          </button>
        </div>
      </div>

      {/* 4 Key Telemetry HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {state.horizonMetrics.map((metric, idx) => {
          const isEditing = editingMetricId === metric.id && metricDraft;
          return (
            <div
              key={metric.id}
              className="p-5 rounded-xl bg-[#1a1c20]/80 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col justify-between hover:border-[#4edea3]/40 transition-all group"
            >
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={metricDraft.label}
                    onChange={(e) =>
                      setMetricDraft({ ...metricDraft, label: e.target.value })
                    }
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-[10px] text-[#4edea3]"
                    placeholder="Metric Label"
                  />
                  <input
                    type="text"
                    value={metricDraft.value}
                    onChange={(e) =>
                      setMetricDraft({ ...metricDraft, value: e.target.value })
                    }
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 text-base font-bold text-[#e2e2e8]"
                    placeholder="Primary Value"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={metricDraft.subLabel}
                      onChange={(e) =>
                        setMetricDraft({ ...metricDraft, subLabel: e.target.value })
                      }
                      className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-[10px] text-[#bbcabf]"
                      placeholder="Sub label"
                    />
                    <input
                      type="text"
                      value={metricDraft.subValue}
                      onChange={(e) =>
                        setMetricDraft({ ...metricDraft, subValue: e.target.value })
                      }
                      className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-[10px] text-[#4edea3]"
                      placeholder="Sub value"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setEditingMetricId(null)}
                      className="px-2 py-1 rounded bg-[#282a2e] text-[#bbcabf] font-mono text-[10px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveMetric}
                      className="px-2.5 py-1 rounded bg-[#4edea3] text-[#003824] font-mono text-[10px] font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[#bbcabf] mb-2">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider font-medium ${getAccentTextClass(
                        metric.accent
                      )}`}
                    >
                      {metric.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEditMetric(metric)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#4edea3] transition-opacity cursor-pointer"
                        title="Edit Telemetry Card"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {getMetricIcon(idx)}
                    </div>
                  </div>
                  <div className="text-[20px] sm:text-[22px] leading-[28px] text-[#e2e2e8] font-bold truncate tabular-nums">
                    {metric.value}
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-[#bbcabf]">{metric.subLabel}</span>
                    <span
                      className={`font-medium tabular-nums ${
                        idx === 1
                          ? 'text-[#4cd7f6]'
                          : idx === 2
                          ? 'text-[#c0c1ff]'
                          : 'text-[#4edea3]'
                      }`}
                    >
                      {metric.subValue}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Operational Creed Banner (Interactive 9-Stage Recursive Cycle) */}
      <div className="p-3.5 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
            The Compounding Creed // Execution Loop (Click stage to inspect directive)
          </span>
          <span className="font-mono text-[10px] text-[#4edea3] font-medium">
            9-STAGE RECURSIVE CYCLE
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] py-1">
          {state.creedStages.map((stage, idx) => {
            const isSelected = state.activeCreedStageId === stage.id;
            const isCompound = stage.id === 'compound';
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => onSelectCreedStage(stage.id)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer whitespace-nowrap ${
                    isCompound
                      ? 'bg-[#4edea3]/20 border border-[#4edea3] text-[#4edea3] font-bold shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : isSelected || stage.highlight
                      ? 'bg-[#1e2024] border border-[#4edea3]/60 text-[#4edea3] font-bold hover:bg-[#4edea3]/10'
                      : 'bg-[#1e2024] border border-[#3c4a42]/40 text-[#e2e2e8] hover:border-[#4cd7f6]'
                  }`}
                >
                  {stage.label}
                </button>
                {idx < state.creedStages.length - 1 && (
                  <span className="text-[#3c4a42] select-none">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {state.activeCreedStageId && (
          <div className="pt-1.5 border-t border-[#3c4a42]/20 flex items-center justify-between text-[12px] text-[#bbcabf]">
            <span>
              <strong className="font-mono text-[#4edea3] uppercase mr-2">
                [{state.activeCreedStageId}]:
              </strong>
              {creedStageDescriptions[state.activeCreedStageId]}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
