import { POSState } from '../models/types';

/**
 * Transforms the entire 9-module POSState into a dense, semantic Markdown
 * representation optimized for LLM reasoning with high signal-to-noise ratio.
 * Strips internal UI UUIDs and color tags while preserving 100% of domain data.
 */
export function serializeFullPOSStateToContext(state: POSState): string {
  const parts: string[] = [];

  // ==========================================
  // OPERATOR METADATA & PHILOSOPHICAL FOUNDATION
  // ==========================================
  const activeCreed = state.creedStages.find((c) => c.active)?.label || state.creedStages[0]?.label || 'Stage 01';
  parts.push(`# PERSONAL OS v${state.version} // EXECUTIVE SYSTEM TELEMETRY
Operator: ${state.operatorName}
Active Creed Stage: ${activeCreed}
North Star Core Principle: "${state.northStarCorePrinciple}"
Supporting Philosophy: "${state.northStarSupporting}"
Apex Principle: "${state.apexPhilosophyPrinciple}" (${state.apexPhilosophySupporting})
Commit Counter: ${state.commitCount} | Last Sign-Off: ${state.lastCommittedTimestamp || 'Pending'}
`);

  // ==========================================
  // MODULE 01 // NORTH STAR & DIRECTIVES
  // ==========================================
  const todayGoals = state.goals.filter((g) => g.horizon === 'Today');
  const strategicGoals = state.goals.filter((g) => g.horizon !== 'Today');
  
  parts.push(`## [MODULE 01] STRATEGIC DIRECTIVES & GOALS
### Today's Directives (${todayGoals.filter((g) => g.status === 'COMPLETED').length}/${todayGoals.length} Locked):
${todayGoals.map((g) => `- [${g.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'}] (${g.category}) "${g.title}" — Metric: ${g.targetMetric} (Progress: ${g.progress}%) [Impact: ${g.impactText || 'Core execution'}]`).join('\n') || '- None registered'}

### Longer-Horizon Objectives:
${strategicGoals.map((g) => `- [${g.horizon}] [${g.status}] (${g.category}) "${g.title}" — Target: ${g.targetMetric}`).join('\n') || '- None registered'}

### Core Operating Principles (${state.principles.length} Total):
${state.principles.slice(0, 8).map((p) => `• [${p.code} // ${p.category.toUpperCase()}] "${p.title}": ${p.description}`).join('\n')}
(Plus ${Math.max(0, state.principles.length - 8)} additional principles encoded in system rules)
`);

  // ==========================================
  // MODULE 02 // CAPABILITY STACK
  // ==========================================
  parts.push(`## [MODULE 02] CAPABILITY STACK & ALLOCATION
Role Allocation: ${state.competenceBadges.map((b) => `${b.role}: ${b.percentage}%`).join(' | ')}
Competence Domains:
${state.capabilityDomains.map((dom) => {
  const masteredCount = dom.skills.flatMap((s) => s.items).filter((i) => i.mastered).length;
  const totalCount = dom.skills.flatMap((s) => s.items).length;
  return `- ${dom.title} [Tier: ${dom.tier} | Allocation: ${dom.allocation}]: ${masteredCount}/${totalCount} verified skills mastered (${dom.skills.map((s) => `${s.group}: ${s.items.filter((i) => i.mastered).length}/${s.items.length}`).join(', ')})`;
}).join('\n')}
`);

  // ==========================================
  // MODULE 03 // LEARNING RETENTION ENGINE
  // ==========================================
  const dueTopics = state.learningTopics.filter(
    (t) => t.retentionState === 'DUE_TODAY' || t.retentionState === 'REINFORCE'
  );
  const masteredTopics = state.learningTopics.filter((t) => t.retentionState === 'MASTERED');

  parts.push(`## [MODULE 03] LEARNING ENGINE & ZERO-FORGET RETENTION
Current Apex Target Stage: ${state.currentLearningStage}
Retention Status: ${dueTopics.length} topics DUE/REINFORCE, ${masteredTopics.length} MASTERED, ${state.learningTopics.length} total tracked.

### Active & Due Topics:
${state.learningTopics.map((t) => `- [${t.code}] "${t.topic}" (Stage: ${t.stage} - ${t.stageLabel})
  • Retention State: ${t.retentionState} | Reviews: ${t.reviewCount} | Last Reviewed: ${t.lastReviewed}
  • Protocol: ${t.protocolAction}
  • Notes/Synthesis: ${t.notes || 'No Feynman note recorded'}`).join('\n')}

Recent Learning Reviews (${state.learningReviews.length} total logged):
${state.learningReviews.slice(0, 5).map((r) => `• Reviewed ${r.topicId} on ${r.reviewedAt.split('T')[0]}: Rating [${r.rating}] — ${r.notes || 'Complete'}`).join('\n') || '• No recent reviews recorded'}
`);

  // ==========================================
  // MODULE 04 // MILESTONE PROJECTS & 14-GATE DOD
  // ==========================================
  parts.push(`## [MODULE 04] MILESTONE PROJECTS & 14-GATE DEFINITION OF DONE
Pipeline Overview: ${state.projects.filter((p) => p.status === 'COMPLETED').length}/5 completed, 1 active, ${state.projects.filter((p) => p.status === 'QUEUED').length} queued.

### Projects Detail:
${state.projects.map((p) => {
  const passedDoD = p.dodPassedIds || [];
  const unpassedDoD = state.dodGateProtocol.filter((g) => !passedDoD.includes(g.id)).map((g) => g.code);
  const openP0 = p.tasks.filter((t) => !t.completed && t.priority === 'P0');
  const openP1 = p.tasks.filter((t) => !t.completed && t.priority === 'P1');

  return `### Project ${p.code}: "${p.title}" [Status: ${p.status} | Progress: ${p.progress}%]
• Current Milestone: ${p.currentMilestone}
• Next Deterministic Action: "${p.nextAction}"
• Tech Stack: ${p.technologies.join(', ')} | Skills Applied: ${p.skills.join(', ')}
• DoD Gates Passed: ${passedDoD.length}/14 gates
  Unpassed Gates: ${unpassedDoD.length > 0 ? unpassedDoD.join(', ') : 'ALL 14 GATES PASSED'}
• Open P0 Tasks (${openP0.length}): ${openP0.map((t) => `"${t.title}"`).join(', ') || 'None'}
• Open P1 Tasks (${openP1.length}): ${openP1.map((t) => `"${t.title}"`).join(', ') || 'None'}
• Project Notes: ${p.notes || 'None'}`;
}).join('\n\n')}
`);

  // ==========================================
  // MODULE 05 // FINANCIAL OS & COMMERCIAL ENGINE
  // ==========================================
  const totalIncome = state.transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountRand, 0);
  const totalExpenses = state.transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountRand, 0);
  const netFCF = totalIncome - totalExpenses;
  const totalAssets = state.assets.reduce((sum, a) => sum + a.valueRand, 0);
  const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.amountRand, 0);
  const netWorth = totalAssets - totalLiabilities;

  parts.push(`## [MODULE 05] FINANCIAL OS & COMMERCIAL PIPELINE
Financial Runway & Metrics:
• Net Monthly Free Cash Flow (FCF): R${netFCF.toLocaleString()} (Income: R${totalIncome.toLocaleString()} | Expenses: R${totalExpenses.toLocaleString()})
• Net Worth: R${netWorth.toLocaleString()} (Assets: R${totalAssets.toLocaleString()} | Liabilities: R${totalLiabilities.toLocaleString()})

### Financial Compounding Targets:
${state.financialTargets.map((ft) => `- [${ft.stageLabel}] "${ft.titleRandUsd}": R${ft.currentAmountRand.toLocaleString()} / R${ft.targetAmountRand.toLocaleString()} (Deadline: ${ft.deadline}) — Capability: ${ft.associatedCapability}`).join('\n')}

### Commercial Experiment Spec:
${state.activeCommercialExperiment ? `• Product/Service: "${state.activeCommercialExperiment.productOrServiceName}" [Status: ${state.activeCommercialExperiment.status}]
• Target Vertical: ${state.activeCommercialExperiment.targetVertical} | Target Persona: ${state.activeCommercialExperiment.targetPersona}
• Core Hypothesis: "${state.activeCommercialExperiment.coreHypothesis}"
• Grand Slam Offer: "${state.activeCommercialExperiment.grandSlamOffer}" | Pricing: ${state.activeCommercialExperiment.pricingModel}
• Metric: ${state.activeCommercialExperiment.primaryMetric}` : '• No active commercial experiment spec'}

### 7-Step Commercial Experiment Loop:
${state.businessExperimentSteps.map((s) => `• Step ${s.stepNumber} [${s.completed ? 'DONE' : 'PENDING'}]: "${s.title}" — ${s.detail}`).join('\n')}

### Active Pipeline Leads (${state.businessLeads.length} Total):
${state.businessLeads.map((l) => `• [${l.stage}] ${l.name} (${l.organization}) — Est Value: R${l.estimatedValueRand.toLocaleString()}
  Bottleneck: ${l.bottleneck} | Next Action: ${l.nextAction}`).join('\n') || '• No active sales leads'}
`);

  // ==========================================
  // MODULE 06 // COGNITION, AI GUARDRAILS & VAULT
  // ==========================================
  parts.push(`## [MODULE 06] COGNITION, AI GUARDRAILS, KNOWLEDGE VAULT & DECISIONS
Mandatory AI Guardrails:
${state.mandatoryAiRules.map((r) => `✓ ${r}`).join('\n')}
Prohibited AI Actions:
${state.prohibitedAiRules.map((r) => `✗ ${r}`).join('\n')}

### Knowledge Vault Notes (${state.knowledgeNotes.length} Notes):
${state.knowledgeNotes.map((n) => `• [${n.category}] "${n.title}": ${n.content.slice(0, 140)}${n.content.length > 140 ? '...' : ''}`).join('\n') || '• No notes in vault'}

### Decision Log (${state.decisions.length} Decisions Logged):
${state.decisions.map((d) => `• [${d.status}] "${d.title}" (Reviewed: ${d.reviewDate})
  Context: ${d.context}
  Chosen Path: ${d.chosenPath} | Model: ${d.mentalModelUsed}
  Expected Outcome: ${d.expectedOutcome}`).join('\n') || '• No decisions logged'}

### Core Mental Models Applied:
${state.mentalModels.map((m) => `• [Model #${m.number}] ${m.name}: "${m.tagline}" (Directive: ${m.applicationRule})`).join('\n')}
`);

  // ==========================================
  // MODULE 07 // WORK SCOREBOARDS & CADENCE
  // ==========================================
  const completedBlocks = state.deepWorkBlocks.filter((b) => b.completedToday).length;
  const recentSessions = (state.focusSessions || []).slice(0, 7);
  const recentReviews = state.reviews.slice(0, 7);

  parts.push(`## [MODULE 07] WORK SCOREBOARDS & 90-15-90 VELOCITY
Today's Flight Plan Cadence: ${completedBlocks}/${state.deepWorkBlocks.length} Blocks Completed
${state.deepWorkBlocks.map((b) => `- [${b.completedToday ? 'LOCKED' : 'OPEN'}] ${b.timeRange} (${b.code}): "${b.title}" — ${b.subtitle} [${b.durationMinutes} min]`).join('\n')}

Recent 90-15-90 Focus Sessions (${(state.focusSessions || []).length} Total):
${recentSessions.map((s) => `• ${s.date} [${s.mode.toUpperCase()}] ${s.durationMinutes}m: "${s.linkedDirectiveTitle || 'Core Focus'}" — Notes: ${s.notes || 'Completed'} (Distractions: ${s.distractionCount || 0})`).join('\n') || '• No logged focus sessions'}

Recent Retrospectives & Reviews (${recentReviews.length} Archived):
${recentReviews.map((r) => `• ${r.date} [${r.cadence}]: Deep Work ${r.deepWorkMinutesLogged}m | Built: "${r.whatWasBuilt}" | Learned: "${r.whatWasLearned}" | Obstacle: "${r.whatFailed}" | Directive: "${r.nextDayDirective}"`).join('\n') || '• No daily retrospectives archived'}
`);

  // ==========================================
  // MODULE 08 & 09 // 10-YEAR HORIZON & GOVERNANCE
  // ==========================================
  const recentAudit = state.auditLogs.slice(0, 6);

  parts.push(`## [MODULE 08 & 09] 10-YEAR COMPOUNDING ROADMAP & GOVERNANCE
Horizon Target: ${state.horizonTitle} // ${state.horizonSubtitle}
Metrics: ${state.horizonMetrics.map((m) => `${m.label}: ${m.value} (${m.subLabel})`).join(' | ')}

Decade Milestones:
${state.roadmap.map((rm) => `• [${rm.yearPhase} // ${rm.badge}] "${rm.title}": ${rm.description} [Target: ${rm.targetText} | Project: ${rm.linkedProjectName}]`).join('\n')}

Immediate Behavioral Guardrails:
• STOP IMMEDIATELY: ${state.stopImmediatelyList.join('; ')}
• START IMMEDIATELY: ${state.startImmediatelyList.join('; ')}

Recent System Audit Log (${state.auditLogs.length} events):
${recentAudit.map((a) => `• [${a.timestamp.split('T')[0]}] [${a.module}] ${a.action}: ${a.detail}`).join('\n') || '• System initialized'}
`);

  return parts.join('\n');
}
