import React, { useState, useMemo } from 'react';
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
  BarChart3,
  Flame,
  Award,
  History,
  Calendar,
  Layers,
  Cpu,
  Coins,
  BookOpen,
  ArrowRight,
  Clock,
  RefreshCw,
  Sliders,
  Eye,
  CheckCheck,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  DailyPerformanceLog,
  DirectiveSourceType,
  Goal,
  NavigationSection,
  POSState,
  Principle,
  Project,
  ProjectStep,
  SDLCPhase,
} from '../../models/types';

interface NorthStarSectionProps {
  state: POSState;
  onUpdatePrinciple: (principle: Principle) => void;
  onAddPrinciple: (principle: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePhilosophyQuotes: (passiveQuote: string, activeQuote: string) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onNavigateToSection?: (section: NavigationSection) => void;
  onSaveDailyPerformanceLog?: (log: DailyPerformanceLog) => void;
  onDeleteDailyPerformanceLog?: (id: string) => void;
  onSyncDailyDirectives?: (directives: Goal[]) => void;
  onToggleGoalAndSyncSource?: (goal: Goal) => void;
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
  onSaveDailyPerformanceLog,
  onDeleteDailyPerformanceLog,
  onSyncDailyDirectives,
  onToggleGoalAndSyncSource,
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

  // 4-Vector Directives & End-of-Day EOD State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showEodModal, setShowEodModal] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [slotCustomizerSlot, setSlotCustomizerSlot] = useState<1 | 2 | 3 | 4 | null>(null);
  const [eodNotes, setEodNotes] = useState('');
  const [eodDate, setEodDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eodSuccessToast, setEodSuccessToast] = useState<string | null>(null);
  const [selectedLogDetail, setSelectedLogDetail] = useState<DailyPerformanceLog | null>(null);

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

  const handleToggleGoal = (goal: Goal) => {
    if (onToggleGoalAndSyncSource) {
      onToggleGoalAndSyncSource(goal);
    } else {
      const isCompleted = goal.status === 'COMPLETED' || goal.progress === 100;
      onUpdateGoal({
        ...goal,
        status: isCompleted ? 'ACTIVE' : 'COMPLETED',
        progress: isCompleted ? 50 : 100,
        updatedAt: new Date().toISOString(),
      });
    }
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

  // 4 Daily Directives Slots logic
  const slot1Goal = todayGoals.find((g) => g.slotNumber === 1) || todayGoals.find((g) => g.sourceType === 'MILESTONE_PROJECT') || todayGoals[0];
  const slot2Goal = todayGoals.find((g) => g.slotNumber === 2) || todayGoals.filter((g) => g.sourceType === 'MILESTONE_PROJECT')[1] || todayGoals[1];
  const slot3Goal = todayGoals.find((g) => g.slotNumber === 3) || todayGoals.find((g) => g.sourceType === 'FINANCIAL_OS') || todayGoals[2];
  const slot4Goal = todayGoals.find((g) => g.slotNumber === 4) || todayGoals.find((g) => g.sourceType === 'LEARNING_ENGINE') || todayGoals[3];

  const fourSlotCards = useMemo(() => {
    return [
      {
        slotNum: 1 as const,
        slotName: 'SLOT 01 // MILESTONE PROJECT A',
        slotSubtitle: 'SDLC Phase & Step Breakdown',
        defaultDomain: 'MILESTONE_PROJECT' as DirectiveSourceType,
        accent: '#4edea3',
        goal: slot1Goal,
        badgeText: slot1Goal?.sourceRefCode || 'MILESTONE SDLC',
      },
      {
        slotNum: 2 as const,
        slotName: 'SLOT 02 // MILESTONE PROJECT B',
        slotSubtitle: 'SDLC Phase & Step Breakdown',
        defaultDomain: 'MILESTONE_PROJECT' as DirectiveSourceType,
        accent: '#4edea3',
        goal: slot2Goal,
        badgeText: slot2Goal?.sourceRefCode || 'MILESTONE SDLC',
      },
      {
        slotNum: 3 as const,
        slotName: 'SLOT 03 // FINANCIAL OS',
        slotSubtitle: '7-Step Commercial Experiment Loop',
        defaultDomain: 'FINANCIAL_OS' as DirectiveSourceType,
        accent: '#4cd7f6',
        goal: slot3Goal,
        badgeText: slot3Goal?.sourceRefCode || 'FINANCIAL OS',
      },
      {
        slotNum: 4 as const,
        slotName: 'SLOT 04 // LEARNING ENGINE',
        slotSubtitle: 'Active Curriculum & Spaced Retention',
        defaultDomain: 'LEARNING_ENGINE' as DirectiveSourceType,
        accent: '#c0c1ff',
        goal: slot4Goal,
        badgeText: slot4Goal?.sourceRefCode || 'LEARNING ENGINE',
      },
    ];
  }, [slot1Goal, slot2Goal, slot3Goal, slot4Goal]);

  // Scoring and Telemetry
  const totalDailySlots = todayGoals.length > 0 ? todayGoals.length : 4;
  const todayCompletedGoals = todayGoals.filter((g) => g.status === 'COMPLETED' || g.progress === 100);
  const todayCompletedCount = todayCompletedGoals.length;
  const todayScorePercentage = totalDailySlots > 0 ? Math.round((todayCompletedCount / totalDailySlots) * 100) : 0;
  const todayAverageProgress = todayGoals.length > 0
    ? Math.round(todayGoals.reduce((sum, g) => sum + g.progress, 0) / todayGoals.length)
    : 0;

  const getExecutionGrade = (score: number): 'APEX' | 'HIGH' | 'NOMINAL' | 'AT_RISK' | 'CRITICAL' => {
    if (score >= 100) return 'APEX';
    if (score >= 75) return 'HIGH';
    if (score >= 50) return 'NOMINAL';
    if (score >= 25) return 'AT_RISK';
    return 'CRITICAL';
  };

  const currentGrade = getExecutionGrade(todayScorePercentage);

  // Vector completion breakdown
  const milestoneProjectGoals = todayGoals.filter((g) => g.sourceType === 'MILESTONE_PROJECT' || g.category === 'Engineering');
  const milestoneCompleted = milestoneProjectGoals.filter((g) => g.status === 'COMPLETED' || g.progress === 100).length;

  const financialGoals = todayGoals.filter((g) => g.sourceType === 'FINANCIAL_OS' || g.category === 'Commercial' || g.category === 'Financial');
  const financialCompleted = financialGoals.filter((g) => g.status === 'COMPLETED' || g.progress === 100).length;

  const learningGoals = todayGoals.filter((g) => g.sourceType === 'LEARNING_ENGINE' || g.category === 'Cognitive');
  const learningCompleted = learningGoals.filter((g) => g.status === 'COMPLETED' || g.progress === 100).length;

  // Streak calculation
  const performanceLogs = useMemo(() => state.dailyPerformanceLogs || [], [state.dailyPerformanceLogs]);
  const currentStreak = useMemo(() => {
    let streak = todayScorePercentage >= 75 ? 1 : 0;
    const sorted = [...performanceLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (const log of sorted) {
      if (log.score >= 75) streak += 1;
      else break;
    }
    return streak;
  }, [performanceLogs, todayScorePercentage]);

  const allTimeAverageScore = useMemo(() => {
    if (performanceLogs.length === 0) return todayScorePercentage;
    const total = performanceLogs.reduce((sum, l) => sum + l.score, 0);
    return Math.round(total / performanceLogs.length);
  }, [performanceLogs, todayScorePercentage]);

  // Handler: Auto-Generate / Synchronize 4 Directives
  const handleAutoGenerateDailyDirectives = () => {
    const activeProjects = state.projects.filter((p) => p.status === 'IN PROGRESS');
    const primaryProj = activeProjects[0] || state.projects[1] || state.projects[0];
    const secondaryProj = activeProjects[1] || state.projects[0] || primaryProj;

    const uncompletedStep1 = (primaryProj.steps || []).find((s) => !s.completed) || (primaryProj.steps || [])[0];
    const uncompletedStep2 = (secondaryProj.steps || []).find((s) => !s.completed && s.id !== uncompletedStep1?.id) || (secondaryProj.steps || [])[1] || uncompletedStep1;

    const activeCommercialStep = state.businessExperimentSteps.find((s) => !s.completed) || state.businessExperimentSteps[3] || state.businessExperimentSteps[0];
    const activeTopic = state.learningTopics.find((t) => t.retentionState === 'DUE_TODAY') || state.learningTopics.find((t) => t.status === 'IN_PROGRESS') || state.learningTopics[0];

    const generatedDirectives: Goal[] = [
      {
        id: `goal-sync-1-${Date.now()}`,
        slotNumber: 1,
        sourceType: 'MILESTONE_PROJECT',
        sourceProjectId: primaryProj.id,
        sourceProjectStepId: uncompletedStep1?.id,
        sourceSdlcPhase: uncompletedStep1?.sdlcPhase || primaryProj.currentSDLCPhase || 'IMPLEMENTATION',
        sourceRefCode: `${primaryProj.code} // SDLC: ${uncompletedStep1?.sdlcPhase || 'IMPLEMENTATION'}`,
        title: uncompletedStep1 ? uncompletedStep1.title : `${primaryProj.title} SDLC Engineering Execution`,
        category: 'Engineering',
        horizon: 'Today',
        targetMetric: `${uncompletedStep1?.estimatedDurationMinutes || 90}m Deep Work / Step Complete Verification`,
        progress: uncompletedStep1?.completed ? 100 : 0,
        status: uncompletedStep1?.completed ? 'COMPLETED' : 'ACTIVE',
        linkedProjectCode: primaryProj.code,
        linkedProjectName: `${primaryProj.title} (${primaryProj.code})`,
        impactText: `Direct SDLC contribution to ${primaryProj.code}: ${primaryProj.title}`,
        estimatedMinutes: uncompletedStep1?.estimatedDurationMinutes || 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `goal-sync-2-${Date.now()}`,
        slotNumber: 2,
        sourceType: 'MILESTONE_PROJECT',
        sourceProjectId: secondaryProj.id,
        sourceProjectStepId: uncompletedStep2?.id,
        sourceSdlcPhase: uncompletedStep2?.sdlcPhase || secondaryProj.currentSDLCPhase || 'IMPLEMENTATION',
        sourceRefCode: `${secondaryProj.code} // SDLC: ${uncompletedStep2?.sdlcPhase || 'IMPLEMENTATION'}`,
        title: uncompletedStep2 ? uncompletedStep2.title : `${secondaryProj.title} SDLC Engineering Verification`,
        category: 'Engineering',
        horizon: 'Today',
        targetMetric: `${uncompletedStep2?.estimatedDurationMinutes || 90}m Execution / Verification Gate Passed`,
        progress: uncompletedStep2?.completed ? 100 : 0,
        status: uncompletedStep2?.completed ? 'COMPLETED' : 'ACTIVE',
        linkedProjectCode: secondaryProj.code,
        linkedProjectName: `${secondaryProj.title} (${secondaryProj.code})`,
        impactText: `Direct SDLC contribution to ${secondaryProj.code}: ${secondaryProj.title}`,
        estimatedMinutes: uncompletedStep2?.estimatedDurationMinutes || 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `goal-sync-3-${Date.now()}`,
        slotNumber: 3,
        sourceType: 'FINANCIAL_OS',
        sourceFinancialStepId: activeCommercialStep.id,
        sourceRefCode: `FIN-OS // 7-STEP LOOP: STEP ${activeCommercialStep.stepNumber}`,
        title: activeCommercialStep.productAction || activeCommercialStep.title,
        category: 'Commercial',
        horizon: 'Today',
        targetMetric: activeCommercialStep.detail || 'Commercial validation / revenue target met',
        progress: activeCommercialStep.completed ? 100 : 0,
        status: activeCommercialStep.completed ? 'COMPLETED' : 'ACTIVE',
        linkedProjectCode: primaryProj.code,
        linkedProjectName: state.activeCommercialExperiment?.productOrServiceName || 'Financial Operating System',
        impactText: `Financial OS: Advance 7-Step Commercial Experiment Loop (${activeCommercialStep.stepNumber})`,
        estimatedMinutes: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `goal-sync-4-${Date.now()}`,
        slotNumber: 4,
        sourceType: 'LEARNING_ENGINE',
        sourceLearningTopicId: activeTopic?.id,
        sourceRefCode: `LEARN-ENG // ${activeTopic?.stage || 'L5'} ${activeTopic?.stageLabel || 'SYNTHESIS'}`,
        title: activeTopic ? `${activeTopic.stage} Protocol: ${activeTopic.topic}` : 'Deep Dive Technical Concept Mastery',
        category: 'Cognitive',
        horizon: 'Today',
        targetMetric: activeTopic?.protocolAction || 'Spaced repetition review + evidence artifact logged',
        progress: activeTopic?.status === 'MASTERED' ? 100 : 0,
        status: activeTopic?.status === 'MASTERED' ? 'COMPLETED' : 'ACTIVE',
        linkedProjectCode: activeTopic?.linkedProjectId ? state.projects.find(p => p.id === activeTopic.linkedProjectId)?.code : primaryProj.code,
        linkedProjectName: 'Active Learning Engine',
        impactText: `Learning Engine: Retention protocol verification (${activeTopic?.intervalLabel || 'Scheduled'})`,
        estimatedMinutes: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    if (onSyncDailyDirectives) {
      onSyncDailyDirectives(generatedDirectives);
    } else {
      generatedDirectives.forEach(g => onAddGoal(g));
    }
    setShowSyncModal(false);
    setEodSuccessToast('4-Vector Daily Directives synchronized from active system state!');
    setTimeout(() => setEodSuccessToast(null), 3500);
  };

  // Handler: Commit EOD Performance Log
  const handleCommitEodLog = () => {
    const completedDirectives = todayGoals
      .filter((g) => g.status === 'COMPLETED' || g.progress === 100)
      .map((g) => ({
        id: g.id,
        title: g.title,
        sourceType: (g.sourceType || 'CUSTOM') as DirectiveSourceType,
        sourceRef: g.sourceRefCode || g.linkedProjectCode,
      }));

    const missedDirectives = todayGoals
      .filter((g) => g.status !== 'COMPLETED' && g.progress < 100)
      .map((g) => ({
        id: g.id,
        title: g.title,
        sourceType: (g.sourceType || 'CUSTOM') as DirectiveSourceType,
        sourceRef: g.sourceRefCode || g.linkedProjectCode,
      }));

    const insights: string[] = [];
    if (todayScorePercentage === 100) {
      insights.push('Apex Execution Standard: 100% compliance across all 4 vector domains.');
      insights.push('Engineering, commercial validation, and cognitive mastery progressed in complete parity.');
    } else if (todayScorePercentage >= 75) {
      insights.push(`High operational velocity (${todayCompletedCount}/${totalDailySlots} directives completed).`);
      if (milestoneCompleted < 2) insights.push('Milestone Project execution lagged: 1 SDLC engineering step was skipped.');
      if (financialCompleted < 1) insights.push('Financial OS directive deferred: Commercial outreach / cashflow action was skipped.');
      if (learningCompleted < 1) insights.push('Cognitive retention protocol was postponed; reschedule study block.');
    } else {
      insights.push(`Significant operational friction detected (${todayScorePercentage}% compliance).`);
      insights.push('Actionable triage: Enforce 90-min uninterrupted deep block tomorrow morning.');
    }

    const newLog: DailyPerformanceLog = {
      id: `dpl-${eodDate}`,
      date: eodDate,
      score: todayScorePercentage,
      grade: currentGrade,
      completedCount: todayCompletedCount,
      totalCount: totalDailySlots,
      completedDirectives,
      missedDirectives,
      domainBreakdown: {
        milestoneProjects: { completed: milestoneCompleted, total: milestoneProjectGoals.length || 2 },
        financialOS: { completed: financialCompleted, total: financialGoals.length || 1 },
        learningEngine: { completed: learningCompleted, total: learningGoals.length || 1 },
      },
      streakCount: currentStreak,
      insights,
      operatorNotes: eodNotes.trim() || undefined,
      loggedAt: new Date().toISOString(),
    };

    onSaveDailyPerformanceLog?.(newLog);
    setShowEodModal(false);
    setEodNotes('');
    setEodSuccessToast(`End-of-Day Score (${todayScorePercentage}%) permanently logged to system ledger!`);
    setTimeout(() => setEodSuccessToast(null), 4000);
  };

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
      {/* SECTION: TODAY'S STRATEGIC DIRECTIVES // 4-VECTOR PARITY COMMAND CENTER   */}
      {/* ========================================================================= */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-[#111318] via-[#141a16] to-[#111318] border border-[#4edea3]/40 flex flex-col gap-4 shadow-[0_0_20px_rgba(78,222,163,0.06)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4edea3]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Top Header & Filter Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10 pb-3 border-b border-[#3c4a42]/30">
          <div className="flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-pulse mt-1.5 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-mono text-sm sm:text-base font-bold text-[#e2e2e8] uppercase tracking-wide flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4edea3]" />
                  TODAY'S STRATEGIC DIRECTIVES // 4-VECTOR COMMAND CENTER
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] font-bold">
                  2 MILESTONE + 1 FINANCIAL + 1 LEARNING
                </span>
              </div>
              <p className="font-mono text-xs text-[#bbcabf] mt-0.5">
                The apex daily execution protocol: high-leverage directives synchronized directly from your Milestone SDLC, Financial OS loop, and Learning Engine.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick System Action Buttons */}
            <button
              onClick={handleAutoGenerateDailyDirectives}
              className="px-2.5 py-1.5 rounded-lg bg-[#4edea3]/15 hover:bg-[#4edea3]/25 border border-[#4edea3]/40 text-[#4edea3] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Automatically scan active projects, financial loop, and learning curriculum to assemble today's 4 directives"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Sync 4 Vectors</span>
            </button>

            <button
              onClick={() => setShowEodModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#4cd7f6]/15 hover:bg-[#4cd7f6]/25 border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Calculate daily execution score and permanently log End-of-Day review"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>EOD Review &amp; Score</span>
            </button>

            <button
              onClick={() => setShowLogsDrawer(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] border border-[#3c4a42]/60 text-[#bbcabf] hover:text-[#e2e2e8] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="View all-time daily performance logs, streak graphs, and historical insights"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#c0c1ff]" />
              <span>Scoreboard &amp; Logs ({performanceLogs.length})</span>
            </button>

            {/* Horizon Filter Tabs */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/40">
              <button
                onClick={() => setSelectedHorizon('Today')}
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedHorizon === 'Today'
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm font-bold'
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
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm font-bold'
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
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm font-bold'
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
                    ? 'bg-[#4edea3] text-[#003822] shadow-sm font-bold'
                    : 'text-[#bbcabf] hover:text-[#e2e2e8]'
                }`}
              >
                All ({state.goals.length})
              </button>
            </div>

            {/* Custom Directive Add */}
            <button
              onClick={() => setShowAddGoalForm(!showAddGoalForm)}
              className="px-2.5 py-1.5 rounded-lg bg-[#111318] hover:bg-[#1a1c20] border border-[#3c4a42]/60 text-[#bbcabf] hover:text-[#4edea3] font-mono text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
              title="Add Custom Directive"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real-time Telemetry & Scoring Ribbon for Today */}
        {selectedHorizon === 'Today' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-xs relative z-10">
            {/* Card 1: Today's Performance Score */}
            <div className="p-3 rounded-lg bg-[#0c0e12]/85 border border-[#4edea3]/40 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-[10px] text-[#bbcabf] uppercase">
                <span>Daily Execution Score</span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  todayScorePercentage >= 100
                    ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                    : todayScorePercentage >= 75
                    ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                    : 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                }`}>
                  {currentGrade}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-[#e2e2e8] tabular-nums">
                  {todayScorePercentage}%
                </span>
                <span className="text-xs text-[#4edea3] font-bold">
                  {todayCompletedCount}/{totalDailySlots} Slots
                </span>
              </div>
              <div className="w-full bg-[#181a1e] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-[#4cd7f6] to-[#4edea3] transition-all duration-300"
                  style={{ width: `${Math.max(4, todayScorePercentage)}%` }}
                />
              </div>
            </div>

            {/* Card 2: Execution Streak */}
            <div className="p-3 rounded-lg bg-[#0c0e12]/85 border border-[#3c4a42]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-[#bbcabf] uppercase">
                <span>Active Streak</span>
                <Flame className="w-3.5 h-3.5 text-[#ffb4ab]" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-black text-[#ffb4ab] tabular-nums flex items-center gap-1">
                  <span>{currentStreak}</span>
                  <span className="text-xs font-normal text-[#bbcabf]">Days</span>
                </span>
                <span className="text-[10px] text-[#bbcabf]">
                  &gt;=75% High Execution
                </span>
              </div>
              <span className="text-[10px] text-[#bbcabf] mt-1.5 truncate">
                {currentStreak >= 3 ? 'Apex Momentum Locked' : 'Daily System Compliance'}
              </span>
            </div>

            {/* Card 3: Vector Parity Breakdown */}
            <div className="p-3 rounded-lg bg-[#0c0e12]/85 border border-[#3c4a42]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-[#bbcabf] uppercase">
                <span>Vector Parity Matrix</span>
                <Layers className="w-3.5 h-3.5 text-[#4cd7f6]" />
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1 text-[11px] text-center">
                <div className="p-1 rounded bg-[#111318] border border-[#4edea3]/30">
                  <div className="text-[9px] text-[#bbcabf]">Milestone</div>
                  <div className="font-bold text-[#4edea3]">{milestoneCompleted}/2</div>
                </div>
                <div className="p-1 rounded bg-[#111318] border border-[#4cd7f6]/30">
                  <div className="text-[9px] text-[#bbcabf]">Financial</div>
                  <div className="font-bold text-[#4cd7f6]">{financialCompleted}/1</div>
                </div>
                <div className="p-1 rounded bg-[#111318] border border-[#c0c1ff]/30">
                  <div className="text-[9px] text-[#bbcabf]">Learning</div>
                  <div className="font-bold text-[#c0c1ff]">{learningCompleted}/1</div>
                </div>
              </div>
            </div>

            {/* Card 4: Historical Velocity & Two-Way Sync */}
            <div className="p-3 rounded-lg bg-[#0c0e12]/85 border border-[#3c4a42]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-[#bbcabf] uppercase">
                <span>System Linkage</span>
                <Activity className="w-3.5 h-3.5 text-[#4edea3]" />
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-base font-bold text-[#4edea3]">
                  2-Way Vector Sync
                </span>
                <span className="text-xs text-[#c0c1ff] font-bold">
                  {allTimeAverageScore}% Avg
                </span>
              </div>
              <span className="text-[10px] text-[#bbcabf] mt-1.5 truncate">
                Toggling directive updates project SDLC &amp; Financial loop
              </span>
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
                Milestone Impact &amp; Strategic Contribution
              </label>
              <input
                type="text"
                value={newGoalImpact}
                onChange={(e) => setNewGoalImpact(e.target.value)}
                placeholder="e.g. Contributes to Milestone Project 02: Multi-Tenant Architecture &amp; Financial Ledger"
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

        {/* ========================================================================= */}
        {/* TODAY VIEW: 4-VECTOR STRATEGIC DIRECTIVES CARDS GRID                      */}
        {/* ========================================================================= */}
        {selectedHorizon === 'Today' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 relative z-10">
            {fourSlotCards.map((slot) => {
              const goal = slot.goal;
              if (!goal) {
                return (
                  <div
                    key={slot.slotNum}
                    className="p-4 rounded-xl border border-dashed border-[#3c4a42]/50 bg-[#0c0e12]/60 flex flex-col justify-between gap-3 text-center min-h-[220px]"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase text-[#bbcabf]">
                        {slot.slotName}
                      </span>
                      <p className="font-mono text-xs text-[#bbcabf] mt-1">{slot.slotSubtitle}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-[#bbcabf] font-mono">No directive assigned to this vector slot.</p>
                      <button
                        onClick={handleAutoGenerateDailyDirectives}
                        className="px-3 py-1.5 rounded bg-[#4edea3]/20 hover:bg-[#4edea3]/30 text-[#4edea3] font-mono text-xs font-bold cursor-pointer"
                      >
                        Auto-Populate Slot
                      </button>
                    </div>
                  </div>
                );
              }

              const isEditing = editingGoalId === goal.id && goalDraft;
              const isCompleted = goal.status === 'COMPLETED' || goal.progress === 100;
              const linkedProject = findProjectByCode(goal.linkedProjectCode);

              // Domain styling
              const isMilestoneSlot = slot.slotNum === 1 || slot.slotNum === 2;
              const isFinancialSlot = slot.slotNum === 3;
              const isLearningSlot = slot.slotNum === 4;

              return (
                <div
                  key={slot.slotNum}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all group relative overflow-hidden ${
                    isCompleted
                      ? 'bg-[#101c15]/95 border-[#4edea3]/60 shadow-[0_0_15px_rgba(78,222,163,0.12)]'
                      : 'bg-[#15171b]/95 border-[#3c4a42]/50 hover:border-[#4edea3]/50 hover:bg-[#181a1e]'
                  }`}
                >
                  <div>
                    {/* Slot Header Banner */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#3c4a42]/30">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isMilestoneSlot
                              ? 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30'
                              : isFinancialSlot
                              ? 'bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30'
                              : 'bg-[#c0c1ff]/15 text-[#c0c1ff] border border-[#c0c1ff]/30'
                          }`}
                        >
                          SLOT 0{slot.slotNum}
                        </span>
                        <span className="font-mono text-[10px] text-[#bbcabf] truncate font-bold">
                          {isMilestoneSlot ? 'MILESTONE SDLC' : isFinancialSlot ? 'FINANCIAL OS' : 'LEARNING ENGINE'}
                        </span>
                      </div>

                      {goal.estimatedMinutes && (
                        <span className="font-mono text-[9px] text-[#bbcabf] px-1.5 py-0.5 rounded bg-[#0c0e12] border border-[#3c4a42]/30 flex items-center gap-1 shrink-0">
                          <Clock className="w-2.5 h-2.5 text-[#4cd7f6]" />
                          <span>{goal.estimatedMinutes}m</span>
                        </span>
                      )}
                    </div>

                    {/* Checkbox & Directive Title */}
                    <div className="flex items-start gap-2.5 mt-1">
                      <button
                        onClick={() => handleToggleGoal(goal)}
                        className="text-[#4edea3] hover:scale-110 transition-transform cursor-pointer mt-0.5 shrink-0"
                        title={isCompleted ? 'Mark Active' : 'Mark Completed (2-Way Vector Sync)'}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-[#4edea3]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#bbcabf] hover:text-[#4edea3]" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-2 mt-1">
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
                              className={`text-sm font-bold font-mono tracking-tight leading-snug ${
                                isCompleted ? 'text-[#4edea3] line-through opacity-85' : 'text-[#e2e2e8]'
                              }`}
                            >
                              {goal.title}
                            </h4>
                            <div className="text-[11px] font-mono text-[#bbcabf] mt-1.5 flex items-start gap-1">
                              <span className="text-[#4edea3] font-bold shrink-0">Metric:</span>
                              <span className="line-clamp-2">{goal.targetMetric}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEditGoal(goal)}
                          className="p-1 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#4edea3] cursor-pointer"
                          title="Edit Directive"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setSlotCustomizerSlot(slot.slotNum)}
                          className="p-1 rounded hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#4cd7f6] cursor-pointer"
                          title="Configure / Re-link Slot"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Source Linkage & Jump Action */}
                  <div className="mt-3 pt-2.5 border-t border-[#3c4a42]/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono bg-[#0c0e12] p-2 rounded border border-[#3c4a42]/30">
                      <div className="flex items-center gap-1.5 truncate">
                        {isMilestoneSlot ? (
                          <Cpu className="w-3 h-3 text-[#4edea3] shrink-0" />
                        ) : isFinancialSlot ? (
                          <Coins className="w-3 h-3 text-[#4cd7f6] shrink-0" />
                        ) : (
                          <BookOpen className="w-3 h-3 text-[#c0c1ff] shrink-0" />
                        )}
                        <span className="text-[#e2e2e8] truncate text-[10px] font-semibold">
                          {goal.sourceRefCode || (linkedProject ? `${linkedProject.code} // SDLC` : goal.impactText || 'Engine Vector')}
                        </span>
                      </div>

                      {/* 1-Click Jump to Domain */}
                      {isMilestoneSlot && (
                        <button
                          onClick={() => onNavigateToSection?.('milestone-projects')}
                          className="inline-flex items-center gap-0.5 text-[10px] text-[#4edea3] hover:underline cursor-pointer shrink-0 ml-1 font-bold"
                          title="Open Milestone Projects (Module 04)"
                        >
                          <span>{goal.linkedProjectCode || 'PRJ'}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                      {isFinancialSlot && (
                        <button
                          onClick={() => onNavigateToSection?.('financial-os')}
                          className="inline-flex items-center gap-0.5 text-[10px] text-[#4cd7f6] hover:underline cursor-pointer shrink-0 ml-1 font-bold"
                          title="Open Financial OS (Module 05)"
                        >
                          <span>FIN-OS</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                      {isLearningSlot && (
                        <button
                          onClick={() => onNavigateToSection?.('learning-engine')}
                          className="inline-flex items-center gap-0.5 text-[10px] text-[#c0c1ff] hover:underline cursor-pointer shrink-0 ml-1 font-bold"
                          title="Open Learning Engine (Module 03)"
                        >
                          <span>LEARN</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar & Status Pill */}
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        isCompleted
                          ? 'bg-[#4edea3]/20 text-[#4edea3]'
                          : 'bg-[#bbcabf]/10 text-[#bbcabf]'
                      }`}>
                        {isCompleted ? '✓ COMPLETED' : 'IN EXECUTION'}
                      </span>
                      <span className="text-[#bbcabf] font-bold tabular-nums">
                        {goal.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* OTHER HORIZONS VIEW (Q4 2026, 1-Year, All): Standard Cards Grid           */
          /* ========================================================================= */
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
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleGoal(goal)}
                          className="text-[#4edea3] hover:scale-110 transition-transform cursor-pointer"
                          title={isCompleted ? 'Mark Active' : 'Mark Completed'}
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
        )}
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

      {/* ========================================================================= */}
      {/* MODAL 1: AUTO-SYNC 4-VECTOR FLIGHT PLAN CONFIRMATION                      */}
      {/* ========================================================================= */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0c0e12] border border-[#4edea3]/50 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/40">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#4edea3]" />
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-[#e2e2e8] uppercase tracking-wide">
                    SYNCHRONIZE 4-VECTOR DAILY DIRECTIVES
                  </h3>
                  <p className="font-mono text-xs text-[#bbcabf]">
                    Auto-scans active engines to assemble today's balanced 4-directive flight plan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-[#bbcabf] hover:text-[#e2e2e8] p-1 rounded hover:bg-[#1e2024] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#141a16] border border-[#4edea3]/30 text-[#bbcabf] space-y-1.5">
                <div className="font-bold text-[#4edea3] uppercase flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>The 4-Vector Synchronization Protocol</span>
                </div>
                <p className="text-[11px]">
                  This operation reads the current state of your system and automatically selects:
                </p>
                <ul className="list-disc list-inside text-[11px] space-y-1 pl-1 text-[#e2e2e8]">
                  <li><strong className="text-[#4edea3]">Slots 01 &amp; 02:</strong> Next uncompleted engineering steps in active Milestone Project SDLC phases (Implementation &amp; Verification).</li>
                  <li><strong className="text-[#4cd7f6]">Slot 03:</strong> Next uncompleted step in Financial OS (7-Step Commercial Experiment Loop / Retainer Target).</li>
                  <li><strong className="text-[#c0c1ff]">Slot 04:</strong> Active spaced-retention topic or curriculum objective in the Learning Engine.</li>
                </ul>
              </div>

              <div className="text-[11px] text-[#bbcabf]">
                Applying will set these 4 directives as today's focus goals with active 2-way system synchronization.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#3c4a42]/30">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAutoGenerateDailyDirectives}
                className="px-5 py-2 rounded-lg bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#4edea3]/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deploy 4-Vector Flight Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: END-OF-DAY (EOD) REVIEW, SCORING & LOGGING DIALOG                */}
      {/* ========================================================================= */}
      {showEodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0c0e12] border border-[#4cd7f6]/50 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/40">
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-5 h-5 text-[#4cd7f6]" />
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-[#e2e2e8] uppercase tracking-wide">
                    END-OF-DAY REVIEW &amp; EXECUTION SCORE
                  </h3>
                  <p className="font-mono text-xs text-[#bbcabf]">
                    Audit daily completion, compute performance metrics, and permanently record to execution log.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEodModal(false)}
                className="text-[#bbcabf] hover:text-[#e2e2e8] p-1 rounded hover:bg-[#1e2024] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Score Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#142322] via-[#0c1a18] to-[#142322] border border-[#4cd7f6]/40 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#bbcabf] uppercase tracking-wider block">Audited Daily Score</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-[#e2e2e8] tabular-nums">
                    {todayScorePercentage}%
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    todayScorePercentage >= 100
                      ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                      : todayScorePercentage >= 75
                      ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                      : 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                  }`}>
                    {currentGrade}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#bbcabf] uppercase tracking-wider block">Slots Completed</span>
                <span className="text-xl font-bold text-[#4edea3] mt-0.5 block">
                  {todayCompletedCount} of {totalDailySlots}
                </span>
              </div>
            </div>

            {/* Directives Audit Checklist */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-[#bbcabf]">Directive Verification Audit</span>
              <div className="space-y-1.5">
                {todayGoals.map((g) => {
                  const done = g.status === 'COMPLETED' || g.progress === 100;
                  return (
                    <div
                      key={g.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                        done
                          ? 'bg-[#101c15] border-[#4edea3]/40 text-[#e2e2e8]'
                          : 'bg-[#181a1e] border-[#3c4a42]/40 text-[#bbcabf]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ffb4ab] shrink-0" />
                        )}
                        <span className="truncate text-xs font-semibold">{g.title}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                        done ? 'bg-[#4edea3]/20 text-[#4edea3]' : 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                      }`}>
                        {done ? 'VERIFIED' : 'MISSED / INCOMPLETE'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vector Domain Breakdown */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
              <div className="p-2 rounded-lg bg-[#111318] border border-[#4edea3]/30">
                <span className="text-[9px] text-[#bbcabf] block">Milestone SDLC</span>
                <span className="text-base font-bold text-[#4edea3]">{milestoneCompleted}/2</span>
              </div>
              <div className="p-2 rounded-lg bg-[#111318] border border-[#4cd7f6]/30">
                <span className="text-[9px] text-[#bbcabf] block">Financial OS</span>
                <span className="text-base font-bold text-[#4cd7f6]">{financialCompleted}/1</span>
              </div>
              <div className="p-2 rounded-lg bg-[#111318] border border-[#c0c1ff]/30">
                <span className="text-[9px] text-[#bbcabf] block">Learning Engine</span>
                <span className="text-base font-bold text-[#c0c1ff]">{learningCompleted}/1</span>
              </div>
            </div>

            {/* Operator Retrospective Notes Input */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[#bbcabf]">Operator Retrospective &amp; Execution Notes</label>
                <input
                  type="date"
                  value={eodDate}
                  onChange={(e) => setEodDate(e.target.value)}
                  className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-0.5 text-[11px] text-[#e2e2e8]"
                />
              </div>
              <textarea
                rows={3}
                value={eodNotes}
                onChange={(e) => setEodNotes(e.target.value)}
                placeholder="What was built, shipped, learned, or delayed today? Document blockers or tomorrow focus..."
                className="w-full bg-[#1e2024] border border-[#3c4a42]/50 rounded-lg p-2.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#3c4a42]/30">
              <button
                type="button"
                onClick={() => setShowEodModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitEodLog}
                className="px-5 py-2 rounded-lg bg-[#4cd7f6] hover:bg-[#4cd7f6]/90 text-[#002f3a] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#4cd7f6]/20"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Save &amp; Commit EOD Performance Log</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PERFORMANCE SCOREBOARD & HISTORICAL LOGS DRAWER                  */}
      {/* ========================================================================= */}
      {showLogsDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-[#0c0e12] border border-[#c0c1ff]/50 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/40">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[#c0c1ff]" />
                <div>
                  <h3 className="font-mono text-sm sm:text-base font-bold text-[#e2e2e8] uppercase tracking-wide">
                    DAILY PERFORMANCE SCOREBOARD &amp; AUDIT LOGS
                  </h3>
                  <p className="font-mono text-xs text-[#bbcabf]">
                    Historical record of daily execution scores, vector completion streaks, and performance insights.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLogsDrawer(false)}
                className="text-[#bbcabf] hover:text-[#e2e2e8] p-1 rounded hover:bg-[#1e2024] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Performance Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#14161c] border border-[#c0c1ff]/30">
                <span className="text-[10px] text-[#bbcabf] uppercase block">Execution Streak</span>
                <span className="text-xl font-black text-[#ffb4ab] mt-1 flex items-center gap-1">
                  <Flame className="w-4 h-4" /> {currentStreak} Days
                </span>
                <span className="text-[9px] text-[#bbcabf] mt-0.5 block">&gt;=75% High Execution</span>
              </div>

              <div className="p-3 rounded-xl bg-[#14161c] border border-[#c0c1ff]/30">
                <span className="text-[10px] text-[#bbcabf] uppercase block">All-Time Average</span>
                <span className="text-xl font-black text-[#4edea3] mt-1 block">
                  {allTimeAverageScore}%
                </span>
                <span className="text-[9px] text-[#bbcabf] mt-0.5 block">Across {performanceLogs.length} Logged Days</span>
              </div>

              <div className="p-3 rounded-xl bg-[#14161c] border border-[#c0c1ff]/30">
                <span className="text-[10px] text-[#bbcabf] uppercase block">Apex 100% Rate</span>
                <span className="text-xl font-black text-[#4cd7f6] mt-1 block">
                  {performanceLogs.length > 0 ? Math.round((performanceLogs.filter(l => l.score === 100).length / performanceLogs.length) * 100) : 0}%
                </span>
                <span className="text-[9px] text-[#bbcabf] mt-0.5 block">
                  {performanceLogs.filter(l => l.score === 100).length} Flawless Days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#14161c] border border-[#c0c1ff]/30">
                <span className="text-[10px] text-[#bbcabf] uppercase block">Logged Audits</span>
                <span className="text-xl font-black text-[#e2e2e8] mt-1 block">
                  {performanceLogs.length}
                </span>
                <span className="text-[9px] text-[#bbcabf] mt-0.5 block">Persistent in Storage</span>
              </div>
            </div>

            {/* Score History Visual Sparkline Bars */}
            <div className="p-4 rounded-xl bg-[#111318] border border-[#3c4a42]/40 font-mono text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#bbcabf] block">
                Historical Score Trajectory
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 items-end min-h-[90px] pt-4">
                {performanceLogs.slice(0, 7).reverse().map((log) => (
                  <div key={log.id} className="flex flex-col items-center gap-1 group">
                    <span className="text-[9px] font-bold text-[#e2e2e8]">{log.score}%</span>
                    <div className="w-full bg-[#1e2024] rounded-t h-16 flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${
                          log.score >= 100
                            ? 'bg-[#4edea3]'
                            : log.score >= 75
                            ? 'bg-[#4cd7f6]'
                            : 'bg-[#ffb4ab]'
                        }`}
                        style={{ height: `${Math.max(10, log.score)}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-[#bbcabf] truncate w-full text-center">
                      {log.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Log History List */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-[#bbcabf] block">
                Daily Performance Log History ({performanceLogs.length})
              </span>

              {performanceLogs.length === 0 ? (
                <div className="p-6 text-center text-[#bbcabf] border border-dashed border-[#3c4a42]/40 rounded-xl">
                  No performance logs recorded yet. Click "EOD Review &amp; Score" to commit your first log!
                </div>
              ) : (
                <div className="space-y-2">
                  {performanceLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-[#111318] border border-[#3c4a42]/40 hover:border-[#c0c1ff]/40 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#c0c1ff]" />
                          <span className="font-bold text-[#e2e2e8]">{log.date}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.score >= 100
                              ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                              : log.score >= 75
                              ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40'
                              : 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                          }`}>
                            {log.score}% // {log.grade}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#bbcabf]">
                            {log.completedCount}/{log.totalCount} Directives
                          </span>
                          {onDeleteDailyPerformanceLog && (
                            <button
                              onClick={() => onDeleteDailyPerformanceLog(log.id)}
                              className="text-[#bbcabf] hover:text-[#ffb4ab] p-1 rounded hover:bg-[#1e2024] cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Domain breakdown chips */}
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-[#0c0e12] border border-[#4edea3]/30 text-[#4edea3]">
                          Milestone SDLC: {log.domainBreakdown.milestoneProjects.completed}/{log.domainBreakdown.milestoneProjects.total}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#0c0e12] border border-[#4cd7f6]/30 text-[#4cd7f6]">
                          Financial OS: {log.domainBreakdown.financialOS.completed}/{log.domainBreakdown.financialOS.total}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#0c0e12] border border-[#c0c1ff]/30 text-[#c0c1ff]">
                          Learning Engine: {log.domainBreakdown.learningEngine.completed}/{log.domainBreakdown.learningEngine.total}
                        </span>
                      </div>

                      {/* Insights */}
                      {log.insights && log.insights.length > 0 && (
                        <div className="text-[11px] text-[#bbcabf] bg-[#0c0e12] p-2 rounded border border-[#3c4a42]/20 space-y-0.5">
                          {log.insights.map((ins, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-[#4edea3]">›</span>
                              <span>{ins}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Operator Notes */}
                      {log.operatorNotes && (
                        <div className="text-[11px] italic text-[#d0fbe0] bg-[#142018]/50 p-2 rounded border border-[#4edea3]/20">
                          "{log.operatorNotes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#3c4a42]/30">
              <button
                type="button"
                onClick={() => setShowLogsDrawer(false)}
                className="px-4 py-2 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] font-mono text-xs cursor-pointer"
              >
                Close Scoreboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SLOT CUSTOMIZER / SOURCE SELECTOR                                */}
      {/* ========================================================================= */}
      {slotCustomizerSlot !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0c0e12] border border-[#4edea3]/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/40">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#4edea3]" />
                <h3 className="font-mono text-sm font-bold text-[#e2e2e8] uppercase">
                  CONFIGURE DIRECTIVE SLOT 0{slotCustomizerSlot}
                </h3>
              </div>
              <button
                onClick={() => setSlotCustomizerSlot(null)}
                className="text-[#bbcabf] hover:text-[#e2e2e8] p-1 rounded hover:bg-[#1e2024] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-mono text-xs text-[#bbcabf]">
              {slotCustomizerSlot === 1 || slotCustomizerSlot === 2
                ? 'Select an active engineering step from any Milestone Project SDLC phase to bind to this slot.'
                : slotCustomizerSlot === 3
                ? 'Select a commercial experiment step or financial target from Financial OS to bind to this slot.'
                : 'Select an active curriculum topic or review task from the Learning Engine to bind to this slot.'}
            </p>

            <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
              {(slotCustomizerSlot === 1 || slotCustomizerSlot === 2) && (
                <div className="space-y-2">
                  {state.projects.map((proj) => (
                    <div key={proj.id} className="p-2.5 rounded bg-[#111318] border border-[#3c4a42]/30 space-y-1">
                      <span className="font-bold text-[#4edea3] text-[11px] block">{proj.code}: {proj.title}</span>
                      <div className="space-y-1 pl-2">
                        {(proj.steps || []).map((step) => (
                          <button
                            key={step.id}
                            onClick={() => {
                              const newGoal: Goal = {
                                id: `goal-slot-${slotCustomizerSlot}-${Date.now()}`,
                                slotNumber: slotCustomizerSlot,
                                sourceType: 'MILESTONE_PROJECT',
                                sourceProjectId: proj.id,
                                sourceProjectStepId: step.id,
                                sourceSdlcPhase: step.sdlcPhase,
                                sourceRefCode: `${proj.code} // SDLC: ${step.sdlcPhase}`,
                                title: step.title,
                                category: 'Engineering',
                                horizon: 'Today',
                                targetMetric: `${step.estimatedDurationMinutes}m Engineering Work Verification`,
                                progress: step.completed ? 100 : 0,
                                status: step.completed ? 'COMPLETED' : 'ACTIVE',
                                linkedProjectCode: proj.code,
                                linkedProjectName: `${proj.title} (${proj.code})`,
                                impactText: `Contributes to ${proj.code}: ${step.title}`,
                                estimatedMinutes: step.estimatedDurationMinutes,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              };
                              const updated = todayGoals.filter(g => g.slotNumber !== slotCustomizerSlot && g.id !== (slotCustomizerSlot === 1 ? slot1Goal?.id : slot2Goal?.id));
                              onSyncDailyDirectives?.([...updated, newGoal]);
                              setSlotCustomizerSlot(null);
                            }}
                            className="w-full text-left p-1.5 rounded hover:bg-[#1e2024] text-[11px] text-[#e2e2e8] flex items-center justify-between cursor-pointer border border-transparent hover:border-[#4edea3]/30"
                          >
                            <span className="truncate">{step.title}</span>
                            <span className="text-[10px] text-[#4cd7f6] shrink-0 ml-2">{step.estimatedDurationMinutes}m</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {slotCustomizerSlot === 3 && (
                <div className="space-y-1">
                  {state.businessExperimentSteps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        const newGoal: Goal = {
                          id: `goal-slot-3-${Date.now()}`,
                          slotNumber: 3,
                          sourceType: 'FINANCIAL_OS',
                          sourceFinancialStepId: step.id,
                          sourceRefCode: `FIN-OS // 7-STEP LOOP: ${step.stepNumber}`,
                          title: step.productAction || step.title,
                          category: 'Commercial',
                          horizon: 'Today',
                          targetMetric: step.detail || 'Commercial validation complete',
                          progress: step.completed ? 100 : 0,
                          status: step.completed ? 'COMPLETED' : 'ACTIVE',
                          linkedProjectCode: 'PRJ-02',
                          impactText: `Financial OS: ${step.stepNumber} ${step.title}`,
                          estimatedMinutes: 60,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };
                        const updated = todayGoals.filter(g => g.slotNumber !== 3 && g.id !== slot3Goal?.id);
                        onSyncDailyDirectives?.([...updated, newGoal]);
                        setSlotCustomizerSlot(null);
                      }}
                      className="w-full text-left p-2 rounded bg-[#111318] hover:bg-[#1e2024] text-[#e2e2e8] flex items-center justify-between cursor-pointer border border-[#3c4a42]/30 hover:border-[#4cd7f6]/40"
                    >
                      <div className="truncate">
                        <span className="text-[#4cd7f6] font-bold mr-1.5">{step.stepNumber}</span>
                        <span>{step.productAction || step.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {slotCustomizerSlot === 4 && (
                <div className="space-y-1">
                  {state.learningTopics.map((top) => (
                    <button
                      key={top.id}
                      onClick={() => {
                        const newGoal: Goal = {
                          id: `goal-slot-4-${Date.now()}`,
                          slotNumber: 4,
                          sourceType: 'LEARNING_ENGINE',
                          sourceLearningTopicId: top.id,
                          sourceRefCode: `LEARN-ENG // ${top.stage} ${top.stageLabel}`,
                          title: `${top.stage} Protocol: ${top.topic}`,
                          category: 'Cognitive',
                          horizon: 'Today',
                          targetMetric: top.protocolAction || 'Spaced review verified',
                          progress: top.status === 'MASTERED' ? 100 : 0,
                          status: top.status === 'MASTERED' ? 'COMPLETED' : 'ACTIVE',
                          linkedProjectCode: 'PRJ-02',
                          impactText: `Learning Engine: Stage ${top.stage} Mastery Protocol`,
                          estimatedMinutes: 45,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        };
                        const updated = todayGoals.filter(g => g.slotNumber !== 4 && g.id !== slot4Goal?.id);
                        onSyncDailyDirectives?.([...updated, newGoal]);
                        setSlotCustomizerSlot(null);
                      }}
                      className="w-full text-left p-2 rounded bg-[#111318] hover:bg-[#1e2024] text-[#e2e2e8] flex items-center justify-between cursor-pointer border border-[#3c4a42]/30 hover:border-[#c0c1ff]/40"
                    >
                      <div className="truncate">
                        <span className="text-[#c0c1ff] font-bold mr-1.5">{top.stage}</span>
                        <span>{top.topic}</span>
                      </div>
                      <span className="text-[10px] text-[#bbcabf] ml-2 shrink-0">{top.retentionState}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#3c4a42]/30">
              <button
                type="button"
                onClick={() => setSlotCustomizerSlot(null)}
                className="px-4 py-1.5 rounded bg-[#1e2024] text-[#bbcabf] font-mono text-xs cursor-pointer hover:text-[#e2e2e8]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Notification Toast */}
      {eodSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0c1a14] border border-[#4edea3] text-[#e2e2e8] shadow-2xl font-mono text-xs flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />
          <span>{eodSuccessToast}</span>
        </div>
      )}
    </section>
  );
};
