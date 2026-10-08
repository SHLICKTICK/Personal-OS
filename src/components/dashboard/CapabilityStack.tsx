import React from 'react';
import { CheckSquare, Square, Layers, Cpu, Award, ArrowUpRight } from 'lucide-react';
import { POSState } from '../../models/types';
import { WireframeSphere } from '../common/WireframeSphere';

interface CapabilityStackProps {
  state: POSState;
  onToggleSkillMastery: (domainId: string, groupName: string, skillName: string) => void;
}

export const CapabilityStack: React.FC<CapabilityStackProps> = ({
  state,
  onToggleSkillMastery,
}) => {
  const coreDomain = state.capabilityDomains.find((d) => d.tier === 'CORE');
  const leftWing = state.capabilityDomains.find((d) => d.tier === 'WING_LEFT');
  const rightWing = state.capabilityDomains.find((d) => d.tier === 'WING_RIGHT');

  const totalCoreSkills =
    coreDomain?.skills.reduce((acc, g) => acc + g.items.length, 0) || 0;
  const masteredCoreSkills =
    coreDomain?.skills.reduce(
      (acc, g) => acc + g.items.filter((i) => i.mastered).length,
      0
    ) || 0;
  const masteryPercentage = totalCoreSkills > 0
    ? Math.round((masteredCoreSkills / totalCoreSkills) * 100)
    : 0;

  return (
    <section
      className="p-5 sm:p-7 rounded-2xl bg-[#081414] border border-[#162b29] shadow-2xl flex flex-col gap-6 select-none animate-fadeIn relative overflow-hidden"
      id="capability-stack"
    >
      <WireframeSphere
        className="absolute -right-12 -top-12 opacity-30 pointer-events-none"
        size={280}
      />

      {/* Header with tactical category kicker and clean unboxed metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#132626] pb-4 relative z-10">
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-[#00f5a0] tracking-widest uppercase block">
            CAPABILITY // T-SHAPED MATRIX
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#e6f4f1] tracking-tight font-mono">
            The Capability Stack &amp; T-Shaped Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#7a9490]">
            Deep vertical engineering mastery fortified by commercial distribution and capital leverage.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#7a9490] shrink-0">
          <span className="text-[#00f5a0] font-bold">
            {masteredCoreSkills}/{totalCoreSkills} Primitives Verified ({masteryPercentage}%)
          </span>
          <span aria-hidden="true" className="text-[#3b5552]">·</span>
          <span>Spec v4.8</span>
          <span aria-hidden="true" className="text-[#3b5552]">·</span>
          <span className="text-[#38bdf8]">Core Pillar 60%</span>
        </div>
      </div>

      {/* Architectural Hierarchy Visual Model */}
      <div className="flex flex-col gap-4 relative z-10">
        {/* Apex Layer */}
        <div className="p-4 rounded-xl bg-[#060e0e] border border-[#38bdf8]/40 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
          <div className="sm:absolute top-2.5 left-3 font-mono text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider">
            APEX LAYER // LEVEL 03
          </div>
          <span className="text-base sm:text-lg text-[#e6f4f1] font-black font-mono mt-1">
            Strategic Synthesis &amp; Decision Intelligence
          </span>
          <span className="text-xs text-[#7a9490] mt-1 font-mono">
            Capital Allocation · Asymmetric Leverage · Market Arbitrage · Executive Architecture
          </span>
        </div>

        {/* Horizontal Wings & Core Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {/* Left Wing: Commercial Engines */}
          <div className="p-4 rounded-xl bg-[#081212] border border-[#162b29] flex flex-col justify-between space-y-3 hover:border-[#1d3835] transition-colors">
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider block">
                HORIZONTAL WING 01
              </span>
              <h3 className="text-sm sm:text-base text-[#e6f4f1] font-bold font-mono">
                {leftWing?.title || 'Commercial Engines'}
              </h3>
              <p className="text-xs text-[#7a9490] leading-relaxed">
                {leftWing?.subtitle}
              </p>

              {leftWing?.skills.map((grp) => (
                <div key={grp.group} className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-mono text-[#55736f] uppercase block font-semibold">
                    {grp.group}
                  </span>
                  {grp.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        onToggleSkillMastery(leftWing.id, grp.group, item.name)
                      }
                      className="w-full flex items-center gap-2 text-left font-mono text-[11px] px-2.5 py-1.5 rounded-lg bg-[#050a0a] hover:bg-[#0c1818] border border-[#162b29] hover:border-[#38bdf8]/40 transition-colors cursor-pointer group"
                    >
                      {item.mastered ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#00f5a0] shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#55736f] group-hover:text-[#38bdf8] shrink-0" />
                      )}
                      <span
                        className={
                          item.mastered ? 'text-[#e6f4f1] font-semibold' : 'text-[#7a9490]'
                        }
                      >
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#132626] font-mono text-[10px] text-[#7a9490] flex items-center justify-between">
              <span>Time Budget</span>
              <span className="text-[#38bdf8] font-bold">25% Allocation</span>
            </div>
          </div>

          {/* Deep Vertical Core Pillar (2 Columns wide) */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#091814] border-2 border-[#00f5a0]/50 flex flex-col justify-between shadow-[0_0_20px_rgba(0,245,160,0.12)] space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#00f5a0] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                  DEEP VERTICAL CORE PILLAR
                </span>
                <span className="font-mono text-[10px] text-[#00f5a0] font-bold">
                  60% WEIGHT // PRIMARY MOAT
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#e6f4f1] font-mono">
                  {coreDomain?.title || 'Software & Systems Engineering'}
                </h3>
                <p className="text-xs text-[#7a9490] mt-0.5 leading-relaxed">
                  {coreDomain?.subtitle}
                </p>
              </div>

              {/* 4 Sub-Grids + Interactive Skill Mastery Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-mono text-[10px]">
                {coreDomain?.skills.map((grp) => (
                  <div
                    key={grp.group}
                    className="p-3 rounded-xl bg-[#060e0e] border border-[#162b29] flex flex-col gap-2"
                  >
                    <span className="text-[#00f5a0] font-bold block uppercase tracking-wider text-[10px]">
                      {grp.group}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.items.map((skill) => (
                        <button
                          key={skill.name}
                          onClick={() =>
                            onToggleSkillMastery(
                              coreDomain.id,
                              grp.group,
                              skill.name
                            )
                          }
                          className={`px-2 py-1 rounded-md border font-mono text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
                            skill.mastered
                              ? 'bg-[#00f5a0]/15 border-[#00f5a0]/50 text-[#e6f4f1] shadow-xs'
                              : 'bg-[#050a0a] border-[#162b29] text-[#7a9490] hover:border-[#00f5a0]/40 hover:text-[#e6f4f1]'
                          }`}
                          title="Click to toggle verified skill proficiency"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              skill.mastered ? 'bg-[#00f5a0] shadow-[0_0_6px_#00f5a0]' : 'bg-[#3b5552]'
                            }`}
                          />
                          <span>{skill.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-[#00f5a0]/20 flex items-center justify-between font-mono text-[10px] text-[#00f5a0]">
              <span className="text-[#7a9490]">Core Moat &amp; Compounding Multiplier</span>
              <span className="font-bold">Unassailable Depth ({masteredCoreSkills}/{totalCoreSkills})</span>
            </div>
          </div>

          {/* Right Wing: Financial Engineering */}
          <div className="p-4 rounded-xl bg-[#081212] border border-[#162b29] flex flex-col justify-between space-y-3 hover:border-[#1d3835] transition-colors">
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider block">
                HORIZONTAL WING 02
              </span>
              <h3 className="text-sm sm:text-base text-[#e6f4f1] font-bold font-mono">
                {rightWing?.title || 'Financial Engineering'}
              </h3>
              <p className="text-xs text-[#7a9490] leading-relaxed">
                {rightWing?.subtitle}
              </p>

              {rightWing?.skills.map((grp) => (
                <div key={grp.group} className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-mono text-[#55736f] uppercase block font-semibold">
                    {grp.group}
                  </span>
                  {grp.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        onToggleSkillMastery(rightWing.id, grp.group, item.name)
                      }
                      className="w-full flex items-center gap-2 text-left font-mono text-[11px] px-2.5 py-1.5 rounded-lg bg-[#050a0a] hover:bg-[#0c1818] border border-[#162b29] hover:border-[#38bdf8]/40 transition-colors cursor-pointer group"
                    >
                      {item.mastered ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#00f5a0] shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#55736f] group-hover:text-[#38bdf8] shrink-0" />
                      )}
                      <span
                        className={
                          item.mastered ? 'text-[#e6f4f1] font-semibold' : 'text-[#7a9490]'
                        }
                      >
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#132626] font-mono text-[10px] text-[#7a9490] flex items-center justify-between">
              <span>Time Budget</span>
              <span className="text-[#38bdf8] font-bold">15% Allocation</span>
            </div>
          </div>
        </div>

        {/* Bedrock Foundation */}
        <div className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-[10px] text-[#00f5a0] uppercase font-bold tracking-wider">
              BEDROCK FOUNDATION:
            </span>
            <span className="text-xs sm:text-sm text-[#e6f4f1] font-mono font-bold">
              Computer Science Fundamentals, Discrete Math &amp; First Principles Logic
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#55736f]">Immutable Ground Truth</span>
        </div>
      </div>

      {/* Priority Allocation Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 relative z-10 font-mono">
        <div className="p-4 rounded-xl bg-[#081212] border border-[#162b29] border-l-4 border-l-[#00f5a0] space-y-1">
          <div className="text-[10px] text-[#00f5a0] uppercase font-bold tracking-wider">
            TIER 1 ALLOCATION — 60%
          </div>
          <div className="text-sm text-[#e6f4f1] font-bold">
            Core Engineering Deep Work
          </div>
          <p className="text-[11px] text-[#7a9490] leading-relaxed">
            Direct production coding, architecture RFC writing, debugging, deployment pipelines.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#081212] border border-[#162b29] border-l-4 border-l-[#38bdf8] space-y-1">
          <div className="text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider">
            TIER 2 ALLOCATION — 25%
          </div>
          <div className="text-sm text-[#e6f4f1] font-bold">
            Commercialization &amp; Revenue
          </div>
          <p className="text-[11px] text-[#7a9490] leading-relaxed">
            Distribution channels, user interviews, marketing systems, cold client outreach.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#081212] border border-[#162b29] border-l-4 border-l-[#818cf8] space-y-1">
          <div className="text-[10px] text-[#818cf8] uppercase font-bold tracking-wider">
            TIER 3 ALLOCATION — 15%
          </div>
          <div className="text-sm text-[#e6f4f1] font-bold">
            Capital &amp; Strategic Synthesis
          </div>
          <p className="text-[11px] text-[#7a9490] leading-relaxed">
            Portfolio allocation, executive reviews, high-level thesis updates, health optimization.
          </p>
        </div>
      </div>
    </section>
  );
};
