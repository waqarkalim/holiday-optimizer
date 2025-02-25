import { cn, dayTypeToColorScheme, DayType } from '@/lib/utils';
import { COLOR_SCHEMES } from '@/constants';

interface LegendItemProps {
  dayType: DayType;
  label: string;
}

function LegendItem({ dayType, label }: LegendItemProps) {
  const colorScheme = dayTypeToColorScheme[dayType];
  
  return (
    <div className="flex items-center space-x-1.5">
      <div className={cn(
        "w-4 h-4 rounded-md border",
        COLOR_SCHEMES[colorScheme].calendar.bg,
        "border-gray-200 dark:border-gray-700"
      )} />
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  )
}

interface CalendarLegendProps {
  hasCTODays?: boolean
  hasHolidays?: boolean
  hasCompanyDaysOff?: boolean
  hasExtendedWeekends?: boolean
}

export function CalendarLegend({ 
  hasCTODays = false,
  hasHolidays = false,
  hasCompanyDaysOff = false,
  hasExtendedWeekends = false 
}: CalendarLegendProps) {
  const legendItems: LegendItemProps[] = [
    hasCTODays && {
      dayType: 'cto',
      label: "CTO Day"
    },
    hasHolidays && {
      dayType: 'publicHoliday',
      label: "Public Holiday"
    },
    hasCompanyDaysOff && {
      dayType: 'companyDayOff',
      label: "Company Day Off"
    },
    hasExtendedWeekends && {
      dayType: 'weekend',
      label: "Extended Weekend"
    }
  ].filter((item): item is LegendItemProps => Boolean(item))

  if (legendItems.length === 0) return null

  return (
    <div className={cn(
      "mb-3 bg-white dark:bg-gray-800/50 rounded-lg p-2.5",
      "ring-1 ring-gray-200 dark:ring-gray-700"
    )}>
      <div className={cn(
        "grid grid-cols-2 md:grid-cols-4 gap-2"
      )}>
        {legendItems.map((item) => (
          <LegendItem
            key={item.label}
            dayType={item.dayType}
            label={item.label}
          />
        ))}
      </div>
    </div>
  )
} 