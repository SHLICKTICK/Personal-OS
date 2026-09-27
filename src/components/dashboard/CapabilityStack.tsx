import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { POSState } from '../../models/types';

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

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/75 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-5"
      id="capability-stack"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[12px] text-[#4edea3] font-bold">
            MODULE 02
          </span>
          <h2 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold">
            The Capability Stack &amp; T-Shaped Development Matrix
          </h2>
        </div>
        <span className="font-mono text-[10px] text-[#4cd7f6] font-bold">
          ARCHITECTURE SPECIFICATION v4.8 // {masteredCoreSkills}/{totalCoreSkills} CORE PRIMITIVES VERIFIED
        </span>
      </div>

      {/* Architectural Hierarchy Visual Model */}
      <div className="flex flex-col gap-4">
        {/* Apex Layer */}
        <div className="p-4 rounded-xl bg-[#333539]/60 border border-[#4cd7f6]/40 flex flex-col items-center text-center relative overflow-hidden">
          <div className="sm:absolute top-2 left-3 font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">
            APEX LAYER
          </div>
          <span className="text-[18px] text-[#e2e2e8] font-bold mt-1">
            Strategic Synthesis &amp; Decision Intelligence
          </span>
          <span className="text-[12px] text-[#bbcabf] mt-1">
            Capital Allocation, Asymmetric Leverage, Market Arbitrage &amp; Executive Architecture
          </span>
        </div>

        {/* Horizontal Wings & Core Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {/* Left Wing: Commercial Engines */}
          <div className="p-4 rounded-xl bg-[#1e2024] border border-[#3c4a42]/30 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#c0c1ff] uppercase font-bold">
                HORIZONTAL WING 01
              </span>
              <h3 className="text-[15px] text-[#e2e2e8] font-semibold mt-1">
                {leftWing?.title || 'Commercial Engines'}
              </h3>
              <p className="text-[12px] leading-[18px] text-[#bbcabf] mt-2">
                {leftWing?.subtitle}
              </p>

              {leftWing?.skills.map((grp) => (
                <div key={grp.group} className="mt-3 space-y-1.5">
                  {grp.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        onToggleSkillMastery(leftWing.id, grp.group, item.name)
                      }
                      className="w-full flex items-center gap-2 text-left font-mono text-[10px] px-2 py-1 rounded bg-[#1a1c20] hover:bg-[#282a2e] border border-[#3c4a42]/30 transition-colors cursor-pointer"
                    >
                      {item.mastered ? (
                        <CheckSquare className="w-3 h-3 text-[#4edea3] shrink-0" />
                      ) : (
                        <Square className="w-3 h-3 text-[#86948a] shrink-0" />
                      )}
                      <span
                        className={
                          item.mastered ? 'text-[#e2e2e8]' : 'text-[#bbcabf]'
                        }
                      >
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-[#3c4a42]/20 font-mono text-[10px] text-[#c0c1ff]">
              Allocation: 25% Time
            </div>
          </div>

          {/* Deep Vertical Core Pillar (2 Columns wide) */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-[#4edea3]/5 border-2 border-[#4edea3]/50 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
                  DEEP VERTICAL CORE PILLAR
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold">
                  60% WEIGHT
                </span>
              </div>
              <h3 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold mt-2">
                {coreDomain?.title || 'Software & Systems Engineering'}
              </h3>
              <p className="text-[12px] text-[#bbcabf] mt-1">
                {coreDomain?.subtitle}
              </p>

              {/* 4 Sub-Grids matching Screenshot + Interactive Skill Mastery Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 font-mono text-[10px]">
                {coreDomain?.skills.map((grp) => (
                  <div
                    key={grp.group}
                    className="p-2.5 rounded bg-[#1e2024]/80 border border-[#3c4a42]/40 flex flex-col gap-1.5"
                  >
                    <span className="text-[#4edea3] font-bold block">
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
                          className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 cursor-pointer ${
                            skill.mastered
                              ? 'bg-[#4edea3]/15 border-[#4edea3]/50 text-[#e2e2e8]'
                              : 'bg-[#0c0e12]/60 border-[#3c4a42]/40 text-[#bbcabf] hover:border-[#4cd7f6]'
                          }`}
                          title="Click to toggle verified skill proficiency"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              skill.mastered ? 'bg-[#4edea3]' : 'bg-[#86948a]'
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
            <div className="mt-4 pt-3 border-t border-[#4edea3]/20 flex items-center justify-between font-mono text-[10px] text-[#4edea3]">
              <span>Core Moat &amp; Compounding Multiplier</span>
              <span>Unassailable Depth ({masteredCoreSkills}/{totalCoreSkills})</span>
            </div>
          </div>

          {/* Right Wing: Financial Engineering */}
          <div className="p-4 rounded-xl bg-[#1e2024] border border-[#3c4a42]/30 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">
                HORIZONTAL WING 02
              </span>
              <h3 className="text-[15px] text-[#e2e2e8] font-semibold mt-1">
                {rightWing?.title || 'Financial Engineering'}
              </h3>
              <p className="text-[12px] leading-[18px] text-[#bbcabf] mt-2">
                {rightWing?.subtitle}
              </p>

              {rightWing?.skills.map((grp) => (
                <div key={grp.group} className="mt-3 space-y-1.5">
                  {grp.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() =>
                        onToggleSkillMastery(rightWing.id, grp.group, item.name)
                      }
                      className="w-full flex items-center gap-2 text-left font-mono text-[10px] px-2 py-1 rounded bg-[#1a1c20] hover:bg-[#282a2e] border border-[#3c4a42]/30 transition-colors cursor-pointer"
                    >
                      {item.mastered ? (
                        <CheckSquare className="w-3 h-3 text-[#4cd7f6] shrink-0" />
                      ) : (
                        <Square className="w-3 h-3 text-[#86948a] shrink-0" />
                      )}
                      <span
                        className={
                          item.mastered ? 'text-[#e2e2e8]' : 'text-[#bbcabf]'
                        }
                      >
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t border-[#3c4a42]/20 font-mono text-[10px] text-[#4cd7f6]">
              Allocation: 15% Time
            </div>
          </div>
        </div>

        {/* Bedrock Foundation */}
        <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] text-[#86948a] uppercase font-bold">
              BEDROCK:
            </span>
            <span className="text-[14px] sm:text-[15px] text-[#e2e2e8] font-medium">
              Computer Science Fundamentals, Discrete Math &amp; First Principles Logic
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#bbcabf]">Immutable Truth</span>
        </div>
      </div>

      {/* Priority Allocation Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3.5 rounded-lg bg-[#1e2024] border-l-4 border-[#4edea3]">
          <div className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">
            TIER 1 ALLOCATION — 60%
          </div>
          <div className="text-[15px] text-[#e2e2e8] font-medium mt-1">
            Core Engineering Deep Work
          </div>
          <p className="text-[12px] leading-[18px] text-[#bbcabf] mt-1">
            Direct production coding, architecture RFC writing, debugging, deployment pipelines.
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-[#1e2024] border-l-4 border-[#4cd7f6]">
          <div className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">
            TIER 2 ALLOCATION — 25%
          </div>
          <div className="text-[15px] text-[#e2e2e8] font-medium mt-1">
            Commercialization &amp; Revenue
          </div>
          <p className="text-[12px] leading-[18px] text-[#bbcabf] mt-1">
            Distribution channels, user interviews, marketing systems, cold client outreach.
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-[#1e2024] border-l-4 border-[#c0c1ff]">
          <div className="font-mono text-[10px] text-[#c0c1ff] uppercase font-bold">
            TIER 3 ALLOCATION — 15%
          </div>
          <div className="text-[15px] text-[#e2e2e8] font-medium mt-1">
            Capital &amp; Strategic Synthesis
          </div>
          <p className="text-[12px] leading-[18px] text-[#bbcabf] mt-1">
            Portfolio allocation, executive reviews, high-level thesis updates, health optimization.
          </p>
        </div>
      </div>
    </section>
  );
};
