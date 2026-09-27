import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { POSState, Project } from '../../models/types';

interface ProjectPipelineProps {
  state: POSState;
  onUpdateProject: (project: Project) => void;
  onToggleGlobalDoDGate: (gateId: string) => void;
}

export const ProjectPipeline: React.FC<ProjectPipelineProps> = ({
  state,
  onUpdateProject,
  onToggleGlobalDoDGate,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'P0' | 'P1' | 'P2'>('P0');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newEvidenceLabel, setNewEvidenceLabel] = useState('');
  const [newEvidenceUrl, setNewEvidenceUrl] = useState('');

  const selectedProject = state.projects.find((p) => p.id === selectedProjectId) || null;

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

  const handleToggleMilestone = (project: Project, milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const computedProgress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : project.progress;

    onUpdateProject({
      ...project,
      milestones: updatedMilestones,
      progress: computedProgress,
      progressLabel:
        computedProgress === 100
          ? '100% Passed'
          : `${computedProgress}% Deployed`,
      status:
        computedProgress === 100
          ? 'COMPLETED'
          : computedProgress > 0
          ? 'IN PROGRESS'
          : project.status,
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
      targetDate: '2026-12-01',
    };
    onUpdateProject({
      ...selectedProject,
      milestones: [...selectedProject.milestones, nextMilestone],
      updatedAt: new Date().toISOString(),
    });
    setNewMilestoneTitle('');
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newEvidenceLabel.trim()) return;
    const nextEv = {
      id: `ev-${Date.now()}`,
      type: 'REPOSITORY' as const,
      label: newEvidenceLabel.trim(),
      urlOrContent: newEvidenceUrl.trim() || 'Verified local artifact',
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
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/75 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-5"
      id="milestone-projects"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[12px] text-[#4edea3] font-bold">
            MODULE 04
          </span>
          <h2 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold">
            Engineering &amp; 5 Milestone Projects Pipeline
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#bbcabf]">Gate Status:</span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] font-bold">
            STRICT DoD ENFORCED
          </span>
        </div>
      </div>

      {/* 5 Projects Desktop & Mobile Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {state.projects.map((proj) => {
          const isCompleted = proj.status === 'COMPLETED';
          const isInProgress = proj.status === 'IN PROGRESS';

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-4 rounded-xl flex flex-col justify-between transition-all cursor-pointer group ${
                isInProgress
                  ? 'bg-[#282a2e] border-2 border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.15)]'
                  : isCompleted
                  ? 'bg-[#1e2024] border border-[#4edea3]/40 hover:border-[#4edea3]'
                  : 'bg-[#1e2024] border border-[#3c4a42]/30 opacity-85 hover:opacity-100 hover:border-[#c0c1ff]/50'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      isCompleted
                        ? 'text-[#4edea3]'
                        : isInProgress
                        ? 'text-[#4cd7f6]'
                        : 'text-[#c0c1ff]'
                    }`}
                  >
                    {proj.code}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isCompleted
                        ? 'bg-[#4edea3]/20 text-[#4edea3]'
                        : isInProgress
                        ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] animate-pulse'
                        : 'bg-[#333539] text-[#bbcabf]'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-[15px] leading-[20px] text-[#e2e2e8] font-bold group-hover:text-[#4edea3] transition-colors">
                  {proj.title}
                </h3>
                <p className="text-[12px] leading-[18px] text-[#bbcabf]">
                  {proj.objective}
                </p>

                <div className="mt-2 flex flex-wrap gap-1 font-mono text-[10px]">
                  {proj.technologies.map((tech) => (
                    <span
                      key={tech}
                      className={`px-1.5 py-0.5 rounded ${
                        isInProgress
                          ? 'bg-[#1e2024] text-[#4cd7f6]'
                          : 'bg-[#282a2e] text-[#bbcabf]'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#3c4a42]/25 flex flex-col gap-1.5">
                <div className="w-full h-1 bg-[#0c0e12] rounded overflow-hidden">
                  <div
                    className={`h-full ${
                      isCompleted
                        ? 'bg-[#4edea3]'
                        : isInProgress
                        ? 'bg-[#4cd7f6]'
                        : 'bg-[#c0c1ff]'
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#bbcabf]">{proj.spanText}</span>
                  <span
                    className={`font-bold tabular-nums ${
                      isCompleted
                        ? 'text-[#4edea3]'
                        : isInProgress
                        ? 'text-[#4cd7f6]'
                        : 'text-[#86948a]'
                    }`}
                  >
                    {proj.progressLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 14-Point Definition of Done Gate Protocol */}
      <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#3c4a42]/40 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
            14-Point Production &quot;Definition of Done&quot; Gate Protocol (Click to toggle verification)
          </span>
          <span className="font-mono text-[10px] text-[#bbcabf] tabular-nums">
            {state.dodGateProtocol.filter((g) => g.passed).length}/14 GATES ACTIVE // 100% PASS REQUIRED PRIOR TO MERGE
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

      {/* Interactive Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-xl bg-[#1a1c20] border border-[#4cd7f6]/50 shadow-2xl p-5 sm:p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#3c4a42]/30 pb-3">
              <div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-[#4edea3] font-bold">
                    {selectedProject.code}
                  </span>
                  <span>//</span>
                  <span className="text-[#4cd7f6]">{selectedProject.phaseTag}</span>
                  <span>//</span>
                  <span className="text-[#bbcabf]">{selectedProject.spanText}</span>
                </div>
                <h3 className="text-xl font-bold text-[#e2e2e8] mt-1">
                  {selectedProject.title}
                </h3>
                <p className="text-xs text-[#bbcabf] mt-1">
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

            {/* Status & Progress Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase">
                  Pipeline Status
                </label>
                <select
                  value={selectedProject.status}
                  onChange={(e) =>
                    onUpdateProject({
                      ...selectedProject,
                      status: e.target.value as Project['status'],
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 font-mono text-xs text-[#4edea3]"
                >
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="QUEUED">QUEUED</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#bbcabf] uppercase">
                    Deployment Progress
                  </span>
                  <span className="text-[#4edea3] font-bold tabular-nums">
                    {selectedProject.progress}% ({selectedProject.dodPassedIds.length}/14 DoD Gates)
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedProject.progress}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onUpdateProject({
                      ...selectedProject,
                      progress: val,
                      progressLabel:
                        val === 100 ? '100% Passed' : `${val}% Deployed`,
                      status:
                        val === 100
                          ? 'COMPLETED'
                          : val > 0
                          ? 'IN PROGRESS'
                          : 'QUEUED',
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                  className="w-full accent-[#4edea3] cursor-pointer mt-2"
                />
              </div>
            </div>

            {/* Current Milestone & Next Action */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#bbcabf] uppercase">
                  Current Milestone Focus
                </label>
                <input
                  type="text"
                  value={selectedProject.currentMilestone}
                  onChange={(e) =>
                    onUpdateProject({
                      ...selectedProject,
                      currentMilestone: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-3 py-1.5 text-xs text-[#e2e2e8]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#4edea3] uppercase">
                  Immediate Next Engineering Action
                </label>
                <input
                  type="text"
                  value={selectedProject.nextAction}
                  onChange={(e) =>
                    onUpdateProject({
                      ...selectedProject,
                      nextAction: e.target.value,
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="bg-[#0c0e12] border border-[#4edea3]/40 rounded px-3 py-1.5 text-xs text-[#e2e2e8]"
                />
              </div>
            </div>

            {/* Two-Column: Milestones & Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Milestones */}
              <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2.5">
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold">
                  Milestone Progression ({selectedProject.milestones.filter((m) => m.completed).length}/{selectedProject.milestones.length})
                </span>
                <div className="space-y-1.5">
                  {selectedProject.milestones.map((ms) => (
                    <button
                      key={ms.id}
                      onClick={() => handleToggleMilestone(selectedProject, ms.id)}
                      className="w-full p-2 rounded bg-[#1e2024] border border-[#3c4a42]/30 flex items-center justify-between gap-2 text-left cursor-pointer hover:border-[#4cd7f6]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {ms.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#86948a] shrink-0" />
                        )}
                        <span
                          className={`text-xs truncate ${
                            ms.completed
                              ? 'line-through text-[#86948a]'
                              : 'text-[#e2e2e8]'
                          }`}
                        >
                          {ms.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#bbcabf] shrink-0">
                        {ms.targetDate}
                      </span>
                    </button>
                  ))}
                </div>
                <form onSubmit={handleAddMilestone} className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="Add milestone..."
                    className="flex-1 bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1 text-xs text-[#e2e2e8]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/40 font-mono text-[10px] font-bold cursor-pointer"
                  >
                    + Add
                  </button>
                </form>
              </div>

              {/* Tasks CRUD */}
              <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2.5">
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">
                  Engineering Tasks Queue ({selectedProject.tasks.filter((t) => !t.completed).length} Open)
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedProject.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded bg-[#1e2024] border border-[#3c4a42]/30 flex items-center justify-between gap-2"
                    >
                      <button
                        onClick={() =>
                          handleToggleProjectTask(selectedProject, task.id)
                        }
                        className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer"
                      >
                        {task.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#86948a] shrink-0" />
                        )}
                        <span
                          className={`font-mono text-[10px] px-1 rounded shrink-0 ${
                            task.priority === 'P0'
                              ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                              : 'bg-[#282a2e] text-[#4cd7f6]'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span
                          className={`text-xs truncate ${
                            task.completed
                              ? 'line-through text-[#86948a]'
                              : 'text-[#e2e2e8]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteProjectTask(selectedProject, task.id)
                        }
                        className="text-[#86948a] hover:text-[#ffb4ab] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddProjectTask} className="flex gap-1.5 pt-1">
                  <select
                    value={newTaskPriority}
                    onChange={(e) =>
                      setNewTaskPriority(e.target.value as 'P0' | 'P1' | 'P2')
                    }
                    className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-1.5 py-1 font-mono text-[10px] text-[#e2e2e8]"
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New task directive..."
                    className="flex-1 bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1 text-xs text-[#e2e2e8]"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded bg-[#4edea3] text-[#003824] font-mono text-[10px] font-bold cursor-pointer"
                  >
                    + Task
                  </button>
                </form>
              </div>
            </div>

            {/* Project-Specific 14-Point DoD Checklist */}
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

            {/* Learning Connections & Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#c0c1ff] uppercase font-bold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Connected Learning Topics ({linkedTopicsForSelected.length})
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
                    Link topics from the Learning Engine to track applied concepts.
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/30 flex flex-col gap-2">
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Evidence &amp; Deployment Artifacts ({selectedProject.evidence.length})
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
