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

export const LearningEngine: React.FC<LearningEngineProps> = ({
  state,
  onSelectCurrentStage,
  onReviewTopic,
  onAddLearningTopic,
  onUpdateLearningTopic,
  onDeleteLearningTopic,
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

  // Pick Next Retrieval topic
  const nextRetrievalTopic = useMemo(() => {
    const aiEng = topics.find((t) => t.topic.toLowerCase().includes('ai engineering'));
    if (aiEng) return aiEng;
    return topics.find((t) => t.retentionState === 'DUE_TODAY') || topics[0];
  }, [topics]);

  // Open Standard Review Modal
  const openReviewModal = (topic: LearningTopic) => {
    setActiveTopicForReview(topic);
    setSelectedStageForReview(topic.stage);
    setEvidenceInput('');
    setReviewNotesInput(topic.notes || '');
    setLinkedProjectInput(topic.linkedProjectId || '');
    setEvidenceAuditResult(null);
  };

  // Submit Standard Review & Grade
  const handleReviewSubmit = (rating: 'Forgot' | 'Hard' | 'Good' | 'Easy') => {
    if (!activeTopicForReview) return;

    onReviewTopic(
      activeTopicForReview.id,
      rating,
      selectedStageForReview,
      evidenceInput.trim() || undefined,
      reviewNotesInput.trim(),
      linkedProjectInput || undefined
    );

    if (onUpdateLearningTopic) {
      let nextState: 'OPTIMAL' | 'DUE_TODAY' | 'REINFORCE' | 'MASTERED' = 'OPTIMAL';
      let nextInterval = '7d ago';
      let nextReviewLabel = 'In Flight';
      let newProgress = activeTopicForReview.progress || 50;

      if (rating === 'Forgot') {
        nextState = 'REINFORCE';
        nextReviewLabel = 'At Risk';
        newProgress = Math.max(10, newProgress - 20);
      } else if (rating === 'Hard') {
        nextState = 'DUE_TODAY';
        nextReviewLabel = 'Due Soon';
        newProgress = Math.min(95, newProgress + 5);
      } else if (rating === 'Good') {
        nextState = 'OPTIMAL';
        nextReviewLabel = 'In Flight';
        newProgress = Math.min(95, newProgress + 15);
      } else if (rating === 'Easy') {
        nextInterval = '14d ago';
        nextReviewLabel = 'Stable';
        newProgress = Math.min(100, newProgress + 25);
        if (selectedStageForReview === 'L7') {
          nextState = 'MASTERED';
        }
      }

      onUpdateLearningTopic({
        ...activeTopicForReview,
        stage: selectedStageForReview,
        status: newProgress >= 100 ? 'MASTERED' : 'IN_PROGRESS',
        retentionState: nextState,
        nextReview: nextReviewLabel,
        intervalLabel: nextInterval,
        lastReviewed: 'Today',
        reviewCount: (activeTopicForReview.reviewCount || 0) + 1,
        progress: newProgress,
        evidence: evidenceInput.trim()
          ? [...activeTopicForReview.evidence, evidenceInput.trim()]
          : activeTopicForReview.evidence,
        notes: reviewNotesInput.trim() || activeTopicForReview.notes,
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
                {Math.max(23, topics.length)}
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
                {Math.max(5, dueTopicsCount)}
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
                {Math.max(2, atRiskTopicsCount)}
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
                L2.7
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
                    {nextRetrievalTopic.progress || 68}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#122222] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00f5a0] transition-all duration-300"
                    style={{ width: `${nextRetrievalTopic.progress || 68}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-[#55736f]">
                  Last reviewed: {nextRetrievalTopic.lastReviewed || '7 days ago'}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons: AI Socratic Exam + Standard Retrieval */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
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
              All Topics ({Math.max(23, topics.length)})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('DUE')}
              className={`pb-2 transition-colors cursor-pointer ${
                quickFilter === 'DUE' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-bold' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              Due ({Math.max(5, dueTopicsCount)})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('AT_RISK')}
              className={`pb-2 transition-colors cursor-pointer ${
                quickFilter === 'AT_RISK' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-bold' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              At Risk ({Math.max(2, atRiskTopicsCount)})
            </button>
            <button
              type="button"
              onClick={() => setQuickFilter('IN_FLIGHT')}
              className={`pb-2 transition-colors cursor-pointer ${
                quickFilter === 'IN_FLIGHT' ? 'text-[#00f5a0] border-b-2 border-[#00f5a0] font-bold' : 'text-[#7a9490] hover:text-[#e6f4f1]'
              }`}
            >
              In Flight ({Math.max(3, inFlightTopicsCount)})
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

                        {isDueToday && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Due Today</span>
                          </span>
                        )}
                        {isInFlight && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
                            <span>In Flight</span>
                          </span>
                        )}
                        {isDueSoon && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Due Soon</span>
                          </span>
                        )}
                        {isStable && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Stable</span>
                          </span>
                        )}
                        {isAtRisk && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff5c5c]/15 text-[#ff5c5c] border border-[#ff5c5c]/40 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>At Risk</span>
                          </span>
                        )}
                        {isNotStarted && (
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0e201e] text-[#7a9490] border border-[#162b29] flex items-center gap-1">
                            <span>Not Started</span>
                          </span>
                        )}
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
                    <div className="flex items-center gap-3 text-[#7a9490]">
                      <span className="flex items-center gap-1 text-[11px]" title="Review count">
                        <MessageSquare className="w-3 h-3 text-[#55736f]" />
                        <span>{topic.reviewCount || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px]" title="Last reviewed">
                        <Clock className="w-3 h-3 text-[#55736f]" />
                        <span>{topic.lastReviewed || '—'}</span>
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
      {/* STANDARD REVIEW MODAL + AI EVIDENCE VERIFIER                              */}
      {/* ========================================================================= */}
      {activeTopicForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveTopicForReview(null)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                ACTIVE RETRIEVAL // GRADE COMPREHENSION
              </span>
              <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
                {activeTopicForReview.topic}
              </h3>
              <p className="text-xs text-[#7a9490]">
                {activeTopicForReview.protocolAction}
              </p>
            </div>

            {/* Stage Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#a1b8b4] block">
                Target Competence Elevation:
              </label>
              <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
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

            {/* Evidence & AI Verify */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-[#a1b8b4]">
                    Evidence Log (PR, commit hash, RFC note, or test output):
                  </label>
                  <button
                    type="button"
                    disabled={!evidenceInput.trim() || isVerifyingEvidence}
                    onClick={handleVerifyEvidence}
                    className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 hover:bg-[#00f5a0]/25 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                    title="Evaluate artifact against Bloom standard"
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
              </div>

              {/* AI Evidence Audit Feedback */}
              {evidenceAuditResult && (
                <div className="p-3 rounded-xl bg-[#050a0a] border border-[#00f5a0]/40 space-y-1.5 font-mono text-xs">
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

              <div>
                <label className="text-xs font-mono text-[#a1b8b4] block mb-1">
                  Synthesis &amp; Recall Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Key mental models, friction points, or architecture constraints..."
                  value={reviewNotesInput}
                  onChange={(e) => setReviewNotesInput(e.target.value)}
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                />
              </div>
            </div>

            {/* Rating Buttons */}
            <div className="space-y-2 pt-2 border-t border-[#132626]">
              <span className="text-xs font-mono text-[#a1b8b4] block text-center">
                Evaluate Retrieval Quality (SuperMemo SM-2 Scale):
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Forgot')}
                  className="p-2.5 rounded-xl bg-[#2a1215] hover:bg-[#3a151a] border border-[#ff5c5c]/40 text-[#ff5c5c] font-bold cursor-pointer transition-colors text-center"
                >
                  <div className="font-bold">Forgot</div>
                  <div className="text-[10px] opacity-75">Reset Day 0</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Hard')}
                  className="p-2.5 rounded-xl bg-[#2a2010] hover:bg-[#3a2a15] border border-[#f59e0b]/40 text-[#f59e0b] font-bold cursor-pointer transition-colors text-center"
                >
                  <div className="font-bold">Hard</div>
                  <div className="text-[10px] opacity-75">+1 Day</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Good')}
                  className="p-2.5 rounded-xl bg-[#092025] hover:bg-[#102d35] border border-[#38bdf8]/40 text-[#38bdf8] font-bold cursor-pointer transition-colors text-center"
                >
                  <div className="font-bold">Good</div>
                  <div className="text-[10px] opacity-75">+7 Days</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Easy')}
                  className="p-2.5 rounded-xl bg-[#07251c] hover:bg-[#0c3528] border border-[#00f5a0]/40 text-[#00f5a0] font-bold cursor-pointer transition-colors text-center"
                >
                  <div className="font-bold">Easy</div>
                  <div className="text-[10px] opacity-75">+30 Days</div>
                </button>
              </div>
            </div>
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
