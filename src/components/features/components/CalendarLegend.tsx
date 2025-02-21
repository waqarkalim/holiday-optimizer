interface LegendItemProps {
  color: string
  darkColor: string
  label: string
}

function LegendItem({ color, darkColor, label }: LegendItemProps) {
  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-4 h-4 rounded-md ${color} dark:${darkColor} border border-${color.replace('bg-', '')}-200 dark:border-${darkColor.replace('bg-', '')}-700`} />
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  )
}

interface CalendarLegendProps {
  hasCTODays?: boolean
  hasHolidays?: boolean
  hasCustomDaysOff?: boolean
  hasExtendedWeekends?: boolean
}

export function CalendarLegend({ 
  hasCTODays = false,
  hasHolidays = false,
  hasCustomDaysOff = false,
  hasExtendedWeekends = false 
}: CalendarLegendProps) {
  const legendItems: LegendItemProps[] = [
    hasCTODays && {
      color: "bg-teal-100",
      darkColor: "bg-teal-900/50",
      label: "CTO Day"
    },
    hasHolidays && {
      color: "bg-amber-100",
      darkColor: "bg-amber-900/50",
      label: "Public Holiday"
    },
    hasCustomDaysOff && {
      color: "bg-emerald-100",
      darkColor: "bg-emerald-900/50",
      label: "Custom Day Off"
    },
    hasExtendedWeekends && {
      color: "bg-violet-100",
      darkColor: "bg-violet-900/50",
      label: "Extended Weekend"
    }
  ].filter((item): item is LegendItemProps => Boolean(item))

  if (legendItems.length === 0) return null

  return (
    <div className="mb-3 bg-white dark:bg-gray-800/50 rounded-lg p-2.5 ring-1 ring-blue-900/5 dark:ring-blue-400/5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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