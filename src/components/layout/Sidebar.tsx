import React from 'react';
import {
  Star,
  Layers,
  BookOpen,
  Code,
  Landmark,
  BarChart3,
  Shield,
  Infinity,
  Target,
  Zap,
  ArrowRight,
  Settings,
  X,
  ChevronRight,
  Command,
  Compass,
} from 'lucide-react';
import { NavigationSection } from '../../models/types';

interface SidebarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  onOpenQuickCreate: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding?: () => void;
  onOpenMorningKickoff?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  version: string;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenQuickCreate,
  onOpenCommandPalette,
  onOpenSettings,
  onOpenOnboarding,
  onOpenMorningKickoff,
  mobileOpen,
  onCloseMobile,
}) => {
  const navGroups: NavGroup[] = [
    {
      category: 'COMMAND',
      items: [
        { id: 'north-star', label: 'North Star', icon: <Star className="w-4 h-4" /> },
        { id: 'capability-stack', label: 'Capability Stack', icon: <Layers className="w-4 h-4" /> },
        { id: 'learning-engine', label: 'Learning Engine', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
    {
      category: 'EXECUTION',
      items: [
        { id: 'milestone-projects', label: 'Milestone Projects', icon: <Code className="w-4 h-4" /> },
        { id: 'financial-os', label: 'Financial OS', icon: <Landmark className="w-4 h-4" /> },
        { id: 'work-scoreboards', label: 'Work Scoreboards', icon: <BarChart3 className="w-4 h-4" /> },
      ],
    },
    {
      category: 'STRATEGY',
      items: [
        { id: 'ai-guardrails', label: 'AI Guardrails', icon: <Shield className="w-4 h-4" /> },
        { id: 'horizon-flight-plan', label: '10-Year Horizon', icon: <Infinity className="w-4 h-4" /> },
        { id: 'principle-70', label: '70th Principle', icon: <Target className="w-4 h-4" /> },
      ],
    },
  ];

  const handleNavClick = (section: NavigationSection) => {
    onSelectSection(section);
    onCloseMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-[#050a0a] border-r border-[#132626] select-none text-[#a1b8b4]">
      {/* Top Brand & Groups */}
      <div className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between pb-2 border-b border-[#132626] lg:hidden">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#00f5a0]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path d="M12 2L2 22h20L12 2z" />
              <path d="M12 7l5 10H7l5-10z" />
            </svg>
            <span className="font-extrabold tracking-wider text-[#e6f4f1] text-sm">
              PERSONAL OS
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818]"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-5 pt-1">
          {navGroups.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <span className="px-2 font-mono text-[10px] uppercase font-bold tracking-widest text-[#4e6b66] block">
                {group.category}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#002b21] text-[#00f5a0] border border-[#00f5a0]/40 font-bold shadow-[0_0_15px_rgba(0,245,160,0.1)]'
                          : 'text-[#8ca39f] hover:text-[#e6f4f1] hover:bg-[#0a1414]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? 'text-[#00f5a0]' : 'text-[#62807c]'}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00f5a0] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Pinned Widget: DAY KICKOFF */}
      <div className="pt-4 space-y-3">
        <div className="p-3.5 rounded-xl bg-[#091414] border border-[#162b29] space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00f5a0]/15 flex items-center justify-center text-[#00f5a0]">
              <Zap className="w-3.5 h-3.5 fill-[#00f5a0]" />
            </div>
            <span className="font-mono text-[11px] font-bold text-[#e6f4f1] uppercase tracking-wider">
              DAY KICKOFF
            </span>
          </div>
          <p className="text-[11px] text-[#7a9490] leading-snug">
            4 directives · 90 min deep work
          </p>
          <button
            onClick={() => {
              onOpenMorningKickoff?.();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[0_0_15px_rgba(0,245,160,0.25)] hover:scale-[1.02]"
          >
            <span>Start</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer: Command Palette, Setup, Settings & Runtime Status matching Reference Image */}
        <div className="space-y-1.5 pt-2 border-t border-[#132626]">
          <button
            onClick={() => {
              onOpenCommandPalette();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0a1414] transition-colors text-xs font-mono cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-[#55736f]" />
              <span>Command Palette</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#091414] border border-[#162b29] text-[9px] text-[#7a9490]">⌘K</kbd>
          </button>

          <button
            onClick={() => {
              onOpenOnboarding?.();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0a1414] transition-colors text-xs font-mono cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#55736f]" />
              <span>Setup Flow &amp; Tour</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#091414] border border-[#162b29] text-[9px] font-bold text-[#00f5a0]">START</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0a1414] transition-colors text-xs font-mono cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#55736f]" />
            <span>Settings &amp; Storage</span>
          </button>

          <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-mono text-[#5c7a76] pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse shadow-[0_0_8px_#00f5a0]" />
              <span className="text-[#7a9490]">Runtime: Synchronized</span>
            </div>
            <span className="text-[#00f5a0] font-bold">100%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed top-14 bottom-0 left-0 w-60 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
