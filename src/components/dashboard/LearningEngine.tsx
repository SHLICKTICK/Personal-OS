import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  BookOpen,
  Link as LinkIcon,
  X,
  Sparkles,
} from 'lucide-react';
import {
  LearningStageInfo,
  LearningStageLevel,
  LearningTopic,
  POSState,
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
}

export const LearningEngine: React.FC<LearningEngineProps> = ({
  state,
  onSelectCurrentStage,
  onReviewTopic,
  onAddLearningTopic,
}) => {
  const [inspectedStage, setInspectedStage] = useState<LearningStageInfo | null>(
    state.learningStages.find((s) => s.level === state.currentLearningStage) ||
      state.learningStages[6]
  );

  const [activeTopic, setActiveTopic] = useState<LearningTopic | null>(null);
  const [selectedStageForTopic, setSelectedStageForTopic] =
    useState<LearningStageLevel>('L1');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [linkedProjectInput, setLinkedProjectInput] = useState('');

  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicCode, setNewTopicCode] = useState('DAY 0');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicStage, setNewTopicStage] = useState<LearningStageLevel>('L1');
  const [newTopicAction, setNewTopicAction] = useState(
    'Active note-taking in Obsidian'
  );

  const openTopicModal = (topic: LearningTopic) => {
    setActiveTopic(topic);
    setSelectedStageForTopic(topic.stage);
    setEvidenceInput('');
    setNotesInput(topic.notes || '');
    setLinkedProjectInput(topic.linkedProjectId || '');
  };

  const handleReviewSubmit = (rating: 'Forgot' | 'Hard' | 'Good' | 'Easy') => {
    if (!activeTopic) return;
    onReviewTopic(
      activeTopic.id,
      rating,
      selectedStageForTopic,
      evidenceInput.trim() || undefined,
      notesInput.trim(),
      linkedProjectInput || undefined
    );
    setActiveTopic(null);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const stageInfo = state.learningStages.find((s) => s.level === newTopicStage);
    onAddLearningTopic({
      code: newTopicCode,
      topic: newTopicTitle.trim(),
      stage: newTopicStage,
      stageLabel: stageInfo?.name || 'Recall',
      intervalLabel: 'Today',
      protocolAction: newTopicAction.trim() || 'Blank paper reconstruction',
      nextReview: 'Today',
      retentionState: 'DUE_TODAY',
      evidence: [],
      notes: '',
    });
    setNewTopicTitle('');
    setShowAddTopicModal(false);
  };

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/75 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-5"
      id="learning-engine"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[12px] text-[#4edea3] font-bold">
            MODULE 03
          </span>
          <h2 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold">
            Learning &amp; Retention Engine
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddTopicModal(!showAddTopicModal)}
            className="px-2.5 py-1 rounded bg-[#1e2024] hover:bg-[#282a2e] border border-[#4edea3]/40 font-mono text-[11px] text-[#4edea3] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Retrieval Topic
          </button>
          <span className="hidden sm:inline font-mono text-[10px] text-[#4edea3] font-bold">
            ANTI-DECAY COGNITIVE PROTOCOL
          </span>
        </div>
      </div>

      {/* Add Topic Quick Inline Form */}
      {showAddTopicModal && (
        <form
          onSubmit={handleCreateTopic}
          className="p-4 rounded-xl bg-[#0c0e12] border border-[#4edea3]/40 grid grid-cols-1 sm:grid-cols-6 gap-2.5"
        >
          <select
            value={newTopicCode}
            onChange={(e) => setNewTopicCode(e.target.value)}
            className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#4edea3]"
          >
            <option value="DAY 0">DAY 0</option>
            <option value="DAY 1">DAY 1</option>
            <option value="DAY 3">DAY 3</option>
            <option value="DAY 7">DAY 7</option>
            <option value="DAY 30">DAY 30</option>
            <option value="DAY 90">DAY 90</option>
            <option value="6 MOS">6 MOS</option>
          </select>
          <input
            type="text"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            placeholder="Engineering topic or concept to encode..."
            className="sm:col-span-2 bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
          />
          <select
            value={newTopicStage}
            onChange={(e) => setNewTopicStage(e.target.value as LearningStageLevel)}
            className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#4cd7f6]"
          >
            {state.learningStages.map((s) => (
              <option key={s.level} value={s.level}>
                {s.level} — {s.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newTopicAction}
            onChange={(e) => setNewTopicAction(e.target.value)}
            placeholder="Verification method..."
            className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#bbcabf]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold cursor-pointer"
          >
            Schedule Topic
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 7 Levels of Applied Competence */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider font-bold">
              7 Levels of Applied Competence (Tap stage to inspect)
            </span>
            <span className="font-mono text-[10px] text-[#4edea3]">
              BLOOM-EXTENDED STACK
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {state.learningStages.map((stage) => {
              const isCurrent = state.currentLearningStage === stage.level;
              const isInspected = inspectedStage?.level === stage.level;
              const isHighTier =
                stage.level === 'L5' ||
                stage.level === 'L6' ||
                stage.level === 'L7';

              return (
                <button
                  key={stage.level}
                  onClick={() => setInspectedStage(stage)}
                  className={`w-full p-2.5 rounded text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#282a2e] border-2 border-[#4edea3] shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : isInspected
                      ? 'bg-[#282a2e] border border-[#4cd7f6]'
                      : isHighTier
                      ? 'bg-[#1e2024] border border-[#4edea3]/30 hover:border-[#4edea3]/60'
                      : 'bg-[#1e2024] border border-[#3c4a42]/30 hover:border-[#4cd7f6]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums shrink-0 ${
                        isCurrent
                          ? 'bg-[#4edea3] text-[#003824]'
                          : isHighTier
                          ? 'bg-[#4edea3]/20 text-[#4edea3]'
                          : 'bg-[#282a2e] text-[#bbcabf]'
                      }`}
                    >
                      {stage.level}
                    </span>
                    <span
                      className={`text-[14px] truncate ${
                        isCurrent
                          ? 'text-[#4edea3] font-bold'
                          : isHighTier
                          ? 'text-[#e2e2e8] font-semibold'
                          : 'text-[#e2e2e8]'
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] text-right shrink-0 ${
                      isCurrent
                        ? 'text-[#4edea3] font-bold'
                        : stage.level === 'L3' || stage.level === 'L4'
                        ? 'text-[#4cd7f6]'
                        : isHighTier
                        ? 'text-[#4edea3]'
                        : 'text-[#bbcabf]'
                    }`}
                  >
                    {stage.shortRule}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage Inspector Card */}
          {inspectedStage && (
            <div className="mt-1 p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#4edea3] font-bold">
                  {inspectedStage.level} // {inspectedStage.name.toUpperCase()}
                </span>
                {state.currentLearningStage !== inspectedStage.level ? (
                  <button
                    onClick={() => onSelectCurrentStage(inspectedStage.level)}
                    className="px-2 py-0.5 rounded bg-[#4edea3]/15 border border-[#4edea3]/40 font-mono text-[10px] text-[#4edea3] hover:bg-[#4edea3]/25 cursor-pointer"
                  >
                    Set as Active Focus Stage
                  </button>
                ) : (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3]">
                    ACTIVE TARGET STAGE
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#bbcabf]">
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

        {/* Right: Spaced Retrieval Schedule Protocol & Interactive Topics */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider font-bold">
              Spaced Retrieval Intervals (Tap topic to review &amp; grade)
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30">
              ZERO-FORGET POLICY
            </span>
          </div>

          <div className="space-y-2">
            {state.learningTopics.map((item) => {
              const isDue = item.retentionState === 'DUE_TODAY';
              const isReinforce = item.retentionState === 'REINFORCE';
              return (
                <button
                  key={item.id}
                  onClick={() => openTopicModal(item)}
                  className={`w-full p-2.5 rounded text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isDue
                      ? 'bg-[#1e2024] border border-[#4edea3]/60 hover:bg-[#282a2e]'
                      : 'bg-[#1e2024] border border-[#3c4a42]/30 hover:border-[#4cd7f6]/50 hover:bg-[#282a2e]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`font-mono text-[10px] font-bold w-14 shrink-0 tabular-nums ${
                        item.code === 'DAY 0' || item.code === 'DAY 1'
                          ? 'text-[#4edea3]'
                          : item.code === 'DAY 3' || item.code === 'DAY 7'
                          ? 'text-[#4cd7f6]'
                          : item.code === 'DAY 30' || item.code === 'DAY 90'
                          ? 'text-[#c0c1ff]'
                          : 'text-[#86948a]'
                      }`}
                    >
                      {item.code}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12px] sm:text-[13px] text-[#e2e2e8] font-medium truncate">
                        {item.topic}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[#bbcabf] mt-0.5">
                        <span className="text-[#4edea3]">{item.stage}</span>
                        <span>·</span>
                        <span>{item.protocolAction}</span>
                        <span>·</span>
                        <span>Next: {item.nextReview}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        isDue
                          ? 'bg-[#4edea3]/20 text-[#4edea3] font-bold'
                          : isReinforce
                          ? 'bg-[#c9a227]/20 text-[#c9a227]'
                          : 'bg-[#282a2e] text-[#bbcabf]'
                      }`}
                    >
                      {isDue ? 'REVIEW NOW' : item.retentionState}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Spaced Retrieval Review Modal */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl bg-[#1a1c20] border border-[#4edea3]/50 shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-[#3c4a42]/30 pb-3">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[#4edea3]">
                  <span>{activeTopic.code}</span>
                  <span>//</span>
                  <span>CURRENT STAGE: {activeTopic.stage}</span>
                  <span>//</span>
                  <span>REVIEWS: {activeTopic.reviewCount}</span>
                </div>
                <h3 className="text-[17px] font-bold text-[#e2e2e8] mt-1">
                  {activeTopic.topic}
                </h3>
              </div>
              <button
                onClick={() => setActiveTopic(null)}
                className="p-1.5 rounded bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Capability Stage Upgrade Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-[#bbcabf] uppercase">
                Capability Stage Progression (L1 → L7)
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {state.learningStages.map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setSelectedStageForTopic(s.level)}
                    className={`py-1.5 rounded font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                      selectedStageForTopic === s.level
                        ? 'bg-[#4edea3] text-[#003824] border-[#4edea3]'
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
              <label className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#4edea3]" />
                Verified Evidence &amp; Artifacts ({activeTopic.evidence.length})
              </label>
              {activeTopic.evidence.length > 0 ? (
                <ul className="space-y-1 font-mono text-[11px] text-[#e2e2e8] bg-[#0c0e12] p-2.5 rounded border border-[#3c4a42]/30">
                  {activeTopic.evidence.map((ev, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-[#86948a] italic">
                  No production artifacts attached yet.
                </div>
              )}
              <input
                type="text"
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Attach new evidence (e.g. GitHub commit, benchmark, whiteboard test)..."
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
              />
            </div>

            {/* Link to Milestone Project */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#4cd7f6]" /> Linked Milestone Project
                </label>
                <select
                  value={linkedProjectInput}
                  onChange={(e) => setLinkedProjectInput(e.target.value)}
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#e2e2e8]"
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
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#4edea3]" /> Last Reviewed
                </label>
                <div className="bg-[#0c0e12] border border-[#3c4a42]/30 rounded px-2.5 py-1.5 font-mono text-xs text-[#bbcabf]">
                  {activeTopic.lastReviewed} (Next: {activeTopic.nextReview})
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#bbcabf] uppercase">
                First-Principles Synthesis Notes
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded p-2.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                placeholder="Write key invariants or failure modes recalled..."
              />
            </div>

            {/* Spaced Retrieval Grading Buttons: Forgot / Hard / Good / Easy */}
            <div className="pt-2 border-t border-[#3c4a42]/30 flex flex-col gap-2">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
                Log Retrieval Result &amp; Compute Next Interval:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Forgot')}
                  className="py-2 px-3 rounded bg-[#93000a]/30 hover:bg-[#93000a]/50 border border-[#ffb4ab]/40 text-[#ffb4ab] font-mono text-xs font-bold cursor-pointer"
                >
                  Forgot (Reset Day 0)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Hard')}
                  className="py-2 px-3 rounded bg-[#c9a227]/20 hover:bg-[#c9a227]/30 border border-[#c9a227]/40 text-[#c9a227] font-mono text-xs font-bold cursor-pointer"
                >
                  Hard (Tomorrow)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Good')}
                  className="py-2 px-3 rounded bg-[#4cd7f6]/20 hover:bg-[#4cd7f6]/30 border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-xs font-bold cursor-pointer"
                >
                  Good (+7 Days)
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewSubmit('Easy')}
                  className="py-2 px-3 rounded bg-[#4edea3]/20 hover:bg-[#4edea3]/30 border border-[#4edea3]/50 text-[#4edea3] font-mono text-xs font-bold cursor-pointer"
                >
                  Easy (+30 Days)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
