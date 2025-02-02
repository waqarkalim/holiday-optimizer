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
 * Returns a list of public holidays for a given year.
 * Currently configured for Canadian holidays.
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
 * Returns both the holiday status and the holiday name if applicable.
 */
const isHoliday = (date: Date, holidays: Array<{ date: string; name: string }>): { isHoliday: boolean; name?: string } => {
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
function findAllPossibleBreaks(days: OptimizedDay[], year: number): Break[] {
  const breaks: Break[] = []
  let i = 0

  while (i < days.length) {
    // Skip days not in the target year
    if (!days[i].date.startsWith(year.toString())) {
      i++
      continue
    }

    // Look ahead up to 3 weeks for each potential start date
    for (let length = 1; length <= 21; length++) {
      if (i + length >= days.length) break

      // Analyze the composition of this potential break
      let ctoDaysNeeded = 0
      let holidaysIncluded = 0
      let weekendsIncluded = 0
      let hasCTODay = false

      // Count the different types of days in this break
      for (let j = i; j < i + length; j++) {
        if (!days[j].date.startsWith(year.toString())) break
        if (!days[j].isWeekend && !days[j].isHoliday) {
          ctoDaysNeeded++
          hasCTODay = true
        }
        if (days[j].isHoliday) holidaysIncluded++
        if (days[j].isWeekend) weekendsIncluded++
      }

      // Only include breaks that would use CTO days
      if (hasCTODay) {
        breaks.push({
          startDate: days[i].date,
          endDate: days[i + length - 1].date,
          length,
          ctoDaysNeeded,
          holidaysIncluded,
          weekendsIncluded
        })
      }
    }
    i++
  }

  return breaks
}

// Helper function to get all dates in a range
const getDatesInRange = (startDate: string, endDate: string): string[] => {
  const start = parse(startDate, 'yyyy-MM-dd', new Date())
  const end = parse(endDate, 'yyyy-MM-dd', new Date())
  const dates: string[] = []
  let current = start

  while (current <= end) {
    dates.push(format(current, 'yyyy-MM-dd'))
    current = addDays(current, 1)
  }

  return dates
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
 * Pure function to optimize for long weekends
 * @param days - Array of all days in the year with their current status
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

  // Apply breaks in order
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

// Pure function to mark breaks and extended weekends
const markBreaks = (days: OptimizedDay[]): OptimizedDay[] => {
  const result = [...days]

  // First pass: Find all breaks that use CTO days
  let breakStart = -1
  for (let i = 0; i < result.length; i++) {
    result[i].isPartOfBreak = false // Reset break markers
    
    if (result[i].isCTO) {
      // Found a CTO day, mark it and look backwards/forwards
      result[i].isPartOfBreak = true
      
      // Look backwards
      for (let j = i - 1; j >= 0; j--) {
        if (result[j].isHoliday || result[j].isWeekend || result[j].isCTO) {
          result[j].isPartOfBreak = true
          if (breakStart === -1) breakStart = j
        } else {
          break
        }
      }

      // Look forwards
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].isHoliday || result[j].isWeekend || result[j].isCTO) {
          result[j].isPartOfBreak = true
        } else {
          break
        }
      }
    } else if (breakStart !== -1 && !result[i].isPartOfBreak) {
      // End of a break
      breakStart = -1
    }
  }

  // Second pass: Mark holidays that extend weekends
  for (let i = 0; i < result.length; i++) {
    if (result[i].isHoliday) {
      const prevDay = result[i - 1]
      const nextDay = result[i + 1]
      const prevIsWeekendOrCTO = prevDay && (prevDay.isWeekend || prevDay.isCTO || (prevDay.isHoliday && prevDay.isPartOfBreak))
      const nextIsWeekendOrCTO = nextDay && (nextDay.isWeekend || nextDay.isCTO || (nextDay.isHoliday && nextDay.isPartOfBreak))
      
      if (prevIsWeekendOrCTO || nextIsWeekendOrCTO) {
        result[i].isPartOfBreak = true
        
        if (prevDay?.isWeekend) {
          prevDay.isPartOfBreak = true
          if (i >= 2 && result[i - 2].isWeekend) {
            result[i - 2].isPartOfBreak = true
          }
        }
        if (nextDay?.isWeekend) {
          nextDay.isPartOfBreak = true
          if (i + 2 < result.length && result[i + 2].isWeekend) {
            result[i + 2].isPartOfBreak = true
          }
        }
      }
    }
  }

  // Third pass: Connect any gaps between CTO days
  for (let i = 1; i < result.length - 1; i++) {
    if (!result[i].isPartOfBreak && result[i-1].isPartOfBreak && result[i+1].isPartOfBreak) {
      let hasCTODay = false
      
      // Look backwards
      for (let j = i - 1; j >= 0 && result[j].isPartOfBreak; j--) {
        if (result[j].isCTO) {
          hasCTODay = true
          break
        }
      }
      
      // Look forwards
      for (let j = i + 1; j < result.length && result[j].isPartOfBreak; j++) {
        if (result[j].isCTO) {
          hasCTODay = true
          break
        }
      }
      
      if (hasCTODay) {
        result[i].isPartOfBreak = true
      }
    }
  }

  return result
}

// Pure function to mark extended weekends
const markExtendedWeekends = (days: OptimizedDay[]): OptimizedDay[] => {
  const result = [...days]

  // First pass: mark weekends that are part of breaks
  result.forEach((day, index) => {
    if (day.isWeekend && day.isPartOfBreak) {
      const date = parse(day.date, 'yyyy-MM-dd', new Date())
      // If this is a Saturday, also ensure Sunday is marked
      if (date.getDay() === 6) {
        const nextDay = result[index + 1]
        if (nextDay) {
          nextDay.isPartOfBreak = true
        }
      }
      // If this is a Sunday, also ensure Saturday is marked
      if (date.getDay() === 0) {
        const prevDay = result[index - 1]
        if (prevDay) {
          prevDay.isPartOfBreak = true
        }
      }
    }
  })

  // Second pass: mark weekends extended by holidays
  result.forEach((day, index) => {
    if (day.isWeekend) {
      const prevDay = result[index - 1]
      const nextDay = result[index + 1]
      const isExtendedByHoliday = prevDay?.isHoliday || nextDay?.isHoliday

      if (isExtendedByHoliday) {
        day.isPartOfBreak = true
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        // If this is a Saturday, also mark Sunday
        if (date.getDay() === 6 && nextDay) {
          nextDay.isPartOfBreak = true
        }
        // If this is a Sunday, also mark Saturday
        if (date.getDay() === 0 && prevDay) {
          prevDay.isPartOfBreak = true
        }
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
 * @returns Optimized calendar with CTO days allocated
 */
const optimizeBalanced = (days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] => {
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
 * Main optimization function that generates and optimizes a calendar based on
 * the specified strategy and number of CTO days.
 * 
 * @param numberOfDays - Number of CTO days to allocate
 * @param strategy - Optimization strategy to use
 * @param year - Target year (defaults to current year)
 * @returns Object containing the optimized calendar days
 * @throws Error if numberOfDays is invalid or if there aren't enough workdays
 */
export const optimizeCtoDays = (
  numberOfDays: number,
  strategy: OptimizationStrategy,
  year: number = new Date().getFullYear()
): { days: OptimizedDay[] } => {
  // Input validation
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Generate initial calendar
  const days = generateCalendarDays(year)
  const yearDays = days.filter(day => day.date.startsWith(year.toString()))
  const availableWorkdays = yearDays.filter(day => !day.isWeekend && !day.isHoliday).length

  // Validate workday availability
  if (availableWorkdays < numberOfDays) {
    throw new Error(
      `Not enough workdays available in ${year}. Requested ${numberOfDays} days but only ${availableWorkdays} workdays available.`
    )
  }

  // Strategy-specific optimization using composition
  const optimize = pipe(
    (days: OptimizedDay[]) => {
      const strategyMap: Record<OptimizationStrategy, (d: OptimizedDay[], n: number, y: number) => OptimizedDay[]> = {
        longWeekends: optimizeLongWeekends,
        weekLongBreaks: optimizeWeekLongBreaks,
        extendedVacations: optimizeExtendedVacations,
        balanced: optimizeBalanced
      }
      return strategyMap[strategy](days, numberOfDays, year)
    },
    markBreaks,
    markExtendedWeekends
  )

  let optimizedDays = optimize(days)
  let yearOptimizedDays = optimizedDays.filter(day => day.date.startsWith(year.toString()))
  let usedCtoDays = yearOptimizedDays.filter(day => day.isCTO).length

  // Keep trying to allocate days until we use exactly the number requested
  while (usedCtoDays < numberOfDays) {
    const remainingDays = numberOfDays - usedCtoDays
    const usedDates = new Set(yearOptimizedDays.filter(day => day.isCTO).map(day => day.date))

    // First try optimal allocation
    optimizedDays = allocateRemainingDays(optimizedDays, remainingDays, year, usedDates)
    yearOptimizedDays = optimizedDays.filter(day => day.date.startsWith(year.toString()))
    usedCtoDays = yearOptimizedDays.filter(day => day.isCTO).length

    // If optimal allocation didn't use all days, force allocate the rest
    if (usedCtoDays < numberOfDays) {
      const stillRemainingDays = numberOfDays - usedCtoDays
      const updatedUsedDates = new Set(yearOptimizedDays.filter(day => day.isCTO).map(day => day.date))
      
      optimizedDays = forceAllocateRemainingDays(optimizedDays, stillRemainingDays, year, updatedUsedDates)
      yearOptimizedDays = optimizedDays.filter(day => day.date.startsWith(year.toString()))
      usedCtoDays = yearOptimizedDays.filter(day => day.isCTO).length
    }
  }

  // Final validation - this should never happen now but keep as a safeguard
  if (usedCtoDays !== numberOfDays) {
    throw new Error(
      `Critical optimization error: Failed to allocate exact number of CTO days. ` +
      `Requested ${numberOfDays} days but used ${usedCtoDays} days. ` +
      `Please report this as a bug.`
    )
  }

  // Re-mark breaks after all allocations
  optimizedDays = pipe(markBreaks, markExtendedWeekends)(optimizedDays)
  yearOptimizedDays = optimizedDays.filter(day => day.date.startsWith(year.toString()))

  return { days: yearOptimizedDays }
}

/**
 * Generates a calendar for the specified year, including the last month of the
 * previous year to handle breaks that span across years.
 * 
 * @param year - Target year
 * @returns Array of calendar days with their initial properties
 */
const generateCalendarDays = (year: number): OptimizedDay[] => {
  const startDate = new Date(year - 1, 11, 1) // Start from December of previous year
  const daysToGenerate = 365 + 31 // Full year plus December of previous year
  const holidays = getHolidaysForYear(year)

  return Array.from({ length: daysToGenerate }, (_, i) => {
    const currentDate = addDays(startDate, i)
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const { isHoliday: isHolidayDay, name: holidayName } = isHoliday(currentDate, holidays)

    return {
      date: dateStr,
      isWeekend: isWeekend(currentDate),
      isCTO: false,
      isPartOfBreak: isHolidayDay,
      isHoliday: isHolidayDay,
      holidayName
    }
  })
} 