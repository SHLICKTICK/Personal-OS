import React, { useState } from 'react';
import { X, Zap, CheckCircle2 } from 'lucide-react';
import {
  BusinessLead,
  Decision,
  Goal,
  KnowledgeNote,
  LearningTopic,
  Project,
  Review,
  Transaction,
} from '../../models/types';

type CreateItemType =
  | 'goal'
  | 'project'
  | 'topic'
  | 'note'
  | 'decision'
  | 'lead'
  | 'transaction'
  | 'review';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddProject: (proj: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTopic: (topic: Omit<LearningTopic, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount' | 'lastReviewed'>) => void;
  onAddNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddDecision: (dec: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddLead: (lead: Omit<BusinessLead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onAddReview: (rev: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
  onAddProject,
  onAddTopic,
  onAddNote,
  onAddDecision,
  onAddLead,
  onAddTransaction,
  onAddReview,
}) => {
  const [selectedType, setSelectedType] = useState<CreateItemType>('goal');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [extraVal, setExtraVal] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    switch (selectedType) {
      case 'goal':
        onAddGoal({
          title: title.trim(),
          category: 'Engineering',
          horizon: 'Q4 2026',
          progress: 0,
          targetMetric: detail.trim() || 'Active',
          status: 'ACTIVE',
        });
        break;
      case 'project':
        onAddProject({
          code: `P-${Date.now().toString().slice(-3)}`,
          title: title.trim(),
          objective: detail.trim() || 'High-agency executive project',
          status: 'IN PROGRESS',
          phaseTag: 'ACTIVE',
          spanText: 'Q1-Q4',
          progress: 10,
          progressLabel: 'Initiated',
          currentMilestone: 'Architecture Blueprint',
          nextAction: 'Define schema and unit tests',
          technologies: extraVal ? extraVal.split(',').map((t) => t.trim()) : ['TypeScript'],
          skills: ['Architecture'],
          notes: detail.trim(),
          milestones: [],
          tasks: [],
          evidence: [],
          dodPassedIds: [],
        });
        break;
      case 'topic':
        onAddTopic({
          code: `SK-${Date.now().toString().slice(-3)}`,
          topic: title.trim(),
          importance: 'P1',
          status: 'IN_PROGRESS',
          category: 'General',
          stage: 'L1',
          stageLabel: 'L1: Vocabulary & Schema',
          intervalLabel: '1 Day',
          protocolAction: 'Spaced flashcard review',
          nextReview: 'Tomorrow',
          retentionState: 'DUE_TODAY',
          evidence: [],
          notes: detail.trim(),
        });
        break;
      case 'note':
        onAddNote({
          title: title.trim(),
          category: 'Architecture',
          content: detail.trim() || 'Repository entry',
        });
        break;
      case 'decision':
        onAddDecision({
          title: title.trim(),
          context: detail.trim() || 'Architectural decision point',
          optionsConsidered: 'Direct implementation vs. delegated automation',
          chosenPath: extraVal.trim() || 'Ratified architecture',
          mentalModelUsed: 'First Principles',
          expectedOutcome: 'High velocity and zero technical debt',
          status: 'ACTIVE',
          reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        break;
      case 'lead':
        onAddLead({
          name: title.trim(),
          organization: detail.trim() || 'Independent Partner',
          bottleneck: 'Systems Scalability',
          stage: 'PROSPECT',
          estimatedValueRand: parseFloat(extraVal) || 15000,
          nextAction: 'Send diagnostic briefing',
          notes: detail.trim(),
        });
        break;
      case 'transaction':
        onAddTransaction({
          description: title.trim(),
          amountRand: parseFloat(extraVal) || 1000,
          type: 'INCOME',
          category: 'Consulting',
          date: new Date().toISOString().split('T')[0],
        });
        break;
      case 'review':
        onAddReview({
          cadence: 'DAILY',
          date: new Date().toISOString().split('T')[0],
          whatWasBuilt: title.trim(),
          whatWasLearned: detail.trim() || 'Core insights recorded',
          whatFailed: 'None',
          nextDayDirective: extraVal.trim() || 'Execute morning 90m block',
          deepWorkMinutesLogged: 180,
        });
        break;
    }

    setStatusMsg('Direct record created successfully.');
    setTimeout(() => {
      setStatusMsg('');
      setTitle('');
      setDetail('');
      setExtraVal('');
      onClose();
    }, 500);
  };

  const types: { id: CreateItemType; label: string }[] = [
    { id: 'goal', label: 'Goal' },
    { id: 'project', label: 'Project' },
    { id: 'topic', label: 'Skill Topic' },
    { id: 'note', label: 'Vault Note' },
    { id: 'decision', label: 'Decision' },
    { id: 'lead', label: 'Client Lead' },
    { id: 'transaction', label: 'Finance Entry' },
    { id: 'review', label: 'Cadence Review' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#081414] border border-[#162b29] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#162b29]">
          <div className="flex items-center gap-2 text-[#00f5a0]">
            <Zap className="w-4 h-4" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[#e6f4f1]">
              QUICK DIRECTIVE CREATE // ⌘N
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#7a9490] hover:text-[#e6f4f1] p-1.5 rounded-lg hover:bg-[#0e201e] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                selectedType === t.id
                  ? 'bg-[#00f5a0] text-[#00281b] font-bold shadow-sm shadow-[#00f5a0]/20'
                  : 'bg-[#0b1a19] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-mono text-[10px] text-[#7a9490] uppercase mb-1">
              Title / Primary Identifier
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architect High-Throughput Event Broker"
              className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 font-mono text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[#7a9490] uppercase mb-1">
              Description / Context / Target
            </label>
            <textarea
              rows={2}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Details or metrics..."
              className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 font-mono text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[#7a9490] uppercase mb-1">
              Auxiliary Parameters (Tags, Stack, or Values)
            </label>
            <input
              type="text"
              value={extraVal}
              onChange={(e) => setExtraVal(e.target.value)}
              placeholder="e.g. TypeScript, Kafka, Docker or R50000"
              className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 font-mono text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
            />
          </div>

          {statusMsg && (
            <div className="flex items-center gap-2 font-mono text-xs text-[#00f5a0] bg-[#00f5a0]/10 p-2.5 rounded-lg border border-[#00f5a0]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0e201e] hover:bg-[#162b29] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] font-mono text-xs font-bold cursor-pointer transition-all shadow-lg shadow-[#00f5a0]/15"
            >
              CREATE DIRECTIVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
