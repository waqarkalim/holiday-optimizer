import { cn } from '@/lib/utils';

interface LegendItemProps {
  color: string
  darkColor: string
  label: string
}

function LegendItem({ color, darkColor, label }: LegendItemProps) {
  return (
    <div className="flex items-center space-x-1.5">
      <div className={cn(
        "w-4 h-4 rounded-md border",
        color,
        `dark:${darkColor}`,
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
      color: "bg-green-100",
      darkColor: "bg-green-900/50",
      label: "CTO Day"
    },
    hasHolidays && {
      color: "bg-amber-100",
      darkColor: "bg-amber-900/50",
      label: "Public Holiday"
    },
    hasCompanyDaysOff && {
      color: "bg-violet-100",
      darkColor: "bg-violet-900/50",
      label: "Company Day Off"
    },
    hasExtendedWeekends && {
      color: "bg-teal-100",
      darkColor: "bg-teal-900/50",
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
            color={item.color}
            darkColor={item.darkColor}
            label={item.label}
          />
        ))}
      </div>
    </div>
  )
} 