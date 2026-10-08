import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Target,
  Clock,
  Calendar,
  Flame,
  Star,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  Box,
  Check,
  Plus,
  Trash2,
  Zap,
  Rocket,
  Brain,
  Award,
  Shield,
  ChevronRight,
  X,
  Maximize2,
  Volume2,
  VolumeX,
  ExternalLink,
  Filter,
  Search,
  SlidersHorizontal,
  Info,
  Compass,
} from 'lucide-react';
import {
  ActiveFocusTimer,
  DailyCadenceBlock,
  FocusSession,
  Goal,
  NavigationSection,
  POSState,
  Review,
  RoadmapItem,
} from '../../models/types';
import { WireframeSphere } from '../common/WireframeSphere';

interface PortfolioProject {
  code: string;
  title: string;
  timeline: string;
  description?: string;
  stage?: string;
  progress?: number;
  color?: string;
  milestone?: string;
}

interface PortfolioLane {
  id: string;
  title: string;
  count: number;
  highlight?: boolean;
  projects: PortfolioProject[];
}

interface DailyCadenceFlightPlanProps {
  state: POSState;
  onToggleCadenceBlock: (id: string) => void;
  onToggleDailyScheduleBlock?: (id: string) => void;
  onAddFocusSession?: (session: Omit<FocusSession, 'id' | 'createdAt'>, syncDirective?: boolean) => void;
  onDeleteFocusSession?: (id: string) => void;
  onUpdateActiveTimer?: (timer: ActiveFocusTimer | undefined) => void;
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onDeleteReview: (id: string) => void;
  onUpdateRoadmapItem?: (itemId: string, updates: Partial<RoadmapItem>) => void;
  onNavigateToSection?: (section: NavigationSection) => void;
  onToggleGoalAndSyncSource?: (goal: Goal) => void;
}

// Tactical Web Audio synthesizer for focus cues (zero network dependencies)
const playTacticalChime = (type: 'complete' | 'start') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'complete') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'start') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Audio context unavailable
  }
};

export const DailyCadenceFlightPlan: React.FC<DailyCadenceFlightPlanProps> = ({
  state,
  onToggleCadenceBlock,
  onToggleDailyScheduleBlock,
  onAddFocusSession,
  onDeleteFocusSession,
  onUpdateActiveTimer,
  onAddReview,
  onDeleteReview,
  onUpdateRoadmapItem,
  onNavigateToSection,
  onToggleGoalAndSyncSource,
}) => {
  // Timer State (90-min standard deep work block)
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(90 * 60);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<1 | 2 | 3>(1); // 1 = Deep Block 1, 2 = Break, 3 = Deep Block 2
  const [activeGoalFocus, setActiveGoalFocus] = useState<string>('Personal Automation Engine — Connect command execution layer');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters & Search
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'PROJECT' | 'FINANCIAL' | 'LEARNING'>('ALL');
  const [queueSearch, setQueueSearch] = useState('');

  // Full-screen focus overlay modal
  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState(false);

  // View Modals & Drawers
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showRecentSessionsModal, setShowRecentSessionsModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [selectedPortfolioProject, setSelectedPortfolioProject] = useState<PortfolioProject | null>(null);
  const [showLogSessionModal, setShowLogSessionModal] = useState(false);
  const [showAddDirectiveModal, setShowAddDirectiveModal] = useState(false);

  // Manual Log Session State
  const [logDirectiveTitle, setLogDirectiveTitle] = useState('Personal Automation Engine');
  const [logDurationMinutes, setLogDurationMinutes] = useState(90);
  const [logFocusRating, setLogFocusRating] = useState<number>(5);
  const [logDistractions, setLogDistractions] = useState<number>(0);
  const [logNotes, setLogNotes] = useState('90-minute deep work block completed with zero distractions.');

  // New Directive Form State
  const [newDirectiveTitle, setNewDirectiveTitle] = useState('');
  const [newDirectiveCategory, setNewDirectiveCategory] = useState<'PROJECT' | 'FINANCIAL' | 'LEARNING'>('PROJECT');
  const [newDirectiveDuration, setNewDirectiveDuration] = useState(90);
  const [newDirectiveSubtitle, setNewDirectiveSubtitle] = useState('');

  // Selected project for focus target
  const [activeProjectCode, setActiveProjectCode] = useState('P01');

  // Focus Timer Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            if (soundEnabled) playTacticalChime('complete');
            setTimerRunning(false);
            // Auto log session
            if (onAddFocusSession) {
              const now = new Date();
              const hours = String(now.getHours()).padStart(2, '0');
              const minutes = String(now.getMinutes()).padStart(2, '0');
              onAddFocusSession({
                date: now.toISOString().split('T')[0],
                startTime: `${hours}:${minutes}`,
                endTime: `${hours}:${minutes}`,
                durationMinutes: currentBlockIndex === 2 ? 15 : 90,
                mode: currentBlockIndex === 1 ? 'deep1' : currentBlockIndex === 2 ? 'rest' : 'deep2',
                linkedDirectiveTitle: activeGoalFocus,
                focusRating: 5,
                distractionCount: 0,
                notes: '90-minute deep work block completed with zero distractions.',
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSecondsLeft, activeGoalFocus, currentBlockIndex, onAddFocusSession, soundEnabled]);

  const handleStartTimer = () => {
    if (!timerRunning) {
      if (soundEnabled) playTacticalChime('start');
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
  };

  const handleResetTimer = (blockDurationMinutes = 90) => {
    setTimerRunning(false);
    setTimerSecondsLeft(blockDurationMinutes * 60);
  };

  const handleSelectBlock = (blockIndex: 1 | 2 | 3) => {
    setCurrentBlockIndex(blockIndex);
    setTimerRunning(false);
    if (blockIndex === 1) {
      setTimerSecondsLeft(90 * 60);
    } else if (blockIndex === 2) {
      setTimerSecondsLeft(15 * 60);
    } else {
      setTimerSecondsLeft(90 * 60);
    }
  };

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Start specific directive from Execution Queue
  const handleStartDirectiveSession = (goalTitle: string, durationMins: number) => {
    setActiveGoalFocus(goalTitle);
    setTimerSecondsLeft(durationMins * 60);
    setTimerRunning(true);
    if (soundEnabled) playTacticalChime('start');
  };

  // Directives matching Reference Image
  const executionQueueItems = useMemo(() => {
    const referenceQueue = [
      {
        num: '01',
        category: 'PROJECT',
        catColor: 'cyan',
        title: 'Connect command execution layer',
        subtitle: 'Build the core execution engine for personal OS command dashboard.',
        tags: 'P01 · Automation · L3 → L4',
        durationMins: 90,
        completed: false,
      },
      {
        num: '02',
        category: 'PROJECT',
        catColor: 'cyan',
        title: 'Complete verification suite',
        subtitle: 'Run integration test suite, audit threat boundaries, and benchmark IPC.',
        tags: 'P01 · Testing · L3 → L4',
        durationMins: 60,
        completed: false,
      },
      {
        num: '03',
        category: 'FINANCIAL',
        catColor: 'yellow',
        title: 'Research 50 prospects',
        subtitle: 'Build enterprise prospect pipeline and research technical decision-makers.',
        tags: 'F01 · Outreach · L2 → L3',
        durationMins: 45,
        completed: false,
      },
      {
        num: '04',
        category: 'LEARNING',
        catColor: 'purple',
        title: 'AI Engineering — L1 Recall',
        subtitle: 'Feynman technique: explain event-driven architecture and token limits without notes.',
        tags: 'L01 · AI/ML · L1 → L2',
        durationMins: 15,
        completed: true,
      },
    ];

    const todayGoals = state.goals?.filter((g) => g.horizon === 'Today') || [];
    if (todayGoals.length >= 4) {
      return todayGoals.slice(0, 4).map((g, idx) => ({
        num: `0${idx + 1}`,
        category:
          g.sourceType === 'FINANCIAL_OS'
            ? 'FINANCIAL'
            : g.sourceType === 'LEARNING_ENGINE'
            ? 'LEARNING'
            : 'PROJECT',
        catColor:
          g.sourceType === 'FINANCIAL_OS'
            ? 'yellow'
            : g.sourceType === 'LEARNING_ENGINE'
            ? 'purple'
            : 'cyan',
        title: g.title,
        subtitle: g.targetMetric || 'Strategic execution directive',
        tags: g.sourceRefCode || `P0${idx + 1} · Core · L3 → L4`,
        durationMins: g.estimatedMinutes || (idx === 0 ? 90 : idx === 1 ? 60 : idx === 2 ? 45 : 15),
        completed: g.status === 'COMPLETED',
      }));
    }

    return referenceQueue;
  }, [state.goals]);

  // Filtered execution queue
  const filteredQueueItems = useMemo(() => {
    return executionQueueItems.filter((item) => {
      const matchesFilter =
        queueFilter === 'ALL' || item.category === queueFilter;
      const matchesSearch =
        !queueSearch.trim() ||
        item.title.toLowerCase().includes(queueSearch.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(queueSearch.toLowerCase()) ||
        item.tags.toLowerCase().includes(queueSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [executionQueueItems, queueFilter, queueSearch]);

  // Project Portfolio Lanes matching reference image
  const portfolioLanes: PortfolioLane[] = [
    {
      id: 'backlog',
      title: 'BACKLOG',
      count: 2,
      projects: [
        {
          code: 'POS',
          title: 'Cloud Infrastructure',
          timeline: '2–4 weeks',
          description: 'Autonomous provisioning and zero-trust perimeter configuration.',
          stage: 'REQUIREMENTS',
        },
        {
          code: 'P06',
          title: 'AI Assistant',
          timeline: '3–8 weeks',
          description: 'Context-aware workspace orchestration with local embeddings.',
          stage: 'REQUIREMENTS',
        },
      ],
    },
    {
      id: 'ready',
      title: 'READY',
      count: 2,
      projects: [
        {
          code: 'P03',
          title: 'Mobile App',
          timeline: '6–10 weeks',
          description: 'React Native companion with offline cache and biometric auth.',
          stage: 'ARCHITECTURE',
        },
        {
          code: 'P04',
          title: 'Web Platform',
          timeline: '3–4 months',
          description: 'Multi-tenant high-throughput personal dashboard edge node.',
          stage: 'ARCHITECTURE',
        },
      ],
    },
    {
      id: 'active',
      title: 'ACTIVE',
      count: 1,
      highlight: true,
      projects: [
        {
          code: 'P01',
          title: 'Personal Automation Engine',
          timeline: '5–7 days',
          progress: 72,
          color: '#00f5a0',
          description: 'Connect command execution layer and automated task scheduler.',
          stage: 'IMPLEMENTATION',
          milestone: '6 of 8 milestones completed',
        },
      ],
    },
    {
      id: 'verify',
      title: 'VERIFY',
      count: 1,
      projects: [
        {
          code: 'P02',
          title: 'REST APIs',
          timeline: '3–4 weeks',
          progress: 42,
          color: '#38bdf8',
          description: 'Idempotent RESTful control plane with rate-limiting and audit log.',
          stage: 'TESTING',
          milestone: '3 of 7 milestones completed',
        },
      ],
    },
  ];

  // Recent Sessions list matching reference image
  const recentSessionsList = useMemo(() => {
    if (state.focusSessions && state.focusSessions.length > 0) {
      return state.focusSessions.slice(0, 4).map((s) => ({
        title: s.linkedDirectiveTitle || 'Strategic Deep Block',
        duration: `${s.durationMinutes} min`,
        rating: `${s.focusRating || 5}.0/5`,
        time: s.startTime || '18:10',
        iconColor: s.mode === 'deep1' || s.mode === 'deep2' ? '#00f5a0' : '#38bdf8',
      }));
    }
    return [
      {
        title: 'Personal Automation Engine',
        duration: '90 min',
        rating: '4.8/5',
        time: '18:10',
        iconColor: '#00f5a0',
      },
      {
        title: 'TypeScript Architecture',
        duration: '90 min',
        rating: '4.5/5',
        time: '14:00',
        iconColor: '#00f5a0',
      },
      {
        title: 'API Design & Benchmarking',
        duration: '90 min',
        rating: '5.0/5',
        time: '10:30',
        iconColor: '#00f5a0',
      },
      {
        title: 'React Fundamentals & State',
        duration: '60 min',
        rating: '4.2/5',
        time: '08:15',
        iconColor: '#38bdf8',
      },
    ];
  }, [state.focusSessions]);

  // 7-day velocity bars matching reference image
  const trendBars = [
    { day: 'Mon', mins: 180, pct: 95, target: 180 },
    { day: 'Tue', mins: 180, pct: 95, target: 180 },
    { day: 'Wed', mins: 150, pct: 80, target: 180 },
    { day: 'Thu', mins: 60, pct: 35, target: 180 },
    { day: 'Fri', mins: 180, pct: 95, target: 180 },
    { day: 'Sat', mins: 90, pct: 50, target: 180 },
    { day: 'Sun', mins: 90, pct: 50, target: 180 },
  ];

  // Submit manual session log
  const handleSaveManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDirectiveTitle.trim()) return;

    if (onAddFocusSession) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      onAddFocusSession({
        date: now.toISOString().split('T')[0],
        startTime: `${hours}:${minutes}`,
        endTime: `${hours}:${minutes}`,
        durationMinutes: logDurationMinutes,
        mode: logDurationMinutes >= 90 ? 'deep1' : 'custom',
        linkedDirectiveTitle: logDirectiveTitle.trim(),
        focusRating: logFocusRating,
        distractionCount: logDistractions,
        notes: logNotes.trim(),
      });
    }

    setShowLogSessionModal(false);
    setLogNotes('Deep work block logged.');
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn" id="work-scoreboard">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: WORK SCOREBOARD & VELOCITY ENGINE matching Reference Image */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-2xl bg-[#081212] border border-[#132626] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <WireframeSphere
          className="absolute -right-6 -top-10 opacity-70 pointer-events-none"
          size={320}
        />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#00f5a0] tracking-widest uppercase block">
              WORK SCOREBOARD &amp; VELOCITY ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#00f5a0]/15 border border-[#00f5a0]/40 text-[9px] font-mono text-[#00f5a0] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
              90-15-90 LIVE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#e6f4f1] tracking-tight font-mono">
            Discipline today, freedom tomorrow.
          </h1>

          <p className="text-xs sm:text-sm text-[#7a9490] leading-relaxed max-w-lg">
            Deep work compounds when blocks are guarded, measured, and reviewed without distraction.
          </p>

          {/* Quick Metrics / Pills Strip */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1]">
              <Target className="w-3.5 h-3.5 text-[#00f5a0]" />
              <span className="font-bold text-[#00f5a0]">1 / 2</span>
              <span className="text-[#7a9490]">Blocks Today</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1]">
              <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="font-bold text-[#38bdf8]">7.5h</span>
              <span className="text-[#7a9490]">This Week</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1]">
              <Flame className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
              <span className="font-bold text-[#f59e0b]">5 Days</span>
              <span className="text-[#7a9490]">Streak</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1]">
              <Star className="w-3.5 h-3.5 text-[#eab308] fill-[#eab308]" />
              <span className="font-bold text-[#eab308]">4.8 / 5</span>
              <span className="text-[#7a9490]">Rating</span>
            </div>
          </div>
        </div>

        {/* Hero Actions Right */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleStartTimer}
            className="px-4 py-2.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.3)] hover:scale-105"
          >
            {timerRunning ? (
              <>
                <Pause className="w-4 h-4 fill-[#021810]" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-[#021810]" />
                <span>Start 90m Block</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsFocusOverlayOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#071714] hover:bg-[#00f5a0]/15 border border-[#00f5a0]/40 text-[#00f5a0] font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Open Zen Fullscreen Focus Mode"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2.5 rounded-xl border font-mono text-xs transition-colors cursor-pointer flex items-center justify-center ${
              soundEnabled
                ? 'bg-[#091414] border-[#162b29] text-[#00f5a0] hover:border-[#00f5a0]/40'
                : 'bg-[#091414] border-[#162b29] text-[#55736f] hover:text-[#e6f4f1]'
            }`}
            title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Chimes Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowLogSessionModal(true)}
            className="px-3 py-2.5 rounded-xl bg-[#091414] hover:bg-[#122222] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Session</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO FOCUS & TIMER PANEL (Current Focus + Timer + Today's Protocol)    */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-[#081414] border border-[#162b29] p-5 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
          {/* COLUMN 1: CURRENT FOCUS (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5 pr-0 lg:pr-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0">
                    <Target className="w-5 h-5 text-[#00f5a0]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
                      CURRENT FOCUS
                    </span>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0e2a2a] text-[#38bdf8] border border-[#38bdf8]/40 tracking-wider">
                      PROJECT 01
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToSection?.('milestone-projects')}
                  className="font-mono text-[10px] text-[#7a9490] hover:text-[#00f5a0] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>All Projects</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#e6f4f1] font-mono leading-tight">
                  Personal Automation Engine
                </h2>
                <div className="text-xs font-semibold text-[#a1b8b4] font-mono pt-0.5">
                  Connect command execution layer
                </div>
              </div>

              <p className="text-xs text-[#7a9490] leading-relaxed">
                Build the core execution engine for the personal OS command dashboard.
              </p>
            </div>

            {/* Progress Bar & Milestone Target */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#00f5a0] font-bold">72%</span>
                <span className="text-[#7a9490] flex items-center gap-1 text-[11px]">
                  <Target className="w-3 h-3 text-[#55736f]" />
                  <span>6 / 8 milestones</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#122222] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00f5a0] to-[#38bdf8] transition-all duration-500 shadow-[0_0_8px_#00f5a0]"
                  style={{ width: '72%' }}
                />
              </div>
            </div>

            {/* Tech Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[11px]">
              {['TypeScript', 'Node.js', 'System Design', 'Automation'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-[#071313] border border-[#162b29] text-[#a1b8b4]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* COLUMN 2: DEEP WORK SESSION (4 cols) */}
          <div className="lg:col-span-4 rounded-xl bg-[#071313]/90 border border-[#162b29] p-4.5 flex flex-col items-center justify-between text-center gap-3 shadow-inner">
            <div className="w-full flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#7a9490] uppercase tracking-widest font-bold">
                · DEEP WORK SESSION
              </span>

              {/* Block Switcher Tabs */}
              <div className="flex items-center gap-1 bg-[#050a0a] p-0.5 rounded-lg border border-[#162b29]">
                <button
                  type="button"
                  onClick={() => handleSelectBlock(1)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    currentBlockIndex === 1
                      ? 'bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40'
                      : 'text-[#55736f] hover:text-[#e6f4f1]'
                  }`}
                >
                  Block 1
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectBlock(2)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    currentBlockIndex === 2
                      ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                      : 'text-[#55736f] hover:text-[#e6f4f1]'
                  }`}
                >
                  Break
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectBlock(3)}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                    currentBlockIndex === 3
                      ? 'bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40'
                      : 'text-[#55736f] hover:text-[#e6f4f1]'
                  }`}
                >
                  Block 2
                </button>
              </div>
            </div>

            {/* Timer Display with Play Trigger */}
            <div className="flex items-center justify-center gap-4 py-1">
              <button
                type="button"
                onClick={handleStartTimer}
                className="w-13 h-13 rounded-full bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 border border-[#00f5a0]/50 flex items-center justify-center text-[#00f5a0] shadow-[0_0_15px_rgba(0,245,160,0.25)] hover:scale-105 transition-all cursor-pointer shrink-0"
                title={timerRunning ? 'Pause Deep Work' : 'Start Deep Work'}
              >
                {timerRunning ? (
                  <Pause className="w-5 h-5 fill-[#00f5a0]" />
                ) : (
                  <Play className="w-5 h-5 fill-[#00f5a0] ml-0.5" />
                )}
              </button>

              <div className="text-left">
                <div className="text-4xl sm:text-5xl font-black font-mono text-[#e6f4f1] tracking-tight tabular-nums">
                  {formatTimerDigits(timerSecondsLeft)}
                </div>
                <div className="font-mono text-[10px] font-bold text-[#38bdf8] tracking-widest uppercase flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${timerRunning ? 'bg-[#00f5a0] animate-pulse' : 'bg-[#55736f]'}`} />
                  <span>
                    {currentBlockIndex === 2
                      ? '15-MINUTE REST INTERVAL'
                      : `BLOCK ${currentBlockIndex === 1 ? '1' : '2'} OF 2`}
                  </span>
                </div>
              </div>
            </div>

            {/* Start Deep Work CTA + Reset */}
            <div className="w-full flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartTimer}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all hover:scale-[1.02]"
              >
                <span>{timerRunning ? 'Pause Deep Work' : 'Start Deep Work'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(currentBlockIndex === 2 ? 15 : 90)}
                className="p-2.5 rounded-xl bg-[#091414] hover:bg-[#122222] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Helper toggle: Focus Mode */}
            <button
              type="button"
              onClick={() => setIsFocusOverlayOpen(true)}
              className="text-[10px] font-mono text-[#55736f] hover:text-[#00f5a0] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Focus Mode · No distractions</span>
            </button>
          </div>

          {/* COLUMN 3: TODAY'S PROTOCOL (3 cols) */}
          <div className="lg:col-span-3 rounded-xl bg-[#071313]/50 border border-[#162b29] p-4 flex flex-col justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] font-bold text-[#7a9490] uppercase tracking-wider block">
                TODAY&apos;S PROTOCOL
              </span>
              <div className="text-base font-bold text-[#00f5a0] font-mono pt-0.5">
                90 / 15 / 90
              </div>
            </div>

            {/* 3 Steps */}
            <div className="space-y-2">
              <div
                onClick={() => handleSelectBlock(1)}
                className={`flex items-center justify-between text-xs font-mono p-1.5 rounded-lg cursor-pointer transition-all ${
                  currentBlockIndex === 1
                    ? 'bg-[#00f5a0]/15 border border-[#00f5a0]/40 shadow-sm'
                    : 'bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                      currentBlockIndex === 1 ? 'bg-[#00f5a0] text-[#021810]' : 'bg-[#122222] text-[#00f5a0]'
                    }`}
                  >
                    1
                  </span>
                  <span className="text-[#e6f4f1] font-bold">90 min</span>
                </div>
                <span className="text-[10px] font-bold text-[#00f5a0]">Deep Work</span>
              </div>

              <div
                onClick={() => handleSelectBlock(2)}
                className={`flex items-center justify-between text-xs font-mono p-1.5 rounded-lg cursor-pointer transition-all ${
                  currentBlockIndex === 2
                    ? 'bg-[#38bdf8]/15 border border-[#38bdf8]/40 shadow-sm'
                    : 'bg-[#091414] border border-[#162b29] hover:border-[#38bdf8]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                      currentBlockIndex === 2 ? 'bg-[#38bdf8] text-[#021810]' : 'bg-[#122222] text-[#7a9490]'
                    }`}
                  >
                    2
                  </span>
                  <span className={currentBlockIndex === 2 ? 'text-[#e6f4f1] font-bold' : 'text-[#7a9490]'}>15 min</span>
                </div>
                <span className={`text-[10px] ${currentBlockIndex === 2 ? 'text-[#38bdf8] font-bold' : 'text-[#55736f]'}`}>Break</span>
              </div>

              <div
                onClick={() => handleSelectBlock(3)}
                className={`flex items-center justify-between text-xs font-mono p-1.5 rounded-lg cursor-pointer transition-all ${
                  currentBlockIndex === 3
                    ? 'bg-[#00f5a0]/15 border border-[#00f5a0]/40 shadow-sm'
                    : 'bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center ${
                      currentBlockIndex === 3 ? 'bg-[#00f5a0] text-[#021810]' : 'bg-[#122222] text-[#7a9490]'
                    }`}
                  >
                    3
                  </span>
                  <span className={currentBlockIndex === 3 ? 'text-[#e6f4f1] font-bold' : 'text-[#7a9490]'}>90 min</span>
                </div>
                <span className={`text-[10px] ${currentBlockIndex === 3 ? 'text-[#00f5a0] font-bold' : 'text-[#55736f]'}`}>Deep Work</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#55736f] flex items-center justify-between pt-1 border-t border-[#132626]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#55736f]" />
                <span>1 / 2 completed</span>
              </div>
              <span className="text-[#00f5a0] font-bold">50% Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW OF 5 STAT CARDS matching Reference Image                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* STAT 1: TODAY */}
        <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all space-y-1 shadow-sm group">
          <div className="w-7 h-7 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] group-hover:scale-110 transition-transform">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-[10px] text-[#7a9490] uppercase block pt-1">
            TODAY
          </span>
          <div className="text-xl font-bold font-mono text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors">
            1 / 2
          </div>
          <span className="text-[10px] font-mono text-[#55736f] block">
            Blocks Completed
          </span>
        </div>

        {/* STAT 2: THIS WEEK */}
        <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] hover:border-[#38bdf8]/40 transition-all space-y-1 shadow-sm group">
          <div className="w-7 h-7 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-[10px] text-[#7a9490] uppercase block pt-1">
            THIS WEEK
          </span>
          <div className="text-xl font-bold font-mono text-[#e6f4f1] group-hover:text-[#38bdf8] transition-colors">
            7.5 h
          </div>
          <span className="text-[10px] font-mono text-[#55736f] block">
            Focus Time
          </span>
        </div>

        {/* STAT 3: STREAK */}
        <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] hover:border-[#f59e0b]/40 transition-all space-y-1 shadow-sm group">
          <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] group-hover:scale-110 transition-transform">
            <Flame className="w-3.5 h-3.5 fill-[#f59e0b]" />
          </div>
          <span className="font-mono text-[10px] text-[#7a9490] uppercase block pt-1">
            STREAK
          </span>
          <div className="text-xl font-bold font-mono text-[#e6f4f1] group-hover:text-[#f59e0b] transition-colors">
            5 days
          </div>
          <span className="text-[10px] font-mono text-[#55736f] block">
            Daily Focus
          </span>
        </div>

        {/* STAT 4: FOCUS QUALITY */}
        <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] hover:border-[#eab308]/40 transition-all space-y-1 shadow-sm group">
          <div className="w-7 h-7 rounded-lg bg-[#eab308]/10 border border-[#eab308]/30 flex items-center justify-center text-[#eab308] group-hover:scale-110 transition-transform">
            <Star className="w-3.5 h-3.5 fill-[#eab308]" />
          </div>
          <span className="font-mono text-[10px] text-[#7a9490] uppercase block pt-1">
            FOCUS QUALITY
          </span>
          <div className="text-xl font-bold font-mono text-[#e6f4f1] group-hover:text-[#eab308] transition-colors">
            4.8 / 5
          </div>
          <span className="text-[10px] font-mono text-[#55736f] block">
            Avg. Session Rating
          </span>
        </div>

        {/* STAT 5: DEEP WORK RATIO */}
        <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all space-y-1 shadow-sm col-span-2 sm:col-span-1 group">
          <div className="w-7 h-7 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] group-hover:scale-110 transition-transform">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-[10px] text-[#7a9490] uppercase block pt-1">
            DEEP WORK RATIO
          </span>
          <div className="text-xl font-bold font-mono text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors">
            92%
          </div>
          <span className="text-[10px] font-mono text-[#55736f] block">
            vs. 70% target
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MIDDLE ROW: TODAY'S EXECUTION QUEUE (Left) & ANALYTICS (Right)         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: TODAY'S EXECUTION QUEUE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                TODAY&apos;S EXECUTION QUEUE
              </span>
              <span className="font-mono text-xs text-[#7a9490]">
                {executionQueueItems.length} directives · ~3h 45m
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-[#091414] p-0.5 rounded-lg border border-[#162b29]">
                {(['ALL', 'PROJECT', 'FINANCIAL', 'LEARNING'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setQueueFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                      queueFilter === cat
                        ? 'bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40'
                        : 'text-[#55736f] hover:text-[#e6f4f1]'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowQueueModal(true)}
                className="font-mono text-xs text-[#00f5a0] hover:underline cursor-pointer flex items-center gap-1 whitespace-nowrap"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 4 Directive Cards Stack */}
          <div className="space-y-2.5">
            {filteredQueueItems.map((item) => (
              <div
                key={item.num}
                className="p-3.5 rounded-xl bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all flex items-center justify-between gap-3 group shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-mono text-base font-extrabold text-[#38bdf8] shrink-0">
                    {item.num}
                  </span>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                          item.catColor === 'yellow'
                            ? 'bg-[#2a240e] text-[#f59e0b] border-[#f59e0b]/40'
                            : item.catColor === 'purple'
                            ? 'bg-[#24122a] text-[#a855f7] border-[#a855f7]/40'
                            : 'bg-[#0e2a2a] text-[#38bdf8] border-[#38bdf8]/40'
                        }`}
                      >
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors truncate">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-[#7a9490] leading-snug truncate">
                      {item.subtitle}
                    </p>

                    <div className="text-[10px] font-mono text-[#55736f]">
                      {item.tags}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs font-mono text-[#a1b8b4] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#55736f]" />
                    <span>{item.durationMins} min</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartDirectiveSession(item.title, item.durationMins)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(0,245,160,0.2)] transition-transform hover:scale-105"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: CHARTS & RECENT SESSIONS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Card A: 7-DAY FOCUS TREND */}
          <div className="p-4 rounded-xl bg-[#091414] border border-[#162b29] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                7-DAY FOCUS TREND
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#00f5a0]">
                  <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
                  <span>Actual</span>
                </span>
                <span className="flex items-center gap-1 text-[#55736f]">
                  <span className="w-2 h-0.5 border-t border-dashed border-[#7a9490]" />
                  <span>Target (180m)</span>
                </span>
              </div>
            </div>

            {/* Vertical Bar Columns */}
            <div className="pt-2">
              <div className="flex items-end justify-between h-28 gap-2 border-b border-[#132626] pb-1 px-1">
                {trendBars.map((b) => (
                  <div key={b.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full max-w-[24px] bg-[#122222] rounded-t-sm h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-[#00f5a0] rounded-t-sm transition-all duration-500 group-hover:bg-[#00f5a0]/80 shadow-[0_0_8px_rgba(0,245,160,0.2)]"
                        style={{ height: `${b.pct}%` }}
                        title={`${b.day}: ${b.mins} minutes logged (${b.pct}% target)`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Day Labels */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7a9490] pt-1.5 px-1">
                {trendBars.map((b) => (
                  <span key={b.day} className="flex-1 text-center truncate">
                    {b.day}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#55736f] pt-1 border-t border-[#132626]">
              <span>Weekly Velocity: 15.5 hrs</span>
              <span className="text-[#00f5a0] font-bold">2.2 hrs/day avg</span>
            </div>
          </div>

          {/* Card B: RECENT SESSIONS */}
          <div className="p-4 rounded-xl bg-[#091414] border border-[#162b29] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                RECENT SESSIONS
              </span>
              <button
                type="button"
                onClick={() => setShowRecentSessionsModal(true)}
                className="font-mono text-[10px] text-[#00f5a0] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recentSessionsList.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#071313] border border-[#162b29] hover:border-[#00f5a0]/30 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: s.iconColor }}
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-[#e6f4f1] block truncate text-[11px]">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-[#7a9490]">
                        {s.duration} · Rating: {s.rating}
                      </span>
                    </div>
                  </div>

                  <span className="text-[#55736f] text-[10px] shrink-0">
                    {s.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM ROW: PROJECT PORTFOLIO (Left) & PROJECT HEALTH (Right)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: PROJECT PORTFOLIO (8 cols) */}
        <div className="lg:col-span-8 p-4.5 rounded-2xl bg-[#081212] border border-[#132626] space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                PROJECT PORTFOLIO
              </span>
              <span className="font-mono text-xs text-[#7a9490]">
                6 projects
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToSection?.('milestone-projects')}
              className="font-mono text-xs text-[#00f5a0] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* 4 Kanban Status Lanes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {portfolioLanes.map((lane) => (
              <div
                key={lane.id}
                className={`p-3 rounded-xl border flex flex-col gap-2 ${
                  lane.highlight
                    ? 'bg-[#091814] border-[#00f5a0]/40 shadow-[0_0_12px_rgba(0,245,160,0.1)]'
                    : 'bg-[#091414] border-[#162b29]'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] font-bold text-[#7a9490] pb-1 border-b border-[#132626]">
                  <span>
                    {lane.title} ({lane.count})
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#55736f]" />
                </div>

                <div className="space-y-2">
                  {lane.projects.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedPortfolioProject(p);
                        setShowPortfolioModal(true);
                      }}
                      className="p-2.5 rounded-lg bg-[#071313] border border-[#162b29] hover:border-[#00f5a0]/40 transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30">
                          {p.code}
                        </span>
                        <span className="text-[10px] font-mono text-[#55736f]">
                          {p.timeline}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#e6f4f1] truncate">
                        {p.title}
                      </div>

                      {p.progress !== undefined && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#55736f]">Progress</span>
                            <span className="text-[#e6f4f1] font-bold">{p.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#122222] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${p.progress}%`, backgroundColor: p.color || '#00f5a0' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: PROJECT HEALTH (4 cols) */}
        <div className="lg:col-span-4 p-4.5 rounded-2xl bg-[#081212] border border-[#132626] flex flex-col justify-between space-y-3.5 shadow-lg">
          <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider block">
            PROJECT HEALTH
          </span>

          <div className="flex items-center justify-around gap-4 py-1">
            {/* Circular Doughnut Center */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#122222]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#00f5a0]"
                  strokeDasharray="17, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#38bdf8]"
                  strokeDashoffset="-17"
                  strokeDasharray="33, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#1e3b38]"
                  strokeDashoffset="-50"
                  strokeDasharray="50, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#e6f4f1] font-mono leading-none">
                  6
                </span>
                <span className="text-[10px] font-mono text-[#7a9490] uppercase pt-0.5">
                  Total
                </span>
              </div>
            </div>

            {/* Status Breakdown List */}
            <div className="space-y-1.5 font-mono text-xs min-w-[110px]">
              <div className="flex items-center justify-between text-[#a1b8b4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
                  <span>1 Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[#a1b8b4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5c5c]" />
                  <span>0 Blocked</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[#a1b8b4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  <span>2 Ready</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[#a1b8b4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#eab308]" />
                  <span>0 Completed</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[#a1b8b4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1e3b38]" />
                  <span>3 Queued</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#132626] text-[10px] font-mono text-[#55736f] text-center">
            Portfolio distribution verified across 6 active SDLC phases
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTTOM "EXECUTION FLOW" LIFECYCLE STRIP matching Reference Image       */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-[#081212] border border-[#132626] space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider">
              EXECUTION FLOW
            </span>
            <span className="text-[10px] font-mono text-[#7a9490]">
              End-to-end disciplined deep work lifecycle
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#55736f]">
            Cycle standard: 90 / 15 / 90
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {[
            { step: '1. Directive', desc: 'Define single priority', icon: <Target className="w-3.5 h-3.5 text-[#00f5a0]" /> },
            { step: '2. Deep Block', desc: '90m zero-distraction', icon: <Clock className="w-3.5 h-3.5 text-[#38bdf8]" /> },
            { step: '3. Guard', desc: 'Context barrier', icon: <Shield className="w-3.5 h-3.5 text-[#f59e0b]" /> },
            { step: '4. Verify', desc: 'Test & inspect output', icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#00f5a0]" /> },
            { step: '5. Log', desc: 'Audit quality & stars', icon: <Star className="w-3.5 h-3.5 text-[#eab308]" /> },
            { step: '6. Ship', desc: 'Deploy capability', icon: <Rocket className="w-3.5 h-3.5 text-[#38bdf8]" /> },
          ].map((flow, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/30 transition-colors space-y-1 text-center flex flex-col items-center justify-center"
            >
              <div className="w-7 h-7 rounded-lg bg-[#050a0a] border border-[#162b29] flex items-center justify-center">
                {flow.icon}
              </div>
              <span className="font-mono text-xs font-bold text-[#e6f4f1] block pt-1">
                {flow.step}
              </span>
              <span className="text-[10px] font-mono text-[#7a9490] block leading-tight">
                {flow.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FULL-SCREEN DEEP WORK OVERLAY                                     */}
      {/* ========================================================================= */}
      {isFocusOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-fadeIn">
          <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-6">
            <button
              onClick={() => setIsFocusOverlayOpen(false)}
              className="absolute top-6 right-6 text-[#7a9490] hover:text-[#e6f4f1] p-2 rounded-xl bg-[#091414] border border-[#162b29] cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="font-mono text-xs font-bold text-[#00f5a0] tracking-widest uppercase">
              DEEP WORK · ZERO DISTRACTIONS
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e6f4f1] font-mono">
              {activeGoalFocus}
            </h2>

            <div className="text-7xl sm:text-8xl font-black font-mono text-[#e6f4f1] tracking-tight tabular-nums py-6">
              {formatTimerDigits(timerSecondsLeft)}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStartTimer}
                className="px-8 py-3.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono font-bold text-sm cursor-pointer shadow-[0_0_20px_rgba(0,245,160,0.35)]"
              >
                {timerRunning ? 'Pause Session' : 'Resume Session'}
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(currentBlockIndex === 2 ? 15 : 90)}
                className="p-3.5 rounded-xl bg-[#091414] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TODAY'S EXECUTION QUEUE DETAILS                                   */}
      {/* ========================================================================= */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQueueModal(false)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
              EXECUTION DISCIPLINE
            </span>
            <h3 className="text-base font-bold text-[#e6f4f1] font-mono">
              Today&apos;s Strategic Directives
            </h3>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {executionQueueItems.map((item) => (
                <div
                  key={item.num}
                  className="p-3 rounded-xl bg-[#050a0a] border border-[#162b29] flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-xs font-bold text-[#e6f4f1] block truncate">
                      {item.num} · {item.title}
                    </span>
                    <p className="text-[11px] text-[#7a9490] leading-snug">
                      {item.subtitle}
                    </p>
                    <span className="text-[10px] font-mono text-[#55736f]">
                      {item.tags}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-[#00f5a0]">
                      {item.durationMins}m
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        handleStartDirectiveSession(item.title, item.durationMins);
                        setShowQueueModal(false);
                      }}
                      className="px-2.5 py-1 rounded bg-[#00f5a0] text-[#021810] text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => setShowQueueModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00f5a0] text-[#021810] font-mono text-xs font-bold cursor-pointer"
              >
                Close Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECENT SESSIONS HISTORY                                          */}
      {/* ========================================================================= */}
      {showRecentSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowRecentSessionsModal(false)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
              FOCUS TELEMETRY
            </span>
            <h3 className="text-base font-bold text-[#e6f4f1] font-mono">
              Deep Work Session History
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentSessionsList.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#050a0a] border border-[#162b29] flex items-center justify-between font-mono text-xs"
                >
                  <div>
                    <span className="font-bold text-[#e6f4f1] block">
                      {s.title}
                    </span>
                    <span className="text-[10px] text-[#7a9490]">
                      {s.duration} · Rating: {s.rating}
                    </span>
                  </div>
                  <span className="text-[#55736f] text-xs">
                    {s.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => setShowRecentSessionsModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00f5a0] text-[#021810] font-mono text-xs font-bold cursor-pointer"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MANUAL LOG FOCUS SESSION                                          */}
      {/* ========================================================================= */}
      {showLogSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowLogSessionModal(false)}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
              MANUAL SESSION LOG
            </span>
            <h3 className="text-base font-bold text-[#e6f4f1] font-mono">
              Log Deep Work Block
            </h3>

            <form onSubmit={handleSaveManualSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#a1b8b4] mb-1">
                  Directive / Goal Title
                </label>
                <input
                  type="text"
                  value={logDirectiveTitle}
                  onChange={(e) => setLogDirectiveTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1] font-mono text-xs focus:border-[#00f5a0] focus:outline-none"
                  placeholder="e.g. Personal Automation Engine"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#a1b8b4] mb-1">
                    Duration (Minutes)
                  </label>
                  <select
                    value={logDurationMinutes}
                    onChange={(e) => setLogDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1] font-mono text-xs focus:border-[#00f5a0] focus:outline-none"
                  >
                    <option value={15}>15 min (Sprint/Break)</option>
                    <option value={30}>30 min (Light)</option>
                    <option value={45}>45 min (Research)</option>
                    <option value={60}>60 min (Standard)</option>
                    <option value={90}>90 min (Deep Work Block)</option>
                    <option value={120}>120 min (Extended)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#a1b8b4] mb-1">
                    Focus Rating (1–5)
                  </label>
                  <select
                    value={logFocusRating}
                    onChange={(e) => setLogFocusRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1] font-mono text-xs focus:border-[#00f5a0] focus:outline-none"
                  >
                    <option value={5}>5.0 — Flow State (Zero Interruption)</option>
                    <option value={4}>4.0 — High Focus</option>
                    <option value={3}>3.0 — Moderate Focus</option>
                    <option value={2}>2.0 — Frequent Distraction</option>
                    <option value={1}>1.0 — Broken Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1b8b4] mb-1">
                  Distractions Count
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={logDistractions}
                  onChange={(e) => setLogDistractions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1] font-mono text-xs focus:border-[#00f5a0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#a1b8b4] mb-1">
                  Notes / Artifact Created
                </label>
                <textarea
                  rows={2}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050a0a] border border-[#162b29] text-[#e6f4f1] font-mono text-xs focus:border-[#00f5a0] focus:outline-none"
                  placeholder="What was built, proved, or unblocked during this session?"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#132626]">
                <button
                  type="button"
                  onClick={() => setShowLogSessionModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#091414] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.25)]"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PROJECT PORTFOLIO INSPECTOR                                       */}
      {/* ========================================================================= */}
      {showPortfolioModal && selectedPortfolioProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#091414] border border-[#162b29] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowPortfolioModal(false);
                setSelectedPortfolioProject(null);
              }}
              className="absolute top-4 right-4 text-[#55736f] hover:text-[#e6f4f1] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30">
                {selectedPortfolioProject.code}
              </span>
              <span className="font-mono text-[10px] text-[#7a9490] uppercase">
                {selectedPortfolioProject.timeline}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#e6f4f1] font-mono">
              {selectedPortfolioProject.title}
            </h3>

            <p className="text-xs text-[#a1b8b4] leading-relaxed">
              {selectedPortfolioProject.description || 'System initiative tracked in personal operating system repository.'}
            </p>

            {selectedPortfolioProject.progress !== undefined && (
              <div className="space-y-1.5 p-3 rounded-xl bg-[#050a0a] border border-[#162b29]">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#7a9490]">Milestone Velocity</span>
                  <span className="text-[#00f5a0] font-bold">{selectedPortfolioProject.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#122222] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00f5a0]"
                    style={{ width: `${selectedPortfolioProject.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#132626]">
              <button
                type="button"
                onClick={() => {
                  setActiveGoalFocus(`${selectedPortfolioProject.code} — ${selectedPortfolioProject.title}`);
                  setShowPortfolioModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#071714] border border-[#00f5a0]/40 text-[#00f5a0] font-mono text-xs font-bold hover:bg-[#00f5a0]/20 cursor-pointer"
              >
                Set as Active Focus
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPortfolioModal(false);
                  onNavigateToSection?.('milestone-projects');
                }}
                className="px-4 py-2 rounded-xl bg-[#00f5a0] text-[#021810] font-mono text-xs font-bold cursor-pointer"
              >
                View Full Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
