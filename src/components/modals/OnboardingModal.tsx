import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Target,
  Shield,
  Layers,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
  Zap,
  Terminal,
  Activity,
  Rocket,
  User,
} from 'lucide-react';
import { CompetenceBadge, POSState } from '../../models/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: POSState;
  onCompleteOnboarding: (data: {
    operatorName: string;
    northStarCorePrinciple: string;
    northStarSupporting: string;
    competenceBadges: CompetenceBadge[];
    stopImmediatelyList: string[];
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  state,
  onCompleteOnboarding,
}) => {
  if (!isOpen) return null;

  // Step indices:
  // 0: Welcome / Introduction
  // 1: How It Works (Educational Overview)
  // 2: Form Step 1: Basic Profile / Operator Identity
  // 3: Form Step 2: North Star Vision & 10-Year Anchor
  // 4: Form Step 3: Core Preferences & Focus Budget (Competence Allocation)
  // 5: Form Step 4: Daily Goals & Core Non-Negotiables (Anti-Goals)
  // 6: Form Step 5: System Ready & Launch Initialization
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [operatorName, setOperatorName] = useState(state.operatorName || 'OP // TERMINAL_01');
  const [discipline, setDiscipline] = useState('Full-Stack Software Systems');
  const [northStarCore, setNorthStarCore] = useState(
    state.northStarCorePrinciple || 'Build sovereign technical autonomy and high-leverage software systems.'
  );
  const [northStarSupporting, setNorthStarSupporting] = useState(
    state.northStarSupporting ||
      'Build deep technical capability, rigorous engineering reasoning, practical execution, and the ability to compound capital.'
  );

  // Competence Badges
  const [badges, setBadges] = useState<CompetenceBadge[]>(
    state.competenceBadges && state.competenceBadges.length > 0
      ? state.competenceBadges.map((b) => ({ ...b }))
      : [
          { id: 'cb-1', role: 'Software Engineer', allocationText: '40% Depth', percentage: 40, accent: 'primary' },
          { id: 'cb-2', role: 'Entrepreneur', allocationText: '20% Commercial', percentage: 20, accent: 'secondary' },
          { id: 'cb-3', role: 'Investor', allocationText: '15% Allocation', percentage: 15, accent: 'tertiary' },
          { id: 'cb-4', role: 'Strategist', allocationText: '15% Asymmetry', percentage: 15, accent: 'neutral' },
          { id: 'cb-5', role: 'Creative Builder', allocationText: '10% Synthesis', percentage: 10, accent: 'primary' },
        ]
  );

  // Non-negotiables
  const [antiGoals, setAntiGoals] = useState<string[]>(
    state.stopImmediatelyList && state.stopImmediatelyList.length > 0
      ? [...state.stopImmediatelyList]
      : [
          'Consuming endless tech tutorials without writing net-new code.',
          'Checking communication apps during the morning 90-min deep work block.',
          'Optimizing vanity metrics (social follower counts, superficial certifications).',
          'Waiting to "feel like it" before shipping code to production.',
        ]
  );
  const [customAntiGoal, setCustomAntiGoal] = useState('');

  const TOTAL_STEPS = 7;
  const progressPercent = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    onCompleteOnboarding({
      operatorName: operatorName.trim() || 'OP // TERMINAL_01',
      northStarCorePrinciple: northStarCore.trim(),
      northStarSupporting: northStarSupporting.trim(),
      competenceBadges: badges,
      stopImmediatelyList: antiGoals,
    });
    onClose();
  };

  const handleAddAntiGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAntiGoal.trim()) return;
    setAntiGoals((prev) => [...prev, customAntiGoal.trim()]);
    setCustomAntiGoal('');
  };

  const handleRemoveAntiGoal = (index: number) => {
    setAntiGoals((prev) => prev.filter((_, i) => i !== index));
  };

  // Presets for quick selection
  const applyPresetProfile = (title: string, core: string, supp: string) => {
    setDiscipline(title);
    setNorthStarCore(core);
    setNorthStarSupporting(supp);
  };

  const applyFocusAllocationPreset = (type: 'engineering' | 'founder' | 'balanced') => {
    if (type === 'engineering') {
      setBadges([
        { id: 'cb-1', role: 'Software Engineer', allocationText: '55% Depth', percentage: 55, accent: 'primary' },
        { id: 'cb-2', role: 'Systems Architect', allocationText: '20% Systems', percentage: 20, accent: 'secondary' },
        { id: 'cb-3', role: 'Investor / Capital', allocationText: '10% Allocation', percentage: 10, accent: 'tertiary' },
        { id: 'cb-4', role: 'Strategist', allocationText: '10% Asymmetry', percentage: 10, accent: 'neutral' },
        { id: 'cb-5', role: 'Technical Writer', allocationText: '5% Synthesis', percentage: 5, accent: 'primary' },
      ]);
    } else if (type === 'founder') {
      setBadges([
        { id: 'cb-1', role: 'Product Engineer', allocationText: '35% Build', percentage: 35, accent: 'primary' },
        { id: 'cb-2', role: 'Commercial Founder', allocationText: '30% Sales', percentage: 30, accent: 'secondary' },
        { id: 'cb-3', role: 'Capital Allocator', allocationText: '15% Runway', percentage: 15, accent: 'tertiary' },
        { id: 'cb-4', role: 'Brand Strategist', allocationText: '10% Market', percentage: 10, accent: 'neutral' },
        { id: 'cb-5', role: 'Growth Architect', allocationText: '10% Scale', percentage: 10, accent: 'primary' },
      ]);
    } else {
      setBadges([
        { id: 'cb-1', role: 'Software Engineer', allocationText: '40% Depth', percentage: 40, accent: 'primary' },
        { id: 'cb-2', role: 'Entrepreneur', allocationText: '20% Commercial', percentage: 20, accent: 'secondary' },
        { id: 'cb-3', role: 'Investor', allocationText: '15% Allocation', percentage: 15, accent: 'tertiary' },
        { id: 'cb-4', role: 'Strategist', allocationText: '15% Asymmetry', percentage: 15, accent: 'neutral' },
        { id: 'cb-5', role: 'Creative Builder', allocationText: '10% Synthesis', percentage: 10, accent: 'primary' },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#081414] border border-[#162b29] shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* ========================================================================= */}
        {/* PERSISTENT HEADER & LIVE PROGRESS BAR                                      */}
        {/* ========================================================================= */}
        <div className="bg-[#0b1a19] border-b border-[#162b29] px-5 sm:px-7 pt-4 pb-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider text-[#e6f4f1] uppercase">
                EXECUTIVE POS // INITIAL SETUP
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-[#00f5a0] font-bold tabular-nums">
                Step {currentStep + 1} of {TOTAL_STEPS} ({progressPercent}%)
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-mono text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
                title="Skip onboarding and enter dashboard"
              >
                Skip to Dashboard ✕
              </button>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full h-1.5 bg-[#050a0a] rounded-full overflow-hidden border border-[#162b29]">
            <div
              className="h-full bg-gradient-to-r from-[#38bdf8] to-[#00f5a0] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP CONTENT BODY                                                         */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col justify-between">
          
          {/* SCREEN 1: WELCOME / INTRODUCTION */}
          {currentStep === 0 && (
            <div className="flex flex-col items-center text-center py-4 sm:py-6 gap-5 animate-fadeIn">
              {/* Minimalist Cybernetic Branding Emblem */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0e241f] to-[#050a0a] border border-[#00f5a0]/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,245,160,0.15)]">
                  <Terminal className="w-10 h-10 text-[#00f5a0]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8] flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-md">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#00f5a0] font-bold">
                  SYSTEM INITIALIZATION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#e6f4f1] tracking-tight">
                  Hello, Welcome to Executive POS
                </h2>
                <p className="text-sm sm:text-base font-mono text-[#38bdf8] font-medium">
                  Your Personal Operating System
                </p>
                <p className="text-xs text-[#7a9490] font-mono leading-relaxed pt-2">
                  A high-agency command dashboard designed for software engineers and technical founders. 
                  Align long-term strategic vision with daily deep work, SDLC milestone delivery, active recall, and capital compounding.
                </p>
              </div>

              {/* Quick Feature Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <div className="px-3 py-1 rounded-md bg-[#0b1a19] border border-[#162b29] font-mono text-[10px] text-[#7a9490]">
                  ⚡ 6-Phase SDLC Pipelines
                </div>
                <div className="px-3 py-1 rounded-md bg-[#0b1a19] border border-[#162b29] font-mono text-[10px] text-[#7a9490]">
                  🧠 7-Stage Spaced Recall
                </div>
                <div className="px-3 py-1 rounded-md bg-[#0b1a19] border border-[#162b29] font-mono text-[10px] text-[#7a9490]">
                  ⏱ 90-Min Deep Work Cadence
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: HOW IT WORKS (EDUCATIONAL OVERVIEW) */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6 py-2 animate-fadeIn">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#00f5a0] font-bold">
                  ARCHITECTURE &amp; METHODOLOGY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#e6f4f1] tracking-tight mt-0.5">
                  How Executive POS Operates
                </h3>
                <p className="text-xs text-[#7a9490] font-mono mt-1">
                  Three simple stages bridge your high-level ambitions into daily execution invariants.
                </p>
              </div>

              {/* 3-Step Educational Icon Cards */}
              <div className="grid grid-cols-1 gap-3.5">
                <div className="p-4 rounded-xl bg-[#0b1a19] border border-[#00f5a0]/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0] shrink-0 font-mono font-bold text-sm">
                    01
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-[#e6f4f1] flex items-center gap-2">
                      <span>Personalized Setup</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#00f5a0]/10 text-[#00f5a0]">
                        Step 1
                      </span>
                    </h4>
                    <p className="text-xs text-[#7a9490] leading-relaxed">
                      Tell us a bit about your call sign, primary discipline, and 10-year North Star vision to configure your baseline operating terminal.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1a19] border border-[#38bdf8]/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0 font-mono font-bold text-sm">
                    02
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-[#e6f4f1] flex items-center gap-2">
                      <span>Step-by-Step Progress</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#38bdf8]/10 text-[#38bdf8]">
                        Step 2
                      </span>
                    </h4>
                    <p className="text-xs text-[#7a9490] leading-relaxed">
                      Complete quick, bite-sized prompts as you go without the cognitive fatigue of an overwhelming single form.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1a19] border border-[#a78bfa]/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 font-mono font-bold text-sm">
                    03
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-[#e6f4f1] flex items-center gap-2">
                      <span>Your Operating System</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#a78bfa]/10 text-[#a78bfa]">
                        Step 3
                      </span>
                    </h4>
                    <p className="text-xs text-[#7a9490] leading-relaxed">
                      Unlock a customized dashboard tailored specifically to run your daily life, engineering sprints, active recall, and commercial runway.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: FORM STEP 1 - BASIC PROFILE / OPERATOR IDENTITY */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5 py-2 animate-fadeIn">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#00f5a0] font-bold">
                  PROGRESSIVE ONBOARDING // STEP 1 OF 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#e6f4f1] tracking-tight mt-0.5">
                  Operator Identity &amp; Discipline
                </h3>
                <p className="text-xs text-[#7a9490] font-mono mt-1">
                  How should your terminal address you across commands and weekly audit sign-offs?
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#e6f4f1] font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#00f5a0]" />
                    <span>Operator Call Sign / Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Alex Chen // OP_01"
                    className="bg-[#050a0a] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3.5 py-2.5 text-sm text-[#e6f4f1] font-mono focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#e6f4f1] font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Primary Technical Discipline</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    placeholder="e.g. Full-Stack Software Systems"
                    className="bg-[#050a0a] border border-[#162b29] focus:border-[#38bdf8] rounded-lg px-3.5 py-2.5 text-sm text-[#e6f4f1] font-mono focus:outline-none"
                  />
                </div>

                {/* Quick Discipline Suggestions */}
                <div className="pt-1">
                  <span className="font-mono text-[10px] text-[#7a9490] uppercase block mb-1.5">
                    Quick Discipline Presets:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Full-Stack Software Systems',
                      'Distributed Architecture & Cloud',
                      'AI & Autonomous Systems Builder',
                      'Technical Founder & Venture Scale',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDiscipline(preset)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                          discipline === preset
                            ? 'bg-[#00f5a0]/20 border-[#00f5a0] text-[#00f5a0] font-bold'
                            : 'bg-[#0b1a19] border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1]'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: FORM STEP 2 - NORTH STAR VISION & 10-YEAR ANCHOR */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5 py-2 animate-fadeIn">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#00f5a0] font-bold">
                  PROGRESSIVE ONBOARDING // STEP 2 OF 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#e6f4f1] tracking-tight mt-0.5">
                  North Star Vision &amp; 10-Year Anchor
                </h3>
                <p className="text-xs text-[#7a9490] font-mono mt-1">
                  Define your primary mission statement and the capability standard governing your personal OS.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#e6f4f1] font-bold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#00f5a0]" />
                    <span>Core Mission Anchor (Headline)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={northStarCore}
                    onChange={(e) => setNorthStarCore(e.target.value)}
                    placeholder="e.g. Build sovereign technical autonomy and high-leverage software systems."
                    className="bg-[#050a0a] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3.5 py-2.5 text-sm text-[#e6f4f1] font-bold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#e6f4f1] font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Operational Creed &amp; Reasoning Standard</span>
                  </label>
                  <textarea
                    rows={2}
                    value={northStarSupporting}
                    onChange={(e) => setNorthStarSupporting(e.target.value)}
                    placeholder="Operational description of your long-term capability and standard..."
                    className="bg-[#050a0a] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3.5 py-2 text-xs text-[#e6f4f1] focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Preset Vision Cards */}
                <div className="pt-1">
                  <span className="font-mono text-[10px] text-[#7a9490] uppercase block mb-1.5">
                    Select an Archetype Preset:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        applyPresetProfile(
                          'Full-Stack Software Systems',
                          'Become exceptionally capable.',
                          'Build deep technical capability, rigorous engineering reasoning, practical execution, and the ability to compound useful systems.'
                        )
                      }
                      className="p-2.5 rounded-lg bg-[#0b1a19] border border-[#162b29] hover:border-[#00f5a0]/50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="font-mono text-xs text-[#00f5a0] font-bold">
                        Systems Engineering Focus
                      </div>
                      <div className="text-[11px] text-[#7a9490] truncate mt-0.5">
                        Deep software capability &amp; production resilience
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        applyPresetProfile(
                          'Technical Founder & Venture Scale',
                          'Build sovereign independence and asymmetric leverage.',
                          'Create software equity, deploy autonomous agent infrastructure, and achieve complete capital freedom by 2030.'
                        )
                      }
                      className="p-2.5 rounded-lg bg-[#0b1a19] border border-[#162b29] hover:border-[#38bdf8]/50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="font-mono text-xs text-[#38bdf8] font-bold">
                        Venture &amp; Capital Sovereign
                      </div>
                      <div className="text-[11px] text-[#7a9490] truncate mt-0.5">
                        High-leverage software equity &amp; capital compounding
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: FORM STEP 3 - FOCUS BUDGET & COMPETENCE ALLOCATION */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-5 py-2 animate-fadeIn">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#00f5a0] font-bold">
                  PROGRESSIVE ONBOARDING // STEP 3 OF 5
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#e6f4f1] tracking-tight mt-0.5">
                  Focus Budget &amp; Competence Matrix
                </h3>
                <p className="text-xs text-[#7a9490] font-mono mt-1">
                  How is your weekly cognitive bandwidth allocated across your disciplines? (Sum = 100%)
                </p>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyFocusAllocationPreset('engineering')}
                  className="px-2.5 py-1 rounded bg-[#0b1a19] border border-[#162b29] text-[#7a9490] hover:text-[#00f5a0] font-mono text-[11px] cursor-pointer"
                >
                  ⚡ Deep Engineering Heavy (55/20/10)
                </button>
                <button
                  type="button"
                  onClick={() => applyFocusAllocationPreset('founder')}
                  className="px-2.5 py-1 rounded bg-[#0b1a19] border border-[#162b29] text-[#7a9490] hover:text-[#38bdf8] font-mono text-[11px] cursor-pointer"
                >
                  💼 Founder / Commercial (35/30/15)
                </button>
                <button
                  type="button"
                  onClick={() => applyFocusAllocationPreset('balanced')}
                  className="px-2.5 py-1 rounded bg-[#0b1a19] border border-[#162b29] text-[#7a9490] hover:text-[#a78bfa] font-mono text-[11px] cursor-pointer"
                >
                  ⚖️ Balanced Architect (40/20/15)
                </button>
              </div>

              {/* Badges Interactive List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {badges.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-[#0b1a19] border border-[#162b29] flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <span className="font-mono text-xs font-bold text-[#e6f4f1]">
                        {b.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="70"
                        step="5"
                        value={b.percentage}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const next = [...badges];
                          next[idx].percentage = val;
                          const suffix = next[idx].allocationText.split(' ')[1] || 'Focus';
                          next[idx].allocationText = `${val}% ${suffix}`;
                          setBadges(next);
                        }}
                        className="w-24 accent-[#00f5a0]"
                      />
                      <span className="font-mono text-xs font-bold text-[#00f5a0] w-12 text-right tabular-nums">
                        {b.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 6: FORM STEP 4 - CORE NON-NEGOTIABLES (ANTI-GOALS) */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-5 py-2 animate-fadeIn">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#00f5a0] font-bold">
                  PROGRESSIVE ONBOARDING // STEP 4 OF 5
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#e6f4f1] tracking-tight">
                    Core Non-Negotiables (The &ldquo;Never List&rdquo;)
                  </h3>
                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#f43f5e]/20 text-[#f43f5e] font-bold">
                    INVERSION
                  </span>
                </div>
                <p className="text-xs text-[#7a9490] font-mono mt-1">
                  What activities, habits, or distractions are strictly prohibited during your operational cycles?
                </p>
              </div>

              {/* Add Anti-Goal Input */}
              <form onSubmit={handleAddAntiGoal} className="flex gap-2">
                <input
                  type="text"
                  value={customAntiGoal}
                  onChange={(e) => setCustomAntiGoal(e.target.value)}
                  placeholder="Add custom prohibited trap (e.g. No meetings before 11:00 AM)..."
                  className="flex-1 bg-[#050a0a] border border-[#162b29] focus:border-[#f43f5e] rounded-lg px-3 py-2 text-xs text-[#e6f4f1] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-[#f43f5e]/20 hover:bg-[#f43f5e]/30 border border-[#f43f5e]/40 text-[#f43f5e] font-mono text-xs font-bold cursor-pointer"
                >
                  Add Rule
                </button>
              </form>

              {/* List of Anti-Goals */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {antiGoals.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0b1a19] border border-[#f43f5e]/20 flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#f43f5e]/20 text-[#f43f5e] font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
                        ✕
                      </span>
                      <span className="text-xs text-[#e6f4f1] truncate">
                        {rule}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAntiGoal(idx)}
                      className="text-xs text-[#7a9490] hover:text-[#f43f5e] p-1 cursor-pointer shrink-0"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 7: FORM STEP 5 - SYSTEM READY & LAUNCH INITIALIZATION */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-5 py-2 animate-fadeIn">
              <div className="text-center sm:text-left">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#00f5a0] font-bold">
                  INITIALIZATION COMPLETE // SYSTEM READY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#e6f4f1] tracking-tight mt-0.5">
                  Executive POS is Customized &amp; Ready
                </h3>
                <p className="text-xs text-[#7a9490] font-mono mt-1">
                  Your baseline configuration has been compiled. Launching will unlock your live 9-module executive terminal.
                </p>
              </div>

              {/* System Configuration Summary Matrix */}
              <div className="p-4 rounded-xl bg-[#0b1a19] border border-[#00f5a0]/40 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#162b29] pb-2">
                  <span className="text-[#7a9490]">Operator Identity:</span>
                  <span className="text-[#00f5a0] font-bold">{operatorName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#162b29] pb-2">
                  <span className="text-[#7a9490]">Discipline Track:</span>
                  <span className="text-[#38bdf8]">{discipline}</span>
                </div>
                <div className="flex justify-between items-start border-b border-[#162b29] pb-2 gap-2">
                  <span className="text-[#7a9490] shrink-0">North Star:</span>
                  <span className="text-[#e6f4f1] text-right font-sans font-medium line-clamp-1">
                    &ldquo;{northStarCore}&rdquo;
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[#162b29] pb-2">
                  <span className="text-[#7a9490]">Focus Allocation:</span>
                  <span className="text-[#a78bfa]">
                    {badges.map((b) => `${b.percentage}% ${b.role.split(' ')[0]}`).slice(0, 3).join(', ')}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#7a9490]">Inversion Rules:</span>
                  <span className="text-[#f43f5e]">{antiGoals.length} Active Non-Negotiables</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#00f5a0]/10 border border-[#00f5a0]/30 text-xs font-mono text-[#00f5a0] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All parameters persisted locally in browser state and IndexedDB storage.</span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PERSISTENT FOOTER NAVIGATION BUTTONS                                      */}
        {/* ========================================================================= */}
        <div className="bg-[#0b1a19] border-t border-[#162b29] px-5 sm:px-7 py-4 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg bg-[#0e201e] hover:bg-[#162b29] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
            >
              Skip Setup
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === 0 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00f5a0]/20 transition-all hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00f5a0]/20 transition-all hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep > 1 && currentStep < TOTAL_STEPS - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00f5a0]/20 transition-all hover:scale-[1.02]"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === TOTAL_STEPS - 1 && (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#00f5a0]/25 transition-all hover:scale-[1.02]"
              >
                <Rocket className="w-4 h-4" />
                <span>Initialize Executive POS</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
