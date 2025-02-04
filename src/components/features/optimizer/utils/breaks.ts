import { OptimizedDay } from '@/services/optimizer'

export interface Break {
  startDate: string
  endDate: string
  days: OptimizedDay[]
  totalDays: number
  ctoDays: number
  holidays: number
  weekends: number
  customDaysOff: number
}

export function findBreaks(days: OptimizedDay[]): Break[] {
  const breaks: Break[] = []
  let currentBreak: OptimizedDay[] = []

  // Helper to check if a day is part of a break
  const isBreakDay = (day: OptimizedDay) =>
    day.isCTO || day.isHoliday || day.isWeekend || day.isCustomDayOff

  // Helper to check if a day is a workday
  const isWorkday = (day: OptimizedDay) => !isBreakDay(day)

  // Helper to get consecutive days of a certain type
  const getConsecutiveDays = (startIndex: number, type: 'break' | 'workday'): number => {
    let count = 0
    for (let i = startIndex; i < days.length; i++) {
      if ((type === 'break' && isBreakDay(days[i])) || 
          (type === 'workday' && isWorkday(days[i]))) {
        count++
      } else {
        break
      }
    }
    return count
  }

  // Helper to check if a CTO day would be better used elsewhere
  const wouldCTOBeBetterUsedElsewhere = (index: number): boolean => {
    const current = days[index]
    if (!current.isCTO) return false

    // Look ahead to see if this CTO could be better used
    for (let i = index + 1; i < Math.min(days.length, index + 10); i++) {
      const futureDay = days[i]
      if (!futureDay) continue

      // If we find a workday that's surrounded by holidays/weekends,
      // this CTO might be better used there
      if (isWorkday(futureDay)) {
        const prev = days[i - 1]
        const next = days[i + 1]
        if (prev && next && 
            (prev.isHoliday || prev.isWeekend) && 
            (next.isHoliday || next.isWeekend)) {
          return true
        }
      }
    }

    return false
  }

  // Helper to determine if we should start a new break at this position
  const shouldStartBreak = (index: number): boolean => {
    const current = days[index]
    const prev = days[index - 1]
    const next = days[index + 1]
    const nextTwo = days[index + 2]
    const nextThree = days[index + 3]

    // Don't start with a workday
    if (isWorkday(current)) return false

    // If it's a CTO day, ensure it's being used optimally
    if (current.isCTO) {
      // Must be followed by at least one non-workday
      if (!next || isWorkday(next)) return false
      
      // Don't start if previous day is a workday
      if (prev && isWorkday(prev)) return false

      // Check if this CTO could be better used elsewhere
      if (wouldCTOBeBetterUsedElsewhere(index)) return false

      // If next day is a workday, ensure it bridges to another break day
      if (next && isWorkday(next)) {
        if (!nextTwo || !isBreakDay(nextTwo)) return false
      }

      // Prefer starting breaks that lead to longer sequences
      const consecutiveBreakDays = getConsecutiveDays(index, 'break')
      if (consecutiveBreakDays < 3) return false
    }

    // If it's a weekend/holiday, only start if it leads to a meaningful break
    if (current.isWeekend || current.isHoliday) {
      // Must be followed by either another break day or a strategic CTO placement
      if (!next) return false
      
      if (isWorkday(next)) {
        // If followed by a workday, need to ensure it leads to a good break
        return nextTwo && nextThree && 
               (nextTwo.isCTO || nextTwo.isHoliday) && 
               (nextThree.isWeekend || nextThree.isHoliday)
      }
      
      return isBreakDay(next)
    }

    return false
  }

  // Helper to determine if we should continue the current break
  const shouldContinueBreak = (index: number, breakSoFar: OptimizedDay[]): boolean => {
    const current = days[index]
    const next = days[index + 1]
    const nextTwo = days[index + 2]
    const prev = breakSoFar[breakSoFar.length - 1]
    const prevPrev = breakSoFar[breakSoFar.length - 2]

    // Don't allow two consecutive workdays
    if (isWorkday(current) && isWorkday(prev)) return false

    // If it's a workday, only include it if it's optimally bridging break days
    if (isWorkday(current)) {
      // Must be bridging two break days
      if (!next || !isBreakDay(next) || !isBreakDay(prev)) return false
      
      // At least one of the break days should be a CTO or holiday
      if (!next.isCTO && !next.isHoliday && !prev.isCTO && !prev.isHoliday) return false

      // Don't bridge if it would create a suboptimal pattern
      const consecutiveBreakDays = getConsecutiveDays(index + 1, 'break')
      if (consecutiveBreakDays < 2) return false
    }

    // If it's a CTO day, ensure optimal placement
    if (current.isCTO) {
      // If previous day is a workday, must be bridging effectively
      if (isWorkday(prev)) {
        if (!prevPrev || !next || !isBreakDay(prevPrev) || !isBreakDay(next)) return false
      }

      // Check if this CTO could be better used elsewhere
      if (wouldCTOBeBetterUsedElsewhere(index)) return false

      // Ensure it leads to a meaningful sequence
      const consecutiveBreakDays = getConsecutiveDays(index, 'break')
      if (consecutiveBreakDays < 2) return false
    }

    // For any break day, ensure it's contributing to a meaningful break
    const remainingBreakDays = getConsecutiveDays(index, 'break')
    return remainingBreakDays >= 2
  }

  // Process each day
  for (let i = 0; i < days.length; i++) {
    const current = days[i]

    // If we're not in a break, check if we should start one
    if (currentBreak.length === 0) {
      if (shouldStartBreak(i)) {
        currentBreak.push(current)
      }
      continue
    }

    // If we're in a break, check if we should continue it
    if (shouldContinueBreak(i, currentBreak)) {
      currentBreak.push(current)
    } else {
      // End the current break if it's valid
      if (currentBreak.length >= 3 && currentBreak.some(d => d.isCTO)) {
        const ctoDays = currentBreak.filter(d => d.isCTO).length
        const holidays = currentBreak.filter(d => d.isHoliday).length
        const weekends = currentBreak.filter(d => d.isWeekend).length
        const customDaysOff = currentBreak.filter(d => d.isCustomDayOff).length

        breaks.push({
          startDate: currentBreak[0].date,
          endDate: currentBreak[currentBreak.length - 1].date,
          days: [...currentBreak],
          totalDays: currentBreak.length,
          ctoDays,
          holidays,
          weekends,
          customDaysOff
        })
      }
      currentBreak = []
      // Check if we should start a new break with the current day
      if (shouldStartBreak(i)) {
        currentBreak.push(current)
      }
    }
  }

  // Handle any remaining break at the end
  if (currentBreak.length >= 3 && currentBreak.some(d => d.isCTO)) {
    const ctoDays = currentBreak.filter(d => d.isCTO).length
    const holidays = currentBreak.filter(d => d.isHoliday).length
    const weekends = currentBreak.filter(d => d.isWeekend).length
    const customDaysOff = currentBreak.filter(d => d.isCustomDayOff).length

    breaks.push({
      startDate: currentBreak[0].date,
      endDate: currentBreak[currentBreak.length - 1].date,
      days: [...currentBreak],
      totalDays: currentBreak.length,
      ctoDays,
      holidays,
      weekends,
      customDaysOff
    })
  }

  return breaks
}

export function countExtendedWeekends(days: OptimizedDay[]): number {
  const breaks = findBreaks(days)
  return breaks.filter(b => b.totalDays >= 3 && b.totalDays <= 4).length
} 