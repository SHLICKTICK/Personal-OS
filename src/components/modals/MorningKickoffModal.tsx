import React, { useState, useMemo } from 'react';
import {
  Sunrise,
  Sun,
  Flame,
  Zap,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Compass,
  Cpu,
  Landmark,
  Brain,
  Shield,
  Rocket,
} from 'lucide-react';
import {
  Goal,
  NavigationSection,
  POSState,
  Project,
  ProjectStep,
  DailyCadenceBlock,
  ActiveFocusTimer,
} from '../../models/types';

interface MorningKickoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: POSState;
  onDeployKickoff: (payload: {
    primaryIntent: string;
    targetDeepWorkMinutes: number;
    startTimerNow: boolean;
    slot1: { title: string; sourceRef?: string; metric?: string };
    slot2: { title: string; sourceRef?: string; metric?: string };
    slot3: { title: string; sourceRef?: string; metric?: string };
    slot4: { title: string; sourceRef?: string; metric?: string };
    navigateToSection?: NavigationSection;
  }) => void;
}

export const MorningKickoffModal: React.FC<MorningKickoffModalProps> = ({
  isOpen,
  onClose,
  state,
  onDeployKickoff,
}) => {
  if (!isOpen) return null;

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Yesterday's performance log (if exists)
  const yesterdayLog = useMemo(() => {
    if (!state.dailyPerformanceLogs || state.dailyPerformanceLogs.length === 0) return null;
    return state.dailyPerformanceLogs[0];
  }, [state.dailyPerformanceLogs]);

  // Find incomplete directives from state
  const incompleteDirectives = useMemo(() => {
    return state.goals.filter(
      (g) => g.horizon === 'Today' && g.status !== 'COMPLETED' && g.progress < 100
    );
  }, [state.goals]);

  // Compute intelligent defaults for the 4-vector slots:
  // Slot 1 & 2: Active project next uncompleted steps
  const activeProject = useMemo(() => {
    return state.projects.find((p) => p.status === 'IN PROGRESS') || state.projects[0];
  }, [state.projects]);

  const defaultStep1 = useMemo(() => {
    if (activeProject && activeProject.steps) {
      const step = activeProject.steps.find((s) => !s.completed);
      if (step) {
        return {
          title: `[${activeProject.code}] ${step.title}`,
          sourceRef: activeProject.code,
          metric: `${step.sdlcPhase} Phase // ${step.estimatedDurationMinutes}m Block`,
        };
      }
    }
    return {
      title: 'Build OAuth PKCE session middleware & JWT rotation service',
      sourceRef: 'PRJ-02',
      metric: 'Phase: IMPLEMENTATION // Target: 90m block',
    };
  }, [activeProject]);

  const defaultStep2 = useMemo(() => {
    if (activeProject && activeProject.steps) {
      const uncompleted = activeProject.steps.filter((s) => !s.completed);
      if (uncompleted.length > 1) {
        const step = uncompleted[1];
        return {
          title: `[${activeProject.code}] ${step.title}`,
          sourceRef: activeProject.code,
          metric: `${step.sdlcPhase} Phase // ${step.estimatedDurationMinutes}m Block`,
        };
      }
    }
    return {
      title: 'Execute integration tests with Postgres connection pool & test coverage >= 85%',
      sourceRef: 'PRJ-02',
      metric: 'Phase: VERIFICATION // DoD Gate Passed',
    };
  }, [activeProject]);

  // Slot 3: Financial OS
  const defaultStep3 = useMemo(() => {
    if (state.businessExperimentSteps) {
      const step = state.businessExperimentSteps.find((s) => !s.completed);
      if (step) {
        return {
          title: `Financial OS: ${step.title}`,
          sourceRef: `STEP-${step.stepNumber}`,
          metric: step.detail.slice(0, 50) + '...',
        };
      }
    }
    return {
      title: 'Lock R10,000 / $1,000 monthly recurring revenue retainer flight plan',
      sourceRef: 'FIN-OS',
      metric: 'Commercial velocity loop target',
    };
  }, [state.businessExperimentSteps]);

  // Slot 4: Learning Engine
  const defaultStep4 = useMemo(() => {
    if (state.learningTopics) {
      const topic = state.learningTopics.find(
        (t) => t.status === 'IN_PROGRESS' || t.retentionState === 'DUE_TODAY'
      );
      if (topic) {
        return {
          title: `Learning Recall: ${topic.topic} (${topic.category || 'CS'})`,
          sourceRef: 'LEARN-ENG',
          metric: `Target Feynman Mastery // Level ${topic.stage}`,
        };
      }
    }
    return {
      title: 'Master L5 Deep Dive: Rust memory layout, pointer aliasing & SIMD primitives',
      sourceRef: 'LEARN-ENG',
      metric: 'Feynman Score >= 90% Spaced Recall',
    };
  }, [state.learningTopics]);

  // Form State
  const [primaryIntent, setPrimaryIntent] = useState(
    state.todayPrimaryIntent ||
      'Ship verified OAuth PKCE middleware and complete L5 deep recall sprint.'
  );

  const [slot1Title, setSlot1Title] = useState(defaultStep1.title);
  const [slot2Title, setSlot2Title] = useState(defaultStep2.title);
  const [slot3Title, setSlot3Title] = useState(defaultStep3.title);
  const [slot4Title, setSlot4Title] = useState(defaultStep4.title);

  const [targetDeepWorkMinutes, setTargetDeepWorkMinutes] = useState(180);
  const [startTimerNow, setStartTimerNow] = useState(true);

  // Rollover toggle for incomplete directives
  const [selectedCarryoverIds, setSelectedCarryoverIds] = useState<string[]>([]);

  const handleToggleCarryover = (id: string, title: string) => {
    if (selectedCarryoverIds.includes(id)) {
      setSelectedCarryoverIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedCarryoverIds((prev) => [...prev, id]);
      // If rolling over, set as slot 2
      setSlot2Title(`[ROLLOVER] ${title}`);
    }
  };

  const handleDeploy = () => {
    onDeployKickoff({
      primaryIntent: primaryIntent.trim(),
      targetDeepWorkMinutes,
      startTimerNow,
      slot1: {
        title: slot1Title.trim(),
        sourceRef: defaultStep1.sourceRef,
        metric: defaultStep1.metric,
      },
      slot2: {
        title: slot2Title.trim(),
        sourceRef: defaultStep2.sourceRef,
        metric: defaultStep2.metric,
      },
      slot3: {
        title: slot3Title.trim(),
        sourceRef: defaultStep3.sourceRef,
        metric: defaultStep3.metric,
      },
      slot4: {
        title: slot4Title.trim(),
        sourceRef: defaultStep4.sourceRef,
        metric: defaultStep4.metric,
      },
      navigateToSection: startTimerNow ? 'work-scoreboards' : 'north-star',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#111318] border border-[#ffb4ab]/40 shadow-[0_0_60px_rgba(255,180,171,0.12)] flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* ========================================================================= */}
        {/* HEADER: DAWN STANDUP TELEMETRY                                            */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#1c1815] via-[#14151a] to-[#121916] border-b border-[#3c4a42]/40 px-5 sm:px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffb4ab]/20 to-[#ffb4ab]/5 border border-[#ffb4ab]/40 flex items-center justify-center text-[#ffb4ab] shadow-sm">
              <Sunrise className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#ffb4ab] uppercase tracking-widest font-bold">
                  MORNING KICKOFF PROTOCOL
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold">
                  READY
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#e2e2e8] tracking-tight">
                {todayFormatted}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right font-mono text-[10px]">
              <span className="text-[#bbcabf]">OPERATOR:</span>
              <span className="text-[#4edea3] font-bold">{state.operatorName}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#bbcabf] hover:text-[#e2e2e8] hover:bg-[#1e2024] cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BODY CONTENT                                                              */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-6">

          {/* Section 1: Yesterday Recap Banner */}
          {yesterdayLog && (
            <div className="p-3.5 rounded-xl bg-[#14161d] border border-[#c0c1ff]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-[#ffb4ab] shrink-0" />
                <div>
                  <span className="text-[#bbcabf]">Yesterday&apos;s Audited Score: </span>
                  <span className="font-bold text-[#e2e2e8]">{yesterdayLog.score}%</span>
                  <span className="text-[#4edea3] font-bold ml-1.5">[{yesterdayLog.grade}]</span>
                  <span className="text-[#bbcabf] text-[10px] ml-2">
                    ({yesterdayLog.completedCount}/{yesterdayLog.totalCount} directives completed)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#bbcabf]">
                <span>Active Streak:</span>
                <span className="text-[#ffb4ab] font-bold">{yesterdayLog.streakCount} Days</span>
              </div>
            </div>
          )}

          {/* Section 2: Incomplete / Rollover Directives (If any exist) */}
          {incompleteDirectives.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#191512] border border-[#ffb4ab]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#ffb4ab] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Uncompleted Directives from Previous Flight Plan</span>
                </span>
                <span className="font-mono text-[10px] text-[#bbcabf]">
                  {incompleteDirectives.length} Item(s)
                </span>
              </div>

              <div className="space-y-1.5">
                {incompleteDirectives.map((item) => {
                  const isRolled = selectedCarryoverIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-[#0e1014] border border-[#3c4a42]/40 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[9px] text-[#ffb4ab] px-1 py-0.2 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/20 shrink-0">
                          {item.category}
                        </span>
                        <span className="text-xs text-[#e2e2e8] truncate">
                          {item.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleCarryover(item.id, item.title)}
                        className={`px-2 py-1 rounded font-mono text-[10px] font-bold transition-all cursor-pointer shrink-0 border ${
                          isRolled
                            ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]'
                            : 'bg-[#1a1c20] border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8]'
                        }`}
                      >
                        {isRolled ? '✓ Rolled Over' : '+ Roll Over'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Primary Apex Intent / Today's Winning Condition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-bold text-[#e2e2e8] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#ffb4ab]" />
                <span>Primary Apex Intent (Today&apos;s Single Winning Condition)</span>
              </label>
              <span className="font-mono text-[10px] text-[#bbcabf]">Non-negotiable milestone</span>
            </div>

            <input
              type="text"
              required
              value={primaryIntent}
              onChange={(e) => setPrimaryIntent(e.target.value)}
              placeholder="e.g. Ship verified OAuth PKCE middleware and close first retainer client discovery call."
              className="w-full bg-[#0c0e12] border border-[#ffb4ab]/60 focus:border-[#ffb4ab] rounded-xl px-4 py-3 text-sm text-[#e2e2e8] font-bold focus:outline-none shadow-inner"
            />

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="font-mono text-[9px] text-[#bbcabf] uppercase mr-1">Presets:</span>
              {[
                'Ship production PKCE auth middleware & pass test suite.',
                'Conduct 3 discovery calls & lock contract retainer.',
                'Master L5 Rust SIMD deep dive & ship benchmark demo.',
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrimaryIntent(p)}
                  className="font-mono text-[10px] text-[#bbcabf] hover:text-[#ffb4ab] underline cursor-pointer"
                >
                  {p.slice(0, 32)}...
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: 4-Vector Directives Deployment Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span>Today&apos;s 4-Vector Synchronization Deployment</span>
                </h3>
                <p className="font-mono text-[10px] text-[#bbcabf]">
                  Automatically mapped to your active SDLC milestones, commercial loop, and spaced recall.
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#4edea3] font-bold">
                PARITY: 100%
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Slot 1: Milestone SDLC Step 1 */}
              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#4edea3]/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#4edea3] font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>SLOT 01 // MILESTONE SDLC (IMPLEMENTATION)</span>
                  </span>
                  <span className="text-[#bbcabf]">{defaultStep1.sourceRef}</span>
                </div>
                <input
                  type="text"
                  value={slot1Title}
                  onChange={(e) => setSlot1Title(e.target.value)}
                  className="w-full bg-[#14161b] border border-[#3c4a42]/40 focus:border-[#4edea3] rounded-lg px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none font-medium"
                />
              </div>

              {/* Slot 2: Milestone SDLC Step 2 */}
              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#4edea3]/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#4edea3] font-bold flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>SLOT 02 // MILESTONE SDLC (VERIFICATION &amp; DOD GATE)</span>
                  </span>
                  <span className="text-[#bbcabf]">{defaultStep2.sourceRef}</span>
                </div>
                <input
                  type="text"
                  value={slot2Title}
                  onChange={(e) => setSlot2Title(e.target.value)}
                  className="w-full bg-[#14161b] border border-[#3c4a42]/40 focus:border-[#4edea3] rounded-lg px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none font-medium"
                />
              </div>

              {/* Slot 3: Financial OS */}
              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#4cd7f6]/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#4cd7f6] font-bold flex items-center gap-1">
                    <Landmark className="w-3 h-3" />
                    <span>SLOT 03 // FINANCIAL OS (COMMERCIAL VELOCITY &amp; RETAINER)</span>
                  </span>
                  <span className="text-[#bbcabf]">REVENUE TARGET</span>
                </div>
                <input
                  type="text"
                  value={slot3Title}
                  onChange={(e) => setSlot3Title(e.target.value)}
                  className="w-full bg-[#14161b] border border-[#3c4a42]/40 focus:border-[#4cd7f6] rounded-lg px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none font-medium"
                />
              </div>

              {/* Slot 4: Learning Engine */}
              <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#c0c1ff]/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#c0c1ff] font-bold flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>SLOT 04 // LEARNING ENGINE (SPACED RECALL &amp; FEYNMAN MASTERY)</span>
                  </span>
                  <span className="text-[#bbcabf]">RETENTION</span>
                </div>
                <input
                  type="text"
                  value={slot4Title}
                  onChange={(e) => setSlot4Title(e.target.value)}
                  className="w-full bg-[#14161b] border border-[#3c4a42]/40 focus:border-[#c0c1ff] rounded-lg px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Cadence Commitment & Focus Timer Auto-Start */}
          <div className="p-4 rounded-xl bg-[#14161b] border border-[#3c4a42]/40 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#e2e2e8] font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#ffb4ab]" />
                <span>Today&apos;s Deep Work Commitment:</span>
              </span>
              <span className="text-sm font-black text-[#ffb4ab] tabular-nums">
                {targetDeepWorkMinutes} Minutes ({(targetDeepWorkMinutes / 60).toFixed(1)}h)
              </span>
            </div>

            <div className="flex gap-2">
              {[
                { mins: 90, label: '90m (1 Block)' },
                { mins: 180, label: '180m Standard (90-15-90)' },
                { mins: 270, label: '270m Apex (3 Blocks)' },
              ].map((c) => (
                <button
                  key={c.mins}
                  type="button"
                  onClick={() => setTargetDeepWorkMinutes(c.mins)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono transition-all cursor-pointer border ${
                    targetDeepWorkMinutes === c.mins
                      ? 'bg-[#ffb4ab]/20 border-[#ffb4ab] text-[#ffb4ab] font-bold'
                      : 'bg-[#0c0e12] border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2.5 pt-1 text-xs text-[#e2e2e8] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startTimerNow}
                onChange={(e) => setStartTimerNow(e.target.checked)}
                className="w-4 h-4 accent-[#ffb4ab] cursor-pointer rounded"
              />
              <span>
                Immediately queue and start <strong className="text-[#4edea3]">90-Min Focus Timer Block 01</strong> for Slot 01 upon deployment
              </span>
            </label>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* FOOTER ACTIONS                                                            */}
        {/* ========================================================================= */}
        <div className="bg-[#0e1014] border-t border-[#3c4a42]/40 px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1a1c20] hover:bg-[#282a2e] text-[#bbcabf] font-mono text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeploy}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ffb4ab] via-[#ff988b] to-[#4edea3] hover:opacity-95 text-[#1e0e0a] font-mono text-xs font-black flex items-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(255,180,171,0.35)] transition-all hover:scale-[1.02]"
          >
            <Rocket className="w-4 h-4" />
            <span>IGNITE DAY // DEPLOY FLIGHT PLAN {startTimerNow ? '& START 90M DEEP WORK' : ''}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
