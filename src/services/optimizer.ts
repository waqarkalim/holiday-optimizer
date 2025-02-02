import { addDays, isWeekend, format, parse, getDay } from 'date-fns'

// Export the interfaces
export interface OptimizedDay {
  date: string
  isWeekend: boolean
  isCTO: boolean
  isPartOfBreak: boolean
  isHoliday?: boolean
  holidayName?: string
}

export interface AlternativeDay {
  originalDate: string
  alternativeDate: string
  reason: string
}

// Add break preference types
export interface BreakPreference {
  minDays: number
  maxDays: number
  weight: number
  name: string
}

// Canadian holidays for 2025
const HOLIDAYS = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-02-17', name: 'Family Day' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-05-19', name: 'Victoria Day' },
  { date: '2025-07-01', name: 'Canada Day' },
  { date: '2025-09-01', name: 'Labour Day' },
  { date: '2025-10-13', name: 'Thanksgiving Day' },
  { date: '2025-11-11', name: 'Remembrance Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' },
]

function isHoliday(date: Date): { isHoliday: boolean; name?: string } {
  const formattedDate = format(date, 'yyyy-MM-dd')
  const holiday = HOLIDAYS.find(h => h.date === formattedDate)
  return holiday ? { isHoliday: true, name: holiday.name } : { isHoliday: false }
}

// Define optimization strategies
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

interface Break {
  startDate: string
  endDate: string
  length: number
  ctoDaysNeeded: number
  holidaysIncluded: number
  weekendsIncluded: number
}

function findAllPossibleBreaks(days: OptimizedDay[]): Break[] {
  const breaks: Break[] = []
  let i = 0

  while (i < days.length) {
    if (!days[i].date.startsWith('2025')) {
      i++
      continue
    }

    // For each potential start date
    for (let length = 1; length <= 21; length++) {  // Look up to 3 weeks ahead
      if (i + length >= days.length) break

      // Count what this break would require/include
      let ctoDaysNeeded = 0
      let holidaysIncluded = 0
      let weekendsIncluded = 0
      let hasCTODay = false

      for (let j = i; j < i + length; j++) {
        if (!days[j].date.startsWith('2025')) break
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

function optimizeLongWeekends(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))
  let remainingDays = numberOfDays

  // Get all potential long weekend breaks (3-4 days total, 1-2 CTO days)
  const longWeekendBreaks = findAllPossibleBreaks(result)
    .filter(b => {
      // Must be 3-4 days total
      if (b.length < 3 || b.length > 4) return false
      // Must use 1-2 CTO days
      if (b.ctoDaysNeeded < 1 || b.ctoDaysNeeded > 2) return false
      // Must be affordable with remaining days
      if (b.ctoDaysNeeded > remainingDays) return false
      return true
    })
    .sort((a, b) => {
      // Prioritize breaks near holidays
      const aStartDate = parse(a.startDate, 'yyyy-MM-dd', new Date())
      const bStartDate = parse(b.startDate, 'yyyy-MM-dd', new Date())
      const aHasHoliday = a.holidaysIncluded > 0 ? 1 : 0
      const bHasHoliday = b.holidaysIncluded > 0 ? 1 : 0
      return bHasHoliday - aHasHoliday || aStartDate.getTime() - bStartDate.getTime()
    })

  // Track used days
  const usedDays = new Set<string>()

  // Take the best long weekend breaks
  for (const breakPeriod of longWeekendBreaks) {
    if (remainingDays <= 0) break

    let canUseBreak = true
    let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
    let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

    // Check for overlap
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
        canUseBreak = false
        break
      }
    }

    if (canUseBreak && breakPeriod.ctoDaysNeeded <= remainingDays) {
      // Use this break
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        usedDays.add(dateStr)
        const index = days.findIndex(day => day.date === dateStr)
        if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          remainingDays--
        }
      }
    }
  }

  // Use any remaining days on Mondays/Fridays to create more long weekends
  if (remainingDays > 0) {
    const mondaysAndFridays = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => {
        if (!day.date.startsWith('2025') ||
          day.isWeekend ||
          day.isHoliday ||
          usedDays.has(day.date)) return false
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        const dayOfWeek = getDay(date)
        return dayOfWeek === 1 || dayOfWeek === 5
      })
      .sort((a, b) => {
        const scoreA = isNearHoliday(days, a.index) ? 1 : 0
        const scoreB = isNearHoliday(days, b.index) ? 1 : 0
        return scoreB - scoreA
      })

    for (const { index } of mondaysAndFridays) {
      if (remainingDays <= 0) break
      result[index].isCTO = true
      usedDays.add(days[index].date)
      remainingDays--
    }
  }

  // Use any remaining days
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') &&
        !days[i].isWeekend &&
        !days[i].isHoliday &&
        !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        remainingDays--
      }
    }
  }

  return result
}

function optimizeWeekLongBreaks(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))
  let remainingDays = numberOfDays

  // Find all potential week-long breaks (5-9 days total, 2-7 CTO days)
  const weekBreaks = findAllPossibleBreaks(result)
    .filter(b => {
      // Must be 5-9 days total
      if (b.length < 5 || b.length > 9) return false
      // Must use 2-7 CTO days
      if (b.ctoDaysNeeded < 2 || b.ctoDaysNeeded > 7) return false
      // Must be affordable with remaining days
      if (b.ctoDaysNeeded > remainingDays) return false
      return true
    })
    .sort((a, b) => {
      // Prioritize breaks near holidays and efficient use of CTO days
      const aEfficiency = (a.length - a.ctoDaysNeeded) / a.ctoDaysNeeded
      const bEfficiency = (b.length - b.ctoDaysNeeded) / b.ctoDaysNeeded
      const aHasHoliday = a.holidaysIncluded > 0 ? 1 : 0
      const bHasHoliday = b.holidaysIncluded > 0 ? 1 : 0
      return bHasHoliday - aHasHoliday || bEfficiency - aEfficiency
    })

  // Track used days
  const usedDays = new Set<string>()

  // Take the best week-long breaks
  for (const breakPeriod of weekBreaks) {
    if (remainingDays <= 0) break

    let canUseBreak = true
    let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
    let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

    // Check for overlap
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
        canUseBreak = false
        break
      }
    }

    if (canUseBreak && breakPeriod.ctoDaysNeeded <= remainingDays) {
      // Use this break
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        usedDays.add(dateStr)
        const index = days.findIndex(day => day.date === dateStr)
        if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          remainingDays--
        }
      }
    }
  }

  // If we still have remaining days, look for smaller week-long breaks (5 days)
  if (remainingDays > 0) {
    const smallerBreaks = findAllPossibleBreaks(result)
      .filter(b => {
        // Must be exactly 5 days
        if (b.length !== 5) return false
        // Must use 2-3 CTO days
        if (b.ctoDaysNeeded < 2 || b.ctoDaysNeeded > 3) return false
        // Must be affordable with remaining days
        if (b.ctoDaysNeeded > remainingDays) return false
        // Check for overlap with used days
        let hasOverlap = false
        let currentDate = parse(b.startDate, 'yyyy-MM-dd', new Date())
        const endDate = parse(b.endDate, 'yyyy-MM-dd', new Date())
        while (currentDate <= endDate) {
          if (usedDays.has(format(currentDate, 'yyyy-MM-dd'))) {
            hasOverlap = true
            break
          }
          currentDate = addDays(currentDate, 1)
        }
        return !hasOverlap
      })
      .sort((a, b) => {
        // Prioritize breaks near holidays and efficient use of CTO days
        const aEfficiency = (a.length - a.ctoDaysNeeded) / a.ctoDaysNeeded
        const bEfficiency = (b.length - b.ctoDaysNeeded) / b.ctoDaysNeeded
        const aHasHoliday = a.holidaysIncluded > 0 ? 1 : 0
        const bHasHoliday = b.holidaysIncluded > 0 ? 1 : 0
        return bHasHoliday - aHasHoliday || bEfficiency - aEfficiency
      })

    // Use smaller breaks
    for (const breakPeriod of smallerBreaks) {
      if (remainingDays <= 0) break

      let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
      let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

      // Use this break
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        usedDays.add(dateStr)
        const index = days.findIndex(day => day.date === dateStr)
        if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          remainingDays--
        }
      }
    }
  }

  // Use any remaining days near existing breaks
  if (remainingDays > 0) {
    const daysNearBreaks = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => {
        if (!day.date.startsWith('2025') ||
          day.isWeekend ||
          day.isHoliday ||
          usedDays.has(day.date)) return false
        
        // Check if this day is adjacent to an existing break
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        const prevDay = format(addDays(date, -1), 'yyyy-MM-dd')
        const nextDay = format(addDays(date, 1), 'yyyy-MM-dd')
        return usedDays.has(prevDay) || usedDays.has(nextDay)
      })
      .sort((a, b) => {
        const scoreA = isNearHoliday(days, a.index) ? 1 : 0
        const scoreB = isNearHoliday(days, b.index) ? 1 : 0
        return scoreB - scoreA
      })

    for (const { index } of daysNearBreaks) {
      if (remainingDays <= 0) break
      result[index].isCTO = true
      usedDays.add(days[index].date)
      remainingDays--
    }
  }

  // Use any remaining days on workdays
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') &&
        !days[i].isWeekend &&
        !days[i].isHoliday &&
        !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        remainingDays--
      }
    }
  }

  // Mark all days that are part of breaks
  markBreaks(result)

  // Validate that we used exactly the right number of days
  const usedCTODays = result.filter(day => day.isCTO).length
  if (usedCTODays !== numberOfDays) {
    throw new Error(`Optimization failed: final result has ${usedCTODays} CTO days, expected ${numberOfDays}`)
  }

  return result
}

function optimizeExtendedVacations(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))
  let remainingDays = numberOfDays

  // Find all potential extended breaks (10-15 days total, 6-10 CTO days)
  const extendedBreaks = findAllPossibleBreaks(result)
    .filter(b => {
      // Must be 10-15 days total
      if (b.length < 10 || b.length > 15) return false
      // Must use 6-10 CTO days
      if (b.ctoDaysNeeded < 6 || b.ctoDaysNeeded > 10) return false
      // Must be affordable with remaining days
      if (b.ctoDaysNeeded > remainingDays) return false
      return true
    })
    .sort((a, b) => {
      // Sort by total length first
      if (a.length !== b.length) return b.length - a.length
      // Then by efficiency
      const aEfficiency = a.length / a.ctoDaysNeeded
      const bEfficiency = b.length / b.ctoDaysNeeded
      return bEfficiency - aEfficiency || b.holidaysIncluded - a.holidaysIncluded
    })

  // Track used days
  const usedDays = new Set<string>()

  // Take the best extended breaks
  for (const breakPeriod of extendedBreaks) {
    if (remainingDays < 6) break // Stop if we can't make another extended break

    let canUseBreak = true
    let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
    let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
        canUseBreak = false
        break
      }
    }

    if (canUseBreak && breakPeriod.ctoDaysNeeded <= remainingDays) {
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateStr = format(d, 'yyyy-MM-dd')
        usedDays.add(dateStr)
        const index = days.findIndex(day => day.date === dateStr)
        if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
          result[index].isCTO = true
          remainingDays--
        }
      }
    }
  }

  // Use remaining days for week-long breaks if we have enough
  if (remainingDays >= 2) {
    const weekBreakResult = optimizeWeekLongBreaks(days.map(d => ({...d})), remainingDays)
    let daysAdded = 0
    for (let i = 0; i < days.length && daysAdded < remainingDays; i++) {
      if (weekBreakResult[i].isCTO && !result[i].isCTO && !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        usedDays.add(days[i].date)
        daysAdded++
      }
    }
    remainingDays -= daysAdded
  }

  // Use any remaining days on workdays near existing breaks
  if (remainingDays > 0) {
    const daysNearBreaks = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => {
        if (!day.date.startsWith('2025') ||
          day.isWeekend ||
          day.isHoliday ||
          usedDays.has(day.date)) return false
        
        // Check if this day is adjacent to an existing break
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        const prevDay = format(addDays(date, -1), 'yyyy-MM-dd')
        const nextDay = format(addDays(date, 1), 'yyyy-MM-dd')
        return usedDays.has(prevDay) || usedDays.has(nextDay)
      })
      .sort((a, b) => {
        const scoreA = isNearHoliday(days, a.index) ? 1 : 0
        const scoreB = isNearHoliday(days, b.index) ? 1 : 0
        return scoreB - scoreA
      })

    for (const { index } of daysNearBreaks) {
      if (remainingDays <= 0) break
      result[index].isCTO = true
      usedDays.add(days[index].date)
      remainingDays--
    }
  }

  // Use any remaining days on any available workdays
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') &&
        !days[i].isWeekend &&
        !days[i].isHoliday &&
        !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        usedDays.add(days[i].date)
        remainingDays--
      }
    }
  }

  // Mark all days that are part of breaks
  markBreaks(result)

  // Validate that we used exactly the right number of days
  const usedCTODays = result.filter(day => day.isCTO).length
  if (usedCTODays !== numberOfDays) {
    throw new Error(`Optimization failed: final result has ${usedCTODays} CTO days, expected ${numberOfDays}`)
  }

  return result
}

function markBreaks(days: OptimizedDay[]): void {
  // Reset all break markers except holidays
  for (let i = 0; i < days.length; i++) {
    if (!days[i].isHoliday) {
      days[i].isPartOfBreak = false
    }
  }

  // First pass: Find all breaks that use CTO days
  let breakStart = -1
  for (let i = 0; i < days.length; i++) {
    if (days[i].isCTO) {
      // Found a CTO day, mark it and look backwards/forwards
      days[i].isPartOfBreak = true
      
      // Look backwards
      for (let j = i - 1; j >= 0; j--) {
        if (days[j].isHoliday || days[j].isWeekend || days[j].isCTO) {
          days[j].isPartOfBreak = true
          if (breakStart === -1) breakStart = j
        } else {
          break
        }
      }

      // Look forwards
      for (let j = i + 1; j < days.length; j++) {
        if (days[j].isHoliday || days[j].isWeekend || days[j].isCTO) {
          days[j].isPartOfBreak = true
        } else {
          break
        }
      }
    } else if (breakStart !== -1 && !days[i].isPartOfBreak) {
      // End of a break
      breakStart = -1
    }
  }

  // Second pass: Connect any gaps between CTO days
  for (let i = 1; i < days.length - 1; i++) {
    if (!days[i].isPartOfBreak && days[i-1].isPartOfBreak && days[i+1].isPartOfBreak) {
      // Check if either surrounding break has a CTO day
      let hasCTODay = false
      // Look backwards
      for (let j = i - 1; j >= 0 && days[j].isPartOfBreak; j--) {
        if (days[j].isCTO) {
          hasCTODay = true
          break
        }
      }
      // Look forwards
      for (let j = i + 1; j < days.length && days[j].isPartOfBreak; j++) {
        if (days[j].isCTO) {
          hasCTODay = true
          break
        }
      }
      if (hasCTODay) {
        days[i].isPartOfBreak = true
      }
    }
  }
}

function optimizeBalanced(days: OptimizedDay[], numberOfDays: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))

  // Divide days into different categories
  const longWeekendDays = Math.floor(numberOfDays * 0.4)  // 40% for long weekends
  const weekBreakDays = Math.floor(numberOfDays * 0.4)    // 40% for week breaks
  const extendedBreakDays = numberOfDays - longWeekendDays - weekBreakDays  // Remainder for extended breaks

  // Create separate copies for each strategy
  const longWeekendResult = optimizeLongWeekends(days, longWeekendDays)
  const weekBreakResult = optimizeWeekLongBreaks(days, weekBreakDays)
  const extendedResult = optimizeExtendedVacations(days, extendedBreakDays)

  // Combine results, prioritizing each strategy's days
  const usedDays = new Set<string>()

  // First, take long weekend days
  for (let i = 0; i < days.length; i++) {
    if (longWeekendResult[i].isCTO) {
      result[i].isCTO = true
      usedDays.add(days[i].date)
    }
  }

  // Then, take week break days that don't overlap
  for (let i = 0; i < days.length; i++) {
    if (weekBreakResult[i].isCTO && !usedDays.has(days[i].date)) {
      result[i].isCTO = true
      usedDays.add(days[i].date)
    }
  }

  // Finally, take extended vacation days that don't overlap
  for (let i = 0; i < days.length; i++) {
    if (extendedResult[i].isCTO && !usedDays.has(days[i].date)) {
      result[i].isCTO = true
      usedDays.add(days[i].date)
    }
  }

  // If we still haven't used all days, use the remaining on workdays
  let remainingDays = numberOfDays - usedDays.size
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith('2025') &&
        !days[i].isWeekend &&
        !days[i].isHoliday &&
        !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        usedDays.add(days[i].date)
        remainingDays--
      }
    }
  }

  return result
}

function isNearHoliday(days: OptimizedDay[], index: number, range: number = 3): boolean {
  const date = parse(days[index].date, 'yyyy-MM-dd', new Date())
  
  // Check days before
  for (let i = Math.max(0, index - range); i < index; i++) {
    if (days[i].isHoliday) return true
  }
  
  // Check days after
  for (let i = index + 1; i < Math.min(days.length, index + range + 1); i++) {
    if (days[i].isHoliday) return true
  }
  
  return false
}

// Add new interfaces at the top with other interfaces
export interface OptimizationResult {
  options: OptimizationOption[]
  description: string
}

export interface OptimizationOption {
  days: OptimizedDay[]
  score: number
  description: string
  breaks: BreakSummary[]
  seasonalScore: number  // Make this required
}

export interface BreakSummary {
  startDate: string
  endDate: string
  length: number
  ctoDaysUsed: number
  holidaysIncluded: string[]
  type: 'longWeekend' | 'weekBreak' | 'extendedBreak'
  season: 'winter' | 'spring' | 'summer' | 'fall'
}

// Add helper functions
function getSeasonalScore(date: string): number {
  const month = parseInt(date.split('-')[1])
  // Favor summer months (June-August)
  if (month >= 6 && month <= 8) return 3
  // Spring and fall are next best (April-May, September-October)
  if (month >= 4 && month <= 5 || month >= 9 && month <= 10) return 2
  // Winter months score lowest (November-March)
  return 1
}

function getSeason(date: string): 'winter' | 'spring' | 'summer' | 'fall' {
  const month = parseInt(date.split('-')[1])
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

function getBreakSummaries(days: OptimizedDay[]): BreakSummary[] {
  const summaries: BreakSummary[] = []
  let currentBreak: OptimizedDay[] = []

  for (let i = 0; i < days.length; i++) {
    if (days[i].isPartOfBreak) {
      currentBreak.push(days[i])
    } else if (currentBreak.length > 0) {
      const ctoDaysUsed = currentBreak.filter(d => d.isCTO).length
      if (ctoDaysUsed > 0) {  // Only include breaks that use CTO days
        const holidays = currentBreak
          .filter(d => d.isHoliday)
          .map(d => d.holidayName!)
          .filter(name => name)

        let type: 'longWeekend' | 'weekBreak' | 'extendedBreak'
        if (currentBreak.length <= 4) type = 'longWeekend'
        else if (currentBreak.length <= 9) type = 'weekBreak'
        else type = 'extendedBreak'

        summaries.push({
          startDate: currentBreak[0].date,
          endDate: currentBreak[currentBreak.length - 1].date,
          length: currentBreak.length,
          ctoDaysUsed,
          holidaysIncluded: holidays,
          type,
          season: getSeason(currentBreak[0].date)
        })
      }
      currentBreak = []
    }
  }

  // Handle last break
  if (currentBreak.length > 0) {
    const ctoDaysUsed = currentBreak.filter(d => d.isCTO).length
    if (ctoDaysUsed > 0) {
      const holidays = currentBreak
        .filter(d => d.isHoliday)
        .map(d => d.holidayName!)
        .filter(name => name)

      let type: 'longWeekend' | 'weekBreak' | 'extendedBreak'
      if (currentBreak.length <= 4) type = 'longWeekend'
      else if (currentBreak.length <= 9) type = 'weekBreak'
      else type = 'extendedBreak'

      summaries.push({
        startDate: currentBreak[0].date,
        endDate: currentBreak[currentBreak.length - 1].date,
        length: currentBreak.length,
        ctoDaysUsed,
        holidaysIncluded: holidays,
        type,
        season: getSeason(currentBreak[0].date)
      })
    }
  }

  return summaries
}

function generateDescription(breaks: BreakSummary[]): string {
  const byType = breaks.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const parts = []
  if (byType.extendedBreak) {
    parts.push(`${byType.extendedBreak} extended vacation${byType.extendedBreak > 1 ? 's' : ''}`)
  }
  if (byType.weekBreak) {
    parts.push(`${byType.weekBreak} week-long break${byType.weekBreak > 1 ? 's' : ''}`)
  }
  if (byType.longWeekend) {
    parts.push(`${byType.longWeekend} long weekend${byType.longWeekend > 1 ? 's' : ''}`)
  }

  return parts.join(', ')
}

function findAlternativeConfiguration(
  days: OptimizedDay[],
  originalBreak: BreakSummary,
  usedDates: Set<string>
): OptimizedDay[] | null {
  const result = days.map(d => ({...d}))
  let remainingDays = originalBreak.ctoDaysUsed
  let foundValidConfig = false

  // Find all potential breaks with similar characteristics
  const potentialBreaks = findAllPossibleBreaks(days)
    .filter(b => {
      if (b.length !== originalBreak.length) return false
      if (b.ctoDaysNeeded !== originalBreak.ctoDaysUsed) return false
      
      // Check for overlap with used dates
      let hasOverlap = false
      let startDate = parse(b.startDate, 'yyyy-MM-dd', new Date())
      let endDate = parse(b.endDate, 'yyyy-MM-dd', new Date())
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        if (usedDates.has(format(d, 'yyyy-MM-dd'))) {
          hasOverlap = true
          break
        }
      }
      return !hasOverlap
    })
    .sort((a, b) => {
      // Sort by seasonal preference and holidays
      const aSeasonScore = getSeasonalScore(a.startDate)
      const bSeasonScore = getSeasonalScore(b.startDate)
      if (aSeasonScore !== bSeasonScore) return bSeasonScore - aSeasonScore
      return b.holidaysIncluded - a.holidaysIncluded
    })

  // Try each potential break
  for (const breakPeriod of potentialBreaks) {
    let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
    let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())
    
    // Apply this break configuration
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd')
      const index = days.findIndex(day => day.date === dateStr)
      if (index >= 0 && !days[index].isWeekend && !days[index].isHoliday) {
        result[index].isCTO = true
        remainingDays--
      }
    }

    if (remainingDays === 0) {
      foundValidConfig = true
      break
    }
  }

  return foundValidConfig ? result : null
}

// Modify the main function to return multiple options
export function optimizeCtoDays(
  numberOfDays: number,
  strategy: OptimizationStrategy = 'balanced'
): OptimizedDay[] {
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Initialize the calendar
  const startDate = new Date(2024, 11, 1)
  const daysToMap = 365 + 31
  const days: OptimizedDay[] = []

  // Map out all days
  for (let i = 0; i < daysToMap; i++) {
    const currentDate = addDays(startDate, i)
    const isWeekendDay = isWeekend(currentDate)
    const { isHoliday: isHolidayDay, name: holidayName } = isHoliday(currentDate)
    const dateStr = format(currentDate, 'yyyy-MM-dd')

    days.push({
      date: dateStr,
      isWeekend: isWeekendDay,
      isCTO: false,
      isPartOfBreak: isHolidayDay,
      isHoliday: isHolidayDay,
      holidayName
    })
  }

  // Count available workdays in 2025
  const availableWorkdays = days.filter(day =>
    !day.isWeekend &&
    !day.isHoliday &&
    day.date.startsWith('2025')
  ).length

  if (availableWorkdays < numberOfDays) {
    throw new Error(`Not enough workdays available in 2025. Requested ${numberOfDays} CTO days but only ${availableWorkdays} workdays available.`)
  }

  // Get the base optimization
  let baseResult: OptimizedDay[]
  switch (strategy) {
    case 'longWeekends':
      baseResult = optimizeLongWeekends(days, numberOfDays)
      break
    case 'weekLongBreaks':
      baseResult = optimizeWeekLongBreaks(days, numberOfDays)
      break
    case 'extendedVacations':
      baseResult = optimizeExtendedVacations(days, numberOfDays)
      break
    default:
      baseResult = optimizeBalanced(days, numberOfDays)
  }

  markBreaks(baseResult)
  const result = baseResult.filter(day => day.date.startsWith('2025'))

  // Validate
  const finalCTOCount = result.filter(day => day.isCTO).length
  if (finalCTOCount !== numberOfDays) {
    throw new Error(`Optimization failed: final result has ${finalCTOCount} CTO days, expected ${numberOfDays}`)
  }

  return result
}

// Add a new function for getting alternatives
export function getOptimizationAlternatives(
  numberOfDays: number,
  strategy: OptimizationStrategy = 'balanced'
): OptimizationResult {
  // Initialize the calendar
  const startDate = new Date(2024, 11, 1)
  const daysToMap = 365 + 31
  const days: OptimizedDay[] = []

  // Map out all days
  for (let i = 0; i < daysToMap; i++) {
    const currentDate = addDays(startDate, i)
    const isWeekendDay = isWeekend(currentDate)
    const { isHoliday: isHolidayDay, name: holidayName } = isHoliday(currentDate)
    const dateStr = format(currentDate, 'yyyy-MM-dd')

    days.push({
      date: dateStr,
      isWeekend: isWeekendDay,
      isCTO: false,
      isPartOfBreak: isHolidayDay,
      isHoliday: isHolidayDay,
      holidayName
    })
  }

  // Get base result
  const baseResult = optimizeCtoDays(numberOfDays, strategy)
  const baseBreaks = getBreakSummaries(baseResult)
  
  // Generate alternatives
  const options: OptimizationOption[] = [{
    days: baseResult,
    score: 100,  // Base score for the primary solution
    description: generateDescription(baseBreaks),
    breaks: baseBreaks,
    seasonalScore: baseBreaks.reduce((sum, b) => sum + getSeasonalScore(b.startDate), 0)
  }]

  // For each significant break, try to find alternatives
  const usedConfigurations = new Set<string>()
  usedConfigurations.add(JSON.stringify(baseBreaks))

  for (const breakToReplace of baseBreaks) {
    if (breakToReplace.ctoDaysUsed >= 2) {  // Only find alternatives for breaks using 2+ days
      const usedDates = new Set<string>()
      
      // Mark dates used by other breaks as unavailable
      for (const otherBreak of baseBreaks) {
        if (otherBreak !== breakToReplace) {
          let start = parse(otherBreak.startDate, 'yyyy-MM-dd', new Date())
          let end = parse(otherBreak.endDate, 'yyyy-MM-dd', new Date())
          for (let d = start; d <= end; d = addDays(d, 1)) {
            usedDates.add(format(d, 'yyyy-MM-dd'))
          }
        }
      }

      // Try to find alternative configurations
      const altConfig = findAlternativeConfiguration(days, breakToReplace, usedDates)
      if (altConfig) {
        markBreaks(altConfig)
        const alt2025 = altConfig.filter(day => day.date.startsWith('2025'))
        const altBreaks = getBreakSummaries(alt2025)
        
        // Only add if this is a significantly different configuration
        const altKey = JSON.stringify(altBreaks)
        if (!usedConfigurations.has(altKey)) {
          usedConfigurations.add(altKey)
          options.push({
            days: alt2025,
            score: 95,  // Slightly lower score for alternatives
            description: generateDescription(altBreaks),
            breaks: altBreaks,
            seasonalScore: altBreaks.reduce((sum, b) => sum + getSeasonalScore(b.startDate), 0)
          })
        }
      }
    }
  }

  // Sort options by seasonal score and then by base score
  options.sort((a, b) => {
    if (a.seasonalScore !== b.seasonalScore) {
      return b.seasonalScore - a.seasonalScore
    }
    return b.score - a.score
  })

  return {
    options,
    description: `Found ${options.length} possible configurations for your ${numberOfDays} CTO days`
  }
} 