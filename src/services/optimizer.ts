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

// Update holiday definitions to be dynamic
function getHolidaysForYear(year: number) {
  return [
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
}

// Update isHoliday function to use dynamic holidays
function isHoliday(date: Date, holidays: { date: string, name: string }[]): { isHoliday: boolean; name?: string } {
  const formattedDate = format(date, 'yyyy-MM-dd')
  const holiday = holidays.find(h => h.date === formattedDate)
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

function findAllPossibleBreaks(days: OptimizedDay[], year: number): Break[] {
  const breaks: Break[] = []
  let i = 0

  while (i < days.length) {
    if (!days[i].date.startsWith(year.toString())) {
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

function optimizeLongWeekends(days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))
  let remainingDays = numberOfDays

  // Get all potential long weekend breaks (3-4 days total, 1-2 CTO days)
  const longWeekendBreaks = findAllPossibleBreaks(result, year)
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
        if (!day.date.startsWith(year.toString()) ||
          day.isWeekend ||
          day.isHoliday ||
          usedDays.has(day.date)) return false
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        const dayOfWeek = getDay(date)
        return dayOfWeek === 1 || dayOfWeek === 5
      })
      .sort((a, b) => {
        const scoreA = isNearHoliday(days, a.index, 2, year) ? 1 : 0
        const scoreB = isNearHoliday(days, b.index, 2, year) ? 1 : 0
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
      if (days[i].date.startsWith(year.toString()) &&
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

function optimizeWeekLongBreaks(days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))
  let remainingDays = numberOfDays

  // Find all potential week-long breaks (5-9 days total, 2-7 CTO days)
  const weekBreaks = findAllPossibleBreaks(result, year)
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
      // Sort by efficiency (break length / CTO days needed)
      const aEfficiency = a.length / a.ctoDaysNeeded
      const bEfficiency = b.length / b.ctoDaysNeeded
      // Break ties by preferring breaks with holidays
      if (aEfficiency === bEfficiency) {
        return b.holidaysIncluded - a.holidaysIncluded
      }
      return bEfficiency - aEfficiency
    })

  // Track used days
  const usedDays = new Set<string>()

  // Take the most efficient week-long breaks
  for (const breakPeriod of weekBreaks) {
    if (remainingDays <= 0) break

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

  // If we still have days, try to find smaller week-long breaks
  if (remainingDays > 0) {
    const smallerBreaks = findAllPossibleBreaks(result, year)
      .filter(b => {
        // Look for 5-day breaks that use remaining days
        if (b.length < 5 || b.length > 5) return false
        if (b.ctoDaysNeeded > remainingDays) return false
        // Check for overlap with used days
        let hasOverlap = false
        let startDate = parse(b.startDate, 'yyyy-MM-dd', new Date())
        let endDate = parse(b.endDate, 'yyyy-MM-dd', new Date())
        for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
          if (usedDays.has(format(d, 'yyyy-MM-dd'))) {
            hasOverlap = true
            break
          }
        }
        return !hasOverlap
      })
      .sort((a, b) => {
        // Prioritize breaks near holidays
        return b.holidaysIncluded - a.holidaysIncluded
      })

    for (const breakPeriod of smallerBreaks) {
      if (remainingDays <= 0) break

      let startDate = parse(breakPeriod.startDate, 'yyyy-MM-dd', new Date())
      let endDate = parse(breakPeriod.endDate, 'yyyy-MM-dd', new Date())

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

  // If we still have days, use them on individual days near existing breaks
  if (remainingDays > 0) {
    const workdays = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => {
        if (!day.date.startsWith(year.toString()) || 
            day.isWeekend || 
            day.isHoliday || 
            usedDays.has(day.date)) return false
        // Check if this day is near an existing break
        const date = parse(day.date, 'yyyy-MM-dd', new Date())
        for (let d = -2; d <= 2; d++) {
          const checkDate = format(addDays(date, d), 'yyyy-MM-dd')
          if (usedDays.has(checkDate)) return true
        }
        return false
      })
      .sort((a, b) => {
        const dateA = parse(a.day.date, 'yyyy-MM-dd', new Date())
        const dateB = parse(b.day.date, 'yyyy-MM-dd', new Date())
        return dateA.getTime() - dateB.getTime()
      })

    for (const { index } of workdays) {
      if (remainingDays <= 0) break
      result[index].isCTO = true
      usedDays.add(days[index].date)
      remainingDays--
    }
  }

  // Use any remaining days on available workdays
  if (remainingDays > 0) {
    for (let i = 0; i < days.length && remainingDays > 0; i++) {
      if (days[i].date.startsWith(year.toString()) &&
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

function optimizeExtendedVacations(days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))
  let remainingDays = numberOfDays

  // Find all potential extended breaks (10-15 days total, 6-10 CTO days)
  const extendedBreaks = findAllPossibleBreaks(result, year)
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
      // Break ties by preferring breaks with holidays
      if (aEfficiency === bEfficiency) {
        return b.holidaysIncluded - a.holidaysIncluded
      }
      return bEfficiency - aEfficiency
    })

  // Track used days
  const usedDays = new Set<string>()

  // Take the best extended breaks
  for (const breakPeriod of extendedBreaks) {
    if (remainingDays <= 0) break

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

  // Use remaining days for week-long breaks
  if (remainingDays >= 2) {
    const weekBreakResult = optimizeWeekLongBreaks(result, remainingDays, year)
    for (let i = 0; i < days.length; i++) {
      if (weekBreakResult[i].isCTO && !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        remainingDays--
      }
    }
  }

  // Use any remaining days for long weekends
  if (remainingDays > 0) {
    const longWeekendResult = optimizeLongWeekends(days, remainingDays, year)
    for (let i = 0; i < days.length; i++) {
      if (longWeekendResult[i].isCTO && !usedDays.has(days[i].date)) {
        result[i].isCTO = true
        remainingDays--
      }
    }
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

function optimizeBalanced(days: OptimizedDay[], numberOfDays: number, year: number): OptimizedDay[] {
  const result = days.map(d => ({ ...d }))

  // Divide days into different categories
  const longWeekendDays = Math.floor(numberOfDays * 0.4)  // 40% for long weekends
  const weekBreakDays = Math.floor(numberOfDays * 0.4)    // 40% for week breaks
  const extendedBreakDays = numberOfDays - longWeekendDays - weekBreakDays  // Remainder for extended breaks

  // Create separate copies for each strategy
  const longWeekendResult = optimizeLongWeekends(days, longWeekendDays, year)
  const weekBreakResult = optimizeWeekLongBreaks(days, weekBreakDays, year)
  const extendedResult = optimizeExtendedVacations(days, extendedBreakDays, year)

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
      if (days[i].date.startsWith(year.toString()) &&
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

function isNearHoliday(days: OptimizedDay[], index: number, range: number = 2, year: number): boolean {
  for (let i = Math.max(0, index - range); i <= Math.min(days.length - 1, index + range); i++) {
    if (days[i].isHoliday) return true
  }
  return false
}

function useRemainingCTODays(
  days: OptimizedDay[],
  usedDates: Set<string>,
  remainingDays: number,
  year: number,
  preferredDayTypes: ('nearBreak' | 'nearHoliday' | 'monFri' | 'any')[] = ['nearBreak', 'nearHoliday', 'monFri', 'any']
): number {
  let daysLeft = remainingDays
  let daysUsed = 0
  
  // First try with preferred day types
  for (const dayType of preferredDayTypes) {
    if (daysLeft <= 0) break

    let candidates = days
      .map((day, index) => ({ day, index }))
      .filter(({ day }) => 
        day.date.startsWith(year.toString()) &&
        !day.isWeekend &&
        !day.isHoliday &&
        !usedDates.has(day.date) &&
        !day.isCTO
      )

    // Apply additional filters based on day type
    switch (dayType) {
      case 'nearBreak':
        candidates = candidates.filter(({ day, index }) => {
          const date = parse(day.date, 'yyyy-MM-dd', new Date())
          const prevDay = format(addDays(date, -1), 'yyyy-MM-dd')
          const nextDay = format(addDays(date, 1), 'yyyy-MM-dd')
          const prevPrevDay = format(addDays(date, -2), 'yyyy-MM-dd')
          const nextNextDay = format(addDays(date, 2), 'yyyy-MM-dd')
          return usedDates.has(prevDay) || usedDates.has(nextDay) ||
                 usedDates.has(prevPrevDay) || usedDates.has(nextNextDay) ||
                 days[index - 1]?.isHoliday || days[index + 1]?.isHoliday ||
                 days[index - 2]?.isHoliday || days[index + 2]?.isHoliday
        })
        break
      case 'nearHoliday':
        candidates = candidates.filter(({ day, index }) => isNearHoliday(days, index, 5, year))
        break
      case 'monFri':
        candidates = candidates.filter(({ day }) => {
          const date = parse(day.date, 'yyyy-MM-dd', new Date())
          const dayOfWeek = getDay(date)
          return dayOfWeek === 1 || dayOfWeek === 5 || dayOfWeek === 2 || dayOfWeek === 4
        })
        break
    }

    // Sort candidates by preference
    candidates.sort((a, b) => {
      // Prioritize days that would connect existing breaks
      const aConnects = doesDayConnectBreaks(days, a.index, usedDates)
      const bConnects = doesDayConnectBreaks(days, b.index, usedDates)
      if (aConnects !== bConnects) return bConnects ? 1 : -1

      // Then prioritize by date (earlier dates first)
      return parse(a.day.date, 'yyyy-MM-dd', new Date()).getTime() -
             parse(b.day.date, 'yyyy-MM-dd', new Date()).getTime()
    })

    // Use the best candidates
    for (const { day, index } of candidates) {
      if (daysLeft <= 0) break
      days[index].isCTO = true
      usedDates.add(day.date)
      daysLeft--
      daysUsed++
    }
  }

  return daysUsed
}

function doesDayConnectBreaks(days: OptimizedDay[], index: number, usedDates: Set<string>): boolean {
  const date = parse(days[index].date, 'yyyy-MM-dd', new Date())
  const prevDay = format(addDays(date, -1), 'yyyy-MM-dd')
  const prevPrevDay = format(addDays(date, -2), 'yyyy-MM-dd')
  const nextDay = format(addDays(date, 1), 'yyyy-MM-dd')
  const nextNextDay = format(addDays(date, 2), 'yyyy-MM-dd')

  // Check if this day would connect two breaks
  const hasPrevBreak = usedDates.has(prevPrevDay) || days[index - 2]?.isHoliday || days[index - 2]?.isWeekend
  const hasNextBreak = usedDates.has(nextNextDay) || days[index + 2]?.isHoliday || days[index + 2]?.isWeekend

  return hasPrevBreak && hasNextBreak
}

function markExtendedWeekends(days: OptimizedDay[]): void {
  // First pass: mark weekends that are part of breaks
  days.forEach((day, index) => {
    if (day.isWeekend && day.isPartOfBreak) {
      // If this is a Saturday, also ensure Sunday is marked
      if (parse(day.date, 'yyyy-MM-dd', new Date()).getDay() === 6) {
        const nextDay = days[index + 1]
        if (nextDay) {
          nextDay.isPartOfBreak = true
        }
      }
      // If this is a Sunday, also ensure Saturday is marked
      if (parse(day.date, 'yyyy-MM-dd', new Date()).getDay() === 0) {
        const prevDay = days[index - 1]
        if (prevDay) {
          prevDay.isPartOfBreak = true
        }
      }
    }
  })

  // Second pass: mark weekends extended by holidays
  days.forEach((day, index) => {
    if (day.isWeekend) {
      const prevDay = days[index - 1]
      const nextDay = days[index + 1]
      const isExtendedByHoliday = prevDay?.isHoliday || nextDay?.isHoliday

      if (isExtendedByHoliday) {
        day.isPartOfBreak = true
        // If this is a Saturday, also mark Sunday
        if (parse(day.date, 'yyyy-MM-dd', new Date()).getDay() === 6 && nextDay) {
          nextDay.isPartOfBreak = true
        }
        // If this is a Sunday, also mark Saturday
        if (parse(day.date, 'yyyy-MM-dd', new Date()).getDay() === 0 && prevDay) {
          prevDay.isPartOfBreak = true
        }
      }
    }
  })
}

export function optimizeCtoDays(
  numberOfDays: number,
  strategy: OptimizationStrategy,
  year: number = new Date().getFullYear()
): { days: OptimizedDay[] } {
  if (numberOfDays <= 0) {
    throw new Error('Number of CTO days must be greater than 0')
  }

  // Get holidays for the specified year
  const holidays = getHolidaysForYear(year)

  // Initialize the calendar
  const startDate = new Date(year - 1, 11, 1) // Start from December of previous year
  const daysToMap = 365 + 31
  const days: OptimizedDay[] = []

  // Map out all days
  for (let i = 0; i < daysToMap; i++) {
    const currentDate = addDays(startDate, i)
    const isWeekendDay = isWeekend(currentDate)
    const { isHoliday: isHolidayDay, name: holidayName } = isHoliday(currentDate, holidays)
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

  // Count available workdays for the specified year
  const availableWorkdays = days.filter(day =>
    !day.isWeekend &&
    !day.isHoliday &&
    day.date.startsWith(year.toString())
  ).length

  if (availableWorkdays < numberOfDays) {
    throw new Error(`Not enough workdays available in ${year}. Requested ${numberOfDays} CTO days but only ${availableWorkdays} workdays available.`)
  }

  // Apply strategy-specific optimization
  let result: OptimizedDay[]
  switch (strategy) {
    case 'longWeekends':
      result = optimizeLongWeekends(days, numberOfDays, year)
      break
    case 'weekLongBreaks':
      result = optimizeWeekLongBreaks(days, numberOfDays, year)
      break
    case 'extendedVacations':
      result = optimizeExtendedVacations(days, numberOfDays, year)
      break
    default:
      result = optimizeBalanced(days, numberOfDays, year)
  }

  // Mark breaks and extended weekends
  markBreaks(result)
  markExtendedWeekends(result)

  // Return only days for the specified year
  return { days: result.filter(day => day.date.startsWith(year.toString())) }
} 