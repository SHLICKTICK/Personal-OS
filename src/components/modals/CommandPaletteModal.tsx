import React, { useState } from 'react';
import {
  Search,
  Terminal,
  X,
  Download,
  RotateCcw,
  Upload,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { NavigationSection, POSState } from '../../models/types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: NavigationSection) => void;
  onResetToDefaults: () => void;
  onExportState: () => void;
  onImportState: (imported: POSState) => void;
  onTriggerAI: (prompt: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  onResetToDefaults,
  onExportState,
  onImportState,
  onTriggerAI,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const commands = [
    { id: 'north-star', label: 'Jump to 01 // North Star & Horizon Creed', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('north-star') },
    { id: 'capability-stack', label: 'Jump to 02 // Capability Stack Matrix', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('capability-stack') },
    { id: 'learning-engine', label: 'Jump to 03 // Active Learning Engine', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('learning-engine') },
    { id: 'milestone-projects', label: 'Jump to 04 // Milestone Projects Pipeline', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('milestone-projects') },
    { id: 'financial-os', label: 'Jump to 05 // Financial Engine & Cash Flow', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('financial-os') },
    { id: 'ai-guardrails', label: 'Jump to 06 // AI Guardrails & Knowledge Vault', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('ai-guardrails') },
    { id: 'work-scoreboards', label: 'Jump to 07 // Work Scoreboards & 90-15-90 Timer', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('work-scoreboards') },
    { id: 'horizon-flight-plan', label: 'Jump to 08 // 10-Year Horizon Flight Plan', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('horizon-flight-plan') },
    { id: 'principle-70', label: 'Jump to 09 // 70th Principle & Sign-Off', group: 'Navigation', icon: <Terminal className="w-3.5 h-3.5" />, action: () => onSelectSection('principle-70') },
    { id: 'ai-velocity', label: 'AI // Audit Engineering Velocity', group: 'AI Copilot', icon: <Sparkles className="w-3.5 h-3.5" />, action: () => onTriggerAI('Audit Engineering Velocity') },
    { id: 'ai-next', label: 'AI // What is the highest leverage next step?', group: 'AI Copilot', icon: <Sparkles className="w-3.5 h-3.5" />, action: () => onTriggerAI('What is the highest leverage next step?') },
    { id: 'export', label: 'Export State JSON Backup', group: 'System', icon: <Download className="w-3.5 h-3.5" />, action: () => onExportState() },
    { id: 'reset', label: 'Reset Entire POS State to Factory Seed', group: 'System', icon: <RotateCcw className="w-3.5 h-3.5" />, action: () => onResetToDefaults() },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) || c.group.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: typeof commands[0]) => {
    cmd.action();
    onClose();
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#1a1c20] border border-[#3c4a42]/40 rounded-xl shadow-2xl overflow-hidden space-y-0">
        {/* Search header */}
        <div className="p-3 border-b border-[#3c4a42]/30 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#4edea3]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump vector..."
            className="flex-1 bg-transparent font-mono text-xs text-[#e2e2e8] placeholder:text-[#bbcabf]/50 focus:outline-none"
          />
          <button onClick={onClose} className="text-[#bbcabf] hover:text-[#e2e2e8]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center font-mono text-xs text-[#bbcabf]">
              No directive commands matching "{query}"
            </div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#282a2e] text-left group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 font-mono text-xs text-[#e2e2e8] group-hover:text-[#4edea3]">
                  <span className="text-[#4edea3]">{cmd.icon}</span>
                  <span>{cmd.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#bbcabf] uppercase bg-[#111318] px-1.5 py-0.5 rounded">
                    {cmd.group}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#bbcabf] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Import file option footer */}
        <div className="p-3 bg-[#111318] border-t border-[#3c4a42]/20 flex items-center justify-between font-mono text-[11px] text-[#bbcabf]">
          <label className="flex items-center gap-1.5 hover:text-[#e2e2e8] cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>Import State JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <span className="text-[10px]">ESC to close • ↑↓ to navigate</span>
        </div>
      </div>
    </div>
  );
};
