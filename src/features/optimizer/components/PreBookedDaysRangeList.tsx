'use client';

import { useState } from 'react';
import { format, parse, getDay, differenceInCalendarDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ban,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  Sun,
  Trash2,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { WeekdayNumber } from '@/types';

type ExcludedReason = 'weekend' | 'holiday' | 'company';

type ExcludedDay = {
  date: Date;
  displayDate: string;
  reason: ExcludedReason;
  displayName?: string;
};

type RangeSummary = {
  start: Date;
  end: Date;
  dates: string[];
  workingDays: number;
  excludedDays: ExcludedDay[];
};

const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
const REASON_VISUALS: Record<
  ExcludedReason,
  { label: string; icon: typeof Sun; bubbleClass: string; textClass: string; legendClass: string }
> = {
  weekend: {
    label: 'Weekend',
    icon: Sun,
    bubbleClass: 'bg-amber-100 text-amber-600',
    textClass: 'text-amber-600',
    legendClass: 'text-amber-600',
  },
  holiday: {
    label: 'Holiday',
    icon: Sparkles,
    bubbleClass: 'bg-sky-100 text-sky-600',
    textClass: 'text-sky-600',
    legendClass: 'text-sky-600',
  },
  company: {
    label: 'Company day',
    icon: Building2,
    bubbleClass: 'bg-violet-100 text-violet-600',
    textClass: 'text-violet-600',
    legendClass: 'text-violet-600',
  },
};

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

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  if (preBookedDays.length === 0) return null;

  const holidayMap = new Map(holidays.map(h => [h.date, h.name]));
  const companyDayMap = new Map(companyDaysOff.map(c => [c.date, c.name ?? 'Company day']));

  const withinCustomRange = (date: Date) => {
    if (!customStartDate || !customEndDate) return true;
    const start = parse(customStartDate, 'yyyy-MM-dd', new Date());
    const end = parse(customEndDate, 'yyyy-MM-dd', new Date());
    return date >= start && date <= end;
  };

  const describeExclusion = (date: Date): ExcludedDay | null => {
    const dayOfWeek = getDay(date) as WeekdayNumber;
    if (weekendDays.includes(dayOfWeek)) {
      return {
        date,
        displayDate: format(date, 'EEE, MMM d'),
        reason: 'weekend',
      };
    }

    const dateKey = toDateKey(date);
    const holidayName = holidayMap.get(dateKey);
    if (holidayName) {
      return {
        date,
        displayDate: format(date, 'EEE, MMM d'),
        displayName: holidayName,
        reason: 'holiday',
      };
    }

    const companyName = companyDayMap.get(dateKey);
    if (companyName) {
      const defaultLabel = format(date, 'MMMM d, yyyy');
      const companyNameTrimmed = companyName.trim();
      const isDefaultName =
        companyNameTrimmed.toLowerCase() === defaultLabel.trim().toLowerCase() ||
        companyNameTrimmed.toLowerCase() === 'company day';

      return {
        date,
        displayDate: format(date, 'EEE, MMM d'),
        displayName: isDefaultName ? undefined : companyNameTrimmed,
        reason: 'company',
      };
    }

    return null;
  };

  const createRange = (date: Date): RangeSummary => {
    const exclusion = describeExclusion(date);
    return {
      start: date,
      end: date,
      dates: [toDateKey(date)],
      workingDays: exclusion ? 0 : 1,
      excludedDays: exclusion ? [exclusion] : [],
    };
  };

  const addDateToRange = (range: RangeSummary, date: Date) => {
    range.end = date;
    range.dates.push(toDateKey(date));

    const exclusion = describeExclusion(date);
    if (exclusion) {
      range.excludedDays.push(exclusion);
    } else {
      range.workingDays += 1;
    }
  };

  const sortedDates = Array.from(
    new Map(
      preBookedDays.map(day => {
        const date = parse(day.date, 'yyyy-MM-dd', new Date());
        return [toDateKey(date), date] as const;
      })
    ).values()
  )
    .filter(withinCustomRange)
    .sort((a, b) => a.getTime() - b.getTime());

  if (sortedDates.length === 0) return null;

  const ranges: RangeSummary[] = [];
  let currentRange: RangeSummary | null = null;

  for (const date of sortedDates) {
    if (!currentRange) {
      currentRange = createRange(date);
      continue;
    }

    const isConsecutive = differenceInCalendarDays(date, currentRange.end) === 1;
    if (isConsecutive) {
      addDateToRange(currentRange, date);
    } else {
      ranges.push(currentRange);
      currentRange = createRange(date);
    }
  }

  if (currentRange) {
    ranges.push(currentRange);
  }

  const totalWorkingDays = ranges.reduce((sum, range) => sum + range.workingDays, 0);
  const totalExcludedDays = ranges.reduce((sum, range) => sum + range.excludedDays.length, 0);
  const toggleRow = (key: string) => {
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRemoveRange = (range: RangeSummary) => {
    range.dates.forEach(dateKey => removePreBookedDay(dateKey));
  };

  const formatRangeLabel = (range: RangeSummary) => {
    const sameDay = range.start.getTime() === range.end.getTime();
    if (sameDay) return format(range.start, 'MMM d, yyyy');

    const sameMonth = range.start.getMonth() === range.end.getMonth();
    const sameYear = range.start.getFullYear() === range.end.getFullYear();

    if (sameMonth && sameYear) {
      return `${format(range.start, 'MMM d')}–${format(range.end, 'd, yyyy')}`;
    }

    if (sameYear) {
      return `${format(range.start, 'MMM d')} – ${format(range.end, 'MMM d, yyyy')}`;
    }

    return `${format(range.start, 'MMM d, yyyy')} – ${format(range.end, 'MMM d, yyyy')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-emerald-100/70 bg-white p-3 shadow-sm',
        'sm:border-emerald-200/60 sm:bg-gradient-to-br sm:from-emerald-50/75 sm:to-emerald-100/20 sm:p-5'
      )}
    >
      <div className="mb-3 flex items-center gap-2.5 sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-emerald-100/70 p-1.5">
            <Calendar className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-medium leading-none text-emerald-900">
            Pre-Booked Vacations
          </h3>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-2">
        {ranges.map((range, index) => {
          const key = `${range.start.getTime()}-${range.end.getTime()}`;
          const excludedCount = range.excludedDays.length;
          const isExpanded = expandedRows[key] ?? false;
          const reasonCounts = range.excludedDays.reduce(
            (acc, item) => {
              acc[item.reason] += 1;
              return acc;
            },
            { weekend: 0, holiday: 0, company: 0 } as Record<ExcludedReason, number>
          );

          const pluralize = (count: number, singular: string, plural?: string) =>
            `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;

          const excludedSegments = [
            reasonCounts.holiday ? pluralize(reasonCounts.holiday, 'holiday', 'holidays') : null,
            reasonCounts.company ? pluralize(reasonCounts.company, 'company day') : null,
            reasonCounts.weekend ? pluralize(reasonCounts.weekend, 'weekend day') : null,
          ].filter(Boolean) as string[];

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'group rounded-lg border border-emerald-100 bg-white transition-all duration-200 shadow-sm',
                'sm:border-transparent sm:bg-white/95 sm:ring-1 sm:ring-emerald-200/50 sm:hover:ring-emerald-300 sm:hover:shadow-sm'
              )}
            >
              <div className="relative flex flex-col gap-3 p-3 sm:p-4 sm:pr-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-900 sm:text-base">
                      {formatRangeLabel(range)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRange(range)}
                    className={cn(
                      'absolute right-2 top-2 h-7 w-7 rounded-full border border-emerald-100 bg-emerald-50 p-0 text-emerald-600 focus:border-emerald-200 focus:bg-emerald-100',
                      'sm:static sm:h-6 sm:w-6 sm:rounded-md sm:border-transparent sm:bg-transparent',
                      'sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100',
                      'transition-all duration-200',
                      'hover:bg-red-100/70 hover:scale-105 active:scale-95'
                    )}
                    aria-label={`Remove ${formatRangeLabel(range)}`}
                  >
                    <Trash2 className="h-2.5 w-2.5 text-emerald-600 hover:text-red-500" />
                  </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-2 items-start">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 pl-2.5 pr-2 py-0.5 text-xs font-medium leading-tight text-emerald-700 sm:text-[0.7rem]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                        {pluralize(range.workingDays, 'working day')}
                      </span>
                      {excludedSegments.map((segment, index) => (
                        <span
                          key={`${segment}-${index}`}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 pl-2.5 pr-2 py-0.5 text-xs font-medium leading-tight text-emerald-700 sm:text-[0.7rem]"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                          Excludes {segment}
                        </span>
                      ))}
                    </div>
                  </div>
                  {excludedCount > 0 && (
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:self-end sm:justify-end">
                      <button
                        type="button"
                        onClick={() => toggleRow(key)}
                        aria-expanded={isExpanded}
                        className="inline-flex w-full items-center justify-center gap-1 whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-300 sm:w-auto sm:justify-start sm:rounded-md sm:border-transparent sm:bg-emerald-50 sm:px-2.5"
                      >
                        <Info className="h-3 w-3" aria-hidden="true" />
                        {isExpanded ? 'Hide details' : 'View details'}
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-3 w-3" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {excludedCount > 0 && (
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mx-1 mb-2 space-y-1 rounded-md bg-white px-2.5 py-2 text-xs text-emerald-700 sm:mx-3 sm:mb-3 sm:rounded-xl sm:bg-emerald-50/40 sm:px-3"
                    >
                      {range.excludedDays.map(item => {
                        const visual = REASON_VISUALS[item.reason];
                        const Icon = visual.icon;

                        return (
                          <li
                            key={item.date.toISOString()}
                            className="flex items-center gap-3 rounded-md bg-emerald-50/50 px-2 py-1 sm:bg-white/70 sm:rounded-lg"
                          >
                            <span
                              className={cn(
                                'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs',
                                visual.bubbleClass
                              )}
                              aria-hidden="true"
                            >
                              <Icon className="h-3 w-3" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col gap-0.5 text-[0.75rem] leading-snug">
                              <span className="font-medium text-emerald-900">
                                {item.displayDate}
                                {item.displayName && (
                                  <span className="text-emerald-700"> — {item.displayName}</span>
                                )}
                              </span>
                              <span className={cn('text-[0.7rem] font-medium', visual.textClass)}>
                                {visual.label}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
