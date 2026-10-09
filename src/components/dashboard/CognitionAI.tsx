import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  FolderGit2,
  X,
  FileText,
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
  initialTab?: 'guardrails' | 'knowledge' | 'decisions' | 'models' | 'ai-copilot';
  onTabChange?: (tab: 'guardrails' | 'knowledge' | 'decisions' | 'models' | 'ai-copilot') => void;
  onAddKnowledgeNote: (note: Omit<KnowledgeNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteKnowledgeNote: (id: string) => void;
  onAddDecision: (decision: Omit<Decision, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteDecision: (id: string) => void;
  onToggleWorkflowStep: (id: string) => void;
  onAddGoal?: (goal: Omit<Goal, 'id'>) => void;
}

export const CognitionAI: React.FC<CognitionAIProps> = ({
  state,
  initialTab,
  onTabChange,
  onAddKnowledgeNote,
  onDeleteKnowledgeNote,
  onAddDecision,
  onDeleteDecision,
  onToggleWorkflowStep,
  onAddGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'guardrails' | 'knowledge' | 'decisions' | 'models' | 'ai-copilot'>(
    initialTab || 'guardrails'
  );

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSelect = (tab: typeof activeTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  
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
  const [newNoteLinkedProjectId, setNewNoteLinkedProjectId] = useState<string>('');
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteCategoryFilter, setNoteCategoryFilter] = useState<string>('ALL');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionContext, setNewDecisionContext] = useState('');
  const [newDecisionPath, setNewDecisionPath] = useState('');
  const [newDecisionOutcome, setNewDecisionOutcome] = useState('');

  const handleCopyNote = (note: KnowledgeNote) => {
    const text = `### ${note.title} [${note.category}]\n\n${note.content}`;
    navigator.clipboard?.writeText(text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
    showToast('NOTE COPIED TO CLIPBOARD');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    onAddKnowledgeNote({
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      content: newNoteContent.trim(),
      linkedProjectId: newNoteLinkedProjectId.trim() || undefined,
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteLinkedProjectId('');
    setIsAddNoteOpen(false);
    showToast('KNOWLEDGE NOTE PERMANENTLY INDEXED IN VAULT');
  };

  const noteCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: state.knowledgeNotes.length,
      Architecture: 0,
      Algorithms: 0,
      'Distributed Systems': 0,
      Commercial: 0,
      'Mental Models': 0,
    };
    state.knowledgeNotes.forEach((n) => {
      if (counts[n.category] !== undefined) {
        counts[n.category]++;
      }
    });
    return counts;
  }, [state.knowledgeNotes]);

  const filteredKnowledgeNotes = useMemo(() => {
    return state.knowledgeNotes.filter((note) => {
      if (noteCategoryFilter !== 'ALL' && note.category !== noteCategoryFilter) {
        return false;
      }
      if (noteSearchQuery.trim()) {
        const q = noteSearchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesCategory = note.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesCategory) return false;
      }
      return true;
    });
  }, [state.knowledgeNotes, noteCategoryFilter, noteSearchQuery]);

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
    <section
      id="ai-guardrails"
      className="p-5 sm:p-7 rounded-2xl bg-[#081414] border border-[#162b29] shadow-2xl flex flex-col gap-6 select-none animate-fadeIn relative overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#132626] gap-4 relative z-10">
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-[#00f5a0] tracking-widest uppercase block">
            COGNITION // SOVEREIGNTY &amp; VAULT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#e6f4f1] tracking-tight font-mono">
            Cognition, AI Guardrails &amp; Knowledge Vault
          </h1>
          <p className="text-xs sm:text-sm text-[#7a9490]">
            Enforce human cognitive sovereignty, disciplined AI leverage, and high-retention mental models.
          </p>
        </div>

        {/* View Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#050a0a] border border-[#162b29] overflow-x-auto shrink-0 font-mono text-xs">
          {[
            { id: 'guardrails', label: 'AI Guardrails' },
            { id: 'knowledge', label: `Knowledge (${state.knowledgeNotes.length})` },
            { id: 'decisions', label: `Decisions (${state.decisions.length})` },
            { id: 'models', label: `Mental Models (${state.mentalModels.length})` },
            { id: 'ai-copilot', label: 'Tactical Copilot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40 font-bold shadow-xs'
                  : 'text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: AI Guardrails & Human-in-the-Loop */}
      {activeTab === 'guardrails' && (
        <div className="space-y-6 relative z-10">
          {/* Never / Always AI Directives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NEVER DELEGATE TO AI */}
            <div className="p-4 rounded-xl bg-[#081212] border border-[#ff5c5c]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#ff5c5c]">
                <Ban className="w-4 h-4" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                  NEVER DELEGATE TO AI (HUMAN SOVEREIGNTY)
                </h3>
              </div>
              <ul className="space-y-2">
                {state.prohibitedAiRules.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-mono text-[#ffdad6]">
                    <span className="text-[#ff5c5c] font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ALWAYS USE AI FOR */}
            <div className="p-4 rounded-xl bg-[#081212] border border-[#00f5a0]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#00f5a0]">
                <Rocket className="w-4 h-4" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                  MAXIMUM AI LEVERAGE TARGETS (ACCELERATION)
                </h3>
              </div>
              <ul className="space-y-2">
                {state.mandatoryAiRules.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-mono text-[#d0fbe0]">
                    <span className="text-[#00f5a0] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Interactive Learning Workflow Loop */}
          <div className="p-5 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                  AI INTERACTIVE WORKFLOW // 5-STAGE COGNITIVE PIPELINE
                </h3>
                <p className="text-[11px] font-mono text-[#7a9490]">
                  Interactive loop to prevent cognitive atrophy when interfacing with LLMs.
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#00f5a0] uppercase tracking-wider font-bold">
                5-STAGE PROTOCOL ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {state.aiLearningWorkflow.map((step: AILearningWorkflowStep) => (
                <div
                  key={step.id}
                  onClick={() => onToggleWorkflowStep(step.id)}
                  className="p-3.5 rounded-xl border text-left cursor-pointer transition-all bg-[#081212] border-[#162b29] hover:border-[#00f5a0]/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-[#00f5a0] font-bold">0{step.step}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00f5a0]" />
                  </div>
                  <h4 className="font-mono text-xs font-bold text-[#e6f4f1] mb-1">{step.label}</h4>
                  <p className="font-mono text-[10px] text-[#38bdf8] mb-1 font-semibold">{step.rule}</p>
                  <p className="font-mono text-[10px] text-[#7a9490] line-clamp-3">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Knowledge Vault */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6 relative z-10">
          {/* Action & Filter Ribbon */}
          <div className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-[#55736f] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  placeholder="Search vault by concept, code, or keyword..."
                  className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg pl-8 pr-8 py-2 text-xs text-[#e6f4f1] placeholder:text-[#55736f] focus:border-[#00f5a0] focus:outline-none"
                />
                {noteSearchQuery && (
                  <button
                    onClick={() => setNoteSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#55736f] hover:text-[#e6f4f1] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Add Note Toggle Button */}
              <button
                type="button"
                onClick={() => setIsAddNoteOpen((prev) => !prev)}
                className="px-3.5 py-2 rounded-lg bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 text-[#00f5a0] border border-[#00f5a0]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                {isAddNoteOpen ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>CLOSE FORM</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD NOTE TO VAULT</span>
                  </>
                )}
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px]">
              {(
                [
                  { id: 'ALL', label: `All (${noteCategoryCounts.ALL})` },
                  { id: 'Architecture', label: `Architecture (${noteCategoryCounts.Architecture})` },
                  { id: 'Algorithms', label: `Algorithms (${noteCategoryCounts.Algorithms})` },
                  { id: 'Distributed Systems', label: `Distributed (${noteCategoryCounts['Distributed Systems']})` },
                  { id: 'Commercial', label: `Commercial (${noteCategoryCounts.Commercial})` },
                  { id: 'Mental Models', label: `Models (${noteCategoryCounts['Mental Models']})` },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNoteCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap font-bold ${
                    noteCategoryFilter === cat.id
                      ? 'bg-[#00f5a0] text-[#021810]'
                      : 'bg-[#050a0a] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Knowledge Note Collapsible Form */}
          {isAddNoteOpen && (
            <form onSubmit={handleCreateNote} className="p-5 rounded-xl bg-[#060e0e] border border-[#00f5a0]/40 space-y-3 font-mono text-xs shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between pb-1 border-b border-[#132626]">
                <h3 className="text-xs font-bold text-[#00f5a0] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-[#00f5a0]" />
                  ADD NEW REPOSITORIED KNOWLEDGE NOTE
                </h3>
                <span className="text-[10px] text-[#7a9490]">Feynman Synthesis Invariant</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Note Title / Concept..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none sm:col-span-1"
                />
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as any)}
                  className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#38bdf8] focus:border-[#00f5a0] focus:outline-none cursor-pointer"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Distributed Systems">Distributed Systems</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mental Models">Mental Models</option>
                </select>
                <select
                  value={newNoteLinkedProjectId}
                  onChange={(e) => setNewNoteLinkedProjectId(e.target.value)}
                  className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#a855f7] focus:border-[#00f5a0] focus:outline-none cursor-pointer"
                >
                  <option value="">No Project Link</option>
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      Link: {p.code} ({p.title.slice(0, 24)}...)
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows={4}
                placeholder="Core principles, mental schemas, syntactical laws, or architectural constraints..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none resize-none leading-relaxed font-mono"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#55736f]">Notes are permanently ingested into AI Copilot memory</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddNoteOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-black cursor-pointer transition-all hover:scale-105 shadow-[0_0_12px_rgba(0,245,160,0.25)]"
                  >
                    SAVE NOTE TO VAULT
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Notes Grid */}
          {filteredKnowledgeNotes.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#060e0e] border border-[#162b29] font-mono text-xs text-[#7a9490] space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#050a0a] border border-[#162b29] flex items-center justify-center text-[#55736f]">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-[#e6f4f1] font-bold text-sm">No knowledge notes found in vault</p>
              <p className="text-[11px] text-[#55736f] max-w-md mx-auto">
                {noteSearchQuery || noteCategoryFilter !== 'ALL'
                  ? 'No notes match your current search query or category filter.'
                  : 'The knowledge vault is currently empty. Record your first first-principles architectural lesson.'}
              </p>
              {(noteSearchQuery || noteCategoryFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setNoteSearchQuery('');
                    setNoteCategoryFilter('ALL');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 hover:bg-[#00f5a0]/25 cursor-pointer font-bold inline-block"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKnowledgeNotes.map((note) => {
                const linkedProject = note.linkedProjectId
                  ? state.projects.find((p) => p.id === note.linkedProjectId)
                  : null;

                const catBadgeClass =
                  note.category === 'Architecture'
                    ? 'bg-[#0c2028] text-[#38bdf8] border-[#38bdf8]/30'
                    : note.category === 'Algorithms'
                    ? 'bg-[#281a0c] text-[#f59e0b] border-[#f59e0b]/30'
                    : note.category === 'Distributed Systems'
                    ? 'bg-[#07251c] text-[#00f5a0] border-[#00f5a0]/30'
                    : note.category === 'Commercial'
                    ? 'bg-[#241228] text-[#e879f9] border-[#e879f9]/30'
                    : 'bg-[#181a28] text-[#818cf8] border-[#818cf8]/30';

                const isCopied = copiedNoteId === note.id;

                return (
                  <div
                    key={note.id}
                    className="p-4 sm:p-5 rounded-xl bg-[#060e0e] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all space-y-3 flex flex-col justify-between group shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md border ${catBadgeClass}`}
                          >
                            {note.category}
                          </span>
                          {linkedProject && (
                            <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-[#0e1d1c] text-[#00f5a0] border border-[#00f5a0]/30 flex items-center gap-1">
                              <FolderGit2 className="w-2.5 h-2.5" />
                              <span>{linkedProject.code}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyNote(note)}
                            className="p-1 rounded text-[#55736f] hover:text-[#00f5a0] hover:bg-[#0e201e] cursor-pointer transition-colors"
                            title="Copy note content"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-[#00f5a0]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteKnowledgeNote(note.id)}
                            className="p-1 rounded text-[#55736f] hover:text-[#ef4444] hover:bg-[#200e12] cursor-pointer transition-colors"
                            title="Delete note from vault"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-mono text-sm font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors leading-snug">
                        {note.title}
                      </h4>

                      <div className="bg-[#030707] p-3 rounded-lg border border-[#122222]">
                        <p className="font-mono text-xs text-[#a1b8b4] whitespace-pre-wrap leading-relaxed select-text">
                          {note.content}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#122222] flex items-center justify-between font-mono text-[10px] text-[#55736f]">
                      <span>
                        Indexed: {note.createdAt ? note.createdAt.split('T')[0] : '2026-09-22'}
                      </span>
                      <span>{note.content.length} chars</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Decision Log */}
      {activeTab === 'decisions' && (
        <div className="space-y-6 relative z-10">
          {/* Add Decision Form */}
          <form onSubmit={handleCreateDecision} className="p-5 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-[#e6f4f1] uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#00f5a0]" />
              LOG HIGH-STAKES ARCHITECTURAL / STRATEGIC DECISION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Decision Vector / Title..."
                value={newDecisionTitle}
                onChange={(e) => setNewDecisionTitle(e.target.value)}
                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Expected Outcome / Metric..."
                value={newDecisionOutcome}
                onChange={(e) => setNewDecisionOutcome(e.target.value)}
                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <textarea
                rows={2}
                placeholder="Context & Tradeoffs Considered..."
                value={newDecisionContext}
                onChange={(e) => setNewDecisionContext(e.target.value)}
                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none resize-none leading-relaxed"
              />
              <textarea
                rows={2}
                placeholder="Final Verdict / Chosen Path..."
                value={newDecisionPath}
                onChange={(e) => setNewDecisionPath(e.target.value)}
                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-2 text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-black cursor-pointer transition-all hover:scale-105 shadow-[0_0_12px_rgba(0,245,160,0.25)]"
              >
                RATIFY DECISION IN AUDIT RECORD
              </button>
            </div>
          </form>

          {/* Decisions List */}
          <div className="space-y-3 font-mono">
            {state.decisions.map((dec) => (
              <div key={dec.id} className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#38bdf8] font-bold px-1.5 py-0.5 rounded bg-[#122222] border border-[#38bdf8]/30">
                      {dec.status}
                    </span>
                    <h4 className="text-sm font-bold text-[#e6f4f1]">{dec.title}</h4>
                  </div>
                  <button
                    onClick={() => onDeleteDecision(dec.id)}
                    className="text-[#55736f] hover:text-[#ff5c5c] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#050a0a] border border-[#162b29]">
                    <span className="text-[10px] text-[#7a9490] uppercase block mb-1">Context</span>
                    <p className="text-[#e6f4f1] text-[11px] leading-relaxed">{dec.context}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#050a0a] border border-[#162b29]">
                    <span className="text-[10px] text-[#00f5a0] uppercase block mb-1 font-bold">Chosen Path</span>
                    <p className="text-[#d0fbe0] text-[11px] leading-relaxed">{dec.chosenPath}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#050a0a] border border-[#162b29]">
                    <span className="text-[10px] text-[#38bdf8] uppercase block mb-1">Expected Outcome</span>
                    <p className="text-[#e6f4f1] text-[11px] leading-relaxed">{dec.expectedOutcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Mental Models */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 font-mono">
          {state.mentalModels.map((model: MentalModel) => (
            <div key={model.id} className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] hover:border-[#00f5a0]/40 transition-colors space-y-3">
              <div className="flex items-center gap-2 text-[#00f5a0]">
                <Lightbulb className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">{model.name}</h4>
              </div>
              <p className="text-xs text-[#38bdf8] font-semibold">{model.tagline}</p>
              <div className="p-3 rounded-lg bg-[#050a0a] border border-[#162b29]">
                <span className="text-[10px] text-[#7a9490] uppercase tracking-wider block mb-1 font-bold">
                  APPLIED DIRECTIVE:
                </span>
                <p className="text-[11px] text-[#e6f4f1] leading-relaxed">{model.applicationRule}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Tactical Copilot */}
      {activeTab === 'ai-copilot' && (
        <div className="p-5 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-4 relative z-10 font-mono">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#00f5a0] text-[#021810] font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#132626] gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00f5a0]" />
              <div>
                <h3 className="text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                  STRATEGIC COGNITION &amp; OMNISCIENT AI FORCE MULTIPLIER
                </h3>
                <span className="text-[10px] text-[#7a9490] flex items-center gap-1 mt-0.5">
                  <Layers className="w-3 h-3 text-[#38bdf8]" />
                  FULL 9-MODULE TELEMETRY INGESTED (ENGINEERING, CAPITAL, LEARNING, FLIGHT PLAN)
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {recentInsights.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-[#081212] hover:bg-[#122222] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <History className="w-3 h-3 text-[#00f5a0]" />
                  <span>HISTORY ({recentInsights.length})</span>
                </button>
              )}

              {aiStatus.configured ? (
                <span className="text-[10px] text-[#00f5a0] flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                  GEMINI 3.8 FLASH [ONLINE]
                </span>
              ) : (
                <span className="text-[10px] text-[#38bdf8] flex items-center gap-1.5 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                  LOCAL HEURISTIC ENGINE [ACTIVE]
                </span>
              )}
            </div>
          </div>

          {/* Collapsible History Drawer */}
          {showHistory && recentInsights.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] space-y-2">
              <span className="text-[10px] text-[#7a9490] uppercase tracking-wider block font-bold">
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
                    className={`p-2.5 rounded-lg text-left border cursor-pointer transition-colors ${
                      currentInsight?.id === insight.id
                        ? 'bg-[#091814] border-[#00f5a0]/50 text-[#e6f4f1]'
                        : 'bg-[#050a0a] hover:bg-[#0c1818] border-[#162b29] text-[#7a9490]'
                    }`}
                  >
                    <div className="text-[11px] font-bold truncate text-[#00f5a0]">{insight.title}</div>
                    <div className="text-[10px] text-[#55736f] truncate">{insight.actionType}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Triggers Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#7a9490] uppercase tracking-wider block font-bold">
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
                  className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all disabled:opacity-50 border ${
                    btn.highlight
                      ? 'bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 text-[#00f5a0] border-[#00f5a0]/40 font-bold shadow-xs'
                      : 'bg-[#081212] hover:bg-[#0c1818] border-[#162b29] text-[#e6f4f1]'
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
                className="flex-1 bg-[#050a0a] border border-[#162b29] rounded-xl px-3.5 py-2 text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none placeholder:text-[#55736f]"
              />
              <button
                onClick={() => handleRunAiAction('CUSTOM_QUERY')}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-4 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] text-xs font-black cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,245,160,0.25)]"
              >
                <Send className="w-3.5 h-3.5" />
                SYNTHESIZE
              </button>
            </div>
          </div>

          {/* Result Loading State */}
          {aiLoading && (
            <div className="p-4 rounded-xl bg-[#081212] border border-[#00f5a0]/30 text-xs text-[#00f5a0] animate-pulse space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-ping" />
                <span>[INGESTING 100% APPLICATION GRAPH: 9 MODULES, DoD GATES, RUNWAY, SPACED RETRIEVAL...]</span>
              </div>
              <p className="text-[11px] text-[#7a9490]">Correlating engineering velocity with commercial runway and cognitive retention...</p>
            </div>
          )}

          {/* Result Output Card */}
          {currentInsight && !aiLoading && (
            <div className="p-4 rounded-xl bg-[#081212] border border-[#00f5a0]/30 space-y-4 text-xs shadow-md">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[#00f5a0] border-b border-[#132626] pb-2.5 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold uppercase tracking-wider text-sm text-[#e6f4f1]">{currentInsight.title}</span>
                  {currentInsight.source === 'gemini-live' ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                      GEMINI LIVE [{currentInsight.model || 'gemini'}]
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 font-semibold">
                      HEURISTIC SYNTHESIS
                    </span>
                  )}
                  <span className="text-[9px] text-[#7a9490]">
                    ALL 9 MODS INGESTED
                  </span>
                </div>
                <span className="text-[10px] text-[#7a9490]">{currentInsight.createdAt}</span>
              </div>

              {/* Inquiry Prompt Display */}
              {currentInsight.actionType && currentInsight.actionType.toLowerCase().includes('query') && (
                <div className="p-2.5 rounded-lg bg-[#050a0a] border border-[#162b29] flex items-start gap-2 text-xs">
                  <span className="text-[#00f5a0] font-bold shrink-0">OPERATOR PROMPT:</span>
                  <span className="text-[#e6f4f1] italic">
                    "{currentInsight.actionType.replace(/^Query:\s*"?/, '').replace(/"?$/, '')}"
                  </span>
                </div>
              )}

              {/* Summary */}
              <p className="text-[#e6f4f1] leading-relaxed whitespace-pre-wrap text-xs sm:text-[13px]">{currentInsight.summary}</p>

              {/* Cross-Module Correlation Callout */}
              {currentInsight.crossModuleCorrelation && (
                <div className="p-3 rounded-lg bg-[#051419] border border-[#38bdf8]/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#38bdf8] text-[10px] uppercase font-bold tracking-wider">
                    <Layers className="w-3.5 h-3.5" />
                    <span>CROSS-MODULE DEPENDENCY CORRELATION:</span>
                  </div>
                  <p className="text-[#d8f4ff] text-[11px] leading-relaxed">{currentInsight.crossModuleCorrelation}</p>
                </div>
              )}

              {/* Directives with One-Click Execution */}
              {currentInsight.directives && currentInsight.directives.length > 0 && (
                <div className="pt-2 border-t border-[#132626] space-y-2">
                  <span className="text-[10px] text-[#00f5a0] uppercase tracking-wider block font-bold">
                    RECOMMENDED EXECUTION VECTORS:
                  </span>
                  <div className="space-y-1.5">
                    {currentInsight.directives.map((rec: string, i: number) => {
                      const isAdded = addedDirectives[rec];
                      return (
                        <div
                          key={i}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#050a0a] border border-[#162b29] hover:border-[#00f5a0]/40 transition-colors"
                        >
                          <div className="flex items-start gap-2 text-[#d0fbe0] flex-1">
                            <span className="text-[#00f5a0] font-bold">▸</span>
                            <span className="text-xs leading-snug">{rec}</span>
                          </div>

                          {onAddGoal && (
                            <button
                              onClick={() => handlePromoteDirective(rec)}
                              disabled={isAdded}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 self-end sm:self-center ${
                                isAdded
                                  ? 'bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40 font-bold'
                                  : 'bg-[#081212] hover:bg-[#0c1818] text-[#00f5a0] border border-[#162b29]'
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
                <div className="p-3 rounded-lg bg-[#140808] border border-[#ff5c5c]/30 text-[#ffdad6] space-y-1">
                  <span className="text-[10px] text-[#ff5c5c] uppercase font-bold tracking-wider block">
                    CRITICAL SYSTEM BOTTLENECK (THEORY OF CONSTRAINTS):
                  </span>
                  <span className="text-xs font-semibold">{currentInsight.bottleneckIdentified}</span>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-2 border-t border-[#132626] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="px-2.5 py-1.5 rounded-lg bg-[#050a0a] hover:bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#00f5a0]" />
                    COPY MARKDOWN
                  </button>

                  <button
                    onClick={handleSaveToVault}
                    className="px-2.5 py-1.5 rounded-lg bg-[#050a0a] hover:bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />
                    SAVE TO VAULT
                  </button>

                  <button
                    onClick={handleLogAsDecision}
                    className="px-2.5 py-1.5 rounded-lg bg-[#050a0a] hover:bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#f59e0b]" />
                    LOG AS DECISION
                  </button>
                </div>

                <span className="text-[10px] text-[#55736f]">
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
