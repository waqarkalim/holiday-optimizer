import { eachDayOfInterval, endOfMonth, format, getDay, getMonth, parse, startOfMonth, isPast, startOfDay, isToday } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { OptimizedDay } from '@/types';
import { cn, getDayTypeClasses, DayType } from '@/lib/utils';

interface MonthCalendarProps {
  month: number
  year: number
  days: OptimizedDay[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function MonthCalendar({ month, year, days }: MonthCalendarProps) {
  const firstDay = startOfMonth(new Date(year, month))
  const lastDay = endOfMonth(firstDay)
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startingDayIndex = getDay(firstDay)

  // Check if any day types exist in the data
  const hasCTODays = days.some(day => day.isCTO)
  const hasPublicHoliday = days.some(day => day.isPublicHoliday)
  const hasCompanyDaysOff = days.some(day => day.isCompanyDayOff)
  const hasExtendedWeekends = days.some(day => day.isPartOfBreak && day.isWeekend)

  // Create calendar grid with empty cells for proper alignment
  const calendarDays = Array(35).fill(null)
  daysInMonth.forEach((date, index) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const day = days.find(d => d.date === dateStr)
    calendarDays[startingDayIndex + index] = day || {
      date: dateStr,
      isWeekend: getDay(date) === 0 || getDay(date) === 6,
      isCTO: false,
      isPartOfBreak: false
    }
  })

  // Get holidays for the current month
  const holidays = days.filter(day => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    return day.isPublicHoliday && getMonth(date) === month
  })

  // Helper function to determine day type
  const getDayType = (day: OptimizedDay): DayType => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    
    // Order of precedence: Company Days > Public Holidays > Extended Weekends > CTO Days
    if (hasCompanyDaysOff && day.isCompanyDayOff) return 'companyDayOff'
    if (hasPublicHoliday && day.isPublicHoliday) return 'publicHoliday'
    if (hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) return 'weekend'
    if (hasCTODays && day.isCTO) return 'cto'
    return 'default'
  }

  const getDayColor = (day: OptimizedDay) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    
    // If it's today, return a special background
    if (isToday(date)) {
      return 'bg-blue-50 dark:bg-blue-900/30'
    }
    
    // If the date is in the past, return a muted background
    if (isPast(startOfDay(date))) {
      return 'bg-gray-100 dark:bg-gray-800/30'
    }
    
    // Use the centralized color system
    return getDayTypeClasses(getDayType(day), 'bg')
  }

  const getDayTextColor = (day: OptimizedDay) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    
    // If it's today, return a special text color
    if (isToday(date)) {
      return 'text-blue-600 dark:text-blue-300 font-bold'
    }
    
    // If the date is in the past, return a muted text color
    if (isPast(startOfDay(date))) {
      return 'text-gray-400 dark:text-gray-500'
    }
    
    // Use the centralized color system
    return getDayTypeClasses(getDayType(day), 'text')
  }

  const getDayTooltip = (day: OptimizedDay) => {
    const date = parse(day.date, 'yyyy-MM-dd', new Date())
    
    // If it's today, show "Today"
    if (isToday(date)) {
      return 'Today'
    }
    
    // If the date is in the past, return an explanation
    if (isPast(startOfDay(date))) {
      return 'Past dates are not considered in the optimization'
    }
    
    // Order of precedence: Company Days > Public Holidays > Extended Weekends > CTO Days
    if (hasCompanyDaysOff && day.isCompanyDayOff) return day.companyDayName || 'Company Day Off'
    if (hasPublicHoliday && day.isPublicHoliday) return day.publicHolidayName || 'Public Holiday'
    if (hasExtendedWeekends && day.isPartOfBreak && day.isWeekend) return 'Extended Weekend'
    if (hasCTODays && day.isCTO) return 'CTO Day'
    return ''
  }

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700">
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 leading-none">
          {format(firstDay, 'MMMM yyyy')}
        </h4>
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 min-h-[1.25rem]">
          {holidays.length > 0 && (
            <>Holidays: {holidays.map(h => h.publicHolidayName).join(', ')}</>
          )}
        </div>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                'aspect-square p-1 text-xs relative',
                !day && 'bg-gray-50 dark:bg-gray-800/30',
                day?.isPartOfBreak && 'font-semibold'
              )}
            >
              {day && (
                <>
                  <div 
                    className={cn(
                      'absolute inset-0.5 rounded-md',
                      getDayColor(day),
                      isToday(parse(day.date, 'yyyy-MM-dd', new Date())) && 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-sm'
                    )}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={cn(
                        'absolute inset-0 flex items-center justify-center font-medium z-10 text-xs',
                        getDayTextColor(day)
                      )}>
                        {format(parse(day.date, 'yyyy-MM-dd', new Date()), 'd')}
                      </div>
                    </TooltipTrigger>
                    {getDayTooltip(day) && (
                      <TooltipContent>
                        <p className="text-xs">{getDayTooltip(day)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  {/* Holiday Indicator Dot */}
                  {hasPublicHoliday && day.isPublicHoliday && (
                    <div className={cn(
                      "absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full",
                      getDayTypeClasses('publicHoliday', 'text')
                    )} />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 