export type NavigationSection =
  | 'north-star'
  | 'capability-stack'
  | 'learning-engine'
  | 'milestone-projects'
  | 'financial-os'
  | 'ai-guardrails'
  | 'work-scoreboards'
  | 'horizon-flight-plan'
  | 'principle-70';

export type DashboardViewMode = 'single-tab' | 'continuous-blueprint' | 'roadmap' | 'scoreboard';

export interface HorizonMetric {
  id: string;
  label: string;
  value: string;
  subLabel: string;
  subValue: string;
  accent: 'primary' | 'secondary' | 'tertiary' | 'gold';
  updatedAt: string;
}

export interface CompetenceBadge {
  id: string;
  role: string;
  allocationText: string;
  percentage: number;
  accent: 'primary' | 'secondary' | 'tertiary' | 'neutral';
}

export interface Principle {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'engineering' | 'commercial' | 'capital' | 'cognition' | 'execution';
  accent: 'primary' | 'secondary' | 'tertiary';
  createdAt: string;
  updatedAt: string;
}

export type DirectiveSourceType = 'MILESTONE_PROJECT' | 'FINANCIAL_OS' | 'LEARNING_ENGINE' | 'CUSTOM';

export interface Goal {
  id: string;
  title: string;
  category: 'Engineering' | 'Commercial' | 'Financial' | 'Cognitive' | 'Physical';
  horizon: 'Today' | 'Q4 2026' | '1-Year' | '3-Year' | '10-Year';
  targetMetric: string;
  progress: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  linkedProjectCode?: string;
  linkedProjectName?: string;
  impactText?: string;
  sourceType?: DirectiveSourceType;
  sourceRefCode?: string;
  sourceProjectId?: string;
  sourceProjectStepId?: string;
  sourceSdlcPhase?: SDLCPhase;
  sourceFinancialStepId?: string;
  sourceLearningTopicId?: string;
  slotNumber?: 1 | 2 | 3 | 4;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPerformanceLog {
  id: string;
  date: string; // YYYY-MM-DD
  score: number; // 0 - 100 percentage
  grade: 'APEX' | 'HIGH' | 'NOMINAL' | 'AT_RISK' | 'CRITICAL';
  completedCount: number;
  totalCount: number;
  completedDirectives: {
    id: string;
    title: string;
    sourceType: DirectiveSourceType;
    sourceRef?: string;
  }[];
  missedDirectives: {
    id: string;
    title: string;
    sourceType: DirectiveSourceType;
    sourceRef?: string;
  }[];
  domainBreakdown: {
    milestoneProjects: { completed: number; total: number };
    financialOS: { completed: number; total: number };
    learningEngine: { completed: number; total: number };
    custom?: { completed: number; total: number };
  };
  streakCount: number;
  insights: string[];
  operatorNotes?: string;
  loggedAt: string;
}

export interface Objective {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CapabilityDomain {
  id: string;
  title: string;
  subtitle: string;
  allocation: string;
  tier: 'APEX' | 'CORE' | 'WING_LEFT' | 'WING_RIGHT' | 'BEDROCK';
  skills: {
    group: string;
    items: { name: string; mastered: boolean }[];
  }[];
  updatedAt: string;
}

export type LearningStageLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';

export interface LearningStageInfo {
  level: LearningStageLevel;
  name: string;
  shortRule: string;
  definition: string;
  objectives: string[];
  isCurrentStage?: boolean;
}

export type TopicImportance = 'P0' | 'P1' | 'P2';
export type TopicStatus = 'UNTOUCHED' | 'IN_PROGRESS' | 'MASTERED';

export interface LearningReview {
  id: string;
  topicId: string;
  rating: 'Forgot' | 'Hard' | 'Good' | 'Easy';
  notes: string;
  reviewedAt: string;
}

export interface LearningTopic {
  id: string;
  code: string;
  topic: string;
  importance: TopicImportance;
  status: TopicStatus;
  category?: string;
  subtitleTags?: string;
  progress?: number;
  targetLevel?: LearningStageLevel;
  stage: LearningStageLevel;
  stageLabel: string;
  intervalLabel: string;
  protocolAction: string;
  lastReviewed: string;
  nextReview: string;
  retentionState: 'OPTIMAL' | 'DUE_TODAY' | 'REINFORCE' | 'MASTERED';
  evidence: string[];
  linkedProjectId?: string;
  notes: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningExamQuestion {
  question: string;
  bloomLevel: LearningStageLevel;
  scenarioContext?: string;
  rubricPoints: string[];
  timeLimitSeconds?: number;
  isDiagnosticTriage?: boolean;
}

export interface LearningExamEvaluation {
  comprehensionScore: number;
  recommendedRating: 'Forgot' | 'Hard' | 'Good' | 'Easy';
  recommendedStage: LearningStageLevel;
  blindSpots: string[];
  verifiedStrengths: string[];
  feynmanCritique: string;
  confidencePct: number;
}

export interface DecomposedLearningTopic {
  subtitleTags: string;
  protocolAction: string;
  progressionRoadmap: { stage: LearningStageLevel; focus: string }[];
  failureModes: string[];
  blankPaperChallenge: string;
  suggestedProjectLink?: string;
}

export interface VerifiedEvidenceAudit {
  verified: boolean;
  confidenceScore: number;
  competenceTierAchieved: LearningStageLevel;
  artifactSummary: string;
  unverifiedAssumptions: string[];
  elevationRecommendation: string;
}

export interface LearningProjectSynergy {
  topicId: string;
  topicTitle: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  unblockedStepTitle: string;
  synergyReason: string;
  estimatedUnblockedMinutes: number;
}

export type SDLCPhase =
  | 'REQUIREMENTS'
  | 'ARCHITECTURE'
  | 'IMPLEMENTATION'
  | 'TESTING'
  | 'DEPLOYMENT'
  | 'MAINTENANCE';

export interface ProjectStep {
  id: string;
  projectId: string;
  title: string;
  sdlcPhase: SDLCPhase;
  estimatedDurationMinutes: number; // e.g. 45, 90, 180 mins
  completed: boolean;
  completedAt?: string;
  order: number;
  notes?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  targetDate: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  priority: 'P0' | 'P1' | 'P2';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectEvidence {
  id: string;
  type: 'REPOSITORY' | 'DEPLOYMENT' | 'DOCUMENTATION' | 'BENCHMARK' | 'NOTE';
  label: string;
  urlOrContent: string;
  createdAt: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  objective: string;
  status: 'COMPLETED' | 'IN PROGRESS' | 'QUEUED' | 'READY';
  phaseTag: 'FOUNDATION' | 'ACTIVE' | 'PLANNED' | 'FUTURE' | 'LONG TERM';
  spanText: string;
  startDate?: string;
  targetDeadline?: string;
  dailyCapacitySteps?: number;
  currentSDLCPhase?: SDLCPhase;
  steps?: ProjectStep[];
  progress: number;
  progressLabel: string;
  currentMilestone: string;
  nextAction: string;
  technologies: string[];
  skills: string[];
  notes: string;
  milestones: Milestone[];
  tasks: Task[];
  evidence: ProjectEvidence[];
  dodPassedIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DoDGateItem {
  id: string;
  code: string;
  label: string;
  description: string;
  passed: boolean;
}

export interface BusinessExperimentStep {
  id: string;
  stepNumber: string;
  title: string;
  detail: string;
  completed: boolean;
  productAction?: string;
}

export interface CommercialExperimentSpec {
  id: string;
  productOrServiceName: string;
  targetVertical: string;
  linkedProjectId?: string;
  targetPersona: string;
  coreHypothesis: string;
  pricingModel: string;
  grandSlamOffer: string;
  primaryMetric: string;
  status: 'DISCOVERY' | 'VALIDATING' | 'CONVERTED' | 'PIVOTED';
  updatedAt: string;
}

export interface BusinessLead {
  id: string;
  name: string;
  organization: string;
  bottleneck: string;
  stage: 'PROSPECT' | 'OUTREACH' | 'DIAGNOSTIC' | 'PROPOSAL' | 'CLOSED_WON';
  estimatedValueRand: number;
  nextAction: string;
  notes: string;
  convertedToLedger?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialTarget {
  id: string;
  stageLabel: string;
  titleRandUsd: string;
  subtitle: string;
  targetAmountRand: number;
  currentAmountRand: number;
  deadline: string;
  associatedCapability: string;
  autoSyncLedger?: boolean;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amountRand: number;
  date: string;
  isRecurring?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'CASH' | 'SAVINGS' | 'INVESTMENTS' | 'INFRASTRUCTURE' | 'EQUITY';
  valueRand: number;
  updatedAt: string;
}

export interface Liability {
  id: string;
  name: string;
  category: string;
  amountRand: number;
  interestRatePercent?: number;
  monthlyPaymentRand?: number;
  notes?: string;
  updatedAt: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  category: 'Architecture' | 'Algorithms' | 'Distributed Systems' | 'Commercial' | 'Mental Models';
  content: string;
  linkedProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  optionsConsidered: string;
  chosenPath: string;
  mentalModelUsed: string;
  expectedOutcome: string;
  actualOutcome?: string;
  status: 'ACTIVE' | 'REVIEWED' | 'SUPERSEDED';
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentalModel {
  id: string;
  number: string;
  name: string;
  tagline: string;
  applicationRule: string;
  accent: 'primary' | 'secondary' | 'tertiary' | 'outline';
}

export interface AILearningWorkflowStep {
  id: string;
  step: number;
  label: string;
  rule: string;
  description: string;
}

export interface AIInsight {
  id: string;
  actionType: string;
  title: string;
  summary: string;
  directives: string[];
  bottleneckIdentified: string;
  createdAt: string;
  source?: string;
  model?: string;
  crossModuleCorrelation?: string;
}

export interface DailyCadenceBlock {
  id: string;
  code: string;
  timeRange: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  completedToday: boolean;
  accent: 'primary' | 'secondary' | 'outline' | 'gold';
  updatedAt: string;
}

export interface Review {
  id: string;
  cadence: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: string;
  whatWasBuilt: string;
  whatWasLearned: string;
  whatFailed: string;
  nextDayDirective: string;
  deepWorkMinutesLogged: number;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. 06:00
  endTime: string; // e.g. 07:30
  durationMinutes: number;
  mode: 'deep1' | 'rest' | 'deep2' | 'custom';
  linkedDirectiveId?: string;
  linkedDirectiveTitle?: string;
  focusRating?: number; // 1 to 5
  distractionCount?: number;
  notes?: string;
  createdAt: string;
}

export interface ActiveFocusTimer {
  isRunning: boolean;
  mode: 'deep1' | 'rest' | 'deep2' | 'custom';
  totalDurationSeconds: number;
  targetEndTime: string | null; // ISO string timestamp for persistence across tab navigation
  remainingSeconds: number;
  linkedDirectiveId?: string;
  linkedDirectiveTitle?: string;
  startedAt?: string;
}

export interface RoadmapItem {
  id: string;
  yearPhase: string;
  badge: string;
  title: string;
  description: string;
  targetText: string;
  linkedProjectName: string;
  accent: 'primary' | 'secondary' | 'tertiary';
  isApex?: boolean;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  detail: string;
}

export interface MorningKickoffRecord {
  id: string;
  date: string;
  kickedOffAt: string;
  primaryIntent: string;
  targetDeepWorkMinutes: number;
  deployedDirectiveIds: string[];
  deferredCarriedOverCount: number;
}

export interface POSState {
  version: string;
  operatorName: string;
  todayPrimaryIntent?: string;
  morningKickoffs?: MorningKickoffRecord[];
  creedStages: { id: string; label: string; active: boolean; highlight?: boolean }[];
  activeCreedStageId: string;
  horizonTitle: string;
  horizonSubtitle: string;
  horizonMetrics: HorizonMetric[];
  northStarCorePrinciple: string;
  northStarSupporting: string;
  apexPhilosophyPrinciple: string;
  apexPhilosophySupporting: string;
  passiveAccumulationQuote: string;
  activeCapabilityQuote: string;
  competenceBadges: CompetenceBadge[];
  principles: Principle[];
  goals: Goal[];
  capabilityDomains: CapabilityDomain[];
  learningStages: LearningStageInfo[];
  currentLearningStage: LearningStageLevel;
  learningTopics: LearningTopic[];
  learningReviews: LearningReview[];
  projects: Project[];
  dodGateProtocol: DoDGateItem[];
  activeCommercialExperiment?: CommercialExperimentSpec;
  businessExperimentSteps: BusinessExperimentStep[];
  businessLeads: BusinessLead[];
  financialTargets: FinancialTarget[];
  transactions: Transaction[];
  assets: Asset[];
  liabilities: Liability[];
  prohibitedAiRules: string[];
  mandatoryAiRules: string[];
  aiLearningWorkflow: AILearningWorkflowStep[];
  mentalModels: MentalModel[];
  knowledgeNotes: KnowledgeNote[];
  decisions: Decision[];
  aiInsights: AIInsight[];
  deepWorkBlocks: DailyCadenceBlock[];
  dailySchedule: DailyCadenceBlock[];
  reviews: Review[];
  roadmap: RoadmapItem[];
  apexQuote: string;
  apexSubquote: string;
  stopImmediatelyList: string[];
  startImmediatelyList: string[];
  lastCommittedTimestamp: string;
  commitCount: number;
  auditLogs: AuditLogEntry[];
  dailyPerformanceLogs?: DailyPerformanceLog[];
  focusSessions?: FocusSession[];
  activeFocusTimer?: ActiveFocusTimer;
}
