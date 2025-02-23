import {
  OptimizationParams,
  OptimizationResult,
  OptimizedDay,
  Break,
  OptimizationStats,
  OptimizationStrategy,
  CompanyDayOff,
} from '@/types';

/* -----------------------------
   Helper Functions
----------------------------- */

// Format a Date object to 'YYYY-MM-DD'
const formatDate = (date: Date): string => {
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const dy = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
};

// Parse a YYYY-MM-DD formatted string into a Date object.
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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
 * Dynamically determine the desired spacing (in days) between segments based on strategy.
 * These values are heuristics and can be adjusted.
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
  ctoUsed: number;
  efficiency: number; // totalDays / ctoUsed
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
      // For "balanced", we generate candidates across all ranges.
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
  // Build calendar from January 1st to December 31st of target year.
  const targetYear = params.year || new Date().getFullYear();
  const startOfYear = new Date(targetYear, 0, 1);
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

    calendar.push({
      date: dateStr,
      isWeekend,
      isPublicHoliday,
      publicHolidayName,
      isCompanyDayOff,
      companyDayName,
      isCTO: false,
      isPartOfBreak: false,
    });
  }
  return calendar;
};

/* -----------------------------
   Generate Candidate Segments
----------------------------- */

/**
 * Generate candidate segments given a calendar.
 * Only segments that require at least one CTO day (i.e. have at least one workday)
 * are returned.
 */
const generateCandidateSegments = (
  calendar: OptimizedDay[],
  minBreak: number,
  maxBreak: number
): CandidateSegment[] => {
  const candidates: CandidateSegment[] = [];
  const totalDays = calendar.length;
  for (let i = 0; i < totalDays; i++) {
    // Try all segment lengths from minBreak to maxBreak
    for (let L = minBreak; L <= maxBreak; L++) {
      if (i + L - 1 >= totalDays) break;
      const segmentDays: OptimizedDay[] = [];
      let ctoUsed = 0;
      for (let j = i; j < i + L; j++) {
        const day = calendar[j];
        // If the day is not naturally off, then a CTO day is required.
        if (!isFixedOff(day)) {
          ctoUsed++;
        }
        segmentDays.push(day);
      }
      if (ctoUsed > 0) {
        candidates.push({
          startIdx: i,
          endIdx: i + L - 1,
          totalDays: L,
          ctoUsed,
          efficiency: L / ctoUsed,
          startDate: calendar[i].date,
          endDate: calendar[i + L - 1].date,
          segmentDays: [...segmentDays],
        });
      }
    }
  }
  return candidates;
};

/* -----------------------------
   Candidate Pruning
----------------------------- */

/**
 * Prune candidate segments:
 * 1. Remove any candidate that requires more CTO days than are available.
 * 2. Group by startIdx and within each group remove segments dominated by others.
 */
const pruneCandidateSegments = (
  segments: CandidateSegment[],
  availableCTO: number
): CandidateSegment[] => {
  // Filter out candidates that require more CTO days than available.
  let filtered = segments.filter(seg => seg.ctoUsed <= availableCTO);
  const grouped = new Map<number, CandidateSegment[]>();
  for (const seg of filtered) {
    const arr = grouped.get(seg.startIdx) || [];
    arr.push(seg);
    grouped.set(seg.startIdx, arr);
  }
  const pruned: CandidateSegment[] = [];
  for (const group of grouped.values()) {
    const nonDominated: CandidateSegment[] = [];
    for (const seg of group) {
      let dominated = false;
      for (const other of group) {
        if (other === seg) continue;
        // If the other candidate has an equal or later end,
        // uses less or equal CTO days, and yields equal or more total days off,
        // then seg is dominated.
        if (
          other.endIdx >= seg.endIdx &&
          other.ctoUsed <= seg.ctoUsed &&
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

/* -----------------------------
   DP-Based Exhaustive Search (with Binary Search)
----------------------------- */

// The DP state returns this structure:
interface DPSolution {
  totalDaysOff: number;
  segments: CandidateSegment[];
  totalCTOUsed: number;
}

/**
 * A dynamic programming approach that uses memoization and binary search
 * to quickly jump to the next candidate that satisfies the dynamic spacing.
 */
const dpExhaustiveSearch = (
  candidates: CandidateSegment[],
  availableCTO: number,
  spacing: number
): DPSolution => {
  const memo = new Map<string, DPSolution>();

  // Binary search: returns the first index in candidates (starting at 'low')
  // where candidate.startIdx >= requiredStart.
  const binarySearch = (requiredStart: number, low: number): number => {
    let lo = low, hi = candidates.length;
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

  const dp = (idx: number, lastEnd: number, usedCTO: number): DPSolution => {
    if (idx >= candidates.length) {
      return { totalDaysOff: 0, segments: [], totalCTOUsed: 0 };
    }
    const key = `${idx}-${lastEnd}-${usedCTO}`;
    if (memo.has(key)) {
      return memo.get(key)!;
    }
    // Determine the minimal start that satisfies the spacing requirement.
    const requiredStart = lastEnd + spacing;
    // Jump to the first candidate index that can potentially be used.
    const nextIdx = binarySearch(requiredStart, idx);

    // Start with skipping all candidates (i.e. no further segments)
    let best: DPSolution = { totalDaysOff: 0, segments: [], totalCTOUsed: 0 };

    // Try taking candidates from nextIdx onward.
    for (let i = nextIdx; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate.startIdx < requiredStart) continue; // spacing condition
      if (usedCTO + candidate.ctoUsed > availableCTO) continue;
      const res = dp(i + 1, candidate.endIdx, usedCTO + candidate.ctoUsed);
      const total = candidate.totalDays + res.totalDaysOff;
      if (total > best.totalDaysOff) {
        best = {
          totalDaysOff: total,
          segments: [candidate, ...res.segments],
          totalCTOUsed: candidate.ctoUsed + res.totalCTOUsed,
        };
      }
    }
    memo.set(key, best);
    return best;
  };

  return dp(0, -1, 0);
};

/* -----------------------------
   Forced Extension & Additional Segments
----------------------------- */

/**
 * Extend an existing break segment with adjacent workdays (using CTO)
 * if they’re not naturally off. Returns the updated remaining CTO days.
 */
const forceExtendSegments = (
  calendar: OptimizedDay[],
  breaks: Break[],
  remainingCTO: number
): number => {
  const totalDays = calendar.length;
  for (const brk of breaks) {
    let endIdx = calendar.findIndex((day) => day.date === brk.endDate);
    while (remainingCTO > 0 && endIdx < totalDays - 1) {
      const nextDay = calendar[endIdx + 1];
      if (nextDay.isPartOfBreak) break;
      // Only extend if the next day is a workday.
      if (!isFixedOff(nextDay)) {
        nextDay.isCTO = true;
        nextDay.isPartOfBreak = true;
        brk.days.push(nextDay);
        brk.totalDays++;
        brk.ctoDays++;
        remainingCTO--;
        endIdx++;
        brk.endDate = nextDay.date;
      } else {
        break;
      }
    }
  }
  return remainingCTO;
};

/**
 * Scan the calendar for contiguous blocks of workdays that are not yet part of any break,
 * then form forced segments that use CTO days.
 */
const addForcedSegments = (
  calendar: OptimizedDay[],
  remainingCTO: number,
  existingBreaks: Break[]
): Break[] => {
  const forcedBreaks: Break[] = [];
  const totalDays = calendar.length;
  let i = 0;
  while (i < totalDays && remainingCTO > 0) {
    if (!calendar[i].isPartOfBreak && !isFixedOff(calendar[i])) {
      const forcedSegment: OptimizedDay[] = [];
      while (i < totalDays && !calendar[i].isPartOfBreak && remainingCTO > 0) {
        if (!isFixedOff(calendar[i])) {
          calendar[i].isCTO = true;
          calendar[i].isPartOfBreak = true;
          forcedSegment.push(calendar[i]);
          remainingCTO--;
        }
        i++;
      }
      if (forcedSegment.length > 0) {
        forcedBreaks.push({
          startDate: forcedSegment[0].date,
          endDate: forcedSegment[forcedSegment.length - 1].date,
          days: forcedSegment,
          totalDays: forcedSegment.length,
          ctoDays: forcedSegment.length,
          publicHolidays: forcedSegment.filter((day) => day.isPublicHoliday).length,
          weekends: forcedSegment.filter((day) => day.isWeekend).length,
          companyDaysOff: forcedSegment.filter((day) => day.isCompanyDayOff).length,
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
  // 1. Set strategy parameters.
  const { minBreak, maxBreak } = getStrategyParams(params.strategy);
  const availableCTO = params.numberOfDays;
  const spacing = getDynamicSpacing(params.strategy);

  // 2. Build the full calendar.
  const calendar = buildCalendar(params);

  // 3. Generate candidate segments.
  let candidateSegments: CandidateSegment[] = [];
  if (params.strategy === 'balanced') {
    // For "balanced", merge candidate segments from all ranges.
    candidateSegments.push(...generateCandidateSegments(calendar, 3, 4));    // longWeekends range
    candidateSegments.push(...generateCandidateSegments(calendar, 5, 6));    // miniBreaks range
    candidateSegments.push(...generateCandidateSegments(calendar, 7, 9));    // weekLongBreaks range
    candidateSegments.push(...generateCandidateSegments(calendar, 10, 15));  // extendedVacations range
  } else {
    candidateSegments = generateCandidateSegments(calendar, minBreak, maxBreak);
  }
  candidateSegments.sort((a, b) => a.startIdx - b.startIdx);

  // 4. Prune candidate segments to reduce the search space.
  candidateSegments = pruneCandidateSegments(candidateSegments, availableCTO);

  // 5. Run the dynamic-programming exhaustive search over candidate segments.
  const bestSolution = dpExhaustiveSearch(candidateSegments, availableCTO, spacing);

  // 6. Mark the chosen candidate segments on the calendar and create initial break segments.
  const breaks: Break[] = [];
  for (const seg of bestSolution.segments) {
    for (let idx = seg.startIdx; idx <= seg.endIdx; idx++) {
      calendar[idx].isPartOfBreak = true;
      if (!isFixedOff(calendar[idx])) {
        calendar[idx].isCTO = true;
      }
    }
    breaks.push({
      startDate: seg.startDate,
      endDate: seg.endDate,
      days: seg.segmentDays.slice(),
      totalDays: seg.totalDays,
      ctoDays: seg.ctoUsed,
      publicHolidays: seg.segmentDays.filter((d) => d.isPublicHoliday).length,
      weekends: seg.segmentDays.filter((d) => d.isWeekend).length,
      companyDaysOff: seg.segmentDays.filter((d) => d.isCompanyDayOff).length,
    });
  }

  // 7. Initial forced extension using remaining CTO days.
  let usedCTO = breaks.reduce((acc, br) => acc + br.ctoDays, 0);
  let remainingCTO = availableCTO - usedCTO;

  // Repeatedly loop: extend segments and add forced segments until all CTO days are used.
  let prevRemainingCTO = remainingCTO + 1;
  while (remainingCTO > 0 && remainingCTO < prevRemainingCTO) {
    prevRemainingCTO = remainingCTO;
    remainingCTO = forceExtendSegments(calendar, breaks, remainingCTO);
    const forcedBreaks = addForcedSegments(calendar, remainingCTO, breaks);
    forcedBreaks.forEach((brk) => breaks.push(brk));
    usedCTO = breaks.reduce((acc, br) => acc + br.ctoDays, 0);
    remainingCTO = availableCTO - usedCTO;
  }

  // 8. Aggregate final statistics.
  const stats: OptimizationStats = {
    totalCTODays: breaks.reduce((acc, br) => acc + br.ctoDays, 0),
    totalPublicHolidays: breaks.reduce((acc, br) => acc + br.publicHolidays, 0),
    totalNormalWeekends: breaks.reduce((acc, br) => acc + br.weekends, 0),
    totalCompanyDaysOff: breaks.reduce((acc, br) => acc + br.companyDaysOff, 0),
    totalDaysOff: breaks.reduce((acc, br) => acc + br.totalDays, 0),
    totalExtendedWeekends: breaks.reduce((acc, br) => acc + br.ctoDays, 0),
  };

  return {
    days: calendar,
    breaks,
    stats,
  };
};