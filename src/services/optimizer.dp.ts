import { addDays, isWeekend, format, parse, getDay, getMonth } from 'date-fns'
import {
  BREAK_LENGTHS,
  BALANCED_STRATEGY,
  POSITION_BONUSES,
  EFFICIENCY_SCORING
} from './optimizer.constants'

// Keep existing types
export interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday: boolean
  holidayName?: string
  isCustomDayOff: boolean
  customDayName?: string
}

export interface CustomDayOff {
  date: string
  name: string
  isRecurring?: boolean
  startDate?: string
  endDate?: string
  weekday?: number
}

export type OptimizationStrategy = 'balanced' | 'longWeekends' | 'weekLongBreaks' | 'extendedVacations'

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

// Helper types for DP
interface DPState {
  workdayIndex: number     // Current workday we're considering
  ctoDaysLeft: number      // Number of CTO days left to allocate
  lastBreakEnd: number     // Index where the last break ended
}

interface DPResult {
  score: number           // Score for this allocation
  allocation: number[]    // Indices of workdays chosen for CTO
}

interface WorkDay {
  index: number          // Original index in year array
  date: string
  isWorkday: boolean
  isHoliday: boolean
  holidayName?: string
  isCustomDayOff: boolean
  customDayName?: string
  isWeekend: boolean
}

interface PrecomputedBreakInfo {
  length: number
  startIndex: number
  endIndex: number
  ctoDaysUsed: number
  score: number
}

// Helper functions
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

const generateCustomDaysOff = (customDaysOff: CustomDayOff[], year: number): Array<{ date: string; name: string }> => {
  const result: Array<{ date: string; name: string }> = []

  customDaysOff.forEach(customDay => {
    if (!customDay.isRecurring) {
      if (customDay.date.startsWith(year.toString())) {
        result.push({ date: customDay.date, name: customDay.name })
      }
      return
    }

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

const generateWorkdayArray = (year: number, customDaysOff: CustomDayOff[] = []): WorkDay[] => {
  const startDate = new Date(year, 0, 1)  // January 1st
  const endDate = new Date(year, 11, 31)  // December 31st
  const holidays = getHolidaysForYear(year)
  const customDays = generateCustomDaysOff(customDaysOff, year)
  const days: WorkDay[] = []

  let currentDate = startDate
  let index = 0

  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    const holiday = holidays.find(h => h.date === dateStr)
    const customDay = customDays.find(d => d.date === dateStr)
    
    days.push({
      index,
      date: dateStr,
      isWeekend: isWeekend(currentDate),
      isHoliday: !!holiday,
      holidayName: holiday?.name,
      isCustomDayOff: !!customDay,
      customDayName: customDay?.name,
      isWorkday: !isWeekend(currentDate) && !holiday && !customDay
    })

    currentDate = addDays(currentDate, 1)
    index++
  }

  return days
}

const calculateBreakScore = (
  days: WorkDay[],
  ctoIndices: number[],
  strategy: OptimizationStrategy
): number => {
  let score = 0
  const breaks: Array<{ length: number; startIndex: number }> = []
  let currentBreak = 0
  let currentBreakStart = -1
  let lastDayOff = -2

  // Helper to check if a day is off
  const isDayOff = (index: number) => {
    const day = days[index]
    return day.isWeekend || day.isHoliday || day.isCustomDayOff || ctoIndices.includes(index)
  }

  // Helper to check if a break contains a CTO day
  const breakContainsCTO = (startIdx: number, length: number) => {
    for (let i = startIdx; i < startIdx + length; i++) {
      if (ctoIndices.includes(i)) return true
    }
    return false
  }

  // Calculate break lengths and their values
  for (let i = 0; i < days.length; i++) {
    if (isDayOff(i)) {
      if (i === lastDayOff + 1) {
        currentBreak++
      } else {
        if (currentBreak > 0 && breakContainsCTO(currentBreakStart, currentBreak)) {
          breaks.push({ length: currentBreak, startIndex: currentBreakStart })
        }
        currentBreak = 1
        currentBreakStart = i
      }
      lastDayOff = i
    } else {
      if (currentBreak > 0 && breakContainsCTO(currentBreakStart, currentBreak)) {
        breaks.push({ length: currentBreak, startIndex: currentBreakStart })
      }
      currentBreak = 0
      currentBreakStart = -1
    }
  }
  if (currentBreak > 0 && breakContainsCTO(currentBreakStart, currentBreak)) {
    breaks.push({ length: currentBreak, startIndex: currentBreakStart })
  }

  // Score breaks based on strategy
  breaks.forEach((breakInfo, index) => {
    let breakScore = breakInfo.length

    // Base score calculation based on strategy
    switch (strategy) {
      case 'longWeekends':
        if (breakInfo.length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && 
            breakInfo.length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.LONG_WEEKEND.SCORE_MULTIPLIER
        } else if (breakInfo.length > BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.LONG_WEEKEND.PENALTY_MULTIPLIER
        }
        break

      case 'weekLongBreaks':
        if (breakInfo.length >= BREAK_LENGTHS.WEEK_LONG.MIN && 
            breakInfo.length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.WEEK_LONG.SCORE_MULTIPLIER
        } else if (breakInfo.length > BREAK_LENGTHS.WEEK_LONG.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.WEEK_LONG.PENALTY_MULTIPLIER
        }
        break

      case 'extendedVacations':
        if (breakInfo.length >= BREAK_LENGTHS.EXTENDED.MIN && 
            breakInfo.length <= BREAK_LENGTHS.EXTENDED.MAX) {
          breakScore = breakInfo.length * BREAK_LENGTHS.EXTENDED.SCORE_MULTIPLIER
        } else if (breakInfo.length < BREAK_LENGTHS.EXTENDED.MIN) {
          breakScore = breakInfo.length * BREAK_LENGTHS.EXTENDED.PENALTY_MULTIPLIER
        }
        break

      case 'balanced':
        if (breakInfo.length >= BREAK_LENGTHS.EXTENDED.MIN && 
            breakInfo.length <= BREAK_LENGTHS.EXTENDED.MAX) {
          breakScore = breakInfo.length * BALANCED_STRATEGY.EXTENDED_MULTIPLIER
        } else if (breakInfo.length >= BREAK_LENGTHS.WEEK_LONG.MIN && 
                   breakInfo.length <= BREAK_LENGTHS.WEEK_LONG.MAX) {
          breakScore = breakInfo.length * BALANCED_STRATEGY.WEEK_LONG_MULTIPLIER
        } else if (breakInfo.length >= BREAK_LENGTHS.LONG_WEEKEND.MIN && 
                   breakInfo.length <= BREAK_LENGTHS.LONG_WEEKEND.MAX) {
          breakScore = breakInfo.length * BALANCED_STRATEGY.LONG_WEEKEND_MULTIPLIER
        }
        break
    }

    // Add efficiency bonus - more days off per CTO day used
    const ctoDaysInBreak = ctoIndices.filter(idx => 
      idx >= breakInfo.startIndex && idx < breakInfo.startIndex + breakInfo.length
    ).length
    const efficiency = breakInfo.length / ctoDaysInBreak
    breakScore *= Math.min(efficiency, EFFICIENCY_SCORING.MAX_MULTIPLIER)

    // Add position-based bonuses
    const dayOfWeek = getDay(parse(days[breakInfo.startIndex].date, 'yyyy-MM-dd', new Date()))
    const isMonFri = dayOfWeek === 1 || dayOfWeek === 5

    // Position bonuses based on strategy
    if (strategy === 'longWeekends' && isMonFri) {
      breakScore *= POSITION_BONUSES.MONDAY_FRIDAY
    }

    score += breakScore
  })

  return score
}

const findOptimalAllocation = (
  days: WorkDay[],
  numberOfDays: number,
  strategy: OptimizationStrategy
): number[] => {
  const workdays = days.map((day, index) => ({ day, index }))
    .filter(({ day }) => day.isWorkday)

  // Precompute all possible breaks up to max length
  const possibleBreaks: PrecomputedBreakInfo[] = []
  const maxBreakLength = BREAK_LENGTHS.EXTENDED.MAX

  // For each workday, try starting a break
  for (let i = 0; i < workdays.length; i++) {
    let currentLength = 0
    let ctoDaysUsed = 0
    let lastIndex = workdays[i].index
    
    // Look ahead up to maxBreakLength days
    for (let j = i; j < workdays.length && currentLength < maxBreakLength; j++) {
      const currentDay = workdays[j]
      
      // Count days between this workday and the last one as part of the break
      if (j > i) {
        for (let k = lastIndex + 1; k < currentDay.index; k++) {
          if (days[k].isWeekend || days[k].isHoliday || days[k].isCustomDayOff) {
            currentLength++
          }
        }
      }
      
      ctoDaysUsed++
      currentLength++
      lastIndex = currentDay.index

      // Only store breaks that make sense for the strategy
      const isValidBreak = (
        (strategy === 'longWeekends' && 
         currentLength >= BREAK_LENGTHS.LONG_WEEKEND.MIN && 
         currentLength <= BREAK_LENGTHS.LONG_WEEKEND.MAX) ||
        (strategy === 'weekLongBreaks' && 
         currentLength >= BREAK_LENGTHS.WEEK_LONG.MIN && 
         currentLength <= BREAK_LENGTHS.WEEK_LONG.MAX) ||
        (strategy === 'extendedVacations' && 
         currentLength >= BREAK_LENGTHS.EXTENDED.MIN && 
         currentLength <= BREAK_LENGTHS.EXTENDED.MAX) ||
        (strategy === 'balanced')
      )

      if (isValidBreak) {
        const breakInfo: PrecomputedBreakInfo = {
          length: currentLength,
          startIndex: workdays[i].index,
          endIndex: lastIndex,
          ctoDaysUsed,
          score: calculateBreakScore(
            days,
            Array.from({ length: ctoDaysUsed }, (_, idx) => workdays[i + idx].index),
            strategy
          )
        }
        possibleBreaks.push(breakInfo)
      }
    }
  }

  // Sort breaks by efficiency (score per CTO day used)
  possibleBreaks.sort((a, b) => (b.score / b.ctoDaysUsed) - (a.score / a.ctoDaysUsed))

  // DP state now only needs to track remaining CTO days and last break used
  const memo = new Map<string, { score: number; breaks: PrecomputedBreakInfo[] }>()

  const dp = (ctoDaysLeft: number, lastBreakIndex: number): { score: number; breaks: PrecomputedBreakInfo[] } => {
    const key = `${ctoDaysLeft}_${lastBreakIndex}`
    if (memo.has(key)) return memo.get(key)!

    // Base case: no more CTO days to allocate
    if (ctoDaysLeft === 0) return { score: 0, breaks: [] }
    
    let bestScore = -Infinity
    let bestBreaks: PrecomputedBreakInfo[] = []

    // Try each possible break that fits
    for (let i = lastBreakIndex + 1; i < possibleBreaks.length; i++) {
      const currentBreak = possibleBreaks[i]
      
      // Skip if we can't use this break
      if (currentBreak.ctoDaysUsed > ctoDaysLeft) continue
      if (currentBreak.startIndex <= possibleBreaks[lastBreakIndex]?.endIndex) continue

      // Recursively try using this break
      const result = dp(ctoDaysLeft - currentBreak.ctoDaysUsed, i)
      const totalScore = result.score + currentBreak.score

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestBreaks = [currentBreak, ...result.breaks]
      }
    }

    const result = { score: bestScore, breaks: bestBreaks }
    memo.set(key, result)
    return result
  }

  // Find optimal solution
  const solution = dp(numberOfDays, -1)

  // Convert solution to CTO day indices
  const ctoIndices = new Set<number>()
  solution.breaks.forEach(breakInfo => {
    for (let i = 0; i < breakInfo.ctoDaysUsed; i++) {
      const workdayIndex = workdays.findIndex(
        ({ index }) => index >= breakInfo.startIndex
      ) + i
      ctoIndices.add(workdays[workdayIndex].index)
    }
  })

  return Array.from(ctoIndices)
}

const markBreakPeriods = (days: OptimizedDay[]): OptimizedDay[] => {
  const result = [...days]

  // First pass: find CTO days and extend breaks from there
  for (let i = 0; i < days.length; i++) {
    if (days[i].isCTO) {
      result[i].isPartOfBreak = true
      
      // Look backward for connected days
      let j = i - 1
      while (j >= 0 && (days[j].isHoliday || days[j].isCustomDayOff || days[j].isWeekend)) {
        result[j].isPartOfBreak = true
        j--
      }

      // Look forward for connected days
      j = i + 1
      while (j < days.length && (days[j].isHoliday || days[j].isCustomDayOff || days[j].isWeekend)) {
        result[j].isPartOfBreak = true
        j++
      }
    }
  }

  // Second pass: handle weekends as complete units when they're part of a break
  for (let i = 0; i < days.length; i++) {
    if (days[i].isWeekend && result[i].isPartOfBreak) {
      // Find the other weekend day (if this is Sat, find Sun, and vice versa)
      const otherWeekendDay = i > 0 && days[i - 1].isWeekend ? i - 1 : 
                             i < days.length - 1 && days[i + 1].isWeekend ? i + 1 : 
                             null

      if (otherWeekendDay !== null) {
        // If either day is part of a break, both should be
        result[otherWeekendDay].isPartOfBreak = true
      }
    }
  }

  return result
}

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

  // Generate workday array
  const workdays = generateWorkdayArray(year, customDaysOff)

  // Validate we have enough workdays
  const availableWorkdays = workdays.filter(d => d.isWorkday).length
  if (availableWorkdays < numberOfDays) {
    throw new Error(
      `Not enough workdays available in ${year}. Requested ${numberOfDays} days but only ${availableWorkdays} workdays available.`
    )
  }

  // Find optimal allocation
  const allocation = findOptimalAllocation(workdays, numberOfDays, strategy)

  // Convert workdays and allocation to OptimizedDay[]
  const optimizedDays: OptimizedDay[] = workdays.map((day, index) => ({
    date: day.date,
    isWeekend: day.isWeekend,
    isCTO: allocation.includes(index),
    isPartOfBreak: false, // Will be marked in next step
    isHoliday: day.isHoliday,
    holidayName: day.holidayName,
    isCustomDayOff: day.isCustomDayOff,
    customDayName: day.customDayName
  }))

  // Mark break periods
  const daysWithBreaks = markBreakPeriods(optimizedDays)

  return { days: daysWithBreaks }
} 