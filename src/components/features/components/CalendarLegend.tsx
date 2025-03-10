import { cn, dayTypeToColorScheme, DayType } from '@/lib/utils';
import { COLOR_SCHEMES } from '@/constants';
import { Info } from 'lucide-react';

interface LegendItemProps {
  dayType: DayType;
  label: string;
  priority: number; // For semantic ordering based on importance
}

function LegendItem({ dayType, label }: LegendItemProps) {
  const colorScheme = dayTypeToColorScheme[dayType];
  
  return (
    <li 
      className="flex items-center space-x-2.5 px-3 py-2 rounded-md 
                focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800/30"
      aria-label={`${label} calendar day type`}
    >
      <div className={cn(
        "w-5 h-5 rounded-md flex-shrink-0",
        COLOR_SCHEMES[colorScheme].calendar.bg,
        "ring-1 ring-gray-200/80 dark:ring-gray-700/80 shadow-sm"
      )} />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </li>
  )
}

// Group types for cognitive organization
type DayTypeGroup = 'holiday' | 'weekend' | 'time-off';

// Map day types to their category groups for better information architecture
const getDayTypeGroup = (dayType: DayType): DayTypeGroup => {
  switch(dayType) {
    case 'publicHoliday':
    case 'companyDayOff':
      return 'holiday';
    case 'weekend': 
      return 'weekend';
    case 'pto':
      return 'time-off';
    default:
      return 'weekend';
  }
};

interface CalendarLegendProps {
  hasPTODays?: boolean
  hasHolidays?: boolean
  hasCompanyDaysOff?: boolean
  hasExtendedWeekends?: boolean
  hasWeekends?: boolean
}

export function CalendarLegend({ 
  hasPTODays = false,
  hasHolidays = false,
  hasCompanyDaysOff = false,
  hasExtendedWeekends = false,
  hasWeekends = false
}: CalendarLegendProps) {
  // Define legend items with priority for importance-based visual hierarchy
  const legendItems: LegendItemProps[] = [
    hasPTODays && {
      dayType: 'pto',
      label: "PTO Day",
      priority: 4
    },
    hasHolidays && {
      dayType: 'publicHoliday',
      label: "Public Holiday",
      priority: 1
    },
    hasCompanyDaysOff && {
      dayType: 'companyDayOff',
      label: "Company Day Off",
      priority: 2
    },
    hasExtendedWeekends && {
      dayType: 'weekend',
      label: "Extended Weekend",
      priority: 3
    },
    hasWeekends && !hasExtendedWeekends && {
      dayType: 'weekend',
      label: "Normal Weekend",
      priority: 5
    },
    // If both regular and extended weekends exist, show both
    hasWeekends && hasExtendedWeekends && {
      dayType: 'weekend',
      label: "Normal Weekend",
      priority: 5
    }
  ].filter((item): item is LegendItemProps => Boolean(item));

  // Sort by priority for cognitive processing order
  legendItems.sort((a, b) => a.priority - b.priority);

  if (legendItems.length === 0) return null;

  // Group items by category for better organization based on Gestalt principles
  const groupedItems: Record<DayTypeGroup, LegendItemProps[]> = {
    'holiday': [],
    'weekend': [],
    'time-off': []
  };

  legendItems.forEach(item => {
    const group = getDayTypeGroup(item.dayType);
    groupedItems[group].push(item);
  });

  // Flatten for rendering while maintaining cognitive grouping
  const orderedGroups: DayTypeGroup[] = ['holiday', 'weekend', 'time-off'];
  const flattenedItems = orderedGroups.flatMap(group => groupedItems[group]);

  return (
    <div className={cn(
      "mb-5 bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden",
      "ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm",
      "transition-all duration-200"
    )}>
      {/* Header with visual hierarchy using size, weight and color */}
      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/70 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          Calendar Legend
        </h3>
      </div>
      
      {/* Content area with proper spacing for cognitive breathing room */}
      <div className="p-3">
        <ul
          aria-label="Calendar day types" 
          className={cn(
            "grid gap-1",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          )}
        >
          {flattenedItems.map((item, index) => (
            <LegendItem
              key={`${item.label}-${index}`}
              dayType={item.dayType}
              label={item.label}
              priority={item.priority}
            />
          ))}
        </ul>
      </div>
    </div>
  )
} 