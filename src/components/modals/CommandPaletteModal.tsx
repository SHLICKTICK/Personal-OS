import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Terminal,
  X,
  Download,
  RotateCcw,
  Upload,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
  Scale,
  FolderGit2,
  ChevronRight,
  Target,
  Hash,
  Layers,
} from 'lucide-react';
import { NavigationSection, POSState } from '../../models/types';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: NavigationSection, subTab?: string) => void;
  onResetToDefaults: () => void;
  onExportState: () => void;
  onImportState: (imported: POSState) => void;
  onTriggerAI: (prompt: string) => void;
  state: POSState;
  onReviewTopic?: (topicId: string) => void;
}

type PaletteEntityFilter = 'ALL' | 'COMMANDS' | 'VAULT' | 'TOPICS' | 'DECISIONS' | 'PROJECTS';

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  snippet?: string;
  category: 'Command' | 'Knowledge' | 'Topic' | 'Decision' | 'Project';
  badge: string;
  badgeColorClass: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  onResetToDefaults,
  onExportState,
  onImportState,
  onTriggerAI,
  state,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PaletteEntityFilter>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on open & reset selection
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveFilter('ALL');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Base system & navigation commands
  const systemCommands = useMemo<PaletteItem[]>(() => {
    return [
      {
        id: 'cmd-north-star',
        title: '01 // North Star & 4-Vector Daily Directives',
        subtitle: 'Daily focus vectors, streaks, signoff logs, and non-negotiables',
        category: 'Command',
        badge: 'MODULE 01',
        badgeColorClass: 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/30',
        icon: <Terminal className="w-3.5 h-3.5 text-[#00f5a0]" />,
        action: () => {
          onSelectSection('north-star');
          onClose();
        },
      },
      {
        id: 'cmd-capability-stack',
        title: '02 // Capability Stack Matrix & Mastery',
        subtitle: 'Tiered architectural skills, domain mastery, and capability allocation',
        category: 'Command',
        badge: 'MODULE 02',
        badgeColorClass: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
        icon: <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />,
        action: () => {
          onSelectSection('capability-stack');
          onClose();
        },
      },
      {
        id: 'cmd-learning-engine',
        title: '03 // Active Learning Engine & Spaced Retrieval',
        subtitle: 'SuperMemo SM-2 intervals, Bloom L1-L7 ladder, Socratic exams',
        category: 'Command',
        badge: 'MODULE 03',
        badgeColorClass: 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/30',
        icon: <Brain className="w-3.5 h-3.5 text-[#00f5a0]" />,
        action: () => {
          onSelectSection('learning-engine');
          onClose();
        },
      },
      {
        id: 'cmd-milestone-projects',
        title: '04 // Milestone Projects Pipeline & 14-Gate DoD',
        subtitle: '6-Phase SDLC step tracking, atomic gates, and time velocity',
        category: 'Command',
        badge: 'MODULE 04',
        badgeColorClass: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30',
        icon: <FolderGit2 className="w-3.5 h-3.5 text-[#a855f7]" />,
        action: () => {
          onSelectSection('milestone-projects');
          onClose();
        },
      },
      {
        id: 'cmd-financial-os',
        title: '05 // Financial Engine & Commercial Pipeline',
        subtitle: 'Cash runway, 7-step experiment loop, B2B sales leads CRM',
        category: 'Command',
        badge: 'MODULE 05',
        badgeColorClass: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
        icon: <Target className="w-3.5 h-3.5 text-[#f59e0b]" />,
        action: () => {
          onSelectSection('financial-os');
          onClose();
        },
      },
      {
        id: 'cmd-ai-guardrails',
        title: '06 // AI Guardrails, Knowledge Vault & Decision Log',
        subtitle: 'Persistent architectural knowledge, ADRs, and mental models',
        category: 'Command',
        badge: 'MODULE 06',
        badgeColorClass: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
        icon: <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />,
        action: () => {
          onSelectSection('ai-guardrails');
          onClose();
        },
      },
      {
        id: 'cmd-work-scoreboards',
        title: '07 // Work Scoreboards, 90-15-90 Timer & Execution',
        subtitle: 'Focus cadence, velocity scoring, daily retro reviews',
        category: 'Command',
        badge: 'MODULE 07',
        badgeColorClass: 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/30',
        icon: <Terminal className="w-3.5 h-3.5 text-[#00f5a0]" />,
        action: () => {
          onSelectSection('work-scoreboards');
          onClose();
        },
      },
      {
        id: 'cmd-horizon-flight-plan',
        title: '08 // 10-Year Horizon Flight Plan (2026–2036)',
        subtitle: 'Multi-year compounding targets and capital velocity roadmap',
        category: 'Command',
        badge: 'MODULE 08',
        badgeColorClass: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
        icon: <Target className="w-3.5 h-3.5 text-[#38bdf8]" />,
        action: () => {
          onSelectSection('horizon-flight-plan');
          onClose();
        },
      },
      {
        id: 'cmd-principle-70',
        title: '09 // 70th Principle & Executive Sign-Off',
        subtitle: 'Master operating creed, governance rules, and executive seal',
        category: 'Command',
        badge: 'MODULE 09',
        badgeColorClass: 'bg-[#e6f4f1]/15 text-[#e6f4f1] border-[#e6f4f1]/30',
        icon: <Terminal className="w-3.5 h-3.5 text-[#e6f4f1]" />,
        action: () => {
          onSelectSection('principle-70');
          onClose();
        },
      },
      {
        id: 'cmd-ai-velocity',
        title: 'AI Copilot // Audit Engineering Velocity',
        subtitle: 'Diagnose bottlenecks across active milestones and focus time',
        category: 'Command',
        badge: 'AI COPILOT',
        badgeColorClass: 'bg-[#00f5a0]/20 text-[#00f5a0] border-[#00f5a0]/40',
        icon: <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" />,
        action: () => {
          onTriggerAI('Audit Engineering Velocity across active milestone projects and daily cadence');
          onClose();
        },
      },
      {
        id: 'cmd-ai-next-action',
        title: 'AI Copilot // Highest Leverage Deterministic Action',
        subtitle: 'Calculate top critical constraint across engineering and learning',
        category: 'Command',
        badge: 'AI COPILOT',
        badgeColorClass: 'bg-[#00f5a0]/20 text-[#00f5a0] border-[#00f5a0]/40',
        icon: <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" />,
        action: () => {
          onTriggerAI('What is the highest leverage deterministic next action across the POS graph?');
          onClose();
        },
      },
      {
        id: 'cmd-export-state',
        title: 'System // Export State JSON Backup',
        subtitle: 'Download complete POS state archive for cold storage or migration',
        category: 'Command',
        badge: 'SYSTEM',
        badgeColorClass: 'bg-[#7a9490]/15 text-[#a1b8b4] border-[#7a9490]/30',
        icon: <Download className="w-3.5 h-3.5 text-[#a1b8b4]" />,
        action: () => {
          onExportState();
          onClose();
        },
      },
      {
        id: 'cmd-reset-state',
        title: 'System // Reset POS State to Factory Seed',
        subtitle: 'Restore default configuration and initial architecture blueprints',
        category: 'Command',
        badge: 'SYSTEM',
        badgeColorClass: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30',
        icon: <RotateCcw className="w-3.5 h-3.5 text-[#ef4444]" />,
        action: () => {
          onResetToDefaults();
          onClose();
        },
      },
    ];
  }, [onSelectSection, onTriggerAI, onExportState, onResetToDefaults, onClose]);

  // Federated Entity Search across state
  const federatedItems = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();

    // 1. Knowledge Vault Notes
    const vaultItems: PaletteItem[] = (state.knowledgeNotes || []).map((note) => {
      const catColor =
        note.category === 'Architecture'
          ? 'bg-[#0c2028] text-[#38bdf8] border-[#38bdf8]/30'
          : note.category === 'Algorithms'
          ? 'bg-[#281a0c] text-[#f59e0b] border-[#f59e0b]/30'
          : note.category === 'Distributed Systems'
          ? 'bg-[#07251c] text-[#00f5a0] border-[#00f5a0]/30'
          : note.category === 'Commercial'
          ? 'bg-[#241228] text-[#e879f9] border-[#e879f9]/30'
          : 'bg-[#181a28] text-[#818cf8] border-[#818cf8]/30';

      return {
        id: `vault-${note.id}`,
        title: note.title,
        subtitle: note.category,
        snippet: note.content.slice(0, 140) + (note.content.length > 140 ? '...' : ''),
        category: 'Knowledge',
        badge: `VAULT · ${note.category.toUpperCase()}`,
        badgeColorClass: catColor,
        icon: <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />,
        action: () => {
          onSelectSection('ai-guardrails', 'knowledge');
          onClose();
        },
      };
    });

    // 2. Learning Topics
    const topicItems: PaletteItem[] = (state.learningTopics || []).map((topic) => {
      const isDue = topic.retentionState === 'DUE_TODAY' || topic.nextReview === 'Due Today';
      const isAtRisk = topic.retentionState === 'REINFORCE' || topic.nextReview === 'At Risk';
      const stageBadge = topic.stage || 'L1';

      const badgeColor = isDue
        ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40'
        : isAtRisk
        ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40'
        : 'bg-[#00f5a0]/15 text-[#00f5a0] border-[#00f5a0]/40';

      return {
        id: `topic-${topic.id}`,
        title: topic.topic,
        subtitle: `${topic.category} · ${topic.subtitleTags || 'Recall & Synthesis'}`,
        snippet: topic.protocolAction || topic.notes || 'Active spaced retrieval practice',
        category: 'Topic',
        badge: `TOPIC · ${stageBadge} [${isDue ? 'DUE' : isAtRisk ? 'RISK' : 'ACTIVE'}]`,
        badgeColorClass: badgeColor,
        icon: <Brain className="w-3.5 h-3.5 text-[#00f5a0]" />,
        action: () => {
          onSelectSection('learning-engine');
          onClose();
        },
      };
    });

    // 3. Architectural Decisions (ADRs)
    const decisionItems: PaletteItem[] = (state.decisions || []).map((dec) => {
      return {
        id: `dec-${dec.id}`,
        title: dec.title,
        subtitle: `Model: ${dec.mentalModelUsed || 'First Principles'}`,
        snippet: dec.chosenPath || dec.context,
        category: 'Decision',
        badge: `ADR · ${dec.status}`,
        badgeColorClass: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
        icon: <Scale className="w-3.5 h-3.5 text-[#f59e0b]" />,
        action: () => {
          onSelectSection('ai-guardrails', 'decisions');
          onClose();
        },
      };
    });

    // 4. Milestone Projects
    const projectItems: PaletteItem[] = (state.projects || []).map((p) => {
      return {
        id: `prj-${p.id}`,
        title: `${p.code}: ${p.title}`,
        subtitle: `Milestone: ${p.currentMilestone} · Status: ${p.status}`,
        snippet: `Tech: ${p.technologies.slice(0, 4).join(', ')} | Next: ${p.nextAction}`,
        category: 'Project',
        badge: `PROJECT · ${p.progress}%`,
        badgeColorClass: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30',
        icon: <FolderGit2 className="w-3.5 h-3.5 text-[#a855f7]" />,
        action: () => {
          onSelectSection('milestone-projects');
          onClose();
        },
      };
    });

    // Filter by query if entered
    if (!q) {
      // Default initial view: system commands + top recent knowledge assets
      return [
        ...systemCommands,
        ...vaultItems.slice(0, 4),
        ...topicItems.filter((t) => t.badge.includes('DUE')).slice(0, 4),
        ...projectItems.slice(0, 2),
      ];
    }

    const filterItem = (item: PaletteItem) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = (item.subtitle || '').toLowerCase().includes(q);
      const matchSnippet = (item.snippet || '').toLowerCase().includes(q);
      const matchBadge = item.badge.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchSnippet || matchBadge;
    };

    const matchedCmds = systemCommands.filter(filterItem);
    const matchedVault = vaultItems.filter(filterItem);
    const matchedTopics = topicItems.filter(filterItem);
    const matchedDecisions = decisionItems.filter(filterItem);
    const matchedProjects = projectItems.filter(filterItem);

    return [
      ...matchedVault,
      ...matchedTopics,
      ...matchedDecisions,
      ...matchedProjects,
      ...matchedCmds,
    ];
  }, [query, systemCommands, state]);

  // Apply active entity tab filter
  const filteredItems = useMemo(() => {
    if (activeFilter === 'ALL') return federatedItems;
    if (activeFilter === 'COMMANDS') return federatedItems.filter((i) => i.category === 'Command');
    if (activeFilter === 'VAULT') return federatedItems.filter((i) => i.category === 'Knowledge');
    if (activeFilter === 'TOPICS') return federatedItems.filter((i) => i.category === 'Topic');
    if (activeFilter === 'DECISIONS') return federatedItems.filter((i) => i.category === 'Decision');
    if (activeFilter === 'PROJECTS') return federatedItems.filter((i) => i.category === 'Project');
    return federatedItems;
  }, [federatedItems, activeFilter]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      ALL: federatedItems.length,
      COMMANDS: federatedItems.filter((i) => i.category === 'Command').length,
      VAULT: federatedItems.filter((i) => i.category === 'Knowledge').length,
      TOPICS: federatedItems.filter((i) => i.category === 'Topic').length,
      DECISIONS: federatedItems.filter((i) => i.category === 'Decision').length,
      PROJECTS: federatedItems.filter((i) => i.category === 'Project').length,
    };
  }, [federatedItems]);

  // Reset selectedIndex on list change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const selectedEl = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.version && json.operatorName) {
          onImportState(json);
          onClose();
        }
      } catch (err) {
        console.error('Invalid JSON file', err);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-[#081414] border border-[#162b29] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="p-3.5 border-b border-[#162b29] flex items-center gap-3 bg-[#060e0e]">
          <Search className="w-4 h-4 text-[#00f5a0] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge vault, active topics, ADRs, projects, or commands..."
            className="flex-1 bg-transparent font-mono text-xs text-[#e6f4f1] placeholder:text-[#7a9490]/70 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#7a9490] hover:text-[#e6f4f1] p-1 rounded hover:bg-[#0e201e] cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#7a9490] hover:text-[#e6f4f1] p-1 rounded hover:bg-[#0e201e] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills Ribbon */}
        <div className="px-3.5 py-2 border-b border-[#132626] bg-[#050a0a] flex items-center gap-1.5 overflow-x-auto font-mono text-[11px] shrink-0">
          {(
            [
              { id: 'ALL', label: `All (${counts.ALL})` },
              { id: 'VAULT', label: `Vault (${counts.VAULT})` },
              { id: 'TOPICS', label: `Topics (${counts.TOPICS})` },
              { id: 'DECISIONS', label: `ADRs (${counts.DECISIONS})` },
              { id: 'PROJECTS', label: `Projects (${counts.PROJECTS})` },
              { id: 'COMMANDS', label: `Commands (${counts.COMMANDS})` },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap font-bold ${
                activeFilter === filter.id
                  ? 'bg-[#00f5a0] text-[#021810]'
                  : 'bg-[#071010] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-1.5 focus:outline-none min-h-[160px]"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-[#7a9490] space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#0e201e] border border-[#162b29] flex items-center justify-center text-[#55736f]">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-[#e6f4f1] font-bold">No knowledge vectors matching "{query}"</p>
              <p className="text-[11px] text-[#55736f]">
                Try searching for concepts like "Webhook", "Postgres", "Bloom", "PRJ", or clear the query.
              </p>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="mt-2 px-3 py-1 rounded-md bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30 hover:bg-[#00f5a0]/25 cursor-pointer font-bold"
                >
                  Clear Query
                </button>
              )}
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-start justify-between p-3 rounded-xl text-left transition-all cursor-pointer group border ${
                    isSelected
                      ? 'bg-[#0e201e] border-[#00f5a0]/50 shadow-sm'
                      : 'bg-[#060e0e]/80 hover:bg-[#091514] border-[#162b29]/70'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-[#00f5a0]/20 border-[#00f5a0]/50 text-[#00f5a0]'
                          : 'bg-[#050a0a] border-[#162b29] text-[#7a9490]'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md border tracking-wider uppercase ${item.badgeColorClass}`}
                        >
                          {item.badge}
                        </span>
                        {item.subtitle && (
                          <span className="font-mono text-[10px] text-[#7a9490] truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`font-mono text-xs font-bold leading-snug truncate transition-colors ${
                          isSelected ? 'text-[#00f5a0]' : 'text-[#e6f4f1]'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {item.snippet && (
                        <p className="font-mono text-[11px] text-[#7a9490] line-clamp-2 leading-relaxed">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-all ${
                        isSelected
                          ? 'text-[#00f5a0] translate-x-1 opacity-100'
                          : 'text-[#55736f] opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info ribbon */}
        <div className="p-3 bg-[#050a0a] border-t border-[#162b29] flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#7a9490] shrink-0">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 hover:text-[#e6f4f1] cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-[#00f5a0]" />
              <span>Import State JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            <span className="hidden sm:inline text-[#55736f]">|</span>
            <span className="hidden sm:inline text-[#55736f]">
              {counts.ALL} indexed vectors in POS memory
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-[#091414] border border-[#162b29]">↑↓</span>
            <span>Navigate</span>
            <span className="px-1.5 py-0.5 rounded bg-[#091414] border border-[#162b29]">↵</span>
            <span>Select</span>
            <span className="px-1.5 py-0.5 rounded bg-[#091414] border border-[#162b29]">ESC</span>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
