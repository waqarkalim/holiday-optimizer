'use client';

import { OptimizationStats, OptimizedDay } from '@/types';
import { CalendarLegend } from '@/shared/components/ui/calendar/CalendarLegend';
import { WEEKDAYS } from '@/constants';
import { MonthCalendar } from '@/shared/components/ui/calendar/MonthCalendar';
import { AlertCircle, Calendar } from 'lucide-react';
import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  isWithinInterval,
  parse,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { SectionCard } from '@/shared/components/ui/section-card';
import { cn } from '@/shared/lib/utils';
import { useMemo, useState } from 'react';

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

const buildMonthBuckets = (
  optimizedDays: OptimizedDay[],
  customStartDate?: string,
  customEndDate?: string
) => {
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
};

const buildTimeframeLabel = (customStartDate?: string, customEndDate?: string) => {
  if (customStartDate && customEndDate) {
    const start = parse(customStartDate, 'yyyy-MM-dd', new Date());
    const end = parse(customEndDate, 'yyyy-MM-dd', new Date());
    return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
  }

  return null;
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
  const monthBuckets = buildMonthBuckets(optimizedDays, customStartDate, customEndDate);
  const calendarStart = new Date(selectedYear, 0, 1);
  const calendarEnd = new Date(selectedYear, 11, 31);
  const calendarStartString = format(calendarStart, 'yyyy-MM-dd');
  const calendarEndString = format(calendarEnd, 'yyyy-MM-dd');
  const startString = customStartDate ?? calendarStartString;
  const endString = customEndDate ?? calendarEndString;
  const usesCalendarRange = startString === calendarStartString && endString === calendarEndString;
  const timeframeLabel = usesCalendarRange ? null : buildTimeframeLabel(customStartDate, customEndDate);
  const today = new Date();
  const todayStart = startOfDay(today);
  const rangeStart = parse(startString, 'yyyy-MM-dd', calendarStart);
  const rangeEnd = parse(endString, 'yyyy-MM-dd', calendarEnd);
  const hasValidRange = rangeStart <= rangeEnd;
  const rangeIncludesToday =
    hasValidRange && isWithinInterval(todayStart, { start: rangeStart, end: rangeEnd });
  const shouldShowBanner = rangeIncludesToday;
  const shouldHidePastMonthsOnMobile = rangeIncludesToday && todayStart > rangeStart;
  let subtitle = timeframeLabel ?? `Planning for ${selectedYear}`;

  if (usesCalendarRange) {
    subtitle =
      selectedYear === today.getFullYear()
        ? `From today until the end of ${selectedYear}`
        : `Planning for ${selectedYear}`;
  }

  const formattedToday = format(today, 'MMMM d, yyyy');

  const monthVisibility = useMemo(() => {
    if (!monthBuckets.length) {
      return [] as Array<{
        bucket: { month: number; year: number };
        hideOnMobile: boolean;
      }>;
    }

    return monthBuckets.map(bucket => {
      const monthStart = startOfMonth(new Date(bucket.year, bucket.month));
      const monthEnd = endOfMonth(monthStart);
      const hideOnMobile = shouldHidePastMonthsOnMobile && monthEnd < todayStart;
      return { bucket, hideOnMobile };
    });
  }, [monthBuckets, shouldHidePastMonthsOnMobile, todayStart]);

  const hiddenMonthCount = monthVisibility.filter(entry => entry.hideOnMobile).length;
  const hasHiddenMonths = hiddenMonthCount > 0;
  const [showEarlierMonths, setShowEarlierMonths] = useState(false);
  const [showLegendMobile, setShowLegendMobile] = useState(false);
  const earlierMonthsVisible = hasHiddenMonths && showEarlierMonths;

  return (
    <SectionCard
      title="Calendar View"
      subtitle={subtitle}
      icon={<Calendar className="h-4 w-4 text-gray-600" />}
    >
      {shouldShowBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-700">
              Optimization begins from today ({formattedToday})
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Past dates are grayed out and not considered in the optimization. This ensures your
              vacation planning is practical and forward-looking.
            </p>
          </div>
        </div>
      )}
        <div className="mb-3 md:hidden">
          <button
            type="button"
            onClick={() => setShowLegendMobile(prev => !prev)}
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition-colors duration-150 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            aria-pressed={showLegendMobile}
          >
            {showLegendMobile ? 'Hide legend' : 'Show legend'}
          </button>
      </div>

      <div className={cn('mb-3 md:mb-4', !showLegendMobile && 'hidden md:block')}>
        <CalendarLegend
          hasPTODays={stats.totalPTODays > 0}
          hasHolidays={stats.totalPublicHolidays > 0}
          hasCompanyDaysOff={stats.totalCompanyDaysOff > 0}
          hasExtendedWeekends={stats.totalExtendedWeekends > 0}
          hasWeekends={hasWeekendDays}
          weekendLabel={weekendLegendLabel}
        />
      </div>

      {hasHiddenMonths && (
        <div className="mb-3 md:hidden">
          <button
            type="button"
            onClick={() =>
              setShowEarlierMonths(prev => (hasHiddenMonths ? !prev : prev))
            }
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition-colors duration-150 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            aria-pressed={earlierMonthsVisible}
          >
            {earlierMonthsVisible
              ? 'Hide earlier months'
              : `Show ${hiddenMonthCount} earlier month${hiddenMonthCount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {monthVisibility.map(({ bucket, hideOnMobile }) => {
          const shouldHide = hideOnMobile && !earlierMonthsVisible;

          return (
            <div
              key={`${bucket.year}-${bucket.month}`}
              className={cn(shouldHide && 'hidden md:block')}
            >
              <MonthCalendar month={bucket.month} year={bucket.year} days={optimizedDays} />
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
};
