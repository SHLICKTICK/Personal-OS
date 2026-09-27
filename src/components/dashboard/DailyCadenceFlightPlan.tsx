import React, { useEffect, useState } from 'react';
import {
  Timer,
  Sun,
  Rocket,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  ClipboardCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  DailyCadenceBlock,
  POSState,
  Review,
  RoadmapItem,
} from '../../models/types';

interface DailyCadenceFlightPlanProps {
  state: POSState;
  onToggleCadenceBlock: (id: string) => void;
  onAddReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onDeleteReview: (id: string) => void;
  onUpdateRoadmapItem: (itemId: string, updates: Partial<RoadmapItem>) => void;
}

export const DailyCadenceFlightPlan: React.FC<DailyCadenceFlightPlanProps> = ({
  state,
  onToggleCadenceBlock,
  onAddReview,
  onDeleteReview,
  onUpdateRoadmapItem,
}) => {
  const [subView, setSubView] = useState<'cadence' | 'timer' | 'reviews' | 'flightplan'>('cadence');

  // 90-15-90 Deep Work Timer
  const [timerSeconds, setTimerSeconds] = useState(90 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'deep1' | 'rest' | 'deep2'>('deep1');

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      // Advance stage
      if (timerMode === 'deep1') {
        setTimerMode('rest');
        setTimerSeconds(15 * 60);
      } else if (timerMode === 'rest') {
        setTimerMode('deep2');
        setTimerSeconds(90 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds, timerMode]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetTimerMode = (mode: 'deep1' | 'rest' | 'deep2') => {
    setTimerMode(mode);
    setTimerRunning(false);
    if (mode === 'deep1' || mode === 'deep2') {
      setTimerSeconds(90 * 60);
    } else {
      setTimerSeconds(15 * 60);
    }
  };

  // Review state
  const [reviewCadence, setReviewCadence] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [whatBuilt, setWhatBuilt] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [nextDirective, setNextDirective] = useState('');
  const [minutesLogged, setMinutesLogged] = useState(180);

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatBuilt.trim() && !whatLearned.trim()) return;
    onAddReview({
      cadence: reviewCadence,
      date: new Date().toISOString().split('T')[0],
      whatWasBuilt: whatBuilt.trim(),
      whatWasLearned: whatLearned.trim(),
      whatFailed: whatFailed.trim() || 'None',
      nextDayDirective: nextDirective.trim() || 'Execute morning 90-minute deep block',
      deepWorkMinutesLogged: Number(minutesLogged) || 180,
    });
    setWhatBuilt('');
    setWhatLearned('');
    setWhatFailed('');
    setNextDirective('');
  };

  const completedCadenceCount = state.deepWorkBlocks.filter((b) => b.completedToday).length;

  return (
    <section id="work-scoreboards" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3c4a42]/30 gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-bold border border-[#4edea3]/30">
            MOD_07_08
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#e2e2e8] uppercase font-mono flex items-center gap-2">
              WORK SCOREBOARDS & 10-YEAR HORIZON FLIGHT PLAN
            </h2>
            <p className="text-xs text-[#bbcabf] font-mono">
              The 90-15-90 Deep Work Protocol, tactical daily cadences, execution reviews, and decade flight vectors.
            </p>
          </div>
        </div>

        {/* View Switcher Sub-tabs */}
        <div className="flex items-center gap-1 bg-[#0c0e12] p-1 rounded border border-[#3c4a42]/30 overflow-x-auto">
          {[
            { id: 'cadence', label: 'Daily Cadence' },
            { id: 'timer', label: '90-15-90 Timer' },
            { id: 'reviews', label: 'Execution Reviews' },
            { id: 'flightplan', label: '10-Year Horizon' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer whitespace-nowrap transition-colors ${
                subView === tab.id
                  ? 'bg-[#4edea3] text-[#003822] font-bold shadow-sm'
                  : 'text-[#bbcabf] hover:text-[#e2e2e8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SubView: Daily Cadence */}
      {subView === 'cadence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded bg-[#1a1c20] border border-[#3c4a42]/30">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#4edea3]" />
              <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase">
                DEEP WORK BLOCKS // SCHEDULE CADENCE
              </span>
            </div>
            <span className="font-mono text-xs text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
              {completedCadenceCount} / {state.deepWorkBlocks.length} BLOCKS COMPLETE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.deepWorkBlocks.map((block: DailyCadenceBlock) => (
              <div
                key={block.id}
                onClick={() => onToggleCadenceBlock(block.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  block.completedToday
                    ? 'bg-[#4edea3]/10 border-[#4edea3]/40'
                    : 'bg-[#1a1c20] border-[#3c4a42]/30 hover:border-[#bbcabf]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#4edea3]">
                    {block.completedToday ? (
                      <CheckSquare className="w-4 h-4 text-[#4edea3]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#bbcabf]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#4cd7f6] font-bold">{block.timeRange}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#3c4a42]/30 text-[#bbcabf] uppercase">
                        {block.code}
                      </span>
                    </div>
                    <h4 className="font-mono text-xs font-bold text-[#e2e2e8] mt-1">{block.title}</h4>
                    <p className="font-mono text-[11px] text-[#bbcabf] mt-0.5">{block.subtitle}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1.5 py-0.5 rounded">
                  {block.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubView: 90-15-90 Timer */}
      {subView === 'timer' && (
        <div className="p-6 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-6 max-w-xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-[#4edea3]">
            <Timer className="w-5 h-5" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              THE 90-15-90 DEEP WORK PROTOCOL
            </h3>
          </div>
          <p className="font-mono text-xs text-[#bbcabf]">
            Two uninterrupted 90-minute blocks of high-cognition deep work separated by a strict 15-minute neurological decompression break.
          </p>

          <div className="flex justify-center gap-2">
            {[
              { id: 'deep1' as const, label: 'Block 1 (90m)' },
              { id: 'rest' as const, label: 'Rest (15m)' },
              { id: 'deep2' as const, label: 'Block 2 (90m)' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleSetTimerMode(st.id)}
                className={`px-3 py-1.5 rounded font-mono text-xs cursor-pointer border ${
                  timerMode === st.id
                    ? 'bg-[#4edea3] text-[#003822] font-bold border-[#4edea3]'
                    : 'bg-[#111318] text-[#bbcabf] border-[#3c4a42]/40 hover:text-[#e2e2e8]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="font-mono text-6xl font-bold text-[#e2e2e8] tracking-widest py-4">
            {formatTimer(timerSeconds)}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="px-6 py-2.5 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-sm font-bold cursor-pointer transition-colors flex items-center gap-2"
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {timerRunning ? 'PAUSE CLOCK' : 'ENGAGE FOCUS'}
            </button>
            <button
              onClick={() => handleSetTimerMode(timerMode)}
              className="p-2.5 rounded bg-[#111318] border border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SubView: Reviews */}
      {subView === 'reviews' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateReview} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider flex items-center gap-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                FILE CADENCE EXECUTION REVIEW
              </h3>
              <div className="flex gap-1">
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setReviewCadence(t)}
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${
                      reviewCadence === t ? 'bg-[#4edea3] text-[#003822] font-bold' : 'text-[#bbcabf] bg-[#111318]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="What was built? (Artifacts, commits, PRs)..."
                value={whatBuilt}
                onChange={(e) => setWhatBuilt(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
              <input
                type="text"
                placeholder="What was learned / encoded?..."
                value={whatLearned}
                onChange={(e) => setWhatLearned(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="What failed or experienced drag?..."
                value={whatFailed}
                onChange={(e) => setWhatFailed(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Next Day Directive..."
                value={nextDirective}
                onChange={(e) => setNextDirective(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#bbcabf]">Deep Minutes:</span>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={minutesLogged}
                  onChange={(e) => setMinutesLogged(Number(e.target.value))}
                  className="w-20 bg-[#111318] border border-[#3c4a42]/40 rounded px-2 py-1 font-mono text-xs text-[#e2e2e8]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer"
            >
              RECORD REVIEW IN LOG
            </button>
          </form>

          <div className="space-y-3">
            {state.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#4cd7f6] uppercase font-bold">[{rev.cadence}]</span>
                    <span className="font-mono text-xs text-[#bbcabf]">{rev.date}</span>
                    <span className="font-mono text-xs text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
                      DEEP LOG: {rev.deepWorkMinutesLogged} MIN
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteReview(rev.id)}
                    className="text-[#bbcabf] hover:text-[#ffb4ab] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-[#4edea3] font-bold">Built: </span>
                    <span className="text-[#e2e2e8]">{rev.whatWasBuilt}</span>
                  </div>
                  <div>
                    <span className="text-[#4cd7f6] font-bold">Learned: </span>
                    <span className="text-[#e2e2e8]">{rev.whatWasLearned}</span>
                  </div>
                  {rev.whatFailed && rev.whatFailed !== 'None' && (
                    <div>
                      <span className="text-[#ffb4ab] font-bold">Frictions: </span>
                      <span className="text-[#ffdad6]">{rev.whatFailed}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#bbcabf] font-bold">Directive: </span>
                    <span className="text-[#e2e2e8]">{rev.nextDayDirective}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubView: 10-Year Horizon Flight Plan */}
      {subView === 'flightplan' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-[#4edea3]" />
              <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase">
                THE 10-YEAR HORIZON FLIGHT PLAN ROADMAP (2026 – 2036)
              </h3>
            </div>
            <span className="font-mono text-xs text-[#4edea3]">LONG-RANGE COMPOUNDING VECTOR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.roadmap.map((item: RoadmapItem) => (
              <div key={item.id} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#4cd7f6]">{item.yearPhase}</span>
                    <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase">{item.title}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30">
                    {item.badge}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#bbcabf]">{item.description}</p>
                <div className="pt-2 border-t border-[#3c4a42]/20 font-mono text-[11px] text-[#e2e2e8] flex items-center justify-between">
                  <span>Target: <strong className="text-[#4edea3]">{item.targetText}</strong></span>
                  <span className="text-[#bbcabf]">{item.linkedProjectName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
