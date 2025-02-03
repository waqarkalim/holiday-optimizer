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

  // Process each day
  days.forEach((day, index) => {
    if (isBreakDay(day)) {
      currentBreak.push(day)
    } else if (currentBreak.length > 0) {
      // End of a break
      if (currentBreak.length >= 3) {
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
    }
  })

  // Handle break at the end of the array
  if (currentBreak.length >= 3) {
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