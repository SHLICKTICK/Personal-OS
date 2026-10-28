/**
 * PERSONAL OS // Learning & Retention Engine 2.0
 * Domain models for Criterion-Based Rubrics, 7-Tier Engineering Taxonomy,
 * and Persistent Assessment Attempt Audits.
 */

import { LearningStageLevel } from './types';

export type CompetenceStatus =
  | 'NOT_ASSESSED'
  | 'IN_PROGRESS'
  | 'EVIDENCE_INSUFFICIENT'
  | 'DEVELOPING'
  | 'PROFICIENT'
  | 'REASSESSMENT_DUE';

export interface ScoringAnchor {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  description: string;
  criteriaEvidenceHint?: string;
}

export interface AssessmentCriterion {
  id: string;
  name: string;
  weight: number; // e.g. 1.0, 1.5, 2.0
  description: string;
  scoringAnchors: ScoringAnchor[];
}

export interface MisconceptionRule {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  remediationAdvice: string;
  isFatalToCompetence: boolean;
}

export interface DiagnosticArtifact {
  type: 'LOG_STREAM' | 'STACK_TRACE' | 'METRIC_GRAPH' | 'CODE_SNIPPET' | 'INCIDENT_TIMELINE';
  title: string;
  content: string;
  metadata?: Record<string, string | number>;
}

export interface AssessmentDefinition {
  id: string;
  competencyId: string;
  topicTitle: string;
  targetLevel: LearningStageLevel;
  learningObjective: string;
  assessmentPrompt: string;
  timeLimitSeconds?: number;
  prerequisites?: string[];
  diagnosticArtifacts?: DiagnosticArtifact[];
  bannedKeywordsForL6?: string[];
  referenceBenchmarkSolution: string;
  criteria: AssessmentCriterion[];
  criticalMisconceptions: MisconceptionRule[];
  passingScorePct: number; // default 75%
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface CriterionEvaluationResult {
  criterionId: string;
  score: 0 | 1 | 2 | 3 | 4;
  maxScore: number;
  weight: number;
  evidenceQuotes: string[];
  feedback: string;
  confidenceScore?: number;
}

export interface DetectedMisconception {
  misconceptionId: string;
  name: string;
  detectedQuote?: string;
  explanation: string;
  isFatalToCompetence: boolean;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  competencyId: string;
  targetLevel: LearningStageLevel;
  attemptNumber: number;
  learnerResponse: string;
  elapsedSeconds: number;
  confidenceSelfRating?: 1 | 2 | 3 | 4 | 5;
  rubricVersion: string;
  criterionResults: CriterionEvaluationResult[];
  weightedScorePct: number;
  passedPassingRules: boolean;
  detectedMisconceptions: DetectedMisconception[];
  feynmanCritique: string;
  verifiedStrengths: string[];
  missingMechanisms: string[];
  recommendedSM2Grade: 'Forgot' | 'Hard' | 'Good' | 'Easy';
  recommendedCompetenceStatus: CompetenceStatus;
  recommendedNextTask?: {
    type: 'relearn' | 'reinforce' | 'advance';
    targetLevel: LearningStageLevel;
    prompt: string;
    reason: string;
  };
  evaluationSource: 'GEMINI_AI' | 'DETERMINISTIC_FALLBACK';
  submittedAt: string;
}

export interface TopicCompetenceRecord {
  competencyId: string;
  levelStatuses: Record<LearningStageLevel, CompetenceStatus>;
  lastAttemptIdByLevel?: Partial<Record<LearningStageLevel, string>>;
  lastAssessedAtByLevel?: Partial<Record<LearningStageLevel, string>>;
  highestProficientLevel?: LearningStageLevel;
  updatedAt: string;
}
