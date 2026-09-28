export type NavigationSection =
  | 'north-star'
  | 'capability-stack'
  | 'learning-engine'
  | 'milestone-projects'
  | 'financial-os'
  | 'ai-guardrails'
  | 'work-scoreboards'
  | 'horizon-flight-plan'
  | 'principle-70'
  | 'goals'
  | 'knowledge'
  | 'decisions'
  | 'reviews'
  | 'ai-assistant';

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
  createdAt: string;
  updatedAt: string;
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
  status: 'COMPLETED' | 'IN PROGRESS' | 'QUEUED';
  phaseTag: 'FOUNDATION' | 'ACTIVE' | 'PLANNED' | 'FUTURE' | 'LONG TERM';
  spanText: string;
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
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  amountRand: number;
  date: string;
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

export interface POSState {
  version: string;
  operatorName: string;
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
}
