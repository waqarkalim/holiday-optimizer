import { useMemo } from 'react';
import { OptimizationStats, OptimizedDay } from '@/types';
import { CalendarLegend } from '@/shared/components/ui/calendar/CalendarLegend';
import { WEEKDAYS } from '@/constants';
import { MonthCalendar } from '@/shared/components/ui/calendar/MonthCalendar';
import { Calendar } from 'lucide-react';
import { addMonths, format, getDay, parse, startOfMonth } from 'date-fns';
import { SectionCard } from '@/shared/components/ui/section-card';

interface CalendarViewProps {
  stats: OptimizationStats;
  optimizedDays: OptimizedDay[];
  selectedYear: number;
  customStartDate?: string;
  customEndDate?: string;
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

export const CalendarView = ({
  stats,
  optimizedDays,
  selectedYear,
  customStartDate,
  customEndDate
}: CalendarViewProps) => {
  const weekendLegendLabel = buildWeekendLegendLabel(optimizedDays);
  const hasWeekendDays = optimizedDays.some(day => day.isWeekend);

  const monthBuckets = useMemo(() => {
    // Use custom dates if available, otherwise fall back to optimized days
    if (customStartDate && customEndDate) {
      const firstDate = parse(customStartDate, 'yyyy-MM-dd', new Date());
      const lastDate = parse(customEndDate, 'yyyy-MM-dd', new Date());

      const buckets: Array<{ month: number; year: number }> = [];
      for (
        let cursor = startOfMonth(firstDate);
        cursor <= lastDate;
        cursor = addMonths(cursor, 1)
      ) {
        buckets.push({ month: cursor.getMonth(), year: cursor.getFullYear() });
      }

      return buckets;
    }

    // Fallback to optimized days if no custom dates
    if (optimizedDays.length === 0) {
      return [] as Array<{ month: number; year: number }>;
    }

    const firstDate = parse(optimizedDays[0].date, 'yyyy-MM-dd', new Date());
    const lastDate = parse(optimizedDays[optimizedDays.length - 1].date, 'yyyy-MM-dd', new Date());

    const buckets: Array<{ month: number; year: number }> = [];
    for (
      let cursor = startOfMonth(firstDate);
      cursor <= lastDate;
      cursor = addMonths(cursor, 1)
    ) {
      buckets.push({ month: cursor.getMonth(), year: cursor.getFullYear() });
    }

    return buckets;
  }, [optimizedDays, customStartDate, customEndDate]);

  const timeframeLabel = useMemo(() => {
    if (customStartDate && customEndDate) {
      const start = parse(customStartDate, 'yyyy-MM-dd', new Date());
      const end = parse(customEndDate, 'yyyy-MM-dd', new Date());
      return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
    }
    return null;
  }, [customStartDate, customEndDate]);

  return (
    <SectionCard
      title="Calendar View"
      subtitle={timeframeLabel || `Planning for ${selectedYear}`}
      icon={<Calendar className="h-4 w-4 text-gray-600" />}
    >

      <CalendarLegend
        hasPTODays={stats.totalPTODays > 0}
        hasHolidays={stats.totalPublicHolidays > 0}
        hasCompanyDaysOff={stats.totalCompanyDaysOff > 0}
        hasExtendedWeekends={stats.totalExtendedWeekends > 0}
        hasWeekends={hasWeekendDays}
        weekendLabel={weekendLegendLabel}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {monthBuckets.map(bucket => (
          <MonthCalendar
            key={`${bucket.year}-${bucket.month}`}
            month={bucket.month}
            year={bucket.year}
            days={optimizedDays}
          />
        ))}
      </div>
    </SectionCard>
  );
};
