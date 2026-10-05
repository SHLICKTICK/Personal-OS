import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Smartphone,
  Monitor,
  Command,
  Sparkles,
  Sunrise,
} from 'lucide-react';
import { NavigationSection } from '../../models/types';

interface ExecutiveHeaderProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeSection?: NavigationSection;
  onSelectSection?: (section: NavigationSection) => void;
  onOpenAuditLog?: () => void;
  onDeployProtocol?: () => void;
  onOpenQuickCreate: () => void;
  onOpenCommandPalette: () => void;
  onOpenOnboarding?: () => void;
  onOpenMorningKickoff?: () => void;
  onToggleMobileMenu: () => void;
  androidPreviewMode: boolean;
  onToggleAndroidPreview: () => void;
  activeDirectivesCount?: number;
  totalDirectivesCount?: number;
  version?: string;
  operatorName?: string;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  onSelectSection,
  onOpenQuickCreate,
  onOpenCommandPalette,
  onOpenOnboarding,
  onOpenMorningKickoff,
  onToggleMobileMenu,
  androidPreviewMode,
  onToggleAndroidPreview,
  version = 'v4.8',
  operatorName = 'OP',
}) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-14 px-4 lg:px-6 flex items-center justify-between z-30 bg-[#111318]/90 backdrop-blur-xl border-b border-[#3c4a42]/30">
      {/* Left: Mobile Drawer Toggle + Terminal Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-md bg-[#1a1c20] border border-[#3c4a42]/40 text-[#4edea3] hover:bg-[#282a2e] cursor-pointer transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectSection?.('north-star')}
          className="flex items-center gap-2 text-left focus:outline-none cursor-pointer group"
          title="Return to 01 // North Star"
        >
          <span className="w-2 h-2 rounded-full bg-[#4edea3] group-hover:scale-125 transition-transform" />
          <span className="font-mono text-xs tracking-wider text-[#e2e2e8] uppercase font-bold group-hover:text-[#4edea3] transition-colors whitespace-nowrap">
            PERSONAL OS
          </span>
          <span className="font-mono text-[10px] text-[#bbcabf]/70 tracking-tight hidden sm:inline">
            // {version}
          </span>
        </button>
      </div>

      {/* Center: Interactive Unified Command / Search Trigger */}
      <div className="flex-1 max-w-md mx-3 sm:mx-6">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1a1c20]/80 hover:bg-[#1a1c20] border border-[#3c4a42]/40 hover:border-[#4edea3]/50 text-[#bbcabf] hover:text-[#e2e2e8] transition-all cursor-pointer group shadow-sm"
          title="Open Command Palette & Directives Search (⌘K)"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#bbcabf] group-hover:text-[#4edea3] transition-colors shrink-0" />
            <span className="font-mono text-[11px] truncate text-[#bbcabf]/80 group-hover:text-[#e2e2e8]">
              Search directives, skills, notes...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#111318] border border-[#3c4a42]/40 font-mono text-[10px] text-[#4edea3] shrink-0 font-medium">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Right: Essential Terminal Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Directive Create */}
        <button
          onClick={onOpenQuickCreate}
          className="px-2.5 py-1.5 rounded-lg bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          title="Quick Create Directive (⌘N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Directive</span>
          <kbd className="hidden md:inline font-mono text-[9px] text-[#4edea3]/80 px-1 py-0.2 rounded bg-[#111318]/60">
            ⌘N
          </kbd>
        </button>

        {/* Morning Kickoff Standup */}
        {onOpenMorningKickoff && (
          <button
            onClick={onOpenMorningKickoff}
            className="px-2.5 py-1.5 rounded-lg bg-[#ffb4ab]/15 hover:bg-[#ffb4ab]/25 border border-[#ffb4ab]/40 text-[#ffb4ab] font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            title="Launch Morning Kickoff Standup (Activate Today's Flight Plan)"
          >
            <Sunrise className="w-3.5 h-3.5 text-[#ffb4ab]" />
            <span className="hidden sm:inline">Day Kickoff</span>
          </button>
        )}

        {/* Setup Flow & Tour */}
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="px-2.5 py-1.5 rounded-lg bg-[#1a1c20] hover:bg-[#282a2e] border border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#4edea3] font-mono text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            title="Open Executive POS Setup Flow & Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
            <span className="hidden sm:inline">Setup Flow</span>
          </button>
        )}

        {/* Viewport Dimension Toggle (Mobile/Desktop Preview) */}
        <button
          onClick={onToggleAndroidPreview}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
            androidPreviewMode
              ? 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/40'
              : 'bg-[#1a1c20] hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] border-[#3c4a42]/40'
          }`}
          title={
            androidPreviewMode
              ? 'Exit Mobile Viewport Preview'
              : 'Preview Mobile Viewport Layout'
          }
          aria-label="Toggle mobile preview mode"
        >
          {androidPreviewMode ? (
            <Monitor className="w-3.5 h-3.5" />
          ) : (
            <Smartphone className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Operator Badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1a1c20] border border-[#3c4a42]/40 font-mono text-[10px] text-[#e2e2e8] select-none"
          title={`Active Operator: ${operatorName}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="font-bold text-[#4edea3]">{operatorName.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
};
