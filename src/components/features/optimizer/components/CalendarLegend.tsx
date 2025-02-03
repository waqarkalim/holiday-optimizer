interface LegendItemProps {
  color: string
  darkColor: string
  label: string
}

function LegendItem({ color, darkColor, label }: LegendItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-6 h-6 rounded-lg ${color} dark:${darkColor} border border-${color.replace('bg-', '')}-200 dark:border-${darkColor.replace('bg-', '')}-700`} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  )
}

export function CalendarLegend() {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800/50 rounded-lg p-4 ring-1 ring-blue-900/5 dark:ring-blue-400/5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LegendItem
          color="bg-teal-100"
          darkColor="bg-teal-900/50"
          label="CTO Day"
        />
        <LegendItem
          color="bg-amber-100"
          darkColor="bg-amber-900/50"
          label="Public Holiday"
        />
        <LegendItem
          color="bg-emerald-100"
          darkColor="bg-emerald-900/50"
          label="Custom Day Off"
        />
        <LegendItem
          color="bg-violet-100"
          darkColor="bg-violet-900/50"
          label="Extended Weekend"
        />
      </div>
    </div>
  )
} 