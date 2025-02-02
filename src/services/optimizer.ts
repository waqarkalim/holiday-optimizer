import { addDays, isWeekend, format, parse, getDay } from 'date-fns'
import { pipe } from '@/utils/fp'

/**
 * Represents a single day in the optimization calendar.
 * This is used to track the status of each day throughout the year.
 */
export interface OptimizedDay {
  date: string                // Date in 'yyyy-MM-dd' format
  isWeekend: boolean         // Whether this day falls on a weekend
  isCTO: boolean            // Whether this day is selected as a CTO day
  isPartOfBreak: boolean    // Whether this day is part of a longer break period
  isHoliday?: boolean       // Whether this day is a public holiday
  holidayName?: string      // Name of the holiday if applicable
}

/**
 * Represents an alternative day suggestion when the original date
 * might not be optimal for taking time off.
 */
export interface AlternativeDay {
  originalDate: string      // The initially requested date
  alternativeDate: string   // The suggested alternative date
  reason: string           // Explanation for why this alternative is better
}

/**
 * Defines preferences for how breaks should be structured.
 * Used to customize the optimization strategy.
 */
export interface BreakPreference {
  minDays: number          // Minimum number of days for this type of break
  maxDays: number          // Maximum number of days for this type of break
  weight: number           // Priority weight for this break type in optimization
  name: string            // Descriptive name for this break type
}

/**
 * Represents a custom day off provided by the company or organization.
 */
export interface CustomDayOff {
  date: string           // Date in 'yyyy-MM-dd' format
  name: string          // Description or name of the custom day off
  isRecurring?: boolean // Whether this applies to all matching weekdays in a date range
  startDate?: string    // If recurring, the start date of the range
  endDate?: string      // If recurring, the end date of the range
  weekday?: number      // If recurring, the day of week (0-6, where 0 is Sunday)
}

/**
 * Creates an OptimizedDay object for a given date.
 * 
 * @param date - Date to create the day object for
 * @param holidays - List of holidays for the year
 * @param customDaysOff - Array of custom days off for the year
 * @returns OptimizedDay object with initial properties
 */
const createDay = (
  date: Date, 
  holidays: Array<{ date: string; name: string }>,
  customDaysOff: Array<{ date: string; name: string }> = []
): OptimizedDay => {
  const dateStr = format(date, 'yyyy-MM-dd')
  const { isHoliday: isHolidayDay, name: holidayName } = isHoliday(date, holidays)
  const customDay = customDaysOff.find(d => d.date === dateStr)

  return {
    date: dateStr,
    isWeekend: isWeekend(date),
    isCTO: false,
    isPartOfBreak: isHolidayDay || !!customDay,
    isHoliday: isHolidayDay || !!customDay,
    holidayName: customDay?.name || holidayName
  }
}

/**
 * Generates a calendar for the specified year, including the last month of the
 * previous year to handle breaks that span across years.
 * 
 * @param year - Target year
 * @param customDaysOff - Array of custom days off for the year
 * @returns Array of calendar days with their initial properties
 */
const generateCalendarDays = (year: number, customDaysOff: CustomDayOff[] = []): OptimizedDay[] => {
  const startDate = new Date(year - 1, 11, 1) // Start from December of previous year
  const daysToGenerate = 365 + 31 // Full year plus December of previous year
  const holidays = getHolidaysForYear(year)
  const generatedCustomDays = generateCustomDaysOff(customDaysOff, year)

  // Generate array of sequential dates
  const dates = Array.from(
    { length: daysToGenerate },
    (_, i) => addDays(startDate, i)
  )

  // Convert each date to an OptimizedDay
  return dates.map(date => createDay(date, holidays, generatedCustomDays))
}

/**
 * Returns a list of public holidays for a given year.
 * Currently configured for Canadian holidays.
 * 
 * @param year - Year to get holidays for
 * @returns Array of holiday objects with dates and names
 */
const getHolidaysForYear = (year: number): Array<{ date: string; name: string }> => [
  { date: `${year}-01-01`, name: "New Year's Day" },
  { date: `${year}-02-17`, name: 'Family Day' },
  { date: `${year}-04-18`, name: 'Good Friday' },
  { date: `${year}-05-19`, name: 'Victoria Day' },
  { date: `${year}-07-01`, name: 'Canada Day' },
  { date: `${year}-09-01`, name: 'Labour Day' },
  { date: `${year}-10-13`, name: 'Thanksgiving Day' },
  { date: `${year}-11-11`, name: 'Remembrance Day' },
  { date: `${year}-12-25`, name: 'Christmas Day' },
  { date: `${year}-12-26`, name: 'Boxing Day' },
]

/**
 * Checks if a given date is a holiday.
 * 
 * @param date - Date to check
 * @param holidays - List of holidays to check against
 * @returns Object indicating if the date is a holiday and its name if applicable
 */
const isHoliday = (
  date: Date,
  holidays: Array<{ date: string; name: string }>
): { isHoliday: boolean; name?: string } => {
  const formattedDate = format(date, 'yyyy-MM-dd')
  const holiday = holidays.find(h => h.date === formattedDate)
  return holiday ? { isHoliday: true, name: holiday.name } : { isHoliday: false }
}

/**
 * Available optimization strategies for distributing CTO days.
 * Each strategy aims to achieve a different vacation pattern.
 */
export type OptimizationStrategy = 'balanced' | 'longWeekends' | 'weekLongBreaks' | 'extendedVacations'

/**
 * Configuration for each optimization strategy.
 */
export interface StrategyOption {
  id: OptimizationStrategy
  label: string
  description: string
}

export const OPTIMIZATION_STRATEGIES: StrategyOption[] = [
  {
    id: 'balanced',
    label: 'Balanced Mix',
    description: 'A balanced mix of long weekends and longer breaks',
  },
  {
    id: 'longWeekends',
    label: 'Long Weekends',
    description: 'Maximize the number of 3-4 day weekends',
  },
  {
    id: 'weekLongBreaks',
    label: 'Week-long Breaks',
    description: 'Focus on creating 5-7 day breaks',
  },
  {
    id: 'extendedVacations',
    label: 'Extended Vacations',
    description: 'Combine days for longer vacations (8+ days)',
  }
]

/**
 * Represents a continuous period of time off, including weekends and holidays.
 * Used to analyze potential break periods during optimization.
 */
interface Break {
  startDate: string        // Start date of the break
  endDate: string         // End date of the break
  length: number          // Total number of days in the break
  ctoDaysNeeded: number   // Number of work days that need to be taken as CTO
  holidaysIncluded: number // Number of public holidays within the break
  weekendsIncluded: number // Number of weekend days within the break
}

/**
 * Analyzes the calendar to find all possible break combinations.
 * This is the core function that identifies potential vacation periods.
 * 
 * @param days - Array of all days in the year with their current status
 * @param year - The year being optimized
 * @returns Array of all possible break combinations
 */
const findAllPossibleBreaks = (days: OptimizedDay[], year: number): Break[] => {
  const MAX_BREAK_LENGTH = 21 // Maximum length to look ahead

  // Step 1: Generate all possible sequences
  const sequences = generateSequences(days.length, MAX_BREAK_LENGTH)

  // Step 2: Analyze each sequence
  const possibleBreaks = sequences
    .map(({ startIndex, length }) => analyzeBreakSequence(days, startIndex, length, year))
    .filter((break_): break_ is Break => break_ !== null)

  return possibleBreaks
}

/**
 * Generates all possible sequences of days with given length.
 * 
 * @param totalDays - Total number of days
 * @param maxLength - Maximum sequence length to consider
 * @returns Array of indices and lengths to analyze
 */
const generateSequences = (totalDays: number, maxLength: number): Array<{ startIndex: number; length: number }> =>
  Array.from({ length: totalDays }, (_, startIndex) =>
    Array.from({ length: maxLength }, (_, offset) => ({
      startIndex,
      length: offset + 1
    }))
  ).flat()

/**
 * Analyzes a sequence of days to determine if they form a valid break.
 * 
 * @param days - Array of all days
 * @param startIndex - Starting index of the sequence
 * @param length - Length of the sequence to analyze
 * @param year - Target year
 * @returns Break object if valid, null if invalid
 */
const analyzeBreakSequence = (
  days: OptimizedDay[],
  startIndex: number,
  length: number,
  year: number
): Break | null => {
  const endIndex = startIndex + length
  if (endIndex > days.length) return null

  const sequence = days.slice(startIndex, endIndex)
  const isInYear = (day: OptimizedDay) => day.date.startsWith(year.toString())
  
  // Check if any day is not in target year
  if (!sequence.every(isInYear)) return null

  const counts = sequence.reduce(
    (acc, day) => ({
      ctoDaysNeeded: acc.ctoDaysNeeded + (!day.isWeekend && !day.isHoliday ? 1 : 0),
      holidaysIncluded: acc.holidaysIncluded + (day.isHoliday ? 1 : 0),
      weekendsIncluded: acc.weekendsIncluded + (day.isWeekend ? 1 : 0)
    }),
    { ctoDaysNeeded: 0, holidaysIncluded: 0, weekendsIncluded: 0 }
  )

  // Only include sequences that would use CTO days
  return counts.ctoDaysNeeded > 0 ? {
    startDate: sequence[0].date,
    endDate: sequence[sequence.length - 1].date,
    length,
    ...counts
  } : null
}

/**
 * Gets all dates between two dates, inclusive.
 * 
 * @param startDate - Start date in yyyy-MM-dd format
 * @param endDate - End date in yyyy-MM-dd format
 * @returns Array of dates in yyyy-MM-dd format
 */
const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const start = parse(startDate, 'yyyy-MM-dd', new Date())
  const end = parse(endDate, 'yyyy-MM-dd', new Date())
  const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

  return Array.from(
    { length: dayCount },
    (_, i) => format(addDays(start, i), 'yyyy-MM-dd')
  )
}

/**
 * Allocates any remaining CTO days to workdays, prioritizing days near existing breaks or holidays.
 * 
 * @param days - Array of all days in the year
 * @param remainingDays - Number of CTO days left to allocate
 * @param year - The year being optimized
 * @param usedDates - Set of dates that are already used
 * @returns Updated calendar with all CTO days allocated
 */
const allocateRemainingDays = (
  days: OptimizedDay[],
  remainingDays: number,
  year: number,
  usedDates: Set<string>
): OptimizedDay[] => {
  if (remainingDays <= 0) return days

  const isInYear = (date: string) => date.startsWith(year.toString())
  const isWorkday = (day: OptimizedDay) => !day.isWeekend && !day.isHoliday
  
  // Find all available workdays and score them
  const scoredWorkdays = days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => 
      isInYear(day.date) &&
      isWorkday(day) &&
      !day.isCTO &&
      !usedDates.has(day.date)
    )
    .map(({ day, index }) => ({
      day,
      index,
      score: calculateDayScore(days, index)
    }))
    .sort((a, b) => b.score - a.score)

  // Allocate remaining days to the highest scored workdays
  return scoredWorkdays
    .slice(0, remainingDays)
    .reduce(
      (result, { index }) => {
        result[index].isCTO = true
        return result
      },
      [...days]
    )
}

/**
 * Calculates a score for a workday based on its proximity to breaks, holidays, and weekends.
 * Higher scores indicate more desirable days for CTO.
 * 
 * @param days - Array of all days in the year
 * @param index - Index of the day to score
 * @returns Score for the day (higher is better)
 */
const calculateDayScore = (days: OptimizedDay[], index: number): number => {
  let score = 0
  const range = 3 // Days to look before and after

  // Check proximity to existing breaks
  for (let i = Math.max(0, index - range); i <= Math.min(days.length - 1, index + range); i++) {
    if (i === index) continue
    const distance = Math.abs(i - index)
    if (days[i].isPartOfBreak) score += (range - distance + 1) * 2
    if (days[i].isHoliday) score += (range - distance + 1) * 3
    if (days[i].isCTO) score += (range - distance + 1) * 2
    if (days[i].isWeekend) score += (range - distance + 1)
  }

  // Prefer Mondays and Fridays
  const dayOfWeek = getDay(parse(days[index].date, 'yyyy-MM-dd', new Date()))
  if (dayOfWeek === 1 || dayOfWeek === 5) score += 5

  return score
}

/**
 * Optimizes the calendar for long weekends.
 * 
 * @param days - Array of all days in the year
 * @param numberOfDays - Number of CTO days available
 * @param year - The year being optimized
 * @returns Optimized calendar with CTO days allocated
 */
const optimizeLongWeekends = (days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] => {
  const isInYear = (date: string) => date.startsWith(year.toString())
  const isWorkday = (day: OptimizedDay) => !day.isWeekend && !day.isHoliday
  const isMonOrFri = (date: string) => {
    const dayOfWeek = getDay(parse(date, 'yyyy-MM-dd', new Date()))
    return dayOfWeek === 1 || dayOfWeek === 5
  }

  // Find and sort potential breaks
  const potentialBreaks = findAllPossibleBreaks(days, year)
    .filter(b => 
      b.length >= 3 && b.length <= 4 &&
      b.ctoDaysNeeded >= 1 && b.ctoDaysNeeded <= 2 &&
      b.ctoDaysNeeded <= numberOfDays
    )
    .sort((a, b) => {
      const aHasHoliday = a.holidaysIncluded > 0 ? 1 : 0
      const bHasHoliday = b.holidaysIncluded > 0 ? 1 : 0
      return bHasHoliday - aHasHoliday ||
        parse(a.startDate, 'yyyy-MM-dd', new Date()).getTime() -
        parse(b.startDate, 'yyyy-MM-dd', new Date()).getTime()
    })

  // Apply breaks in order using reduce
  const { result, remainingDays, usedDates } = potentialBreaks.reduce(
    ({ result, remainingDays, usedDates }, breakPeriod) => {
      if (remainingDays <= 0) return { result, remainingDays, usedDates }

      const breakDates = getDatesInRange(breakPeriod.startDate, breakPeriod.endDate)
      const hasConflict = breakDates.some((date: string) => usedDates.has(date))
      
      if (!hasConflict && breakPeriod.ctoDaysNeeded <= remainingDays) {
        const newResult = result.map(day => 
          breakDates.includes(day.date) && isWorkday(day)
            ? { ...day, isCTO: true }
            : day
        )
        return {
          result: newResult,
          remainingDays: remainingDays - breakPeriod.ctoDaysNeeded,
          usedDates: new Set([...usedDates, ...breakDates])
        }
      }
      return { result, remainingDays, usedDates }
    },
    { result: [...days], remainingDays: numberOfDays, usedDates: new Set<string>() }
  )

  // Use remaining days on Mondays/Fridays
  if (remainingDays > 0) {
    const monFriWorkdays = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => 
        isInYear(day.date) &&
        isWorkday(day) &&
        !usedDates.has(day.date) &&
        isMonOrFri(day.date)
      )
      .sort((a, b) => 
        (isNearHoliday(days, b.index) ? 1 : 0) -
        (isNearHoliday(days, a.index) ? 1 : 0)
    )

    const monFriResult = monFriWorkdays.reduce(
      ({ days, remaining }: { days: OptimizedDay[]; remaining: number }, { index }) =>
        remaining > 0
          ? {
              days: days.map((day, i) => 
                i === index ? { ...day, isCTO: true } : day
              ),
              remaining: remaining - 1
            }
          : { days, remaining },
      { days: result, remaining: remainingDays }
    )

    // If we still have days left, allocate them optimally
    if (monFriResult.remaining > 0) {
      return allocateRemainingDays(
        monFriResult.days,
        monFriResult.remaining,
        year,
        usedDates
      )
    }

    return monFriResult.days
  }

  return result
}

/**
 * Optimizes the calendar for week-long breaks (5-9 days).
 * Prioritizes creating breaks that span a full work week plus weekends.
 * 
 * @param days - Array of all days in the year
 * @param numberOfDays - Number of CTO days available
 * @param year - The year being optimized
 * @returns Optimized calendar with CTO days allocated
 */
const optimizeWeekLongBreaks = (days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] => {
  const isInYear = (date: string) => date.startsWith(year.toString())
  const isWorkday = (day: OptimizedDay) => !day.isWeekend && !day.isHoliday

  // Find potential week-long breaks
  const weekBreaks = findAllPossibleBreaks(days, year)
    .filter(b => b.length >= 5 && b.length <= 9 && b.ctoDaysNeeded >= 2 && b.ctoDaysNeeded <= 7)
    .sort((a, b) => {
      // Sort by efficiency (total days / CTO days needed)
      const aEfficiency = a.length / a.ctoDaysNeeded
      const bEfficiency = b.length / b.ctoDaysNeeded
      if (aEfficiency !== bEfficiency) return bEfficiency - aEfficiency
      // Break ties by preferring breaks with holidays
      if (a.holidaysIncluded !== b.holidaysIncluded) return b.holidaysIncluded - a.holidaysIncluded
      // Finally, prefer earlier dates
      return parse(a.startDate, 'yyyy-MM-dd', new Date()).getTime() -
             parse(b.startDate, 'yyyy-MM-dd', new Date()).getTime()
    })

  // Apply breaks in order using reduce
  const { result, remainingDays, usedDates } = weekBreaks.reduce(
    ({ result, remainingDays, usedDates }, breakPeriod) => {
      if (remainingDays <= 0) return { result, remainingDays, usedDates }

      const breakDates = getDatesInRange(breakPeriod.startDate, breakPeriod.endDate)
      const hasConflict = breakDates.some((date: string) => usedDates.has(date))
      
      if (!hasConflict && breakPeriod.ctoDaysNeeded <= remainingDays) {
        const newResult = result.map(day => 
          breakDates.includes(day.date) && isWorkday(day)
            ? { ...day, isCTO: true }
            : day
        )
        return {
          result: newResult,
          remainingDays: remainingDays - breakPeriod.ctoDaysNeeded,
          usedDates: new Set([...usedDates, ...breakDates])
        }
      }
      return { result, remainingDays, usedDates }
    },
    { result: [...days], remainingDays: numberOfDays, usedDates: new Set<string>() }
  )

  // Use remaining days for long weekends if possible
  if (remainingDays >= 1) {
    const longWeekendResult = optimizeLongWeekends(result, remainingDays, year)
    return longWeekendResult
  }

  // If we still have days left, allocate them optimally
  if (remainingDays > 0) {
    return allocateRemainingDays(result, remainingDays, year, usedDates)
  }

  return result
}

/**
 * Optimizes the calendar for extended vacations (10-15 days).
 * Prioritizes creating longer breaks that maximize the use of weekends and holidays.
 * Any remaining days are used for week-long breaks or long weekends.
 * 
 * @param days - Array of all days in the year
 * @param numberOfDays - Number of CTO days available
 * @param year - The year being optimized
 * @returns Optimized calendar with CTO days allocated
 */
const optimizeExtendedVacations = (days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] => {
  const isInYear = (date: string) => date.startsWith(year.toString())
  const isWorkday = (day: OptimizedDay) => !day.isWeekend && !day.isHoliday

  // Find potential extended breaks
  const extendedBreaks = findAllPossibleBreaks(days, year)
    .filter(b => 
      b.length >= 10 && b.length <= 15 &&
      b.ctoDaysNeeded >= 6 && b.ctoDaysNeeded <= 10 &&
      b.ctoDaysNeeded <= numberOfDays
    )
    .sort((a, b) => {
      // Sort by total length first
      if (a.length !== b.length) return b.length - a.length
      // Then by efficiency (total days / CTO days)
      const aEfficiency = a.length / a.ctoDaysNeeded
      const bEfficiency = b.length / b.ctoDaysNeeded
      return bEfficiency - aEfficiency || b.holidaysIncluded - a.holidaysIncluded
    })

  // Apply breaks in order using reduce
  const { result, remainingDays, usedDates } = extendedBreaks.reduce(
    ({ result, remainingDays, usedDates }, breakPeriod) => {
      if (remainingDays <= 0) return { result, remainingDays, usedDates }

      const breakDates = getDatesInRange(breakPeriod.startDate, breakPeriod.endDate)
      const hasConflict = breakDates.some((date: string) => usedDates.has(date))
      
      if (!hasConflict && breakPeriod.ctoDaysNeeded <= remainingDays) {
        const newResult = result.map(day => 
          breakDates.includes(day.date) && isWorkday(day)
            ? { ...day, isCTO: true }
            : day
        )
        return {
          result: newResult,
          remainingDays: remainingDays - breakPeriod.ctoDaysNeeded,
          usedDates: new Set([...usedDates, ...breakDates])
        }
      }
      return { result, remainingDays, usedDates }
    },
    { result: [...days], remainingDays: numberOfDays, usedDates: new Set<string>() }
  )

  // Use remaining days optimally based on how many are left
  if (remainingDays >= 2) {
    const weekBreakResult = optimizeWeekLongBreaks(result, remainingDays, year)
    return weekBreakResult.map((day, i) => 
      day.isCTO && !usedDates.has(day.date) ? day : result[i]
    )
  } else if (remainingDays > 0) {
    const longWeekendResult = optimizeLongWeekends(result, remainingDays, year)
    return longWeekendResult.map((day, i) => 
      day.isCTO && !usedDates.has(day.date) ? day : result[i]
    )
  }

  // If we still have days left, allocate them optimally
  if (remainingDays > 0) {
    return allocateRemainingDays(result, remainingDays, year, usedDates)
  }

  return result
}

/**
 * Marks days that are part of a continuous break period.
 * 
 * @param days - Array of all days
 * @returns Updated array with break periods marked
 */
const markBreaks = (days: OptimizedDay[]): OptimizedDay[] => {
  // First pass: Reset all break markers and find CTO days
  const ctoDayIndices = days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => day.isCTO)
    .map(({ index }) => index)

  // Helper to check if a day is a non-workday
  const isNonWorkday = (day: OptimizedDay) => day.isHoliday || day.isWeekend || day.isCTO

  // Helper to get continuous range of non-workdays
  const getContinuousRange = (
    startIdx: number,
    direction: -1 | 1,
    days: OptimizedDay[]
  ): number[] => {
    const indices: number[] = []
    let currentIdx = startIdx + direction

    while (
      currentIdx >= 0 &&
      currentIdx < days.length &&
      isNonWorkday(days[currentIdx])
    ) {
      indices.push(currentIdx)
      currentIdx += direction
    }

    return indices
  }

  // Initialize result with reset break markers
  const result = days.map(day => ({ ...day, isPartOfBreak: false }))

  // Mark breaks around CTO days
  ctoDayIndices.forEach(ctoIndex => {
    result[ctoIndex].isPartOfBreak = true

    // Get continuous ranges in both directions
    const backwardDays = getContinuousRange(ctoIndex, -1, result)
    const forwardDays = getContinuousRange(ctoIndex, 1, result)

    // Mark the ranges
    backwardDays.forEach(idx => { result[idx].isPartOfBreak = true })
    forwardDays.forEach(idx => { result[idx].isPartOfBreak = true })
  })

  // Second pass: Mark holidays that extend weekends
  days.forEach((day, i) => {
    if (!day.isHoliday) return

    const surroundingDays = {
      prev: result[i - 1],
      next: result[i + 1]
    }

    const isConnectedToBreak = 
      (surroundingDays.prev && (surroundingDays.prev.isWeekend || surroundingDays.prev.isCTO || 
        (surroundingDays.prev.isHoliday && surroundingDays.prev.isPartOfBreak))) ||
      (surroundingDays.next && (surroundingDays.next.isWeekend || surroundingDays.next.isCTO || 
        (surroundingDays.next.isHoliday && surroundingDays.next.isPartOfBreak)))

    if (isConnectedToBreak) {
      result[i].isPartOfBreak = true

      // Mark connected weekends
      if (surroundingDays.prev?.isWeekend) {
        surroundingDays.prev.isPartOfBreak = true
        if (i >= 2) result[i - 2].isPartOfBreak = true
      }
      if (surroundingDays.next?.isWeekend) {
        surroundingDays.next.isPartOfBreak = true
        if (i + 2 < result.length) result[i + 2].isPartOfBreak = true
      }
    }
  })

  // Third pass: Connect gaps between breaks
  return result.map((day, i, arr) => {
    if (i === 0 || i === arr.length - 1 || day.isPartOfBreak) return day

    const surroundingBreaks = {
      prev: arr[i - 1].isPartOfBreak,
      next: arr[i + 1].isPartOfBreak
    }

    if (!surroundingBreaks.prev || !surroundingBreaks.next) return day

    // Look for CTO days in both directions
    const findCtoInRange = (startIdx: number, endIdx: number): boolean => {
      const indices = Array.from(
        { length: Math.abs(endIdx - startIdx) },
        (_, idx) => startIdx + (endIdx > startIdx ? idx : -idx)
      )
      return indices.some(idx => arr[idx].isCTO && arr[idx].isPartOfBreak)
    }

    const hasCtoDay = 
      findCtoInRange(i - 1, 0) || 
      findCtoInRange(i + 1, arr.length - 1)

    return hasCtoDay ? { ...day, isPartOfBreak: true } : day
  })
}

/**
 * Marks weekends that are part of extended breaks.
 * 
 * @param days - Array of all days
 * @returns Updated array with extended weekends marked
 */
const markExtendedWeekends = (days: OptimizedDay[]): OptimizedDay[] => {
  const result = [...days]

  // Helper to get weekend info
  const getWeekendInfo = (day: OptimizedDay, index: number) => ({
    date: parse(day.date, 'yyyy-MM-dd', new Date()),
    prev: result[index - 1],
    next: result[index + 1]
  })

  // First pass: mark weekends that are part of breaks
  days.forEach((day, index) => {
    if (!day.isWeekend || !day.isPartOfBreak) return

    const { date, prev, next } = getWeekendInfo(day, index)
    
    if (date.getDay() === 6 && next) {
      next.isPartOfBreak = true
    }
    if (date.getDay() === 0 && prev) {
      prev.isPartOfBreak = true
    }
  })

  // Second pass: mark weekends extended by holidays
  days.forEach((day, index) => {
    if (!day.isWeekend) return

    const { date, prev, next } = getWeekendInfo(day, index)
    const isExtendedByHoliday = prev?.isHoliday || next?.isHoliday

    if (isExtendedByHoliday) {
      day.isPartOfBreak = true
      
      if (date.getDay() === 6 && next) {
        next.isPartOfBreak = true
      }
      if (date.getDay() === 0 && prev) {
        prev.isPartOfBreak = true
      }
    }
  })

  return result
}

/**
 * Optimizes the calendar using a balanced approach that distributes CTO days
 * across different types of breaks: long weekends (40%), week-long breaks (40%),
 * and extended breaks (20%).
 * 
 * @param days - Array of all days in the year
 * @param numberOfDays - Number of CTO days available
 * @param year - The year being optimized
 * @param customDaysOff - Array of custom days off for the year
 * @returns Optimized calendar with CTO days allocated
 */
const optimizeBalanced = (days: OptimizedDay[], numberOfDays: number, year: number, customDaysOff: CustomDayOff[] = []): OptimizedDay[] => {
  // Calculate days for each strategy
  const distribution = {
    longWeekends: Math.floor(numberOfDays * 0.4),
    weekBreaks: Math.floor(numberOfDays * 0.4),
    extended: numberOfDays - 2 * Math.floor(numberOfDays * 0.4)
  }

  // Apply each strategy independently
  const strategies = [
    { fn: optimizeLongWeekends, days: distribution.longWeekends },
    { fn: optimizeWeekLongBreaks, days: distribution.weekBreaks },
    { fn: optimizeExtendedVacations, days: distribution.extended }
  ]

  // Apply strategies in sequence using reduce
  const finalResult = strategies.reduce(
    ({ result, usedDates, remainingDays }, { fn, days }) => {
      if (days <= 0) return { result, usedDates, remainingDays }

      const strategyResult = fn(result, days, year)
      const newResult = result.map((day, i) => 
        strategyResult[i].isCTO && !usedDates.has(day.date)
          ? strategyResult[i]
          : day
      )

      const newUsedDates = new Set([
        ...usedDates,
        ...newResult
          .filter(day => day.isCTO)
          .map(day => day.date)
      ])

      const usedDaysCount = newResult.filter(day => day.isCTO).length
      const newRemainingDays = numberOfDays - usedDaysCount

      return {
        result: newResult,
        usedDates: newUsedDates,
        remainingDays: newRemainingDays
      }
    },
    { result: [...days], usedDates: new Set<string>(), remainingDays: numberOfDays }
  )

  // If we still have days left, allocate them optimally
  if (finalResult.remainingDays > 0) {
    return allocateRemainingDays(
      finalResult.result,
      finalResult.remainingDays,
      year,
      finalResult.usedDates
    )
  }

  return finalResult.result
}

/**
 * Checks if a day is near a holiday within the specified range.
 * 
 * @param days - Array of all days in the year
 * @param index - Index of the day to check
 * @param range - Number of days to check before and after (default: 2)
 * @returns True if there is a holiday within the range
 */
const isNearHoliday = (days: OptimizedDay[], index: number, range: number = 2): boolean =>
  days
    .slice(Math.max(0, index - range), Math.min(days.length, index + range + 1))
    .some(day => day.isHoliday)

/**
 * Forcefully allocates any remaining CTO days to available workdays.
 * This is a last resort function that will allocate days even if they don't create optimal breaks.
 * 
 * @param days - Array of all days in the year
 * @param remainingDays - Number of CTO days left to allocate
 * @param year - The year being optimized
 * @param usedDates - Set of dates that are already used
 * @returns Updated calendar with ALL CTO days allocated
 */
const forceAllocateRemainingDays = (
  days: OptimizedDay[],
  remainingDays: number,
  year: number,
  usedDates: Set<string>
): OptimizedDay[] => {
  if (remainingDays <= 0) return days

  const isInYear = (date: string) => date.startsWith(year.toString())
  const isWorkday = (day: OptimizedDay) => !day.isWeekend && !day.isHoliday
  
  // Get ALL available workdays
  const availableWorkdays = days
    .map((day, index) => ({ day, index }))
    .filter(({ day }) => 
      isInYear(day.date) &&
      isWorkday(day) &&
      !day.isCTO &&
      !usedDates.has(day.date)
    )
    // Sort by preference but will use any days if needed
    .sort((a, b) => {
      const aScore = calculateDayScore(days, a.index)
      const bScore = calculateDayScore(days, b.index)
      return bScore - aScore
    })

  // Take exactly the number of days we need
  const daysToAllocate = availableWorkdays.slice(0, remainingDays)
  
  // Allocate the days
  return daysToAllocate.reduce(
    (result, { index }) => {
      result[index].isCTO = true
      return result
    },
    [...days]
  )
}

/**
 * Generates custom days off for a given year based on recurring patterns.
 * 
 * @param customDaysOff - Array of custom days off configurations
 * @param year - Target year
 * @returns Array of dates in yyyy-MM-dd format
 */
const generateCustomDaysOff = (customDaysOff: CustomDayOff[], year: number): Array<{ date: string; name: string }> => {
  const result: Array<{ date: string; name: string }> = []

  customDaysOff.forEach(customDay => {
    if (!customDay.isRecurring) {
      // For non-recurring days, just add if they're in the target year
      if (customDay.date.startsWith(year.toString())) {
        result.push({ date: customDay.date, name: customDay.name })
      }
      return
    }

    // For recurring days, generate all matching dates within the range
    if (customDay.startDate && customDay.endDate && customDay.weekday !== undefined) {
      const start = parse(customDay.startDate, 'yyyy-MM-dd', new Date())
      const end = parse(customDay.endDate, 'yyyy-MM-dd', new Date())
      let current = start

      while (current <= end) {
        if (current.getFullYear() === year && getDay(current) === customDay.weekday) {
          result.push({
            date: format(current, 'yyyy-MM-dd'),
            name: customDay.name
          })
        }
        current = addDays(current, 1)
      }
    }
  })

  return result
}

/**
 * Main optimization function that generates and optimizes a calendar based on
 * the specified strategy and number of CTO days.
 * 
 * @param numberOfDays - Number of CTO days to allocate
 * @param strategy - Optimization strategy to use
 * @param year - Target year (defaults to current year)
 * @param customDaysOff - Array of custom days off for the year
 * @returns Object containing the optimized calendar days
 * @throws Error if numberOfDays is invalid or if there aren't enough workdays
 */
export const optimizeCtoDays = (
  numberOfDays: number,
  strategy: OptimizationStrategy,
  year: number = new Date().getFullYear(),
  customDaysOff: CustomDayOff[] = []
): { days: OptimizedDay[] } => {
  // Input validation
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Helper functions
  const isInYear = (day: OptimizedDay) => day.date.startsWith(year.toString())
  const isWorkday = (day: OptimizedDay) => !day.isWeekend && !day.isHoliday
  const countUsedDays = (days: OptimizedDay[]) => days.filter(day => day.isCTO).length
  const getUsedDates = (days: OptimizedDay[]) => 
    new Set(days.filter(day => day.isCTO).map(day => day.date))

  // Strategy map
  const strategyMap: Record<OptimizationStrategy, (d: OptimizedDay[], n: number, y: number) => OptimizedDay[]> = {
    longWeekends: optimizeLongWeekends,
    weekLongBreaks: optimizeWeekLongBreaks,
    extendedVacations: optimizeExtendedVacations,
    balanced: optimizeBalanced
  }

  // Initial calendar generation and validation
  const initialCalendar = generateCalendarDays(year, customDaysOff)
  const yearDays = initialCalendar.filter(isInYear)
  const availableWorkdays = yearDays.filter(isWorkday).length

  if (availableWorkdays < numberOfDays) {
    throw new Error(
      `Not enough workdays available in ${year}. Requested ${numberOfDays} days but only ${availableWorkdays} workdays available.`
    )
  }

  // Optimization pipeline
  const optimizationSteps = [
    // Step 1: Apply strategy-specific optimization
    (days: OptimizedDay[]) => strategyMap[strategy](days, numberOfDays, year),

    // Step 2: Try optimal allocation of remaining days
    (days: OptimizedDay[]) => {
      const yearDays = days.filter(isInYear)
      const remainingDays = numberOfDays - countUsedDays(yearDays)
      
      return remainingDays > 0
        ? allocateRemainingDays(days, remainingDays, year, getUsedDates(yearDays))
        : days
    },

    // Step 3: Force allocate any still remaining days
    (days: OptimizedDay[]) => {
      const yearDays = days.filter(isInYear)
      const remainingDays = numberOfDays - countUsedDays(yearDays)
      
      return remainingDays > 0
        ? forceAllocateRemainingDays(days, remainingDays, year, getUsedDates(yearDays))
        : days
    },

    // Step 4: Mark breaks and extended weekends
    markBreaks,
    markExtendedWeekends,

    // Step 5: Filter to target year
    (days: OptimizedDay[]) => days.filter(isInYear)
  ]

  // Apply optimization pipeline
  const optimizedDays = pipe(...optimizationSteps)(initialCalendar)

  // Final validation
  const usedDays = countUsedDays(optimizedDays)
  if (usedDays !== numberOfDays) {
    throw new Error(
      `Critical optimization error: Failed to allocate exact number of CTO days. ` +
      `Requested ${numberOfDays} days but used ${usedDays} days. ` +
      `Please report this as a bug.`
    )
  }

  return { days: optimizedDays }
} 