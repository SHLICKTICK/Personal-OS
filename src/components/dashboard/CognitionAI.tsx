import React, { useState, useEffect } from 'react';
import {
  Ban,
  Rocket,
  Sparkles,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Lightbulb,
  Zap,
  Check,
  Copy,
  BookOpen,
  Scale,
  Layers,
  ArrowRight,
  ShieldCheck,
  History,
} from 'lucide-react';
import {
  AIInsight,
  AILearningWorkflowStep,
  Decision,
  Goal,
  KnowledgeNote,
  MentalModel,
  POSState,
} from '../../models/types';
import { aiService, AIQuickActionType, AIStatusResponse } from '../../services/aiService';

interface CognitionAIProps {
  state: POSState;
  onAddKnowledgeNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteKnowledgeNote: (id: string) => void;
  onAddDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteDecision: (id: string) => void;
  onToggleWorkflowStep: (id: string) => void;
  onAddGoal?: (goal: Omit<Goal, 'id'>) => void;
}

export const CognitionAI: React.FC<CognitionAIProps> = ({
  state,
  onAddKnowledgeNote,
  onDeleteKnowledgeNote,
  onAddDecision,
  onDeleteDecision,
  onToggleWorkflowStep,
  onAddGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'guardrails' | 'knowledge' | 'decisions' | 'models' | 'ai-copilot'>('guardrails');
  
  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse>({
    configured: false,
    model: 'gemini-3.8-flash',
    provider: 'google-genai',
    tier: 'free-tier',
  });
  const [addedDirectives, setAddedDirectives] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentInsights, setRecentInsights] = useState<AIInsight[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    aiService.checkStatus().then((status) => {
      setAiStatus(status);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleRunAiAction = async (action: AIQuickActionType) => {
    setAiLoading(true);
    try {
      const insight = await aiService.runDiagnostic(action, state, aiPrompt);
      setCurrentInsight(insight);
      setRecentInsights((prev) => [insight, ...prev.filter((i) => i.id !== insight.id)].slice(0, 6));
    } catch {
      // fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handlePromoteDirective = (directiveText: string) => {
    if (!onAddGoal) return;
    const cleanText = directiveText.replace(/^[0-9]+[\.\)]\s*/, '').replace(/^[▸•\-]\s*/, '').trim();
    const nowIso = new Date().toISOString();
    onAddGoal({
      title: cleanText,
      category: 'Engineering',
      horizon: 'Today',
      targetMetric: '100% execution',
      progress: 0,
      status: 'ACTIVE',
      impactText: 'Tactical Copilot Vector',
      sourceType: 'CUSTOM',
      createdAt: nowIso,
      updatedAt: nowIso,
    });
    setAddedDirectives((prev) => ({ ...prev, [directiveText]: true }));
    showToast("DIRECTIVE PROMOTED TO TODAY'S FLIGHT PLAN");
  };

  const handleCopyMarkdown = () => {
    if (!currentInsight) return;
    const md = `### ${currentInsight.title}
*Synthesized: ${currentInsight.createdAt} | Source: ${currentInsight.source || 'Gemini 3.8 Flash'}*

**Executive Diagnosis:**
${currentInsight.summary}

${currentInsight.crossModuleCorrelation ? `**Cross-Module Dependency:**\n${currentInsight.crossModuleCorrelation}\n\n` : ''}**Recommended Execution Vectors:**
${currentInsight.directives.map((d) => `- ${d}`).join('\n')}

**Critical Bottleneck:**
${currentInsight.bottleneckIdentified}
`;
    navigator.clipboard?.writeText(md);
    showToast('ANALYSIS COPIED TO CLIPBOARD (MARKDOWN)');
  };

  const handleSaveToVault = () => {
    if (!currentInsight) return;
    onAddKnowledgeNote({
      title: currentInsight.title,
      category: 'Architecture',
      content: `[EXECUTIVE COPILOT ANALYSIS // ${currentInsight.actionType}]\n${currentInsight.summary}\n\n${currentInsight.crossModuleCorrelation ? `CROSS-MODULE DEPENDENCY:\n${currentInsight.crossModuleCorrelation}\n\n` : ''}DIRECTIVES:\n${currentInsight.directives.join('\n')}\n\nBOTTLENECK:\n${currentInsight.bottleneckIdentified}`,
    });
    showToast('INSIGHT PERMANENTLY SAVED TO KNOWLEDGE VAULT');
  };

  const handleLogAsDecision = () => {
    if (!currentInsight) return;
    onAddDecision({
      title: currentInsight.title,
      context: currentInsight.summary,
      optionsConsidered: currentInsight.crossModuleCorrelation || 'Immediate execution on active constraint vs. delayed backlog',
      chosenPath: currentInsight.directives[0] || 'Execute primary directive vector',
      mentalModelUsed: 'Theory of Constraints & First Principles',
      expectedOutcome: `Eliminate primary bottleneck: ${currentInsight.bottleneckIdentified}`,
      status: 'ACTIVE',
      reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    showToast('DECISION RECORDED IN STRATEGIC DECISION LOG');
  };

  // Quick form states
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'Architecture' | 'Algorithms' | 'Distributed Systems' | 'Commercial' | 'Mental Models'>('Architecture');
  const [newNoteContent, setNewNoteContent] = useState('');

  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionContext, setNewDecisionContext] = useState('');
  const [newDecisionPath, setNewDecisionPath] = useState('');
  const [newDecisionOutcome, setNewDecisionOutcome] = useState('');

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
        <div className="p-5 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/30 space-y-4 relative">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-3 right-5 z-20 px-3 py-1.5 rounded bg-[#4edea3] text-[#003822] font-mono text-xs font-bold shadow-lg flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3c4a42]/20 gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4edea3]" />
              <div>
                <h3 className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                  STRATEGIC COGNITION & OMNISCIENT AI FORCE MULTIPLIER
                </h3>
                <span className="text-[10px] text-[#4cd7f6] font-mono flex items-center gap-1 mt-0.5">
                  <Layers className="w-3 h-3" />
                  FULL 9-MODULE TELEMETRY INGESTED (ENGINEERING, CAPITAL, LEARNING, FLIGHT PLAN)
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {recentInsights.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-[#111318] hover:bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/30 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <History className="w-3 h-3 text-[#4edea3]" />
                  <span>HISTORY ({recentInsights.length})</span>
                </button>
              )}

              {aiStatus.configured ? (
                <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-2.5 py-1 rounded border border-[#4edea3]/30 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                  GEMINI 3.8 FLASH [ONLINE // FREE TIER]
                </span>
              ) : (
                <span className="font-mono text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 px-2.5 py-1 rounded border border-[#4cd7f6]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
                  LOCAL HEURISTIC ENGINE [OFFLINE // FREE]
                </span>
              )}
            </div>
          </div>

          {/* Collapsible History Drawer */}
          {showHistory && recentInsights.length > 0 && (
            <div className="p-3 rounded bg-[#111318] border border-[#3c4a42]/40 space-y-2">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider block font-bold">
                RECENT SYSTEM DIAGNOSTICS ARCHIVE:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentInsights.map((insight) => (
                  <button
                    key={insight.id}
                    onClick={() => {
                      setCurrentInsight(insight);
                      setShowHistory(false);
                    }}
                    className={`p-2 rounded text-left border cursor-pointer transition-colors ${
                      currentInsight?.id === insight.id
                        ? 'bg-[#1a2e22] border-[#4edea3]/50 text-[#d0fbe0]'
                        : 'bg-[#1a1c20] hover:bg-[#202428] border-[#3c4a42]/30 text-[#e2e2e8]'
                    }`}
                  >
                    <div className="font-mono text-[11px] font-bold truncate text-[#4edea3]">{insight.title}</div>
                    <div className="font-mono text-[10px] text-[#bbcabf] truncate">{insight.actionType}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Triggers Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#bbcabf] uppercase tracking-wider block">
              RAPID CROSS-MODULE DIAGNOSTIC SUITE:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'SYSTEM_AUDIT' as const, label: '9-Module Alignment Scan', highlight: true },
                { type: 'WHAT_NEXT' as const, label: 'What is Next Priority?' },
                { type: 'FIND_BOTTLENECK' as const, label: 'Cross-Module Bottlenecks' },
                { type: 'PRE_FLIGHT' as const, label: '06:00 Pre-Flight Allocation' },
                { type: 'ANALYZE_PROGRESS' as const, label: 'Progress Velocity' },
                { type: 'REVIEW_LEARNING' as const, label: 'Learning Retention & DoD' },
                { type: 'FINANCIAL_STRESS' as const, label: 'Runway & Retainer Test' },
                { type: 'SUMMARIZE_WEEK' as const, label: 'Weekly Compounding Debrief' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  onClick={() => handleRunAiAction(btn.type)}
                  disabled={aiLoading}
                  className={`px-3 py-1.5 rounded font-mono text-xs cursor-pointer transition-colors disabled:opacity-50 border ${
                    btn.highlight
                      ? 'bg-[#4edea3]/15 hover:bg-[#4edea3]/25 text-[#4edea3] border-[#4edea3]/40 font-bold'
                      : 'bg-[#111318] hover:bg-[#282a2e] border-[#3c4a42]/40 text-[#d0fbe0]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom prompt input */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask anything with full context of your 9 modules (e.g. 'How do my open Project 01 tasks threaten my Stage 2 Retainer?')..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAiAction('CUSTOM_QUERY')}
                className="flex-1 bg-[#111318] border border-[#3c4a42]/40 rounded px-3.5 py-2 font-mono text-xs text-[#e2e2e8] focus:border-[#4edea3] focus:outline-none placeholder:text-[#bbcabf]/40"
              />
              <button
                onClick={() => handleRunAiAction('CUSTOM_QUERY')}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-4 py-2 rounded bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003822] font-mono text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                SYNTHESIZE
              </button>
            </div>
          </div>

          {/* Result Loading State */}
          {aiLoading && (
            <div className="p-4 rounded bg-[#111318] border border-[#4edea3]/30 font-mono text-xs text-[#4edea3] animate-pulse space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-ping" />
                <span>[INGESTING 100% APPLICATION GRAPH: 9 MODULES, DoD GATES, RUNWAY, SPACED RETRIEVAL...]</span>
              </div>
              <p className="text-[11px] text-[#bbcabf]">Correlating engineering velocity with commercial runway and cognitive retention...</p>
            </div>
          )}

          {/* Result Output Card */}
          {currentInsight && !aiLoading && (
            <div className="p-4 rounded-lg bg-[#111318] border border-[#4edea3]/30 space-y-4 font-mono text-xs shadow-md">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[#4edea3] border-b border-[#3c4a42]/30 pb-2.5 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold uppercase tracking-wider text-sm">{currentInsight.title}</span>
                  {currentInsight.source === 'gemini-live' ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                      GEMINI LIVE [{currentInsight.model || 'gemini'}]
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30">
                      HEURISTIC SYNTHESIS
                    </span>
                  )}
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#3c4a42]/30 text-[#bbcabf] border border-[#3c4a42]/40">
                    ALL 9 MODS INGESTED
                  </span>
                </div>
                <span className="text-[10px] text-[#bbcabf] font-mono">{currentInsight.createdAt}</span>
              </div>

              {/* Inquiry Prompt Display */}
              {currentInsight.actionType && currentInsight.actionType.toLowerCase().includes('query') && (
                <div className="p-2.5 rounded bg-[#161a20] border border-[#3c4a42]/40 flex items-start gap-2 text-xs">
                  <span className="text-[#4edea3] font-bold shrink-0">OPERATOR PROMPT:</span>
                  <span className="text-[#e2e2e8] italic">
                    "{currentInsight.actionType.replace(/^Query:\s*"?/, '').replace(/"?$/, '')}"
                  </span>
                </div>
              )}

              {/* Summary */}
              <p className="text-[#e2e2e8] leading-relaxed whitespace-pre-wrap text-xs sm:text-[13px]">{currentInsight.summary}</p>

              {/* Cross-Module Correlation Callout */}
              {currentInsight.crossModuleCorrelation && (
                <div className="p-3 rounded bg-[#0d1e28] border border-[#4cd7f6]/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#4cd7f6] text-[10px] uppercase font-bold tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>CROSS-MODULE DEPENDENCY CORRELATION:</span>
                  </div>
                  <p className="text-[#d8f4ff] text-[11px] leading-relaxed">{currentInsight.crossModuleCorrelation}</p>
                </div>
              )}

              {/* Directives with One-Click Execution */}
              {currentInsight.directives && currentInsight.directives.length > 0 && (
                <div className="pt-2 border-t border-[#3c4a42]/20 space-y-2">
                  <span className="text-[10px] text-[#4edea3] uppercase tracking-wider block font-bold">
                    RECOMMENDED EXECUTION VECTORS:
                  </span>
                  <div className="space-y-1.5">
                    {currentInsight.directives.map((rec: string, i: number) => {
                      const isAdded = addedDirectives[rec];
                      return (
                        <div
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-[#1a1c20] border border-[#3c4a42]/30 hover:border-[#4edea3]/40 transition-colors"
                        >
                          <div className="flex items-start gap-2 text-[#d0fbe0] flex-1">
                            <span className="text-[#4edea3] font-bold">▸</span>
                            <span className="text-xs leading-snug">{rec}</span>
                          </div>

                          {onAddGoal && (
                            <button
                              onClick={() => handlePromoteDirective(rec)}
                              disabled={isAdded}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 self-end sm:self-center ${
                                isAdded
                                  ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40 font-bold'
                                  : 'bg-[#111318] hover:bg-[#282a2e] text-[#4edea3] border border-[#3c4a42]/50'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  ADDED TO FLIGHT PLAN
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  + PROMOTE TO DIRECTIVE
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Critical Bottleneck */}
              {currentInsight.bottleneckIdentified && (
                <div className="p-3 rounded bg-[#201a1a] border border-[#ffb4ab]/30 text-[#ffdad6] space-y-1">
                  <span className="text-[10px] text-[#ffb4ab] uppercase font-bold tracking-wider block">
                    CRITICAL SYSTEM BOTTLENECK (THEORY OF CONSTRAINTS):
                  </span>
                  <span className="text-xs font-semibold">{currentInsight.bottleneckIdentified}</span>
                </div>
              )}

              {/* Action Bar (Export to Vault / Decision Log / Clipboard) */}
              <div className="pt-2 border-t border-[#3c4a42]/30 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="px-2.5 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] border border-[#3c4a42]/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#4edea3]" />
                    COPY MARKDOWN
                  </button>

                  <button
                    onClick={handleSaveToVault}
                    className="px-2.5 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] border border-[#3c4a42]/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    SAVE TO VAULT
                  </button>

                  <button
                    onClick={handleLogAsDecision}
                    className="px-2.5 py-1.5 rounded bg-[#111318] hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] border border-[#3c4a42]/40 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#ffd700]" />
                    LOG AS DECISION
                  </button>
                </div>

                <span className="text-[10px] text-[#bbcabf]/60 font-mono">
                  Module 06 // Sovereignty Guardrails Active
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
