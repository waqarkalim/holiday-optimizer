import {
  Break,
  OptimizationParams,
  OptimizationResult,
  OptimizationStats,
  OptimizationStrategy,
  OptimizedDay,
} from '@/types';

/* -----------------------------
   Helper Functions
----------------------------- */

// Format a Date object as 'YYYY-MM-DD'
const formatDate = (date: Date): string => {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const dy = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
};

// Add a specified number of days to a Date object.
const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/**
 * Returns true if a day is naturally off (i.e., weekend, public holiday, or company day off).
 */
const isFixedOff = (day: OptimizedDay): boolean =>
  day.isWeekend || day.isPublicHoliday || day.isCompanyDayOff;

/**
 * Determine the dynamic spacing (in days) between segments based on strategy.
 */
const getDynamicSpacing = (strategy?: OptimizationStrategy): number => {
  switch (strategy) {
    case 'longWeekends':
      return 7;
    case 'miniBreaks':
      return 14;
    case 'weekLongBreaks':
      return 21;
    case 'extendedVacations':
      return 30;
    case 'balanced':
    default:
      return 21;
  }
};

/* -----------------------------
   Candidate Segment Type
----------------------------- */
interface CandidateSegment {
  startIdx: number;
  endIdx: number;
  totalDays: number;
  ptoUsed: number;
  efficiency: number; // = totalDays / ptoUsed
  startDate: string;
  endDate: string;
  segmentDays: OptimizedDay[];
}

/* -----------------------------
   Strategy Parameter Setter
----------------------------- */
const getStrategyParams = (strategy?: OptimizationStrategy) => {
  let minBreak: number, maxBreak: number;
  switch (strategy) {
    case 'longWeekends':
      minBreak = 3;
      maxBreak = 4;
      break;
    case 'miniBreaks':
      minBreak = 5;
      maxBreak = 6;
      break;
    case 'weekLongBreaks':
      minBreak = 7;
      maxBreak = 9;
      break;
    case 'extendedVacations':
      minBreak = 10;
      maxBreak = 15;
      break;
    case 'balanced':
    default:
      // For "balanced", candidates are generated across all ranges.
      minBreak = 3;
      maxBreak = 15;
      break;
  }
  return { minBreak, maxBreak };
};

/* -----------------------------
   Build Full Calendar
----------------------------- */
const buildCalendar = (params: OptimizationParams): OptimizedDay[] => {
  // Determine target year (provided or current year).
  const targetYear = params.year || new Date().getFullYear();
  const now = new Date();
  // If running on the current year, start from today's date; otherwise, start at January 1.
  const startOfYear =
    targetYear === now.getFullYear()
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
      : new Date(targetYear, 0, 1);
  const endOfYear = new Date(targetYear, 11, 31);
  const calendar: OptimizedDay[] = [];

  for (let d = new Date(startOfYear); d <= endOfYear; d = addDays(d, 1)) {
    const dateStr = formatDate(d);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let isPublicHoliday = false;
    let publicHolidayName: string | undefined;
    if (params.holidays) {
      for (const holiday of params.holidays) {
        if (holiday.date === dateStr) {
          isPublicHoliday = true;
          publicHolidayName = holiday.name;
          break;
        }
      }
    }

    let isCompanyDayOff = false;
    let companyDayName: string | undefined;
    if (params.companyDaysOff) {
      for (const dayOff of params.companyDaysOff) {
        if (
          dayOff.isRecurring &&
          dayOff.startDate &&
          dayOff.endDate &&
          dayOff.weekday !== undefined
        ) {
          const recurringStart = new Date(dayOff.startDate);
          const recurringEnd = new Date(dayOff.endDate);
          if (d >= recurringStart && d <= recurringEnd && d.getDay() === dayOff.weekday) {
            isCompanyDayOff = true;
            companyDayName = dayOff.name;
            break;
          }
        } else if (dayOff.date === dateStr) {
          isCompanyDayOff = true;
          companyDayName = dayOff.name;
          break;
        }
      }
    }

    const day: OptimizedDay = {
      date: formatDate(d),
      isWeekend,
      isPublicHoliday,
      publicHolidayName,
      isCompanyDayOff,
      companyDayName,
      isPTO: false,
      isPartOfBreak: false,
    };

    calendar.push(day);
  }
  return calendar;
};

/* -----------------------------
   Generate Candidate Segments
----------------------------- */
const generateCandidateSegments = (
  calendar: OptimizedDay[],
  minBreak: number,
  maxBreak: number
): CandidateSegment[] => {
  const candidates: CandidateSegment[] = [];
  const totalDays = calendar.length;
  for (let i = 0; i < totalDays; i++) {
    // Try all segment lengths in the specified range.
    for (let L = minBreak; L <= maxBreak; L++) {
      if (i + L - 1 >= totalDays) break;
      const segmentDays: OptimizedDay[] = [];
      let ptoUsed = 0;
      for (let j = i; j < i + L; j++) {
        const day = calendar[j];
        if (!isFixedOff(day)) {
          ptoUsed++;
        }
        segmentDays.push(day);
      }
      if (ptoUsed > 0) {
        candidates.push({
          startIdx: i,
          endIdx: i + L - 1,
          totalDays: L,
          ptoUsed,
          efficiency: L / ptoUsed,
          startDate: calendar[i].date,
          endDate: calendar[i + L - 1].date,
          segmentDays: [...segmentDays],
        });
      }
    }
  }
  return candidates;
};

const pruneCandidateSegments = (
  segments: CandidateSegment[],
  availablePTO: number
): CandidateSegment[] => {
  // Filter out segments that exceed available PTO days.
  const filtered = segments.filter(seg => seg.ptoUsed <= availablePTO);
  const grouped = new Map<number, CandidateSegment[]>();
  for (const seg of filtered) {
    const group = grouped.get(seg.startIdx) || [];
    group.push(seg);
    grouped.set(seg.startIdx, group);
  }
  const pruned: CandidateSegment[] = [];
  for (const group of grouped.values()) {
    const nonDominated: CandidateSegment[] = [];
    for (const seg of group) {
      let dominated = false;
      for (const other of group) {
        if (other === seg) continue;
        // One segment dominates another if it ends later,
        // uses fewer or equal PTO days, and provides equal or greater total days off.
        if (
          other.endIdx >= seg.endIdx &&
          other.ptoUsed <= seg.ptoUsed &&
          other.totalDays >= seg.totalDays
        ) {
          dominated = true;
          break;
        }
      }
      if (!dominated) nonDominated.push(seg);
    }
    pruned.push(...nonDominated);
  }
  pruned.sort((a, b) => a.startIdx - b.startIdx);
  return pruned;
};

const binarySearch = (
  candidates: CandidateSegment[],
  requiredStart: number,
  low: number
): number => {
  let lo = low,
    hi = candidates.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (candidates[mid].startIdx < requiredStart) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
};

interface DPSolution {
  totalDaysOff: number;
  segments: CandidateSegment[];
  totalPTOUsed: number;
}

/* -----------------------------
   Dynamic Programming Exhaustive Search
----------------------------- */
const dpExhaustiveSearch = (
  candidates: CandidateSegment[],
  availablePTO: number,
  spacing: number
): DPSolution => {
  const memo = new Map<string, DPSolution>();

  const dp = (
    idx: number,
    lastEnd: number,
    usedPTO: number
  ): DPSolution => {
    if (idx >= candidates.length) return { totalDaysOff: 0, segments: [], totalPTOUsed: 0 };
    const key = `${idx}-${lastEnd}-${usedPTO}`;
    if (memo.has(key)) return memo.get(key)!;

    const requiredStart = lastEnd + spacing;
    const nextIdx = binarySearch(candidates, requiredStart, idx);
    let best: DPSolution = { totalDaysOff: 0, segments: [], totalPTOUsed: 0 };

    for (let i = nextIdx; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate.startIdx < requiredStart) continue;
      if (usedPTO + candidate.ptoUsed > availablePTO) continue;
      const res = dp(i + 1, candidate.endIdx, usedPTO + candidate.ptoUsed);
      const total = candidate.totalDays + res.totalDaysOff;
      if (total > best.totalDaysOff) {
        best = {
          totalDaysOff: total,
          segments: [candidate, ...res.segments],
          totalPTOUsed: candidate.ptoUsed + res.totalPTOUsed,
        };
      }
    }
    memo.set(key, best);
    return best;
  };

  return dp(0, -1, 0);
};

/* -----------------------------
   Forced Extension and Additional Segments
----------------------------- */
const forceExtendSegments = (
  calendar: OptimizedDay[],
  breaks: Break[],
  remainingPTO: number
): number => {
  const totalDays = calendar.length;
  for (const brk of breaks) {
    let endIdx = calendar.findIndex(day => day.date === brk.endDate);
    while (remainingPTO > 0 && endIdx < totalDays - 1) {
      const nextDay = calendar[endIdx + 1];
      if (nextDay.isPartOfBreak) break;
      if (!isFixedOff(nextDay)) {
        nextDay.isPTO = true;
        nextDay.isPartOfBreak = true;
        brk.days.push(nextDay);
        brk.totalDays++;
        brk.ptoDays++;
        remainingPTO--;
        endIdx++;
        brk.endDate = nextDay.date;
      } else {
        break;
      }
    }
  }
  return remainingPTO;
};

const addForcedSegments = (
  calendar: OptimizedDay[],
  remainingPTO: number,
): Break[] => {
  const forcedBreaks: Break[] = [];
  const totalDays = calendar.length;
  let i = 0;
  while (i < totalDays && remainingPTO > 0) {
    if (!calendar[i].isPartOfBreak && !isFixedOff(calendar[i])) {
      const forcedSegment: OptimizedDay[] = [];
      while (i < totalDays && !calendar[i].isPartOfBreak && remainingPTO > 0) {
        if (!isFixedOff(calendar[i])) {
          calendar[i].isPTO = true;
          calendar[i].isPartOfBreak = true;
          forcedSegment.push(calendar[i]);
          remainingPTO--;
        }
        i++;
      }
      if (forcedSegment.length > 0) {
        forcedBreaks.push({
          startDate: forcedSegment[0].date,
          endDate: forcedSegment[forcedSegment.length - 1].date,
          days: forcedSegment,
          totalDays: forcedSegment.length,
          ptoDays: forcedSegment.length,
          publicHolidays: forcedSegment.filter(day => day.isPublicHoliday).length,
          weekends: forcedSegment.filter(day => day.isWeekend).length,
          companyDaysOff: forcedSegment.filter(day => day.isCompanyDayOff).length,
        });
      }
    } else {
      i++;
    }
  }
  return forcedBreaks;
};

/* -----------------------------
   Main Optimizer Function
----------------------------- */
export const optimizeDays = (params: OptimizationParams): OptimizationResult => {
  // 1. Get strategy parameters.
  const { minBreak, maxBreak } = getStrategyParams(params.strategy);
  const availablePTO = params.numberOfDays;
  const spacing = getDynamicSpacing(params.strategy);

  // 2. Build the calendar (from today to Dec 31 if in current year).
  const calendar = buildCalendar(params);

  // 3. Generate candidate segments.
  let candidateSegments: CandidateSegment[] = [];
  if (params.strategy === 'balanced') {
    // For balanced strategy, combine candidates from all ranges.
    candidateSegments.push(...generateCandidateSegments(calendar, 3, 4));    // longWeekends range
    candidateSegments.push(...generateCandidateSegments(calendar, 5, 6));    // miniBreaks range
    candidateSegments.push(...generateCandidateSegments(calendar, 7, 9));    // weekLongBreaks range
    candidateSegments.push(...generateCandidateSegments(calendar, 10, 15));  // extendedVacations range
  } else {
    candidateSegments = generateCandidateSegments(calendar, minBreak, maxBreak);
  }
  candidateSegments.sort((a, b) => a.startIdx - b.startIdx);

  // 4. Prune candidate segments.
  candidateSegments = pruneCandidateSegments(candidateSegments, availablePTO);

  // 5. Run the DP-based exhaustive search.
  const bestSolution = dpExhaustiveSearch(candidateSegments, availablePTO, spacing);

  // 6. Mark the chosen candidate segments and build break segments.
  const breaks: Break[] = [];
  for (const seg of bestSolution.segments) {
    for (let idx = seg.startIdx; idx <= seg.endIdx; idx++) {
      calendar[idx].isPartOfBreak = true;
      if (!isFixedOff(calendar[idx])) {
        calendar[idx].isPTO = true;
      }
    }
    breaks.push({
      startDate: seg.startDate,
      endDate: seg.endDate,
      days: seg.segmentDays.slice(),
      totalDays: seg.totalDays,
      ptoDays: seg.ptoUsed,
      publicHolidays: seg.segmentDays.filter(d => d.isPublicHoliday).length,
      weekends: seg.segmentDays.filter(d => d.isWeekend).length,
      companyDaysOff: seg.segmentDays.filter(d => d.isCompanyDayOff).length,
    });
  }

  // 7. Forced extension: repeatedly extend segments and add forced segments until all PTO days are used.
  let usedPTO = breaks.reduce((acc, br) => acc + br.ptoDays, 0);
  let remainingPTO = availablePTO - usedPTO;
  let prevRemainingPTO = remainingPTO + 1;
  while (remainingPTO > 0 && remainingPTO < prevRemainingPTO) {
    prevRemainingPTO = remainingPTO;
    remainingPTO = forceExtendSegments(calendar, breaks, remainingPTO);
    const forcedBreaks = addForcedSegments(calendar, remainingPTO);
    forcedBreaks.forEach(brk => breaks.push(brk));
    usedPTO = breaks.reduce((acc, br) => acc + br.ptoDays, 0);
    remainingPTO = availablePTO - usedPTO;
  }

  // 8. Compute final statistics.
  const stats: OptimizationStats = {
    totalPTODays: breaks.reduce((acc, br) => acc + br.ptoDays, 0),
    totalPublicHolidays: breaks.reduce((acc, br) => acc + br.publicHolidays, 0),
    totalNormalWeekends: breaks.reduce((acc, br) => acc + br.weekends, 0),
    totalCompanyDaysOff: breaks.reduce((acc, br) => acc + br.companyDaysOff, 0),
    totalDaysOff: breaks.reduce((acc, br) => acc + br.totalDays, 0),
    totalExtendedWeekends: breaks.reduce((acc, br) => acc + br.ptoDays, 0),
  };

  return {
    days: calendar,
    breaks,
    stats,
  };
};

/**
 * Wrap the synchronous optimizeDays function to make it asynchronous.
 */
export const optimizeDaysAsync = (params: OptimizationParams): Promise<OptimizationResult> => {
  return new Promise((resolve) => {
    // Using setTimeout to yield execution and allow a loading spinner to render.
    setTimeout(() => {
      const result = optimizeDays(params);
      resolve(result);
    }, 0);
  });
};