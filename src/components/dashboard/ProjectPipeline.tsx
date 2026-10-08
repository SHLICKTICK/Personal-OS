import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  Layers,
  Calendar,
  Clock,
  Flame,
  Sparkles,
  Edit2,
  Check,
  Target,
  Cpu,
  ChevronDown,
  Zap,
  RotateCcw,
  Loader2,
  Wand2,
  ArrowRight,
  ChevronRight,
  Code,
  Server,
  Layout,
  AlertTriangle,
  Shield,
  Rocket,
  GitBranch,
  FileText,
  BarChart3,
  Play,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import {
  POSState,
  Project,
  ProjectStep,
  SDLCPhase,
} from '../../models/types';
import {
  HybridGeminiAIService,
  SDLC_ARCHETYPE_PRESETS,
  DecomposeProjectResult,
  DecomposedStepOutput,
} from '../../services/aiService';
import { WireframeSphere } from '../common/WireframeSphere';

const aiService = new HybridGeminiAIService();

const PHASE_QUICK_CHIPS: Record<SDLCPhase, { label: string; duration: number }[]> = {
  REQUIREMENTS: [
    { label: 'Specify functional scope, user workflows & boundaries', duration: 60 },
    { label: 'Draft API contracts & data serialization spec', duration: 45 },
    { label: 'Document threat matrix & role permissions', duration: 45 },
  ],
  ARCHITECTURE: [
    { label: 'Design relational database schema & indexes', duration: 60 },
    { label: 'Define API endpoint schemas (OpenAPI / JSON-RPC)', duration: 60 },
    { label: 'Architect state machine & error backoff retry logic', duration: 90 },
  ],
  IMPLEMENTATION: [
    { label: 'Implement core domain logic & service handlers', duration: 120 },
    { label: 'Build responsive UI views & reactive state bindings', duration: 90 },
    { label: 'Integrate external API hooks & data validation', duration: 60 },
  ],
  TESTING: [
    { label: 'Write unit test suite with 80%+ branch coverage', duration: 60 },
    { label: 'Build Playwright E2E regression test suite', duration: 90 },
    { label: 'Execute load & stress benchmark (<50ms latency)', duration: 45 },
  ],
  DEPLOYMENT: [
    { label: 'Configure multi-stage Dockerfile container build', duration: 45 },
    { label: 'Set up GitHub Actions CI/CD automated pipeline', duration: 60 },
    { label: 'Deploy to Cloud Run with live custom domain & SSL', duration: 30 },
  ],
  MAINTENANCE: [
    { label: 'Instrument structured logging & OpenTelemetry alerts', duration: 45 },
    { label: 'Perform disaster recovery & failover simulation drill', duration: 45 },
    { label: 'Draft developer quickstart guide & architecture docs', duration: 45 },
  ],
};

interface ProjectPipelineProps {
  state: POSState;
  onUpdateProject: (project: Project) => void;
  onToggleGlobalDoDGate: (gateId: string) => void;
  onAddProject?: (project: Project) => void;
  onNavigateToSection?: (section: any) => void;
}

const SDLC_PHASES: {
  phase: SDLCPhase;
  label: string;
  short: string;
  order: number;
  description: string;
}[] = [
  {
    phase: 'REQUIREMENTS',
    label: '1. Requirements & Scope',
    short: 'Requirements',
    order: 1,
    description: 'System boundaries, user stories, RFC criteria & DoD matrix',
  },
  {
    phase: 'ARCHITECTURE',
    label: '2. Architecture & Design',
    short: 'Architecture',
    order: 2,
    description: 'Schema modeling, network topology, threat model & API contracts',
  },
  {
    phase: 'IMPLEMENTATION',
    label: '3. Implementation & Build',
    short: 'Implementation',
    order: 3,
    description: 'Core engineering, business logic, integrations & UI components',
  },
  {
    phase: 'TESTING',
    label: '4. Testing & Verification',
    short: 'Testing',
    order: 4,
    description: 'Unit tests, Playwright E2E suites, benchmark & security audits',
  },
  {
    phase: 'DEPLOYMENT',
    label: '5. Production Deployment',
    short: 'Deployment',
    order: 5,
    description: 'CI/CD pipeline, cluster provisioning, zero-downtime cutover',
  },
  {
    phase: 'MAINTENANCE',
    label: '6. Maintenance & Runbook',
    short: 'Maintenance',
    order: 6,
    description: 'Telemetry alerts, log rotation, incident post-mortems & scaling',
  },
];

const POPULAR_TECH_SUGGESTIONS = [
  'TypeScript',
  'PostgreSQL',
  'Docker',
  'Redis',
  'Next.js',
  'Rust',
  'Kafka',
  'Tailwind',
  'Go',
  'Kubernetes',
  'Playwright',
  'Python',
  'GraphQL',
  'SQLite',
  'Supabase',
  'AWS',
];

export const ATOMIC_STEP_DURATIONS: { minutes: number; label: string }[] = [
  { minutes: 5, label: '5 mins' },
  { minutes: 10, label: '10 mins' },
  { minutes: 15, label: '15 mins' },
  { minutes: 30, label: '30 mins' },
  { minutes: 45, label: '45 mins' },
  { minutes: 60, label: '1 hour' },
  { minutes: 90, label: '1.5 hours' },
  { minutes: 120, label: '2 hours' },
  { minutes: 150, label: '2.5 hours' },
  { minutes: 180, label: '3 hours' },
  { minutes: 240, label: '4 hours' },
];

// Helper to format minutes into human-readable duration
function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '5 mins';
  const found = ATOMIC_STEP_DURATIONS.find((d) => d.minutes === minutes);
  if (found) return found.label;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${mins} mins`;
}

export const PRESET_TEMPLATES = [
  {
    id: 'tpl-saas',
    title: 'Production Full-Stack SaaS',
    code: 'P09',
    objective: 'Multi-tenant web application with Supabase/PostgreSQL, Stripe recurring subscriptions, OAuth PKCE, and Playwright E2E suites.',
    timeline: '8 Weeks',
    technologies: ['Next.js', 'PostgreSQL', 'Stripe', 'Tailwind', 'Playwright'],
    steps: [
      { title: 'Define multi-tenant boundary, pricing tiers & DoD criteria', phase: 'REQUIREMENTS' as SDLCPhase, minutes: 90 },
      { title: 'Design Postgres Row-Level Security (RLS) & DB schema migration', phase: 'ARCHITECTURE' as SDLCPhase, minutes: 120 },
      { title: 'Build OAuth authentication middleware & session token rotation', phase: 'IMPLEMENTATION' as SDLCPhase, minutes: 180 },
      { title: 'Implement Stripe webhook handler with Redis idempotency locks', phase: 'IMPLEMENTATION' as SDLCPhase, minutes: 120 },
      { title: 'Author Playwright E2E suite verifying tenant isolation boundary', phase: 'TESTING' as SDLCPhase, minutes: 90 },
      { title: 'Configure staging cluster, zero-downtime cutover & DNS failover', phase: 'DEPLOYMENT' as SDLCPhase, minutes: 60 },
    ],
  },
  {
    id: 'tpl-microservice',
    title: 'High-Throughput Microservice',
    code: 'P10',
    objective: 'Distributed event processor in Go/Rust with Redis connection pooling, Kafka consumers, and sub-10ms response latency.',
    timeline: '6 Weeks',
    technologies: ['Go', 'Redis', 'Kafka', 'Docker', 'Prometheus'],
    steps: [
      { title: 'Specify 10k req/s SLA, partition schemas & dead-letter queue spec', phase: 'REQUIREMENTS' as SDLCPhase, minutes: 60 },
      { title: 'Design Protocol Buffer contracts, memory buffer & backoff retry logic', phase: 'ARCHITECTURE' as SDLCPhase, minutes: 90 },
      { title: 'Implement concurrent worker group & graceful SIGTERM shutdown', phase: 'IMPLEMENTATION' as SDLCPhase, minutes: 180 },
      { title: 'Run chaos injection drill & memory leak benchmark under heavy load', phase: 'TESTING' as SDLCPhase, minutes: 90 },
      { title: 'Configure multi-stage Docker build & Helm charts for deployment', phase: 'DEPLOYMENT' as SDLCPhase, minutes: 60 },
      { title: 'Set up Prometheus scrape endpoints & Grafana latency alerts', phase: 'MAINTENANCE' as SDLCPhase, minutes: 45 },
    ],
  },
  {
    id: 'tpl-ai-agent',
    title: 'Personal Local AI Orchestrator',
    code: 'P11',
    objective: 'Local-first executive agent connecting file system indexing, Gemini Interactions API, SQLite memory, and proactive terminal cron jobs.',
    timeline: '4 Weeks',
    technologies: ['TypeScript', 'Node.js', 'Gemini API', 'SQLite', 'Vector DB'],
    steps: [
      { title: 'Map tool-use capabilities, function schema contracts & security jailbreaks', phase: 'REQUIREMENTS' as SDLCPhase, minutes: 60 },
      { title: 'Architect SQLite vector memory index & RAG chunking algorithm', phase: 'ARCHITECTURE' as SDLCPhase, minutes: 90 },
      { title: 'Build streaming interaction dispatcher & terminal REPL shell', phase: 'IMPLEMENTATION' as SDLCPhase, minutes: 150 },
      { title: 'Test grounding accuracy, token latency & context compression', phase: 'TESTING' as SDLCPhase, minutes: 60 },
      { title: 'Package daemon supervisor into system background service', phase: 'DEPLOYMENT' as SDLCPhase, minutes: 45 },
      { title: 'Establish log pruning & automated model parameter tuning', phase: 'MAINTENANCE' as SDLCPhase, minutes: 30 },
    ],
  },
  {
    id: 'tpl-mobile',
    title: 'Offline-First Mobile Companion',
    code: 'P12',
    objective: 'React Native / Expo mobile application with WatermelonDB local SQLite persistence, biometric enclave auth, and 60fps list virtualization.',
    timeline: '8 Weeks',
    technologies: ['React Native', 'Expo', 'WatermelonDB', 'TypeScript', 'SQLite'],
    steps: [
      { title: 'Define offline delta-sync conflict resolution state machine', phase: 'REQUIREMENTS' as SDLCPhase, minutes: 90 },
      { title: 'Design local SQLite schema & biometrics hardware keystore interface', phase: 'ARCHITECTURE' as SDLCPhase, minutes: 120 },
      { title: 'Implement background sync mutation queue & airplane mode cache', phase: 'IMPLEMENTATION' as SDLCPhase, minutes: 210 },
      { title: 'Stress test clock-drift conflicts & FPS profiling on physical device', phase: 'TESTING' as SDLCPhase, minutes: 90 },
      { title: 'Generate signed Android APK and verify push notification pipeline', phase: 'DEPLOYMENT' as SDLCPhase, minutes: 60 },
      { title: 'Instrument Sentry mobile crash reporting & offline log triage', phase: 'MAINTENANCE' as SDLCPhase, minutes: 45 },
    ],
  },
  {
    id: 'tpl-devops',
    title: 'DevOps & Infrastructure Platform',
    code: 'P13',
    objective: 'Automated infrastructure as code using Terraform, multi-region Cloud Run / AWS ECS, GitHub Actions CI/CD, and zero-trust IAM.',
    timeline: '4 Weeks',
    technologies: ['Terraform', 'AWS', 'Docker', 'GitHub Actions', 'Cloud Run'],
    steps: [
      { title: 'Document zero-trust IAM policy, VPC subnet topology & compliance rules', phase: 'REQUIREMENTS' as SDLCPhase, minutes: 60 },
      { title: 'Write modular Terraform definitions for VPC, Cloud SQL & KMS keys', phase: 'ARCHITECTURE' as SDLCPhase, minutes: 90 },
      { title: 'Implement GitHub Actions matrix CI/CD pipeline with automated rollbacks', phase: 'IMPLEMENTATION' as SDLCPhase, minutes: 120 },
      { title: 'Execute simulated regional disaster recovery failover drill', phase: 'TESTING' as SDLCPhase, minutes: 90 },
      { title: 'Deploy production ingress with Cloudflare SSL & DDoS protection', phase: 'DEPLOYMENT' as SDLCPhase, minutes: 45 },
      { title: 'Audit SOC-2 access logs & configure automated secret rotation', phase: 'MAINTENANCE' as SDLCPhase, minutes: 45 },
    ],
  },
];

export const ProjectPipeline: React.FC<ProjectPipelineProps> = ({
  state,
  onUpdateProject,
  onToggleGlobalDoDGate,
  onAddProject,
  onNavigateToSection,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Pipeline Filter State
  const [pipelineFilter, setPipelineFilter] = useState<'ALL' | 'BACKLOG' | 'READY' | 'ACTIVE' | 'VERIFY'>('ALL');

  // Aux Modals State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDependencyMapModal, setShowDependencyMapModal] = useState(false);

  // New Project Form State
  const [newProjectCode, setNewProjectCode] = useState('P08');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectObjective, setNewProjectObjective] = useState('');
  const [newProjectTimeline, setNewProjectTimeline] = useState('6–10 weeks');
  const [newProjectTechs, setNewProjectTechs] = useState('TypeScript, React, Node.js');

  // Time Span Editing State
  const [isEditingTimeSpan, setIsEditingTimeSpan] = useState(false);
  const [editStartDate, setEditStartDate] = useState('');
  const [editTargetDeadline, setEditTargetDeadline] = useState('');
  const [editSpanText, setEditSpanText] = useState('');
  const [editDailyCapacity, setEditDailyCapacity] = useState(2);

  // Technology Editing State
  const [newTechInput, setNewTechInput] = useState('');

  // Step Creation State
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepPhase, setNewStepPhase] = useState<SDLCPhase>('IMPLEMENTATION');
  const [newStepDurationMinutes, setNewStepDurationMinutes] = useState(90);
  const [newStepNotes, setNewStepNotes] = useState('');

  // Step Editing State
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStepDuration, setEditStepDuration] = useState(90);
  const [editStepPhase, setEditStepPhase] = useState<SDLCPhase>('IMPLEMENTATION');

  // Filter Steps By Phase
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<'ALL' | SDLCPhase>('ALL');

  // Legacy Task & Milestone Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'P0' | 'P1' | 'P2'>('P0');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newEvidenceLabel, setNewEvidenceLabel] = useState('');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');

  // AI & Preset Decomposition State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState<DecomposeProjectResult | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);

  // Project Info (Title & Objective/Description) Editing State
  const [isEditingProjectInfo, setIsEditingProjectInfo] = useState(false);
  const [editProjectTitle, setEditProjectTitle] = useState('');
  const [editProjectObjective, setEditProjectObjective] = useState('');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Active Hero Project Selector State
  const [selectedHeroCode, setSelectedHeroCode] = useState<string | null>(null);

  // Timeline Filter State
  const [timelineStatusFilter, setTimelineStatusFilter] = useState<'ALL' | 'ACTIVE' | 'READY' | 'QUEUED' | 'COMPLETED'>('ALL');

  // Dependency Map State
  const [projectDependencies, setProjectDependencies] = useState<Record<string, string[]>>({
    'proj-2': ['proj-1', 'proj-5'],
    'proj-3': ['proj-2'],
    'proj-4': ['proj-2'],
    'proj-6': ['proj-1', 'proj-2'],
    'proj-7': ['proj-1', 'proj-2', 'proj-4'],
  });
  const [dependencyFilter, setDependencyFilter] = useState<'ALL' | 'BLOCKED' | 'CRITICAL'>('ALL');

  // Dynamic project metrics computed from real state
  const projectMetrics = useMemo(() => {
    const projects = state.projects || [];
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'IN PROGRESS');
    const ready = projects.filter(
      (p) =>
        (p.status === 'READY' || p.phaseTag === 'PLANNED') &&
        p.status !== 'IN PROGRESS' &&
        p.status !== 'COMPLETED'
    );
    const queued = projects.filter(
      (p) =>
        p.status === 'QUEUED' ||
        (p.phaseTag === 'FUTURE' && p.status !== 'IN PROGRESS' && p.status !== 'COMPLETED')
    );
    const completed = projects.filter((p) => p.status === 'COMPLETED');

    const overallProgress =
      total > 0
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total)
        : 0;

    return {
      total,
      activeCount: active.length,
      readyCount: ready.length,
      queuedCount: queued.length,
      completedCount: completed.length,
      overallProgress,
      active,
      ready,
      queued,
      completed,
    };
  }, [state.projects]);

  // Dynamic Kanban lanes
  const kanbanLanes = useMemo(() => {
    const projects = state.projects || [];
    const active = projects.filter((p) => p.status === 'IN PROGRESS');
    const verify = projects.filter(
      (p) =>
        p.status === 'COMPLETED' ||
        p.currentSDLCPhase === 'TESTING' ||
        p.currentSDLCPhase === 'MAINTENANCE'
    );
    const ready = projects.filter(
      (p) =>
        !active.some((a) => a.id === p.id) &&
        !verify.some((v) => v.id === p.id) &&
        (p.phaseTag === 'PLANNED' || (p.steps && p.steps.length > 0 && !p.steps.some((s) => s.completed) && p.phaseTag !== 'FUTURE'))
    );
    const backlog = projects.filter(
      (p) =>
        !active.some((a) => a.id === p.id) &&
        !verify.some((v) => v.id === p.id) &&
        !ready.some((r) => r.id === p.id)
    );

    return {
      active,
      ready,
      backlog,
      verify,
    };
  }, [state.projects]);

  // Dynamic Hero Project
  const heroProject = useMemo(() => {
    const projects = state.projects || [];
    if (selectedHeroCode) {
      const match = projects.find(
        (p) =>
          p.code.toLowerCase().includes(selectedHeroCode.toLowerCase()) ||
          p.id === selectedHeroCode
      );
      if (match) return match;
    }
    return (
      projects.find((p) => p.status === 'IN PROGRESS') ||
      projects[0] ||
      null
    );
  }, [state.projects, selectedHeroCode]);

  // Upcoming Milestones dynamically extracted from projects
  const upcomingMilestones = useMemo(() => {
    const list: {
      id: string;
      project: Project;
      code: string;
      title: string;
      eta: string;
      completed: boolean;
      isMilestone?: boolean;
    }[] = [];

    (state.projects || []).forEach((p) => {
      // Uncompleted project milestones
      (p.milestones || []).filter((m) => !m.completed).forEach((m) => {
        list.push({
          id: m.id,
          project: p,
          code: p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4),
          title: m.title,
          eta: m.targetDate ? `Due ${m.targetDate}` : 'Upcoming',
          completed: false,
          isMilestone: true,
        });
      });

      // Next uncompleted step
      const nextStep = (p.steps || []).find((s) => !s.completed);
      if (nextStep && !list.some((item) => item.project.id === p.id)) {
        list.push({
          id: nextStep.id,
          project: p,
          code: p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4),
          title: nextStep.title,
          eta: `~${formatDuration(nextStep.estimatedDurationMinutes || 60)}`,
          completed: false,
          isMilestone: false,
        });
      }
    });

    return list.slice(0, 6);
  }, [state.projects]);

  // Advance project by executing next step
  const handleAdvanceProjectNextStep = (project: Project) => {
    const uncompletedStep = (project.steps || []).find((s) => !s.completed);
    if (!uncompletedStep) {
      onUpdateProject({
        ...project,
        status: 'COMPLETED',
        progress: 100,
        progressLabel: '100% Passed',
        updatedAt: new Date().toISOString(),
      });
      showToast(`${project.code}: All steps completed & verified!`);
      return;
    }
    handleToggleStep(project, uncompletedStep.id);
    showToast(`Executed: "${uncompletedStep.title}" on ${project.code}`);
  };

  // Move project status / lane
  const handleMoveProjectStatus = (
    project: Project,
    targetStatus: 'QUEUED' | 'READY' | 'IN PROGRESS' | 'COMPLETED'
  ) => {
    let phaseTag: Project['phaseTag'] = project.phaseTag;
    if (targetStatus === 'IN PROGRESS') phaseTag = 'ACTIVE';
    else if (targetStatus === 'READY') phaseTag = 'PLANNED';
    else if (targetStatus === 'QUEUED') phaseTag = 'FUTURE';
    else if (targetStatus === 'COMPLETED') phaseTag = 'FOUNDATION';

    onUpdateProject({
      ...project,
      status: targetStatus === 'READY' ? 'QUEUED' : targetStatus,
      phaseTag,
      updatedAt: new Date().toISOString(),
    });
    showToast(`${project.code} moved to ${targetStatus}`);
  };

  // Instantiate Archetype Template
  const handleInstantiateTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    const newId = `proj-${Date.now()}`;
    const newSteps: ProjectStep[] = tpl.steps.map((s, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      projectId: newId,
      title: s.title,
      sdlcPhase: s.phase,
      estimatedDurationMinutes: s.minutes,
      completed: false,
      order: idx + 1,
    }));

    const newProject: Project = {
      id: newId,
      code: `P0${(state.projects || []).length + 1}`,
      title: tpl.title,
      objective: tpl.objective,
      status: 'QUEUED',
      phaseTag: 'PLANNED',
      spanText: `Span: ${tpl.timeline}`,
      startDate: new Date().toISOString().split('T')[0],
      targetDeadline: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      dailyCapacitySteps: 2,
      currentSDLCPhase: 'REQUIREMENTS',
      steps: newSteps,
      progress: 0,
      progressLabel: `0/${newSteps.length} Steps (0%)`,
      currentMilestone: tpl.steps[0]?.title || 'Requirements Definition',
      nextAction: tpl.steps[0]?.title || 'Scope system boundaries',
      technologies: tpl.technologies,
      skills: ['Software Architecture', 'System Design', 'Testing', 'Verification'],
      notes: 'Instantiated from battle-tested production archetype template.',
      milestones: [
        {
          id: `m-${newId}-1`,
          projectId: newId,
          title: tpl.steps[0]?.title || 'Requirements Definition',
          completed: false,
          targetDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        },
      ],
      tasks: [],
      evidence: [],
      dodPassedIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddProject) {
      onAddProject(newProject);
    } else {
      onUpdateProject(newProject);
    }

    setShowTemplatesModal(false);
    showToast(`Template instantiated: "${tpl.title}" added to pipeline!`);
    openProjectModal(newProject);
  };

  // Toggle Dependency between projects
  const handleToggleDependency = (targetProjId: string, prerequisiteId: string) => {
    setProjectDependencies((prev) => {
      const current = prev[targetProjId] || [];
      const updated = current.includes(prerequisiteId)
        ? current.filter((id) => id !== prerequisiteId)
        : [...current, prerequisiteId];
      return {
        ...prev,
        [targetProjId]: updated,
      };
    });
    showToast('Updated project dependency link');
  };

  const selectedProject = state.projects.find((p) => p.id === selectedProjectId) || null;

  // Open modal and initialize editable time span states
  const openProjectModal = (proj: Project) => {
    setSelectedProjectId(proj.id);
    setIsEditingTimeSpan(false);
    setIsEditingProjectInfo(false);
    setEditProjectTitle(proj.title);
    setEditProjectObjective(proj.objective);
    setEditStartDate(proj.startDate || '2026-09-01');
    setEditTargetDeadline(proj.targetDeadline || '2026-10-31');
    setEditSpanText(proj.spanText || 'Span: 8 Weeks');
    setEditDailyCapacity(proj.dailyCapacitySteps || 2);
    setEditingStepId(null);
    setSelectedPhaseFilter('ALL');
    setNewTechInput('');
    setShowAiModal(false);
    setAiResult(null);
    setPresetDropdownOpen(false);
  };

  // Save Project Info (Title & Objective)
  const handleSaveProjectInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProject || !editProjectTitle.trim()) return;

    onUpdateProject({
      ...selectedProject,
      title: editProjectTitle.trim(),
      objective: editProjectObjective.trim(),
      updatedAt: new Date().toISOString(),
    });

    setIsEditingProjectInfo(false);
  };

  // AI Decomposition Trigger
  const handleTriggerAiDecompose = async () => {
    if (!selectedProject) return;
    setIsGeneratingAI(true);
    try {
      const result = await aiService.decomposeProjectSteps({
        title: selectedProject.title,
        objective: selectedProject.objective,
        technologies: selectedProject.technologies,
        targetDeadline: selectedProject.targetDeadline || selectedProject.spanText,
      });
      setAiResult(result);
      setShowAiModal(true);
    } catch (err) {
      console.error('Failed to decompose project steps:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Apply Generated or Preset Steps
  const handleApplyGeneratedSteps = (mode: 'REPLACE' | 'APPEND', stepsToApply: DecomposedStepOutput[]) => {
    if (!selectedProject) return;
    const now = Date.now();
    const newSteps: ProjectStep[] = stepsToApply.map((s, idx) => ({
      id: `step-${now}-${idx}`,
      projectId: selectedProject.id,
      title: s.title,
      sdlcPhase: s.sdlcPhase,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      completed: false,
      order: mode === 'REPLACE' ? idx + 1 : (selectedProject.steps || []).length + idx + 1,
    }));

    const finalSteps = mode === 'REPLACE' ? newSteps : [...(selectedProject.steps || []), ...newSteps];
    const totalCount = finalSteps.length;
    const completedCount = finalSteps.filter((s) => s.completed).length;
    const computedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onUpdateProject({
      ...selectedProject,
      steps: finalSteps,
      progress: computedProgress,
      progressLabel: totalCount > 0 ? `${completedCount}/${totalCount} Steps (${computedProgress}%)` : 'No Steps Defined',
      status: computedProgress === 100 ? 'COMPLETED' : computedProgress > 0 ? 'IN PROGRESS' : 'QUEUED',
      updatedAt: new Date().toISOString(),
    });

    setShowAiModal(false);
    setAiResult(null);
    setPresetDropdownOpen(false);
  };

  // Quick Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = SDLC_ARCHETYPE_PRESETS.find((p) => p.id === presetId);
    if (!found || !selectedProject) return;

    if ((selectedProject.steps || []).length === 0) {
      handleApplyGeneratedSteps('REPLACE', found.steps);
    } else {
      setAiResult({
        architectureSummary: found.description,
        steps: found.steps,
        source: 'preset-heuristic',
      });
      setShowAiModal(true);
    }
    setPresetDropdownOpen(false);
  };

  // Quick Chip Add
  const handleAddQuickChip = (title: string, phase: SDLCPhase, duration: number) => {
    if (!selectedProject) return;
    const currentSteps = selectedProject.steps || [];
    const newStep: ProjectStep = {
      id: `step-${Date.now()}`,
      projectId: selectedProject.id,
      title,
      sdlcPhase: phase,
      estimatedDurationMinutes: duration,
      completed: false,
      order: currentSteps.length + 1,
    };

    const updatedSteps = [...currentSteps, newStep];
    const totalCount = updatedSteps.length;
    const completedCount = updatedSteps.filter((s) => s.completed).length;
    const computedProgress = Math.round((completedCount / totalCount) * 100);

    onUpdateProject({
      ...selectedProject,
      steps: updatedSteps,
      progress: computedProgress,
      progressLabel: `${completedCount}/${totalCount} Steps (${computedProgress}%)`,
      status: computedProgress === 100 ? 'COMPLETED' : computedProgress > 0 ? 'IN PROGRESS' : 'QUEUED',
      updatedAt: new Date().toISOString(),
    });
  };

  // Calculations for Time Span & Cadence
  const timeMetrics = useMemo(() => {
    if (!selectedProject) return null;
    const start = selectedProject.startDate ? new Date(selectedProject.startDate) : new Date();
    const end = selectedProject.targetDeadline ? new Date(selectedProject.targetDeadline) : new Date(Date.now() + 60 * 86400000);
    const now = new Date();

    const diffMs = end.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const totalSpanMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.ceil(totalSpanMs / (1000 * 60 * 60 * 24)));
    const totalWeeks = (totalDays / 7).toFixed(1);

    const steps = selectedProject.steps || [];
    const totalSteps = steps.length;
    const completedSteps = steps.filter((s) => s.completed).length;
    const remainingSteps = totalSteps - completedSteps;

    const dailyTarget = selectedProject.dailyCapacitySteps || 2;
    const daysNeededAtPace = remainingSteps > 0 ? Math.ceil(remainingSteps / dailyTarget) : 0;

    // Remaining total duration in minutes
    const remainingMinutes = steps
      .filter((s) => !s.completed)
      .reduce((acc, s) => acc + (s.estimatedDurationMinutes || 60), 0);

    // Today's target steps (first N uncompleted steps)
    const todayTargetSteps = steps.filter((s) => !s.completed).slice(0, dailyTarget);
    const todayTotalMinutes = todayTargetSteps.reduce(
      (acc, s) => acc + (s.estimatedDurationMinutes || 60),
      0
    );

    return {
      daysRemaining,
      totalDays,
      totalWeeks,
      totalSteps,
      completedSteps,
      remainingSteps,
      dailyTarget,
      daysNeededAtPace,
      remainingMinutes,
      todayTargetSteps,
      todayTotalMinutes,
    };
  }, [selectedProject]);

  // Handle Save Time Span
  const handleSaveTimeSpan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    let computedSpanText = editSpanText.trim();
    if (!computedSpanText && editStartDate && editTargetDeadline) {
      computedSpanText = `Span: ${editStartDate} → ${editTargetDeadline}`;
    }

    onUpdateProject({
      ...selectedProject,
      startDate: editStartDate,
      targetDeadline: editTargetDeadline,
      spanText: computedSpanText,
      dailyCapacitySteps: Number(editDailyCapacity) || 2,
      updatedAt: new Date().toISOString(),
    });

    setIsEditingTimeSpan(false);
  };

  // Quick Preset Helper for Time Span
  const applyTimeSpanPreset = (weeks: number) => {
    const start = editStartDate ? new Date(editStartDate) : new Date();
    const target = new Date(start.getTime() + weeks * 7 * 86400000);
    const startStr = start.toISOString().split('T')[0];
    const targetStr = target.toISOString().split('T')[0];

    setEditStartDate(startStr);
    setEditTargetDeadline(targetStr);
    setEditSpanText(`Span: ${weeks} Weeks (${startStr} - ${targetStr})`);
  };

  // Technology Handlers
  const handleAddTech = (techToAdd?: string) => {
    if (!selectedProject) return;
    const tag = (techToAdd || newTechInput).trim();
    if (!tag) return;
    if (selectedProject.technologies.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setNewTechInput('');
      return;
    }
    const updatedTechnologies = [...selectedProject.technologies, tag];
    onUpdateProject({
      ...selectedProject,
      technologies: updatedTechnologies,
      updatedAt: new Date().toISOString(),
    });
    setNewTechInput('');
  };

  const handleRemoveTech = (techToRemove: string) => {
    if (!selectedProject) return;
    const updatedTechnologies = selectedProject.technologies.filter(
      (t) => t !== techToRemove
    );
    onUpdateProject({
      ...selectedProject,
      technologies: updatedTechnologies,
      updatedAt: new Date().toISOString(),
    });
  };

  // Step Completion Toggle - ITERATES THE PROGRESS BAR!
  const handleToggleStep = (project: Project, stepId: string) => {
    const currentSteps = project.steps || [];
    const updatedSteps = currentSteps.map((s) => {
      if (s.id !== stepId) return s;
      const willBeCompleted = !s.completed;
      return {
        ...s,
        completed: willBeCompleted,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      };
    });

    // Compute progress strictly from step completion!
    const totalCount = updatedSteps.length;
    const completedCount = updatedSteps.filter((s) => s.completed).length;
    const computedProgress =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : project.progress;

    const newStatus =
      computedProgress === 100
        ? 'COMPLETED'
        : computedProgress > 0
        ? 'IN PROGRESS'
        : 'QUEUED';

    const newProgressLabel = `${completedCount}/${totalCount} Steps (${computedProgress}%)`;

    onUpdateProject({
      ...project,
      steps: updatedSteps,
      progress: computedProgress,
      progressLabel: newProgressLabel,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Step to Project
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newStepTitle.trim()) return;

    const currentSteps = selectedProject.steps || [];
    const newStep: ProjectStep = {
      id: `step-${Date.now()}`,
      projectId: selectedProject.id,
      title: newStepTitle.trim(),
      sdlcPhase: newStepPhase,
      estimatedDurationMinutes: Number(newStepDurationMinutes) || 60,
      completed: false,
      order: currentSteps.length + 1,
      notes: newStepNotes.trim() || undefined,
    };

    const updatedSteps = [...currentSteps, newStep];
    const totalCount = updatedSteps.length;
    const completedCount = updatedSteps.filter((s) => s.completed).length;
    const computedProgress = Math.round((completedCount / totalCount) * 100);

    onUpdateProject({
      ...selectedProject,
      steps: updatedSteps,
      progress: computedProgress,
      progressLabel: `${completedCount}/${totalCount} Steps (${computedProgress}%)`,
      updatedAt: new Date().toISOString(),
    });

    setNewStepTitle('');
    setNewStepNotes('');
  };

  // Edit Step
  const handleSaveEditStep = (stepId: string) => {
    if (!selectedProject || !editStepTitle.trim()) return;
    const currentSteps = selectedProject.steps || [];
    const updatedSteps = currentSteps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            title: editStepTitle.trim(),
            estimatedDurationMinutes: Number(editStepDuration) || 60,
            sdlcPhase: editStepPhase,
          }
        : s
    );

    onUpdateProject({
      ...selectedProject,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    });
    setEditingStepId(null);
  };

  // Delete Step
  const handleDeleteStep = (project: Project, stepId: string) => {
    const currentSteps = project.steps || [];
    const updatedSteps = currentSteps.filter((s) => s.id !== stepId);

    const totalCount = updatedSteps.length;
    const completedCount = updatedSteps.filter((s) => s.completed).length;
    const computedProgress =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    onUpdateProject({
      ...project,
      steps: updatedSteps,
      progress: computedProgress,
      progressLabel:
        totalCount > 0
          ? `${completedCount}/${totalCount} Steps (${computedProgress}%)`
          : 'No Steps Defined',
      updatedAt: new Date().toISOString(),
    });
  };

  // Auto-generate 6 SDLC steps template for project
  const handleGenerateSDLCTemplate = () => {
    if (!selectedProject) return;
    const templateSteps: ProjectStep[] = [
      {
        id: `step-${Date.now()}-1`,
        projectId: selectedProject.id,
        title: `Define specifications, user workflows & DoD acceptance criteria for ${selectedProject.title}`,
        sdlcPhase: 'REQUIREMENTS',
        estimatedDurationMinutes: 90,
        completed: false,
        order: 1,
      },
      {
        id: `step-${Date.now()}-2`,
        projectId: selectedProject.id,
        title: `Design data models, API schema contracts & security isolation boundaries`,
        sdlcPhase: 'ARCHITECTURE',
        estimatedDurationMinutes: 120,
        completed: false,
        order: 2,
      },
      {
        id: `step-${Date.now()}-3`,
        projectId: selectedProject.id,
        title: `Implement core domain logic, database operations & service handlers`,
        sdlcPhase: 'IMPLEMENTATION',
        estimatedDurationMinutes: 180,
        completed: false,
        order: 3,
      },
      {
        id: `step-${Date.now()}-4`,
        projectId: selectedProject.id,
        title: `Write automated unit tests & Playwright E2E regression suite`,
        sdlcPhase: 'TESTING',
        estimatedDurationMinutes: 90,
        completed: false,
        order: 4,
      },
      {
        id: `step-${Date.now()}-5`,
        projectId: selectedProject.id,
        title: `Execute zero-downtime deployment, configure DNS & telemetry alarms`,
        sdlcPhase: 'DEPLOYMENT',
        estimatedDurationMinutes: 60,
        completed: false,
        order: 5,
      },
      {
        id: `step-${Date.now()}-6`,
        projectId: selectedProject.id,
        title: `Perform load verification, document operational runbook & verify logs`,
        sdlcPhase: 'MAINTENANCE',
        estimatedDurationMinutes: 45,
        completed: false,
        order: 6,
      },
    ];

    onUpdateProject({
      ...selectedProject,
      steps: templateSteps,
      progress: 0,
      progressLabel: '0/6 Steps (0%)',
      currentSDLCPhase: 'REQUIREMENTS',
      updatedAt: new Date().toISOString(),
    });
  };

  // Update SDLC Phase of Project
  const handleChangeProjectSDLCPhase = (phase: SDLCPhase) => {
    if (!selectedProject) return;
    onUpdateProject({
      ...selectedProject,
      currentSDLCPhase: phase,
      updatedAt: new Date().toISOString(),
    });
  };

  // Legacy Task Handlers
  const handleToggleProjectTask = (project: Project, taskId: string) => {
    const updatedTasks = project.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
    );
    onUpdateProject({
      ...project,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddProjectTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;
    const now = new Date().toISOString();
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: selectedProject.id,
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      createdAt: now,
      updatedAt: now,
    };
    onUpdateProject({
      ...selectedProject,
      tasks: [...selectedProject.tasks, newTask],
      updatedAt: now,
    });
    setNewTaskTitle('');
  };

  const handleDeleteProjectTask = (project: Project, taskId: string) => {
    onUpdateProject({
      ...project,
      tasks: project.tasks.filter((t) => t.id !== taskId),
      updatedAt: new Date().toISOString(),
    });
  };

  // Milestone Toggle
  const handleToggleMilestone = (project: Project, milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    onUpdateProject({
      ...project,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newMilestoneTitle.trim()) return;
    const nextMilestone = {
      id: `ms-${Date.now()}`,
      projectId: selectedProject.id,
      title: newMilestoneTitle.trim(),
      completed: false,
      targetDate: selectedProject.targetDeadline || '2026-12-01',
    };
    onUpdateProject({
      ...selectedProject,
      milestones: [...selectedProject.milestones, nextMilestone],
      updatedAt: new Date().toISOString(),
    });
    setNewMilestoneTitle('');
  };

  // Evidence
  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newEvidenceLabel.trim()) return;
    const nextEv = {
      id: `ev-${Date.now()}`,
      type: 'REPOSITORY' as const,
      label: newEvidenceLabel.trim(),
      urlOrContent: newEvidenceUrl.trim() || 'Verified production artifact',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onUpdateProject({
      ...selectedProject,
      evidence: [...selectedProject.evidence, nextEv],
      updatedAt: new Date().toISOString(),
    });
    setNewEvidenceLabel('');
    setNewEvidenceUrl('');
  };

  const linkedTopicsForSelected = selectedProject
    ? state.learningTopics.filter((t) => t.linkedProjectId === selectedProject.id)
    : [];

  // Handler to open project details from card
  const handleOpenProjectCard = (card: { code: string; title: string; description: string; timeline?: string }) => {
    const found = state.projects.find(
      (p) =>
        p.code.toLowerCase().replace(/\s/g, '').includes(card.code.toLowerCase().replace(/\s/g, '')) ||
        p.title.toLowerCase().includes(card.title.toLowerCase())
    );
    if (found) {
      openProjectModal(found);
    } else {
      const syntheticProject: Project = {
        id: `proj-${card.code.toLowerCase()}`,
        code: card.code,
        title: card.title,
        objective: card.description,
        status: card.code === 'P01' ? 'IN PROGRESS' : 'QUEUED',
        phaseTag: card.code === 'P01' ? 'ACTIVE' : 'PLANNED',
        spanText: card.timeline ? `Span: ${card.timeline}` : 'Span: 6–10 weeks',
        startDate: '2026-09-01',
        targetDeadline: '2026-10-31',
        dailyCapacitySteps: 2,
        currentSDLCPhase: card.code === 'P01' ? 'IMPLEMENTATION' : 'REQUIREMENTS',
        steps: [
          {
            id: `s-${card.code}-1`,
            projectId: `proj-${card.code.toLowerCase()}`,
            title: 'Scope system boundaries & requirements',
            sdlcPhase: 'REQUIREMENTS',
            estimatedDurationMinutes: 60,
            completed: card.code === 'P01',
            order: 1,
          },
          {
            id: `s-${card.code}-2`,
            projectId: `proj-${card.code.toLowerCase()}`,
            title: 'Design architecture & schema contracts',
            sdlcPhase: 'ARCHITECTURE',
            estimatedDurationMinutes: 90,
            completed: card.code === 'P01',
            order: 2,
          },
          {
            id: `s-${card.code}-3`,
            projectId: `proj-${card.code.toLowerCase()}`,
            title: card.code === 'P01' ? 'Connect command execution layer' : 'Implement core logic',
            sdlcPhase: 'IMPLEMENTATION',
            estimatedDurationMinutes: 120,
            completed: false,
            order: 3,
          },
        ],
        progress: card.code === 'P01' ? 72 : 0,
        progressLabel: card.code === 'P01' ? '2/6 Steps (72%)' : '0/6 Steps (0%)',
        currentMilestone: card.code === 'P01' ? 'Command execution layer' : 'Requirements Specification',
        nextAction: card.code === 'P01' ? 'Connect execution engine' : 'Set up environment',
        technologies: ['TypeScript', 'Node.js', 'System Design'],
        skills: ['Software Architecture', 'Verification', 'Automation'],
        notes: '',
        milestones: [
          { id: `m-${card.code}-1`, projectId: `proj-${card.code.toLowerCase()}`, title: 'Command execution layer', completed: card.code === 'P01', targetDate: '2026-10-15' },
        ],
        tasks: [],
        evidence: [],
        dodPassedIds: card.code === 'P01' ? ['dod-1', 'dod-2', 'dod-3', 'dod-4'] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      openProjectModal(syntheticProject);
    }
  };

  // Create New Project Form Submit
  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      code: newProjectCode.trim() || `P0${state.projects.length + 1}`,
      title: newProjectTitle.trim(),
      objective: newProjectObjective.trim() || 'Software engineering initiative.',
      status: 'QUEUED',
      phaseTag: 'PLANNED',
      spanText: `Span: ${newProjectTimeline.trim()}`,
      startDate: new Date().toISOString().split('T')[0],
      targetDeadline: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      dailyCapacitySteps: 2,
      currentSDLCPhase: 'REQUIREMENTS',
      steps: [
        {
          id: `step-${Date.now()}-1`,
          projectId: `proj-${Date.now()}`,
          title: 'Scope system boundaries, requirements & DoD criteria',
          sdlcPhase: 'REQUIREMENTS',
          estimatedDurationMinutes: 60,
          completed: false,
          order: 1,
        },
      ],
      progress: 0,
      progressLabel: '0/1 Steps (0%)',
      currentMilestone: 'Requirements Specification',
      nextAction: 'Define architecture & schema contracts',
      technologies: newProjectTechs.split(',').map((t) => t.trim()).filter(Boolean),
      skills: ['Architecture', 'System Design'],
      notes: '',
      milestones: [],
      tasks: [],
      evidence: [],
      dodPassedIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddProject) {
      onAddProject(newProj);
    } else {
      onUpdateProject(newProj);
    }

    setShowNewProjectModal(false);
    setNewProjectTitle('');
    setNewProjectObjective('');
  };

  return (
    <section
      className="flex flex-col gap-6 select-none animate-fadeIn"
      id="milestone-projects"
    >
      {/* ========================================================================= */}
      {/* 1. HEADER: Engineering & Milestone Projects + 5 Stat Cards                */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] font-bold text-[#00f5a0] tracking-widest uppercase block">
            EXECUTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#e6f4f1] tracking-tight font-mono">
            Engineering &amp; Milestone Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#7a9490]">
            Turn ambitious ideas into measurable execution.
          </p>
          <div className="flex items-center gap-2 font-mono text-[11px] pt-1 text-[#7a9490]">
            {['Plan', 'Build', 'Verify', 'Ship', 'Capture Evidence'].map((step, idx) => (
              <React.Fragment key={step}>
                <span className={idx === 0 ? 'text-[#00f5a0] font-bold' : 'text-[#7a9490]'}>
                  {step}
                </span>
                {idx < 4 && <span className="text-[#3b5552]">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 5 Header Stat Cards matching Reference Image - FULLY INTERACTIVE & DYNAMIC */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Total Projects Filter Button */}
          <button
            type="button"
            onClick={() => {
              setPipelineFilter('ALL');
              showToast(`Showing all ${projectMetrics.total} projects`);
            }}
            className={`px-4 py-3 rounded-xl bg-[#081414] border text-left transition-all cursor-pointer min-w-[100px] shadow-sm hover:border-[#00f5a0]/50 ${
              pipelineFilter === 'ALL'
                ? 'border-[#00f5a0] shadow-[0_0_12px_rgba(0,245,160,0.15)] ring-1 ring-[#00f5a0]/40'
                : 'border-[#162b29]'
            }`}
            title="Filter by all projects"
          >
            <div className="text-xl font-black font-mono text-[#e6f4f1]">
              {projectMetrics.total}
            </div>
            <span className="text-[10px] font-mono text-[#7a9490] block uppercase tracking-wider">
              Total Projects
            </span>
          </button>

          {/* Active Filter Button */}
          <button
            type="button"
            onClick={() => {
              setPipelineFilter('ACTIVE');
              showToast(`Filtered to Active projects (${projectMetrics.activeCount})`);
            }}
            className={`px-4 py-3 rounded-xl bg-[#081414] border text-left transition-all cursor-pointer min-w-[95px] shadow-sm hover:border-[#00f5a0] ${
              pipelineFilter === 'ACTIVE'
                ? 'border-[#00f5a0] shadow-[0_0_12px_rgba(0,245,160,0.25)] ring-1 ring-[#00f5a0]'
                : 'border-[#162b29]'
            }`}
            title="Filter by active projects"
          >
            <div className="text-xl font-black font-mono text-[#00f5a0] flex items-center gap-1.5">
              <span>{projectMetrics.activeCount}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-[#00f5a0] block uppercase tracking-wider font-semibold">
              Active
            </span>
          </button>

          {/* Ready Filter Button */}
          <button
            type="button"
            onClick={() => {
              setPipelineFilter('READY');
              showToast(`Filtered to Ready projects (${projectMetrics.readyCount})`);
            }}
            className={`px-4 py-3 rounded-xl bg-[#081414] border text-left transition-all cursor-pointer min-w-[95px] shadow-sm hover:border-[#38bdf8] ${
              pipelineFilter === 'READY'
                ? 'border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.2)] ring-1 ring-[#38bdf8]'
                : 'border-[#162b29]'
            }`}
            title="Filter by ready projects"
          >
            <div className="text-xl font-black font-mono text-[#38bdf8]">
              {projectMetrics.readyCount}
            </div>
            <span className="text-[10px] font-mono text-[#38bdf8] block uppercase tracking-wider font-semibold">
              Ready
            </span>
          </button>

          {/* Queued Filter Button */}
          <button
            type="button"
            onClick={() => {
              setPipelineFilter('BACKLOG');
              showToast(`Filtered to Backlog projects (${projectMetrics.queuedCount})`);
            }}
            className={`px-4 py-3 rounded-xl bg-[#081414] border text-left transition-all cursor-pointer min-w-[95px] shadow-sm hover:border-[#64748b] ${
              pipelineFilter === 'BACKLOG'
                ? 'border-[#94a3b8] shadow-[0_0_12px_rgba(148,163,184,0.2)] ring-1 ring-[#94a3b8]'
                : 'border-[#162b29]'
            }`}
            title="Filter by backlog / queued projects"
          >
            <div className="text-xl font-black font-mono text-[#7a9490]">
              {projectMetrics.queuedCount}
            </div>
            <span className="text-[10px] font-mono text-[#7a9490] block uppercase tracking-wider">
              Queued
            </span>
          </button>

          {/* Overall Progress Donut - Interactive */}
          <button
            type="button"
            onClick={() => setShowTimelineModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#081414] border border-[#162b29] hover:border-[#00f5a0]/60 transition-all flex items-center gap-3 shadow-sm cursor-pointer group text-left"
            title="Click to view interactive multi-project timeline"
          >
            <div>
              <div className="text-xl font-black font-mono text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors">
                {projectMetrics.overallProgress}%
              </div>
              <span className="text-[10px] font-mono text-[#7a9490] block uppercase tracking-wider">
                Overall Progress
              </span>
            </div>
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#122222]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#00f5a0] transition-all duration-500"
                  strokeDasharray={`${projectMetrics.overallProgress}, 100`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE PROJECT HERO CARD matching Reference Image - DYNAMIC & INTERACTIVE */}
      {/* ========================================================================= */}
      {heroProject ? (
        <div className="rounded-2xl bg-[#081414] border border-[#162b29] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <WireframeSphere
            className="absolute right-1/4 -top-12 opacity-35 pointer-events-none"
            size={280}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
            {/* Column 1 (5 cols): Title, Badges, Progress */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 pr-0 lg:pr-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                    ACTIVE PROJECT
                  </span>

                  {/* Project Switcher Selector */}
                  {(state.projects || []).length > 1 && (
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-[#55736f]">SWITCH:</span>
                      <select
                        value={heroProject.id}
                        onChange={(e) => setSelectedHeroCode(e.target.value)}
                        className="bg-[#0c1818] border border-[#162b29] rounded px-1.5 py-0.5 text-[#38bdf8] focus:outline-none focus:border-[#00f5a0] cursor-pointer text-[10px]"
                      >
                        {(state.projects || []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}: {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00f5a0]/15 border border-[#00f5a0]/40 text-[#00f5a0] font-mono text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                    {heroProject.status === 'IN PROGRESS' ? 'ON TRACK' : heroProject.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#0e2a2a] border border-[#38bdf8]/40 text-[#38bdf8] font-mono text-[10px] font-bold">
                    {heroProject.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                  </span>
                  <span className="text-[10px] font-mono text-[#55736f] hidden sm:inline">
                    {heroProject.spanText || 'Span: Active'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#e6f4f1] font-mono leading-tight pt-1">
                  {heroProject.title}
                </h2>
                <p className="text-xs text-[#7a9490] leading-relaxed line-clamp-2">
                  {heroProject.objective}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full rounded-full bg-[#122222] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00f5a0] to-[#38bdf8] shadow-[0_0_8px_#00f5a0] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, heroProject.progress || 0))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#55736f] text-[10px]">
                    {heroProject.progressLabel || `${heroProject.progress}% complete`}
                  </span>
                  <span className="font-bold text-[#00f5a0]">
                    {heroProject.progress}%
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2 (4 cols): Current Milestone, Next Action, CTA Button */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4 border-l border-[#132626]/70 lg:pl-6">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-[#55736f] uppercase tracking-wider block">
                  CURRENT MILESTONE
                </span>
                <div className="text-sm font-bold text-[#e6f4f1] font-mono truncate">
                  {heroProject.currentMilestone || ((heroProject.steps || []).find((s) => !s.completed)?.title || 'Engineering Verification')}
                </div>
                <span className="text-[11px] font-mono text-[#7a9490]">
                  {(heroProject.steps || []).filter((s) => s.completed).length} / {(heroProject.steps || []).length} steps completed
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-[#55736f] uppercase tracking-wider block">
                  NEXT ACTION
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdvanceProjectNextStep(heroProject)}
                    className="w-7 h-7 rounded-full bg-[#00f5a0]/15 hover:bg-[#00f5a0]/30 border border-[#00f5a0]/40 flex items-center justify-center text-[#00f5a0] shrink-0 cursor-pointer transition-all hover:scale-110"
                    title="Click to execute / complete next step immediately"
                  >
                    <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#e6f4f1] block truncate">
                      {heroProject.nextAction || ((heroProject.steps || []).find((s) => !s.completed)?.title || 'All steps verified')}
                    </span>
                    <span className="text-[10px] font-mono text-[#00f5a0] flex items-center gap-1 font-semibold">
                      <span>Click arrow to execute step</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openProjectModal(heroProject)}
                  className="px-4 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all hover:scale-105"
                >
                  <span>Open Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAdvanceProjectNextStep(heroProject)}
                  className="px-3 py-2 rounded-xl bg-[#0e2a2a] hover:bg-[#123838] border border-[#00f5a0]/30 text-[#00f5a0] font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Complete the next scheduled engineering step"
                >
                  <Check className="w-3 h-3" />
                  <span>Execute Step</span>
                </button>
              </div>
            </div>

            {/* Column 3 (3 cols): Capabilities Developed */}
            <div className="lg:col-span-3 p-3.5 rounded-xl bg-[#091414] border border-[#162b29] flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#7a9490] uppercase tracking-wider block">
                  CAPABILITIES DEVELOPED
                </span>
                {onNavigateToSection && (
                  <button
                    type="button"
                    onClick={() => onNavigateToSection('learning-engine')}
                    className="text-[9px] font-mono text-[#00f5a0] hover:underline cursor-pointer"
                  >
                    Engine →
                  </button>
                )}
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {(heroProject.skills && heroProject.skills.length > 0
                  ? heroProject.skills.slice(0, 5)
                  : heroProject.technologies.slice(0, 5)
                ).map((skill, idx) => {
                  const stages = ['L3 → L4', 'L2 → L3', 'L2 → L3', 'L1 → L3', 'L3 → L4'];
                  const icons = [
                    <Code key="c" className="w-3.5 h-3.5 text-[#38bdf8]" />,
                    <Server key="s" className="w-3.5 h-3.5 text-[#00f5a0]" />,
                    <Layers key="l" className="w-3.5 h-3.5 text-[#38bdf8]" />,
                    <Zap key="z" className="w-3.5 h-3.5 text-[#f59e0b]" />,
                    <Layout key="u" className="w-3.5 h-3.5 text-[#a855f7]" />,
                  ];
                  return (
                    <div
                      key={skill}
                      onClick={() => {
                        showToast(`Skill: ${skill} tied to ${heroProject.title}`);
                        if (onNavigateToSection) onNavigateToSection('learning-engine');
                      }}
                      className="flex items-center justify-between text-[11px] p-1 rounded hover:bg-[#0c1818] transition-colors cursor-pointer group"
                      title={`Inspect ${skill} in Learning Engine`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {icons[idx % icons.length]}
                        <span className="text-[#e6f4f1] font-semibold group-hover:text-[#00f5a0] transition-colors truncate">
                          {skill}
                        </span>
                      </div>
                      <span className="text-[#00f5a0] font-bold shrink-0 ml-1">
                        {stages[idx % stages.length]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* 3. PROJECT PIPELINE: Kanban Board matching Reference Image                */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        {/* Section Header with Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
            PROJECT PIPELINE
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: `All (${projectMetrics.total})` },
              { id: 'BACKLOG', label: `Backlog (${kanbanLanes.backlog.length})` },
              { id: 'READY', label: `Ready (${kanbanLanes.ready.length})` },
              { id: 'ACTIVE', label: `Active (${kanbanLanes.active.length})` },
              { id: 'VERIFY', label: `Verify (${kanbanLanes.verify.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPipelineFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  pipelineFilter === tab.id
                    ? 'bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40 shadow-sm'
                    : 'bg-[#091414] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowTimelineModal(true)}
              className="px-2.5 py-1 rounded-lg bg-[#091414] hover:bg-[#122222] border border-[#162b29] text-[#00f5a0] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Calendar className="w-3 h-3 text-[#00f5a0]" />
              <span>View Timeline</span>
            </button>
          </div>
        </div>

        {/* 4 Kanban Columns - DYNAMIC & INTERACTIVE */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {/* COLUMN 1: BACKLOG */}
          {(pipelineFilter === 'ALL' || pipelineFilter === 'BACKLOG') && (
            <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#132626]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#64748b]" />
                    <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                      BACKLOG
                    </span>
                    <span className="text-xs font-mono text-[#7a9490]">
                      {kanbanLanes.backlog.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(true)}
                    className="p-1 rounded text-[#7a9490] hover:text-[#00f5a0] hover:bg-[#0c1818] cursor-pointer"
                    title="Add project to backlog"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Cards in Backlog */}
                <div className="space-y-2.5">
                  {kanbanLanes.backlog.length > 0 ? (
                    kanbanLanes.backlog.map((p) => {
                      const completedSteps = (p.steps || []).filter((s) => s.completed).length;
                      const totalSteps = (p.steps || []).length;
                      const nextStep = (p.steps || []).find((s) => !s.completed);
                      return (
                        <div
                          key={p.id}
                          onClick={() => openProjectModal(p)}
                          className="p-3 rounded-xl bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all cursor-pointer space-y-2 group shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#122222] text-[#38bdf8] border border-[#38bdf8]/30">
                              {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveProjectStatus(p, 'READY');
                                }}
                                className="px-1.5 py-0.5 rounded bg-[#0e1717] hover:bg-[#122424] text-[#64748b] hover:text-[#38bdf8] border border-[#1a2e2c] transition-colors cursor-pointer"
                                title="Promote to Ready"
                              >
                                → Ready
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors line-clamp-1">
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-[#7a9490] pt-0.5">
                              <Clock className="w-2.5 h-2.5 text-[#55736f]" />
                              <span>{p.spanText || 'Span: 6–10 weeks'}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#7a9490] leading-snug line-clamp-2">
                            {p.objective}
                          </p>

                          <div className="text-[10px] font-mono text-[#55736f] truncate">
                            Next: {nextStep ? nextStep.title : p.nextAction || 'Scope requirements'}
                          </div>

                          <div className="space-y-1 pt-1 border-t border-[#132626]">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-[#55736f]">
                                {completedSteps} / {totalSteps || 1}
                              </span>
                              <ChevronRight className="w-3 h-3 text-[#55736f] group-hover:text-[#00f5a0] transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <div className="h-1 w-full rounded-full bg-[#122222] overflow-hidden">
                              <div
                                className="h-full bg-[#00f5a0] rounded-full"
                                style={{ width: `${p.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#162b29] text-center space-y-1.5 text-xs text-[#55736f]">
                      <p>No queued projects</p>
                      <button
                        type="button"
                        onClick={() => setShowNewProjectModal(true)}
                        className="text-[10px] font-mono text-[#00f5a0] hover:underline cursor-pointer"
                      >
                        + Create Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 2: READY */}
          {(pipelineFilter === 'ALL' || pipelineFilter === 'READY') && (
            <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#132626]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                    <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                      READY
                    </span>
                    <span className="text-xs font-mono text-[#38bdf8]">
                      {kanbanLanes.ready.length}
                    </span>
                  </div>
                </div>

                {/* Cards in Ready */}
                <div className="space-y-2.5">
                  {kanbanLanes.ready.length > 0 ? (
                    kanbanLanes.ready.map((p) => {
                      const completedSteps = (p.steps || []).filter((s) => s.completed).length;
                      const totalSteps = (p.steps || []).length;
                      const nextStep = (p.steps || []).find((s) => !s.completed);
                      return (
                        <div
                          key={p.id}
                          onClick={() => openProjectModal(p)}
                          className="p-3 rounded-xl bg-[#091414] border border-[#162b29] hover:border-[#38bdf8]/50 transition-all cursor-pointer space-y-2 group shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#122222] text-[#38bdf8] border border-[#38bdf8]/30">
                              {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveProjectStatus(p, 'IN PROGRESS');
                                }}
                                className="px-1.5 py-0.5 rounded bg-[#0e222a] hover:bg-[#133240] text-[#38bdf8] border border-[#38bdf8]/40 transition-colors cursor-pointer"
                                title="Promote to Active"
                              >
                                ▶ Start
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-[#7a9490] pt-0.5">
                              <Clock className="w-2.5 h-2.5 text-[#55736f]" />
                              <span>{p.spanText || 'Span: 6–10 weeks'}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#7a9490] leading-snug line-clamp-2">
                            {p.objective}
                          </p>

                          <div className="text-[10px] font-mono text-[#55736f] truncate">
                            Next: {nextStep ? nextStep.title : p.nextAction || 'Architecture setup'}
                          </div>

                          <div className="space-y-1 pt-1 border-t border-[#132626]">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-[#55736f]">
                                {completedSteps} / {totalSteps || 1}
                              </span>
                              <ChevronRight className="w-3 h-3 text-[#55736f] group-hover:text-[#38bdf8] transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <div className="h-1 w-full rounded-full bg-[#122222] overflow-hidden">
                              <div
                                className="h-full bg-[#38bdf8] rounded-full"
                                style={{ width: `${p.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#162b29] text-center space-y-1.5 text-xs text-[#55736f]">
                      <p>No projects in ready state</p>
                      <button
                        type="button"
                        onClick={() => setShowTemplatesModal(true)}
                        className="text-[10px] font-mono text-[#38bdf8] hover:underline cursor-pointer"
                      >
                        + Instantiate Template
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 3: ACTIVE */}
          {(pipelineFilter === 'ALL' || pipelineFilter === 'ACTIVE') && (
            <div className="p-3.5 rounded-xl bg-[#091814] border border-[#00f5a0]/40 shadow-[0_0_15px_rgba(0,245,160,0.1)] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#132626]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f5a0] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                      ACTIVE
                    </span>
                    <span className="text-xs font-mono text-[#00f5a0] font-bold">
                      {kanbanLanes.active.length}
                    </span>
                  </div>
                </div>

                {/* Cards in Active */}
                <div className="space-y-2.5">
                  {kanbanLanes.active.length > 0 ? (
                    kanbanLanes.active.map((p) => {
                      const completedSteps = (p.steps || []).filter((s) => s.completed).length;
                      const totalSteps = (p.steps || []).length;
                      const nextStep = (p.steps || []).find((s) => !s.completed);
                      return (
                        <div
                          key={p.id}
                          onClick={() => openProjectModal(p)}
                          className="p-3 rounded-xl bg-[#091414] border border-[#00f5a0]/40 hover:border-[#00f5a0] transition-all cursor-pointer space-y-2 group shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40">
                              {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="px-1.5 py-0.2 rounded bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
                                On Track
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdvanceProjectNextStep(p);
                                }}
                                className="px-1.5 py-0.5 rounded bg-[#0c221a] hover:bg-[#12382a] text-[#00f5a0] border border-[#00f5a0]/30 transition-colors cursor-pointer"
                                title="Execute next step immediately"
                              >
                                ✓ Step
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors line-clamp-1">
                              {p.title}
                            </h4>
                            <p className="text-[11px] text-[#7a9490] leading-snug pt-0.5 line-clamp-2">
                              {p.objective}
                            </p>
                          </div>

                          <div className="text-[10px] font-mono text-[#00f5a0] truncate font-semibold">
                            Next: {nextStep ? nextStep.title : p.nextAction || 'Verify & Ship'}
                          </div>

                          <div className="space-y-1 pt-1 border-t border-[#132626]">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-[#00f5a0] font-bold">
                                {completedSteps} / {totalSteps || 1}
                              </span>
                              <ChevronRight className="w-3 h-3 text-[#00f5a0] transition-transform group-hover:translate-x-0.5" />
                            </div>
                            <div className="h-1 w-full rounded-full bg-[#122222] overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#00f5a0] to-[#38bdf8] rounded-full shadow-[0_0_8px_#00f5a0]"
                                style={{ width: `${Math.min(100, Math.max(4, p.progress || 0))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-[#00f5a0]/30 text-center space-y-1.5 text-xs text-[#7a9490]">
                      <p>No active project</p>
                      {kanbanLanes.ready.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveProjectStatus(kanbanLanes.ready[0], 'IN PROGRESS')}
                          className="text-[10px] font-mono text-[#00f5a0] hover:underline cursor-pointer"
                        >
                          Promote {kanbanLanes.ready[0].code} to Active →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 4: VERIFY */}
          {(pipelineFilter === 'ALL' || pipelineFilter === 'VERIFY') && (
            <div className="p-3.5 rounded-xl bg-[#081212] border border-[#162b29] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#132626]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7a9490]" />
                    <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                      VERIFY
                    </span>
                    <span className="text-xs font-mono text-[#7a9490]">
                      {kanbanLanes.verify.length}
                    </span>
                  </div>
                </div>

                {/* Cards or Empty State */}
                <div className="space-y-2.5">
                  {kanbanLanes.verify.length > 0 ? (
                    kanbanLanes.verify.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => openProjectModal(p)}
                        className="p-3 rounded-xl bg-[#091414] border border-[#162b29] hover:border-[#00f5a0]/50 transition-all cursor-pointer space-y-2 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#122222] text-[#00f5a0] border border-[#00f5a0]/30">
                            {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[#00f5a0]/15 text-[#00f5a0] font-mono text-[9px] font-bold border border-[#00f5a0]/30">
                            Passed
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors line-clamp-1">
                            {p.title}
                          </h4>
                          <span className="text-[10px] font-mono text-[#55736f]">
                            {p.currentMilestone || '100% Verification Complete'}
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-[#122222] overflow-hidden">
                          <div className="h-full bg-[#00f5a0] rounded-full w-full" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-[#162b29] flex flex-col items-center justify-center text-center space-y-2 min-h-[220px]">
                      <div className="w-10 h-10 rounded-full bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-center justify-center text-[#00f5a0]">
                        <CheckCircle2 className="w-5 h-5 text-[#00f5a0]" />
                      </div>
                      <span className="text-xs font-bold text-[#e6f4f1] font-mono">
                        No projects in verification
                      </span>
                      <p className="text-[11px] text-[#7a9490] max-w-[200px] leading-snug">
                        Completed projects will appear here for final review and evidence capture.
                      </p>
                      {heroProject && (
                        <button
                          type="button"
                          onClick={() => openProjectModal(heroProject)}
                          className="text-[10px] font-mono text-[#00f5a0] hover:underline cursor-pointer pt-1"
                        >
                          Review DoD on {heroProject.code} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW: 4 Summary Columns matching Reference Image - DYNAMIC        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Column 1: PROJECT OVERVIEW (Dynamic Donut) */}
        <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] space-y-3 shadow-sm">
          <span className="font-mono text-[10px] font-bold text-[#7a9490] uppercase tracking-wider block">
            PROJECT OVERVIEW
          </span>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              {(() => {
                const total = Math.max(1, projectMetrics.total);
                const aPct = Math.round((projectMetrics.activeCount / total) * 100);
                const rPct = Math.round((projectMetrics.readyCount / total) * 100);
                const qPct = Math.round((projectMetrics.queuedCount / total) * 100);
                return (
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#122222]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {aPct > 0 && (
                      <path
                        className="text-[#00f5a0]"
                        strokeDasharray={`${aPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    )}
                    {rPct > 0 && (
                      <path
                        className="text-[#38bdf8]"
                        strokeDashoffset={`-${aPct}`}
                        strokeDasharray={`${rPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    )}
                    {qPct > 0 && (
                      <path
                        className="text-[#64748b]"
                        strokeDashoffset={`-${aPct + rPct}`}
                        strokeDasharray={`${qPct}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    )}
                  </svg>
                );
              })()}

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-[#e6f4f1] font-mono leading-none">
                  {projectMetrics.total}
                </span>
                <span className="text-[9px] font-mono text-[#7a9490] uppercase pt-0.5">
                  Total
                </span>
              </div>
            </div>

            <div className="space-y-1 font-mono text-[11px] flex-1">
              <button
                type="button"
                onClick={() => setPipelineFilter('ACTIVE')}
                className="w-full flex items-center justify-between text-[#a1b8b4] hover:text-[#00f5a0] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00f5a0]" /> Active
                </span>
                <span className="font-bold text-[#e6f4f1]">{projectMetrics.activeCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setPipelineFilter('READY')}
                className="w-full flex items-center justify-between text-[#a1b8b4] hover:text-[#38bdf8] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> Ready
                </span>
                <span className="font-bold text-[#e6f4f1]">{projectMetrics.readyCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setPipelineFilter('BACKLOG')}
                className="w-full flex items-center justify-between text-[#a1b8b4] hover:text-[#94a3b8] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#64748b]" /> Queued
                </span>
                <span className="font-bold text-[#e6f4f1]">{projectMetrics.queuedCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setPipelineFilter('VERIFY')}
                className="w-full flex items-center justify-between text-[#a1b8b4] hover:text-[#00f5a0] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full border border-[#00f5a0]" /> Completed
                </span>
                <span className="font-bold text-[#e6f4f1]">{projectMetrics.completedCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: UPCOMING MILESTONES (Live Extracted & Interactive Checkbox) */}
        <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-[#7a9490] uppercase tracking-wider">
              UPCOMING MILESTONES
            </span>
            <button
              onClick={() => setShowTimelineModal(true)}
              className="text-[10px] font-mono text-[#00f5a0] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-1">
            {upcomingMilestones.length > 0 ? (
              upcomingMilestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#050a0a] border border-[#132626] hover:border-[#00f5a0]/30 transition-colors text-[11px] group"
                >
                  <div
                    onClick={() => openProjectModal(m.project)}
                    className="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0"
                    title={`Open ${m.project.title}`}
                  >
                    <span className="px-1 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] text-[9px] font-bold shrink-0">
                      {m.code}
                    </span>
                    <span className="text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors truncate">
                      {m.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[#7a9490] text-[10px]">{m.eta}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (m.isMilestone) {
                          handleToggleMilestone(m.project, m.id);
                          showToast(`Milestone marked complete: "${m.title}"`);
                        } else {
                          handleToggleStep(m.project, m.id);
                          showToast(`Step completed: "${m.title}"`);
                        }
                      }}
                      className="p-1 rounded text-[#55736f] hover:text-[#00f5a0] hover:bg-[#0c1818] cursor-pointer"
                      title="Mark complete"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-[#55736f]">
                All milestones verified!
              </div>
            )}
          </div>
        </div>

        {/* Column 3: PROJECT PORTFOLIO (Capability Gain - Interactive Histogram) */}
        <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-[#7a9490] uppercase tracking-wider">
              PROJECT PORTFOLIO
            </span>
            <span className="text-[10px] font-mono text-[#00f5a0]">Progress Velocity</span>
          </div>
          <div className="flex items-end justify-between h-20 pt-2 gap-1 border-b border-[#132626] pb-1">
            {(state.projects || []).slice(0, 7).map((p) => {
              const heightPct = Math.max(8, p.progress || 0);
              const isHero = heroProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => openProjectModal(p)}
                  className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                  title={`${p.code}: ${p.title} (${p.progress}%)`}
                >
                  <div
                    className={`w-full max-w-[18px] rounded-t-sm transition-all duration-300 ${
                      isHero
                        ? 'bg-[#00f5a0] shadow-[0_0_10px_rgba(0,245,160,0.5)]'
                        : p.status === 'IN PROGRESS'
                        ? 'bg-[#00f5a0]/90'
                        : p.status === 'COMPLETED'
                        ? 'bg-[#38bdf8]'
                        : 'bg-[#334155] group-hover:bg-[#64748b]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-[#7a9490] px-0.5">
            {(state.projects || []).slice(0, 7).map((p) => (
              <span
                key={p.id}
                onClick={() => openProjectModal(p)}
                className="flex-1 text-center cursor-pointer hover:text-[#00f5a0] transition-colors"
              >
                {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 3)}
              </span>
            ))}
          </div>
        </div>

        {/* Column 4: QUICK ACTIONS */}
        <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] space-y-2 shadow-sm">
          <span className="font-mono text-[10px] font-bold text-[#7a9490] uppercase tracking-wider block">
            QUICK ACTIONS
          </span>
          <div className="space-y-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="w-full p-2 rounded-lg bg-[#071313] hover:bg-[#0c1818] border border-[#162b29] hover:border-[#00f5a0]/40 text-[#00f5a0] flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </div>
              <span className="text-[10px] text-[#55736f]">Create RFC</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTimelineModal(true)}
              className="w-full p-2 rounded-lg bg-[#071313] hover:bg-[#0c1818] border border-[#162b29] text-[#e6f4f1] flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>View Timeline</span>
              </div>
              <span className="text-[10px] text-[#55736f]">Gantt Map</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="w-full p-2 rounded-lg bg-[#071313] hover:bg-[#0c1818] border border-[#162b29] text-[#e6f4f1] flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>Project Templates</span>
              </div>
              <span className="text-[10px] text-[#55736f]">5 Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDependencyMapModal(true)}
              className="w-full p-2 rounded-lg bg-[#071313] hover:bg-[#0c1818] border border-[#162b29] text-[#e6f4f1] flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Dependency Map</span>
              </div>
              <span className="text-[10px] text-[#55736f]">Blockers</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Interactive Project Detail Modal */}
      {selectedProject && timeMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl rounded-2xl bg-[#081414] border border-[#162b29] shadow-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#162b29] pb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#00f5a0] font-bold">
                    {selectedProject.code}
                  </span>
                  <span className="text-[#7a9490]">//</span>
                  <span className="text-[#4cd7f6]">{selectedProject.status}</span>
                  <span className="text-[#7a9490]">//</span>
                  <span className="text-[#7a9490]">{selectedProject.spanText}</span>
                </div>

                {!isEditingProjectInfo ? (
                  <div className="mt-1 group">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-[#e6f4f1]">
                        {selectedProject.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditProjectTitle(selectedProject.title);
                          setEditProjectObjective(selectedProject.objective);
                          setIsEditingProjectInfo(true);
                        }}
                        className="p-1 rounded-md hover:bg-[#162b29] text-[#7a9490] hover:text-[#4cd7f6] transition-colors cursor-pointer"
                        title="Edit project name & description"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#7a9490] mt-0.5 leading-relaxed">
                      {selectedProject.objective}
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSaveProjectInfo}
                    className="mt-2.5 p-3.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col gap-2.5 animate-fadeIn"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> Project Name / Title
                      </label>
                      <input
                        type="text"
                        required
                        value={editProjectTitle}
                        onChange={(e) => setEditProjectTitle(e.target.value)}
                        placeholder="e.g. Personal Automation Engine"
                        className="bg-[#071010] border border-[#162b29] focus:border-[#4cd7f6] rounded-lg px-3 py-1.5 text-sm font-bold text-[#e6f4f1] focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                        Description / Objective
                      </label>
                      <textarea
                        rows={2}
                        value={editProjectObjective}
                        onChange={(e) => setEditProjectObjective(e.target.value)}
                        placeholder="Describe the primary mission, capabilities, and target outcome..."
                        className="bg-[#071010] border border-[#162b29] focus:border-[#4cd7f6] rounded-lg px-3 py-1.5 text-xs text-[#e6f4f1] focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#162b29]">
                      <button
                        type="button"
                        onClick={() => setIsEditingProjectInfo(false)}
                        className="px-3 py-1 rounded-lg bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] border border-[#162b29] font-mono text-xs cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 rounded-lg bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#050a0a] font-mono text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isEditingProjectInfo && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditProjectTitle(selectedProject.title);
                      setEditProjectObjective(selectedProject.objective);
                      setIsEditingProjectInfo(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0e201e] hover:bg-[#162b29] border border-[#162b29] text-[#7a9490] hover:text-[#4cd7f6] font-mono text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Change project name and description"
                  >
                    <Edit2 className="w-3 h-3 text-[#4cd7f6]" />
                    <span>Edit Name/Desc</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="p-1.5 rounded-lg bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A. TIME SPAN & DAILY CADENCE ENGINE BAR */}
            <div className="p-4 rounded-xl bg-[#081414] border border-[#4cd7f6]/40 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#162b29] pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4cd7f6]" />
                  <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                    Project Time Span &amp; Cadence Velocity
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingTimeSpan(!isEditingTimeSpan)}
                  className="px-2.5 py-1 rounded-lg bg-[#0e201e] hover:bg-[#162b29] border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  {isEditingTimeSpan ? 'Close Span Editor' : 'Change Time Span'}
                </button>
              </div>

              {/* Time Span Editor Drawer */}
              {isEditingTimeSpan ? (
                <form
                  onSubmit={handleSaveTimeSpan}
                  className="p-3.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col gap-3 animate-fadeIn"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="bg-[#071010] border border-[#162b29] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#e6f4f1] focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={editTargetDeadline}
                        onChange={(e) => setEditTargetDeadline(e.target.value)}
                        className="bg-[#071010] border border-[#162b29] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                        Time Span Label
                      </label>
                      <input
                        type="text"
                        value={editSpanText}
                        onChange={(e) => setEditSpanText(e.target.value)}
                        placeholder="e.g. Span: 8 Weeks"
                        className="bg-[#071010] border border-[#162b29] rounded-lg px-2.5 py-1.5 text-xs text-[#e6f4f1] focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                        Daily Capacity (Steps/Day)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editDailyCapacity}
                        onChange={(e) => setEditDailyCapacity(Number(e.target.value))}
                        className="bg-[#071010] border border-[#162b29] rounded-lg px-2.5 py-1.5 font-mono text-xs text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                      />
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#162b29]">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-[#7a9490]">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(2)}
                        className="px-2 py-0.5 rounded-md bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] cursor-pointer"
                      >
                        2 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(4)}
                        className="px-2 py-0.5 rounded-md bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] cursor-pointer"
                      >
                        4 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(8)}
                        className="px-2 py-0.5 rounded-md bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] cursor-pointer"
                      >
                        8 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(12)}
                        className="px-2 py-0.5 rounded-md bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] cursor-pointer"
                      >
                        12 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(24)}
                        className="px-2 py-0.5 rounded-md bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29] cursor-pointer"
                      >
                        6 Months
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingTimeSpan(false)}
                        className="px-3 py-1 rounded-lg bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] border border-[#162b29] font-mono text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 rounded-lg bg-[#4cd7f6] hover:bg-[#38c2e0] text-[#050a0a] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Time Span
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Dynamic Telemetry Display */
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col">
                    <span className="font-mono text-[9px] text-[#7a9490] uppercase">
                      Timeline Span
                    </span>
                    <span className="font-mono text-xs font-bold text-[#e6f4f1] mt-0.5">
                      {selectedProject.spanText || `${timeMetrics.totalWeeks} Weeks`}
                    </span>
                    <span className="font-mono text-[9px] text-[#7a9490] mt-0.5">
                      {selectedProject.startDate || 'Started'} → {selectedProject.targetDeadline || 'Deadline'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col">
                    <span className="font-mono text-[9px] text-[#7a9490] uppercase">
                      Days to Deadline
                    </span>
                    <span
                      className={`font-mono text-xs font-bold mt-0.5 ${
                        timeMetrics.daysRemaining <= 7
                          ? 'text-[#ef4444]'
                          : timeMetrics.daysRemaining <= 21
                          ? 'text-[#f59e0b]'
                          : 'text-[#00f5a0]'
                      }`}
                    >
                      {timeMetrics.daysRemaining > 0
                        ? `${timeMetrics.daysRemaining} Days Left`
                        : 'Due / Overdue'}
                    </span>
                    <span className="font-mono text-[9px] text-[#7a9490] mt-0.5">
                      Target: {selectedProject.targetDeadline || 'Scheduled'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col">
                    <span className="font-mono text-[9px] text-[#7a9490] uppercase">
                      Daily Step Velocity
                    </span>
                    <span className="font-mono text-xs font-bold text-[#4cd7f6] mt-0.5">
                      {timeMetrics.dailyTarget} Steps / Day
                    </span>
                    <span className="font-mono text-[9px] text-[#7a9490] mt-0.5">
                      Recommended Daily Pace
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col">
                    <span className="font-mono text-[9px] text-[#7a9490] uppercase">
                      Work Days Needed
                    </span>
                    <span className="font-mono text-xs font-bold text-[#e6f4f1] mt-0.5">
                      ~{timeMetrics.daysNeededAtPace} Days
                    </span>
                    <span className="font-mono text-[9px] text-[#7a9490] mt-0.5">
                      {timeMetrics.remainingSteps} open steps @ {timeMetrics.dailyTarget}/day
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col">
                    <span className="font-mono text-[9px] text-[#7a9490] uppercase">
                      Remaining Work Time
                    </span>
                    <span className="font-mono text-xs font-bold text-[#00f5a0] mt-0.5">
                      {formatDuration(timeMetrics.remainingMinutes)}
                    </span>
                    <span className="font-mono text-[9px] text-[#7a9490] mt-0.5">
                      Sum of remaining steps
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Iterating Progress Bar */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#7a9490] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" /> Step-Iterating Progress Engine:
                  </span>
                  <span className="text-[#00f5a0] font-bold tabular-nums">
                    {selectedProject.progress}% Completed ({timeMetrics.completedSteps}/{timeMetrics.totalSteps} Steps)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#071010] rounded-full overflow-hidden border border-[#162b29]">
                  <div
                    className="h-full bg-linear-to-r from-[#4cd7f6] to-[#00f5a0] transition-all duration-300 shadow-[0_0_10px_rgba(0,245,160,0.3)]"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* B. TECHNOLOGIES & STACK EDITOR (USER CAN EDIT/ADD/REMOVE) */}
            <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#162b29] pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#00f5a0]" />
                  <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                    Technologies &amp; Architecture Stack ({selectedProject.technologies.length})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#7a9490]">
                  Click &times; to remove tag or add custom tech
                </span>
              </div>

              {/* Current Tech Chips with remove buttons */}
              <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                {selectedProject.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md bg-[#0b1a19] border border-[#162b29] text-xs font-mono text-[#4cd7f6] flex items-center gap-1.5 hover:border-[#4cd7f6]/60 transition-colors shadow-xs"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-[#7a9490] hover:text-[#ef4444] transition-colors cursor-pointer p-0.5 -mr-1"
                      title={`Remove ${tech}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedProject.technologies.length === 0 && (
                  <span className="text-xs text-[#7a9490] italic">
                    No technologies listed for this project. Add one below.
                  </span>
                )}
              </div>

              {/* Add Tech Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTech();
                }}
                className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#162b29]"
              >
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    placeholder="Add technology (e.g. Docker, Rust, Postgres, Kafka, Next.js, Redis)..."
                    className="flex-1 bg-[#071010] border border-[#162b29] rounded-lg px-3 py-1.5 text-xs text-[#e6f4f1] placeholder-[#7a9490] focus:outline-none focus:border-[#00f5a0]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#050a0a] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Tech
                  </button>
                </div>
              </form>

              {/* Quick Suggestions / Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#7a9490] pt-1">
                <span className="text-[#7a9490]">Popular Presets:</span>
                {POPULAR_TECH_SUGGESTIONS
                  .filter((s) => !selectedProject.technologies.some((t) => t.toLowerCase() === s.toLowerCase()))
                  .slice(0, 8)
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddTech(suggestion)}
                      className="px-2 py-0.5 rounded-md bg-[#0e201e] hover:bg-[#162b29] text-[#7a9490] hover:text-[#00f5a0] border border-[#162b29] cursor-pointer transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
              </div>
            </div>

            {/* C. 6-PHASE SDLC STEPPER */}
            <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#00f5a0] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Software Development Life Cycle (SDLC) Phase Matrix
                </span>
                <span className="font-mono text-[10px] text-[#7a9490]">
                  Click phase to set active milestone stage
                </span>
              </div>

              {/* 6-Phase Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {SDLC_PHASES.map((sdlc) => {
                  const isCurrent = (selectedProject.currentSDLCPhase || 'REQUIREMENTS') === sdlc.phase;
                  const stepsInPhase = (selectedProject.steps || []).filter((s) => s.sdlcPhase === sdlc.phase);
                  const completedInPhase = stepsInPhase.filter((s) => s.completed).length;

                  return (
                    <button
                      key={sdlc.phase}
                      onClick={() => handleChangeProjectSDLCPhase(sdlc.phase)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0b1a19] border-[#00f5a0] shadow-[0_0_12px_rgba(0,245,160,0.15)]'
                          : 'bg-[#071010] border-[#162b29] hover:border-[#00f5a0]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px]">
                        <span className={isCurrent ? 'text-[#00f5a0] font-bold' : 'text-[#7a9490]'}>
                          PHASE 0{sdlc.order}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-bold ${
                            stepsInPhase.length > 0 && completedInPhase === stepsInPhase.length
                              ? 'bg-[#00f5a0]/20 text-[#00f5a0]'
                              : 'bg-[#0e201e] border border-[#162b29] text-[#7a9490]'
                          }`}
                        >
                          {completedInPhase}/{stepsInPhase.length}
                        </span>
                      </div>
                      <span className={`text-xs font-bold truncate ${isCurrent ? 'text-[#e6f4f1]' : 'text-[#7a9490]'}`}>
                        {sdlc.short}
                      </span>
                      <span className="text-[9px] text-[#7a9490] line-clamp-1 leading-tight">
                        {sdlc.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. MULTIPLE STEP BREAKDOWN (WITH DURATION & DAILY TARGET HIGHLIGHT) */}
            <div className="p-4 rounded-xl bg-[#081414] border border-[#162b29] flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#162b29] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#e6f4f1] uppercase tracking-wider">
                    Engineering Step Breakdown ({timeMetrics.completedSteps}/{timeMetrics.totalSteps} Completed)
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Phase Filter */}
                  <select
                    value={selectedPhaseFilter}
                    onChange={(e) => setSelectedPhaseFilter(e.target.value as any)}
                    className="bg-[#071010] border border-[#162b29] rounded-lg px-2.5 py-1 font-mono text-xs text-[#4cd7f6] focus:outline-none focus:border-[#4cd7f6]"
                  >
                    <option value="ALL">All SDLC Phases</option>
                    <option value="REQUIREMENTS">Requirements</option>
                    <option value="ARCHITECTURE">Architecture</option>
                    <option value="IMPLEMENTATION">Implementation</option>
                    <option value="TESTING">Testing</option>
                    <option value="DEPLOYMENT">Deployment</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>

                  {/* Archetype Presets Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                      className="px-2.5 py-1 rounded-lg bg-[#0e201e] hover:bg-[#162b29] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Zap className="w-3 h-3 text-[#4cd7f6]" />
                      <span>Presets</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {presetDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-64 rounded-xl bg-[#081414] border border-[#4cd7f6]/40 shadow-2xl py-1.5 z-50 flex flex-col font-mono text-xs">
                        <span className="px-3 py-1 text-[10px] text-[#7a9490] uppercase font-bold border-b border-[#162b29]">
                          Architecture Presets
                        </span>
                        {SDLC_ARCHETYPE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset.id)}
                            className="px-3 py-2 text-left hover:bg-[#0e201e] text-[#e6f4f1] flex flex-col gap-0.5 cursor-pointer"
                          >
                            <span className="font-bold text-[#4cd7f6] text-[11px]">{preset.label}</span>
                            <span className="text-[10px] text-[#7a9490] line-clamp-1">{preset.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Decompose Button */}
                  <button
                    type="button"
                    onClick={handleTriggerAiDecompose}
                    disabled={isGeneratingAI}
                    className="px-3 py-1 rounded-lg bg-[#00f5a0]/15 hover:bg-[#00f5a0]/25 border border-[#00f5a0]/40 text-[#00f5a0] font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                    title="Automatically analyze project objective & stack to generate 6-8 atomic SDLC engineering steps"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00f5a0]" />
                        <span>Decomposing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" />
                        <span>AI Decompose Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI DECOMPOSER REVIEW CARD */}
              {showAiModal && aiResult && (
                <div className="p-4 rounded-xl bg-[#081414] border border-[#00f5a0]/50 shadow-2xl flex flex-col gap-3 font-mono animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#162b29] pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00f5a0]" />
                      <span className="text-xs font-bold text-[#00f5a0] uppercase tracking-wider">
                        AI SDLC Breakdown // {aiResult.source === 'gemini' ? 'Gemini Live Architecture' : 'Preset Heuristic'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAiModal(false)}
                      className="p-1 rounded text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#e6f4f1] bg-[#071010] p-2.5 rounded-lg border border-[#4cd7f6]/30 italic">
                    &ldquo;{aiResult.architectureSummary}&rdquo;
                  </p>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {aiResult.steps.map((st, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#050a0a] border border-[#162b29] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] font-bold">
                            {st.sdlcPhase}
                          </span>
                          <span className="text-[#e6f4f1] truncate">{st.title}</span>
                        </div>
                        <span className="text-[10px] text-[#38bdf8] shrink-0 font-mono">
                          {formatDuration(st.estimatedDurationMinutes)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#162b29]">
                    <button
                      type="button"
                      onClick={() => setShowAiModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#0e201e] hover:bg-[#162b29] border border-[#162b29] text-[#7a9490] hover:text-[#e6f4f1] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    {(selectedProject.steps || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleApplyGeneratedSteps('APPEND', aiResult.steps)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 border border-[#38bdf8]/50 text-[#38bdf8] text-xs font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Append ({aiResult.steps.length} Steps)
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleApplyGeneratedSteps('REPLACE', aiResult.steps)}
                      className="px-4 py-1.5 rounded-lg bg-[#00f5a0] hover:bg-[#00d68a] text-[#00281b] text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#00f5a0]/15"
                    >
                      <Check className="w-3.5 h-3.5" /> {(selectedProject.steps || []).length > 0 ? 'Replace All Steps' : 'Apply Steps'}
                    </button>
                  </div>
                </div>
              )}

              {/* Daily Target Cadence Banner */}
              {timeMetrics.todayTargetSteps.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#00f5a0]" />
                    <div>
                      <div className="font-mono text-xs font-bold text-[#00f5a0]">
                        RECOMMENDED CADENCE FOR TODAY: {timeMetrics.todayTargetSteps.length} STEPS
                      </div>
                      <div className="text-[11px] text-[#7a9490]">
                        Estimated Time for Today&apos;s Target:{' '}
                        <strong className="text-[#e6f4f1]">{formatDuration(timeMetrics.todayTotalMinutes)}</strong>{' '}
                        across {timeMetrics.todayTargetSteps.length} atomic execution steps.
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00f5a0]/20 text-[#00f5a0] font-bold shrink-0">
                    TARGET VELOCITY: {timeMetrics.dailyTarget} STEPS / DAY
                  </span>
                </div>
              )}

              {/* Steps List */}
              <div className="space-y-2">
                {(selectedProject.steps || [])
                  .filter((s) => selectedPhaseFilter === 'ALL' || s.sdlcPhase === selectedPhaseFilter)
                  .map((step) => {
                    const isTodayTarget =
                      !step.completed &&
                      timeMetrics.todayTargetSteps.some((ts) => ts.id === step.id);
                    const isEditing = editingStepId === step.id;

                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          step.completed
                            ? 'bg-[#060d0d] border-[#162b29] opacity-75'
                            : isTodayTarget
                            ? 'bg-[#091b16] border-[#00f5a0]/50 shadow-[0_0_10px_rgba(0,245,160,0.1)]'
                            : 'bg-[#0b1a19] border-[#162b29] hover:border-[#38bdf8]/40'
                        }`}
                      >
                        {isEditing ? (
                          /* Inline Step Editor */
                          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={editStepTitle}
                              onChange={(e) => setEditStepTitle(e.target.value)}
                              className="flex-1 bg-[#050a0a] border border-[#38bdf8]/50 rounded-lg px-2.5 py-1 text-xs text-[#e6f4f1]"
                            />
                            <select
                              value={editStepPhase}
                              onChange={(e) => setEditStepPhase(e.target.value as SDLCPhase)}
                              className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-[11px] text-[#38bdf8]"
                            >
                              {SDLC_PHASES.map((p) => (
                                <option key={p.phase} value={p.phase}>
                                  {p.short}
                                </option>
                              ))}
                            </select>
                            <select
                              value={editStepDuration}
                              onChange={(e) => setEditStepDuration(Number(e.target.value))}
                              className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#00f5a0] focus:outline-none focus:border-[#38bdf8]"
                            >
                              {ATOMIC_STEP_DURATIONS.map((d) => (
                                <option key={d.minutes} value={d.minutes}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEditStep(step.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#38bdf8] text-[#00281b] font-mono text-[11px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingStepId(null)}
                                className="px-2 py-1 rounded-lg bg-[#0e201e] border border-[#162b29] text-[#7a9490] font-mono text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Step Display */
                          <>
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <button
                                onClick={() => handleToggleStep(selectedProject, step.id)}
                                className="mt-0.5 sm:mt-0 p-0.5 text-[#7a9490] hover:text-[#00f5a0] cursor-pointer shrink-0"
                                title={step.completed ? 'Mark step incomplete' : 'Complete step & iterate progress'}
                              >
                                {step.completed ? (
                                  <CheckSquare className="w-5 h-5 text-[#00f5a0]" />
                                ) : (
                                  <Square className="w-5 h-5 text-[#7a9490]" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                      step.sdlcPhase === 'REQUIREMENTS'
                                        ? 'bg-[#a78bfa]/15 text-[#a78bfa]'
                                        : step.sdlcPhase === 'ARCHITECTURE'
                                        ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                                        : step.sdlcPhase === 'IMPLEMENTATION'
                                        ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                                        : step.sdlcPhase === 'TESTING'
                                        ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                                        : step.sdlcPhase === 'DEPLOYMENT'
                                        ? 'bg-[#f43f5e]/15 text-[#f43f5e]'
                                        : 'bg-[#7a9490]/15 text-[#7a9490]'
                                    }`}
                                  >
                                    {step.sdlcPhase}
                                  </span>

                                  {isTodayTarget && (
                                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#00f5a0]/20 text-[#00f5a0] font-bold border border-[#00f5a0]/40 flex items-center gap-1">
                                      <Flame className="w-2.5 h-2.5" /> TODAY&apos;S CADENCE TARGET
                                    </span>
                                  )}
                                </div>

                                <div
                                  className={`text-xs sm:text-sm font-semibold mt-1 leading-snug ${
                                    step.completed
                                      ? 'line-through text-[#7a9490]'
                                      : 'text-[#e6f4f1]'
                                  }`}
                                >
                                  {step.title}
                                </div>
                              </div>
                            </div>

                            {/* Duration & Actions */}
                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono text-xs">
                              {/* Step Duration Badge */}
                              <span
                                className="px-2 py-1 rounded bg-[#050a0a] border border-[#162b29] text-[#00f5a0] font-bold flex items-center gap-1 text-[11px]"
                                title="Estimated time to complete this step"
                              >
                                <Clock className="w-3 h-3 text-[#00f5a0]" />
                                {formatDuration(step.estimatedDurationMinutes || 60)}
                              </span>

                              <button
                                onClick={() => {
                                  setEditingStepId(step.id);
                                  setEditStepTitle(step.title);
                                  setEditStepDuration(step.estimatedDurationMinutes || 60);
                                  setEditStepPhase(step.sdlcPhase);
                                }}
                                className="p-1 text-[#7a9490] hover:text-[#38bdf8] cursor-pointer"
                                title="Edit step"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteStep(selectedProject, step.id)}
                                className="p-1 text-[#7a9490] hover:text-[#f43f5e] cursor-pointer"
                                title="Delete step"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Add New Step Form */}
              <form
                onSubmit={handleAddStep}
                className="p-3.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col gap-2.5 pt-3"
              >
                <span className="font-mono text-[10px] text-[#00f5a0] uppercase font-bold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Engineering Step (SDLC-Bound)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    required
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Describe specific engineering task or verification step..."
                    className="sm:col-span-6 bg-[#050a0a] border border-[#162b29] rounded-lg px-3 py-1.5 text-xs text-[#e6f4f1] focus:outline-none focus:border-[#00f5a0]"
                  />
                  <select
                    value={newStepPhase}
                    onChange={(e) => setNewStepPhase(e.target.value as SDLCPhase)}
                    className="sm:col-span-3 bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1.5 font-mono text-xs text-[#38bdf8] focus:outline-none focus:border-[#00f5a0]"
                  >
                    {SDLC_PHASES.map((p) => (
                      <option key={p.phase} value={p.phase}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newStepDurationMinutes}
                    onChange={(e) => setNewStepDurationMinutes(Number(e.target.value))}
                    className="sm:col-span-2 bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1.5 font-mono text-xs text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                  >
                    {ATOMIC_STEP_DURATIONS.map((d) => (
                      <option key={d.minutes} value={d.minutes}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="sm:col-span-1 px-3 py-1.5 rounded-lg bg-[#00f5a0] text-[#00281b] font-mono text-xs font-bold cursor-pointer hover:bg-[#00d68a] flex items-center justify-center gap-1 shadow-md shadow-[#00f5a0]/15"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Contextual Quick-Add Chips for current phase */}
                {PHASE_QUICK_CHIPS[newStepPhase] && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#162b29]">
                    <span className="font-mono text-[9px] text-[#7a9490] uppercase flex items-center gap-1 mr-1">
                      <Zap className="w-2.5 h-2.5 text-[#00f5a0]" /> Quick Add ({newStepPhase}):
                    </span>
                    {PHASE_QUICK_CHIPS[newStepPhase].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddQuickChip(chip.label, newStepPhase, chip.duration)}
                        className="px-2 py-0.5 rounded bg-[#050a0a] hover:bg-[#0e201e] border border-[#162b29] hover:border-[#00f5a0]/50 text-[#e6f4f1] text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Click to add this step immediately"
                      >
                        <Plus className="w-2.5 h-2.5 text-[#00f5a0]" />
                        <span className="truncate max-w-[200px] sm:max-w-none">{chip.label}</span>
                        <span className="text-[#38bdf8] text-[9px]">({chip.duration}m)</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* E. CONNECTED LEARNING TOPICS & EVIDENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#a78bfa] uppercase font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Connected Retrieval Topics ({linkedTopicsForSelected.length})
                </span>
                {linkedTopicsForSelected.length > 0 ? (
                  <div className="space-y-1.5">
                    {linkedTopicsForSelected.map((lt) => (
                      <div
                        key={lt.id}
                        className="p-2 rounded-lg bg-[#050a0a] border border-[#162b29] text-xs text-[#e6f4f1] flex items-center justify-between"
                      >
                        <span className="truncate">{lt.topic}</span>
                        <span className="font-mono text-[10px] text-[#00f5a0] ml-2 shrink-0">
                          {lt.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[#7a9490]">
                    Link concepts in Module 03 to this project to track applied engineering mastery.
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b1a19] border border-[#162b29] flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#00f5a0] uppercase font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Verified Evidence &amp; Deployment Artifacts ({selectedProject.evidence.length})
                </span>
                <div className="space-y-1.5">
                  {selectedProject.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded-lg bg-[#050a0a] border border-[#162b29] flex items-center justify-between gap-2 font-mono text-[10px]"
                    >
                      <span className="text-[#00f5a0] font-bold">{ev.label}:</span>
                      <span className="text-[#7a9490] truncate">{ev.urlOrContent}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddEvidence} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newEvidenceLabel}
                    onChange={(e) => setNewEvidenceLabel(e.target.value)}
                    placeholder="Label (e.g. Repo URL)"
                    className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    placeholder="URL or benchmark..."
                    className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 text-xs text-[#e6f4f1] focus:border-[#00f5a0] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-lg bg-[#00f5a0]/20 text-[#00f5a0] border border-[#00f5a0]/40 font-mono text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Evidence
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TOAST FEEDBACK NOTIFICATION                                           */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#091814] border border-[#00f5a0]/60 text-[#d0fbe0] font-mono text-xs shadow-[0_0_20px_rgba(0,245,160,0.25)] animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#00f5a0] shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 ml-2 rounded hover:bg-[#0c221a] text-[#7a9490] hover:text-[#00f5a0] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: NEW PROJECT INITIATIVE / RFC                                     */}
      {/* ========================================================================= */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0d1616] border border-[#00f5a0]/40 shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#162b29] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                  CREATE ENGINEERING INITIATIVE
                </span>
                <h3 className="text-xl font-black text-[#e6f4f1] font-mono mt-0.5">
                  New Project RFC
                </h3>
                <p className="text-xs text-[#7a9490]">
                  Decompose requirements, assign milestones, and schedule SDLC delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="p-1.5 rounded-lg bg-[#142323] hover:bg-[#1a2f2f] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="flex flex-col gap-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#7a9490] uppercase font-bold">
                    Project Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value)}
                    placeholder="e.g. P08"
                    className="bg-[#071010] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3 py-2 text-[#00f5a0] font-bold text-xs focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[10px] text-[#7a9490] uppercase font-bold">
                    Target Timeline Span
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectTimeline}
                    onChange={(e) => setNewProjectTimeline(e.target.value)}
                    placeholder="e.g. 6–10 weeks"
                    className="bg-[#071010] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3 py-2 text-[#e6f4f1] text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#7a9490] uppercase font-bold">
                  Project Title / Mission
                </label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Real-Time Telemetry & Observability Bus"
                  className="bg-[#071010] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3 py-2 text-[#e6f4f1] font-semibold text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#7a9490] uppercase font-bold">
                  Objective &amp; Architectural Scope
                </label>
                <textarea
                  rows={3}
                  value={newProjectObjective}
                  onChange={(e) => setNewProjectObjective(e.target.value)}
                  placeholder="Describe technical goals, system boundaries, and measurable deliverables..."
                  className="bg-[#071010] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3 py-2 text-[#e6f4f1] text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#7a9490] uppercase font-bold">
                  Target Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={newProjectTechs}
                  onChange={(e) => setNewProjectTechs(e.target.value)}
                  placeholder="e.g. TypeScript, React, Go, Docker"
                  className="bg-[#071010] border border-[#162b29] focus:border-[#00f5a0] rounded-lg px-3 py-2 text-[#38bdf8] text-xs focus:outline-none"
                />
              </div>

              {/* Quick Template Fill Shortcut */}
              <div className="p-3 rounded-xl bg-[#071212] border border-[#162b29] space-y-2">
                <span className="text-[10px] text-[#55736f] uppercase block font-bold">
                  Or quick-populate from archetype:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setNewProjectTitle(tpl.title);
                        setNewProjectObjective(tpl.objective);
                        setNewProjectTimeline(tpl.timeline);
                        setNewProjectTechs(tpl.technologies.join(', '));
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#0a1818] hover:bg-[#00f5a0]/15 hover:border-[#00f5a0]/40 border border-[#1a2e2c] text-[#7a9490] hover:text-[#00f5a0] text-[10px] transition-colors cursor-pointer"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#162b29]">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#142323] hover:bg-[#1a2f2f] text-[#7a9490] hover:text-[#e6f4f1] text-xs cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] text-xs font-black cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.3)] flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Initiative</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: INTERACTIVE MULTI-PROJECT TIMELINE / GANTT ROADMAP               */}
      {/* ========================================================================= */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-5xl rounded-2xl bg-[#091414] border border-[#00f5a0]/40 shadow-2xl p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#162b29] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                  PORTFOLIO EXECUTION HORIZON
                </span>
                <h3 className="text-xl font-black text-[#e6f4f1] font-mono mt-0.5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00f5a0]" />
                  Multi-Project Milestone Gantt
                </h3>
                <p className="text-xs text-[#7a9490]">
                  Integrated timeline roadmap across all pipeline initiatives with progress tracking and delivery targets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTimelineModal(false)}
                className="p-1.5 rounded-lg bg-[#142323] hover:bg-[#1a2f2f] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#55736f] uppercase font-bold mr-1">Filter:</span>
                {(['ALL', 'ACTIVE', 'READY', 'QUEUED', 'COMPLETED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTimelineStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      timelineStatusFilter === st
                        ? 'bg-[#00f5a0] text-[#021810] font-black'
                        : 'bg-[#060e0e] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#7a9490]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00f5a0]" /> In Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" /> Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#64748b]" /> Queued
                </span>
              </div>
            </div>

            {/* Gantt Timeline View */}
            <div className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-3 font-mono">
              {/* Months header */}
              <div className="grid grid-cols-12 gap-1 text-[11px] text-[#55736f] border-b border-[#162b29] pb-2 font-bold uppercase tracking-wider">
                <div className="col-span-4 sm:col-span-3 text-[#7a9490]">Project / Code</div>
                <div className="col-span-8 sm:col-span-9 grid grid-cols-6 text-center text-[10px]">
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                  <span>Jan</span>
                  <span>Feb</span>
                </div>
              </div>

              {/* Project Gantt Rows */}
              <div className="space-y-3 relative">
                {/* Today Indicator Line */}
                <div className="absolute top-0 bottom-0 left-[55%] sm:left-[52%] w-px border-r-2 border-dashed border-[#00f5a0]/60 z-10 pointer-events-none">
                  <span className="absolute -top-3.5 -left-4 px-1 rounded bg-[#00f5a0] text-[#021810] text-[8px] font-black uppercase">
                    Today
                  </span>
                </div>

                {(state.projects || [])
                  .filter((p) => {
                    if (timelineStatusFilter === 'ALL') return true;
                    if (timelineStatusFilter === 'ACTIVE') return p.status === 'IN PROGRESS';
                    if (timelineStatusFilter === 'READY') return p.status === 'READY' || p.phaseTag === 'PLANNED';
                    if (timelineStatusFilter === 'QUEUED') return p.status === 'QUEUED';
                    if (timelineStatusFilter === 'COMPLETED') return p.status === 'COMPLETED';
                    return true;
                  })
                  .map((p, idx) => {
                    const offsets = ['10%', '25%', '35%', '45%', '15%', '30%', '50%'];
                    const widths = ['55%', '50%', '45%', '40%', '65%', '45%', '35%'];
                    const leftOffset = offsets[idx % offsets.length];
                    const barWidth = widths[idx % widths.length];
                    const completedSteps = (p.steps || []).filter((s) => s.completed).length;

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowTimelineModal(false);
                          openProjectModal(p);
                        }}
                        className="grid grid-cols-12 gap-1 items-center p-2 rounded-lg hover:bg-[#0c1818] transition-colors cursor-pointer group"
                      >
                        <div className="col-span-4 sm:col-span-3 pr-2 truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#142323] text-[#38bdf8] border border-[#38bdf8]/30">
                              {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                            </span>
                            <span className="text-xs font-bold text-[#e6f4f1] group-hover:text-[#00f5a0] transition-colors truncate">
                              {p.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#55736f] block truncate">
                            {p.spanText || 'Span: 8 weeks'} • {completedSteps}/{(p.steps || []).length} steps
                          </span>
                        </div>

                        <div className="col-span-8 sm:col-span-9 h-7 bg-[#040808] rounded-md relative flex items-center px-1 overflow-hidden">
                          <div
                            className={`h-5 rounded-md flex items-center justify-between px-2 text-[10px] font-bold transition-all shadow-sm ${
                              p.status === 'IN PROGRESS'
                                ? 'bg-gradient-to-r from-[#00f5a0]/90 to-[#38bdf8]/90 text-[#021810]'
                                : p.status === 'COMPLETED'
                                ? 'bg-[#38bdf8] text-[#021810]'
                                : 'bg-[#1a2c2a] text-[#7a9490] border border-[#2b4442]'
                            }`}
                            style={{
                              marginLeft: leftOffset,
                              width: barWidth,
                            }}
                          >
                            <span className="truncate">{p.currentMilestone || p.status}</span>
                            <span className="shrink-0 ml-1">{p.progress}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#162b29] font-mono text-xs">
              <span className="text-[#55736f] text-[11px]">
                Click any project bar to open full SDLC decomposition &amp; execution gates.
              </span>
              <button
                type="button"
                onClick={() => setShowTimelineModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#142323] hover:bg-[#1a2f2f] text-[#e6f4f1] cursor-pointer font-bold"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: PRODUCTION PROJECT TEMPLATES ARCHETYPES                          */}
      {/* ========================================================================= */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-4xl rounded-2xl bg-[#091414] border border-[#00f5a0]/40 shadow-2xl p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#162b29] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                  PRODUCTION ARCHETYPES
                </span>
                <h3 className="text-xl font-black text-[#e6f4f1] font-mono mt-0.5 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#f59e0b]" />
                  Engineering Project Templates
                </h3>
                <p className="text-xs text-[#7a9490]">
                  Instantiate battle-tested SDLC blueprints with pre-decomposed requirements, architecture, implementation, and verification steps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="p-1.5 rounded-lg bg-[#142323] hover:bg-[#1a2f2f] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRESET_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] hover:border-[#00f5a0]/40 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#142323] text-[#38bdf8] font-mono text-[10px] font-bold border border-[#38bdf8]/30">
                        {tpl.code}
                      </span>
                      <span className="text-[10px] font-mono text-[#55736f]">
                        Span: {tpl.timeline}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-[#e6f4f1] font-mono group-hover:text-[#00f5a0] transition-colors">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-[#7a9490] leading-relaxed">
                      {tpl.objective}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tpl.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-[#0b1b1b] text-[#38bdf8] text-[9px] font-mono border border-[#162b29]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Decomposed steps preview */}
                    <div className="p-2.5 rounded-lg bg-[#040808] border border-[#122222] space-y-1.5 font-mono text-[10px]">
                      <span className="text-[#55736f] uppercase font-bold text-[9px] block">
                        Decomposed SDLC Steps ({tpl.steps.length}):
                      </span>
                      {tpl.steps.slice(0, 3).map((st, i) => (
                        <div key={i} className="flex items-center justify-between text-[#a1b8b4] truncate">
                          <span className="truncate pr-2">• {st.title}</span>
                          <span className="text-[#00f5a0] shrink-0 font-bold">{st.phase}</span>
                        </div>
                      ))}
                      {tpl.steps.length > 3 && (
                        <span className="text-[#55736f] text-[9px] block">
                          + {tpl.steps.length - 3} additional testing &amp; deployment steps
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#122222] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#55736f]">
                      Ready to instantiate
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInstantiateTemplate(tpl)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.25)] transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Instantiate Template</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#162b29]">
              <button
                type="button"
                onClick={() => setShowTemplatesModal(false)}
                className="px-4 py-2 rounded-xl bg-[#142323] hover:bg-[#1a2f2f] text-[#e6f4f1] font-mono text-xs cursor-pointer font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: SYSTEM ARCHITECTURE DEPENDENCY & BLOCKER MAP                     */}
      {/* ========================================================================= */}
      {showDependencyMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-4xl rounded-2xl bg-[#091414] border border-[#00f5a0]/40 shadow-2xl p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#162b29] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#00f5a0] uppercase tracking-wider block">
                  SYSTEM ARCHITECTURE &amp; CRITICAL PATH
                </span>
                <h3 className="text-xl font-black text-[#e6f4f1] font-mono mt-0.5 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#a855f7]" />
                  Project Dependency &amp; Blocker Matrix
                </h3>
                <p className="text-xs text-[#7a9490]">
                  Track prerequisite architectural foundations, identify blocked initiatives, and prioritize critical path delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDependencyMapModal(false)}
                className="p-1.5 rounded-lg bg-[#142323] hover:bg-[#1a2f2f] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[10px] text-[#55736f] uppercase font-bold mr-1">View Mode:</span>
              {(['ALL', 'BLOCKED', 'CRITICAL'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDependencyFilter(mode)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    dependencyFilter === mode
                      ? 'bg-[#a855f7] text-white font-black'
                      : 'bg-[#060e0e] text-[#7a9490] hover:text-[#e6f4f1] border border-[#162b29]'
                  }`}
                >
                  {mode === 'ALL' ? 'All Relationships' : mode === 'BLOCKED' ? 'Blocked Initiatives' : 'Critical Path'}
                </button>
              ))}
            </div>

            {/* Dependency Matrix Cards */}
            <div className="space-y-3 font-mono">
              {(state.projects || []).map((p) => {
                const prereqIds = projectDependencies[p.id] || [];
                const prereqProjects = (state.projects || []).filter((other) => prereqIds.includes(other.id));
                const isBlocked = prereqProjects.some((pr) => pr.status !== 'COMPLETED');
                const isPrereqForOthers = (state.projects || []).filter((other) =>
                  (projectDependencies[other.id] || []).includes(p.id)
                );

                if (dependencyFilter === 'BLOCKED' && !isBlocked) return null;
                if (dependencyFilter === 'CRITICAL' && isPrereqForOthers.length === 0 && !isBlocked) return null;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-[#060e0e] border border-[#162b29] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded bg-[#142323] text-[#38bdf8] text-[10px] font-bold border border-[#38bdf8]/30">
                          {p.code.replace(/PROJECT\s*/i, 'P0').slice(0, 4)}
                        </span>
                        <div>
                          <h4
                            onClick={() => {
                              setShowDependencyMapModal(false);
                              openProjectModal(p);
                            }}
                            className="text-xs sm:text-sm font-bold text-[#e6f4f1] hover:text-[#00f5a0] transition-colors cursor-pointer"
                          >
                            {p.title}
                          </h4>
                          <span className="text-[10px] text-[#55736f]">
                            Status: {p.status} • {p.progress}% complete
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isBlocked ? (
                          <span className="px-2 py-0.5 rounded bg-[#ff5c5c]/15 text-[#ff5c5c] text-[10px] font-bold border border-[#ff5c5c]/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Blocked by Prereq
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#00f5a0]/15 text-[#00f5a0] text-[10px] font-bold border border-[#00f5a0]/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Unblocked / Ready
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setShowDependencyMapModal(false);
                            openProjectModal(p);
                          }}
                          className="px-2.5 py-1 rounded bg-[#0e1f1f] hover:bg-[#142d2d] text-[#00f5a0] text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Open SDLC →
                        </button>
                      </div>
                    </div>

                    {/* Prerequisites Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#122222]">
                      <div className="p-2.5 rounded-lg bg-[#040808] border border-[#162b29] space-y-1.5">
                        <span className="text-[9px] text-[#7a9490] uppercase font-bold block">
                          Requires Completion Of (Prerequisites):
                        </span>
                        {prereqProjects.length > 0 ? (
                          prereqProjects.map((pr) => (
                            <div
                              key={pr.id}
                              className="flex items-center justify-between text-[11px] p-1 rounded bg-[#081212] border border-[#162b29]"
                            >
                              <span className="text-[#e6f4f1] truncate">{pr.code}: {pr.title}</span>
                              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    pr.status === 'COMPLETED'
                                      ? 'bg-[#00f5a0]/20 text-[#00f5a0]'
                                      : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                                  }`}
                                >
                                  {pr.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleDependency(p.id, pr.id)}
                                  className="text-[#ff5c5c] hover:bg-[#ff5c5c]/20 rounded p-0.5 cursor-pointer"
                                  title="Unlink dependency"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#55736f]">No prerequisites required (Independent root)</span>
                        )}

                        {/* Add prerequisite selector */}
                        <div className="pt-1">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleToggleDependency(p.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="w-full bg-[#071313] border border-[#1a2e2c] rounded px-2 py-1 text-[10px] text-[#7a9490] focus:text-[#00f5a0] cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              + Add prerequisite project dependency...
                            </option>
                            {(state.projects || [])
                              .filter((other) => other.id !== p.id && !prereqIds.includes(other.id))
                              .map((other) => (
                                <option key={other.id} value={other.id}>
                                  {other.code}: {other.title}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#040808] border border-[#162b29] space-y-1.5">
                        <span className="text-[9px] text-[#7a9490] uppercase font-bold block">
                          Blocks Downstream Initiatives ({isPrereqForOthers.length}):
                        </span>
                        {isPrereqForOthers.length > 0 ? (
                          isPrereqForOthers.map((ds) => (
                            <div
                              key={ds.id}
                              className="flex items-center justify-between text-[11px] p-1 rounded bg-[#081212] border border-[#162b29]"
                            >
                              <span className="text-[#e6f4f1] truncate">{ds.code}: {ds.title}</span>
                              <span className="text-[9px] text-[#a855f7] font-bold">Depends on {p.code}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#55736f]">No downstream projects blocked by this initiative</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#162b29] font-mono text-xs">
              <span className="text-[#55736f] text-[11px]">
                Dependencies enforce SDLC sequencing and highlight pipeline bottlenecks.
              </span>
              <button
                type="button"
                onClick={() => setShowDependencyMapModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#142323] hover:bg-[#1a2f2f] text-[#e6f4f1] cursor-pointer font-bold"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
