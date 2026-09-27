import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Edit3,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
  Users,
  Check,
} from 'lucide-react';
import {
  Asset,
  BusinessExperimentStep,
  BusinessLead,
  FinancialTarget,
  Liability,
  POSState,
  Transaction,
} from '../../models/types';

interface BusinessFinanceProps {
  state: POSState;
  onToggleBusinessStep: (stepId: string) => void;
  onUpdateBusinessStep: (step: BusinessExperimentStep) => void;
  onUpdateFinancialTarget: (target: FinancialTarget) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateAsset: (asset: Asset) => void;
  onAddAsset: (asset: Omit<Asset, 'id' | 'updatedAt'>) => void;
  onUpdateLiability: (liability: Liability) => void;
  onAddBusinessLead: (lead: Omit<BusinessLead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBusinessLead: (lead: BusinessLead) => void;
  onDeleteBusinessLead: (id: string) => void;
}

export const BusinessFinance: React.FC<BusinessFinanceProps> = ({
  state,
  onToggleBusinessStep,
  onUpdateBusinessStep,
  onUpdateFinancialTarget,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateAsset,
  onAddBusinessLead,
  onUpdateBusinessLead,
  onDeleteBusinessLead,
}) => {
  const [activeSubPanel, setActiveSubPanel] = useState<'NONE' | 'LEDGER' | 'CRM'>('NONE');

  // Target inline editing
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetDraft, setTargetDraft] = useState<FinancialTarget | null>(null);

  // Business step inline editing
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepTitleDraft, setStepTitleDraft] = useState('');

  // Transaction form
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [txCategory, setTxCategory] = useState('Software Retainer');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');

  // Lead form
  const [leadName, setLeadName] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadBottleneck, setLeadBottleneck] = useState('');
  const [leadValue, setLeadValue] = useState('15000');
  const [leadNextAction, setLeadNextAction] = useState('');

  // Financial Metrics Computation
  const cashBalance = state.assets
    .filter((a) => a.category === 'CASH')
    .reduce((sum, a) => sum + a.valueRand, 0);
  const savingsBalance = state.assets
    .filter((a) => a.category === 'SAVINGS')
    .reduce((sum, a) => sum + a.valueRand, 0);
  const investmentsBalance = state.assets
    .filter((a) => a.category === 'INVESTMENTS' || a.category === 'EQUITY')
    .reduce((sum, a) => sum + a.valueRand, 0);
  const totalAssets = state.assets.reduce((sum, a) => sum + a.valueRand, 0);
  const totalLiabilities = state.liabilities.reduce((sum, l) => sum + l.amountRand, 0);
  const netWorth = totalAssets - totalLiabilities;

  const monthlyIncome = state.transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountRand, 0);
  const monthlyExpenses = state.transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountRand, 0);
  const freeCashFlow = monthlyIncome - monthlyExpenses;

  const handleSaveTarget = () => {
    if (targetDraft) {
      onUpdateFinancialTarget({
        ...targetDraft,
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingTargetId(null);
    setTargetDraft(null);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(txAmount);
    if (!txDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;
    onAddTransaction({
      type: txType,
      category: txCategory.trim() || 'General',
      description: txDesc.trim(),
      amountRand: amountNum,
      date: new Date().toISOString().slice(0, 10),
    });
    setTxDesc('');
    setTxAmount('');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadOrg.trim()) return;
    onAddBusinessLead({
      name: leadName.trim(),
      organization: leadOrg.trim(),
      bottleneck: leadBottleneck.trim() || 'Operational automation bottleneck',
      stage: 'OUTREACH',
      estimatedValueRand: Number(leadValue) || 10000,
      nextAction: leadNextAction.trim() || 'Schedule 15-min diagnostic call',
      notes: '',
    });
    setLeadName('');
    setLeadOrg('');
    setLeadBottleneck('');
    setLeadNextAction('');
  };

  return (
    <section
      className="p-5 sm:p-7 rounded-xl bg-[#1a1c20]/75 border border-[#3c4a42]/30 backdrop-blur-md flex flex-col gap-5"
      id="financial-os"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/20 pb-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#4edea3]/10 border border-[#4edea3]/30 font-mono text-[12px] text-[#4edea3] font-bold">
            MODULE 05
          </span>
          <h2 className="text-[20px] sm:text-[22px] text-[#e2e2e8] font-bold">
            Business &amp; Financial Operating System
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setActiveSubPanel(activeSubPanel === 'CRM' ? 'NONE' : 'CRM')
            }
            className={`px-2.5 py-1 rounded font-mono text-[11px] border flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubPanel === 'CRM'
                ? 'bg-[#4cd7f6]/20 border-[#4cd7f6] text-[#4cd7f6]'
                : 'bg-[#1e2024] border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Commercial Pipeline ({state.businessLeads.length})</span>
          </button>
          <button
            onClick={() =>
              setActiveSubPanel(activeSubPanel === 'LEDGER' ? 'NONE' : 'LEDGER')
            }
            className={`px-2.5 py-1 rounded font-mono text-[11px] border flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubPanel === 'LEDGER'
                ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]'
                : 'bg-[#1e2024] border-[#3c4a42]/40 text-[#bbcabf] hover:text-[#e2e2e8]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Financial Ledger &amp; Net Worth</span>
          </button>
        </div>
      </div>

      {/* Three-Column Desktop Section matching Screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Column 1: 7-Step Commercial Experiment Loop */}
        <div className="p-4 rounded-xl bg-[#1e2024] border border-[#3c4a42]/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#4cd7f6] uppercase font-bold tracking-wider">
              7-Step Commercial Experiment Loop
            </span>
            <span className="font-mono text-[10px] text-[#bbcabf] tabular-nums">
              {state.businessExperimentSteps.filter((s) => s.completed).length}/7
            </span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            {state.businessExperimentSteps.map((step) => {
              const isEditing = editingStepId === step.id;
              return (
                <div
                  key={step.id}
                  className="p-2 rounded bg-[#282a2e] border border-[#3c4a42]/25 flex items-center justify-between gap-2 group"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        value={stepTitleDraft}
                        onChange={(e) => setStepTitleDraft(e.target.value)}
                        className="flex-1 bg-[#0c0e12] border border-[#4cd7f6] rounded px-2 py-0.5 text-[11px] text-[#e2e2e8]"
                      />
                      <button
                        onClick={() => {
                          if (stepTitleDraft.trim()) {
                            onUpdateBusinessStep({
                              ...step,
                              title: stepTitleDraft.trim(),
                            });
                          }
                          setEditingStepId(null);
                        }}
                        className="p-1 rounded bg-[#4edea3] text-[#003824] cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onToggleBusinessStep(step.id)}
                        className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                        title={step.detail}
                      >
                        {step.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#86948a] shrink-0" />
                        )}
                        <span className="text-[#4cd7f6] font-bold shrink-0">
                          {step.stepNumber}
                        </span>
                        <span
                          className={`truncate ${
                            step.completed ? 'text-[#e2e2e8]' : 'text-[#bbcabf]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingStepId(step.id);
                          setStepTitleDraft(step.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-[#bbcabf] hover:text-[#4cd7f6] p-0.5 cursor-pointer"
                        title="Edit step text"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Cumulative Revenue Milestones Ladder (Editable Personal Targets) */}
        <div className="p-4 rounded-xl bg-[#1e2024] border border-[#3c4a42]/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
              Cumulative Revenue Milestones Ladder
            </span>
            <span className="font-mono text-[10px] text-[#86948a]">
              Personal Targets (Click to Edit)
            </span>
          </div>
          <div className="space-y-2">
            {state.financialTargets.map((target, idx) => {
              const pct = Math.min(
                100,
                Math.round(
                  (target.currentAmountRand / Math.max(1, target.targetAmountRand)) *
                    100
                )
              );
              const isEditing = editingTargetId === target.id && targetDraft;
              const isStage4 = idx === 3;

              return (
                <div
                  key={target.id}
                  onClick={() => {
                    if (!isEditing) {
                      setEditingTargetId(target.id);
                      setTargetDraft({ ...target });
                    }
                  }}
                  className={`p-2.5 rounded bg-[#282a2e] border transition-colors cursor-pointer ${
                    isStage4
                      ? 'border-[#4edea3]/50'
                      : 'border-[#3c4a42]/25 hover:border-[#4edea3]/40'
                  }`}
                >
                  {isEditing ? (
                    <div
                      className="flex flex-col gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={targetDraft.titleRandUsd}
                          onChange={(e) =>
                            setTargetDraft({
                              ...targetDraft,
                              titleRandUsd: e.target.value,
                            })
                          }
                          className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs font-bold text-[#e2e2e8]"
                          placeholder="Target Title"
                        />
                        <input
                          type="text"
                          value={targetDraft.deadline}
                          onChange={(e) =>
                            setTargetDraft({
                              ...targetDraft,
                              deadline: e.target.value,
                            })
                          }
                          className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-xs text-[#4cd7f6]"
                          placeholder="Deadline YYYY-MM-DD"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="font-mono text-[9px] text-[#bbcabf] block">
                            Current (R)
                          </label>
                          <input
                            type="number"
                            value={targetDraft.currentAmountRand}
                            onChange={(e) =>
                              setTargetDraft({
                                ...targetDraft,
                                currentAmountRand: Number(e.target.value),
                              })
                            }
                            className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-xs text-[#4edea3]"
                          />
                        </div>
                        <div>
                          <label className="font-mono text-[9px] text-[#bbcabf] block">
                            Target (R)
                          </label>
                          <input
                            type="number"
                            value={targetDraft.targetAmountRand}
                            onChange={(e) =>
                              setTargetDraft({
                                ...targetDraft,
                                targetAmountRand: Number(e.target.value),
                              })
                            }
                            className="w-full bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-xs text-[#e2e2e8]"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTargetId(null)}
                          className="px-2 py-0.5 rounded bg-[#1e2024] font-mono text-[10px] text-[#bbcabf]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveTarget}
                          className="px-2.5 py-0.5 rounded bg-[#4edea3] font-mono text-[10px] text-[#003824] font-bold"
                        >
                          Save Target
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`text-[15px] font-bold tabular-nums ${
                              isStage4 ? 'text-[#4edea3]' : 'text-[#e2e2e8]'
                            }`}
                          >
                            {target.titleRandUsd}
                          </div>
                          <div className="text-[12px] text-[#bbcabf]">
                            {target.subtitle}
                          </div>
                        </div>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                            idx === 0
                              ? 'bg-[#4edea3]/20 text-[#4edea3]'
                              : idx === 1
                              ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                              : idx === 2
                              ? 'bg-[#c0c1ff]/20 text-[#c0c1ff]'
                              : 'bg-[#4edea3] text-[#003824]'
                          }`}
                        >
                          {target.stageLabel}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#0c0e12] rounded overflow-hidden">
                          <div
                            className="h-full bg-[#4edea3]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[#bbcabf] tabular-nums">
                          {pct}% · Due {target.deadline}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Free Cash Flow (FCF) Master Equation & Live Telemetry */}
        <div className="p-4 rounded-xl bg-[#333539]/40 border border-[#4edea3]/40 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
              Free Cash Flow (FCF) Master Equation
            </span>
            <div className="p-3 rounded-lg bg-[#0c0e12] border border-[#3c4a42]/40 font-mono text-[12px] text-[#4edea3]">
              FCF = Total Revenue - [Taxes + Core Ops + Minimum Discretionary]
            </div>
            <div className="text-[12px] leading-[18px] text-[#bbcabf] space-y-2">
              <p>
                <strong className="text-[#e2e2e8]">
                  The 100% Reinvestment Mandate:
                </strong>{' '}
                Zero lifestyle creep until R100k/mo base is locked. All surplus FCF is recycled into high-yielding asymmetric assets:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#e2e2e8]">
                <li>Engineering hardware &amp; cloud infrastructure compute.</li>
                <li>Skill acquisition, proprietary databases &amp; domain expertise.</li>
                <li>Capital instruments &amp; compounding index holdings.</li>
              </ul>
            </div>

            {/* Live Financial Summary Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2 rounded bg-[#0c0e12] border border-[#3c4a42]/40">
                <span className="font-mono text-[9px] text-[#bbcabf] block uppercase">
                  Monthly FCF
                </span>
                <span className="font-mono text-xs font-bold text-[#4edea3] tabular-nums">
                  R{freeCashFlow.toLocaleString()}
                </span>
              </div>
              <div className="p-2 rounded bg-[#0c0e12] border border-[#3c4a42]/40">
                <span className="font-mono text-[9px] text-[#bbcabf] block uppercase">
                  Cash &amp; Savings
                </span>
                <span className="font-mono text-xs font-bold text-[#4cd7f6] tabular-nums">
                  R{(cashBalance + savingsBalance).toLocaleString()}
                </span>
              </div>
              <div className="p-2 rounded bg-[#0c0e12] border border-[#3c4a42]/40">
                <span className="font-mono text-[9px] text-[#bbcabf] block uppercase">
                  Net Worth
                </span>
                <span className="font-mono text-xs font-bold text-[#e2e2e8] tabular-nums">
                  R{netWorth.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#3c4a42]/30 flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#bbcabf]">Leverage Ratio</span>
            <span className="text-[#4edea3] font-bold">Infinite Horizon</span>
          </div>
        </div>
      </div>

      {/* Expandable Financial Tracking Ledger */}
      {activeSubPanel === 'LEDGER' && (
        <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#4edea3]/40 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3c4a42]/30 pb-2.5">
            <span className="font-mono text-[11px] text-[#4edea3] uppercase font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Personal Financial Tracking &amp; Balance Sheet
            </span>
            <span className="font-mono text-[10px] text-[#bbcabf]">
              Persisted Locally // Click asset values to adjust
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase">
                Cash Balance
              </span>
              <div className="text-base font-bold text-[#e2e2e8] font-mono tabular-nums mt-1">
                R{cashBalance.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#1e2024] border border-[#4edea3]/30">
              <span className="font-mono text-[10px] text-[#4edea3] uppercase">
                Monthly Income
              </span>
              <div className="text-base font-bold text-[#4edea3] font-mono tabular-nums mt-1">
                +R{monthlyIncome.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#1e2024] border border-[#ffb4ab]/30">
              <span className="font-mono text-[10px] text-[#ffb4ab] uppercase">
                Monthly Expenses
              </span>
              <div className="text-base font-bold text-[#ffb4ab] font-mono tabular-nums mt-1">
                -R{monthlyExpenses.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40">
              <span className="font-mono text-[10px] text-[#4cd7f6] uppercase">
                Savings Vault
              </span>
              <div className="text-base font-bold text-[#4cd7f6] font-mono tabular-nums mt-1">
                R{savingsBalance.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40">
              <span className="font-mono text-[10px] text-[#c0c1ff] uppercase">
                Investments
              </span>
              <div className="text-base font-bold text-[#c0c1ff] font-mono tabular-nums mt-1">
                R{investmentsBalance.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#282a2e] border border-[#4edea3]/50">
              <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">
                Net Worth
              </span>
              <div className="text-base font-bold text-[#4edea3] font-mono tabular-nums mt-1">
                R{netWorth.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Transactions History & Add Form */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                Income &amp; Expense Ledger ({state.transactions.length} Entries)
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {state.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 rounded bg-[#1e2024] border border-[#3c4a42]/30 flex items-center justify-between gap-2 font-mono text-[11px]"
                  >
                    <div className="min-w-0">
                      <span
                        className={`font-bold mr-2 ${
                          tx.type === 'INCOME' ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                        }`}
                      >
                        [{tx.type}]
                      </span>
                      <span className="text-[#e2e2e8]">{tx.description}</span>
                      <span className="text-[#86948a] ml-2 text-[10px]">
                        ({tx.category} · {tx.date})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-bold tabular-nums ${
                          tx.type === 'INCOME' ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}R{tx.amountRand.toLocaleString()}
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-[#86948a] hover:text-[#ffb4ab] cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleCreateTransaction}
                className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1"
              >
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as 'INCOME' | 'EXPENSE')}
                  className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-xs text-[#e2e2e8]"
                >
                  <option value="INCOME">+ INCOME</option>
                  <option value="EXPENSE">- EXPENSE</option>
                </select>
                <input
                  type="text"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  placeholder="Category"
                  className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs text-[#e2e2e8]"
                />
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Description..."
                  className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-1 text-xs text-[#e2e2e8]"
                />
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="Amount (R)"
                  className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2 py-1 font-mono text-xs text-[#e2e2e8]"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-[#4edea3] text-[#003824] font-mono text-xs font-bold cursor-pointer"
                >
                  Log Entry
                </button>
              </form>
            </div>

            {/* Assets & Liabilities Balance Sheet Editor */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-[10px] text-[#bbcabf] uppercase font-bold">
                Assets &amp; Balance Sheet Allocation (Editable Values)
              </span>
              <div className="space-y-1.5">
                {state.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-2 rounded bg-[#1e2024] border border-[#3c4a42]/30 flex items-center justify-between gap-2 font-mono text-xs"
                  >
                    <div>
                      <span className="text-[#4cd7f6] text-[10px] mr-2">
                        [{asset.category}]
                      </span>
                      <span className="text-[#e2e2e8]">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#bbcabf]">R</span>
                      <input
                        type="number"
                        value={asset.valueRand}
                        onChange={(e) =>
                          onUpdateAsset({
                            ...asset,
                            valueRand: Number(e.target.value) || 0,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className="w-24 bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-0.5 text-right font-mono text-xs text-[#4edea3] tabular-nums"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Commercial Leads CRM Pipeline */}
      {activeSubPanel === 'CRM' && (
        <div className="p-4 rounded-xl bg-[#0c0e12] border border-[#4cd7f6]/40 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#3c4a42]/30 pb-2">
            <span className="font-mono text-[11px] text-[#4cd7f6] uppercase font-bold">
              Commercial Outreach &amp; Diagnostic Pipeline ({state.businessLeads.length} Active Prospects)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {state.businessLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-3 rounded-lg bg-[#1e2024] border border-[#3c4a42]/40 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#e2e2e8]">
                      {lead.name}
                    </span>
                    <button
                      onClick={() => onDeleteBusinessLead(lead.id)}
                      className="text-[#86948a] hover:text-[#ffb4ab] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-[#4cd7f6]">
                    {lead.organization} · Est. R{lead.estimatedValueRand.toLocaleString()}/mo
                  </div>
                  <p className="text-xs text-[#bbcabf] mt-1.5">
                    <strong className="text-[#e2e2e8]">Bottleneck:</strong>{' '}
                    {lead.bottleneck}
                  </p>
                  <p className="text-xs text-[#4edea3] mt-1">
                    <strong>Next:</strong> {lead.nextAction}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#3c4a42]/25 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#bbcabf]">Stage:</span>
                  <select
                    value={lead.stage}
                    onChange={(e) =>
                      onUpdateBusinessLead({
                        ...lead,
                        stage: e.target.value as BusinessLead['stage'],
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="bg-[#0c0e12] border border-[#3c4a42]/50 rounded px-2 py-0.5 font-mono text-[10px] text-[#4edea3]"
                  >
                    <option value="PROSPECT">PROSPECT</option>
                    <option value="OUTREACH">OUTREACH</option>
                    <option value="DIAGNOSTIC">DIAGNOSTIC</option>
                    <option value="PROPOSAL">PROPOSAL</option>
                    <option value="CLOSED_WON">CLOSED_WON</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateLead}
            className="grid grid-cols-1 sm:grid-cols-6 gap-2 pt-2 border-t border-[#3c4a42]/25"
          >
            <input
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Contact Name"
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
            />
            <input
              type="text"
              value={leadOrg}
              onChange={(e) => setLeadOrg(e.target.value)}
              placeholder="Organization"
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
            />
            <input
              type="text"
              value={leadBottleneck}
              onChange={(e) => setLeadBottleneck(e.target.value)}
              placeholder="Identified operational bottleneck..."
              className="sm:col-span-2 bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
            />
            <input
              type="text"
              value={leadNextAction}
              onChange={(e) => setLeadNextAction(e.target.value)}
              placeholder="Next outreach action..."
              className="bg-[#1e2024] border border-[#3c4a42]/50 rounded px-2.5 py-1.5 text-xs text-[#e2e2e8]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#4cd7f6] text-[#003640] font-mono text-xs font-bold cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lead
            </button>
          </form>
        </div>
      )}
    </section>
  );
};
