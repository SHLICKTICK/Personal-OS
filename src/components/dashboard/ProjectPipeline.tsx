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
} from 'lucide-react';
import {
  POSState,
  Project,
  ProjectStep,
  SDLCPhase,
} from '../../models/types';

interface ProjectPipelineProps {
  state: POSState;
  onUpdateProject: (project: Project) => void;
  onToggleGlobalDoDGate: (gateId: string) => void;
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

export const ProjectPipeline: React.FC<ProjectPipelineProps> = ({
  state,
  onUpdateProject,
  onToggleGlobalDoDGate,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  const selectedProject = state.projects.find((p) => p.id === selectedProjectId) || null;

  // Open modal and initialize editable time span states
  const openProjectModal = (proj: Project) => {
    setSelectedProjectId(proj.id);
    setIsEditingTimeSpan(false);
    setEditStartDate(proj.startDate || '2026-09-01');
    setEditTargetDeadline(proj.targetDeadline || '2026-10-31');
    setEditSpanText(proj.spanText || 'Span: 8 Weeks');
    setEditDailyCapacity(proj.dailyCapacitySteps || 2);
    setEditingStepId(null);
    setSelectedPhaseFilter('ALL');
    setNewTechInput('');
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

  const handleToggleProjectDoD = (project: Project, gateId: string) => {
    const exists = project.dodPassedIds.includes(gateId);
    const nextDod = exists
      ? project.dodPassedIds.filter((id) => id !== gateId)
      : [...project.dodPassedIds, gateId];
    onUpdateProject({
      ...project,
      dodPassedIds: nextDod,
      updatedAt: new Date().toISOString(),
    });
  };

  const linkedTopicsForSelected = selectedProject
    ? state.learningTopics.filter((t) => t.linkedProjectId === selectedProject.id)
    : [];

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/85 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-6"
      id="milestone-projects"
    >
      {/* 1. Header & Executive SDLC Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#3c4a42]/20 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[11px] text-[#4edea3] font-bold tracking-wider">
              MODULE 04
            </span>
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-wider font-semibold">
              SDLC LIFECYCLE &amp; STEP EXECUTION ENGINE
            </span>
          </div>
          <h2 className="text-[22px] sm:text-[24px] text-[#e2e2e8] font-bold tracking-tight mt-1">
            Engineering &amp; Milestone Projects Pipeline
          </h2>
          <p className="text-xs text-[#bbcabf] max-w-2xl mt-0.5">
            Every project follows the full Software Development Life Cycle (SDLC). Customize completion time spans,
            edit technologies used, break down initiatives into time-estimated steps, and track daily capacity velocity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-[#bbcabf]">DoD Gate Policy:</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
              14-POINT DoD GATES ENFORCED
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pipeline Projects Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {state.projects.map((proj) => {
          const isCompleted = proj.status === 'COMPLETED';
          const isInProgress = proj.status === 'IN PROGRESS';
          const steps = proj.steps || [];
          const completedStepsCount = steps.filter((s) => s.completed).length;

          return (
            <div
              key={proj.id}
              onClick={() => openProjectModal(proj)}
              className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer group border ${
                isInProgress
                  ? 'bg-[#22252a] border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.15)]'
                  : isCompleted
                  ? 'bg-[#1a1c20] border-[#4edea3]/50 hover:border-[#4edea3]'
                  : 'bg-[#181a1d] border-[#3c4a42]/40 opacity-90 hover:opacity-100 hover:border-[#4cd7f6]/50'
              }`}
            >
              <div className="flex flex-col gap-2.5">
                {/* Code, Status, and SDLC Phase */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isCompleted
                        ? 'text-[#4edea3]'
                        : isInProgress
                        ? 'text-[#4cd7f6]'
                        : 'text-[#bbcabf]'
                    }`}
                  >
                    {proj.code}
                  </span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                        : isInProgress
                        ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40 animate-pulse'
                        : 'bg-[#282a2e] text-[#bbcabf]'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                {/* Title & Objective */}
                <div>
                  <h3 className="text-[15px] font-bold text-[#e2e2e8] group-hover:text-[#4edea3] transition-colors leading-snug">
                    {proj.title}
                  </h3>
                  <p className="text-[11px] text-[#bbcabf] line-clamp-2 mt-1 leading-relaxed">
                    {proj.objective}
                  </p>
                </div>

                {/* SDLC Active Phase Tag */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#0c0e12] border border-[#3c4a42]/50 text-[#4edea3] font-bold flex items-center gap-1 truncate">
                    <Target className="w-2.5 h-2.5 shrink-0" />
                    SDLC: {proj.currentSDLCPhase || 'REQUIREMENTS'}
                  </span>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                  {proj.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-1.5 py-0.5 rounded bg-[#0c0e12] text-[#86948a] border border-[#3c4a42]/30"
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.technologies.length > 3 && (
                    <span className="px-1 py-0.5 text-[#86948a]">
                      +{proj.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Telemetry: Time Span & Dynamic Iterating Progress */}
              <div className="mt-4 pt-2.5 border-t border-[#3c4a42]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#bbcabf]">
                  <span className="flex items-center gap-1 truncate text-[#bbcabf]" title={proj.spanText}>
                    <Calendar className="w-3 h-3 text-[#4cd7f6] shrink-0" />
                    <span className="truncate">{proj.spanText || 'Span: 8 Weeks'}</span>
                  </span>
                  <span className="text-[#86948a] shrink-0">
                    ⚡ {proj.dailyCapacitySteps || 2}/day
                  </span>
                </div>

                {/* Iterating Progress Bar */}
                <div className="w-full h-1.5 bg-[#0c0e12] rounded-full overflow-hidden border border-[#3c4a42]/30">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#4edea3]'
                        : isInProgress
                        ? 'bg-[#4cd7f6]'
                        : 'bg-[#bbcabf]'
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#86948a]">
                    {steps.length > 0 ? `${completedStepsCount}/${steps.length} Steps` : 'Milestones'}
                  </span>
                  <span
                    className={`font-bold tabular-nums ${
                      isCompleted
                        ? 'text-[#4edea3]'
                        : isInProgress
                        ? 'text-[#4cd7f6]'
                        : 'text-[#86948a]'
                    }`}
                  >
                    {proj.progress}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Global 14-Point Definition of Done Gate Checklist */}
      <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
            14-Point Production Definition of Done (DoD) Protocol (Click gate to verify globally)
          </span>
          <span className="font-mono text-[10px] text-[#bbcabf] tabular-nums">
            {state.dodGateProtocol.filter((g) => g.passed).length}/14 GATES PASSED // ZERO WARNINGS &amp; STRICT COMPLIANCE
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {state.dodGateProtocol.map((gate) => (
            <button
              key={gate.id}
              onClick={() => onToggleGlobalDoDGate(gate.id)}
              title={gate.description}
              className={`p-2 rounded border transition-all flex items-center gap-2 text-left cursor-pointer ${
                gate.passed
                  ? 'bg-[#1e2024] border-[#3c4a42]/40 hover:border-[#4edea3]'
                  : 'bg-[#1a1c20]/50 border-[#ffb4ab]/30 opacity-70 hover:opacity-100'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  gate.passed
                    ? 'bg-[#4edea3] text-[#003824]'
                    : 'bg-[#282a2e] text-[#86948a]'
                }`}
              >
                {gate.passed ? '✓' : '·'}
              </span>
              <span className="font-mono text-[10px] text-[#e2e2e8] truncate">
                {gate.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Comprehensive Interactive Project Detail Modal */}
      {selectedProject && timeMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-xl bg-[#1a1c20] border border-[#4cd7f6]/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#3c4a42]/30 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#4edea3] font-bold">
                    {selectedProject.code}
                  </span>
                  <span>//</span>
                  <span className="text-[#4cd7f6]">{selectedProject.status}</span>
                  <span>//</span>
                  <span className="text-[#bbcabf]">{selectedProject.spanText}</span>
                </div>
                <h3 className="text-xl font-bold text-[#e2e2e8] mt-1">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-[#bbcabf] mt-0.5">
                  {selectedProject.objective}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-1.5 rounded bg-[#282a2e] text-[#bbcabf] hover:text-[#e2e2e8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* A. TIME SPAN & DAILY CADENCE ENGINE BAR */}
            <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#4cd7f6]/40 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/30 pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4cd7f6]" />
                  <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                    Project Time Span &amp; Cadence Velocity
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingTimeSpan(!isEditingTimeSpan)}
                  className="px-2.5 py-1 rounded bg-[#1e2024] hover:bg-[#282a2e] border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  {isEditingTimeSpan ? 'Close Span Editor' : 'Change Time Span'}
                </button>
              </div>

              {/* Time Span Editor Drawer */}
              {isEditingTimeSpan ? (
                <form
                  onSubmit={handleSaveTimeSpan}
                  className="p-3.5 rounded-lg bg-[#16181d] border border-[#3c4a42]/50 flex flex-col gap-3 animate-fadeIn"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={editTargetDeadline}
                        onChange={(e) => setEditTargetDeadline(e.target.value)}
                        className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#4edea3] focus:outline-none focus:border-[#4edea3]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                        Time Span Label
                      </label>
                      <input
                        type="text"
                        value={editSpanText}
                        onChange={(e) => setEditSpanText(e.target.value)}
                        placeholder="e.g. Span: 8 Weeks"
                        className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4cd7f6]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                        Daily Capacity (Steps/Day)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editDailyCapacity}
                        onChange={(e) => setEditDailyCapacity(Number(e.target.value))}
                        className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#4edea3] focus:outline-none focus:border-[#4edea3]"
                      />
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#3c4a42]/30">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className="text-[#86948a]">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(2)}
                        className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/40 cursor-pointer"
                      >
                        2 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(4)}
                        className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/40 cursor-pointer"
                      >
                        4 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(8)}
                        className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/40 cursor-pointer"
                      >
                        8 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(12)}
                        className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/40 cursor-pointer"
                      >
                        12 Weeks
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimeSpanPreset(24)}
                        className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] border border-[#3c4a42]/40 cursor-pointer"
                      >
                        6 Months
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingTimeSpan(false)}
                        className="px-3 py-1 rounded bg-[#1e2024] text-[#bbcabf] font-mono text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 rounded bg-[#4cd7f6] hover:bg-[#38c2e0] text-[#003824] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Time Span
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Dynamic Telemetry Display */
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-2.5 rounded bg-[#16181d] border border-[#3c4a42]/30 flex flex-col">
                    <span className="font-mono text-[9px] text-[#86948a] uppercase">
                      Timeline Span
                    </span>
                    <span className="font-mono text-xs font-bold text-[#e2e2e8] mt-0.5">
                      {selectedProject.spanText || `${timeMetrics.totalWeeks} Weeks`}
                    </span>
                    <span className="font-mono text-[9px] text-[#bbcabf] mt-0.5">
                      {selectedProject.startDate || 'Started'} → {selectedProject.targetDeadline || 'Deadline'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#16181d] border border-[#3c4a42]/30 flex flex-col">
                    <span className="font-mono text-[9px] text-[#86948a] uppercase">
                      Days to Deadline
                    </span>
                    <span
                      className={`font-mono text-xs font-bold mt-0.5 ${
                        timeMetrics.daysRemaining <= 7
                          ? 'text-[#ffb4ab]'
                          : timeMetrics.daysRemaining <= 21
                          ? 'text-[#c9a227]'
                          : 'text-[#4edea3]'
                      }`}
                    >
                      {timeMetrics.daysRemaining > 0
                        ? `${timeMetrics.daysRemaining} Days Left`
                        : 'Due / Overdue'}
                    </span>
                    <span className="font-mono text-[9px] text-[#86948a] mt-0.5">
                      Target: {selectedProject.targetDeadline || 'Scheduled'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#16181d] border border-[#3c4a42]/30 flex flex-col">
                    <span className="font-mono text-[9px] text-[#86948a] uppercase">
                      Daily Step Velocity
                    </span>
                    <span className="font-mono text-xs font-bold text-[#4cd7f6] mt-0.5">
                      {timeMetrics.dailyTarget} Steps / Day
                    </span>
                    <span className="font-mono text-[9px] text-[#86948a] mt-0.5">
                      Recommended Daily Pace
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#16181d] border border-[#3c4a42]/30 flex flex-col">
                    <span className="font-mono text-[9px] text-[#86948a] uppercase">
                      Work Days Needed
                    </span>
                    <span className="font-mono text-xs font-bold text-[#e2e2e8] mt-0.5">
                      ~{timeMetrics.daysNeededAtPace} Days
                    </span>
                    <span className="font-mono text-[9px] text-[#86948a] mt-0.5">
                      {timeMetrics.remainingSteps} open steps @ {timeMetrics.dailyTarget}/day
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#16181d] border border-[#3c4a42]/30 flex flex-col">
                    <span className="font-mono text-[9px] text-[#86948a] uppercase">
                      Remaining Work Time
                    </span>
                    <span className="font-mono text-xs font-bold text-[#4edea3] mt-0.5">
                      {formatDuration(timeMetrics.remainingMinutes)}
                    </span>
                    <span className="font-mono text-[9px] text-[#86948a] mt-0.5">
                      Sum of remaining steps
                    </span>
                  </div>
                </div>
              )}

              {/* Dynamic Iterating Progress Bar */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#bbcabf] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" /> Step-Iterating Progress Engine:
                  </span>
                  <span className="text-[#4edea3] font-bold tabular-nums">
                    {selectedProject.progress}% Completed ({timeMetrics.completedSteps}/{timeMetrics.totalSteps} Steps)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#16181d] rounded-full overflow-hidden border border-[#3c4a42]/40">
                  <div
                    className="h-full bg-linear-to-r from-[#4cd7f6] to-[#4edea3] transition-all duration-300 shadow-[0_0_10px_rgba(78,222,163,0.3)]"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* B. TECHNOLOGIES & STACK EDITOR (USER CAN EDIT/ADD/REMOVE) */}
            <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/30 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#4edea3]" />
                  <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                    Technologies &amp; Architecture Stack ({selectedProject.technologies.length})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#86948a]">
                  Click &times; to remove tag or add custom tech
                </span>
              </div>

              {/* Current Tech Chips with remove buttons */}
              <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                {selectedProject.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-md bg-[#1e2024] border border-[#3c4a42]/60 text-xs font-mono text-[#4cd7f6] flex items-center gap-1.5 hover:border-[#4cd7f6]/60 transition-colors shadow-xs"
                  >
                    <span>{tech}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="text-[#86948a] hover:text-[#ffb4ab] transition-colors cursor-pointer p-0.5 -mr-1"
                      title={`Remove ${tech}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedProject.technologies.length === 0 && (
                  <span className="text-xs text-[#86948a] italic">
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
                className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#3c4a42]/20"
              >
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    placeholder="Add technology (e.g. Docker, Rust, Postgres, Kafka, Next.js, Redis)..."
                    className="flex-1 bg-[#1e2024] border border-[#3c4a42]/50 rounded-lg px-3 py-1.5 text-xs text-[#e2e2e8] placeholder-[#86948a] focus:outline-none focus:border-[#4edea3]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#4edea3] hover:bg-[#3ec991] text-[#003824] font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Tech
                  </button>
                </div>
              </form>

              {/* Quick Suggestions / Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#86948a] pt-1">
                <span className="text-[#bbcabf]">Popular Presets:</span>
                {POPULAR_TECH_SUGGESTIONS
                  .filter((s) => !selectedProject.technologies.some((t) => t.toLowerCase() === s.toLowerCase()))
                  .slice(0, 8)
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddTech(suggestion)}
                      className="px-2 py-0.5 rounded bg-[#1e2024] hover:bg-[#282a2e] text-[#bbcabf] hover:text-[#4edea3] border border-[#3c4a42]/40 cursor-pointer transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
              </div>
            </div>

            {/* C. 6-PHASE SDLC STEPPER */}
            <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#4edea3] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Software Development Life Cycle (SDLC) Phase Matrix
                </span>
                <span className="font-mono text-[10px] text-[#86948a]">
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
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1e2024] border-[#4edea3] shadow-[0_0_10px_rgba(78,222,163,0.2)]'
                          : 'bg-[#16181d] border-[#3c4a42]/30 hover:border-[#4cd7f6]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[9px]">
                        <span className={isCurrent ? 'text-[#4edea3] font-bold' : 'text-[#86948a]'}>
                          PHASE 0{sdlc.order}
                        </span>
                        <span
                          className={`px-1 rounded font-bold ${
                            stepsInPhase.length > 0 && completedInPhase === stepsInPhase.length
                              ? 'bg-[#4edea3]/20 text-[#4edea3]'
                              : 'bg-[#282a2e] text-[#bbcabf]'
                          }`}
                        >
                          {completedInPhase}/{stepsInPhase.length}
                        </span>
                      </div>
                      <span className={`text-xs font-bold truncate ${isCurrent ? 'text-[#e2e2e8]' : 'text-[#bbcabf]'}`}>
                        {sdlc.short}
                      </span>
                      <span className="text-[9px] text-[#86948a] line-clamp-1 leading-tight">
                        {sdlc.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. MULTIPLE STEP BREAKDOWN (WITH DURATION & DAILY TARGET HIGHLIGHT) */}
            <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3c4a42]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#e2e2e8] uppercase tracking-wider">
                    Engineering Step Breakdown ({timeMetrics.completedSteps}/{timeMetrics.totalSteps} Completed)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Phase Filter */}
                  <select
                    value={selectedPhaseFilter}
                    onChange={(e) => setSelectedPhaseFilter(e.target.value as any)}
                    className="bg-[#1e2024] border border-[#3c4a42]/40 rounded px-2.5 py-1 font-mono text-xs text-[#4cd7f6] focus:outline-none"
                  >
                    <option value="ALL">All SDLC Phases</option>
                    <option value="REQUIREMENTS">Requirements</option>
                    <option value="ARCHITECTURE">Architecture</option>
                    <option value="IMPLEMENTATION">Implementation</option>
                    <option value="TESTING">Testing</option>
                    <option value="DEPLOYMENT">Deployment</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>

                  {/* SDLC Template Generator button if zero steps */}
                  {(selectedProject.steps || []).length === 0 && (
                    <button
                      onClick={handleGenerateSDLCTemplate}
                      className="px-2.5 py-1 rounded bg-[#4edea3]/20 hover:bg-[#4edea3]/30 border border-[#4edea3]/40 text-[#4edea3] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Generate 6-Phase SDLC Breakdown
                    </button>
                  )}
                </div>
              </div>

              {/* Daily Target Cadence Banner */}
              {timeMetrics.todayTargetSteps.length > 0 && (
                <div className="p-3 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#4edea3]" />
                    <div>
                      <div className="font-mono text-xs font-bold text-[#4edea3]">
                        RECOMMENDED CADENCE FOR TODAY: {timeMetrics.todayTargetSteps.length} STEPS
                      </div>
                      <div className="text-[11px] text-[#bbcabf]">
                        Estimated Time for Today&apos;s Target:{' '}
                        <strong className="text-[#e2e2e8]">{formatDuration(timeMetrics.todayTotalMinutes)}</strong>{' '}
                        across {timeMetrics.todayTargetSteps.length} atomic execution steps.
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold shrink-0">
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
                        className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          step.completed
                            ? 'bg-[#14161a] border-[#3c4a42]/30 opacity-75'
                            : isTodayTarget
                            ? 'bg-[#1c2220] border-[#4edea3]/50 shadow-[0_0_10px_rgba(78,222,163,0.1)]'
                            : 'bg-[#181a1d] border-[#3c4a42]/40 hover:border-[#4cd7f6]/40'
                        }`}
                      >
                        {isEditing ? (
                          /* Inline Step Editor */
                          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={editStepTitle}
                              onChange={(e) => setEditStepTitle(e.target.value)}
                              className="flex-1 bg-[#0c0e12] border border-[#4cd7f6]/50 rounded px-2.5 py-1 text-xs text-[#e2e2e8]"
                            />
                            <select
                              value={editStepPhase}
                              onChange={(e) => setEditStepPhase(e.target.value as SDLCPhase)}
                              className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-[11px] text-[#4cd7f6]"
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
                              className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-xs text-[#4edea3] focus:outline-none focus:border-[#4cd7f6]"
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
                                className="px-2.5 py-1 rounded bg-[#4cd7f6] text-[#003824] font-mono text-[11px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingStepId(null)}
                                className="px-2 py-1 rounded bg-[#282a2e] text-[#bbcabf] font-mono text-[11px] cursor-pointer"
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
                                className="mt-0.5 sm:mt-0 p-0.5 text-[#bbcabf] hover:text-[#4edea3] cursor-pointer shrink-0"
                                title={step.completed ? 'Mark step incomplete' : 'Complete step & iterate progress'}
                              >
                                {step.completed ? (
                                  <CheckSquare className="w-5 h-5 text-[#4edea3]" />
                                ) : (
                                  <Square className="w-5 h-5 text-[#86948a]" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                      step.sdlcPhase === 'REQUIREMENTS'
                                        ? 'bg-[#c0c1ff]/15 text-[#c0c1ff]'
                                        : step.sdlcPhase === 'ARCHITECTURE'
                                        ? 'bg-[#4cd7f6]/15 text-[#4cd7f6]'
                                        : step.sdlcPhase === 'IMPLEMENTATION'
                                        ? 'bg-[#4edea3]/15 text-[#4edea3]'
                                        : step.sdlcPhase === 'TESTING'
                                        ? 'bg-[#c9a227]/15 text-[#c9a227]'
                                        : step.sdlcPhase === 'DEPLOYMENT'
                                        ? 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                                        : 'bg-[#bbcabf]/15 text-[#bbcabf]'
                                    }`}
                                  >
                                    {step.sdlcPhase}
                                  </span>

                                  {isTodayTarget && (
                                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold border border-[#4edea3]/40 flex items-center gap-1">
                                      <Flame className="w-2.5 h-2.5" /> TODAY&apos;S CADENCE TARGET
                                    </span>
                                  )}
                                </div>

                                <div
                                  className={`text-xs sm:text-sm font-semibold mt-1 leading-snug ${
                                    step.completed
                                      ? 'line-through text-[#86948a]'
                                      : 'text-[#e2e2e8]'
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
                                className="px-2 py-1 rounded bg-[#0c0e12] border border-[#3c4a42]/40 text-[#4edea3] font-bold flex items-center gap-1 text-[11px]"
                                title="Estimated time to complete this step"
                              >
                                <Clock className="w-3 h-3 text-[#4edea3]" />
                                {formatDuration(step.estimatedDurationMinutes || 60)}
                              </span>

                              <button
                                onClick={() => {
                                  setEditingStepId(step.id);
                                  setEditStepTitle(step.title);
                                  setEditStepDuration(step.estimatedDurationMinutes || 60);
                                  setEditStepPhase(step.sdlcPhase);
                                }}
                                className="p-1 text-[#86948a] hover:text-[#4cd7f6] cursor-pointer"
                                title="Edit step"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteStep(selectedProject, step.id)}
                                className="p-1 text-[#86948a] hover:text-[#ffb4ab] cursor-pointer"
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
                className="p-3.5 rounded-lg bg-[#16181d] border border-[#3c4a42]/40 flex flex-col gap-2.5 pt-3"
              >
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Engineering Step (SDLC-Bound)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    required
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Describe specific engineering task or verification step..."
                    className="sm:col-span-6 bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xs text-[#e2e2e8] focus:outline-none focus:border-[#4edea3]"
                  />
                  <select
                    value={newStepPhase}
                    onChange={(e) => setNewStepPhase(e.target.value as SDLCPhase)}
                    className="sm:col-span-3 bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1.5 font-mono text-xs text-[#4cd7f6] focus:outline-none focus:border-[#4edea3]"
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
                    className="sm:col-span-2 bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1.5 font-mono text-xs text-[#4edea3] focus:outline-none focus:border-[#4edea3]"
                  >
                    {ATOMIC_STEP_DURATIONS.map((d) => (
                      <option key={d.minutes} value={d.minutes}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="sm:col-span-1 px-3 py-1.5 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold cursor-pointer hover:bg-[#3ec991] flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </form>
            </div>

            {/* E. PROJECT-SPECIFIC 14-POINT DoD GATES */}
            <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2">
              <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">
                Project Definition of Done Verification ({selectedProject.dodPassedIds.length}/14 Passed)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {state.dodGateProtocol.map((gate) => {
                  const passed = selectedProject.dodPassedIds.includes(gate.id);
                  return (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() => handleToggleProjectDoD(selectedProject, gate.id)}
                      className={`p-1.5 rounded border font-mono text-[10px] flex items-center gap-1.5 text-left cursor-pointer ${
                        passed
                          ? 'bg-[#4edea3]/15 border-[#4edea3]/40 text-[#e2e2e8]'
                          : 'bg-[#1e2024] border-[#3c4a42]/30 text-[#86948a]'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3 h-3 shrink-0 ${
                          passed ? 'text-[#4edea3]' : 'text-[#86948a]'
                        }`}
                      />
                      <span className="truncate">{gate.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* F. CONNECTED LEARNING TOPICS & EVIDENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#c0c1ff] uppercase font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Connected Retrieval Topics ({linkedTopicsForSelected.length})
                </span>
                {linkedTopicsForSelected.length > 0 ? (
                  <div className="space-y-1.5">
                    {linkedTopicsForSelected.map((lt) => (
                      <div
                        key={lt.id}
                        className="p-2 rounded bg-[#1e2024] border border-[#3c4a42]/30 text-xs text-[#e2e2e8] flex items-center justify-between"
                      >
                        <span className="truncate">{lt.topic}</span>
                        <span className="font-mono text-[10px] text-[#4edea3] ml-2 shrink-0">
                          {lt.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[#86948a]">
                    Link concepts in Module 03 to this project to track applied engineering mastery.
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Verified Evidence &amp; Deployment Artifacts ({selectedProject.evidence.length})
                </span>
                <div className="space-y-1.5">
                  {selectedProject.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded bg-[#1e2024] border border-[#3c4a42]/30 flex items-center justify-between gap-2 font-mono text-[10px]"
                    >
                      <span className="text-[#4edea3] font-bold">{ev.label}:</span>
                      <span className="text-[#bbcabf] truncate">{ev.urlOrContent}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddEvidence} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newEvidenceLabel}
                    onChange={(e) => setNewEvidenceLabel(e.target.value)}
                    placeholder="Label (e.g. Repo URL)"
                    className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs text-[#e2e2e8]"
                  />
                  <input
                    type="text"
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    placeholder="URL or benchmark..."
                    className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs text-[#e2e2e8]"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40 font-mono text-[10px] font-bold cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Evidence
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
