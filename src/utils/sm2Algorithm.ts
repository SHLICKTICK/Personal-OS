/**
 * SuperMemo SM-2 Spaced Repetition Algorithm & Ebbinghaus Retention Decay Engine
 * 
 * Implements calibrated SM-2 interval arithmetic, ease factor adjustments,
 * and Ebbinghaus exponential memory decay modeling for the Personal OS Learning Engine.
 */

export type SM2Rating = 'Forgot' | 'Hard' | 'Good' | 'Easy';

export interface SM2State {
  repetitionCount: number; // n: consecutive successful reviews
  intervalDays: number;    // I_n: days until next review
  easeFactor: number;      // EF: difficulty factor (minimum 1.3, initial 2.5)
  nextDueDate: string;     // ISO timestamp for next scheduled retrieval
  lastReviewedDate: string;// ISO timestamp of last review
  lastGrade: number;       // 1 to 5 numerical grade
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
 * @param current Current SM-2 state or topic parameters
 * @param rating User self-evaluation or AI assessment ('Forgot', 'Hard', 'Good', 'Easy')
 */
export function calculateNextSM2Interval(
  current: Partial<SM2State>,
  rating: SM2Rating
): SM2CalculationResult {
  // Map qualitative rating to SM-2 quality grade (q: 0-5)
  // Forgot: q=1, Hard: q=3, Good: q=4, Easy: q=5
  const q = rating === 'Forgot' ? 1 : rating === 'Hard' ? 3 : rating === 'Good' ? 4 : 5;

  let repetitionCount = current.repetitionCount ?? 0;
  let intervalDays = current.intervalDays ?? 1;
  let easeFactor = current.easeFactor ?? 2.5;
  const previousIntervalDays = intervalDays;

  if (q < 3) {
    // Incorrect / Failed Recall: Reset repetition streak, schedule for immediate re-test
    repetitionCount = 0;
    intervalDays = 1;
  } else {
    // Successful Recall: Apply SM-2 progression
    if (repetitionCount === 0) {
      intervalDays = 1;
    } else if (repetitionCount === 1) {
      intervalDays = 6;
    } else {
      const bonusMultiplier = rating === 'Easy' ? 1.3 : 1.0;
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor * bonusMultiplier));
    }
    repetitionCount += 1;
  }

  // Adjust Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Enforce lower bound of 1.3
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  easeFactor = Math.max(1.3, Number((easeFactor + efDelta).toFixed(2)));

  // Calculate timestamps
  const now = new Date();
  const nextDueDateObj = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const nextDueDate = nextDueDateObj.toISOString();
  const lastReviewedDate = now.toISOString();

  // Half-life calculation based on memory stability (S ≈ intervalDays * (easeFactor / 2.5))
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
export function previewNextIntervals(current: Partial<SM2State>): Record<SM2Rating, { intervalDays: number; label: string; dateStr: string }> {
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
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      status: 'OVERDUE',
      label: `Overdue by ${absDays}d`,
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
 * Calculates current retention percentage: R(t) = e^(-t / S)
 * where t is elapsed days since last review and S is memory stability.
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
    };
  }

  const lastRev = new Date(lastReviewedDateStr);
  const now = new Date();
  const elapsedDays = Math.max(0, (now.getTime() - lastRev.getTime()) / (24 * 60 * 60 * 1000));

  // R(t) = exp(-elapsed / stability)
  const rawRetention = Math.exp(-elapsedDays / stability);
  const retentionPct = Math.round(Math.max(10, Math.min(100, rawRetention * 100)));
  const remainingHalfLifeDays = Math.max(0, Number((halfLifeDays - elapsedDays).toFixed(1)));

  return {
    retentionPct,
    elapsedDays: Number(elapsedDays.toFixed(1)),
    halfLifeDays: Number(halfLifeDays.toFixed(1)),
    remainingHalfLifeDays,
    stabilityScore: Number(stability.toFixed(1)),
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
  const steps = 25;
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
