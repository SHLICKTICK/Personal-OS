import React from 'react';
import {
  Search,
  History,
  Send,
  Bell,
  Terminal,
  Maximize2,
  Menu,
  Smartphone,
  Monitor,
  Plus,
} from 'lucide-react';
import { NavigationSection } from '../../models/types';

interface ExecutiveHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  onOpenAuditLog: () => void;
  onDeployProtocol: () => void;
  onOpenQuickCreate: () => void;
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
  androidPreviewMode: boolean;
  onToggleAndroidPreview: () => void;
  activeDirectivesCount: number;
  totalDirectivesCount: number;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeSection,
  onSelectSection,
  onOpenAuditLog,
  onDeployProtocol,
  onOpenQuickCreate,
  onOpenCommandPalette,
  onToggleMobileMenu,
  androidPreviewMode,
  onToggleAndroidPreview,
  activeDirectivesCount,
  totalDirectivesCount,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const jumpTo = (section: NavigationSection) => {
    onSelectSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 px-4 lg:px-8 flex items-center justify-between z-30 bg-[#1a1c20]/90 backdrop-blur-xl border-b border-[#3c4a42]/30">
      {/* Left: Hamburger (Mobile) + Brand Breadcrumb & Search */}
      <div className="flex items-center gap-3 lg:gap-5 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded bg-[#1e2024] border border-[#3c4a42]/40 text-[#4edea3] hover:bg-[#282a2e] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => jumpTo('north-star')}
          className="flex items-center gap-2 text-left focus:outline-none cursor-pointer"
        >
          <span className="font-mono text-[11px] sm:text-[12px] tracking-widest text-[#4edea3] uppercase font-bold whitespace-nowrap truncate">
            HORIZON MANIFESTO // COMMAND TERMINAL
          </span>
        </button>

        {/* Quick Search input */}
        <div className="relative w-56 xl:w-64 hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#bbcabf]">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Query directives, stacks, protocols..."
            className="w-full bg-[#0c0e12]/90 border border-[#3c4a42]/40 rounded py-1.5 pl-8 pr-3 font-mono text-[11px] text-[#e2e2e8] placeholder:text-[#bbcabf]/50 focus:outline-none focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-2 flex items-center text-[10px] font-mono text-[#bbcabf] hover:text-[#e2e2e8]"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      {/* Center: Quick Anchor Links Cluster — Tab Switcher */}
      <div className="hidden xl:flex items-center gap-6 font-mono text-[11px]">
        <button
          onClick={() => jumpTo('north-star')}
          className={`pb-1 tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'north-star'
              ? 'text-[#4cd7f6] font-medium border-b border-[#4cd7f6]'
              : 'text-[#bbcabf] hover:text-[#e2e2e8]'
          }`}
        >
          Telemetry &amp; Apex
        </button>
        <button
          onClick={() => jumpTo('work-scoreboards')}
          className={`pb-1 tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'work-scoreboards'
              ? 'text-[#4cd7f6] font-medium border-b border-[#4cd7f6]'
              : 'text-[#bbcabf] hover:text-[#e2e2e8]'
          }`}
        >
          Compounding Clock
        </button>
        <button
          onClick={() => jumpTo('milestone-projects')}
          className={`pb-1 tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'milestone-projects'
              ? 'text-[#4cd7f6] font-medium border-b border-[#4cd7f6]'
              : 'text-[#bbcabf] hover:text-[#e2e2e8]'
          }`}
        >
          Projects Pipeline
        </button>
        <button
          onClick={() => jumpTo('capability-stack')}
          className={`pb-1 tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            activeSection === 'capability-stack'
              ? 'text-[#4cd7f6] font-medium border-b border-[#4cd7f6]'
              : 'text-[#bbcabf] hover:text-[#e2e2e8]'
          }`}
        >
          Capability Matrix
        </button>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Directives Counter Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e2024] border border-[#3c4a42]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
          <span className="font-mono text-[10px] text-[#bbcabf] whitespace-nowrap">
            ACTIVE DIRECTIVES:
          </span>
          <span className="font-mono text-[10px] text-[#4edea3] font-bold tabular-nums">
            {activeDirectivesCount}/{totalDirectivesCount}
          </span>
        </div>

        {/* Quick + Button */}
        <button
          onClick={onOpenQuickCreate}
          className="px-2.5 py-1.5 rounded bg-[#1e2024] hover:bg-[#282a2e] border border-[#4edea3]/40 text-[#4edea3] font-mono text-[11px] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
          title="Create new item (Task, Project, Topic, Transaction, Review)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">New</span>
        </button>

        {/* Audit Log Action */}
        <button
          onClick={onOpenAuditLog}
          className="px-2.5 py-1.5 rounded bg-[#1e2024] hover:bg-[#282a2e] border border-[#3c4a42]/40 text-[#e2e2e8] font-mono text-[11px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <History className="w-3.5 h-3.5 text-[#bbcabf]" />
          <span className="hidden sm:inline">Audit Log</span>
        </button>

        {/* Deploy Protocol Primary Action */}
        <button
          onClick={onDeployProtocol}
          className="px-3 py-1.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/40 text-[#4edea3] hover:bg-[#4edea3]/20 font-mono text-[11px] font-medium transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Deploy Protocol</span>
        </button>

        {/* Trailing Icon Actions */}
        <div className="hidden sm:flex items-center border-l border-[#3c4a42]/30 pl-2 gap-1 text-[#bbcabf]">
          <button
            onClick={onToggleAndroidPreview}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              androidPreviewMode
                ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                : 'hover:text-[#e2e2e8] hover:bg-[#1e2024]'
            }`}
            title={
              androidPreviewMode
                ? 'Switch to Full Widescreen Desktop Layout'
                : 'Preview Android Mobile Viewport Layout'
            }
          >
            {androidPreviewMode ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onOpenAuditLog}
            className="p-1.5 rounded hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-colors cursor-pointer"
            title="System Notifications & Telemetry"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenCommandPalette}
            className="p-1.5 rounded hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-colors cursor-pointer"
            title="Command Palette (⌘K)"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:text-[#e2e2e8] hover:bg-[#1e2024] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Operator Key Badge */}
        <button
          onClick={onOpenAuditLog}
          className="w-7 h-7 rounded bg-[#282a2e] border border-[#3c4a42]/40 flex items-center justify-center font-mono text-[11px] text-[#4edea3] font-bold hover:border-[#4edea3] transition-colors cursor-pointer shrink-0"
          title="Operator Profile & Blueprint Status"
        >
          OP
        </button>
      </div>
    </header>
  );
};
