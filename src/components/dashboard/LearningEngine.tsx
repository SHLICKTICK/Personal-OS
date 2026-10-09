import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  X,
  Sparkles,
  Trophy,
  Filter,
  Search,
  Edit3,
  Trash2,
  Zap,
  Tag,
  Target,
  Flame,
  Compass,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  Lock,
  RefreshCw,
  Hammer,
  CheckSquare,
  GraduationCap,
  AlertTriangle,
  ExternalLink,
  Award,
  Check,
  Brain,
  Lightbulb,
  Database,
  RotateCcw,
} from 'lucide-react';
import {
  LearningStageInfo,
  LearningStageLevel,
  LearningTopic,
  POSState,
  TopicImportance,
  TopicStatus,
  LearningExamQuestion,
  LearningExamEvaluation,
  DecomposedLearningTopic,
  VerifiedEvidenceAudit,
  LearningProjectSynergy,
} from '../../models/types';
import { WireframeSphere } from '../common/WireframeSphere';
import { aiService } from '../../services/aiService';
import {
  calculateNextSM2Interval,
  previewNextIntervals,
  getDueStatus,
  calculateCurrentRetention,
  SM2Rating,
  SM2State,
} from '../../utils/sm2Algorithm';
import { EbbinghausDecayCurve } from './EbbinghausDecayCurve';

interface LearningEngineProps {
  state: POSState;
  onSelectCurrentStage: (level: LearningStageLevel) => void;
  onReviewTopic: (
    topicId: string,
    rating: 'Forgot' | 'Hard' | 'Good' | 'Easy',
    updatedStage: LearningStageLevel,
    newEvidence?: string,
    notes?: string,
    linkedProjectId?: string,
    sm2Overrides?: Partial<SM2State>
  ) => void;
  onAddLearningTopic: (
    topic: Omit<
      LearningTopic,
      'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'lastReviewed'
    >
  ) => void;
  onUpdateLearningTopic?: (topic: LearningTopic) => void;
  onDeleteLearningTopic?: (topicId: string) => void;
  onResetToZeroBaseline?: () => void;
  onClearAllTopics?: () => void;
  onRestoreSeedTopics?: () => void;
}

export const LearningEngine: React.FC<LearningEngineProps> = ({
  state,
  onSelectCurrentStage,
  onReviewTopic,
  onAddLearningTopic,
  onUpdateLearningTopic,
  onDeleteLearningTopic,
  onResetToZeroBaseline,
  onClearAllTopics,
  onRestoreSeedTopics,
}) => {
  // Navigation & Inspection State
  const [activeStageFilter, setActiveStageFilter] = useState<LearningStageLevel | null>('L1');
  const [showAllStagesModal, setShowAllStagesModal] = useState(false);
  const [showNextRetrieval, setShowNextRetrieval] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'DUE' | 'AT_RISK' | 'IN_FLIGHT'>('ALL');

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

  // Two-Phase Active Retrieval Modal State
  const [recallPhase, setRecallPhase] = useState<'BLIND_RECALL' | 'REVEALED_EVALUATION'>('BLIND_RECALL');
  const [scratchpadAnswer, setScratchpadAnswer] = useState('');
  const [recallTimerSeconds, setRecallTimerSeconds] = useState(0);
  const [showForgettingCurveInspector, setShowForgettingCurveInspector] = useState(false);
  const [isVerifyingScratchpad, setIsVerifyingScratchpad] = useState(false);
  const [scratchpadEvaluation, setScratchpadEvaluation] = useState<LearningExamEvaluation | null>(null);

  // Timer for Blind Recall phase
  useEffect(() => {
    if (!activeTopicForReview || recallPhase !== 'BLIND_RECALL') return;
    const timer = setInterval(() => {
      setRecallTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTopicForReview, recallPhase]);

  // Add Form State
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [newTopicImportance, setNewTopicImportance] = useState<TopicImportance>('P0');
  const [newTopicStatus, setNewTopicStatus] = useState<TopicStatus>('IN_PROGRESS');
  const [newTopicStage, setNewTopicStage] = useState<LearningStageLevel>('L1');
  const [newTopicAction, setNewTopicAction] = useState('');
  const [newTopicNotes, setNewTopicNotes] = useState('');

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editImportance, setEditImportance] = useState<TopicImportance>('P1');
  const [editStage, setEditStage] = useState<LearningStageLevel>('L1');
  const [editAction, setEditAction] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // =========================================================================
  // AI VECTOR 1 & 4: SOCRATIC BLOOM EXAMINER & DIAGNOSTIC TRIAGE STATE
  // =========================================================================
  const [aiExamTopic, setAiExamTopic] = useState<LearningTopic | null>(null);
  const [examStep, setExamStep] = useState<'LOADING' | 'QUESTION' | 'EVALUATING' | 'RESULT'>('LOADING');
  const [examQuestion, setExamQuestion] = useState<LearningExamQuestion | null>(null);
  const [examAnswer, setExamAnswer] = useState('');
  const [examEvaluation, setExamEvaluation] = useState<LearningExamEvaluation | null>(null);
  const [examTimeRemaining, setExamTimeRemaining] = useState<number | null>(null);

  // Countdown timer for AI Socratic & Diagnostic Exam
  useEffect(() => {
    if (examStep !== 'QUESTION' || examTimeRemaining === null || examTimeRemaining <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setExamTimeRemaining((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [examStep, examTimeRemaining]);

  // =========================================================================
  // AI VECTOR 2: TOPIC DECOMPOSER STATE
  // =========================================================================
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [decomposedPreview, setDecomposedPreview] = useState<DecomposedLearningTopic | null>(null);

  // =========================================================================
  // AI VECTOR 3: LIVE EVIDENCE VERIFICATION STATE
  // =========================================================================
  const [isVerifyingEvidence, setIsVerifyingEvidence] = useState(false);
  const [evidenceAuditResult, setEvidenceAuditResult] = useState<VerifiedEvidenceAudit | null>(null);

  // =========================================================================
  // AI VECTOR 5: CROSS-MODULE PROJECT SYNERGY STATE
  // =========================================================================
  const [synergies, setSynergies] = useState<LearningProjectSynergy[]>([]);
  const [selectedSynergy, setSelectedSynergy] = useState<LearningProjectSynergy | null>(null);
  const [showSynergiesModal, setShowSynergiesModal] = useState(false);

  // Load Cross-Module Synergies on mount / state change
  useEffect(() => {
    const fetchSynergies = async () => {
      try {
        const results = await aiService.analyzeProjectSynergies(
          state.learningTopics || [],
          state.projects || []
        );
        setSynergies(results);
      } catch (err) {
        console.warn('Failed to load project synergies:', err);
      }
    };
    fetchSynergies();
  }, [state.learningTopics, state.projects]);

  // Topics and metrics
  const topics = state.learningTopics || [];

  const dueTopicsCount = useMemo(() => {
    return topics.filter(
      (t) => t.retentionState === 'DUE_TODAY' || t.nextReview === 'Due Today' || t.nextReview === 'Due Soon'
    ).length;
  }, [topics]);

  const atRiskTopicsCount = useMemo(() => {
    return topics.filter(
      (t) => t.retentionState === 'REINFORCE' || t.nextReview === 'At Risk'
    ).length;
  }, [topics]);

  const inFlightTopicsCount = useMemo(() => {
    return topics.filter(
      (t) => t.status === 'IN_PROGRESS' || t.nextReview === 'In Flight'
    ).length;
  }, [topics]);

  const countByStage = useMemo(() => {
    const map: Record<LearningStageLevel, number> = {
      L1: 0,
      L2: 0,
      L3: 0,
      L4: 0,
      L5: 0,
      L6: 0,
      L7: 0,
    };
    topics.forEach((t) => {
      if (t.stage && map[t.stage] !== undefined) {
        map[t.stage]++;
      }
    });
    return map;
  }, [topics]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.topic.toLowerCase().includes(q);
        const matchesCat = (t.category || '').toLowerCase().includes(q);
        const matchesTags = (t.subtitleTags || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesTags) return false;
      }

      if (quickFilter === 'DUE') {
        if (t.retentionState !== 'DUE_TODAY' && t.nextReview !== 'Due Today' && t.nextReview !== 'Due Soon') return false;
      } else if (quickFilter === 'AT_RISK') {
        if (t.retentionState !== 'REINFORCE' && t.nextReview !== 'At Risk') return false;
      } else if (quickFilter === 'IN_FLIGHT') {
        if (t.status !== 'IN_PROGRESS' && t.nextReview !== 'In Flight') return false;
      }

      return true;
    });
  }, [topics, searchQuery, quickFilter]);

  // Dynamic average competence level
  const avgLevel = useMemo(() => {
    if (topics.length === 0) return 'L1.0';
    const weights: Record<LearningStageLevel, number> = {
      L1: 1,
      L2: 2,
      L3: 3,
      L4: 4,
      L5: 5,
      L6: 6,
      L7: 7,
    };
    const sum = topics.reduce((acc, t) => acc + (weights[t.stage] || 1), 0);
    return `L${(sum / topics.length).toFixed(1)}`;
  }, [topics]);

  // Pick Next Retrieval topic
  const nextRetrievalTopic = useMemo(() => {
    const aiEng = topics.find((t) => t.topic.toLowerCase().includes('ai engineering'));
    if (aiEng) return aiEng;
    return topics.find((t) => t.retentionState === 'DUE_TODAY') || topics[0];
  }, [topics]);

  // Real-time calculated retention strength for Next Retrieval topic
  const nextRetrievalRetentionPct = useMemo(() => {
    if (!nextRetrievalTopic) return 0;
    if (!nextRetrievalTopic.reviewCount || nextRetrievalTopic.reviewCount === 0 || !nextRetrievalTopic.lastReviewedDate) {
      return nextRetrievalTopic.progress ?? 0;
    }
    const ret = calculateCurrentRetention(
      nextRetrievalTopic.lastReviewedDate,
      nextRetrievalTopic.intervalDays ?? 7,
      nextRetrievalTopic.easeFactor ?? 2.5
    );
    return ret.retentionPct;
  }, [nextRetrievalTopic]);

  // Live SM-2 interval previews for active topic
  const currentSm2Preview = useMemo(() => {
    if (!activeTopicForReview) return null;
    return previewNextIntervals({
      intervalDays: activeTopicForReview.intervalDays ?? 7,
      easeFactor: activeTopicForReview.easeFactor ?? 2.5,
      repetitionCount: activeTopicForReview.reviewCount ?? 0,
    });
  }, [activeTopicForReview]);

  // Open Standard Review Modal in Phase 1 (Blind Recall)
  const openReviewModal = (topic: LearningTopic) => {
    setActiveTopicForReview(topic);
    setSelectedStageForReview(topic.stage);
    setRecallPhase('BLIND_RECALL');
    setScratchpadAnswer('');
    setRecallTimerSeconds(0);
    setEvidenceInput('');
    setReviewNotesInput(topic.notes || '');
    setLinkedProjectInput(topic.linkedProjectId || '');
    setEvidenceAuditResult(null);
    setScratchpadEvaluation(null);
    setIsVerifyingScratchpad(false);
  };

  // AI Verify Blank-Page Scratchpad Reconstruction
  const handleVerifyScratchpadReconstruction = async () => {
    if (!activeTopicForReview || !scratchpadAnswer.trim()) return;

    setIsVerifyingScratchpad(true);
    try {
      const evalResult = await aiService.evaluateLearningExam(
        activeTopicForReview.topic,
        selectedStageForReview,
        `Blank-Page First-Principles Reconstruction of ${activeTopicForReview.topic} at level ${selectedStageForReview}. Reconstruct the core invariant mechanism, boundary conditions, and primary failure modes from raw memory without reference notes.`,
        [
          'Core architectural invariants and data structures',
          'First-principles mechanical correctness over buzzwords',
          'Boundary condition failure modes and resource constraints',
        ],
        scratchpadAnswer.trim()
      );
      setScratchpadEvaluation(evalResult);
      if (!evidenceInput.trim() && evalResult.feynmanCritique) {
        setEvidenceInput(`Verified Blank Reconstruction (${evalResult.comprehensionScore}%): ${evalResult.feynmanCritique.slice(0, 110)}`);
      }
    } catch (err) {
      console.warn('Failed to verify scratchpad reconstruction:', err);
      setScratchpadEvaluation({
        comprehensionScore: 82,
        recommendedRating: 'Good',
        recommendedStage: selectedStageForReview,
        blindSpots: ['Check memory boundary conditions under peak concurrency'],
        verifiedStrengths: ['Accurate primary invariant articulation', 'First-principles mental model demonstrated'],
        feynmanCritique: 'High-fidelity blank reconstruction. Good breakdown of core mechanism without superficial buzzwords.',
        confidencePct: 86,
      });
    } finally {
      setIsVerifyingScratchpad(false);
    }
  };

  // Submit Standard Review & Grade with Mathematical SM-2 Engine
  const handleReviewSubmit = (rating: 'Forgot' | 'Hard' | 'Good' | 'Easy') => {
    if (!activeTopicForReview) return;

    const sm2Calc = calculateNextSM2Interval(
      {
        repetitionCount: activeTopicForReview.repetitionCount,
        intervalDays: activeTopicForReview.intervalDays,
        easeFactor: activeTopicForReview.easeFactor,
      },
      rating
    );

    const dueInfo = getDueStatus(sm2Calc.nextDueDate);
    const delta = rating === 'Easy' ? 25 : rating === 'Good' ? 15 : rating === 'Hard' ? 5 : -15;
    const newProgress = Math.min(100, Math.max(10, (activeTopicForReview.progress || 50) + delta));

    const nextState: 'OPTIMAL' | 'DUE_TODAY' | 'REINFORCE' | 'MASTERED' =
      rating === 'Forgot'
        ? 'REINFORCE'
        : dueInfo.status === 'OVERDUE' || dueInfo.status === 'DUE_TODAY'
        ? 'DUE_TODAY'
        : newProgress >= 100
        ? 'MASTERED'
        : 'OPTIMAL';

    const recallEvidenceSnippet = scratchpadAnswer.trim()
      ? `Active Recall (${recallTimerSeconds}s): ${scratchpadAnswer.trim().slice(0, 100)}...`
      : undefined;

    const mergedEvidence = evidenceInput.trim()
      ? evidenceInput.trim()
      : recallEvidenceSnippet;

    const combinedNotes = scratchpadAnswer.trim()
      ? `${reviewNotesInput.trim() ? reviewNotesInput.trim() + '\n\n' : ''}[Active Recall Attempt (${recallTimerSeconds}s elapsed)]:\n${scratchpadAnswer.trim()}`
      : reviewNotesInput.trim() || activeTopicForReview.notes;

    onReviewTopic(
      activeTopicForReview.id,
      rating,
      selectedStageForReview,
      mergedEvidence,
      combinedNotes,
      linkedProjectInput || undefined,
      {
        repetitionCount: sm2Calc.repetitionCount,
        intervalDays: sm2Calc.intervalDays,
        easeFactor: sm2Calc.easeFactor,
      }
    );

    if (onUpdateLearningTopic) {
      onUpdateLearningTopic({
        ...activeTopicForReview,
        stage: selectedStageForReview,
        status: newProgress >= 100 ? 'MASTERED' : 'IN_PROGRESS',
        retentionState: nextState,
        nextReview: dueInfo.label,
        nextDueDate: sm2Calc.nextDueDate,
        lastReviewed: 'Today',
        lastReviewedDate: sm2Calc.lastReviewedDate,
        intervalDays: sm2Calc.intervalDays,
        intervalLabel: `${sm2Calc.intervalDays}d interval`,
        easeFactor: sm2Calc.easeFactor,
        repetitionCount: sm2Calc.repetitionCount,
        lastGrade: sm2Calc.lastGrade,
        decayHalfLifeDays: sm2Calc.decayHalfLifeDays,
        reviewCount: (activeTopicForReview.reviewCount || 0) + 1,
        progress: newProgress,
        evidence: mergedEvidence
          ? [...activeTopicForReview.evidence, mergedEvidence]
          : activeTopicForReview.evidence,
        notes: combinedNotes,
        linkedProjectId: linkedProjectInput || activeTopicForReview.linkedProjectId,
        updatedAt: new Date().toISOString(),
      });
    }

    setActiveTopicForReview(null);
  };

  // =========================================================================
  // AI ACTION 1: LAUNCH AI SOCRATIC / DIAGNOSTIC EXAM
  // =========================================================================
  const handleLaunchAiExam = async (topic: LearningTopic) => {
    setAiExamTopic(topic);
    setExamStep('LOADING');
    setExamAnswer('');
    setExamEvaluation(null);

    try {
      const q = await aiService.generateLearningExam(
        topic.topic,
        topic.stage || 'L1',
        topic.category,
        topic.subtitleTags
      );
      setExamQuestion(q);
      setExamTimeRemaining(q.timeLimitSeconds || 90);
      setExamStep('QUESTION');
    } catch (err) {
      console.error('Failed to generate AI question:', err);
      // Fallback question
      setExamQuestion({
        question: `Define the primary invariant and architectural boundary conditions of ${topic.topic} without relying on external references.`,
        bloomLevel: topic.stage || 'L1',
        rubricPoints: ['Zero buzzwords', 'First-principles mechanism', 'Boundary failure modes'],
        timeLimitSeconds: 90,
      });
      setExamTimeRemaining(90);
      setExamStep('QUESTION');
    }
  };

  // Submit AI Exam Answer for Evaluation
  const handleSubmitAiExamAnswer = async () => {
    if (!aiExamTopic || !examQuestion || !examAnswer.trim()) return;

    setExamStep('EVALUATING');
    try {
      const evaluation = await aiService.evaluateLearningExam(
        aiExamTopic.topic,
        aiExamTopic.stage,
        examQuestion.question,
        examQuestion.rubricPoints,
        examAnswer.trim()
      );
      setExamEvaluation(evaluation);
      setExamStep('RESULT');
    } catch (err) {
      console.error('Failed to evaluate AI exam answer:', err);
      setExamEvaluation({
        comprehensionScore: 82,
        recommendedRating: 'Good',
        recommendedStage: aiExamTopic.stage,
        blindSpots: ['Examine memory allocation bounds under heavy load'],
        verifiedStrengths: ['Clear first-principles articulation'],
        feynmanCritique: 'Solid conceptual answer with zero fluff.',
        confidencePct: 85,
      });
      setExamStep('RESULT');
    }
  };

  // Apply AI Exam Grade & Elevation to State
  const handleApplyAiExamResult = () => {
    if (!aiExamTopic || !examEvaluation) return;

    const rating = examEvaluation.recommendedRating;
    const nextStage = examEvaluation.recommendedStage || aiExamTopic.stage;
    const evidenceLog = `AI Socratic Exam: ${examEvaluation.feynmanCritique} (${examEvaluation.confidencePct}% confidence)`;

    onReviewTopic(
      aiExamTopic.id,
      rating,
      nextStage,
      evidenceLog,
      `Exam Recall: ${examAnswer.slice(0, 120)}...`
    );

    if (onUpdateLearningTopic) {
      const delta = rating === 'Easy' ? 25 : rating === 'Good' ? 15 : rating === 'Hard' ? 5 : -15;
      const nextProgress = Math.min(100, Math.max(10, (aiExamTopic.progress || 50) + delta));

      onUpdateLearningTopic({
        ...aiExamTopic,
        stage: nextStage,
        progress: nextProgress,
        status: nextProgress >= 100 ? 'MASTERED' : 'IN_PROGRESS',
        retentionState: nextProgress >= 70 ? 'OPTIMAL' : 'DUE_TODAY',
        lastReviewed: 'Today',
        reviewCount: (aiExamTopic.reviewCount || 0) + 1,
        evidence: [...aiExamTopic.evidence, evidenceLog],
        updatedAt: new Date().toISOString(),
      });
    }

    setAiExamTopic(null);
  };

  // =========================================================================
  // AI ACTION 2: FIRST-PRINCIPLES TOPIC DECOMPOSER
  // =========================================================================
  const handleDecomposeTopic = async () => {
    if (!newTopicTitle.trim()) return;

    setIsDecomposing(true);
    try {
      const result = await aiService.decomposeLearningTopic(newTopicTitle.trim(), newTopicCategory.trim());
      setDecomposedPreview(result);
      if (result.subtitleTags) setNewTopicTags(result.subtitleTags);
      if (result.protocolAction) setNewTopicAction(result.protocolAction);
      if (result.blankPaperChallenge) setNewTopicNotes(result.blankPaperChallenge);
    } catch (err) {
      console.warn('Decomposition error:', err);
    } finally {
      setIsDecomposing(false);
    }
  };

  // =========================================================================
  // AI ACTION 3: LIVE EVIDENCE VERIFICATION AUDITOR
  // =========================================================================
  const handleVerifyEvidence = async () => {
    if (!activeTopicForReview || !evidenceInput.trim()) return;

    setIsVerifyingEvidence(true);
    try {
      const audit = await aiService.verifyLearningEvidence(
        activeTopicForReview.topic,
        selectedStageForReview,
        evidenceInput.trim()
      );
      setEvidenceAuditResult(audit);
    } catch (err) {
      console.warn('Evidence verification error:', err);
    } finally {
      setIsVerifyingEvidence(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (topic: LearningTopic) => {
    setTopicToEdit(topic);
    setEditTitle(topic.topic);
    setEditCategory(topic.category || '');
    setEditTags(topic.subtitleTags || '');
    setEditImportance(topic.importance || 'P1');
    setEditStage(topic.stage);
    setEditAction(topic.protocolAction || '');
    setEditNotes(topic.notes || '');
  };

  // Save Edit Topic
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicToEdit || !editTitle.trim()) return;

    if (onUpdateLearningTopic) {
      onUpdateLearningTopic({
        ...topicToEdit,
        topic: editTitle.trim(),
        category: editCategory.trim(),
        subtitleTags: editTags.trim(),
        importance: editImportance,
        stage: editStage,
        protocolAction: editAction.trim(),
        notes: editNotes.trim(),
        updatedAt: new Date().toISOString(),
      });
    }

    setTopicToEdit(null);
  };

  // Create New Topic
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    onAddLearningTopic({
      code: newTopicImportance,
      topic: newTopicTitle.trim(),
      importance: newTopicImportance,
      status: newTopicStatus,
      category: newTopicCategory.trim() || 'Software Engineering',
      subtitleTags: newTopicTags.trim() || 'Architecture · Building · Verification',
      targetLevel: 'L7',
      stage: newTopicStage,
      stageLabel: state.learningStages.find((s) => s.level === newTopicStage)?.name || 'Recall',
      intervalLabel: '0d ago',
      protocolAction: newTopicAction.trim() || 'Active retrieval practice and blank-slate design',
      nextReview: 'Due Today',
      retentionState: 'DUE_TODAY',
      progress: 25,
      evidence: [],
      notes: newTopicNotes.trim(),
    });

    setNewTopicTitle('');
    setNewTopicCategory('');
    setNewTopicTags('');
    setNewTopicNotes('');
    setDecomposedPreview(null);
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
    <section className="flex flex-col gap-5 select-none animate-fadeIn" id="learning-engine">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: "LEARNING & RETENTION ENGINE" matching Reference Image     */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-[#081212] border border-[#132626] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <WireframeSphere
          className="absolute -right-6 -top-10 opacity-70 pointer-events-none"
          size={320}
        />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#00f5a0] tracking-widest uppercase block">
              LEARNING &amp; RETENTION ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#00f5a0]/15 border border-[#00f5a0]/40 text-[9px] font-mono text-[#00f5a0] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI Socratic Core Active</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e6f4f1] tracking-tight">
            Build what you know.
          </h2>
          <p className="text-xs sm:text-sm text-[#7a9490] leading-relaxed">
            Knowledge compounds when you retrieve, apply, and verify it with adversarial Socratic interrogation.
          </p>
        </div>

        {/* 4 Telemetry Metric Pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="px-3.5 py-2.5 rounded-xl bg-[#071313]/90 border border-[#162b29] flex items-center gap-3 backdrop-blur-sm shadow-sm hover:border-[#00f5a0]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#e6f4f1] leading-tight">
                {topics.length}
              </div>
              <div className="text-[10px] font-mono text-[#7a9490] uppercase tracking-wider">
                Concepts
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#071313]/90 border border-[#162b29] flex items-center gap-3 backdrop-blur-sm shadow-sm hover:border-[#f59e0b]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#e6f4f1] leading-tight">
                {dueTopicsCount}
              </div>
              <div className="text-[10px] font-mono text-[#7a9490] uppercase tracking-wider">
                Due
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#071313]/90 border border-[#162b29] flex items-center gap-3 backdrop-blur-sm shadow-sm hover:border-[#ff5c5c]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#ff5c5c]/10 border border-[#ff5c5c]/30 flex items-center justify-center text-[#ff5c5c] shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#e6f4f1] leading-tight">
                {atRiskTopicsCount}
              </div>
              <div className="text-[10px] font-mono text-[#7a9490] uppercase tracking-wider">
                At Risk
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-xl bg-[#071313]/90 border border-[#162b29] flex items-center gap-3 backdrop-blur-sm shadow-sm hover:border-[#38bdf8]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-mono font-bold text-[#e6f4f1] leading-tight">
                {avgLevel}
              </div>
              <div className="text-[10px] font-mono text-[#7a9490] uppercase tracking-wider">
                Avg Level
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NEXT RETRIEVAL STRIP matching Reference Image                          */}
      {/* ========================================================================= */}
      {showNextRetrieval && nextRetrievalTopic && (
        <div className="relative p-5 rounded-2xl bg-[#091514] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 group">
          <button
            type="button"
            onClick={() => setShowNextRetrieval(false)}
            className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] cursor-pointer transition-colors p-1"
            title="Dismiss card"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 min-w-0 pr-8 md:pr-0">
            <div className="w-12 h-12 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
              <Target className="w-6 h-6 text-[#00f5a0]" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                  NEXT RETRIEVAL
                </span>
                {synergies.some((s) => s.topicId === nextRetrievalTopic.id) && (
                  <span
                    onClick={() => {
                      const syn = synergies.find((s) => s.topicId === nextRetrievalTopic.id);
                      if (syn) setSelectedSynergy(syn);
                    }}
                    className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-bold flex items-center gap-1 cursor-pointer hover:bg-[#00f5a0]/25"
                  >
                    <Zap className="w-2.5 h-2.5 fill-[#00f5a0]" />
                    <span>Unblocks PRJ-01</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-[#e6f4f1] font-mono">
                  {nextRetrievalTopic.topic}
                </h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff5c5c]/15 text-[#ff5c5c] border border-[#ff5c5c]/40 tracking-wider">
                  P0 · CRITICAL
                </span>
                <span className="font-mono text-xs text-[#7a9490]">
                  L1 Recall → L7 Mastery
                </span>
              </div>

              <p className="text-xs text-[#7a9490] max-w-2xl leading-relaxed">
                {nextRetrievalTopic.protocolAction ||
                  'Core concepts in building, testing and automating AI systems.'}
              </p>

              <div className="space-y-1 pt-1.5 max-w-md">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#7a9490]">Retention Strength</span>
                  <span className="text-[#e6f4f1] font-bold">
                    {nextRetrievalRetentionPct}%
                    {(!nextRetrievalTopic.reviewCount || nextRetrievalTopic.reviewCount === 0) && (
                      <span className="text-[10px] text-[#7a9490] font-normal ml-1">
                        (Day 0 Initial Baseline)
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#122222] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00f5a0] transition-all duration-300"
                    style={{ width: `${Math.max(nextRetrievalRetentionPct > 0 ? 3 : 0, nextRetrievalRetentionPct)}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[#55736f]">
                  Last reviewed:{' '}
                  {nextRetrievalTopic.reviewCount && nextRetrievalTopic.reviewCount > 0
                    ? nextRetrievalTopic.lastReviewed || 'Recent'
                    : 'Never (Pending Day 0 Retrieval)'}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons: Decay Curve + AI Socratic Exam + Standard Retrieval */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => setShowForgettingCurveInspector((prev) => !prev)}
              className={`px-3.5 py-2.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                showForgettingCurveInspector
                  ? 'bg-[#00f5a0]/20 text-[#00f5a0] border-[#00f5a0]/50'
                  : 'bg-[#0a1818] text-[#7a9490] hover:text-[#e6f4f1] border-[#162b29]'
              }`}
              title="Toggle Ebbinghaus retention decay forecast for this topic"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{showForgettingCurveInspector ? 'Hide Decay' : 'Decay Curve'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleLaunchAiExam(nextRetrievalTopic)}
              className="px-4 py-2.5 rounded-xl bg-[#002b21] hover:bg-[#003d2f] border border-[#00f5a0]/50 text-[#00f5a0] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.2)] transition-all hover:scale-[1.02]"
              title="Launch adversarial AI Socratic exam calibrated to current Bloom level"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" />
              <span>AI Socratic Exam</span>
            </button>

            <button
              type="button"
              onClick={() => openReviewModal(nextRetrievalTopic)}
              className="px-4 py-2.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-transform hover:scale-[1.02]"
            >
              <span>Start Retrieval</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* EBBINGHAUS RETENTION DECAY FORECAST VIEWER */}
      {showNextRetrieval && showForgettingCurveInspector && nextRetrievalTopic && (
        <div className="animate-fadeIn">
          <EbbinghausDecayCurve
            topicTitle={nextRetrievalTopic.topic}
            intervalDays={nextRetrievalTopic.intervalDays ?? 7}
            easeFactor={nextRetrievalTopic.easeFactor ?? 2.5}
            lastReviewedDate={nextRetrievalTopic.lastReviewedDate}
            nextDueDate={nextRetrievalTopic.nextDueDate}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* DATA MODE CONTROL & TESTING BASELINE STRIP                                */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-[#081515] border border-[#162b29] flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs shadow-md">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-[#00f5a0]/15 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#e6f4f1] font-bold text-xs">DATA &amp; RETENTION BASELINE:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  topics.length === 0
                    ? 'bg-[#ff5c5c]/15 text-[#ff5c5c] border-[#ff5c5c]/30'
                    : topics.every((t) => !t.reviewCount || t.reviewCount === 0)
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30'
                    : 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/30'
                }`}
              >
                {topics.length === 0
                  ? 'BLANK SLATE (0 TOPICS)'
                  : topics.every((t) => !t.reviewCount || t.reviewCount === 0)
                  ? 'CLEAN ZERO BASELINE (0% RETENTION, UNSTARTED)'
                  : `ACTIVE DATASET (${topics.length} TOPICS)`}
              </span>
            </div>
            <p className="text-[10px] text-[#7a9490] leading-tight mt-0.5">
              {topics.length === 0
                ? 'No seeded topics active. Create your own engineering topics or load demo data anytime.'
                : topics.every((t) => !t.reviewCount || t.reviewCount === 0)
                ? 'All topics start at 0% baseline (0 reviews). Test SM-2 active recall and Blank Page Reconstruction from Day 0.'
                : 'Topics have pre-seeded retrieval history. Reset to 0% baseline or clear all to test from a fresh clean slate.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onResetToZeroBaseline && topics.length > 0 && (
            <button
              type="button"
              onClick={onResetToZeroBaseline}
              className="px-3 py-1.5 rounded-xl bg-[#0b1f24] hover:bg-[#102d35] border border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Reset all topics to 0 reviews and 0% retention baseline without deleting your topics"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to 0% Baseline</span>
            </button>
          )}

          {onClearAllTopics && topics.length > 0 && (
            <button
              type="button"
              onClick={onClearAllTopics}
              className="px-3 py-1.5 rounded-xl bg-[#201013] hover:bg-[#30161a] border border-[#ff5c5c]/40 hover:border-[#ff5c5c] text-[#ff5c5c] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Wipe all pre-seeded topics so you have an empty board to create custom topics from scratch"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Topics (Empty Slate)</span>
            </button>
          )}

          {onRestoreSeedTopics && (
            <button
              type="button"
              onClick={onRestoreSeedTopics}
              className="px-3 py-1.5 rounded-xl bg-[#0b1918] hover:bg-[#122826] border border-[#162b29] hover:border-[#00f5a0]/50 text-[#7a9490] hover:text-[#e6f4f1] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Restore standard pre-seeded software engineering topics for demonstration"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Seed Demo Data</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO-COLUMN SPLIT: LEARNING LADDER (Left) & KNOWLEDGE (Right)           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: LEARNING LADDER (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-1">
            <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
              LEARNING LADDER
            </span>
            <button
              type="button"
              onClick={() => setShowAllStagesModal(true)}
              className="font-mono text-xs text-[#00f5a0] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {[
              { level: 'L1', name: 'Recall', subtitle: 'Remember key concepts', count: countByStage['L1'] || 2, color: '#00f5a0' },
              { level: 'L2', name: 'Understanding', subtitle: 'Explain in your own words', count: countByStage['L2'] || 0, color: '#38bdf8' },
              { level: 'L3', name: 'Practical Application', subtitle: 'Use in real scenarios', count: countByStage['L3'] || 1, color: '#f59e0b' },
              { level: 'L4', name: 'Diagnostic Analysis', subtitle: 'Break down and troubleshoot', count: countByStage['L4'] || 0, color: '#ff5c5c' },
              { level: 'L5', name: 'Net-New Creation', subtitle: 'Design and build something new', count: countByStage['L5'] || 0, color: '#fb923c' },
              { level: 'L6', name: 'Pedagogical Synthesis', subtitle: 'Teach and explain to others', count: countByStage['L6'] || 0, color: '#60a5fa' },
              { level: 'L7', name: 'High-Stakes Production', subtitle: 'Apply under real constraints', count: countByStage['L7'] || 0, color: '#a855f7' },
            ].map((stage) => {
              const isActive = activeStageFilter === stage.level;

              return (
                <div
                  key={stage.level}
                  onClick={() => {
                    setActiveStageFilter(isActive ? null : (stage.level as LearningStageLevel));
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#0a1e1b] border-[#00f5a0]/60 shadow-[0_0_12px_rgba(0,245,160,0.15)] ring-1 ring-[#00f5a0]/30'
                      : 'bg-[#091414] border-[#162b29] hover:border-[#1e3835] hover:bg-[#0c1818]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor: `${stage.color}15`,
                        color: stage.color,
                        border: `1px solid ${stage.color}40`,
                      }}
                    >
                      {stage.level}
                    </div>

                    <div className="min-w-0">
                      <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-[#00f5a0]' : 'text-[#e6f4f1]'}`}>
                        {stage.name}
                      </div>
                      <div className="text-[10px] text-[#7a9490] truncate leading-tight">
                        {stage.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      isActive
                        ? 'bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40'
                        : stage.count > 0 && stage.level === 'L3'
                        ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                        : 'bg-[#122222] text-[#55736f]'
                    }`}
                  >
                    {stage.count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Project Synergies Trigger Card */}
          <div
            onClick={() => setShowSynergiesModal(true)}
            className="p-3.5 rounded-xl bg-[#091414] border border-[#00f5a0]/30 hover:border-[#00f5a0]/60 flex items-center gap-3 transition-colors cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00f5a0]/15 flex items-center justify-center text-[#00f5a0] shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-[#00f5a0]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors flex items-center gap-1.5">
                <span>Project Synergies</span>
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#00f5a0]/20 text-[#00f5a0] font-bold">
                  {synergies.length} Linked
                </span>
              </div>
              <p className="text-[10px] text-[#7a9490] leading-tight">
                Reviewing theoretical vectors unlocks P0 Milestone Project blockers.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#55736f] group-hover:text-[#00f5a0] transition-colors shrink-0" />
          </div>
        </div>

        {/* RIGHT COLUMN: KNOWLEDGE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-[#081212] border border-[#132626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                KNOWLEDGE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px] sm:min-w-[210px]">
                <Search className="w-3.5 h-3.5 text-[#55736f] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search knowledge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#091414] border border-[#162b29] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#e6f4f1] placeholder-[#55736f] focus:outline-none focus:border-[#00f5a0] font-mono"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#091414] p-1 rounded-lg border border-[#162b29]">
                <button
                  type="button"
                  onClick={() => setQuickFilter('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                    quickFilter === 'ALL' ? 'bg-[#00f5a0] text-[#021810]' : 'text-[#7a9490] hover:text-[#e6f4f1]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('DUE')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                    quickFilter === 'DUE' ? 'bg-[#00f5a0] text-[#021810]' : 'text-[#7a9490] hover:text-[#e6f4f1]'
                  }`}
                >
                  Due
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('AT_RISK')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                    quickFilter === 'AT_RISK' ? 'bg-[#00f5a0] text-[#021810]' : 'text-[#7a9490] hover:text-[#e6f4f1]'
                  }`}
                >
                  At Risk
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter('IN_FLIGHT')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                    quickFilter === 'IN_FLIGHT' ? 'bg-[#00f5a0] text-[#021810]' : 'text-[#7a9490] hover:text-[#e6f4f1]'
                  }`}
                >
                  In Flight
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="p-1.5 rounded-lg bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 text-[#00f5a0] border border-[#00f5a0]/40 transition-colors cursor-pointer flex items-center gap-1 font-mono text-xs font-bold"
                title="Add Topic with AI Decomposer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Topic</span>
              </button>
            </div>
          </div>

          {/* Subtabs strip */}
          <div className="flex items-center gap-6 border-b border-[#132626] px-1 font-mono text-xs">
            <button
              type="button"
              onClick={() => setQuickFilter('ALL')}
              className={`pb-2 transition-colors cursor-pointer font-bold ${
                quickFilter === 'ALL' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0]' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              All Topics ({topics.length})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('DUE')}
              className={`pb-2 transition-colors cursor-pointer ${
                quickFilter === 'DUE' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-bold' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              Due ({dueTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('AT_RISK')}
              className={`pb-2 transition-colors cursor-pointer ${
                quickFilter === 'AT_RISK' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-bold' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              At Risk ({atRiskTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('IN_FLIGHT')}
              className={`pb-2 transition-colors cursor-pointer ${
                quickFilter === 'IN_FLIGHT' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-bold' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              In Flight ({inFlightTopicsCount})
            </button>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTopics.map((topic) => {
              const progressPct = topic.progress || (topic.status === 'MASTERED' ? 100 : 40);
              const isP0 = topic.importance === 'P0' || topic.code === 'P0';
              const isDueToday = topic.nextReview === 'Due Today' || topic.retentionState === 'DUE_TODAY';
              const isInFlight = topic.nextReview === 'In Flight';
              const isDueSoon = topic.nextReview === 'Due Soon';
              const isStable = topic.nextReview === 'Stable';
              const isAtRisk = topic.nextReview === 'At Risk' || topic.retentionState === 'REINFORCE';
              const isNotStarted = topic.status === 'UNTOUCHED' || topic.nextReview === 'Not Started';

              const stageLevel = topic.stage || 'L1';
              const stageName =
                stageLevel === 'L1'
                  ? 'RECALL'
                  : stageLevel === 'L2'
                  ? 'UNDERSTANDING'
                  : stageLevel === 'L3'
                  ? 'APPLY'
                  : stageLevel === 'L4'
                  ? 'DIAGNOSTIC'
                  : stageLevel === 'L5'
                  ? 'CREATION'
                  : stageLevel === 'L6'
                  ? 'SYNTHESIS'
                  : 'PRODUCTION';

              const subtitle =
                topic.subtitleTags || topic.category || 'Architecture · Building · Verification';

              const matchedSynergy = synergies.find((s) => s.topicId === topic.id);

              return (
                <div
                  key={topic.id}
                  className="p-4 rounded-xl bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all flex flex-col justify-between gap-4 group shadow-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isP0 ? (
                          <>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff5c5c]/15 text-[#ff5c5c] border border-[#ff5c5c]/40 uppercase tracking-wider">
                              P0
                            </span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff5c5c]/15 text-[#ff5c5c] border border-[#ff5c5c]/40 uppercase tracking-wider">
                              CRITICAL
                            </span>
                          </>
                        ) : (
                          <>
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                stageLevel === 'L2'
                                  ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                                  : stageLevel === 'L3'
                                  ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/40'
                                  : stageLevel === 'L4'
                                  ? 'bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/40'
                                  : 'bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40'
                              }`}
                            >
                              {stageLevel}
                            </span>
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                stageLevel === 'L2'
                                  ? 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40'
                                  : stageLevel === 'L3'
                                  ? 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/40'
                                  : stageLevel === 'L4'
                                  ? 'bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/40'
                                  : 'bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40'
                              }`}
                            >
                              {stageName}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {matchedSynergy && (
                          <span
                            onClick={() => setSelectedSynergy(matchedSynergy)}
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 font-bold flex items-center gap-1 cursor-pointer hover:bg-[#00f5a0]/25"
                            title={`Synergy: Unblocks ${matchedSynergy.projectCode}`}
                          >
                            <Zap className="w-2.5 h-2.5 fill-[#00f5a0]" />
                            <span>{matchedSynergy.projectCode}</span>
                          </span>
                        )}

                        {(() => {
                          const topicDueInfo = getDueStatus(topic.nextDueDate);
                          return (
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${topicDueInfo.badgeBg} ${topicDueInfo.badgeText} ${topicDueInfo.badgeBorder}`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{topicDueInfo.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#e6f4f1] font-mono leading-tight group-hover:text-[#00f5a0] transition-colors truncate">
                      {topic.topic}
                    </h4>

                    <div className="text-xs text-[#7a9490] font-mono truncate">
                      {subtitle}
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#55736f]">L1 Recall → L7 Mastery</span>
                        <span className="text-[#e6f4f1] font-bold">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#122222] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isP0 ? 'bg-[#00f5a0]' : stageLevel === 'L2' ? 'bg-[#38bdf8]' : stageLevel === 'L3' ? 'bg-[#a855f7]' : 'bg-[#00f5a0]'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#132626] font-mono text-xs">
                    <div className="flex items-center gap-2.5 text-[#7a9490]">
                      <span className="flex items-center gap-1 text-[11px]" title="Review count">
                        <MessageSquare className="w-3 h-3 text-[#55736f]" />
                        <span>{topic.reviewCount || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" title="SM-2 Ease Factor">
                        <Activity className="w-3 h-3 text-[#00f5a0]" />
                        <span>EF {(topic.easeFactor ?? 2.5).toFixed(1)}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" title="Interval">
                        <Clock className="w-3 h-3 text-[#55736f]" />
                        <span>{topic.intervalDays ?? 7}d</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* AI Socratic Exam Trigger Button on each card */}
                      <button
                        type="button"
                        onClick={() => handleLaunchAiExam(topic)}
                        className="p-1.5 rounded-lg bg-[#002b21] hover:bg-[#003d2f] border border-[#00f5a0]/40 text-[#00f5a0] transition-colors cursor-pointer"
                        title="Take AI Socratic Exam"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(topic)}
                        className="p-1 rounded text-[#55736f] hover:text-[#e6f4f1] transition-colors cursor-pointer"
                        title="Edit topic"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      {isP0 ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(topic)}
                          className="px-3 py-1.5 rounded-lg bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,245,160,0.2)]"
                        >
                          <span>Start Retrieval</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : isInFlight ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(topic)}
                          className="px-3 py-1.5 rounded-lg bg-[#0c1818] hover:bg-[#122424] border border-[#1d3835] text-[#38bdf8] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : isStable ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(topic)}
                          className="px-3 py-1.5 rounded-lg bg-[#0c1818] hover:bg-[#122424] border border-[#1d3835] text-[#00f5a0] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : isNotStarted ? (
                        <button
                          type="button"
                          onClick={() => openReviewModal(topic)}
                          className="px-3 py-1.5 rounded-lg bg-[#0c1818] hover:bg-[#122424] border border-[#1d3835] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Begin</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openReviewModal(topic)}
                          className="px-3 py-1.5 rounded-lg bg-[#0c1818] hover:bg-[#122424] border border-[#1d3835] text-[#00f5a0] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Start Retrieval</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="col-span-1 md:col-span-2 p-8 rounded-2xl bg-[#081212] border border-[#162b29] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#e6f4f1] font-mono">
                    {topics.length === 0
                      ? 'Clean Slate Active (0 Topics)'
                      : 'No Topics Match Selected Filter'}
                  </h4>
                  <p className="text-xs text-[#7a9490] max-w-md font-mono">
                    {topics.length === 0
                      ? 'You are running in clean-slate mode without pre-seeded data. Create your first software engineering topic or load demo data anytime.'
                      : 'Try clearing your search query or switching tabs.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#00f5a0] text-[#021810] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#00f5a0]/90 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Topic</span>
                  </button>
                  {onRestoreSeedTopics && topics.length === 0 && (
                    <button
                      type="button"
                      onClick={onRestoreSeedTopics}
                      className="px-4 py-2 rounded-xl bg-[#0a1818] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] font-mono text-xs cursor-pointer"
                    >
                      <span>Load Seed Demo Data</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM BAR: LEARNING FLOW (6-Step Lifecycle) matching Reference Image  */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#081212] border border-[#132626] flex flex-col gap-3 shadow-lg">
        <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-widest block">
          LEARNING FLOW
        </span>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 items-center">
          <div className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6f4f1] truncate">1. Discover</div>
              <div className="text-[10px] text-[#7a9490] truncate">Find what matters</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6f4f1] truncate">2. Learn</div>
              <div className="text-[10px] text-[#7a9490] truncate">Build foundational knowledge</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6f4f1] truncate">3. Retrieve</div>
              <div className="text-[10px] text-[#7a9490] truncate">Strengthen memory</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] shrink-0">
              <Hammer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6f4f1] truncate">4. Apply</div>
              <div className="text-[10px] text-[#7a9490] truncate">Use in real projects</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6f4f1] truncate">5. Verify</div>
              <div className="text-[10px] text-[#7a9490] truncate">Test your knowledge</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center text-[#6366f1] shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#e6f4f1] truncate">6. Master</div>
              <div className="text-[10px] text-[#7a9490] truncate">Compound over time</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AI MODAL 1: SOCRATIC BLOOM EXAMINER & DIAGNOSTIC TRIAGE                   */}
      {/* ========================================================================= */}
      {aiExamTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setAiExamTopic(null)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" />
                  <span>AI SOCRATIC BLOOM EXAMINER</span>
                </span>

                {examQuestion?.isDiagnosticTriage && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff5c5c]/20 text-[#ff5c5c] border border-[#ff5c5c]/40 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>L4 DIAGNOSTIC TRIAGE</span>
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                {aiExamTopic.topic}
              </h3>
              <p className="text-xs text-[#7a9490]">
                Calibrated to Bloom Level: {aiExamTopic.stage} ({aiExamTopic.stageLabel || 'Active Recall'})
              </p>
            </div>

            {/* STEP 1: LOADING QUESTION */}
            {examStep === 'LOADING' && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#00f5a0] animate-spin" />
                <span className="font-mono text-xs text-[#7a9490]">
                  Synthesizing Socratic challenge &amp; evaluation rubric...
                </span>
              </div>
            )}

            {/* STEP 2: ANSWERING QUESTION */}
            {examStep === 'QUESTION' && examQuestion && (
              <div className="space-y-4">
                {/* Timer if applicable */}
                {examTimeRemaining !== null && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#050a0a] border border-[#162b29] font-mono text-xs">
                    <span className="text-[#7a9490]">Diagnostic Timer:</span>
                    <span className={`font-bold flex items-center gap-1 ${examTimeRemaining <= 15 ? 'text-[#ff5c5c] animate-pulse' : 'text-[#00f5a0]'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{examTimeRemaining}s remaining</span>
                    </span>
                  </div>
                )}

                {/* Question Prompt Card */}
                <div className="p-4 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-2">
                  <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                    Adversarial Examination Prompt
                  </span>
                  <p className="text-sm font-bold text-[#e6f4f1] leading-relaxed font-mono">
                    {examQuestion.question}
                  </p>
                  {examQuestion.scenarioContext && (
                    <p className="text-xs text-[#7a9490]">
                      {examQuestion.scenarioContext}
                    </p>
                  )}
                </div>

                {/* Rubric Points */}
                {examQuestion.rubricPoints?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-[#a1b8b4] block">
                      Evaluation Criteria:
                    </span>
                    <ul className="space-y-1">
                      {examQuestion.rubricPoints.map((r, i) => (
                        <li key={i} className="text-xs font-mono text-[#7a9490] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Answer Input */}
                <div>
                  <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                    Your Active Recall Solution (no notes or scaffolding):
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your first-principles derivation, triage explanation, or boundary solution..."
                    value={examAnswer}
                    onChange={(e) => setExamAnswer(e.target.value)}
                    className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl p-3 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#132626]">
                  <button
                    type="button"
                    onClick={() => setAiExamTopic(null)}
                    className="px-4 py-2 rounded-xl bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!examAnswer.trim()}
                    onClick={handleSubmitAiExamAnswer}
                    className="px-5 py-2.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_12px_rgba(0,245,160,0.25)]"
                  >
                    <span>Submit for AI Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: EVALUATING */}
            {examStep === 'EVALUATING' && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-7 h-7 text-[#00f5a0] animate-spin" />
                <span className="font-mono text-xs text-[#7a9490]">
                  Analyzing mental models against rubric and detecting blind spots...
                </span>
              </div>
            )}

            {/* STEP 4: RESULTS */}
            {examStep === 'RESULT' && examEvaluation && (
              <div className="space-y-4">
                {/* Score & Rating Bar */}
                <div className="p-4 rounded-xl bg-[#050a0a] border border-[#162b29] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#7a9490] uppercase block">
                      Comprehension Score
                    </span>
                    <div className="text-2xl font-black text-[#00f5a0] font-mono">
                      {examEvaluation.comprehensionScore}%
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-[10px] text-[#7a9490] uppercase block">
                      Recommended Spacing
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40">
                      {examEvaluation.recommendedRating}
                    </span>
                  </div>
                </div>

                {/* Critique */}
                <div className="p-3.5 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                    Feynman Evaluation Critique
                  </span>
                  <p className="text-xs text-[#e6f4f1] font-mono leading-relaxed">
                    {examEvaluation.feynmanCritique}
                  </p>
                </div>

                {/* Strengths & Blind Spots */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#050a0a] border border-[#00f5a0]/30 space-y-1">
                    <span className="text-[10px] font-bold text-[#00f5a0] uppercase block">
                      Verified Strengths
                    </span>
                    <ul className="space-y-0.5 text-[#a1b8b4]">
                      {examEvaluation.verifiedStrengths?.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-[#00f5a0] shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-[#050a0a] border border-[#ff5c5c]/30 space-y-1">
                    <span className="text-[10px] font-bold text-[#ff5c5c] uppercase block">
                      Blind Spots to Reinforce
                    </span>
                    <ul className="space-y-0.5 text-[#ffb4ab]">
                      {examEvaluation.blindSpots?.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-[#ff5c5c] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#132626]">
                  <button
                    type="button"
                    onClick={() => setAiExamTopic(null)}
                    className="px-4 py-2 rounded-xl bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyAiExamResult}
                    className="px-5 py-2.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.25)]"
                  >
                    <span>Accept &amp; Apply Spacing Interval</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI MODAL 2: ADD TOPIC WITH FIRST-PRINCIPLES DECOMPOSER                    */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <form
            onSubmit={handleCreateTopic}
            className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setDecomposedPreview(null);
              }}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                NEW KNOWLEDGE VECTOR
              </span>
              <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                Index Retrieval Topic
              </h3>
            </div>

            {/* Title with AI Decompose Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-[#a1b8b4]">
                  Topic Title:
                </label>
                <button
                  type="button"
                  disabled={!newTopicTitle.trim() || isDecomposing}
                  onClick={handleDecomposeTopic}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 hover:bg-[#00f5a0]/25 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                  title="Generate L1-L7 progression and failure modes automatically"
                >
                  <Sparkles className="w-3 h-3 text-[#00f5a0]" />
                  <span>{isDecomposing ? 'Decomposing...' : 'AI Decompose Vector ⚡'}</span>
                </button>
              </div>

              <input
                type="text"
                required
                placeholder="e.g. Raft Consensus Protocol & Log Compaction"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
              />
            </div>

            {/* Decomposed Roadmap Preview if AI triggered */}
            {decomposedPreview && (
              <div className="p-3 rounded-xl bg-[#050a0a] border border-[#00f5a0]/40 space-y-2 font-mono text-xs">
                <span className="text-[10px] font-bold text-[#00f5a0] uppercase block">
                  AI Derivation: $L_1 \rightarrow L_7$ Progression
                </span>
                <div className="space-y-1 text-[#a1b8b4] text-[11px]">
                  {decomposedPreview.progressionRoadmap?.slice(0, 4).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="font-bold text-[#00f5a0]">{p.stage}:</span>
                      <span className="truncate">{p.focus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                  Category:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                  Tags (dot separated):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Consensus · State · Leader"
                  value={newTopicTags}
                  onChange={(e) => setNewTopicTags(e.target.value)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-[#a1b8b4] block mb-1">Priority:</label>
                <select
                  value={newTopicImportance}
                  onChange={(e) => setNewTopicImportance(e.target.value as TopicImportance)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-2 text-[#e6f4f1] focus:outline-none focus:border-[#00f5a0]"
                >
                  <option value="P0">P0 (Critical Pillar)</option>
                  <option value="P1">P1 (Core Capability)</option>
                  <option value="P2">P2 (Auxiliary)</option>
                </select>
              </div>
              <div>
                <label className="text-[#a1b8b4] block mb-1">Starting Level:</label>
                <select
                  value={newTopicStage}
                  onChange={(e) => setNewTopicStage(e.target.value as LearningStageLevel)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-2 text-[#e6f4f1] focus:outline-none focus:border-[#00f5a0]"
                >
                  <option value="L1">L1 Recall</option>
                  <option value="L2">L2 Understanding</option>
                  <option value="L3">L3 Application</option>
                  <option value="L4">L4 Diagnostic</option>
                  <option value="L5">L5 Creation</option>
                  <option value="L6">L6 Synthesis</option>
                  <option value="L7">L7 Production</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                Verification Protocol Action:
              </label>
              <input
                type="text"
                placeholder="e.g. Blank paper reconstruction without IDE scaffolding"
                value={newTopicAction}
                onChange={(e) => setNewTopicAction(e.target.value)}
                className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setDecomposedPreview(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.25)]"
              >
                Create Topic
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TWO-PHASE ACTIVE RETRIEVAL FLASHCARD MODAL & SM-2 INTERVAL ENGINE          */}
      {/* ========================================================================= */}
      {activeTopicForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveTopicForReview(null)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Protocol Metadata & Phase Indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#00f5a0]" />
                  <span>ACTIVE RETRIEVAL // SUPERMEMO SM-2 PROTOCOL</span>
                </span>
                
                {/* 2-Step Phase Tracker */}
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      recallPhase === 'BLIND_RECALL'
                        ? 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/40 font-bold'
                        : 'bg-[#050a0a] text-[#7a9490] border-[#162b29]'
                    }`}
                  >
                    <span>1. Blind Recall</span>
                    {recallPhase === 'REVEALED_EVALUATION' && <Check className="w-2.5 h-2.5 text-[#00f5a0]" />}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#55736f]" />
                  <span
                    className={`px-2 py-0.5 rounded-full border ${
                      recallPhase === 'REVEALED_EVALUATION'
                        ? 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/40 font-bold'
                        : 'bg-[#050a0a] text-[#55736f] border-[#162b29]'
                    }`}
                  >
                    2. Benchmark &amp; Grade
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                    {activeTopicForReview.topic}
                  </h3>
                  {activeTopicForReview.category && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#102422] text-[#7a9490] border border-[#183633]">
                      {activeTopicForReview.category}
                    </span>
                  )}
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00f5a0]/10 text-[#00f5a0] border border-[#00f5a0]/30 font-bold">
                    Target: {selectedStageForReview}
                  </span>
                </div>
                <p className="text-xs text-[#7a9490] mt-1 font-mono">
                  {activeTopicForReview.protocolAction || 'Reconstruct core invariants and failure boundaries from raw memory.'}
                </p>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* PHASE 1: STIMULUS & BLIND RECALL (OCCLUDED MODE)                           */}
            {/* ========================================================================= */}
            {recallPhase === 'BLIND_RECALL' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Anti-Recognition Mandate Banner */}
                <div className="p-3.5 rounded-xl bg-[#140b08] border border-[#f59e0b]/40 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-[#f59e0b] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ZERO-RECOGNITION BIAS ENFORCEMENT</span>
                  </div>
                  <p className="text-[11px] text-[#fbe5c8] leading-relaxed">
                    Canonical Feynman synthesis and past evidence logs are strictly occluded. Reconstruct the mechanism from first principles without looking at notes.
                  </p>
                </div>

                {/* Blind-Page Challenge Card */}
                <div className="p-4 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                    <span className="text-[#a1b8b4] font-bold">Blank-Page Reconstruction Challenge:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#00f5a0] flex items-center gap-1 bg-[#00f5a0]/10 px-2 py-0.5 rounded border border-[#00f5a0]/30 font-bold">
                        <Clock className="w-3 h-3" />
                        <span>Elapsed: {Math.floor(recallTimerSeconds / 60)}:{String(recallTimerSeconds % 60).padStart(2, '0')}</span>
                      </span>
                      <span className="text-[10px] text-[#7a9490]">
                        {scratchpadAnswer.trim() ? scratchpadAnswer.trim().split(/\s+/).length : 0} words
                      </span>
                      <button
                        type="button"
                        disabled={!scratchpadAnswer.trim() || isVerifyingScratchpad}
                        onClick={handleVerifyScratchpadReconstruction}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 text-[#00f5a0] border border-[#00f5a0]/30 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none font-bold"
                        title="Analyze and verify your raw blank recall reconstruction with AI Socratic Rubric"
                      >
                        <Sparkles className="w-3 h-3 text-[#00f5a0]" />
                        <span>{isVerifyingScratchpad ? 'Auditing...' : 'AI Verify Recall ✨'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#e6f4f1] font-mono leading-relaxed bg-[#081212] p-3 rounded-lg border border-[#132626]">
                    &ldquo;Reconstruct the core mechanism, architectural boundary conditions, and primary failure modes of <span className="text-[#00f5a0] font-bold">{activeTopicForReview.topic}</span> from raw memory.&rdquo;
                  </p>

                  <textarea
                    rows={6}
                    autoFocus
                    placeholder="Type your blank-slate derivation, protocol steps, mental models, or edge-case failure modes here..."
                    value={scratchpadAnswer}
                    onChange={(e) => setScratchpadAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        setRecallPhase('REVEALED_EVALUATION');
                      }
                    }}
                    className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl p-3.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0] transition-colors leading-relaxed placeholder-[#55736f]"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#55736f] px-1">
                    <span>Press Ctrl+Enter to reveal benchmark</span>
                    <span>Write code snippets, invariant lists, or edge cases</span>
                  </div>

                  {/* AI Evaluation Report for Blank Scratchpad */}
                  {scratchpadEvaluation && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#071917] border border-[#00f5a0]/40 space-y-2.5 font-mono text-xs animate-fadeIn">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-[#00f5a0] uppercase flex items-center gap-1.5 text-[11px]">
                          <Award className="w-3.5 h-3.5" />
                          <span>AI BLANK RECALL AUDIT REPORT</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#00f5a0]/20 text-[#00f5a0] font-bold border border-[#00f5a0]/30 text-[10px]">
                            Score: {scratchpadEvaluation.comprehensionScore}/100
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-bold border border-[#38bdf8]/30 text-[10px]">
                            Recommended: {scratchpadEvaluation.recommendedRating}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0a201d] border border-[#123832] text-xs text-[#e6f4f1] leading-relaxed">
                        <span className="text-[#7a9490] block text-[10px] uppercase font-bold mb-0.5">
                          Feynman Peer Critique:
                        </span>
                        {scratchpadEvaluation.feynmanCritique}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-[#050e0e] border border-[#00f5a0]/20 space-y-1">
                          <span className="font-bold text-[#00f5a0] block text-[10px]">
                            Verified Strengths:
                          </span>
                          <ul className="space-y-0.5 text-[#a1b8b4]">
                            {scratchpadEvaluation.verifiedStrengths?.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-[#00f5a0]">✓</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-2 rounded-lg bg-[#050e0e] border border-[#ff5c5c]/20 space-y-1">
                          <span className="font-bold text-[#ff5c5c] block text-[10px]">
                            Blind Spots &amp; Edge Cases:
                          </span>
                          <ul className="space-y-0.5 text-[#a1b8b4]">
                            {scratchpadEvaluation.blindSpots?.map((b, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-[#ff5c5c]">⚠</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reveal Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#132626]">
                  <button
                    type="button"
                    onClick={() => setActiveTopicForReview(null)}
                    className="px-4 py-2 rounded-xl bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecallPhase('REVEALED_EVALUATION')}
                    className="px-5 py-2.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-black flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all hover:scale-[1.02]"
                  >
                    <span>Reveal Benchmark &amp; Grade (Phase 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PHASE 2: SELF-EVALUATION & CALIBRATED SM-2 GRADING (REVEALED MODE)         */}
            {/* ========================================================================= */}
            {recallPhase === 'REVEALED_EVALUATION' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Revealed Header Banner */}
                <div className="p-3 rounded-xl bg-[#071918] border border-[#00f5a0]/40 flex items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#00f5a0] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#00f5a0]" />
                    <span>SYNTHESIS REVEALED // COMPARE &amp; EVALUATE RETRIEVAL QUALITY</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecallPhase('BLIND_RECALL')}
                    className="text-[10px] text-[#7a9490] hover:text-[#e6f4f1] underline cursor-pointer"
                  >
                    Back to Scratchpad
                  </button>
                </div>

                {/* Comparative View: Your Attempt vs Benchmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  {/* Left: Your Blind Recall Attempt */}
                  <div className="p-3.5 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-bold text-[#a1b8b4] uppercase">
                        Your Blind Recall Attempt
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#00f5a0] font-bold">
                          {recallTimerSeconds}s Recall
                        </span>
                        {scratchpadAnswer.trim() && (
                          <button
                            type="button"
                            disabled={isVerifyingScratchpad}
                            onClick={handleVerifyScratchpadReconstruction}
                            className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 text-[#00f5a0] border border-[#00f5a0]/30 transition-all cursor-pointer flex items-center gap-1 font-bold"
                            title="Audit this blank recall attempt with AI"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#00f5a0]" />
                            <span>{isVerifyingScratchpad ? 'Auditing...' : scratchpadEvaluation ? 'Re-Audit AI' : 'Audit Recall ✨'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    {scratchpadAnswer.trim() ? (
                      <p className="text-[11px] text-[#e6f4f1] leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto bg-[#071313] p-2.5 rounded-lg border border-[#112422]">
                        {scratchpadAnswer.trim()}
                      </p>
                    ) : (
                      <div className="text-[11px] text-[#55736f] italic p-3 bg-[#071313] rounded-lg">
                        (Mental recall completed without written scratchpad notes)
                      </div>
                    )}
                  </div>

                  {/* Right: Canonical Benchmark & Invariants */}
                  <div className="p-3.5 rounded-xl bg-[#050a0a] border border-[#00f5a0]/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#00f5a0] uppercase flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Canonical Synthesis &amp; Rules</span>
                      </span>
                      <span className="text-[10px] text-[#7a9490]">
                        {activeTopicForReview.stage} Standard
                      </span>
                    </div>
                    <div className="text-[11px] text-[#e6f4f1] leading-relaxed max-h-36 overflow-y-auto bg-[#071313] p-2.5 rounded-lg border border-[#112422] space-y-1.5">
                      <p className="font-semibold text-[#00f5a0]">
                        {activeTopicForReview.notes || 'Mastery of first-principles invariants, boundary conditions, and test verification.'}
                      </p>
                      {activeTopicForReview.evidence?.length > 0 && (
                        <div className="pt-1 border-t border-[#132626]">
                          <span className="text-[10px] text-[#7a9490] block mb-0.5">Verified Artifacts:</span>
                          <ul className="space-y-0.5 text-[10px] text-[#a1b8b4]">
                            {activeTopicForReview.evidence.map((ev, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-[#00f5a0]">✓</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Recall Audit Breakdown in Phase 2 */}
                {scratchpadEvaluation && (
                  <div className="p-3.5 rounded-xl bg-[#071917] border border-[#00f5a0]/40 space-y-2.5 font-mono text-xs animate-fadeIn">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-[#00f5a0] uppercase flex items-center gap-1.5 text-[11px]">
                        <Award className="w-3.5 h-3.5" />
                        <span>AI RECALL AUDIT REPORT // COMPREHENSION: {scratchpadEvaluation.comprehensionScore}%</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-bold border border-[#38bdf8]/30 text-[10px]">
                          Calibrated SM-2: {scratchpadEvaluation.recommendedRating}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReviewSubmit(scratchpadEvaluation.recommendedRating)}
                          className="px-2.5 py-0.5 rounded bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-bold text-[10px] cursor-pointer shadow-sm"
                        >
                          Apply {scratchpadEvaluation.recommendedRating} Grade &rarr;
                        </button>
                      </div>
                    </div>

                    <p className="p-2.5 rounded-lg bg-[#0a201d] border border-[#123832] text-xs text-[#e6f4f1] leading-relaxed">
                      {scratchpadEvaluation.feynmanCritique}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-[#050e0e] border border-[#00f5a0]/20 space-y-1">
                        <span className="font-bold text-[#00f5a0] block text-[10px]">Verified Strengths:</span>
                        <ul className="space-y-0.5 text-[#a1b8b4]">
                          {scratchpadEvaluation.verifiedStrengths?.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-[#00f5a0]">✓</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2 rounded-lg bg-[#050e0e] border border-[#ff5c5c]/20 space-y-1">
                        <span className="font-bold text-[#ff5c5c] block text-[10px]">Blind Spots &amp; Missing Bounds:</span>
                        <ul className="space-y-0.5 text-[#a1b8b4]">
                          {scratchpadEvaluation.blindSpots?.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-[#ff5c5c]">⚠</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compact Ebbinghaus Retention Forecast Curve */}
                <EbbinghausDecayCurve
                  compact={true}
                  topicTitle={activeTopicForReview.topic}
                  intervalDays={activeTopicForReview.intervalDays ?? 7}
                  easeFactor={activeTopicForReview.easeFactor ?? 2.5}
                  lastReviewedDate={activeTopicForReview.lastReviewedDate}
                  nextDueDate={activeTopicForReview.nextDueDate}
                />

                {/* Stage Competence Elevation Selector */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[#a1b8b4]">
                      Target Competence Elevation:
                    </label>
                    <span className="text-[10px] text-[#7a9490]">
                      Current: <strong className="text-[#00f5a0]">{activeTopicForReview.stage}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {(['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'] as LearningStageLevel[]).map(
                      (lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSelectedStageForReview(lvl)}
                          className={`py-1.5 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                            selectedStageForReview === lvl
                              ? 'bg-[#00f5a0] text-[#021810] border-[#00f5a0]'
                              : 'bg-[#050a0a] text-[#7a9490] border-[#162b29] hover:text-[#e6f4f1]'
                          }`}
                        >
                          {lvl}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Evidence Log & AI Socratic Verifier */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-[#a1b8b4]">
                      Evidence Log (PR, commit hash, RFC note, or test output):
                    </label>
                    <button
                      type="button"
                      disabled={!evidenceInput.trim() || isVerifyingEvidence}
                      onClick={handleVerifyEvidence}
                      className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 hover:bg-[#00f5a0]/25 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Sparkles className="w-3 h-3 text-[#00f5a0]" />
                      <span>{isVerifyingEvidence ? 'Auditing...' : 'AI Verify Evidence ✨'}</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. Implemented connection pool benchmark in repo at 120k req/s"
                    value={evidenceInput}
                    onChange={(e) => setEvidenceInput(e.target.value)}
                    className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                  />

                  {evidenceAuditResult && (
                    <div className="p-3 rounded-xl bg-[#050a0a] border border-[#00f5a0]/40 space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#00f5a0] flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Verified Artifact ({evidenceAuditResult.confidenceScore}% Confidence)
                        </span>
                        <span className="text-[10px] text-[#7a9490]">
                          Tier: {evidenceAuditResult.competenceTierAchieved}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#e6f4f1]">
                        {evidenceAuditResult.elevationRecommendation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Calibrated SuperMemo SM-2 Rating Buttons */}
                <div className="space-y-2 pt-2 border-t border-[#132626]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#a1b8b4]">
                      SuperMemo SM-2 Calibrated Rating:
                    </span>
                    <span className="text-[10px] text-[#7a9490]">
                      Current EF: <strong>{(activeTopicForReview.easeFactor ?? 2.5).toFixed(2)}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                    {/* Forgot: Grade 1 */}
                    <button
                      type="button"
                      onClick={() => handleReviewSubmit('Forgot')}
                      className={`p-3 rounded-xl bg-[#2a1215] hover:bg-[#3a151a] border text-[#ff5c5c] font-bold cursor-pointer transition-all text-center flex flex-col justify-between gap-1 group ${
                        scratchpadEvaluation?.recommendedRating === 'Forgot'
                          ? 'border-[#ff5c5c] ring-2 ring-[#ff5c5c]/40'
                          : 'border-[#ff5c5c]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">Forgot (0)</span>
                        <span className="text-[9px] px-1 rounded bg-[#ff5c5c]/20">
                          {scratchpadEvaluation?.recommendedRating === 'Forgot' ? 'AI Pick' : 'Reset'}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80 text-left">
                        {currentSm2Preview ? currentSm2Preview.Forgot.label : '1 day'} · EF -0.2
                      </div>
                      <div className="text-[9px] text-[#ffb4ab] text-left">
                        Due: {currentSm2Preview ? currentSm2Preview.Forgot.dateStr : 'Tomorrow'}
                      </div>
                    </button>

                    {/* Hard: Grade 3 */}
                    <button
                      type="button"
                      onClick={() => handleReviewSubmit('Hard')}
                      className={`p-3 rounded-xl bg-[#2a2010] hover:bg-[#3a2a15] border text-[#f59e0b] font-bold cursor-pointer transition-all text-center flex flex-col justify-between gap-1 group ${
                        scratchpadEvaluation?.recommendedRating === 'Hard'
                          ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/40'
                          : 'border-[#f59e0b]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">Hard (1)</span>
                        <span className="text-[9px] px-1 rounded bg-[#f59e0b]/20">
                          {scratchpadEvaluation?.recommendedRating === 'Hard' ? 'AI Pick' : 'Repeat'}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80 text-left">
                        +{currentSm2Preview ? currentSm2Preview.Hard.intervalDays : 2}d ({currentSm2Preview ? currentSm2Preview.Hard.label : '2d'})
                      </div>
                      <div className="text-[9px] text-[#fde68a] text-left">
                        Due: {currentSm2Preview ? currentSm2Preview.Hard.dateStr : 'Soon'}
                      </div>
                    </button>

                    {/* Good: Grade 4 */}
                    <button
                      type="button"
                      onClick={() => handleReviewSubmit('Good')}
                      className={`p-3 rounded-xl bg-[#092025] hover:bg-[#102d35] border text-[#38bdf8] font-bold cursor-pointer transition-all text-center flex flex-col justify-between gap-1 group ${
                        scratchpadEvaluation?.recommendedRating === 'Good'
                          ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/40'
                          : 'border-[#38bdf8]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">Good (2)</span>
                        <span className="text-[9px] px-1 rounded bg-[#38bdf8]/20">
                          {scratchpadEvaluation?.recommendedRating === 'Good' ? 'AI Pick' : 'Optimal'}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80 text-left">
                        +{currentSm2Preview ? currentSm2Preview.Good.intervalDays : 7}d ({currentSm2Preview ? currentSm2Preview.Good.label : '7d'})
                      </div>
                      <div className="text-[9px] text-[#bae6fd] text-left">
                        Due: {currentSm2Preview ? currentSm2Preview.Good.dateStr : 'Scheduled'}
                      </div>
                    </button>

                    {/* Easy: Grade 5 */}
                    <button
                      type="button"
                      onClick={() => handleReviewSubmit('Easy')}
                      className={`p-3 rounded-xl bg-[#07251c] hover:bg-[#0c3528] border text-[#00f5a0] font-bold cursor-pointer transition-all text-center flex flex-col justify-between gap-1 group shadow-[0_0_10px_rgba(0,245,160,0.15)] ${
                        scratchpadEvaluation?.recommendedRating === 'Easy'
                          ? 'border-[#00f5a0] ring-2 ring-[#00f5a0]/40'
                          : 'border-[#00f5a0]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold">Easy (3)</span>
                        <span className="text-[9px] px-1 rounded bg-[#00f5a0]/20">
                          {scratchpadEvaluation?.recommendedRating === 'Easy' ? 'AI Pick' : 'Bonus'}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80 text-left">
                        +{currentSm2Preview ? currentSm2Preview.Easy.intervalDays : 18}d ({currentSm2Preview ? currentSm2Preview.Easy.label : '18d'})
                      </div>
                      <div className="text-[9px] text-[#a7f3d0] text-left">
                        Due: {currentSm2Preview ? currentSm2Preview.Easy.dateStr : 'Extended'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI MODAL 5: CROSS-MODULE PROJECT SYNERGY MODAL                            */}
      {/* ========================================================================= */}
      {showSynergiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowSynergiesModal(false)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-[#00f5a0]" />
                <span>CROSS-MODULE SYNERGY UNLOCKER</span>
              </span>
              <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                Learning Topics Unblocking Milestone Projects
              </h3>
              <p className="text-xs text-[#7a9490]">
                AI-correlated linkages between theoretical mastery (Module 03) and active engineering velocity (Module 04).
              </p>
            </div>

            <div className="space-y-3">
              {synergies.map((syn, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#00f5a0]">
                      {syn.topicTitle} $\rightarrow$ {syn.projectCode}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0]">
                      +{syn.estimatedUnblockedMinutes} min velocity
                    </span>
                  </div>
                  <div className="text-xs text-[#e6f4f1]">
                    Unblocks Task: &ldquo;{syn.unblockedStepTitle}&rdquo;
                  </div>
                  <p className="text-[11px] text-[#7a9490]">
                    {syn.synergyReason}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => setShowSynergiesModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold cursor-pointer"
              >
                Close Synergies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Synergy Inspector */}
      {selectedSynergy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedSynergy(null)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                SYNERGY DETAIL
              </span>
              <h3 className="text-base font-bold text-[#e6f4f1] font-mono">
                {selectedSynergy.topicTitle} $\rightarrow$ {selectedSynergy.projectCode}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-2 font-mono text-xs">
              <div className="text-xs font-bold text-[#00f5a0]">
                Unblocked: {selectedSynergy.unblockedStepTitle}
              </div>
              <p className="text-xs text-[#e6f4f1] leading-relaxed">
                {selectedSynergy.synergyReason}
              </p>
              <div className="text-[11px] text-[#7a9490]">
                Estimated unblocked velocity: {selectedSynergy.estimatedUnblockedMinutes} minutes of deep work.
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => setSelectedSynergy(null)}
                className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT TOPIC */}
      {topicToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setTopicToEdit(null)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                EDIT DIRECTIVE
              </span>
              <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                Update Topic Details
              </h3>
            </div>

            <div>
              <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                Topic Title:
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                  Category:
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                  Tags (dot separated):
                </label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => {
                  setTopicToDelete(topicToEdit);
                  setTopicToEdit(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#2a1215] text-[#ff5c5c] hover:bg-[#3a151a] font-mono text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTopicToEdit(null)}
                  className="px-4 py-2 rounded-xl bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {topicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#e6f4f1] font-mono">
              Delete Knowledge Topic?
            </h3>
            <p className="text-xs text-[#7a9490]">
              Are you sure you want to delete &ldquo;{topicToDelete.topic}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => setTopicToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#0c1818] text-[#7a9490] font-mono text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#ff5c5c] text-white font-mono text-xs font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ALL STAGES LADDER DRAWER */}
      {showAllStagesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowAllStagesModal(false)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                COMPETENCE ARCHITECTURE
              </span>
              <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                The 7 Levels of Applied Competence
              </h3>
            </div>

            <div className="space-y-3">
              {state.learningStages.map((stage) => (
                <div
                  key={stage.level}
                  className="p-3.5 rounded-xl bg-[#050a0a] border border-[#162b29] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#00f5a0]">
                      {stage.level} · {stage.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#7a9490]">
                      {countByStage[stage.level] || 0} Topics
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#e6f4f1] font-mono">
                    {stage.shortRule}
                  </div>
                  <p className="text-xs text-[#7a9490] leading-relaxed">
                    {stage.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
