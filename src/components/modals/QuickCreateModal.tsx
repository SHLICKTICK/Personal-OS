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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1a1c20] border border-[#3c4a42]/40 rounded-xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/30">
          <div className="flex items-center gap-2 text-[#4edea3]">
            <Zap className="w-4 h-4" />
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
              QUICK DIRECTIVE CREATE // ⌘N
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#bbcabf] hover:text-[#e2e2e8] p-1 rounded cursor-pointer"
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
              className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                selectedType === t.id
                  ? 'bg-[#4edea3] text-[#003822] font-bold'
                  : 'bg-[#111318] text-[#bbcabf] hover:text-[#e2e2e8] border border-[#3c4a42]/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-mono text-[10px] text-[#bbcabf] uppercase mb-1">
              Title / Primary Identifier
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architect High-Throughput Event Broker"
              className="w-full bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[#bbcabf] uppercase mb-1">
              Description / Context / Target
            </label>
            <textarea
              rows={2}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Details or metrics..."
              className="w-full bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] text-[#bbcabf] uppercase mb-1">
              Auxiliary Parameters (Tags, Stack, or Values)
            </label>
            <input
              type="text"
              value={extraVal}
              onChange={(e) => setExtraVal(e.target.value)}
              placeholder="e.g. TypeScript, Kafka, Docker or R50000"
              className="w-full bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
            />
          </div>

          {statusMsg && (
            <div className="flex items-center gap-2 font-mono text-xs text-[#4edea3] bg-[#4edea3]/10 p-2 rounded border border-[#4edea3]/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] text-[#bbcabf] font-mono text-xs cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer transition-colors"
            >
              CREATE DIRECTIVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
