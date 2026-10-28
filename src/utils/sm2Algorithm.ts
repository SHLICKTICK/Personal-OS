/**
 * SuperMemo SM-2 Spaced Repetition Algorithm & Ebbinghaus Retention Decay Engine
 * 
 * Implements calibrated SM-2 interval arithmetic, ease factor adjustments,
 * Ebbinghaus exponential memory decay modeling, and criterion rubric scoring formulas.
 */

import {
  AssessmentCriterion,
  CriterionEvaluationResult,
  DetectedMisconception,
  MisconceptionRule,
} from '../models/learningAssessmentTypes';

export type SM2Rating = 'Forgot' | 'Hard' | 'Good' | 'Easy';

export interface SM2State {
  repetitionCount: number; // n: consecutive successful reviews
  intervalDays: number;    // I_n: days until next review
  easeFactor: number;      // EF: difficulty factor (minimum 1.3, initial 2.5)
  nextDueDate: string;     // ISO timestamp for next scheduled retrieval
  lastReviewedDate: string;// ISO timestamp of last review
  lastGrade: number;       // 0 to 5 numerical grade (Forgot=0, Hard=3, Good=4, Easy=5)
}

export interface SM2CalculationResult extends SM2State {
  previousIntervalDays: number;
  intervalDeltaDays: number;
  decayHalfLifeDays: number;
  dueStatus: 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'OPTIMAL' | 'STABLE';
  dueStatusLabel: string;
}

export interface DecayPoint {
  day: number;
  retentionPct: number;
  isToday?: boolean;
  isOptimalPoint?: boolean;
}

/**
 * Standard SuperMemo SM-2 Interval Calculation
 * 
 * Classic SM-2 grade mapping:
 * Forgot: q = 0 (Failure: resets repetitions to 0, 1-day relearn interval)
 * Hard:   q = 3 (Success with difficulty: reinforcement interval 2 days, EF decreases by 0.14)
 * Good:   q = 4 (Normal successful recall: optimal SM-2 progression, EF unchanged)
 * Easy:   q = 5 (Effortless recall: extended interval bonus, EF increases by 0.10)
 */
export function calculateNextSM2Interval(
  current: Partial<SM2State>,
  rating: SM2Rating
): SM2CalculationResult {
  const q = rating === 'Forgot' ? 0 : rating === 'Hard' ? 3 : rating === 'Good' ? 4 : 5;

  let repetitionCount = current.repetitionCount ?? 0;
  let intervalDays = current.intervalDays ?? 1;
  let easeFactor = current.easeFactor ?? 2.5;
  const previousIntervalDays = intervalDays;

  if (q < 3) {
    // Failed recall (Forgot = 0): Reset repetition streak, schedule for immediate re-test
    repetitionCount = 0;
    intervalDays = 1;
  } else {
    // Successful recall (q >= 3):
    if (rating === 'Hard') {
      // Reinforcement short interval
      intervalDays = 2;
      repetitionCount += 1;
    } else if (repetitionCount === 0) {
      intervalDays = 1;
      repetitionCount += 1;
    } else if (repetitionCount === 1) {
      intervalDays = 6;
      repetitionCount += 1;
    } else {
      const bonusMultiplier = rating === 'Easy' ? 1.3 : 1.0;
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor * bonusMultiplier));
      repetitionCount += 1;
    }
  }

  // Adjust Ease Factor: EF' = max(1.3, EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(1.3, Number((easeFactor + efDelta).toFixed(2)));

  // Timestamps
  const now = new Date();
  const nextDueDateObj = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const nextDueDate = nextDueDateObj.toISOString();
  const lastReviewedDate = now.toISOString();

  // Illustrative memory stability: S ≈ intervalDays * (easeFactor / 2.5)
  const memoryStability = Math.max(1, intervalDays * (easeFactor / 2.5));
  const decayHalfLifeDays = Number((memoryStability * Math.LN2).toFixed(1));

  const statusInfo = getDueStatus(nextDueDate);

  return {
    repetitionCount,
    intervalDays,
    easeFactor,
    nextDueDate,
    lastReviewedDate,
    lastGrade: q,
    previousIntervalDays,
    intervalDeltaDays: intervalDays - previousIntervalDays,
    decayHalfLifeDays,
    dueStatus: statusInfo.status,
    dueStatusLabel: statusInfo.label,
  };
}

/**
 * Preview upcoming intervals for all 4 ratings without committing state changes
 */
export function previewNextIntervals(
  current: Partial<SM2State>
): Record<SM2Rating, { intervalDays: number; label: string; dateStr: string }> {
  const ratings: SM2Rating[] = ['Forgot', 'Hard', 'Good', 'Easy'];
  const preview: Record<string, { intervalDays: number; label: string; dateStr: string }> = {};

  ratings.forEach((r) => {
    const res = calculateNextSM2Interval(current, r);
    const dateObj = new Date(res.nextDueDate);
    const dateFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const dayLabel = res.intervalDays === 1 ? '1 day' : `${res.intervalDays} days`;
    preview[r] = {
      intervalDays: res.intervalDays,
      label: dayLabel,
      dateStr: dateFormatted,
    };
  });

  return preview as Record<SM2Rating, { intervalDays: number; label: string; dateStr: string }>;
}

/**
 * Determine due status based on nextDueDate timestamp
 */
export function getDueStatus(nextDueDateStr?: string): {
  status: 'OVERDUE' | 'DUE_TODAY' | 'DUE_SOON' | 'OPTIMAL' | 'STABLE';
  label: string;
  daysRemaining: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  if (!nextDueDateStr) {
    return {
      status: 'DUE_TODAY',
      label: 'Due Today',
      daysRemaining: 0,
      badgeBg: 'bg-[#f59e0b]/15',
      badgeText: 'text-[#f59e0b]',
      badgeBorder: 'border-[#f59e0b]/40',
    };
  }

  const now = new Date();
  const dueDate = new Date(nextDueDateStr);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return {
      status: 'OVERDUE',
      label: `${Math.abs(diffDays)}d overdue`,
      daysRemaining: diffDays,
      badgeBg: 'bg-[#ff5c5c]/15',
      badgeText: 'text-[#ff5c5c]',
      badgeBorder: 'border-[#ff5c5c]/40',
    };
  } else if (diffDays === 0) {
    return {
      status: 'DUE_TODAY',
      label: 'Due Today',
      daysRemaining: 0,
      badgeBg: 'bg-[#f59e0b]/15',
      badgeText: 'text-[#f59e0b]',
      badgeBorder: 'border-[#f59e0b]/40',
    };
  } else if (diffDays <= 2) {
    return {
      status: 'DUE_SOON',
      label: `Due in ${diffDays}d`,
      daysRemaining: diffDays,
      badgeBg: 'bg-[#38bdf8]/15',
      badgeText: 'text-[#38bdf8]',
      badgeBorder: 'border-[#38bdf8]/40',
    };
  } else if (diffDays <= 7) {
    return {
      status: 'OPTIMAL',
      label: `In ${diffDays}d`,
      daysRemaining: diffDays,
      badgeBg: 'bg-[#00f5a0]/15',
      badgeText: 'text-[#00f5a0]',
      badgeBorder: 'border-[#00f5a0]/40',
    };
  } else {
    return {
      status: 'STABLE',
      label: `In ${diffDays}d`,
      daysRemaining: diffDays,
      badgeBg: 'bg-[#00f5a0]/15',
      badgeText: 'text-[#00f5a0]',
      badgeBorder: 'border-[#00f5a0]/40',
    };
  }
}

/**
 * Ebbinghaus Retention Decay Modeling
 * 
 * Calculates current retention percentage: R(t) = exp(-t / S)
 * where t is elapsed days since last review and S is memory stability.
 * 
 * Explicitly documented as an illustrative theoretical estimate.
 */
export function calculateCurrentRetention(
  lastReviewedDateStr?: string,
  intervalDays: number = 7,
  easeFactor: number = 2.5
): {
  retentionPct: number;
  elapsedDays: number;
  halfLifeDays: number;
  remainingHalfLifeDays: number;
  stabilityScore: number;
  modelType: 'ILLUSTRATIVE_ESTIMATE';
} {
  const stability = Math.max(1, intervalDays * (easeFactor / 2.5));
  const halfLifeDays = stability * Math.LN2;

  if (!lastReviewedDateStr || isNaN(Date.parse(lastReviewedDateStr))) {
    return {
      retentionPct: 0,
      elapsedDays: 0,
      halfLifeDays: Number(halfLifeDays.toFixed(1)),
      remainingHalfLifeDays: 0,
      stabilityScore: Number(stability.toFixed(1)),
      modelType: 'ILLUSTRATIVE_ESTIMATE',
    };
  }

  const lastRev = new Date(lastReviewedDateStr);
  const now = new Date();
  const elapsedDays = Math.max(0, (now.getTime() - lastRev.getTime()) / (24 * 60 * 60 * 1000));

  // R(t) = exp(-elapsed / stability)
  const rawRetention = Math.exp(-elapsedDays / stability);
  const retentionPct = Math.round(Math.max(0, Math.min(100, rawRetention * 100)));
  const remainingHalfLifeDays = Math.max(0, Number((halfLifeDays - elapsedDays).toFixed(1)));

  return {
    retentionPct,
    elapsedDays: Number(elapsedDays.toFixed(1)),
    halfLifeDays: Number(halfLifeDays.toFixed(1)),
    remainingHalfLifeDays,
    stabilityScore: Number(stability.toFixed(1)),
    modelType: 'ILLUSTRATIVE_ESTIMATE',
  };
}

/**
 * Generate curve points for SVG rendering of the Ebbinghaus Retention Curve
 */
export function generateDecayCurvePoints(
  intervalDays: number = 7,
  easeFactor: number = 2.5,
  elapsedDays: number = 0,
  maxDays: number = 30
): DecayPoint[] {
  const stability = Math.max(1, intervalDays * (easeFactor / 2.5));
  const points: DecayPoint[] = [];
  const steps = 30;
  const dayStep = maxDays / steps;

  for (let i = 0; i <= steps; i++) {
    const day = Number((i * dayStep).toFixed(1));
    const retention = Math.exp(-day / stability);
    const retentionPct = Math.round(retention * 100);

    const isToday = Math.abs(day - elapsedDays) < dayStep / 2;
    const isOptimalPoint = Math.abs(day - intervalDays) < dayStep / 2;

    points.push({
      day,
      retentionPct,
      isToday,
      isOptimalPoint,
    });
  }

  return points;
}

// =========================================================================
// SECTION 6 RUBRIC SCORING & MISCONCEPTION EVALUATION UTILITIES
// =========================================================================

/**
 * Calculates normalized weighted percentage for criterion evaluation results:
 * percentage = sum(weight * score / maxScore) / sum(weight) * 100
 */
export function calculateWeightedRubricScore(
  criterionResults: Array<{ score: number; maxScore: number; weight: number }>
): number {
  if (!criterionResults || criterionResults.length === 0) return 0;

  let totalWeightedAchieved = 0;
  let totalWeights = 0;

  for (const cr of criterionResults) {
    const weight = Math.max(0.1, cr.weight || 1.0);
    const maxScore = Math.max(1, cr.maxScore || 4);
    const score = Math.max(0, Math.min(maxScore, cr.score || 0));

    totalWeightedAchieved += weight * (score / maxScore);
    totalWeights += weight;
  }

  if (totalWeights === 0) return 0;
  const percentage = (totalWeightedAchieved / totalWeights) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage)));
}

/**
 * Evaluates whether an assessment attempt satisfies passing rules,
 * strictly enforcing that fatal critical misconceptions override aggregate scores.
 */
export function evaluatePassingAndMisconceptionRules(
  weightedScorePct: number,
  passingScorePct: number = 75,
  detectedMisconceptions: DetectedMisconception[] = []
): {
  passed: boolean;
  blockedByFatalMisconception: boolean;
  fatalMisconceptionNames: string[];
} {
  const fatal = detectedMisconceptions.filter((m) => m.isFatalToCompetence);
  const blockedByFatalMisconception = fatal.length > 0;

  const passed = !blockedByFatalMisconception && weightedScorePct >= passingScorePct;

  return {
    passed,
    blockedByFatalMisconception,
    fatalMisconceptionNames: fatal.map((f) => f.name),
  };
}
