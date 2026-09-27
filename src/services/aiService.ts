import { AIInsight, POSState } from '../models/types';

export type AIQuickActionType =
  | 'ANALYZE_PROGRESS'
  | 'WHAT_NEXT'
  | 'REVIEW_LEARNING'
  | 'FIND_BOTTLENECK'
  | 'ANALYZE_PROJECTS'
  | 'SUMMARIZE_WEEK'
  | 'CUSTOM_QUERY';

export interface IAIService {
  runDiagnostic(actionType: AIQuickActionType, state: POSState, customQuery?: string): Promise<AIInsight>;
}

export class LocalTacticalAIService implements IAIService {
  async runDiagnostic(
    actionType: AIQuickActionType,
    state: POSState,
    customQuery?: string
  ): Promise<AIInsight> {
    await new Promise((resolve) => setTimeout(resolve, 140));

    const activeProject = state.projects.find((p) => p.status === 'IN PROGRESS') || state.projects[0];
    const openTasks = state.projects.flatMap((p) => p.tasks.filter((t) => !t.completed));
    const p0Tasks = openTasks.filter((t) => t.priority === 'P0');
    const dueTopics = state.learningTopics.filter(
      (t) => t.retentionState === 'DUE_TODAY' || t.retentionState === 'REINFORCE'
    );
    const totalIncome = state.transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amountRand, 0);
    const totalExpenses = state.transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amountRand, 0);
    const fcf = totalIncome - totalExpenses;
    const completedDeepBlocks = state.deepWorkBlocks.filter((b) => b.completedToday).length;

    const nowIso = new Date().toISOString();

    switch (actionType) {
      case 'ANALYZE_PROGRESS':
        return {
          id: `ai-${Date.now()}`,
          actionType: 'Analyze My Progress',
          title: 'Multi-Vector Capability & Compounding Diagnostic',
          summary: `Active Engine: ${activeProject.code} (${activeProject.title}) is at ${activeProject.progress}% completion with ${activeProject.dodPassedIds.length}/14 DoD gates verified. Monthly Free Cash Flow stands at R${fcf.toLocaleString()} with ${completedDeepBlocks}/${state.deepWorkBlocks.length} daily deep work blocks locked.`,
          directives: [
            `Close the remaining ${14 - activeProject.dodPassedIds.length} Definition of Done gates on ${activeProject.title} before initiating new feature branches.`,
            `Clear ${dueTopics.length} due spaced-retrieval topic(s) (${dueTopics.map((d) => d.code).join(', ') || 'None'}) to maintain Zero-Forget Policy compliance.`,
            `Advance Stage 2 Commercial Retainer target by converting ${state.businessLeads.length} active pipeline leads into diagnostic commitments.`,
          ],
          bottleneckIdentified:
            activeProject.dodPassedIds.length < 14
              ? `${activeProject.code} DoD Gate Verification (${activeProject.dodPassedIds.length}/14 passed)`
              : 'Commercial Outbound Volume (Step 04 of 7-Step Experiment Loop)',
          createdAt: nowIso,
        };

      case 'WHAT_NEXT':
        return {
          id: `ai-${Date.now()}`,
          actionType: 'What Should I Do Next?',
          title: 'Immediate High-Leverage Execution Sequence',
          summary: `Based on Theory of Bottlenecks (Mental Model #05) and current P0 queue (${p0Tasks.length} P0 tasks open), your highest-leverage 90-minute block is deterministic execution on ${activeProject.title}.`,
          directives: [
            p0Tasks[0]
              ? `1. Execute P0 Task: "${p0Tasks[0].title}" during your next 90-minute Deep Work Block.`
              : `1. Execute Next Action on ${activeProject.title}: "${activeProject.nextAction}".`,
            dueTopics[0]
              ? `2. Complete 15-min Blank-Page Recall on "${dueTopics[0].topic}" (${dueTopics[0].code}).`
              : '2. Log one new L5-L7 architectural synthesis note in the Knowledge Vault.',
            state.businessLeads[0]
              ? `3. Commercial Block (14:00): Follow up with ${state.businessLeads[0].name} (${state.businessLeads[0].organization}) — ${state.businessLeads[0].nextAction}.`
              : '3. Commercial Block (14:00): Send 10 direct outbound messages to target persona.',
          ],
          bottleneckIdentified: p0Tasks[0] ? p0Tasks[0].title : activeProject.nextAction,
          createdAt: nowIso,
        };

      case 'REVIEW_LEARNING':
        return {
          id: `ai-${Date.now()}`,
          actionType: 'Review My Learning',
          title: 'Anti-Decay Spaced Retrieval & Bloom L1–L7 Audit',
          summary: `Current Apex Target Stage: ${state.currentLearningStage}. Tracking ${state.learningTopics.length} active engineering topics across Day 0 to 6-Month intervals. ${dueTopics.length} topic(s) require immediate active reconstruction.`,
          directives: [
            ...dueTopics.map(
              (t) =>
                `[${t.code} // ${t.stage}] Reconstruct "${t.topic}" via ${t.protocolAction} without consulting reference notes.`
            ),
            'Promote any L3/L4 topic to L5/L6 only after attaching verifiable production code or Feynman writeup evidence.',
          ],
          bottleneckIdentified:
            dueTopics.length > 0
              ? `Pending Retrieval Queue: ${dueTopics.map((t) => t.code).join(', ')}`
              : 'Transitioning L5 Creation topics into L7 Live Outage Stress Tests',
          createdAt: nowIso,
        };

      case 'FIND_BOTTLENECK':
        return {
          id: `ai-${Date.now()}`,
          actionType: 'Find My Bottleneck',
          title: 'Theory of Constraints (Model #05) Primary Limiting Factor',
          summary: `System scan across Engineering, Commercial, and Cognitive pipelines indicates the single limiting constraint is between Build (${activeProject.progress}%) and Commercial Pre-Sale Validation (Step 04–06).`,
          directives: [
            `Do NOT start ${state.projects[2]?.title || 'Project 03'} until ${activeProject.title} passes all 14 DoD gates and secures its paying customer hook.`,
            'Eliminate context switching: lock phone in another room during Block 01 (06:00–08:00).',
            'Convert technical capability into commercial velocity by completing 5 diagnostic prospect conversations this week.',
          ],
          bottleneckIdentified: `Shipping ${activeProject.title} to 100% DoD & Closing Stage 2 Recurring Retainer`,
          createdAt: nowIso,
        };

      case 'ANALYZE_PROJECTS':
        return {
          id: `ai-${Date.now()}`,
          actionType: 'Analyze My Projects',
          title: '5-Milestone Engineering Pipeline & DoD Gate Telemetry',
          summary: `${state.projects.filter((p) => p.status === 'COMPLETED').length}/5 Milestone Projects completed; 1 active (${activeProject.title} at ${activeProject.progress}%); ${state.projects.filter((p) => p.status === 'QUEUED').length} queued in strict sequence.`,
          directives: state.projects.map(
            (p) =>
              `${p.code} (${p.title}) [${p.status} — ${p.progress}%]: Next → ${p.nextAction} (${p.dodPassedIds.length}/14 DoD gates).`
          ),
          bottleneckIdentified: `${activeProject.code}: ${activeProject.currentMilestone}`,
          createdAt: nowIso,
        };

      case 'SUMMARIZE_WEEK': {
        const totalDeepMins = state.reviews.reduce((acc, r) => acc + r.deepWorkMinutesLogged, 0);
        return {
          id: `ai-${Date.now()}`,
          actionType: 'Summarize My Week',
          title: 'Executive Weekly Compounding & Telemetry Digest',
          summary: `Logged ${state.reviews.length} structured execution review(s) (${totalDeepMins} total deep work minutes archived). Net Free Cash Flow is R${fcf.toLocaleString()} with ${state.auditLogs.length} verified operator actions.`,
          directives: [
            `Engineering Velocity: ${activeProject.title} advanced to ${activeProject.progress}% with ${openTasks.length} tasks remaining in queue.`,
            `Capital Allocation: R${fcf.toLocaleString()} surplus available for 100% reinvestment mandate (Compute, Skills, Compounding Index).`,
            'Schedule Sunday 30-minute Weekly Review to audit failed assumptions and lock Monday 06:00 Block 01.',
          ],
          bottleneckIdentified: 'Maintaining 100% Evening Review consistency across all 7 days',
          createdAt: nowIso,
        };
      }

      case 'CUSTOM_QUERY':
      default:
        return {
          id: `ai-${Date.now()}`,
          actionType: customQuery ? `Query: ${customQuery}` : 'Ask AI Force Multiplier',
          title: 'First-Principles Socratic & Architectural Analysis',
          summary: `Evaluated "${customQuery || 'System Status'}" against PERSONAL OS v4.8 guardrails (Learn → Attempt → Struggle → Ask AI → Critique → Implement → Test → Explain).`,
          directives: [
            '1. First Principles (Model #01): Strip the problem down to immutable inputs, state transitions, and latency/memory bounds.',
            `2. Active Project Context: Apply directly to ${activeProject.title} (${activeProject.technologies.join(', ')}) and verify with an automated test.`,
            '3. Adversarial Critique: Check for race conditions, partial failure states, and idempotency before merging.',
          ],
          bottleneckIdentified: 'Verify conceptual understanding at L5/L6 by explaining the mechanism without notes.',
          createdAt: nowIso,
        };
    }
  }
}

export const aiService: IAIService = new LocalTacticalAIService();
