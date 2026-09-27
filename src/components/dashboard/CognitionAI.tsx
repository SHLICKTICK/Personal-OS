import React, { useState } from 'react';
import {
  Ban,
  Rocket,
  Sparkles,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import {
  AIInsight,
  AILearningWorkflowStep,
  Decision,
  KnowledgeNote,
  MentalModel,
  POSState,
} from '../../models/types';
import { aiService, AIQuickActionType } from '../../services/aiService';

interface CognitionAIProps {
  state: POSState;
  onAddKnowledgeNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteKnowledgeNote: (id: string) => void;
  onAddDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteDecision: (id: string) => void;
  onToggleWorkflowStep: (id: string) => void;
}

export const CognitionAI: React.FC<CognitionAIProps> = ({
  state,
  onAddKnowledgeNote,
  onDeleteKnowledgeNote,
  onAddDecision,
  onDeleteDecision,
  onToggleWorkflowStep,
}) => {
  const [activeTab, setActiveTab] = useState<'guardrails' | 'knowledge' | 'decisions' | 'models' | 'ai-copilot'>('guardrails');
  
  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);

  // Quick form states
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Architecture' | 'Algorithms' | 'Distributed Systems' | 'Commercial' | 'Mental Models'>('Architecture');
  const [newNoteContent, setNewNoteContent] = useState('');

  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionContext, setNewDecisionContext] = useState('');
  const [newDecisionPath, setNewDecisionPath] = useState('');
  const [newDecisionOutcome, setNewDecisionOutcome] = useState('');

  const handleRunAiAction = async (action: AIQuickActionType) => {
    setAiLoading(true);
    try {
      const insight = await aiService.runDiagnostic(action, state, aiPrompt);
      setCurrentInsight(insight);
    } catch {
      // fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    onAddKnowledgeNote({
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      content: newNoteContent.trim(),
    });
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionTitle.trim() || !newDecisionPath.trim()) return;
    onAddDecision({
      title: newDecisionTitle.trim(),
      context: newDecisionContext.trim(),
      optionsConsidered: 'Direct implementation vs. delegated automation',
      chosenPath: newDecisionPath.trim(),
      mentalModelUsed: 'First Principles & Inversion',
      expectedOutcome: newDecisionOutcome.trim() || 'Accelerated compounding and high architectural clarity',
      status: 'ACTIVE',
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setNewDecisionTitle('');
    setNewDecisionContext('');
    setNewDecisionPath('');
    setNewDecisionOutcome('');
  };

  return (
    <section id="ai-guardrails" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3c4a42]/30 gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-bold border border-[#4edea3]/30">
            MOD_06
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#e2e2e8] uppercase font-mono flex items-center gap-2">
              COGNITION, AI GUARDRAILS & VAULT
            </h2>
            <p className="text-xs text-[#bbcabf] font-mono">
              Enforcing human cognitive sovereignty, disciplined AI leverage, and high-retention mental models.
            </p>
          </div>
        </div>

        {/* View Sub-Tabs */}
        <div className="flex items-center gap-1 bg-[#0c0e12] p-1 rounded border border-[#3c4a42]/30 overflow-x-auto">
          {[
            { id: 'guardrails', label: 'AI Guardrails' },
            { id: 'knowledge', label: 'Knowledge Vault' },
            { id: 'decisions', label: 'Decision Log' },
            { id: 'models', label: 'Mental Models' },
            { id: 'ai-copilot', label: 'Tactical Copilot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#4edea3] text-[#003822] font-bold shadow-sm'
                  : 'text-[#bbcabf] hover:text-[#e2e2e8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: AI Guardrails & Human-in-the-Loop */}
      {activeTab === 'guardrails' && (
        <div className="space-y-6">
          {/* Never / Always AI Directives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NEVER DELEGATE TO AI */}
            <div className="p-4 rounded-lg bg-[#201a1a]/60 border border-[#ffb4ab]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#ffb4ab]">
                <Ban className="w-4 h-4" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                  NEVER DELEGATE TO AI (HUMAN SOVEREIGNTY)
                </h3>
              </div>
              <ul className="space-y-2">
                {state.prohibitedAiRules.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-mono text-[#ffdad6]">
                    <span className="text-[#ffb4ab] font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ALWAYS USE AI FOR */}
            <div className="p-4 rounded-lg bg-[#14231a]/60 border border-[#4edea3]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#4edea3]">
                <Rocket className="w-4 h-4" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                  MAXIMUM AI LEVERAGE TARGETS (ACCELERATION)
                </h3>
              </div>
              <ul className="space-y-2">
                {state.mandatoryAiRules.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-mono text-[#d0fbe0]">
                    <span className="text-[#4edea3] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Interactive Learning Workflow Loop */}
          <div className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                  AI INTERACTIVE WORKFLOW // 5-STAGE COGNITIVE PIPELINE
                </h3>
                <p className="text-[11px] font-mono text-[#bbcabf]">
                  Interactive loop to prevent cognitive atrophy when interfacing with LLMs.
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
                5-STAGE PROTOCOL ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {state.aiLearningWorkflow.map((step: AILearningWorkflowStep) => (
                <div
                  key={step.id}
                  onClick={() => onToggleWorkflowStep(step.id)}
                  className="p-3 rounded border text-left cursor-pointer transition-all bg-[#111318] border-[#3c4a42]/30 hover:border-[#4edea3]/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-[#4edea3]">0{step.step}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                  </div>
                  <h4 className="font-mono text-xs font-bold text-[#e2e2e8] mb-1">{step.label}</h4>
                  <p className="font-mono text-[10px] text-[#4cd7f6] mb-1 font-semibold">{step.rule}</p>
                  <p className="font-mono text-[10px] text-[#bbcabf] line-clamp-3">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Knowledge Vault */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Add Knowledge Note Form */}
          <form onSubmit={handleCreateNote} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-3">
            <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#4edea3]" />
              ADD NEW REPOSITORIED KNOWLEDGE NOTE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Note Title / Concept..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
              <select
                value={newNoteCategory}
                onChange={(e) => setNewNoteCategory(e.target.value as any)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Distributed Systems">Distributed Systems</option>
                <option value="Commercial">Commercial</option>
                <option value="Mental Models">Mental Models</option>
              </select>
            </div>
            <textarea
              rows={3}
              placeholder="Core principles, mental schemas, syntactical laws, or architectural constraints..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none resize-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer transition-colors"
            >
              SAVE NOTE TO VAULT
            </button>
          </form>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.knowledgeNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#3c4a42]/30 text-[#4edea3]">
                      {note.category}
                    </span>
                    <button
                      onClick={() => onDeleteKnowledgeNote(note.id)}
                      className="text-[#bbcabf] hover:text-[#ffb4ab] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-mono text-sm font-bold text-[#e2e2e8] mt-2">{note.title}</h4>
                  <p className="font-mono text-xs text-[#bbcabf] mt-1 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Decision Log */}
      {activeTab === 'decisions' && (
        <div className="space-y-6">
          {/* Add Decision Form */}
          <form onSubmit={handleCreateDecision} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-3">
            <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#4edea3]" />
              LOG HIGH-STAKES ARCHITECTURAL / LIFE DECISION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Decision Vector / Title..."
                value={newDecisionTitle}
                onChange={(e) => setNewDecisionTitle(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Expected Outcome / Metric..."
                value={newDecisionOutcome}
                onChange={(e) => setNewDecisionOutcome(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <textarea
                rows={2}
                placeholder="Context & Tradeoffs Considered..."
                value={newDecisionContext}
                onChange={(e) => setNewDecisionContext(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none resize-none"
              />
              <textarea
                rows={2}
                placeholder="Final Verdict / Chosen Path..."
                value={newDecisionPath}
                onChange={(e) => setNewDecisionPath(e.target.value)}
                className="bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-1.5 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer transition-colors"
            >
              RATIFY DECISION IN AUDIT RECORD
            </button>
          </form>

          {/* Decisions List */}
          <div className="space-y-3">
            {state.decisions.map((dec) => (
              <div key={dec.id} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#4cd7f6] font-bold">[{dec.status}]</span>
                    <h4 className="font-mono text-sm font-bold text-[#e2e2e8]">{dec.title}</h4>
                  </div>
                  <button
                    onClick={() => onDeleteDecision(dec.id)}
                    className="text-[#bbcabf] hover:text-[#ffb4ab] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                  <div className="p-2 rounded bg-[#111318] border border-[#3c4a42]/20">
                    <span className="text-[10px] text-[#bbcabf] uppercase block mb-1">Context</span>
                    <p className="text-[#e2e2e8]">{dec.context}</p>
                  </div>
                  <div className="p-2 rounded bg-[#111318] border border-[#3c4a42]/20">
                    <span className="text-[10px] text-[#4edea3] uppercase block mb-1">Chosen Path</span>
                    <p className="text-[#d0fbe0]">{dec.chosenPath}</p>
                  </div>
                  <div className="p-2 rounded bg-[#111318] border border-[#3c4a42]/20">
                    <span className="text-[10px] text-[#4cd7f6] uppercase block mb-1">Expected Outcome</span>
                    <p className="text-[#e2e2e8]">{dec.expectedOutcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Mental Models */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.mentalModels.map((model: MentalModel) => (
            <div key={model.id} className="p-4 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#4edea3]">
                <Lightbulb className="w-4 h-4" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider">{model.name}</h4>
              </div>
              <p className="font-mono text-xs text-[#4cd7f6] font-semibold">{model.tagline}</p>
              <div className="p-2.5 rounded bg-[#111318] border border-[#3c4a42]/20">
                <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block mb-1 font-bold">
                  APPLIED DIRECTIVE:
                </span>
                <p className="font-mono text-[11px] text-[#e2e2e8]">{model.applicationRule}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Tactical Copilot */}
      {activeTab === 'ai-copilot' && (
        <div className="p-5 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4edea3]" />
              <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                TACTICAL HEURISTIC COGNITION ENGINE
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2 py-0.5 rounded border border-[#4edea3]/30">
              OFFLINE HEURISTIC & SYNTHESIS
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { type: 'ANALYZE_PROGRESS' as const, label: 'Audit Progress Velocity' },
              { type: 'WHAT_NEXT' as const, label: 'What is Next Priority?' },
              { type: 'FIND_BOTTLENECK' as const, label: 'Identify Current Bottleneck' },
              { type: 'REVIEW_LEARNING' as const, label: 'Audit Learning Retention' },
              { type: 'ANALYZE_PROJECTS' as const, label: 'Audit Project DoD Gates' },
              { type: 'SUMMARIZE_WEEK' as const, label: 'Generate Weekly Debrief' },
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleRunAiAction(btn.type)}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] border border-[#3c4a42]/40 text-[#4edea3] font-mono text-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Custom prompt input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Ask the executive terminal copilot (e.g. 'How should I allocate deep work tomorrow?')..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunAiAction('CUSTOM_QUERY')}
              className="flex-1 bg-[#111318] border border-[#3c4a42]/40 rounded px-3 py-2 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none"
            />
            <button
              onClick={() => handleRunAiAction('CUSTOM_QUERY')}
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-4 py-2 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              SYNTHESIZE
            </button>
          </div>

          {/* Result Output */}
          {aiLoading && (
            <div className="p-4 rounded bg-[#111318] border border-[#4edea3]/30 font-mono text-xs text-[#4edea3] animate-pulse">
              [ANALYZING POS STATE GRAPH & DIRECTIVES...]
            </div>
          )}

          {currentInsight && !aiLoading && (
            <div className="p-4 rounded-lg bg-[#111318] border border-[#4edea3]/30 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#4edea3] border-b border-[#3c4a42]/30 pb-2">
                <span className="font-bold uppercase tracking-wider">{currentInsight.title}</span>
                <span className="text-[10px] text-[#bbcabf]">{currentInsight.createdAt}</span>
              </div>
              <p className="text-[#e2e2e8] leading-relaxed whitespace-pre-wrap">{currentInsight.summary}</p>
              {currentInsight.directives && currentInsight.directives.length > 0 && (
                <div className="pt-2 border-t border-[#3c4a42]/20 space-y-1">
                  <span className="text-[10px] text-[#4cd7f6] uppercase tracking-wider block font-bold">
                    RECOMMENDED EXECUTION VECTORS:
                  </span>
                  {currentInsight.directives.map((rec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[#d0fbe0]">
                      <span className="text-[#4edea3]">▸</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
              {currentInsight.bottleneckIdentified && (
                <div className="p-2 rounded bg-[#201a1a] border border-[#ffb4ab]/30 text-[#ffdad6]">
                  <span className="text-[10px] text-[#ffb4ab] uppercase font-bold block">CRITICAL BOTTLENECK:</span>
                  <span>{currentInsight.bottleneckIdentified}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
