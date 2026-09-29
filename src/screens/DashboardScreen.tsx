import React, { useEffect, useState } from 'react';
import {
  Compass,
  Brain,
  Flag,
  Landmark,
  Gauge,
  Plus,
  Layers,
  Shield,
  Rocket,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Asset,
  BusinessExperimentStep,
  BusinessLead,
  CommercialExperimentSpec,
  DailyPerformanceLog,
  DashboardViewMode,
  Decision,
  FinancialTarget,
  Goal,
  HorizonMetric,
  KnowledgeNote,
  LearningStageLevel,
  LearningTopic,
  Liability,
  NavigationSection,
  POSState,
  Principle,
  Project,
  Review,
  RoadmapItem,
  Transaction,
} from '../models/types';
import { posRepository } from '../storage/repository';
import { Sidebar } from '../components/layout/Sidebar';
import { ExecutiveHeader } from '../components/layout/ExecutiveHeader';
import { HorizonSection } from '../components/dashboard/HorizonSection';
import { NorthStarSection } from '../components/dashboard/NorthStarSection';
import { CapabilityStack } from '../components/dashboard/CapabilityStack';
import { LearningEngine } from '../components/dashboard/LearningEngine';
import { ProjectPipeline } from '../components/dashboard/ProjectPipeline';
import { BusinessFinance } from '../components/dashboard/BusinessFinance';
import { CognitionAI } from '../components/dashboard/CognitionAI';
import { DailyCadenceFlightPlan } from '../components/dashboard/DailyCadenceFlightPlan';
import { SignOffSection } from '../components/dashboard/SignOffSection';
import { QuickCreateModal } from '../components/modals/QuickCreateModal';
import { CommandPaletteModal } from '../components/modals/CommandPaletteModal';

const CORE_MODULE_ORDER: NavigationSection[] = [
  'north-star',
  'capability-stack',
  'learning-engine',
  'milestone-projects',
  'financial-os',
  'ai-guardrails',
  'work-scoreboards',
  'horizon-flight-plan',
  'principle-70',
];

export const DashboardScreen: React.FC = () => {
  const [state, setState] = useState<POSState>(() => posRepository.loadState());
  const [activeSection, setActiveSection] = useState<NavigationSection>('north-star');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [androidPreviewMode, setAndroidPreviewMode] = useState(false);
  const [viewMode, setViewMode] = useState<DashboardViewMode>('single-tab');

  // Modals
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Save changes to persistence whenever state changes
  const updateState = (updater: (prev: POSState) => POSState) => {
    setState((prev) => {
      const next = updater(prev);
      posRepository.saveState(next);
      return next;
    });
  };

  // Keyboard shortcut listener (⌘K, ⌘N, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setQuickCreateOpen(true);
      } else if (e.key === 'Escape') {
        setQuickCreateOpen(false);
        setCommandPaletteOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // View navigation handler that switches the single-page view cleanly: one tab at a time
  const handleSelectSection = (sec: NavigationSection) => {
    setActiveSection(sec);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Previous & Next navigation for single tab view
  const currentModuleIndex = CORE_MODULE_ORDER.indexOf(activeSection);
  const handlePrevTab = () => {
    if (currentModuleIndex > 0) {
      handleSelectSection(CORE_MODULE_ORDER[currentModuleIndex - 1]);
    }
  };
  const handleNextTab = () => {
    if (currentModuleIndex >= 0 && currentModuleIndex < CORE_MODULE_ORDER.length - 1) {
      handleSelectSection(CORE_MODULE_ORDER[currentModuleIndex + 1]);
    }
  };

  // Handlers for state updates
  const handleUpdateHorizonMetric = (metric: HorizonMetric) => {
    updateState((prev) => ({
      ...prev,
      horizonMetrics: prev.horizonMetrics.map((m) => (m.id === metric.id ? metric : m)),
    }));
  };

  const handleUpdateHorizonText = (title: string, subtitle: string) => {
    updateState((prev) => ({
      ...prev,
      horizonTitle: title,
      horizonSubtitle: subtitle,
    }));
  };

  const handleSelectCreedStage = (stageId: string) => {
    updateState((prev) => ({
      ...prev,
      creedStages: prev.creedStages.map((s) => ({
        ...s,
        active: s.id === stageId,
      })),
      activeCreedStageId: stageId,
    }));
  };

  const handleChangeViewMode = (mode: DashboardViewMode) => {
    setViewMode(mode);
  };

  const handleToggleSkillMastery = (domainId: string, groupName: string, skillName: string) => {
    updateState((prev) => ({
      ...prev,
      capabilityDomains: prev.capabilityDomains.map((dom) => {
        if (dom.id !== domainId) return dom;
        return {
          ...dom,
          skills: dom.skills.map((grp) => {
            if (grp.group !== groupName) return grp;
            return {
              ...grp,
              items: grp.items.map((item) => {
                if (item.name !== skillName) return item;
                return { ...item, mastered: !item.mastered };
              }),
            };
          }),
        };
      }),
    }));
  };

  const handleSelectCurrentStage = (level: LearningStageLevel) => {
    updateState((prev) => ({
      ...prev,
      currentLearningStage: level,
      learningStages: prev.learningStages.map((s) => ({
        ...s,
        isCurrentStage: s.level === level,
      })),
    }));
  };

  const handleReviewTopic = (
    topicId: string,
    rating: 'Forgot' | 'Hard' | 'Good' | 'Easy',
    updatedStage: LearningStageLevel,
    newEvidence?: string,
    notes?: string,
    linkedProjectId?: string
  ) => {
    updateState((prev) => ({
      ...prev,
      learningTopics: prev.learningTopics.map((top) => {
        if (top.id !== topicId) return top;
        return {
          ...top,
          stage: updatedStage,
          lastReviewed: 'Today',
          reviewCount: top.reviewCount + 1,
          evidence: newEvidence ? [...top.evidence, newEvidence] : top.evidence,
          notes: notes || top.notes,
          linkedProjectId: linkedProjectId || top.linkedProjectId,
        };
      }),
      learningReviews: [
        {
          id: `lr-${Date.now()}`,
          topicId,
          rating,
          notes: notes || '',
          reviewedAt: new Date().toISOString(),
        },
        ...prev.learningReviews,
      ],
    }));
  };

  const handleAddLearningTopic = (
    topic: Omit<LearningTopic, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'lastReviewed'>
  ) => {
    const newTopic: LearningTopic = {
      ...topic,
      id: `topic-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewed: 'Never',
    };
    updateState((prev) => ({
      ...prev,
      learningTopics: [newTopic, ...prev.learningTopics],
    }));
  };

  const handleUpdateLearningTopic = (topic: LearningTopic) => {
    updateState((prev) => ({
      ...prev,
      learningTopics: prev.learningTopics.map((t) => (t.id === topic.id ? topic : t)),
    }));
  };

  const handleDeleteLearningTopic = (topicId: string) => {
    updateState((prev) => ({
      ...prev,
      learningTopics: prev.learningTopics.filter((t) => t.id !== topicId),
    }));
  };

  const handleUpdateProject = (proj: Project) => {
    updateState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === proj.id ? proj : p)),
    }));
  };

  const handleToggleGlobalDoDGate = (gateId: string) => {
    updateState((prev) => ({
      ...prev,
      dodGateProtocol: prev.dodGateProtocol.map((g) =>
        g.id === gateId ? { ...g, passed: !g.passed } : g
      ),
    }));
  };

  const handleToggleBusinessStep = (stepId: string) => {
    updateState((prev) => ({
      ...prev,
      businessExperimentSteps: prev.businessExperimentSteps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ),
    }));
  };

  const handleUpdateBusinessStep = (step: BusinessExperimentStep) => {
    updateState((prev) => ({
      ...prev,
      businessExperimentSteps: prev.businessExperimentSteps.map((s) => (s.id === step.id ? step : s)),
    }));
  };

  const handleUpdateCommercialExperiment = (experiment: CommercialExperimentSpec) => {
    updateState((prev) => ({
      ...prev,
      activeCommercialExperiment: experiment,
    }));
  };

  const handleUpdateFinancialTarget = (target: FinancialTarget) => {
    updateState((prev) => ({
      ...prev,
      financialTargets: prev.financialTargets.map((t) => (t.id === target.id ? target : t)),
    }));
  };

  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  };

  const handleUpdateTransaction = (tx: Transaction) => {
    updateState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) => (t.id === tx.id ? tx : t)),
    }));
  };

  const handleUpdateAsset = (asset: Asset) => {
    updateState((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => (a.id === asset.id ? asset : a)),
    }));
  };

  const handleAddAsset = (asset: Omit<Asset, 'id' | 'updatedAt'>) => {
    const newAsset: Asset = {
      ...asset,
      id: `asset-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      assets: [...prev.assets, newAsset],
    }));
  };

  const handleDeleteAsset = (id: string) => {
    updateState((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== id),
    }));
  };

  const handleUpdateLiability = (liability: Liability) => {
    updateState((prev) => ({
      ...prev,
      liabilities: prev.liabilities.map((l) => (l.id === liability.id ? liability : l)),
    }));
  };

  const handleAddLiability = (liability: Omit<Liability, 'id' | 'updatedAt'>) => {
    const newLiability: Liability = {
      ...liability,
      id: `li-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      liabilities: [...prev.liabilities, newLiability],
    }));
  };

  const handleDeleteLiability = (id: string) => {
    updateState((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((l) => l.id !== id),
    }));
  };

  const handleAddBusinessLead = (lead: Omit<BusinessLead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: BusinessLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      businessLeads: [newLead, ...prev.businessLeads],
    }));
  };

  const handleUpdateBusinessLead = (lead: BusinessLead) => {
    updateState((prev) => ({
      ...prev,
      businessLeads: prev.businessLeads.map((l) => (l.id === lead.id ? lead : l)),
    }));
  };

  const handleDeleteBusinessLead = (id: string) => {
    updateState((prev) => ({
      ...prev,
      businessLeads: prev.businessLeads.filter((l) => l.id !== id),
    }));
  };

  const handleAddKnowledgeNote = (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: KnowledgeNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      knowledgeNotes: [newNote, ...prev.knowledgeNotes],
    }));
  };

  const handleDeleteKnowledgeNote = (id: string) => {
    updateState((prev) => ({
      ...prev,
      knowledgeNotes: prev.knowledgeNotes.filter((n) => n.id !== id),
    }));
  };

  const handleAddDecision = (dec: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDec: Decision = {
      ...dec,
      id: `dec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      decisions: [newDec, ...prev.decisions],
    }));
  };

  const handleDeleteDecision = (id: string) => {
    updateState((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((d) => d.id !== id),
    }));
  };

  const handleToggleWorkflowStep = (_id: string) => {
    // Interactive workflow toggling
  };

  const handleToggleCadenceBlock = (id: string) => {
    updateState((prev) => ({
      ...prev,
      deepWorkBlocks: prev.deepWorkBlocks.map((b) =>
        b.id === id ? { ...b, completedToday: !b.completedToday } : b
      ),
    }));
  };

  const handleAddReview = (rev: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...rev,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      reviews: [newRev, ...prev.reviews],
    }));
  };

  const handleDeleteReview = (id: string) => {
    updateState((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== id),
    }));
  };

  const handleUpdateRoadmapItem = (itemId: string, updates: Partial<RoadmapItem>) => {
    updateState((prev) => ({
      ...prev,
      roadmap: prev.roadmap.map((y) => (y.id === itemId ? { ...y, ...updates } : y)),
    }));
  };

  const handleAddRoadmapItem = (item: Omit<RoadmapItem, 'id' | 'updatedAt'>) => {
    const newItem: RoadmapItem = {
      ...item,
      id: `rm-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      roadmap: [...prev.roadmap, newItem],
    }));
  };

  const handleDeleteRoadmapItem = (itemId: string) => {
    updateState((prev) => ({
      ...prev,
      roadmap: prev.roadmap.filter((r) => r.id !== itemId),
    }));
  };

  const handleAddStopItem = (text: string) => {
    updateState((prev) => ({
      ...prev,
      stopImmediatelyList: [...prev.stopImmediatelyList, text],
    }));
  };

  const handleRemoveStopItem = (idx: number) => {
    updateState((prev) => ({
      ...prev,
      stopImmediatelyList: prev.stopImmediatelyList.filter((_, i) => i !== idx),
    }));
  };

  const handleAddStartItem = (text: string) => {
    updateState((prev) => ({
      ...prev,
      startImmediatelyList: [...prev.startImmediatelyList, text],
    }));
  };

  const handleRemoveStartItem = (idx: number) => {
    updateState((prev) => ({
      ...prev,
      startImmediatelyList: prev.startImmediatelyList.filter((_, i) => i !== idx),
    }));
  };

  const handleSignOffCommit = () => {
    updateState((prev) => ({
      ...prev,
      lastCommittedTimestamp: new Date().toISOString(),
      commitCount: prev.commitCount + 1,
    }));
  };

  const handleUpdatePrinciple = (p: Principle) => {
    updateState((prev) => ({
      ...prev,
      principles: prev.principles.map((pr) => (pr.id === p.id ? p : pr)),
    }));
  };

  const handleAddPrinciple = (p: Omit<Principle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newP: Principle = {
      ...p,
      id: `principle-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      principles: [...prev.principles, newP],
    }));
  };

  const handleUpdatePhilosophyQuotes = (passiveQuote: string, activeQuote: string) => {
    updateState((prev) => ({
      ...prev,
      passiveAccumulationQuote: passiveQuote,
      activeCapabilityQuote: activeQuote,
    }));
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const handleUpdateGoal = (goal: Goal) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goal.id ? goal : g)),
    }));
  };

  const handleDeleteGoal = (id: string) => {
    updateState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const handleSaveDailyPerformanceLog = (log: DailyPerformanceLog) => {
    updateState((prev) => {
      const existing = prev.dailyPerformanceLogs || [];
      const filtered = existing.filter((l) => l.id !== log.id && l.date !== log.date);
      return {
        ...prev,
        dailyPerformanceLogs: [log, ...filtered],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            module: 'MODULE 01',
            action: 'EOD_PERFORMANCE_LOGGED',
            detail: `Recorded End-of-Day score of ${log.score}% (${log.grade}) for ${log.date}.`,
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const handleDeleteDailyPerformanceLog = (logId: string) => {
    updateState((prev) => ({
      ...prev,
      dailyPerformanceLogs: (prev.dailyPerformanceLogs || []).filter((l) => l.id !== logId),
    }));
  };

  const handleSyncDailyDirectives = (directives: Goal[]) => {
    updateState((prev) => {
      const nonTodayGoals = prev.goals.filter((g) => g.horizon !== 'Today');
      return {
        ...prev,
        goals: [...directives, ...nonTodayGoals],
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            module: 'MODULE 01',
            action: 'DIRECTIVES_SYNCED',
            detail: `Synchronized 4 daily strategic directives across Milestone, Financial, and Learning vectors.`,
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const handleToggleGoalAndSyncSource = (goal: Goal) => {
    const isCompleted = goal.status === 'COMPLETED' || goal.progress === 100;
    const nextCompleted = !isCompleted;
    const nextProgress = nextCompleted ? 100 : 0;
    const nextStatus = nextCompleted ? 'COMPLETED' : 'ACTIVE';
    const nowIso = new Date().toISOString();

    updateState((prev) => {
      // 1. Update matching Milestone Project step if linked
      let updatedProjects = prev.projects;
      if (goal.sourceType === 'MILESTONE_PROJECT' && (goal.sourceProjectId || goal.linkedProjectCode)) {
        updatedProjects = prev.projects.map((p) => {
          if (p.id !== goal.sourceProjectId && p.code !== goal.linkedProjectCode) return p;
          const updatedSteps = (p.steps || []).map((step) => {
            if (step.id === goal.sourceProjectStepId || (!goal.sourceProjectStepId && step.title.toLowerCase() === goal.title.toLowerCase())) {
              return {
                ...step,
                completed: nextCompleted,
                completedAt: nextCompleted ? nowIso.split('T')[0] : undefined,
              };
            }
            return step;
          });
          const completedCount = updatedSteps.filter((s) => s.completed).length;
          const totalCount = updatedSteps.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : p.progress;
          return {
            ...p,
            steps: updatedSteps,
            progress: progressPercent,
            progressLabel: `${completedCount}/${totalCount} Steps (${progressPercent}%)`,
            updatedAt: nowIso,
          };
        });
      }

      // 2. Update matching Financial OS experiment step if linked
      let updatedExpSteps = prev.businessExperimentSteps;
      if (goal.sourceType === 'FINANCIAL_OS') {
        updatedExpSteps = prev.businessExperimentSteps.map((s) => {
          if (s.id === goal.sourceFinancialStepId || (goal.sourceFinancialStepId && s.stepNumber.includes(goal.sourceFinancialStepId))) {
            return { ...s, completed: nextCompleted };
          }
          return s;
        });
      }

      // 3. Update matching Learning Engine topic if linked
      let updatedLearningTopics = prev.learningTopics;
      let updatedLearningReviews = prev.learningReviews;
      if (goal.sourceType === 'LEARNING_ENGINE' && goal.sourceLearningTopicId) {
        updatedLearningTopics = prev.learningTopics.map((t) => {
          if (t.id === goal.sourceLearningTopicId) {
            return {
              ...t,
              status: nextCompleted ? 'MASTERED' : 'IN_PROGRESS',
              retentionState: nextCompleted ? 'MASTERED' : 'OPTIMAL',
              lastReviewed: nextCompleted ? nowIso.split('T')[0] : t.lastReviewed,
              reviewCount: nextCompleted ? t.reviewCount + 1 : t.reviewCount,
              updatedAt: nowIso,
            };
          }
          return t;
        });
        if (nextCompleted) {
          updatedLearningReviews = [
            {
              id: `lr-${Date.now()}`,
              topicId: goal.sourceLearningTopicId,
              rating: 'Good',
              notes: 'Directive completed in North Star Daily Focus.',
              reviewedAt: nowIso,
            },
            ...prev.learningReviews,
          ];
        }
      }

      // 4. Update the goal itself
      const updatedGoals = prev.goals.map((g) => {
        if (g.id === goal.id) {
          return {
            ...g,
            status: nextStatus as Goal['status'],
            progress: nextProgress,
            updatedAt: nowIso,
          };
        }
        return g;
      });

      return {
        ...prev,
        goals: updatedGoals,
        projects: updatedProjects,
        businessExperimentSteps: updatedExpSteps,
        learningTopics: updatedLearningTopics,
        learningReviews: updatedLearningReviews,
        auditLogs: [
          {
            id: `audit-${Date.now()}`,
            timestamp: nowIso,
            module: 'MODULE 01',
            action: nextCompleted ? 'DIRECTIVE_COMPLETED' : 'DIRECTIVE_REOPENED',
            detail: `${nextCompleted ? 'Completed' : 'Reopened'} directive "${goal.title}" [${goal.sourceType || 'CUSTOM'}] with 2-way system sync.`,
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const handleAddProjectDirect = (proj: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newP: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((prev) => ({
      ...prev,
      projects: [...prev.projects, newP],
    }));
  };

  const handleResetToDefaults = () => {
    const resetState = posRepository.resetToSeed();
    setState(resetState);
  };

  const handleExportState = () => {
    const jsonStr = posRepository.exportJson(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_os_flightplan_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportState = (imported: POSState) => {
    const res = posRepository.importJson(JSON.stringify(imported));
    if (res.ok && res.state) {
      setState(res.state);
    }
  };

  const handleTriggerAI = async (_prompt: string) => {
    handleSelectSection('ai-guardrails');
  };

  // Mapping of active section to user friendly title
  const getSectionTitle = (sec: NavigationSection) => {
    switch (sec) {
      case 'north-star':
        return '01 // NORTH STAR & HORIZON CREED';
      case 'capability-stack':
        return '02 // CAPABILITY STACK MATRIX';
      case 'learning-engine':
        return '03 // ACTIVE LEARNING ENGINE';
      case 'milestone-projects':
        return '04 // MILESTONE PROJECTS & PROOF OF WORK';
      case 'financial-os':
        return '05 // FINANCIAL OS & BUSINESS REVENUE ENGINE';
      case 'ai-guardrails':
      case 'knowledge':
      case 'decisions':
      case 'ai-assistant':
        return '06 // COGNITION, AI GUARDRAILS & VAULT';
      case 'work-scoreboards':
      case 'reviews':
        return '07 // WORK SCOREBOARDS & 90-15-90 CADENCE';
      case 'horizon-flight-plan':
        return '08 // 10-YEAR HORIZON FLIGHT PLAN';
      case 'principle-70':
        return '09 // THE 70TH PRINCIPLE & SIGN-OFF';
      case 'goals':
        return 'GOALS & VECTORS // DIRECTIVE OVERVIEW';
      default:
        return 'EXECUTIVE BLUEPRINT TERMINAL';
    }
  };

  // STRICT SINGLE-TAB RENDERING: Always renders ONLY the specific active tab component
  const renderTabContent = () => {
    switch (activeSection) {
      case 'north-star':
      case 'goals':
        return (
          <div className="space-y-8 animate-fadeIn">
            <NorthStarSection
              state={state}
              onUpdatePrinciple={handleUpdatePrinciple}
              onAddPrinciple={handleAddPrinciple}
              onUpdatePhilosophyQuotes={handleUpdatePhilosophyQuotes}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              onNavigateToSection={handleSelectSection}
              onSaveDailyPerformanceLog={handleSaveDailyPerformanceLog}
              onDeleteDailyPerformanceLog={handleDeleteDailyPerformanceLog}
              onSyncDailyDirectives={handleSyncDailyDirectives}
              onToggleGoalAndSyncSource={handleToggleGoalAndSyncSource}
            />
          </div>
        );

      case 'capability-stack':
        return (
          <div className="space-y-8 animate-fadeIn">
            <CapabilityStack
              state={state}
              onToggleSkillMastery={handleToggleSkillMastery}
            />
          </div>
        );

      case 'learning-engine':
        return (
          <div className="space-y-8 animate-fadeIn">
            <LearningEngine
              state={state}
              onSelectCurrentStage={handleSelectCurrentStage}
              onReviewTopic={handleReviewTopic}
              onAddLearningTopic={handleAddLearningTopic}
              onUpdateLearningTopic={handleUpdateLearningTopic}
              onDeleteLearningTopic={handleDeleteLearningTopic}
            />
          </div>
        );

      case 'milestone-projects':
        return (
          <div className="space-y-8 animate-fadeIn">
            <ProjectPipeline
              state={state}
              onUpdateProject={handleUpdateProject}
              onToggleGlobalDoDGate={handleToggleGlobalDoDGate}
            />
          </div>
        );

      case 'financial-os':
        return (
          <div className="space-y-8 animate-fadeIn">
            <BusinessFinance
              state={state}
              onToggleBusinessStep={handleToggleBusinessStep}
              onUpdateBusinessStep={handleUpdateBusinessStep}
              onUpdateCommercialExperiment={handleUpdateCommercialExperiment}
              onUpdateFinancialTarget={handleUpdateFinancialTarget}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onUpdateAsset={handleUpdateAsset}
              onAddAsset={handleAddAsset}
              onDeleteAsset={handleDeleteAsset}
              onUpdateLiability={handleUpdateLiability}
              onAddLiability={handleAddLiability}
              onDeleteLiability={handleDeleteLiability}
              onAddBusinessLead={handleAddBusinessLead}
              onUpdateBusinessLead={handleUpdateBusinessLead}
              onDeleteBusinessLead={handleDeleteBusinessLead}
            />
          </div>
        );

      case 'ai-guardrails':
      case 'knowledge':
      case 'decisions':
      case 'ai-assistant':
        return (
          <div className="space-y-8 animate-fadeIn">
            <CognitionAI
              state={state}
              onAddKnowledgeNote={handleAddKnowledgeNote}
              onDeleteKnowledgeNote={handleDeleteKnowledgeNote}
              onAddDecision={handleAddDecision}
              onDeleteDecision={handleDeleteDecision}
              onToggleWorkflowStep={handleToggleWorkflowStep}
            />
          </div>
        );

      case 'work-scoreboards':
      case 'reviews':
        return (
          <div className="space-y-8 animate-fadeIn">
            <DailyCadenceFlightPlan
              state={state}
              onToggleCadenceBlock={handleToggleCadenceBlock}
              onAddReview={handleAddReview}
              onDeleteReview={handleDeleteReview}
              onUpdateRoadmapItem={handleUpdateRoadmapItem}
              onNavigateToSection={handleSelectSection}
            />
          </div>
        );

      case 'horizon-flight-plan':
        return (
          <div className="space-y-8 animate-fadeIn">
            <HorizonSection
              state={state}
              onUpdateHorizonMetric={handleUpdateHorizonMetric}
              onUpdateHorizonText={handleUpdateHorizonText}
              onSelectCreedStage={handleSelectCreedStage}
              onUpdateRoadmapItem={handleUpdateRoadmapItem}
              onAddRoadmapItem={handleAddRoadmapItem}
              onDeleteRoadmapItem={handleDeleteRoadmapItem}
              onUpdateGoal={handleUpdateGoal}
              onNavigateToSection={handleSelectSection}
            />
          </div>
        );

      case 'principle-70':
        return (
          <div className="space-y-8 animate-fadeIn">
            <SignOffSection
              state={state}
              onAddStopItem={handleAddStopItem}
              onRemoveStopItem={handleRemoveStopItem}
              onAddStartItem={handleAddStartItem}
              onRemoveStartItem={handleRemoveStartItem}
              onSignOffCommit={handleSignOffCommit}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-8 animate-fadeIn">
            <NorthStarSection
              state={state}
              onUpdatePrinciple={handleUpdatePrinciple}
              onAddPrinciple={handleAddPrinciple}
              onUpdatePhilosophyQuotes={handleUpdatePhilosophyQuotes}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-[#111318] text-[#e2e2e8] flex flex-col ${androidPreviewMode ? 'max-w-[430px] mx-auto border-x border-[#3c4a42]/40 shadow-2xl' : ''}`}>
      {/* Top Header */}
      <ExecutiveHeader
        onSelectSection={handleSelectSection}
        onOpenQuickCreate={() => setQuickCreateOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        androidPreviewMode={androidPreviewMode}
        onToggleAndroidPreview={() => setAndroidPreviewMode((prev) => !prev)}
        version={state.version}
        operatorName={state.operatorName}
      />

      {/* Responsive Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onOpenQuickCreate={() => setQuickCreateOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenSettings={() => setCommandPaletteOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        version={state.version}
      />

      {/* Main Content Area - Renders exclusively one tab view at a time */}
      <main className={`flex-1 transition-all pt-18 pb-16 px-4 md:px-8 ${androidPreviewMode ? 'lg:pl-4' : 'lg:pl-72'}`}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Single Tab Control & Breadcrumb Bar */}
          <div className="p-4 rounded-xl bg-[#1a1c20]/90 border border-[#3c4a42]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#4edea3] tracking-widest uppercase block font-bold">
                  ACTIVE TERMINAL VIEW (ONE TAB AT A TIME)
                </span>
                <h1 className="font-mono text-base md:text-lg font-bold text-[#e2e2e8]">
                  {getSectionTitle(activeSection)}
                </h1>
              </div>
            </div>

            {/* Prev / Next Tab Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevTab}
                disabled={currentModuleIndex <= 0}
                className="px-3 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] border border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8] disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 font-mono text-xs"
                title="Navigate to Previous Tab"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">PREV TAB</span>
              </button>

              <span className="font-mono text-xs text-[#4edea3] px-2 py-1 bg-[#4edea3]/10 rounded border border-[#4edea3]/30 font-bold">
                {currentModuleIndex >= 0 ? `MOD 0${currentModuleIndex + 1} / 09` : 'VAULT VIEW'}
              </span>

              <button
                onClick={handleNextTab}
                disabled={currentModuleIndex >= CORE_MODULE_ORDER.length - 1}
                className="px-3 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] border border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8] disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 font-mono text-xs"
                title="Navigate to Next Tab"
              >
                <span className="hidden sm:inline">NEXT TAB</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Module Tab Switcher Strip - Always displays one tab at a time upon selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'north-star', label: '01 North Star', icon: <Compass className="w-3.5 h-3.5" /> },
              { id: 'capability-stack', label: '02 Capability Stack', icon: <Layers className="w-3.5 h-3.5" /> },
              { id: 'learning-engine', label: '03 Learning Engine', icon: <Brain className="w-3.5 h-3.5" /> },
              { id: 'milestone-projects', label: '04 Milestone Projects', icon: <Flag className="w-3.5 h-3.5" /> },
              { id: 'financial-os', label: '05 Financial OS', icon: <Landmark className="w-3.5 h-3.5" /> },
              { id: 'ai-guardrails', label: '06 AI Guardrails', icon: <Shield className="w-3.5 h-3.5" /> },
              { id: 'work-scoreboards', label: '07 Work Scoreboards', icon: <Gauge className="w-3.5 h-3.5" /> },
              { id: 'horizon-flight-plan', label: '08 10-Yr Horizon', icon: <Rocket className="w-3.5 h-3.5" /> },
              { id: 'principle-70', label: '09 70th Principle', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectSection(tab.id as NavigationSection)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/40 font-bold shadow-sm ring-1 ring-[#4edea3]/20'
                      : 'bg-[#1a1c20]/70 text-[#bbcabf] hover:text-[#e2e2e8] hover:bg-[#1a1c20] border-[#3c4a42]/30'
                  }`}
                >
                  <span className={isActive ? 'text-[#4edea3]' : 'text-[#bbcabf]'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Single Tab Content Container */}
          <div className="min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* Floating Action Button for Quick Directive (Mobile or Desktop) */}
      <button
        onClick={() => setQuickCreateOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] shadow-xl hover:shadow-[#4edea3]/20 transition-all cursor-pointer flex items-center gap-2 group font-mono text-xs font-bold"
        aria-label="Create Directive"
      >
        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
        <span className="hidden sm:inline">QUICK DIRECTIVE</span>
      </button>

      {/* Quick Create Modal */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onAddGoal={handleAddGoal}
        onAddProject={handleAddProjectDirect}
        onAddTopic={handleAddLearningTopic}
        onAddNote={handleAddKnowledgeNote}
        onAddDecision={handleAddDecision}
        onAddLead={handleAddBusinessLead}
        onAddTransaction={handleAddTransaction}
        onAddReview={handleAddReview}
      />

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectSection={handleSelectSection}
        onResetToDefaults={handleResetToDefaults}
        onExportState={handleExportState}
        onImportState={handleImportState}
        onTriggerAI={handleTriggerAI}
      />
    </div>
  );
};
