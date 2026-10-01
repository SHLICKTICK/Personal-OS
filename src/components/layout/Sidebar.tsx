import React from 'react';
import {
  Terminal,
  Zap,
  Compass,
  Layers,
  Brain,
  Flag,
  Landmark,
  Shield,
  Gauge,
  Rocket,
  CheckCircle2,
  Sliders,
  Command,
  X,
} from 'lucide-react';
import { NavigationSection } from '../../models/types';

interface SidebarProps {
  activeSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  onOpenQuickCreate: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  version: string;
}

interface NavItem {
  id: NavigationSection;
  label: string;
  number: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  onOpenQuickCreate,
  onOpenCommandPalette,
  onOpenSettings,
  mobileOpen,
  onCloseMobile,
  version,
}) => {
  const coreTabs: NavItem[] = [
    { id: 'north-star', label: 'North Star', number: '01', icon: <Compass className="w-4 h-4" /> },
    { id: 'capability-stack', label: 'Capability Stack', number: '02', icon: <Layers className="w-4 h-4" /> },
    { id: 'learning-engine', label: 'Learning Engine', number: '03', icon: <Brain className="w-4 h-4" /> },
    { id: 'milestone-projects', label: 'Milestone Projects', number: '04', icon: <Flag className="w-4 h-4" /> },
    { id: 'financial-os', label: 'Financial OS', number: '05', icon: <Landmark className="w-4 h-4" /> },
    { id: 'ai-guardrails', label: 'AI Guardrails', number: '06', icon: <Shield className="w-4 h-4" /> },
    { id: 'work-scoreboards', label: 'Work Scoreboards', number: '07', icon: <Gauge className="w-4 h-4" /> },
    { id: 'horizon-flight-plan', label: '10-Year Horizon', number: '08', icon: <Rocket className="w-4 h-4" /> },
    { id: 'principle-70', label: '70th Principle', number: '09', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const handleNavClick = (section: NavigationSection) => {
    onSelectSection(section);
    onCloseMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3 bg-[#0c0e12]/95 backdrop-blur-md border-r border-[#3c4a42]/30 select-none">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#3c4a42]/20">
          <button
            onClick={() => handleNavClick('north-star')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center text-[#4edea3] group-hover:bg-[#4edea3]/20 transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[16px] font-bold tracking-wider text-[#4edea3] uppercase leading-tight">
                EXECUTIVE POS
              </span>
              <span className="font-mono text-[10px] text-[#bbcabf] tracking-wider">
                {version}
              </span>
            </div>
          </button>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded text-[#bbcabf] hover:text-[#e2e2e8] hover:bg-[#1e2024]"
              aria-label="Close navigation drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Directive CTA */}
        <button
          onClick={() => {
            onOpenQuickCreate();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3] hover:bg-[#4edea3]/20 transition-all font-mono text-[12px] font-medium mt-1 group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Quick Directive</span>
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1e2024] border border-[#3c4a42]/40 text-[#bbcabf] group-hover:text-[#4edea3]">
            ⌘N
          </kbd>
        </button>

        {/* 9 Core Modules Navigation — Single-Tab View Switcher */}
        <div className="mt-2 overflow-y-auto pr-1 space-y-1">
          <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#86948a] flex items-center justify-between">
            <span>Core Modules (01–09)</span>
            <span className="text-[#4edea3] text-[9px] font-bold">Single-Page</span>
          </div>
          {coreTabs.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-mono text-[12px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#282a2e]/90 text-[#4edea3] border-l-2 border-[#4edea3] font-bold shadow-xs'
                    : 'text-[#bbcabf] hover:text-[#e2e2e8] hover:bg-[#1e2024]/60'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
                <span className={`ml-auto font-mono text-[10px] tabular-nums ${isActive ? 'text-[#4edea3]' : 'opacity-60'}`}>
                  {item.number}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="flex flex-col gap-1 pt-2 border-t border-[#3c4a42]/20">
        <button
          onClick={() => {
            onOpenCommandPalette();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded text-[#bbcabf] hover:text-[#e2e2e8] hover:bg-[#1e2024]/50 transition-colors font-mono text-[12px] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Command className="w-4 h-4" />
            <span>Command Palette</span>
          </span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1e2024] border border-[#3c4a42]/40 text-[#bbcabf]">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => {
            onOpenSettings();
            onCloseMobile();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-[#bbcabf] hover:text-[#e2e2e8] hover:bg-[#1e2024]/50 transition-colors font-mono text-[12px] cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
          <span>Settings & Storage</span>
        </button>

        {/* Runtime Synchronized Status Tag */}
        <div className="mt-1.5 p-2 rounded bg-[#1e2024]/70 border border-[#3c4a42]/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="font-mono text-[10px] text-[#bbcabf] uppercase tracking-wider">
              Runtime: Synchronized
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#4edea3] font-bold tabular-nums">
            100%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-40 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile / Android Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
