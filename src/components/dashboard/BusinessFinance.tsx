import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Edit3,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Check,
  X,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Search,
  Calendar,
  RefreshCw,
  Zap,
  CreditCard,
  Target,
  Sparkles,
  PieChart,
  Package,
  Briefcase,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Asset,
  BusinessExperimentStep,
  BusinessLead,
  CommercialExperimentSpec,
  FinancialTarget,
  Liability,
  POSState,
  Transaction,
} from '../../models/types';

interface BusinessFinanceProps {
  state: POSState;
  onToggleBusinessStep: (stepId: string) => void;
  onUpdateBusinessStep: (step: BusinessExperimentStep) => void;
  onUpdateCommercialExperiment?: (experiment: CommercialExperimentSpec) => void;
  onUpdateFinancialTarget: (target: FinancialTarget) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdateTransaction?: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateAsset: (asset: Asset) => void;
  onAddAsset: (asset: Omit<Asset, 'id' | 'updatedAt'>) => void;
  onDeleteAsset?: (id: string) => void;
  onUpdateLiability: (liability: Liability) => void;
  onAddLiability?: (liability: Omit<Liability, 'id' | 'updatedAt'>) => void;
  onDeleteLiability?: (id: string) => void;
  onAddBusinessLead: (lead: Omit<BusinessLead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBusinessLead: (lead: BusinessLead) => void;
  onDeleteBusinessLead: (id: string) => void;
}

const COMMON_CATEGORIES = [
  'Software Retainer',
  'SaaS License',
  'Consulting & Advisory',
  'Core Ops & Compute',
  'Living Overhead & Food',
  'Hardware & Workstation',
  'Tooling & Subscriptions',
  'Taxes & Banking Fees',
  'Investments Reinvestment',
];

const DEFAULT_COMMERCIAL_EXPERIMENT: CommercialExperimentSpec = {
  id: 'exp-01',
  productOrServiceName: 'B2B Automated Data Ingestion & Waybill Engine',
  targetVertical: 'Mid-Market Logistics, Freight & Supply Chain Ops',
  linkedProjectId: 'proj-2',
  targetPersona: 'Operations Director, CFO & Head of Logistics Dispatch',
  coreHypothesis: 'Regional logistics operators losing 15-20 hrs/week on manual waybill spreadsheets will pay R15,000/mo for an automated Rust/Postgres ingestion pipeline with <0.5% error guarantee.',
  pricingModel: 'R15,000/mo Recurring Software Retainer',
  grandSlamOffer: 'Guaranteed <0.5% error rate and 15+ hrs/week saved within 30 days, or 100% money back.',
  primaryMetric: '15+ hrs/week manual reconciliation eliminated (<0.5% error rate)',
  status: 'VALIDATING',
  updatedAt: '2026-09-29T00:00:00Z',
};

const PRODUCT_EXPERIMENT_PRESETS: Omit<CommercialExperimentSpec, 'id' | 'updatedAt'>[] = [
  {
    productOrServiceName: 'B2B Automated Data Ingestion & Waybill Engine',
    targetVertical: 'Mid-Market Logistics, Freight & Supply Chain Ops',
    linkedProjectId: 'proj-2',
    targetPersona: 'Operations Director, CFO & Head of Logistics Dispatch',
    coreHypothesis: 'Regional logistics operators losing 15-20 hrs/week on manual waybill spreadsheets will pay R15,000/mo for an automated Rust/Postgres ingestion pipeline with <0.5% error guarantee.',
    pricingModel: 'R15,000/mo Recurring Software Retainer',
    grandSlamOffer: 'Guaranteed <0.5% error rate and 15+ hrs/week saved within 30 days, or 100% money back.',
    primaryMetric: '15+ hrs/week manual reconciliation eliminated (<0.5% error rate)',
    status: 'VALIDATING',
  },
  {
    productOrServiceName: 'Multi-Database Compliance Audit Export Service',
    targetVertical: 'FinTech, Wealth Management & Banking Ops',
    linkedProjectId: 'proj-4',
    targetPersona: 'Head of Compliance, Chief Risk Officer & Lead Auditor',
    coreHypothesis: 'FinTech scale-ups facing SOC2/PCI audits will pay R25,000/mo to automate audit ledger exports across 4+ disparate databases.',
    pricingModel: 'R25,000/mo Enterprise Compliance Retainer',
    grandSlamOffer: 'Automated cryptographic audit exports certified within 48 hours of audit request or month free.',
    primaryMetric: 'Audit prep time reduced from 3 weeks to <4 hours',
    status: 'VALIDATING',
  },
  {
    productOrServiceName: 'Offline Field Technicians Inspection Engine',
    targetVertical: 'Field Inspection, Civil & Industrial Engineering',
    linkedProjectId: 'proj-3',
    targetPersona: 'VP of Field Engineering & Technical Quality Directors',
    coreHypothesis: 'Field inspection firms lose field inspection logs in zero-connectivity sites and will pay R12,000/mo for an offline-first SQLite sync engine.',
    pricingModel: 'R12,000/mo Organization License + R2,000/seat',
    grandSlamOffer: 'Zero lost inspection logs with 100% background sync upon reconnect or 60-day refund guarantee.',
    primaryMetric: '0 lost inspection reports across 100 low-connectivity field trials',
    status: 'DISCOVERY',
  },
  {
    productOrServiceName: 'Developer CLI Automation Utility License',
    targetVertical: 'Engineering Teams, DevOps & Technical Agencies',
    linkedProjectId: 'proj-1',
    targetPersona: 'Staff Engineers & DevOps Team Leads',
    coreHypothesis: 'Developers will pay a R1,000 one-off or commercial team license for instant boilerplate generation & Git hygiene enforcement.',
    pricingModel: 'R1,000 Commercial Developer Seat License',
    grandSlamOffer: 'Instant CLI license key with lifetime updates and zero-dependency local binary.',
    primaryMetric: '50 validated developer license transactions',
    status: 'CONVERTED',
  },
];

export const BusinessFinance: React.FC<BusinessFinanceProps> = ({
  state,
  onToggleBusinessStep,
  onUpdateBusinessStep,
  onUpdateCommercialExperiment,
  onUpdateFinancialTarget,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdateAsset,
  onAddAsset,
  onDeleteAsset,
  onUpdateLiability,
  onAddLiability,
  onDeleteLiability,
  onAddBusinessLead,
  onUpdateBusinessLead,
  onDeleteBusinessLead,
}) => {
  // Navigation Tabs: OVERVIEW | LEDGER | BALANCE_SHEET | CRM
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEDGER' | 'BALANCE_SHEET' | 'CRM'>('OVERVIEW');

  // Active Experiment Spec & Editing Modal
  const activeExperiment: CommercialExperimentSpec =
    state.activeCommercialExperiment || DEFAULT_COMMERCIAL_EXPERIMENT;
  const [showExperimentModal, setShowExperimentModal] = useState(false);
  const [experimentDraft, setExperimentDraft] = useState<CommercialExperimentSpec>(activeExperiment);

  // Target inline editing
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetDraft, setTargetDraft] = useState<FinancialTarget | null>(null);

  // Business step inline editing (both title & concrete productAction)
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [stepTitleDraft, setStepTitleDraft] = useState('');
  const [stepProductActionDraft, setStepProductActionDraft] = useState('');

  // Transaction form state
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [txCategory, setTxCategory] = useState('Software Retainer');
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txIsRecurring, setTxIsRecurring] = useState(false);
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'RECURRING'>('ALL');

  // Transaction editing state
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxDraft, setEditTxDraft] = useState<Transaction | null>(null);

  // Asset creation state
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<Asset['category']>('CASH');
  const [newAssetValue, setNewAssetValue] = useState('');

  // Liability creation state
  const [showAddLiability, setShowAddLiability] = useState(false);
  const [newLiabilityName, setNewLiabilityName] = useState('');
  const [newLiabilityCategory, setNewLiabilityCategory] = useState('Equipment Financing');
  const [newLiabilityAmount, setNewLiabilityAmount] = useState('');
  const [newLiabilityRate, setNewLiabilityRate] = useState('0');
  const [newLiabilityPayment, setNewLiabilityPayment] = useState('0');

  // Lead form state
  const [leadName, setLeadName] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadBottleneck, setLeadBottleneck] = useState('');
  const [leadValue, setLeadValue] = useState('15000');
  const [leadNextAction, setLeadNextAction] = useState('');

  // Financial Metrics Computation
  const financialTelemetry = useMemo(() => {
    const cashBalance = state.assets
      .filter((a) => a.category === 'CASH')
      .reduce((sum, a) => sum + a.valueRand, 0);

    const savingsBalance = state.assets
      .filter((a) => a.category === 'SAVINGS')
      .reduce((sum, a) => sum + a.valueRand, 0);

    const investmentsBalance = state.assets
      .filter((a) => a.category === 'INVESTMENTS' || a.category === 'EQUITY')
      .reduce((sum, a) => sum + a.valueRand, 0);

    const infrastructureBalance = state.assets
      .filter((a) => a.category === 'INFRASTRUCTURE')
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
    const liquidReserves = cashBalance + savingsBalance;

    // Survival Runway in Months
    const monthlyBurn = monthlyExpenses > 0 ? monthlyExpenses : 1;
    const runwayMonths = (liquidReserves / monthlyBurn).toFixed(1);
    const runwayNum = parseFloat(runwayMonths);

    // Debt-to-Asset ratio
    const debtToAssetRatio = totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '0.0';

    // CRM Pipeline Value
    const totalPipelineValue = state.businessLeads.reduce(
      (sum, l) => sum + (l.estimatedValueRand || 0),
      0
    );

    const wonLeads = state.businessLeads.filter((l) => l.stage === 'CLOSED_WON');
    const closedWonValue = wonLeads.reduce((sum, l) => sum + (l.estimatedValueRand || 0), 0);

    return {
      cashBalance,
      savingsBalance,
      investmentsBalance,
      infrastructureBalance,
      totalAssets,
      totalLiabilities,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      freeCashFlow,
      liquidReserves,
      runwayMonths,
      runwayNum,
      debtToAssetRatio,
      totalPipelineValue,
      closedWonValue,
      wonLeadsCount: wonLeads.length,
    };
  }, [state.assets, state.liabilities, state.transactions, state.businessLeads]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      if (txTypeFilter === 'INCOME' && tx.type !== 'INCOME') return false;
      if (txTypeFilter === 'EXPENSE' && tx.type !== 'EXPENSE') return false;
      if (txTypeFilter === 'RECURRING' && !tx.isRecurring) return false;
      if (txSearchQuery.trim()) {
        const q = txSearchQuery.toLowerCase();
        const mDesc = tx.description.toLowerCase().includes(q);
        const mCat = tx.category.toLowerCase().includes(q);
        if (!mDesc && !mCat) return false;
      }
      return true;
    });
  }, [state.transactions, txTypeFilter, txSearchQuery]);

  // Target Save Handler
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

  // Experiment Spec Save Handler
  const handleSaveExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCommercialExperiment) {
      onUpdateCommercialExperiment({
        ...experimentDraft,
        updatedAt: new Date().toISOString(),
      });
    }
    setShowExperimentModal(false);
  };

  const handleSelectPreset = (preset: (typeof PRODUCT_EXPERIMENT_PRESETS)[0]) => {
    const updated: CommercialExperimentSpec = {
      ...activeExperiment,
      ...preset,
      updatedAt: new Date().toISOString(),
    };
    setExperimentDraft(updated);
    if (onUpdateCommercialExperiment) {
      onUpdateCommercialExperiment(updated);
    }
  };

  // Toggle Auto-sync for Target
  const handleToggleTargetAutoSync = (target: FinancialTarget) => {
    const nextSync = target.autoSyncLedger !== false ? false : true;
    onUpdateFinancialTarget({
      ...target,
      autoSyncLedger: nextSync,
      currentAmountRand: nextSync ? financialTelemetry.monthlyIncome : target.currentAmountRand,
      updatedAt: new Date().toISOString(),
    });
  };

  // Create Transaction
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(txAmount);
    if (!txDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;
    onAddTransaction({
      type: txType,
      category: txCategory.trim() || 'General',
      description: txDesc.trim(),
      amountRand: amountNum,
      date: txDate || new Date().toISOString().slice(0, 10),
      isRecurring: txIsRecurring,
    });
    setTxDesc('');
    setTxAmount('');
    setTxIsRecurring(false);
  };

  // Save Edited Transaction
  const handleSaveEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTxDraft || !onUpdateTransaction) return;
    onUpdateTransaction(editTxDraft);
    setEditingTxId(null);
    setEditTxDraft(null);
  };

  // Create Asset
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newAssetValue);
    if (!newAssetName.trim() || isNaN(val) || val < 0) return;
    onAddAsset({
      name: newAssetName.trim(),
      category: newAssetCategory,
      valueRand: val,
    });
    setNewAssetName('');
    setNewAssetValue('');
    setShowAddAsset(false);
  };

  // Create Liability
  const handleCreateLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newLiabilityAmount);
    if (!newLiabilityName.trim() || isNaN(amt) || amt < 0) return;
    if (onAddLiability) {
      onAddLiability({
        name: newLiabilityName.trim(),
        category: newLiabilityCategory.trim() || 'General',
        amountRand: amt,
        interestRatePercent: Number(newLiabilityRate) || 0,
        monthlyPaymentRand: Number(newLiabilityPayment) || 0,
      });
    }
    setNewLiabilityName('');
    setNewLiabilityAmount('');
    setNewLiabilityRate('0');
    setNewLiabilityPayment('0');
    setShowAddLiability(false);
  };

  // Create Lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadOrg.trim()) return;
    onAddBusinessLead({
      name: leadName.trim(),
      organization: leadOrg.trim(),
      bottleneck: leadBottleneck.trim() || 'Operational bottleneck',
      stage: 'OUTREACH',
      estimatedValueRand: Number(leadValue) || 10000,
      nextAction: leadNextAction.trim() || 'Schedule 15-min diagnostic call',
      notes: '',
      convertedToLedger: false,
    });
    setLeadName('');
    setLeadOrg('');
    setLeadBottleneck('');
    setLeadNextAction('');
  };

  // Convert Won Deal to Ledger Income
  const handleConvertLeadToIncome = (lead: BusinessLead) => {
    onAddTransaction({
      type: 'INCOME',
      category: 'Software Retainer',
      description: `${lead.organization} (${lead.name}) — Contract Closed Won`,
      amountRand: lead.estimatedValueRand,
      date: new Date().toISOString().slice(0, 10),
      isRecurring: true,
      notes: `Converted from Commercial CRM pipeline lead #${lead.id}`,
    });

    onUpdateBusinessLead({
      ...lead,
      stage: 'CLOSED_WON',
      convertedToLedger: true,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section
      className="p-5 sm:p-7 rounded-2xl bg-[#081414] border border-[#162b29] shadow-2xl flex flex-col gap-6 select-none animate-fadeIn relative overflow-hidden"
      id="financial-os"
    >
      {/* 1. Header & Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#132626] pb-4">
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-[#00f5a0] tracking-widest uppercase block">
            FINANCIAL OS // CAPITAL &amp; COMMERCIAL ENGINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#e6f4f1] tracking-tight font-mono">
            Capital Allocation &amp; Commercial Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#7a9490]">
            Real-time ledger tracking, survival runway telemetry, live revenue milestone sync, and commercial CRM conversion loop.
          </p>
        </div>

        {/* Tab Controls - Styled with clean segmented control buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#050a0a] border border-[#162b29] shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#002b21] text-[#00f5a0] border border-[#00f5a0]/40 shadow-[0_0_12px_rgba(0,245,160,0.15)] font-bold'
                : 'text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'LEDGER'
                ? 'bg-[#002633] text-[#38bdf8] border border-[#38bdf8]/40 shadow-[0_0_12px_rgba(56,189,248,0.15)] font-bold'
                : 'text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818]'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Cashflow Ledger ({state.transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BALANCE_SHEET')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'BALANCE_SHEET'
                ? 'bg-[#1c1836] text-[#c0c1ff] border border-[#c0c1ff]/40 shadow-[0_0_12px_rgba(192,193,255,0.15)] font-bold'
                : 'text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818]'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Balance Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CRM')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'CRM'
                ? 'bg-[#291f05] text-[#fbbf24] border border-[#fbbf24]/40 shadow-[0_0_12px_rgba(251,191,36,0.15)] font-bold'
                : 'text-[#7a9490] hover:text-[#e6f4f1] hover:bg-[#0c1818]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Commercial CRM ({state.businessLeads.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Financial Telemetry HUD (Interactive & matching reference stat card design) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Net Worth */}
        <div className="p-3.5 rounded-xl bg-[#081414] border border-[#162b29] hover:border-[#00f5a0]/40 transition-colors flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] text-[#00f5a0] uppercase tracking-wider font-bold">
            Total Net Worth
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#e6f4f1] mt-1 tabular-nums">
            R{financialTelemetry.netWorth.toLocaleString()}
          </div>
          <span className="font-mono text-[9px] text-[#55736f] mt-0.5">
            Assets minus Liabilities
          </span>
        </div>

        {/* Monthly FCF */}
        <div className="p-3.5 rounded-xl bg-[#081414] border border-[#162b29] hover:border-[#00f5a0]/40 transition-colors flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] text-[#7a9490] uppercase tracking-wider">
            Monthly Free Cash Flow
          </span>
          <div
            className={`text-xl sm:text-2xl font-black font-mono mt-1 tabular-nums flex items-center gap-1 ${
              financialTelemetry.freeCashFlow >= 0 ? 'text-[#00f5a0]' : 'text-[#ff5c5c]'
            }`}
          >
            {financialTelemetry.freeCashFlow >= 0 ? '+' : ''}R{financialTelemetry.freeCashFlow.toLocaleString()}
          </div>
          <span className="font-mono text-[9px] text-[#55736f] mt-0.5">
            Inflow R{financialTelemetry.monthlyIncome.toLocaleString()} vs Outflow R{financialTelemetry.monthlyExpenses.toLocaleString()}
          </span>
        </div>

        {/* Survival Runway */}
        <div
          className={`p-3.5 rounded-xl bg-[#081414] border transition-colors flex flex-col justify-between shadow-sm ${
            financialTelemetry.runwayNum >= 12
              ? 'border-[#00f5a0]/40 hover:border-[#00f5a0]'
              : financialTelemetry.runwayNum >= 6
              ? 'border-[#f59e0b]/40 hover:border-[#f59e0b]'
              : 'border-[#ff5c5c]/50 hover:border-[#ff5c5c]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-wider font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Survival Runway
            </span>
            <span
              className={`font-mono text-[9px] font-bold ${
                financialTelemetry.runwayNum >= 12
                  ? 'text-[#00f5a0]'
                  : financialTelemetry.runwayNum >= 6
                  ? 'text-[#f59e0b]'
                  : 'text-[#ff5c5c] animate-pulse'
              }`}
            >
              {financialTelemetry.runwayNum >= 12 ? 'IMMUNITY' : financialTelemetry.runwayNum >= 6 ? 'MODERATE' : 'DEFICIT'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#e6f4f1] mt-1 tabular-nums">
            {financialTelemetry.runwayMonths} Mos
          </div>
          <span className="font-mono text-[9px] text-[#55736f] mt-0.5">
            Liquid Reserves R{financialTelemetry.liquidReserves.toLocaleString()}
          </span>
        </div>

        {/* Monthly Burn Rate */}
        <div className="p-3.5 rounded-xl bg-[#081414] border border-[#162b29] hover:border-[#ff5c5c]/40 transition-colors flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] text-[#ff5c5c] uppercase tracking-wider flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-[#ff5c5c]" /> Monthly Burn
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#ff5c5c] mt-1 tabular-nums">
            R{financialTelemetry.monthlyExpenses.toLocaleString()}
          </div>
          <span className="font-mono text-[9px] text-[#55736f] mt-0.5">
            Core Ops &amp; Baseline Living
          </span>
        </div>

        {/* Liquid Reserves */}
        <div className="p-3.5 rounded-xl bg-[#081414] border border-[#162b29] hover:border-[#38bdf8]/40 transition-colors flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] text-[#38bdf8] uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#38bdf8]" /> Liquid Reserves
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#38bdf8] mt-1 tabular-nums">
            R{financialTelemetry.liquidReserves.toLocaleString()}
          </div>
          <span className="font-mono text-[9px] text-[#55736f] mt-0.5">
            Cash R{financialTelemetry.cashBalance.toLocaleString()} · Vault R{financialTelemetry.savingsBalance.toLocaleString()}
          </span>
        </div>

        {/* Commercial Pipeline Value */}
        <div className="p-3.5 rounded-xl bg-[#081414] border border-[#162b29] hover:border-[#fbbf24]/40 transition-colors flex flex-col justify-between shadow-sm">
          <span className="font-mono text-[10px] text-[#fbbf24] uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#fbbf24]" /> Pipeline Value
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#fbbf24] mt-1 tabular-nums">
            R{financialTelemetry.totalPipelineValue.toLocaleString()}
          </div>
          <span className="font-mono text-[9px] text-[#55736f] mt-0.5">
            {state.businessLeads.length} Deals ({financialTelemetry.wonLeadsCount} Closed)
          </span>
        </div>
      </div>

      {/* 3. TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Column 1: 7-Step Commercial Experiment Loop */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-3.5 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#132626] pb-2.5">
                <span className="font-mono text-xs text-[#38bdf8] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#38bdf8]" /> 7-Step Commercial Experiment Loop
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] font-bold tabular-nums">
                  {state.businessExperimentSteps.filter((s) => s.completed).length}/7 PASSED
                </span>
              </div>

              {/* ACTIVE PRODUCT / SERVICE CONTEXT CARD */}
              <div className="p-3.5 rounded-xl bg-[#050a0a] border border-[#38bdf8]/30 flex flex-col gap-2 relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[9px] text-[#38bdf8] font-bold uppercase tracking-wider">
                        TARGET PRODUCT / SERVICE
                      </span>
                      <span className="text-[#3b5552]">·</span>
                      <span
                        className={`font-mono text-[9px] font-bold uppercase ${
                          activeExperiment.status === 'VALIDATING'
                            ? 'text-[#fbbf24]'
                            : activeExperiment.status === 'CONVERTED'
                            ? 'text-[#00f5a0]'
                            : 'text-[#7a9490]'
                        }`}
                      >
                        {activeExperiment.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#e6f4f1] mt-1 flex items-center gap-1.5 font-mono">
                      <Package className="w-4 h-4 text-[#38bdf8] shrink-0" />
                      <span className="truncate">{activeExperiment.productOrServiceName}</span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setExperimentDraft(activeExperiment);
                      setShowExperimentModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0c1818] hover:bg-[#122424] border border-[#162b29] hover:border-[#38bdf8]/40 text-[#38bdf8] font-mono text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    title="Change or edit product/service experiment specification"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Configure</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10.5px] text-[#7a9490] pt-2 border-t border-[#132626]">
                  <div>
                    <span className="text-[#55736f]">Linked Project: </span>
                    <strong className="text-[#00f5a0]">
                      {state.projects.find((p) => p.id === activeExperiment.linkedProjectId)?.title ||
                        'Project 02 // Production Full-Stack SaaS'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#55736f]">Pricing Model: </span>
                    <strong className="text-[#fbbf24]">{activeExperiment.pricingModel}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#55736f]">Target Persona: </span>
                    <span className="text-[#e6f4f1]">{activeExperiment.targetPersona}</span>
                  </div>
                  <div className="sm:col-span-2 text-[10px] text-[#7a9490] italic bg-[#081212] p-2 rounded-lg border border-[#162b29]">
                    <span className="text-[#38bdf8] not-italic font-bold">Hypothesis: </span>
                    "{activeExperiment.coreHypothesis}"
                  </div>
                </div>
              </div>

              {/* 7 STEPS LIST WITH CONCRETE PRODUCT ACTIONS */}
              <div className="space-y-2 font-mono text-[11px]">
                {state.businessExperimentSteps.map((step) => {
                  const isEditing = editingStepId === step.id;
                  return (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 group ${
                        step.completed
                          ? 'bg-[#050a0a] border-[#162b29] opacity-85'
                          : 'bg-[#081212] border-[#162b29] hover:border-[#38bdf8]/40'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2 w-full p-1">
                          <div>
                            <label className="text-[9px] font-mono text-[#7a9490] uppercase block mb-0.5">
                              General Step Title
                            </label>
                            <input
                              type="text"
                              value={stepTitleDraft}
                              onChange={(e) => setStepTitleDraft(e.target.value)}
                              className="w-full bg-[#050a0a] border border-[#38bdf8] rounded-lg px-2.5 py-1 text-[11px] text-[#e6f4f1] focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-mono text-[#38bdf8] uppercase block mb-0.5">
                              Product / Service Execution Action
                            </label>
                            <textarea
                              rows={2}
                              value={stepProductActionDraft}
                              onChange={(e) => setStepProductActionDraft(e.target.value)}
                              placeholder="How does this step specifically execute for this product/service?"
                              className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-2.5 py-1 text-[11px] text-[#7a9490] focus:outline-none focus:border-[#38bdf8]"
                            />
                          </div>

                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingStepId(null)}
                              className="px-2.5 py-1 rounded-lg bg-[#0c1818] text-[10px] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateBusinessStep({
                                  ...step,
                                  title: stepTitleDraft.trim() || step.title,
                                  productAction: stepProductActionDraft.trim(),
                                });
                                setEditingStepId(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#00f5a0] text-[#021810] font-bold text-[10px] cursor-pointer"
                            >
                              Save Step
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onToggleBusinessStep(step.id)}
                              className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
                              title={step.detail}
                            >
                              {step.completed ? (
                                <CheckSquare className="w-4 h-4 text-[#00f5a0] shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-[#55736f] group-hover:text-[#38bdf8] shrink-0" />
                              )}
                              <span className="text-[#38bdf8] font-bold shrink-0">
                                {step.stepNumber}
                              </span>
                              <span
                                className={`truncate text-xs ${
                                  step.completed ? 'text-[#55736f] line-through' : 'text-[#e6f4f1] font-semibold'
                                }`}
                              >
                                {step.title}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingStepId(step.id);
                                setStepTitleDraft(step.title);
                                setStepProductActionDraft(step.productAction || step.detail);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-[#7a9490] hover:text-[#38bdf8] p-1 cursor-pointer transition-opacity shrink-0"
                              title="Edit step and product action"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Concrete Product Action / Execution Copy */}
                          {step.productAction && (
                            <div className="pl-2.5 py-1 pr-2 rounded-lg bg-[#050a0a] border-l-2 border-[#38bdf8] text-[10.5px]">
                              <span className="font-mono text-[9px] text-[#38bdf8] uppercase font-bold tracking-wider block">
                                Product Action:
                              </span>
                              <p className="text-[#7a9490] text-[10.5px] leading-relaxed mt-0.5">
                                {step.productAction}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Linked Commercial CRM Leads Footer */}
              <div className="pt-2 border-t border-[#132626] flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#55736f] uppercase font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#fbbf24]" /> Linked Pipeline Leads
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('CRM')}
                    className="text-[#38bdf8] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View CRM</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {state.businessLeads.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => setActiveTab('CRM')}
                      className="px-2 py-0.5 rounded-lg bg-[#050a0a] border border-[#162b29] hover:border-[#fbbf24]/40 text-[10px] font-mono text-[#7a9490] flex items-center gap-1 cursor-pointer"
                      title={`${lead.name} (${lead.organization}) — ${lead.stage}`}
                    >
                      <span className="text-[#e6f4f1] font-bold">{lead.name.split(' ')[0]}</span>
                      <span className="text-[#55736f]">({lead.stage})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Cumulative Revenue Milestones Ladder (LIVE SYNCED TO LEDGER) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#132626] pb-2.5">
                <span className="font-mono text-xs text-[#00f5a0] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#00f5a0]" /> Cumulative Revenue Milestones
                </span>
                <span className="font-mono text-[10px] text-[#00f5a0] font-bold">
                  LIVE LEDGER SYNCED
                </span>
              </div>

              <div className="space-y-2.5">
                {state.financialTargets.map((target, idx) => {
                  const isAutoSynced = target.autoSyncLedger !== false;
                  const effectiveCurrentAmount = isAutoSynced
                    ? financialTelemetry.monthlyIncome
                    : target.currentAmountRand;

                  const pct = Math.min(
                    100,
                    Math.round(
                      (effectiveCurrentAmount / Math.max(1, target.targetAmountRand)) * 100
                    )
                  );
                  const isEditing = editingTargetId === target.id && targetDraft;
                  const isStage4 = idx === 3;

                  return (
                    <div
                      key={target.id}
                      className={`p-3 rounded-xl border transition-all ${
                        pct >= 100
                          ? 'bg-[#002b21]/50 border-[#00f5a0]/40'
                          : isStage4
                          ? 'bg-[#0b1a19] border-[#00f5a0]/30'
                          : 'bg-[#050a0a] border-[#162b29] hover:border-[#38bdf8]/40'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={targetDraft.titleRandUsd}
                              onChange={(e) =>
                                setTargetDraft({
                                  ...targetDraft,
                                  titleRandUsd: e.target.value,
                                })
                              }
                              className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2.5 py-1 text-xs font-bold text-[#e6f4f1] focus:outline-none focus:border-[#00f5a0]"
                              placeholder="Target Title"
                            />
                            <input
                              type="date"
                              value={targetDraft.deadline}
                              onChange={(e) =>
                                setTargetDraft({
                                  ...targetDraft,
                                  deadline: e.target.value,
                                })
                              }
                              className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2.5 py-1 font-mono text-xs text-[#38bdf8] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-mono text-[9px] text-[#7a9490] block mb-0.5">
                                Target Goal (R)
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
                                className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#e6f4f1] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="font-mono text-[9px] text-[#7a9490] block mb-0.5">
                                Current (R) [If manual]
                              </label>
                              <input
                                type="number"
                                disabled={targetDraft.autoSyncLedger !== false}
                                value={targetDraft.currentAmountRand}
                                onChange={(e) =>
                                  setTargetDraft({
                                    ...targetDraft,
                                    currentAmountRand: Number(e.target.value),
                                  })
                                }
                                className="w-full bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#00f5a0] disabled:opacity-50 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setTargetDraft({
                                  ...targetDraft,
                                  autoSyncLedger: !targetDraft.autoSyncLedger,
                                })
                              }
                              className="font-mono text-[10px] text-[#38bdf8] underline cursor-pointer"
                            >
                              Sync with Ledger: {targetDraft.autoSyncLedger !== false ? 'ON' : 'OFF'}
                            </button>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingTargetId(null)}
                                className="px-2.5 py-1 rounded-lg bg-[#0c1818] font-mono text-[10px] text-[#7a9490] cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveTarget}
                                className="px-3 py-1 rounded-lg bg-[#00f5a0] font-mono text-[10px] text-[#021810] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-[#e6f4f1] font-mono tabular-nums">
                                  {target.titleRandUsd}
                                </span>
                                {pct >= 100 && (
                                  <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#00f5a0]/20 text-[#00f5a0] font-bold">
                                    UNLOCKED ✓
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#7a9490] mt-0.5">
                                {target.subtitle}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                                  pct >= 100
                                    ? 'bg-[#00f5a0] text-[#021810]'
                                    : 'bg-[#0c1818] text-[#7a9490] border border-[#162b29]'
                                }`}
                              >
                                {target.stageLabel}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTargetId(target.id);
                                  setTargetDraft({ ...target });
                                }}
                                className="text-[#55736f] hover:text-[#38bdf8] p-1 cursor-pointer transition-colors"
                                title="Edit milestone target"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Progress Meter */}
                          <div className="mt-2.5 flex flex-col gap-1">
                            <div className="w-full h-1.5 bg-[#050a0a] rounded-full overflow-hidden border border-[#162b29]">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  pct >= 100 ? 'bg-[#00f5a0]' : 'bg-[#38bdf8]'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-mono text-[#55736f]">
                              <span>
                                R{effectiveCurrentAmount.toLocaleString()} / R{target.targetAmountRand.toLocaleString()}{' '}
                                ({pct}%)
                              </span>
                              <span>Target: {target.deadline}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Free Cash Flow (FCF) Master Equation & Sovereign Mandate */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col justify-between gap-4 shadow-sm">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-[#00f5a0] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" /> Free Cash Flow (FCF) Master Equation
                </span>

                <div className="p-3 rounded-xl bg-[#050a0a] border border-[#162b29] font-mono text-xs text-[#00f5a0] leading-relaxed">
                  FCF = Total Verified Revenue - [Taxes + Core Ops + Minimum Discretionary]
                </div>

                <div className="text-xs leading-relaxed text-[#7a9490] space-y-2">
                  <p>
                    <strong className="text-[#e6f4f1]">The 100% Reinvestment Mandate:</strong>{' '}
                    Zero lifestyle inflation until the R100,000/mo cashflow threshold is mathematically ratified.
                    Every single Rand of surplus FCF is recycled into compounding assets:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[#e6f4f1]">
                    <li>Engineering compute, local GPU nodes &amp; server infrastructure.</li>
                    <li>Proprietary tools, domain licenses &amp; automation scripts.</li>
                    <li>Compounding equity &amp; treasury buffer (12+ months immunity).</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons to Jump to Ledger or Balance Sheet */}
              <div className="pt-3 border-t border-[#132626] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('LEDGER')}
                  className="w-full py-2 px-3 rounded-xl bg-[#002633] hover:bg-[#00384d] border border-[#38bdf8]/40 text-[#38bdf8] font-mono text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-sm"
                >
                  <span>Open Cashflow Ledger</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CRM')}
                  className="w-full py-2 px-3 rounded-xl bg-[#291f05] hover:bg-[#3d2f07] border border-[#fbbf24]/40 text-[#fbbf24] font-mono text-xs font-bold flex items-center justify-between cursor-pointer transition-colors shadow-sm"
                >
                  <span>Open Commercial CRM ({state.businessLeads.length} Leads)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: CASHFLOW LEDGER & RUNWAY */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Controls & Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#55736f]" />
                <input
                  type="text"
                  value={txSearchQuery}
                  onChange={(e) => setTxSearchQuery(e.target.value)}
                  placeholder="Search transactions by description or category..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#162b29] text-xs text-[#e6f4f1] placeholder-[#55736f] focus:outline-none focus:border-[#38bdf8]"
                />
              </div>

              {/* Type Filter Tabs */}
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setTxTypeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    txTypeFilter === 'ALL'
                      ? 'bg-[#002633] text-[#38bdf8] border border-[#38bdf8]/40 font-bold'
                      : 'bg-[#050a0a] text-[#7a9490] hover:bg-[#0c1818] border border-[#162b29]'
                  }`}
                >
                  All ({state.transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTxTypeFilter('INCOME')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    txTypeFilter === 'INCOME'
                      ? 'bg-[#002b21] text-[#00f5a0] border border-[#00f5a0]/40 font-bold'
                      : 'bg-[#050a0a] text-[#00f5a0] hover:bg-[#0c1818] border border-[#162b29]'
                  }`}
                >
                  + Income
                </button>
                <button
                  type="button"
                  onClick={() => setTxTypeFilter('EXPENSE')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    txTypeFilter === 'EXPENSE'
                      ? 'bg-[#2a0e0e] text-[#ff5c5c] border border-[#ff5c5c]/40 font-bold'
                      : 'bg-[#050a0a] text-[#ff5c5c] hover:bg-[#0c1818] border border-[#162b29]'
                  }`}
                >
                  - Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxTypeFilter('RECURRING')}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    txTypeFilter === 'RECURRING'
                      ? 'bg-[#1c1836] text-[#c0c1ff] border border-[#c0c1ff]/40 font-bold'
                      : 'bg-[#050a0a] text-[#c0c1ff] hover:bg-[#0c1818] border border-[#162b29]'
                  }`}
                >
                  Recurring
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Transaction Ledger Table */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <span className="font-mono text-xs text-[#e6f4f1] font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Verified Transaction Ledger ({filteredTransactions.length} entries)</span>
                <span className="text-[#00f5a0]">Net: R{financialTelemetry.freeCashFlow.toLocaleString()}</span>
              </span>

              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#081414] border border-[#162b29] text-center text-xs text-[#7a9490]">
                    No transactions match the selected filter.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'INCOME';
                    const isEditing = editingTxId === tx.id && editTxDraft;

                    return (
                      <div
                        key={tx.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                          isIncome
                            ? 'bg-[#081414] border-[#00f5a0]/30 hover:border-[#00f5a0]/60'
                            : 'bg-[#081414] border-[#ff5c5c]/30 hover:border-[#ff5c5c]/60'
                        }`}
                      >
                        {isEditing ? (
                          <form onSubmit={handleSaveEditTransaction} className="flex flex-col gap-2">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <select
                                value={editTxDraft.type}
                                onChange={(e) =>
                                  setEditTxDraft({ ...editTxDraft, type: e.target.value as any })
                                }
                                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#e6f4f1]"
                              >
                                <option value="INCOME">+ INCOME</option>
                                <option value="EXPENSE">- EXPENSE</option>
                              </select>
                              <input
                                type="text"
                                value={editTxDraft.category}
                                onChange={(e) =>
                                  setEditTxDraft({ ...editTxDraft, category: e.target.value })
                                }
                                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 text-xs text-[#e6f4f1]"
                              />
                              <input
                                type="number"
                                value={editTxDraft.amountRand}
                                onChange={(e) =>
                                  setEditTxDraft({
                                    ...editTxDraft,
                                    amountRand: Number(e.target.value) || 0,
                                  })
                                }
                                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#e6f4f1]"
                              />
                              <input
                                type="date"
                                value={editTxDraft.date}
                                onChange={(e) =>
                                  setEditTxDraft({ ...editTxDraft, date: e.target.value })
                                }
                                className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#e6f4f1]"
                              />
                            </div>
                            <input
                              type="text"
                              value={editTxDraft.description}
                              onChange={(e) =>
                                setEditTxDraft({ ...editTxDraft, description: e.target.value })
                              }
                              className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2.5 py-1 text-xs text-[#e6f4f1]"
                            />
                            <div className="flex items-center justify-between pt-1">
                              <label className="flex items-center gap-1.5 font-mono text-[10px] text-[#7a9490] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editTxDraft.isRecurring || false}
                                  onChange={(e) =>
                                    setEditTxDraft({ ...editTxDraft, isRecurring: e.target.checked })
                                  }
                                  className="accent-[#38bdf8]"
                                />
                                Recurring Monthly Commitment
                              </label>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingTxId(null)}
                                  className="px-2.5 py-1 rounded-lg bg-[#0c1818] font-mono text-[10px] text-[#7a9490] cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 rounded-lg bg-[#00f5a0] text-[#021810] font-mono text-[10px] font-bold cursor-pointer"
                                >
                                  Save Entry
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isIncome
                                    ? 'bg-[#00f5a0]/15 text-[#00f5a0]'
                                    : 'bg-[#ff5c5c]/15 text-[#ff5c5c]'
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowUpRight className="w-4 h-4" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                                  <span
                                    className={`text-[9px] font-bold ${
                                      isIncome ? 'text-[#00f5a0]' : 'text-[#ff5c5c]'
                                    }`}
                                  >
                                    {tx.type}
                                  </span>
                                  <span className="text-[#3b5552]">·</span>
                                  <span className="text-[10px] text-[#7a9490]">
                                    {tx.category}
                                  </span>
                                  {tx.isRecurring && (
                                    <>
                                      <span className="text-[#3b5552]">·</span>
                                      <span className="text-[9px] text-[#c0c1ff] font-bold">
                                        RECURRING
                                      </span>
                                    </>
                                  )}
                                  <span className="text-[#3b5552]">·</span>
                                  <span className="text-[10px] text-[#55736f]">
                                    {tx.date}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-[#e6f4f1] mt-0.5 truncate font-mono">
                                  {tx.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`font-mono text-sm font-black tabular-nums ${
                                  isIncome ? 'text-[#00f5a0]' : 'text-[#ff5c5c]'
                                }`}
                              >
                                {isIncome ? '+' : '-'}R{tx.amountRand.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTxId(tx.id);
                                  setEditTxDraft({ ...tx });
                                }}
                                className="text-[#55736f] hover:text-[#38bdf8] p-1 cursor-pointer transition-colors"
                                title="Edit transaction"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteTransaction(tx.id)}
                                className="text-[#55736f] hover:text-[#ff5c5c] p-1 cursor-pointer transition-colors"
                                title="Delete transaction"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right 4 cols: Add Transaction Form & Quick Stats */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <form
                onSubmit={handleCreateTransaction}
                className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-3.5 shadow-sm"
              >
                <span className="font-mono text-xs text-[#00f5a0] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-[#00f5a0]" /> Log Ledger Transaction
                </span>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                    Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('INCOME')}
                      className={`py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors ${
                        txType === 'INCOME'
                          ? 'bg-[#002b21] text-[#00f5a0] border border-[#00f5a0]/40 shadow-xs'
                          : 'bg-[#050a0a] text-[#7a9490] border border-[#162b29] hover:bg-[#0c1818]'
                      }`}
                    >
                      + Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('EXPENSE')}
                      className={`py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-colors ${
                        txType === 'EXPENSE'
                          ? 'bg-[#2a0e0e] text-[#ff5c5c] border border-[#ff5c5c]/40 shadow-xs'
                          : 'bg-[#050a0a] text-[#7a9490] border border-[#162b29] hover:bg-[#0c1818]'
                      }`}
                    >
                      - Expense
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                    Amount (ZAR R) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 font-mono text-sm text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                    Category
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-2.5 py-1.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                  >
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    placeholder="e.g. Production Retainer — Logistics SA"
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#00f5a0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] text-[#7a9490] uppercase font-bold">
                      Date
                    </label>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="bg-[#050a0a] border border-[#162b29] rounded-xl px-2.5 py-1.5 font-mono text-xs text-[#e6f4f1]"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-1.5 font-mono text-[10px] text-[#7a9490] p-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={txIsRecurring}
                        onChange={(e) => setTxIsRecurring(e.target.checked)}
                        className="accent-[#38bdf8]"
                      />
                      <span>Recurring?</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 py-2 px-3 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-black cursor-pointer transition-all shadow-[0_0_15px_rgba(0,245,160,0.25)] flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" /> Commit Transaction
                </button>
              </form>

              {/* FCF Breakdown Card */}
              <div className="p-4 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-2.5 font-mono text-xs shadow-sm">
                <span className="text-[#55736f] uppercase font-bold text-[10px]">
                  Cashflow Net Position
                </span>
                <div className="flex items-center justify-between text-[#00f5a0]">
                  <span>Total Inflow (Income):</span>
                  <span>+R{financialTelemetry.monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#ff5c5c]">
                  <span>Total Outflow (Burn):</span>
                  <span>-R{financialTelemetry.monthlyExpenses.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-[#132626] flex items-center justify-between font-bold text-sm text-[#e6f4f1]">
                  <span>Net FCF:</span>
                  <span className={financialTelemetry.freeCashFlow >= 0 ? 'text-[#00f5a0]' : 'text-[#ff5c5c]'}>
                    R{financialTelemetry.freeCashFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: BALANCE SHEET & NET WORTH */}
      {activeTab === 'BALANCE_SHEET' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Solvency & Capital Allocation Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#081414] border border-[#00f5a0]/40 flex flex-col justify-between shadow-sm">
              <span className="font-mono text-[10px] text-[#00f5a0] uppercase font-bold tracking-wider">
                Total Assets Valuation
              </span>
              <div className="text-2xl font-black font-mono text-[#00f5a0] mt-1 tabular-nums">
                R{financialTelemetry.totalAssets.toLocaleString()}
              </div>
              <span className="font-mono text-[10px] text-[#55736f] mt-0.5">
                Cash, Savings, Investments &amp; Hardware
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#081414] border border-[#ff5c5c]/40 flex flex-col justify-between shadow-sm">
              <span className="font-mono text-[10px] text-[#ff5c5c] uppercase font-bold tracking-wider">
                Total Liabilities &amp; Debts
              </span>
              <div className="text-2xl font-black font-mono text-[#ff5c5c] mt-1 tabular-nums">
                R{financialTelemetry.totalLiabilities.toLocaleString()}
              </div>
              <span className="font-mono text-[10px] text-[#55736f] mt-0.5">
                Credit facilities &amp; equipment financing
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#081414] border border-[#38bdf8]/40 flex flex-col justify-between shadow-sm">
              <span className="font-mono text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider">
                Debt-to-Asset Ratio
              </span>
              <div className="text-2xl font-black font-mono text-[#38bdf8] mt-1 tabular-nums">
                {financialTelemetry.debtToAssetRatio}%
              </div>
              <span className="font-mono text-[10px] text-[#55736f] mt-0.5">
                Sovereign Threshold: &lt;15% Maximum
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Assets CRUD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#132626] pb-2.5">
                <span className="font-mono text-xs text-[#00f5a0] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#00f5a0]" /> Assets &amp; Capital Allocations ({state.assets.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAsset(!showAddAsset)}
                  className="px-2.5 py-1 rounded-lg bg-[#002b21] hover:bg-[#003d2f] border border-[#00f5a0]/40 text-[#00f5a0] font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Asset
                </button>
              </div>

              {/* Add Asset Drawer */}
              {showAddAsset && (
                <form
                  onSubmit={handleCreateAsset}
                  className="p-3.5 rounded-xl bg-[#050a0a] border border-[#00f5a0]/40 flex flex-col gap-2.5 animate-fadeIn"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      placeholder="Asset Name (e.g. Treasury Index)"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2.5 py-1 text-xs text-[#e6f4f1] focus:outline-none focus:border-[#00f5a0]"
                    />
                    <select
                      value={newAssetCategory}
                      onChange={(e) => setNewAssetCategory(e.target.value as any)}
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#38bdf8] focus:outline-none"
                    >
                      <option value="CASH">CASH</option>
                      <option value="SAVINGS">SAVINGS</option>
                      <option value="INVESTMENTS">INVESTMENTS</option>
                      <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                      <option value="EQUITY">EQUITY</option>
                    </select>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newAssetValue}
                      onChange={(e) => setNewAssetValue(e.target.value)}
                      placeholder="Value (R)"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2.5 py-1 font-mono text-xs text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAddAsset(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#0c1818] font-mono text-[10px] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-[#00f5a0] text-[#021810] font-mono text-[10px] font-bold cursor-pointer"
                    >
                      Add to Balance Sheet
                    </button>
                  </div>
                </form>
              )}

              {/* Assets List */}
              <div className="space-y-2">
                {state.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-xl bg-[#050a0a] border border-[#162b29] hover:border-[#1d3734] transition-colors flex items-center justify-between gap-3 font-mono text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#081414] border border-[#162b29] text-[#38bdf8] font-bold">
                          {asset.category}
                        </span>
                        <span className="font-semibold text-[#e6f4f1] truncate">
                          {asset.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#55736f]">R</span>
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
                        className="w-28 bg-[#081414] border border-[#162b29] rounded-lg px-2 py-1 text-right font-mono text-xs text-[#00f5a0] tabular-nums focus:outline-none focus:border-[#00f5a0]"
                      />
                      {onDeleteAsset && (
                        <button
                          type="button"
                          onClick={() => onDeleteAsset(asset.id)}
                          className="text-[#55736f] hover:text-[#ff5c5c] p-1 cursor-pointer transition-colors"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Liabilities CRUD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#132626] pb-2.5">
                <span className="font-mono text-xs text-[#ff5c5c] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#ff5c5c]" /> Liabilities &amp; Debts ({state.liabilities.length})
                </span>
                {onAddLiability && (
                  <button
                    type="button"
                    onClick={() => setShowAddLiability(!showAddLiability)}
                    className="px-2.5 py-1 rounded-lg bg-[#2a0e0e] hover:bg-[#3d1414] border border-[#ff5c5c]/40 text-[#ff5c5c] font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Liability
                  </button>
                )}
              </div>

              {/* Add Liability Drawer */}
              {showAddLiability && onAddLiability && (
                <form
                  onSubmit={handleCreateLiability}
                  className="p-3.5 rounded-xl bg-[#050a0a] border border-[#ff5c5c]/40 flex flex-col gap-2.5 animate-fadeIn"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newLiabilityName}
                      onChange={(e) => setNewLiabilityName(e.target.value)}
                      placeholder="Liability Name (e.g. Server Financing)"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2.5 py-1 text-xs text-[#e6f4f1] focus:outline-none focus:border-[#ff5c5c]"
                    />
                    <input
                      type="text"
                      value={newLiabilityCategory}
                      onChange={(e) => setNewLiabilityCategory(e.target.value)}
                      placeholder="Category (e.g. Hardware Credit)"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2.5 py-1 text-xs text-[#e6f4f1] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={newLiabilityAmount}
                      onChange={(e) => setNewLiabilityAmount(e.target.value)}
                      placeholder="Principal (R)"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#ff5c5c] focus:outline-none focus:border-[#ff5c5c]"
                    />
                    <input
                      type="number"
                      value={newLiabilityRate}
                      onChange={(e) => setNewLiabilityRate(e.target.value)}
                      placeholder="Interest %"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#e6f4f1] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={newLiabilityPayment}
                      onChange={(e) => setNewLiabilityPayment(e.target.value)}
                      placeholder="Monthly (R)"
                      className="bg-[#081414] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-xs text-[#e6f4f1] focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowAddLiability(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#0c1818] font-mono text-[10px] text-[#7a9490] hover:text-[#e6f4f1] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-[#ff5c5c] text-[#1c0505] font-mono text-[10px] font-bold cursor-pointer"
                    >
                      Log Debt
                    </button>
                  </div>
                </form>
              )}

              {/* Liabilities List */}
              <div className="space-y-2">
                {state.liabilities.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#050a0a] border border-[#162b29] text-center text-xs text-[#00f5a0] font-mono">
                    ✓ Zero debt logged. 100% sovereign balance sheet!
                  </div>
                ) : (
                  state.liabilities.map((liab) => (
                    <div
                      key={liab.id}
                      className="p-3 rounded-xl bg-[#050a0a] border border-[#162b29] hover:border-[#2a1414] transition-colors flex items-center justify-between gap-3 font-mono text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#081414] border border-[#162b29] text-[#ff5c5c] font-bold">
                            {liab.category}
                          </span>
                          <span className="font-semibold text-[#e6f4f1] truncate">
                            {liab.name}
                          </span>
                        </div>
                        {liab.monthlyPaymentRand ? (
                          <div className="text-[10px] text-[#55736f] mt-0.5">
                            Min Payment: R{liab.monthlyPaymentRand.toLocaleString()}/mo · Rate: {liab.interestRatePercent || 0}%
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[#55736f]">R</span>
                        <input
                          type="number"
                          value={liab.amountRand}
                          onChange={(e) =>
                            onUpdateLiability({
                              ...liab,
                              amountRand: Number(e.target.value) || 0,
                              updatedAt: new Date().toISOString(),
                            })
                          }
                          className="w-28 bg-[#081414] border border-[#162b29] rounded-lg px-2 py-1 text-right font-mono text-xs text-[#ff5c5c] tabular-nums focus:outline-none focus:border-[#ff5c5c]"
                        />
                        {onDeleteLiability && (
                          <button
                            type="button"
                            onClick={() => onDeleteLiability(liab.id)}
                            className="text-[#55736f] hover:text-[#ff5c5c] p-1 cursor-pointer transition-colors"
                            title="Delete liability"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: COMMERCIAL CRM & PIPELINE */}
      {activeTab === 'CRM' && (
        <div className="space-y-6 animate-fadeIn">
          {/* CRM Header Bar */}
          <div className="p-4 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="font-mono text-xs text-[#fbbf24] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#fbbf24]" /> Commercial Outreach &amp; Diagnostic Pipeline
              </span>
              <p className="text-xs text-[#7a9490] mt-0.5">
                Convert diagnosed customer bottlenecks directly into recurring software revenue retainers.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#162b29]">
                <span className="text-[#55736f]">Active Pipeline: </span>
                <strong className="text-[#fbbf24]">R{financialTelemetry.totalPipelineValue.toLocaleString()}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#050a0a] border border-[#00f5a0]/40">
                <span className="text-[#55736f]">Closed Won: </span>
                <strong className="text-[#00f5a0]">R{financialTelemetry.closedWonValue.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* CRM Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.businessLeads.map((lead) => {
              const isClosedWon = lead.stage === 'CLOSED_WON';
              const isConverted = lead.convertedToLedger;

              return (
                <div
                  key={lead.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    isClosedWon
                      ? 'bg-[#002b21]/40 border-[#00f5a0]/50 shadow-[0_0_15px_rgba(0,245,160,0.1)]'
                      : 'bg-[#081414] border-[#162b29] hover:border-[#fbbf24]/40 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#e6f4f1] font-mono">{lead.name}</h4>
                        <div className="font-mono text-[11px] text-[#38bdf8] font-semibold mt-0.5">
                          {lead.organization}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteBusinessLead(lead.id)}
                        className="text-[#55736f] hover:text-[#ff5c5c] p-1 cursor-pointer transition-colors"
                        title="Delete prospect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#050a0a] border border-[#162b29] flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#7a9490]">Deal Value:</span>
                      <strong className="text-[#00f5a0]">R{lead.estimatedValueRand.toLocaleString()}/mo</strong>
                    </div>

                    <div className="text-xs text-[#7a9490]">
                      <strong className="text-[#e6f4f1]">Bottleneck:</strong> {lead.bottleneck}
                    </div>

                    <div className="text-xs text-[#00f5a0]">
                      <strong>Next Action:</strong> {lead.nextAction}
                    </div>
                  </div>

                  {/* Stage Dropdown & 1-Click Convert to Ledger */}
                  <div className="pt-3 border-t border-[#132626] flex flex-col gap-2">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#7a9490]">Funnel Stage:</span>
                      <select
                        value={lead.stage}
                        onChange={(e) =>
                          onUpdateBusinessLead({
                            ...lead,
                            stage: e.target.value as BusinessLead['stage'],
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className="bg-[#050a0a] border border-[#162b29] rounded-lg px-2 py-1 font-mono text-[11px] text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                      >
                        <option value="PROSPECT">PROSPECT</option>
                        <option value="OUTREACH">OUTREACH</option>
                        <option value="DIAGNOSTIC">DIAGNOSTIC</option>
                        <option value="PROPOSAL">PROPOSAL</option>
                        <option value="CLOSED_WON">CLOSED_WON</option>
                      </select>
                    </div>

                    {/* 1-Click "Convert to Ledger Income" Button */}
                    {isClosedWon && !isConverted && (
                      <button
                        type="button"
                        onClick={() => handleConvertLeadToIncome(lead)}
                        className="w-full py-2 px-2.5 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,245,160,0.3)] transition-all animate-pulse"
                      >
                        <Zap className="w-3.5 h-3.5 fill-[#021810]" /> Convert to +R{lead.estimatedValueRand.toLocaleString()} Ledger Income
                      </button>
                    )}

                    {isClosedWon && isConverted && (
                      <div className="text-center font-mono text-[10px] text-[#00f5a0] font-bold flex items-center justify-center gap-1 py-1">
                        <Check className="w-3.5 h-3.5 text-[#00f5a0]" /> Income Logged to Cashflow Ledger
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Lead Form */}
          <form
            onSubmit={handleCreateLead}
            className="p-4 sm:p-5 rounded-2xl bg-[#081414] border border-[#162b29] flex flex-col gap-3 shadow-sm"
          >
            <span className="font-mono text-xs text-[#fbbf24] uppercase font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-[#fbbf24]" /> Add Commercial Prospect to Pipeline
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                required
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Decision Maker Name"
                className="sm:col-span-3 bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#fbbf24]"
              />
              <input
                type="text"
                required
                value={leadOrg}
                onChange={(e) => setLeadOrg(e.target.value)}
                placeholder="Company / Organization"
                className="sm:col-span-3 bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#fbbf24]"
              />
              <input
                type="number"
                min={100}
                value={leadValue}
                onChange={(e) => setLeadValue(e.target.value)}
                placeholder="Est. Value (R/mo)"
                className="sm:col-span-2 bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 font-mono text-xs text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
              />
              <input
                type="text"
                value={leadBottleneck}
                onChange={(e) => setLeadBottleneck(e.target.value)}
                placeholder="Painful workflow bottleneck..."
                className="sm:col-span-4 bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={leadNextAction}
                onChange={(e) => setLeadNextAction(e.target.value)}
                placeholder="Next outreach step (e.g. Schedule 15-min discovery call)..."
                className="flex-1 bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] font-mono focus:outline-none focus:border-[#fbbf24]"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] text-[#1c1402] font-mono text-xs font-bold cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Prospect
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. EXPERIMENT SPECIFICATION CONFIGURATION MODAL */}
      {showExperimentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#081414] border border-[#162b29] rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#132626] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#38bdf8] font-bold uppercase tracking-wider">
                    EXPERIMENT CONFIGURATION
                  </span>
                  <span className="text-[#3b5552]">·</span>
                  <span className="font-mono text-[10px] text-[#55736f]">Module 05 Loop</span>
                </div>
                <h3 className="text-lg font-black text-[#e6f4f1] mt-1 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#38bdf8]" />
                  <span>Configure Target Product or Service</span>
                </h3>
                <p className="text-xs text-[#7a9490] mt-0.5">
                  Explicitly declare which product, service, or offering is under empirical validation in the 7-Step Commercial Experiment Loop.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExperimentModal(false)}
                className="p-1 rounded-lg text-[#55736f] hover:text-[#e6f4f1] hover:bg-[#0c1818] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="p-3.5 rounded-xl bg-[#050a0a] border border-[#162b29] flex flex-col gap-2">
              <span className="font-mono text-[10px] text-[#00f5a0] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00f5a0]" /> Quick Product / Service Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRODUCT_EXPERIMENT_PRESETS.map((preset) => {
                  const isCurrent =
                    experimentDraft.productOrServiceName === preset.productOrServiceName;
                  return (
                    <button
                      key={preset.productOrServiceName}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer font-mono text-[11px] flex flex-col gap-1 ${
                        isCurrent
                          ? 'bg-[#002b21] border-[#00f5a0] text-[#00f5a0] shadow-sm'
                          : 'bg-[#081212] border-[#162b29] hover:border-[#38bdf8]/40 text-[#7a9490]'
                      }`}
                    >
                      <div className="font-bold text-[#e6f4f1] truncate">
                        {preset.productOrServiceName}
                      </div>
                      <div className="text-[10px] text-[#55736f] flex items-center justify-between">
                        <span>{preset.targetVertical.split(',')[0]}</span>
                        <span className="text-[#fbbf24] font-semibold">{preset.pricingModel.split(' ')[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spec Form */}
            <form onSubmit={handleSaveExperiment} className="flex flex-col gap-3 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Product / Service Name */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Product or Service Offering Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={experimentDraft.productOrServiceName}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        productOrServiceName: e.target.value,
                      })
                    }
                    placeholder="e.g. B2B Automated Data Ingestion & Waybill Engine"
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                {/* Linked Milestone Project */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Linked Milestone Project
                  </label>
                  <select
                    value={experimentDraft.linkedProjectId || ''}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        linkedProjectId: e.target.value || undefined,
                      })
                    }
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-2.5 py-1.5 text-xs text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
                  >
                    <option value="">-- Independent Venture / No Direct Link --</option>
                    {state.projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.title} ({proj.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Validation Status */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Validation Funnel Status
                  </label>
                  <select
                    value={experimentDraft.status}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        status: e.target.value as CommercialExperimentSpec['status'],
                      })
                    }
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-2.5 py-1.5 text-xs text-[#38bdf8] focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="DISCOVERY">DISCOVERY (Hypothesis forming)</option>
                    <option value="VALIDATING">VALIDATING (Outreach &amp; Diagnostic)</option>
                    <option value="CONVERTED">CONVERTED (Paying customers closed)</option>
                    <option value="PIVOTED">PIVOTED (Hypothesis invalidated)</option>
                  </select>
                </div>

                {/* Target Industry Vertical */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Target Vertical / Industry
                  </label>
                  <input
                    type="text"
                    value={experimentDraft.targetVertical}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        targetVertical: e.target.value,
                      })
                    }
                    placeholder="e.g. Mid-Market Logistics, Freight &amp; Supply Chain"
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] focus:outline-none"
                  />
                </div>

                {/* Target Persona (ICP) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Target Decision-Maker Persona (ICP)
                  </label>
                  <input
                    type="text"
                    value={experimentDraft.targetPersona}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        targetPersona: e.target.value,
                      })
                    }
                    placeholder="e.g. Operations Director, CFO &amp; Head of Dispatch"
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] focus:outline-none"
                  />
                </div>

                {/* Pricing Model */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Pricing Model / Target Contract Value
                  </label>
                  <input
                    type="text"
                    value={experimentDraft.pricingModel}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        pricingModel: e.target.value,
                      })
                    }
                    placeholder="e.g. R15,000/mo Recurring Software Retainer"
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#fbbf24] focus:outline-none"
                  />
                </div>

                {/* Core Hypothesis */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Core Validation Hypothesis (Step 01 Truth)
                  </label>
                  <textarea
                    rows={2}
                    value={experimentDraft.coreHypothesis}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        coreHypothesis: e.target.value,
                      })
                    }
                    placeholder="Operators will pay [Price] to solve [Painful Bottleneck] because [Reason]..."
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#e6f4f1] focus:outline-none"
                  />
                </div>

                {/* Grand Slam Offer & Guarantee */}
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-[#7a9490]">
                    Grand Slam Offer &amp; Risk Reversal Guarantee (Step 03)
                  </label>
                  <textarea
                    rows={2}
                    value={experimentDraft.grandSlamOffer}
                    onChange={(e) =>
                      setExperimentDraft({
                        ...experimentDraft,
                        grandSlamOffer: e.target.value,
                      })
                    }
                    placeholder="e.g. Guaranteed <0.5% error rate and 15+ hrs/week saved within 30 days, or 100% money back."
                    className="bg-[#050a0a] border border-[#162b29] rounded-xl px-3 py-1.5 text-xs text-[#00f5a0] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#132626] mt-2">
                <button
                  type="button"
                  onClick={() => setShowExperimentModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#0c1818] hover:bg-[#122424] text-[#7a9490] hover:text-[#e6f4f1] font-mono text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00f5a0] hover:bg-[#00f5a0]/90 text-[#021810] font-mono text-xs font-black cursor-pointer transition-all shadow-[0_0_15px_rgba(0,245,160,0.25)] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Experiment Specification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
