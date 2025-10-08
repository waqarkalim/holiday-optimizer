'use client';

import { useMemo } from 'react';
import { format, parse, eachDayOfInterval, getDay } from 'date-fns';
import { Trash2, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { WeekdayNumber } from '@/types';
import { motion } from 'framer-motion';

interface DateRange {
  start: Date;
  end: Date;
  dates: string[]; // All dates in the range
  workingDays: number;
}

export function PreBookedDaysRangeList() {
  const {
    preBookedDays,
    removePreBookedDay,
    weekendDays,
    holidays,
    companyDaysOff,
    customStartDate,
    customEndDate,
  } = useOptimizerForm();

  // Helper to check if date is weekend
  const isWeekend = (date: Date): boolean => {
    const dayOfWeek = getDay(date) as WeekdayNumber;
    return weekendDays.includes(dayOfWeek);
  };

  // Helper to check if date is excluded
  const isExcludedDay = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return (
      holidays.some(h => h.date === dateStr) ||
      companyDaysOff.some(c => c.date === dateStr)
    );
  };

  // Calculate working days in a date array
  const calculateWorkingDays = (dates: Date[]): number => {
    return dates.filter(date => !isWeekend(date) && !isExcludedDay(date)).length;
  };

  // Group consecutive dates into ranges
  const dateRanges = useMemo(() => {
    if (preBookedDays.length === 0) return [];

    // Filter by custom date range if set
    let filteredDays = preBookedDays;
    if (customStartDate && customEndDate) {
      const start = parse(customStartDate, 'yyyy-MM-dd', new Date());
      const end = parse(customEndDate, 'yyyy-MM-dd', new Date());
      filteredDays = preBookedDays.filter(day => {
        const dayDate = parse(day.date, 'yyyy-MM-dd', new Date());
        return dayDate >= start && dayDate <= end;
      });
    }

    if (filteredDays.length === 0) return [];

    // Sort by date
    const sortedDates = [...filteredDays]
      .map(day => parse(day.date, 'yyyy-MM-dd', new Date()))
      .sort((a, b) => a.getTime() - b.getTime());

    const ranges: DateRange[] = [];
    let currentStart = sortedDates[0];
    let currentEnd = sortedDates[0];
    let currentDates = [sortedDates[0]];

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currentDate = sortedDates[i];

      // Check if dates are consecutive (1 day apart)
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        // Extend current range
        currentEnd = currentDate;
        currentDates.push(currentDate);
      } else {
        // Save current range and start new one
        ranges.push({
          start: currentStart,
          end: currentEnd,
          dates: currentDates.map(d => format(d, 'yyyy-MM-dd')),
          workingDays: calculateWorkingDays(currentDates),
        });
        currentStart = currentDate;
        currentEnd = currentDate;
        currentDates = [currentDate];
      }
    }

    // Add the last range
    ranges.push({
      start: currentStart,
      end: currentEnd,
      dates: currentDates.map(d => format(d, 'yyyy-MM-dd')),
      workingDays: calculateWorkingDays(currentDates),
    });

    return ranges;
  }, [preBookedDays, customStartDate, customEndDate, weekendDays, holidays, companyDaysOff]);

  if (dateRanges.length === 0) return null;

  const handleRemoveRange = (range: DateRange) => {
    range.dates.forEach(date => removePreBookedDay(date));
  };

  const formatDateRange = (range: DateRange): string => {
    if (range.start.getTime() === range.end.getTime()) {
      // Single date
      return format(range.start, 'MMM d, yyyy');
    } else {
      // Date range
      const isSameMonth = range.start.getMonth() === range.end.getMonth();
      const isSameYear = range.start.getFullYear() === range.end.getFullYear();

      if (isSameMonth && isSameYear) {
        return `${format(range.start, 'MMM d')}–${format(range.end, 'd, yyyy')}`;
      } else if (isSameYear) {
        return `${format(range.start, 'MMM d')} – ${format(range.end, 'MMM d, yyyy')}`;
      } else {
        return `${format(range.start, 'MMM d, yyyy')} – ${format(range.end, 'MMM d, yyyy')}`;
      }
    }
  };

  const totalWorkingDays = dateRanges.reduce((sum, range) => sum + range.workingDays, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-blue-100/30 p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-blue-100/50 p-1.5">
            <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-medium leading-none text-blue-900 mb-1">
              Pre-Booked Vacations
            </h3>
            <p className="text-xs text-blue-600/70">
              {totalWorkingDays} working {totalWorkingDays === 1 ? 'day' : 'days'} across {dateRanges.length} {dateRanges.length === 1 ? 'selection' : 'selections'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {dateRanges.map((range, index) => (
          <motion.div
            key={`${range.start.getTime()}-${range.end.getTime()}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'group flex items-center justify-between rounded-lg border border-blue-200/40 bg-white p-3',
              'hover:border-blue-300 hover:shadow-sm transition-all duration-200'
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                {formatDateRange(range)}
              </p>
              <p className="text-xs text-blue-600/70 mt-0.5">
                {range.workingDays} working {range.workingDays === 1 ? 'day' : 'days'}
                {range.dates.length !== range.workingDays && (
                  <span className="text-blue-500/60">
                    {' '}• {range.dates.length - range.workingDays} excluded
                  </span>
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveRange(range)}
              className={cn(
                'h-7 w-7 p-0',
                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                'transition-all duration-200',
                'hover:bg-red-100/70 hover:scale-110 active:scale-95'
              )}
              aria-label={`Remove ${formatDateRange(range)}`}
            >
              <Trash2 className="h-3.5 w-3.5 text-blue-600 hover:text-red-500" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
