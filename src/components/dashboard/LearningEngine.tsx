import React, { useState, useMemo } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  Link as LinkIcon,
  X,
  Sparkles,
  Trophy,
  Filter,
  Search,
  ArrowUpDown,
  Edit3,
  Trash2,
  ShieldAlert,
  Zap,
  Check,
  Tag,
  Target,
  Flame,
  Compass,
} from 'lucide-react';
import {
  LearningStageInfo,
  LearningStageLevel,
  LearningTopic,
  POSState,
  TopicImportance,
  TopicStatus,
} from '../../models/types';

interface LearningEngineProps {
  state: POSState;
  onSelectCurrentStage: (level: LearningStageLevel) => void;
  onReviewTopic: (
    topicId: string,
    rating: 'Forgot' | 'Hard' | 'Good' | 'Easy',
    updatedStage: LearningStageLevel,
    newEvidence?: string,
    notes?: string,
    linkedProjectId?: string
  ) => void;
  onAddLearningTopic: (
    topic: Omit<
      LearningTopic,
      'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'lastReviewed'
    >
  ) => void;
  onUpdateLearningTopic?: (topic: LearningTopic) => void;
  onDeleteLearningTopic?: (topicId: string) => void;
}

const STAGE_ORDER: Record<LearningStageLevel, number> = {
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
  L6: 6,
  L7: 7,
};

const IMPORTANCE_WEIGHT: Record<TopicImportance, number> = {
  P0: 3,
  P1: 2,
  P2: 1,
};

export const LearningEngine: React.FC<LearningEngineProps> = ({
  state,
  onSelectCurrentStage,
  onReviewTopic,
  onAddLearningTopic,
  onUpdateLearningTopic,
  onDeleteLearningTopic,
}) => {
  // Navigation & Inspection State
  const [inspectedStage, setInspectedStage] = useState<LearningStageInfo | null>(
    state.learningStages.find((s) => s.level === state.currentLearningStage) ||
      state.learningStages[6]
  );
  const [stageFilter, setStageFilter] = useState<LearningStageLevel | null>(null);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'UNTOUCHED' | 'IN_PROGRESS' | 'MASTERED'>('ALL');
  const [importanceFilter, setImportanceFilter] = useState<'ALL' | 'P0' | 'P1' | 'P2'>('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'LEVEL_DESC' | 'LEVEL_ASC' | 'REVIEWS' | 'RECENT'>('PRIORITY');

  // Modals State
  const [activeTopicForReview, setActiveTopicForReview] = useState<LearningTopic | null>(null);
  const [topicToEdit, setTopicToEdit] = useState<LearningTopic | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<LearningTopic | null>(null);

  // Review Modal State
  const [selectedStageForReview, setSelectedStageForReview] = useState<LearningStageLevel>('L1');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [reviewNotesInput, setReviewNotesInput] = useState('');
  const [linkedProjectInput, setLinkedProjectInput] = useState('');

  // Add Topic Modal State
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicImportance, setNewTopicImportance] = useState<TopicImportance>('P0');
  const [newTopicCategory, setNewTopicCategory] = useState('Distributed Systems');
  const [newTopicStage, setNewTopicStage] = useState<LearningStageLevel>('L1');
  const [newTopicTargetLevel, setNewTopicTargetLevel] = useState<LearningStageLevel>('L7');
  const [newTopicAction, setNewTopicAction] = useState('Blank paper reconstruction');
  const [newTopicStatus, setNewTopicStatus] = useState<TopicStatus>('UNTOUCHED');
  const [newTopicLinkedProject, setNewTopicLinkedProject] = useState('');
  const [newTopicNotes, setNewTopicNotes] = useState('');

  // Edit Topic State
  const [editTitle, setEditTitle] = useState('');
  const [editImportance, setEditImportance] = useState<TopicImportance>('P0');
  const [editCategory, setEditCategory] = useState('');
  const [editStage, setEditStage] = useState<LearningStageLevel>('L1');
  const [editTargetLevel, setEditTargetLevel] = useState<LearningStageLevel>('L7');
  const [editAction, setEditAction] = useState('');
  const [editStatus, setEditStatus] = useState<TopicStatus>('IN_PROGRESS');
  const [editRetentionState, setEditRetentionState] = useState<'OPTIMAL' | 'DUE_TODAY' | 'REINFORCE' | 'MASTERED'>('OPTIMAL');
  const [editLinkedProject, setEditLinkedProject] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Telemetry Calculations
  const telemetry = useMemo(() => {
    const total = state.learningTopics.length;
    const mastered = state.learningTopics.filter(
      (t) => t.status === 'MASTERED' || t.retentionState === 'MASTERED' || t.stage === 'L7'
    ).length;
    const untouched = state.learningTopics.filter((t) => t.status === 'UNTOUCHED' || t.reviewCount === 0).length;
    const dueToday = state.learningTopics.filter((t) => t.retentionState === 'DUE_TODAY').length;
    const inProgress = total - mastered - untouched;
    const p0Count = state.learningTopics.filter((t) => t.importance === 'P0').length;

    // Average Level
    const totalLevelWeight = state.learningTopics.reduce(
      (acc, t) => acc + (STAGE_ORDER[t.stage] || 1),
      0
    );
    const avgLevelNum = total > 0 ? (totalLevelWeight / total).toFixed(1) : '1.0';

    return { total, mastered, untouched, dueToday, inProgress, p0Count, avgLevelNum };
  }, [state.learningTopics]);

  // Stage Topic Counts
  const topicsByStage = useMemo(() => {
    const counts: Record<LearningStageLevel, number> = {
      L1: 0,
      L2: 0,
      L3: 0,
      L4: 0,
      L5: 0,
      L6: 0,
      L7: 0,
    };
    state.learningTopics.forEach((t) => {
      if (counts[t.stage] !== undefined) {
        counts[t.stage]++;
      }
    });
    return counts;
  }, [state.learningTopics]);

  // Filtered & Sorted Topics
  const filteredTopics = useMemo(() => {
    return state.learningTopics
      .filter((t) => {
        // Stage filter from left panel
        if (stageFilter && t.stage !== stageFilter) return false;

        // Status tab filter
        if (statusFilter === 'DUE' && t.retentionState !== 'DUE_TODAY') return false;
        if (statusFilter === 'UNTOUCHED' && t.status !== 'UNTOUCHED' && t.reviewCount > 0) return false;
        if (statusFilter === 'MASTERED' && t.status !== 'MASTERED' && t.retentionState !== 'MASTERED') return false;
        if (statusFilter === 'IN_PROGRESS') {
          if (t.status === 'UNTOUCHED' || t.status === 'MASTERED' || t.retentionState === 'MASTERED') return false;
        }

        // Importance filter
        if (importanceFilter !== 'ALL' && t.importance !== importanceFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.topic.toLowerCase().includes(q);
          const matchCategory = (t.category || '').toLowerCase().includes(q);
          const matchAction = t.protocolAction.toLowerCase().includes(q);
          const matchNotes = (t.notes || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchAction && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRIORITY') {
          const diff = (IMPORTANCE_WEIGHT[b.importance || 'P1'] || 1) - (IMPORTANCE_WEIGHT[a.importance || 'P1'] || 1);
          if (diff !== 0) return diff;
          return (STAGE_ORDER[b.stage] || 1) - (STAGE_ORDER[a.stage] || 1);
        }
        if (sortBy === 'LEVEL_DESC') {
          return (STAGE_ORDER[b.stage] || 1) - (STAGE_ORDER[a.stage] || 1);
        }
        if (sortBy === 'LEVEL_ASC') {
          return (STAGE_ORDER[a.stage] || 1) - (STAGE_ORDER[b.stage] || 1);
        }
        if (sortBy === 'REVIEWS') {
          return b.reviewCount - a.reviewCount;
        }
        if (sortBy === 'RECENT') {
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        }
        return 0;
      });
  }, [state.learningTopics, stageFilter, statusFilter, importanceFilter, searchQuery, sortBy]);

  // Open Review Modal
  const openReviewModal = (topic: LearningTopic) => {
    setActiveTopicForReview(topic);
    setSelectedStageForReview(topic.stage);
    setEvidenceInput('');
    setReviewNotesInput(topic.notes || '');
    setLinkedProjectInput(topic.linkedProjectId || '');
  };

  // Submit Review & Grade
  const handleReviewSubmit = (rating: 'Forgot' | 'Hard' | 'Good' | 'Easy') => {
    if (!activeTopicForReview) return;

    // Call review handler
    onReviewTopic(
      activeTopicForReview.id,
      rating,
      selectedStageForReview,
      evidenceInput.trim() || undefined,
      reviewNotesInput.trim(),
      linkedProjectInput || undefined
    );

    // If update handler is available, ensure status and retention state are accurately synchronized
    if (onUpdateLearningTopic) {
      let nextState: 'OPTIMAL' | 'DUE_TODAY' | 'REINFORCE' | 'MASTERED' = 'OPTIMAL';
      let nextInterval = '7 days';
      let nextStatus: TopicStatus = activeTopicForReview.status === 'UNTOUCHED' ? 'IN_PROGRESS' : activeTopicForReview.status;

      if (rating === 'Forgot') {
        nextState = 'REINFORCE';
        nextInterval = 'Day 0 (Reset)';
      } else if (rating === 'Hard') {
        nextState = 'DUE_TODAY';
        nextInterval = 'Tomorrow';
      } else if (rating === 'Good') {
        nextState = 'OPTIMAL';
        nextInterval = '+7 days';
      } else if (rating === 'Easy') {
        nextInterval = '+30 days';
        if (selectedStageForReview === 'L7' || selectedStageForReview === activeTopicForReview.targetLevel) {
          nextState = 'MASTERED';
          nextStatus = 'MASTERED';
        } else {
          nextState = 'OPTIMAL';
        }
      }

      onUpdateLearningTopic({
        ...activeTopicForReview,
        stage: selectedStageForReview,
        stageLabel: state.learningStages.find((s) => s.level === selectedStageForReview)?.name || activeTopicForReview.stageLabel,
        status: nextStatus,
        retentionState: nextState,
        intervalLabel: nextInterval,
        nextReview: nextInterval,
        lastReviewed: 'Today',
        reviewCount: activeTopicForReview.reviewCount + 1,
        evidence: evidenceInput.trim() ? [...activeTopicForReview.evidence, evidenceInput.trim()] : activeTopicForReview.evidence,
        notes: reviewNotesInput.trim() || activeTopicForReview.notes,
        linkedProjectId: linkedProjectInput || activeTopicForReview.linkedProjectId,
        updatedAt: new Date().toISOString(),
      });
    }

    setActiveTopicForReview(null);
  };

  // Open Edit Modal
  const openEditModal = (topic: LearningTopic) => {
    setTopicToEdit(topic);
    setEditTitle(topic.topic);
    setEditImportance(topic.importance || 'P1');
    setEditCategory(topic.category || 'Engineering');
    setEditStage(topic.stage);
    setEditTargetLevel(topic.targetLevel || 'L7');
    setEditAction(topic.protocolAction);
    setEditStatus(topic.status || 'IN_PROGRESS');
    setEditRetentionState(topic.retentionState);
    setEditLinkedProject(topic.linkedProjectId || '');
    setEditNotes(topic.notes || '');
  };

  // Save Edit Topic
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicToEdit || !editTitle.trim()) return;

    if (onUpdateLearningTopic) {
      const stageInfo = state.learningStages.find((s) => s.level === editStage);
      onUpdateLearningTopic({
        ...topicToEdit,
        topic: editTitle.trim(),
        importance: editImportance,
        category: editCategory.trim() || 'General',
        stage: editStage,
        stageLabel: stageInfo?.name || topicToEdit.stageLabel,
        targetLevel: editTargetLevel,
        protocolAction: editAction.trim() || 'Blank paper reconstruction',
        status: editStatus,
        retentionState: editRetentionState,
        linkedProjectId: editLinkedProject || undefined,
        notes: editNotes.trim(),
        updatedAt: new Date().toISOString(),
      });
    }

    setTopicToEdit(null);
  };

  // Quick Advance Level on Card
  const handleQuickAdvanceStage = (topic: LearningTopic) => {
    const currentNum = STAGE_ORDER[topic.stage] || 1;
    if (currentNum >= 7) return;
    const nextLevelKey = (`L${currentNum + 1}`) as LearningStageLevel;
    const stageInfo = state.learningStages.find((s) => s.level === nextLevelKey);

    if (onUpdateLearningTopic) {
      const isTargetReached = nextLevelKey === (topic.targetLevel || 'L7');
      onUpdateLearningTopic({
        ...topic,
        stage: nextLevelKey,
        stageLabel: stageInfo?.name || topic.stageLabel,
        status: isTargetReached ? 'MASTERED' : 'IN_PROGRESS',
        retentionState: isTargetReached ? 'MASTERED' : topic.retentionState,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Create New Topic
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const stageInfo = state.learningStages.find((s) => s.level === newTopicStage);
    const isUntouched = newTopicStatus === 'UNTOUCHED';

    onAddLearningTopic({
      code: isUntouched ? 'QUEUED' : 'DAY 0',
      topic: newTopicTitle.trim(),
      importance: newTopicImportance,
      status: newTopicStatus,
      category: newTopicCategory.trim() || 'Engineering Architecture',
      targetLevel: newTopicTargetLevel,
      stage: newTopicStage,
      stageLabel: stageInfo?.name || 'Recall',
      intervalLabel: isUntouched ? 'Not Started' : 'Today',
      protocolAction: newTopicAction.trim() || 'Blank paper reconstruction',
      nextReview: isUntouched ? 'Backlog' : 'Today',
      retentionState: isUntouched ? 'OPTIMAL' : 'DUE_TODAY',
      evidence: [],
      linkedProjectId: newTopicLinkedProject || undefined,
      notes: newTopicNotes.trim(),
    });

    // Reset Form
    setNewTopicTitle('');
    setNewTopicNotes('');
    setNewTopicImportance('P0');
    setNewTopicStatus('UNTOUCHED');
    setShowAddModal(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (topicToDelete && onDeleteLearningTopic) {
      onDeleteLearningTopic(topicToDelete.id);
      setTopicToDelete(null);
    }
  };

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/85 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-6"
      id="learning-engine"
    >
      {/* 1. Header Banner & Action Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3c4a42]/20 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[11px] text-[#4edea3] font-bold tracking-wider">
              MODULE 03
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-wider font-semibold">
              ANTI-DECAY COGNITIVE ACCUMULATOR
            </span>
          </div>
          <h2 className="text-[22px] sm:text-[24px] text-[#e2e2e8] font-bold tracking-tight">
            Learning &amp; Retention Engine
          </h2>
          <p className="text-xs text-[#bbcabf] max-w-2xl">
            First-principles retrieval schedule, Bloom-extended applied competence ladder ($L_1 \rightarrow L_7$),
            and priority-weighted zero-forget verification matrix.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-[#4edea3] hover:bg-[#3ec991] text-[#003824] font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(78,222,163,0.25)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Retrieval Topic
          </button>
        </div>
      </div>

      {/* 2. Executive Telemetry HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0c0e12]/80 border border-[#3c4a42]/40 flex flex-col">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
            Total Knowledge
          </span>
          <div className="text-2xl font-bold font-mono text-[#e2e2e8] mt-1">
            {telemetry.total}
          </div>
          <span className="font-mono text-[10px] text-[#86948a] mt-0.5">
            Indexed Concepts
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0e12]/80 border border-[#c9a227]/30 flex flex-col">
          <span className="font-mono text-[10px] text-[#c9a227] uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#c9a227]" /> Mastered
          </span>
          <div className="text-2xl font-bold font-mono text-[#c9a227] mt-1">
            {telemetry.mastered}
          </div>
          <span className="font-mono text-[10px] text-[#86948a] mt-0.5">
            {telemetry.total > 0 ? Math.round((telemetry.mastered / telemetry.total) * 100) : 0}% Permanent Retention
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0e12]/80 border border-[#ffb4ab]/30 flex flex-col">
          <span className="font-mono text-[10px] text-[#ffb4ab] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#ffb4ab]" /> P0 Critical
          </span>
          <div className="text-2xl font-bold font-mono text-[#ffb4ab] mt-1">
            {telemetry.p0Count}
          </div>
          <span className="font-mono text-[10px] text-[#86948a] mt-0.5">
            System-Defining Pillars
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0e12]/80 border border-[#4cd7f6]/30 flex flex-col">
          <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#4cd7f6]" /> In-Flight
          </span>
          <div className="text-2xl font-bold font-mono text-[#4cd7f6] mt-1">
            {telemetry.inProgress}
          </div>
          <span className="font-mono text-[10px] text-[#86948a] mt-0.5">
            Active Spaced Cycles
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0e12]/80 border border-[#bbcabf]/30 flex flex-col">
          <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#bbcabf]" /> Untouched
          </span>
          <div className="text-2xl font-bold font-mono text-[#e2e2e8] mt-1">
            {telemetry.untouched}
          </div>
          <span className="font-mono text-[10px] text-[#86948a] mt-0.5">
            Queued Backlog
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0e12]/80 border border-[#4edea3]/40 flex flex-col">
          <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3 h-3 text-[#4edea3]" /> Avg Level
          </span>
          <div className="text-2xl font-bold font-mono text-[#4edea3] mt-1">
            L{telemetry.avgLevelNum}
          </div>
          <span className="font-mono text-[10px] text-[#86948a] mt-0.5">
            Ladder Elevation
          </span>
        </div>
      </div>

      {/* 3. Main Operational View: Left Ladder vs Right Schedule Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 Levels of Applied Competence (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[#e2e2e8] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#4edea3]" /> 7 Levels Ladder
            </span>
            {stageFilter ? (
              <button
                onClick={() => setStageFilter(null)}
                className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#93000a]/50 flex items-center gap-1 cursor-pointer"
              >
                Clear L{stageFilter} Filter <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="font-mono text-[10px] text-[#86948a]">
                Tap level to filter
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {state.learningStages.map((stage) => {
              const count = topicsByStage[stage.level] || 0;
              const isSelectedFilter = stageFilter === stage.level;
              const isGlobalTarget = state.currentLearningStage === stage.level;
              const isInspected = inspectedStage?.level === stage.level;

              return (
                <div
                  key={stage.level}
                  className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer ${
                    isSelectedFilter
                      ? 'bg-[#282a2e] border-[#4edea3] shadow-[0_0_12px_rgba(78,222,163,0.2)]'
                      : isInspected
                      ? 'bg-[#1e2024] border-[#4cd7f6]/60'
                      : 'bg-[#0c0e12]/60 border-[#3c4a42]/30 hover:border-[#4cd7f6]/40 hover:bg-[#1e2024]/70'
                  }`}
                  onClick={() => {
                    setInspectedStage(stage);
                    setStageFilter(isSelectedFilter ? null : stage.level);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          isSelectedFilter
                            ? 'bg-[#4edea3] text-[#003824]'
                            : stage.level === 'L7'
                            ? 'bg-[#c9a227]/20 text-[#c9a227]'
                            : stage.level === 'L5' || stage.level === 'L6'
                            ? 'bg-[#4edea3]/20 text-[#4edea3]'
                            : 'bg-[#282a2e] text-[#bbcabf]'
                        }`}
                      >
                        {stage.level}
                      </span>
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelectedFilter
                            ? 'text-[#4edea3]'
                            : isGlobalTarget
                            ? 'text-[#e2e2e8] font-bold'
                            : 'text-[#e2e2e8]'
                        }`}
                      >
                        {stage.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          count > 0
                            ? 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30'
                            : 'bg-[#1e2024] text-[#86948a]'
                        }`}
                      >
                        {count} {count === 1 ? 'topic' : 'topics'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#86948a] pt-0.5">
                    <span className="truncate">{stage.shortRule}</span>
                    {isGlobalTarget && (
                      <span className="text-[#4edea3] font-bold shrink-0">
                        [GLOBAL TARGET]
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspected Stage Details Panel */}
          {inspectedStage && (
            <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/50 flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#4edea3] font-bold">
                  {inspectedStage.level} // {inspectedStage.name.toUpperCase()}
                </span>
                {state.currentLearningStage !== inspectedStage.level ? (
                  <button
                    onClick={() => onSelectCurrentStage(inspectedStage.level)}
                    className="px-2 py-0.5 rounded bg-[#4edea3]/15 hover:bg-[#4edea3]/25 border border-[#4edea3]/40 font-mono text-[10px] text-[#4edea3] cursor-pointer"
                  >
                    Set as Global Target
                  </button>
                ) : (
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold">
                    ACTIVE GOAL
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#bbcabf] leading-relaxed">
                {inspectedStage.definition}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {inspectedStage.objectives.map((obj) => (
                  <span
                    key={obj}
                    className="font-mono text-[10px] text-[#e2e2e8] bg-[#1e2024] px-2 py-0.5 rounded border border-[#3c4a42]/30"
                  >
                    ✓ {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Retrieval Topics & Spaced Repetition Matrix (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Controls: Search, Filters & Sorting Bar */}
          <div className="p-3 rounded-lg bg-[#0c0e12]/80 border border-[#3c4a42]/40 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86948a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by topic, keyword, category, or notes..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40 text-xs text-[#e2e2e8] placeholder-[#86948a] focus:outline-none focus:border-[#4edea3]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-[#86948a] hover:text-[#e2e2e8]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Priority filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#86948a] hidden sm:inline" />
                <select
                  value={importanceFilter}
                  onChange={(e) => setImportanceFilter(e.target.value as any)}
                  className="bg-[#1e2024] border border-[#3c4a42]/40 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="P0">P0 — Critical Only</option>
                  <option value="P1">P1 — High</option>
                  <option value="P2">P2 — Standard</option>
                </select>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#1e2024] border border-[#3c4a42]/40 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                >
                  <option value="PRIORITY">Sort: Priority (P0 → P2)</option>
                  <option value="LEVEL_DESC">Sort: Level (High → Low)</option>
                  <option value="LEVEL_ASC">Sort: Level (Low → High)</option>
                  <option value="REVIEWS">Sort: Review Count</option>
                  <option value="RECENT">Sort: Recently Updated</option>
                </select>
              </div>
            </div>

            {/* Filter Tabs: Status */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#3c4a42]/30">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded font-mono text-xs font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-[#4edea3] text-[#003824]'
                    : 'bg-[#1e2024] text-[#bbcabf] hover:bg-[#282a2e]'
                }`}
              >
                All Topics ({state.learningTopics.length})
              </button>

              <button
                onClick={() => setStatusFilter('DUE')}
                className={`px-3 py-1 rounded font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'DUE'
                    ? 'bg-[#ffb4ab] text-[#93000a] font-bold'
                    : 'bg-[#1e2024] text-[#ffb4ab] hover:bg-[#282a2e]'
                }`}
              >
                <Flame className="w-3 h-3" /> Due for Review ({telemetry.dueToday})
              </button>

              <button
                onClick={() => setStatusFilter('UNTOUCHED')}
                className={`px-3 py-1 rounded font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'UNTOUCHED'
                    ? 'bg-[#bbcabf] text-[#003824] font-bold'
                    : 'bg-[#1e2024] text-[#bbcabf] hover:bg-[#282a2e]'
                }`}
              >
                <Clock className="w-3 h-3" /> Untouched Backlog ({telemetry.untouched})
              </button>

              <button
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1 rounded font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-[#4cd7f6] text-[#003824] font-bold'
                    : 'bg-[#1e2024] text-[#4cd7f6] hover:bg-[#282a2e]'
                }`}
              >
                <Zap className="w-3 h-3" /> In-Flight ({telemetry.inProgress})
              </button>

              <button
                onClick={() => setStatusFilter('MASTERED')}
                className={`px-3 py-1 rounded font-mono text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'MASTERED'
                    ? 'bg-[#c9a227] text-[#003824] font-bold'
                    : 'bg-[#1e2024] text-[#c9a227] hover:bg-[#282a2e]'
                }`}
              >
                <Trophy className="w-3 h-3" /> Mastered ({telemetry.mastered})
              </button>
            </div>
          </div>

          {/* Active Filter Notice */}
          {stageFilter && (
            <div className="px-3.5 py-2 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-between text-xs font-mono text-[#4edea3]">
              <span>
                Filtered by Competence Stage: <strong>{stageFilter} — {state.learningStages.find((s) => s.level === stageFilter)?.name}</strong>
              </span>
              <button
                onClick={() => setStageFilter(null)}
                className="underline hover:text-white cursor-pointer font-bold"
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* Topics List Stream */}
          {filteredTopics.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 text-center flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-[#86948a]" />
              <div className="text-sm font-semibold text-[#e2e2e8]">
                No learning topics match the active filters
              </div>
              <p className="text-xs text-[#86948a] max-w-sm">
                Try clearing your search query, adjusting your stage/priority filter, or add a new topic to this category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStageFilter(null);
                  setStatusFilter('ALL');
                  setImportanceFilter('ALL');
                }}
                className="mt-1 px-3 py-1.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-xs font-mono text-[#4edea3] border border-[#4edea3]/30 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map((item) => {
                const isDue = item.retentionState === 'DUE_TODAY';
                const isUntouched = item.status === 'UNTOUCHED' || item.reviewCount === 0;
                const isMastered = item.status === 'MASTERED' || item.retentionState === 'MASTERED' || item.stage === 'L7';
                const isP0 = item.importance === 'P0';
                const isP1 = item.importance === 'P1';

                const levelIndex = STAGE_ORDER[item.stage] || 1;
                const targetIndex = STAGE_ORDER[item.targetLevel || 'L7'] || 7;

                const linkedProject = state.projects.find((p) => p.id === item.linkedProjectId);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                      isDue
                        ? 'bg-[#1e2024] border-[#ffb4ab]/50 shadow-[0_0_15px_rgba(255,180,171,0.08)]'
                        : isMastered
                        ? 'bg-[#171a1d] border-[#c9a227]/40'
                        : isP0
                        ? 'bg-[#1a1c20] border-[#3c4a42]/60 hover:border-[#ffb4ab]/40'
                        : 'bg-[#1a1c20] border-[#3c4a42]/40 hover:border-[#4cd7f6]/40'
                    }`}
                  >
                    {/* Top Row: Priority, Category, Status Badges & Quick Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border tracking-wider ${
                            isP0
                              ? 'bg-[#93000a]/25 text-[#ffb4ab] border-[#ffb4ab]/40'
                              : isP1
                              ? 'bg-[#4cd7f6]/15 text-[#4cd7f6] border-[#4cd7f6]/30'
                              : 'bg-[#282a2e] text-[#bbcabf] border-[#3c4a42]/40'
                          }`}
                        >
                          {item.importance || 'P1'} // {isP0 ? 'CRITICAL' : isP1 ? 'HIGH' : 'STANDARD'}
                        </span>

                        {/* Category */}
                        {item.category && (
                          <span className="px-2 py-0.5 rounded bg-[#0c0e12] border border-[#3c4a42]/40 font-mono text-[10px] text-[#bbcabf] flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5 text-[#4edea3]" />
                            {item.category}
                          </span>
                        )}

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            isMastered
                              ? 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/40 flex items-center gap-1'
                              : isDue
                              ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 animate-pulse'
                              : isUntouched
                              ? 'bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/40'
                              : 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30'
                          }`}
                        >
                          {isMastered ? (
                            <>
                              <Trophy className="w-3 h-3 text-[#c9a227]" /> MASTERED
                            </>
                          ) : isDue ? (
                            'DUE FOR RETRIEVAL'
                          ) : isUntouched ? (
                            'UNTOUCHED'
                          ) : (
                            'IN-FLIGHT'
                          )}
                        </span>
                      </div>

                      {/* Header Actions: Edit, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded bg-[#0c0e12] text-[#86948a] hover:text-[#4edea3] hover:border-[#4edea3]/40 border border-[#3c4a42]/30 cursor-pointer"
                          title="Edit Topic & Settings"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTopicToDelete(item)}
                          className="p-1 rounded bg-[#0c0e12] text-[#86948a] hover:text-[#ffb4ab] hover:border-[#ffb4ab]/40 border border-[#3c4a42]/30 cursor-pointer"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Topic Title & Details */}
                    <div>
                      <h4 className="text-[15px] font-bold text-[#e2e2e8] leading-snug">
                        {item.topic}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-[#86948a] mt-1.5">
                        <span className="text-[#bbcabf]">
                          Protocol: <strong className="text-[#e2e2e8]">{item.protocolAction}</strong>
                        </span>
                        <span>·</span>
                        <span>Reviews Logged: <strong className="text-[#e2e2e8]">{item.reviewCount}</strong></span>
                        <span>·</span>
                        <span>Next Check: <strong className="text-[#4edea3]">{item.nextReview}</strong></span>
                        {linkedProject && (
                          <>
                            <span>·</span>
                            <span className="text-[#4cd7f6] flex items-center gap-1">
                              <LinkIcon className="w-2.5 h-2.5" /> {linkedProject.code}: {linkedProject.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Visual 7-Level Competence Progress Meter */}
                    <div className="p-2.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[#bbcabf] uppercase tracking-wider">
                            Competence Level:
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-bold bg-[#4edea3]/20 text-[#4edea3]">
                            {item.stage} — {item.stageLabel}
                          </span>
                        </div>
                        <div className="text-[#86948a]">
                          Target: <strong className="text-[#e2e2e8]">{item.targetLevel || 'L7'}</strong>
                        </div>
                      </div>

                      {/* 7-Step Segment Bar */}
                      <div className="grid grid-cols-7 gap-1">
                        {(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] as LearningStageLevel[]).map((lvl, idx) => {
                          const isFilled = idx + 1 <= levelIndex;
                          const isTarget = lvl === (item.targetLevel || 'L7');
                          const isCurrent = lvl === item.stage;

                          return (
                            <div
                              key={lvl}
                              className={`h-2 rounded-xs transition-all relative ${
                                isCurrent
                                  ? 'bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.5)]'
                                  : isFilled
                                  ? 'bg-[#4edea3]/60'
                                  : 'bg-[#1e2024] border border-[#3c4a42]/40'
                              }`}
                              title={`${lvl}: ${state.learningStages.find((s) => s.level === lvl)?.name}${isCurrent ? ' (Current)' : ''}${isTarget ? ' (Target Standard)' : ''}`}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-[#86948a] pt-0.5">
                        <span>L1 Recall</span>
                        <span>L3 Application</span>
                        <span>L5 Creation</span>
                        <span>L7 Production Mastery</span>
                      </div>
                    </div>

                    {/* Bottom Row: Quick Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#3c4a42]/20">
                      <div className="flex items-center gap-2">
                        {item.evidence.length > 0 ? (
                          <span className="font-mono text-[10px] text-[#4edea3] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {item.evidence.length} Artifact{item.evidence.length > 1 ? 's' : ''} Attached
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-[#86948a] italic">
                            No verified evidence attached
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {levelIndex < 7 && (
                          <button
                            onClick={() => handleQuickAdvanceStage(item)}
                            className="px-2.5 py-1 rounded bg-[#1e2024] hover:bg-[#282a2e] border border-[#3c4a42]/50 text-[#bbcabf] hover:text-[#4edea3] font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Promote competence level to next tier"
                          >
                            + Advance to L{levelIndex + 1}
                          </button>
                        )}

                        <button
                          onClick={() => openReviewModal(item)}
                          className={`px-3 py-1 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isDue
                              ? 'bg-[#ffb4ab] text-[#93000a] hover:bg-[#ffdad6] shadow-[0_0_10px_rgba(255,180,171,0.25)]'
                              : 'bg-[#4edea3] text-[#003824] hover:bg-[#3ec991]'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {isUntouched ? 'Start First Retrieval' : 'Review & Grade'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Modal: Add Learning Topic */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl bg-[#1a1c20] border border-[#4edea3]/50 shadow-2xl p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#3c4a42]/30 pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#4edea3] font-bold uppercase tracking-wider">
                  NEW RETRIEVAL TOPIC ENCODING
                </span>
                <h3 className="text-[18px] font-bold text-[#e2e2e8] mt-0.5">
                  Add Learning Topic to Retrieval Schedule
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              {/* Topic Title */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                  Topic Title &amp; Core Invariant *
                </label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus: Raft Log Compaction & Heartbeat Quorum"
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-[#ffb4ab]" /> Priority / Importance *
                  </label>
                  <select
                    value={newTopicImportance}
                    onChange={(e) => setNewTopicImportance(e.target.value as TopicImportance)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  >
                    <option value="P0">P0 — Critical (System-defining, non-negotiable core)</option>
                    <option value="P1">P1 — High (High-leverage engineering standard)</option>
                    <option value="P2">P2 — Standard (Supporting domain or tool)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Domain / Category
                  </label>
                  <input
                    type="text"
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    placeholder="e.g. Distributed Systems, Database Internals"
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
              </div>

              {/* Starting Level vs Target Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Starting Competence Level
                  </label>
                  <select
                    value={newTopicStage}
                    onChange={(e) => setNewTopicStage(e.target.value as LearningStageLevel)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#4cd7f6] focus:outline-none focus:border-[#4edea3]"
                  >
                    {state.learningStages.map((s) => (
                      <option key={s.level} value={s.level}>
                        {s.level} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Target Competence Standard
                  </label>
                  <select
                    value={newTopicTargetLevel}
                    onChange={(e) => setNewTopicTargetLevel(e.target.value as LearningStageLevel)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#c9a227] focus:outline-none focus:border-[#4edea3]"
                  >
                    {state.learningStages.map((s) => (
                      <option key={s.level} value={s.level}>
                        Target {s.level} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Initial Queue Status & Verification Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Initial Queue Placement
                  </label>
                  <select
                    value={newTopicStatus}
                    onChange={(e) => setNewTopicStatus(e.target.value as TopicStatus)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  >
                    <option value="UNTOUCHED">Add to Untouched Backlog (Study Later)</option>
                    <option value="IN_PROGRESS">Schedule Review Immediately (Due Today)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Verification Protocol / Action
                  </label>
                  <input
                    type="text"
                    value={newTopicAction}
                    onChange={(e) => setNewTopicAction(e.target.value)}
                    placeholder="e.g. Blank paper reconstruction, code sandbox..."
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
              </div>

              {/* Link to Project */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#4cd7f6]" /> Associated Milestone Project (Optional)
                </label>
                <select
                  value={newTopicLinkedProject}
                  onChange={(e) => setNewTopicLinkedProject(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                >
                  <option value="">None (Standalone Competence)</option>
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Synthesis Notes */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                  Initial Notes or Invariants to Remember
                </label>
                <textarea
                  rows={2}
                  value={newTopicNotes}
                  onChange={(e) => setNewTopicNotes(e.target.value)}
                  placeholder="Key failure modes, memory limits, algorithmic bounds..."
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg p-2.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                />
              </div>

              <div className="pt-2 border-t border-[#3c4a42]/30 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-xs font-mono text-[#bbcabf] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#4edea3] hover:bg-[#3ec991] text-[#003824] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(78,222,163,0.2)]"
                >
                  <Plus className="w-4 h-4" /> Encode &amp; Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Edit Topic */}
      {topicToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl bg-[#1a1c20] border border-[#4cd7f6]/50 shadow-2xl p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#3c4a42]/30 pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#4cd7f6] font-bold uppercase tracking-wider">
                  TOPIC CONFIGURATION
                </span>
                <h3 className="text-[18px] font-bold text-[#e2e2e8] mt-0.5">
                  Edit Retrieval Topic
                </h3>
              </div>
              <button
                onClick={() => setTopicToEdit(null)}
                className="p-1.5 rounded bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Importance Rank *
                  </label>
                  <select
                    value={editImportance}
                    onChange={(e) => setEditImportance(e.target.value as TopicImportance)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="P0">P0 — Critical Priority</option>
                    <option value="P1">P1 — High Priority</option>
                    <option value="P2">P2 — Standard Priority</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Domain / Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Competence Stage (L1 → L7)
                  </label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as LearningStageLevel)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#4edea3] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    {state.learningStages.map((s) => (
                      <option key={s.level} value={s.level}>
                        {s.level} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Target Standard
                  </label>
                  <select
                    value={editTargetLevel}
                    onChange={(e) => setEditTargetLevel(e.target.value as LearningStageLevel)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#c9a227] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    {state.learningStages.map((s) => (
                      <option key={s.level} value={s.level}>
                        Target {s.level} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TopicStatus)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="UNTOUCHED">UNTOUCHED (Backlog)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (Active Spaced Practice)</option>
                    <option value="MASTERED">MASTERED (Permanent Storage)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                    Retention Schedule State
                  </label>
                  <select
                    value={editRetentionState}
                    onChange={(e) => setEditRetentionState(e.target.value as any)}
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="DUE_TODAY">DUE_TODAY (Needs Retrieval Now)</option>
                    <option value="OPTIMAL">OPTIMAL (On Schedule)</option>
                    <option value="REINFORCE">REINFORCE (Memory Drift Detected)</option>
                    <option value="MASTERED">MASTERED (Zero-Decay)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                  Verification Protocol / Action
                </label>
                <input
                  type="text"
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                  Linked Milestone Project
                </label>
                <select
                  value={editLinkedProject}
                  onChange={(e) => setEditLinkedProject(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                >
                  <option value="">None</option>
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}: {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                  Synthesis Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg p-2.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div className="pt-2 border-t border-[#3c4a42]/30 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTopicToEdit(null)}
                  className="px-4 py-2 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-xs font-mono text-[#bbcabf] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#4cd7f6] hover:bg-[#38c2e0] text-[#003824] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Spaced Retrieval Review & Grade */}
      {activeTopicForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl bg-[#1a1c20] border border-[#4edea3]/50 shadow-2xl p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-[#3c4a42]/30 pb-3">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#4edea3]">
                  <span>{activeTopicForReview.importance || 'P1'} PRIORITY</span>
                  <span>//</span>
                  <span>CURRENT: {activeTopicForReview.stage}</span>
                  <span>//</span>
                  <span>TARGET: {activeTopicForReview.targetLevel || 'L7'}</span>
                  <span>//</span>
                  <span>REVIEWS: {activeTopicForReview.reviewCount}</span>
                </div>
                <h3 className="text-[17px] font-bold text-[#e2e2e8] mt-1">
                  {activeTopicForReview.topic}
                </h3>
              </div>
              <button
                onClick={() => setActiveTopicForReview(null)}
                className="p-1.5 rounded bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Protocol Rule reminder */}
            <div className="p-3 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/40 text-xs font-mono text-[#bbcabf] flex items-center justify-between">
              <span>Verification Method:</span>
              <strong className="text-[#4edea3]">{activeTopicForReview.protocolAction}</strong>
            </div>

            {/* Capability Stage Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold flex items-center justify-between">
                <span>Select Attained Competence Stage ($L_1 \rightarrow L_7$)</span>
                <span className="text-[#4edea3]">Current: {selectedStageForReview}</span>
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {state.learningStages.map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setSelectedStageForReview(s.level)}
                    className={`py-1.5 rounded font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                      selectedStageForReview === s.level
                        ? 'bg-[#4edea3] text-[#003824] border-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.3)]'
                        : 'bg-[#0c0e12] text-[#bbcabf] border-[#3c4a42]/40 hover:border-[#4cd7f6]'
                    }`}
                  >
                    {s.level}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Evidence */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1.5 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-[#4edea3]" />
                Verified Evidence &amp; Artifacts ({activeTopicForReview.evidence.length})
              </label>
              {activeTopicForReview.evidence.length > 0 ? (
                <ul className="space-y-1 font-mono text-[11px] text-[#e2e2e8] bg-[#0c0e12] p-2.5 rounded-lg border border-[#3c4a42]/30 max-h-24 overflow-y-auto">
                  {activeTopicForReview.evidence.map((ev, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-[#86948a] italic p-2 bg-[#0c0e12] rounded border border-[#3c4a42]/20">
                  No production artifacts attached yet.
                </div>
              )}
              <input
                type="text"
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Attach new verified evidence (e.g. GitHub PR, load test output, whiteboard snapshot)..."
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            {/* Link to Milestone Project & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1 font-bold">
                  <LinkIcon className="w-3 h-3 text-[#4cd7f6]" /> Linked Milestone Project
                </label>
                <select
                  value={linkedProjectInput}
                  onChange={(e) => setLinkedProjectInput(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#e2e2e8]"
                >
                  <option value="">None</option>
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}: {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3 text-[#4edea3]" /> Last Retrieval
                </label>
                <div className="bg-[#0c0e12] border border-[#3c4a42]/30 rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#bbcabf]">
                  {activeTopicForReview.lastReviewed} (Next: {activeTopicForReview.nextReview})
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                Synthesis Notes &amp; Memory Traps
              </label>
              <textarea
                rows={2}
                value={reviewNotesInput}
                onChange={(e) => setReviewNotesInput(e.target.value)}
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded-lg p-2.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                placeholder="Write invariants, algorithmic bounds, or edge cases recalled..."
              />
            </div>

            {/* Grading Buttons */}
            <div className="pt-2 border-t border-[#3c4a42]/30 flex flex-col gap-2">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
                Select Retrieval Difficulty to Compute Next Interval:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Forgot')}
                  className="py-2.5 px-3 rounded-lg bg-[#93000a]/30 hover:bg-[#93000a]/50 border border-[#ffb4ab]/40 text-[#ffb4ab] font-mono text-xs font-bold cursor-pointer transition-colors"
                >
                  Forgot (Reset Day 0)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Hard')}
                  className="py-2.5 px-3 rounded-lg bg-[#c9a227]/20 hover:bg-[#c9a227]/30 border border-[#c9a227]/40 text-[#c9a227] font-mono text-xs font-bold cursor-pointer transition-colors"
                >
                  Hard (Tomorrow)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Good')}
                  className="py-2.5 px-3 rounded-lg bg-[#4cd7f6]/20 hover:bg-[#4cd7f6]/30 border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-xs font-bold cursor-pointer transition-colors"
                >
                  Good (+7 Days)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Easy')}
                  className="py-2.5 px-3 rounded-lg bg-[#4edea3]/20 hover:bg-[#4edea3]/30 border border-[#4edea3]/50 text-[#4edea3] font-mono text-xs font-bold cursor-pointer transition-colors"
                >
                  Easy (+30 Days)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {topicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-[#1a1c20] border border-[#ffb4ab]/50 shadow-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#ffb4ab]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#e2e2e8]">
                Delete Retrieval Topic?
              </h3>
            </div>
            <p className="text-xs text-[#bbcabf] leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-[#e2e2e8]">"{topicToDelete.topic}"</strong>?
              This will remove its spaced repetition history and attached evidence.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3c4a42]/30">
              <button
                onClick={() => setTopicToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#1e2024] hover:bg-[#282a2e] text-xs font-mono text-[#bbcabf] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-[#93000a] hover:bg-[#b3261e] text-xs font-mono text-white font-bold cursor-pointer"
              >
                Delete Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
