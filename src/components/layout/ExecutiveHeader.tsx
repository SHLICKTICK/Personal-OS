import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Command,
  Sun,
  MoreHorizontal,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { NavigationSection } from '../../models/types';

interface ExecutiveHeaderProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  activeSection?: NavigationSection;
  onSelectSection?: (section: NavigationSection) => void;
  onOpenQuickCreate: () => void;
  onOpenCommandPalette: () => void;
  onOpenOnboarding?: () => void;
  onOpenMorningKickoff?: () => void;
  onToggleMobileMenu: () => void;
  androidPreviewMode: boolean;
  onToggleAndroidPreview: () => void;
  operatorName?: string;
  version?: string;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  activeSection,
  onSelectSection,
  onOpenQuickCreate,
  onOpenCommandPalette,
  onOpenMorningKickoff,
  onToggleMobileMenu,
  androidPreviewMode,
  onToggleAndroidPreview,
  version,
}) => {
  const isLearningView = activeSection === 'learning-engine';

  return (
    <header className="fixed top-0 right-0 left-0 h-14 px-4 lg:px-6 flex items-center justify-between z-30 bg-[#050a0a] border-b border-[#132626] select-none">
      {/* Left: Mobile Toggle + Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-md bg-[#091414] border border-[#162b29] text-[#00f5a0] hover:bg-[#122222] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectSection?.('north-star')}
          className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#00f5a0]/10 flex items-center justify-center text-[#00f5a0] group-hover:scale-110 transition-transform">
            <svg
              className="w-4.5 h-4.5 text-[#00f5a0]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2L2 22h20L12 2z" />
              <path d="M12 7l5 10H7l5-10z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-wider text-[#e6f4f1] text-sm leading-tight group-hover:text-[#00f5a0] transition-colors">
              PERSONAL OS
            </span>
            {isLearningView && (
              <span className="font-mono text-[9px] text-[#00f5a0] tracking-widest leading-none font-bold">
                LEARNING &amp; RETENTION ENGINE
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Center: Search Bar with ⌘K */}
      <div className="flex-1 max-w-lg mx-4 sm:mx-8">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#091414] hover:bg-[#0c1818] border border-[#162b29] hover:border-[#00f5a0]/40 text-[#7a9490] hover:text-[#e6f4f1] transition-all cursor-pointer group shadow-inner"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#55736f] group-hover:text-[#00f5a0] transition-colors shrink-0" />
            <span className="text-xs truncate text-[#7a9490] group-hover:text-[#e6f4f1]">
              {isLearningView
                ? 'Search knowledge, topics, or notes...'
                : 'Search directives, skills, notes...'}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#050a0a] border border-[#162b29] font-mono text-[10px] text-[#7a9490] group-hover:text-[#00f5a0]">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right: Actions matching Reference Images */}
      <div className="flex items-center gap-2.5">
        {/* + New Directive button */}
        <button
          onClick={onOpenQuickCreate}
          className="px-3 py-1.5 rounded-lg bg-[#071714] hover:bg-[#00f5a0]/15 border border-[#00f5a0]/50 text-[#00f5a0] font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.12)] whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Directive</span>
        </button>

        {/* Viewport Dimension Toggle (Mobile/Desktop Preview) */}
        <button
          onClick={onToggleAndroidPreview}
          className={`p-2 rounded-lg transition-colors cursor-pointer border ${
            androidPreviewMode
              ? 'bg-[#00f5a0]/20 text-[#00f5a0] border-[#00f5a0]/40'
              : 'bg-[#091414] hover:bg-[#0c1818] text-[#7a9490] hover:text-[#e6f4f1] border-[#162b29]'
          }`}
          title={androidPreviewMode ? 'Exit Mobile Preview' : 'Mobile Preview Viewport'}
        >
          {androidPreviewMode ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </button>

        {/* Brightness / Theme Toggle */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="p-2 rounded-lg bg-[#091414] hover:bg-[#0c1818] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] transition-colors cursor-pointer"
          title="Toggle Display / Theme"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* More Options */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="p-2 rounded-lg bg-[#091414] hover:bg-[#0c1818] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] transition-colors cursor-pointer"
          title="More Options (⌘K)"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
