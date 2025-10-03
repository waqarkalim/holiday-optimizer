import { OptimizationStats, OptimizedDay } from '@/types';
import { CalendarLegend } from '@/shared/components/ui/calendar/CalendarLegend';
import { MONTHS, WEEKDAYS } from '@/constants';
import { MonthCalendar } from '@/shared/components/ui/calendar/MonthCalendar';
import { AlertCircle, Calendar } from 'lucide-react';
import { format, getDay, parse } from 'date-fns';
import { SectionCard } from '@/shared/components/ui/section-card';

interface CalendarViewProps {
  stats: OptimizationStats;
  optimizedDays: OptimizedDay[];
  selectedYear: number;
}

const buildWeekendLegendLabel = (days: OptimizedDay[]) => {
  const weekendDayNumbers = new Set<number>();

  days.forEach(day => {
    if (!day.isWeekend) {
      return;
    }
    const parsed = parse(day.date, 'yyyy-MM-dd', new Date());
    weekendDayNumbers.add(getDay(parsed));
  });

  if (weekendDayNumbers.size === 0) {
    return undefined;
  }

  const names = WEEKDAYS.reduce<string[]>((acc, label, index) => {
    if (weekendDayNumbers.has(index)) {
      acc.push(label);
    }
    return acc;
  }, []);

  if (names.length === 0) {
    return undefined;
  }

  if (names.length === 1) {
    return `Normal Weekend (${names[0]})`;
  }

  const last = names[names.length - 1];
  const initial = names.slice(0, -1);
  return `Normal Weekend (${initial.join(', ')} & ${last})`;
};

export const CalendarView = ({ stats, optimizedDays, selectedYear }: CalendarViewProps) => {
  // Get today's date and format it nicely
  const today = new Date();
  const formattedDate = format(today, 'MMMM d, yyyy');
  const currentYear = today.getFullYear();
  const isCurrentYear = selectedYear === currentYear;

  const weekendLegendLabel = buildWeekendLegendLabel(optimizedDays);
  const hasWeekendDays = optimizedDays.some(day => day.isWeekend);

  return (
    <SectionCard
      title="Calendar View"
      subtitle={
        isCurrentYear
          ? `From today until the end of ${selectedYear}`
          : `Full year view for ${selectedYear}`
      }
      icon={<Calendar className="h-4 w-4 text-gray-600" />}
    >
      {/* Optimization Timeframe Notice - Only show for current year */}
      {isCurrentYear && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Optimization begins from today ({formattedDate})</p>
            <p className="text-xs mt-1 text-blue-700">
              Past dates are grayed out and not considered in the optimization. This ensures your
              vacation planning is practical and forward-looking.
            </p>
          </div>
        </div>
      )}

      {/* For future years, show a different message */}
      {!isCurrentYear && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-green-50 rounded-lg text-green-800 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Planning for {selectedYear}</p>
            <p className="text-xs mt-1 text-green-700">
              You&apos;re viewing the optimization for the entire {selectedYear} calendar year. Plan
              ahead by selecting the most advantageous days for your time off.
            </p>
          </div>
        </div>
      )}

      <CalendarLegend
        hasPTODays={stats.totalPTODays > 0}
        hasHolidays={stats.totalPublicHolidays > 0}
        hasCompanyDaysOff={stats.totalCompanyDaysOff > 0}
        hasExtendedWeekends={stats.totalExtendedWeekends > 0}
        hasWeekends={hasWeekendDays}
        weekendLabel={weekendLegendLabel}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {MONTHS.map((_, index) => (
          <MonthCalendar key={index} month={index} year={selectedYear} days={optimizedDays} />
        ))}
      </div>
    </SectionCard>
  );
};
