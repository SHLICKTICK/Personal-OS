import { POSState } from '../models/types';
import { SEED_POS_STATE } from '../data/seedData';

const STORAGE_KEY = 'personal_os_v48_state_v1';

export interface IPOSRepository {
  loadState(): POSState;
  saveState(state: POSState): { ok: boolean; error?: string };
  resetToSeed(): POSState;
  exportJson(state: POSState): string;
  importJson(rawJson: string): { ok: boolean; state?: POSState; error?: string };
}

export class LocalStoragePOSRepository implements IPOSRepository {
  loadState(): POSState {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveState(SEED_POS_STATE);
        return SEED_POS_STATE;
      }
      const parsed = JSON.parse(raw) as Partial<POSState>;
      const existingGoals = Array.isArray(parsed.goals) ? parsed.goals : SEED_POS_STATE.goals;
      const hasTodayGoals = existingGoals.some((g) => g.horizon === 'Today');
      const mergedGoals = hasTodayGoals
        ? existingGoals
        : [...SEED_POS_STATE.goals.filter((g) => g.horizon === 'Today'), ...existingGoals];

      // Enrich Today goals if missing slotNumber or sourceType
      const enrichedGoals = mergedGoals.map((g) => {
        if (g.horizon === 'Today') {
          const matchingSeed = SEED_POS_STATE.goals.find((sg) => sg.id === g.id || sg.slotNumber === g.slotNumber);
          if (matchingSeed) {
            return {
              ...matchingSeed,
              ...g,
              slotNumber: g.slotNumber || matchingSeed.slotNumber,
              sourceType: g.sourceType || matchingSeed.sourceType,
              sourceRefCode: g.sourceRefCode || matchingSeed.sourceRefCode,
              sourceProjectId: g.sourceProjectId || matchingSeed.sourceProjectId,
              sourceProjectStepId: g.sourceProjectStepId || matchingSeed.sourceProjectStepId,
              sourceSdlcPhase: g.sourceSdlcPhase || matchingSeed.sourceSdlcPhase,
              sourceFinancialStepId: g.sourceFinancialStepId || matchingSeed.sourceFinancialStepId,
              sourceLearningTopicId: g.sourceLearningTopicId || matchingSeed.sourceLearningTopicId,
              estimatedMinutes: g.estimatedMinutes || matchingSeed.estimatedMinutes,
            };
          }
        }
        return g;
      });

      // Merge activeCommercialExperiment & step productAction if older localStorage version
      const activeCommercialExperiment =
        parsed.activeCommercialExperiment || SEED_POS_STATE.activeCommercialExperiment;

      const mergedSteps = Array.isArray(parsed.businessExperimentSteps)
        ? parsed.businessExperimentSteps.map((s, idx) => ({
            ...s,
            productAction:
              s.productAction ||
              SEED_POS_STATE.businessExperimentSteps[idx]?.productAction ||
              '',
          }))
        : SEED_POS_STATE.businessExperimentSteps;

      const dailyPerformanceLogs = Array.isArray(parsed.dailyPerformanceLogs) && parsed.dailyPerformanceLogs.length > 0
        ? parsed.dailyPerformanceLogs
        : SEED_POS_STATE.dailyPerformanceLogs;

      const focusSessions = Array.isArray(parsed.focusSessions) && parsed.focusSessions.length > 0
        ? parsed.focusSessions
        : (SEED_POS_STATE.focusSessions || []);

      const dailySchedule = Array.isArray(parsed.dailySchedule) && parsed.dailySchedule.length > 0
        ? parsed.dailySchedule
        : SEED_POS_STATE.dailySchedule;

      const activeFocusTimer = parsed.activeFocusTimer || SEED_POS_STATE.activeFocusTimer;

      return {
        ...SEED_POS_STATE,
        ...parsed,
        goals: enrichedGoals,
        activeCommercialExperiment,
        businessExperimentSteps: mergedSteps,
        dailyPerformanceLogs,
        focusSessions,
        dailySchedule,
        activeFocusTimer,
      };
    } catch {
      return SEED_POS_STATE;
    }
  }

  saveState(state: POSState): { ok: boolean; error?: string } {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Your changes could not be saved to local storage.' };
    }
  }

  resetToSeed(): POSState {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POS_STATE));
    } catch {
      // ignore
    }
    return SEED_POS_STATE;
  }

  exportJson(state: POSState): string {
    return JSON.stringify(state, null, 2);
  }

  importJson(rawJson: string): { ok: boolean; state?: POSState; error?: string } {
    try {
      const parsed = JSON.parse(rawJson) as Partial<POSState>;
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.projects)) {
        return { ok: false, error: 'Invalid PERSONAL OS blueprint JSON schema.' };
      }
      const merged: POSState = {
        ...SEED_POS_STATE,
        ...parsed,
      };
      this.saveState(merged);
      return { ok: true, state: merged };
    } catch {
      return { ok: false, error: 'Could not parse JSON file. Verify syntax and try again.' };
    }
  }
}

export const posRepository: IPOSRepository = new LocalStoragePOSRepository();
