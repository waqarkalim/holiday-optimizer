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
import { Badge } from '@/shared/components/ui/badge';
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
  const formatCountLabel = (count: number, singular: string, plural?: string) =>
    `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;

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
      className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-blue-100/30 p-4 shadow-sm"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-blue-100/50 p-1.5">
            <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-medium leading-none text-blue-900 mb-1">
              Pre-Booked Vacations
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[0.75rem]">
          <Badge
            variant="outline"
            size="sm"
            icon={<Briefcase className="h-3 w-3 text-blue-600" aria-hidden="true" />}
            className="border-blue-200 bg-white/60 text-blue-700 supports-[backdrop-filter]:bg-white/30"
          >
            {formatCountLabel(totalWorkingDays, 'working day')}
          </Badge>
          <Badge
            variant="outline"
            size="sm"
            icon={<Ban className="h-3 w-3 text-blue-500" aria-hidden="true" />}
            className="border-blue-200 bg-white/60 text-blue-600 supports-[backdrop-filter]:bg-white/30"
          >
            {formatCountLabel(totalExcludedDays, 'excluded day')}
          </Badge>
          <Badge
            variant="outline"
            size="sm"
            icon={<Layers className="h-3 w-3 text-blue-500" aria-hidden="true" />}
            className="border-blue-200 bg-white/60 text-blue-600 supports-[backdrop-filter]:bg-white/30"
          >
            {formatCountLabel(ranges.length, 'selection')}
          </Badge>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-blue-600/80">
        {(['holiday', 'company', 'weekend'] as ExcludedReason[]).map(reason => {
          const { label, icon: Icon, legendClass } = REASON_VISUALS[reason];
          return (
            <span key={reason} className="inline-flex items-center gap-1">
              <Icon className={cn('h-3.5 w-3.5', legendClass)} aria-hidden="true" />
              <span className="font-medium text-blue-700">{label}</span>
            </span>
          );
        })}
      </div>

      <div className="space-y-2">
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

          const excludedSegments = [
            reasonCounts.holiday ? formatCountLabel(reasonCounts.holiday, 'holiday', 'holidays') : null,
            reasonCounts.company ? formatCountLabel(reasonCounts.company, 'company day') : null,
            reasonCounts.weekend ? formatCountLabel(reasonCounts.weekend, 'weekend day') : null,
          ].filter(Boolean) as string[];

          const summaryText =
            excludedSegments.length > 0
              ? `${formatCountLabel(range.workingDays, 'working day')} • ${excludedSegments.join(' • ')} excluded`
              : formatCountLabel(range.workingDays, 'working day');

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'group rounded-xl bg-white/95 ring-1 ring-blue-200/50',
                'hover:ring-blue-300 hover:shadow-sm transition-all duration-200'
              )}
            >
              <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">
                    {formatRangeLabel(range)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-blue-500/90">
                    <span>{summaryText}</span>
                    {excludedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleRow(key)}
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-50 px-1.5 py-0.5 font-medium text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <Info className="h-3 w-3" aria-hidden="true" />
                        {isExpanded ? 'Hide details' : 'View details'}
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-3 w-3" aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
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
                    aria-label={`Remove ${formatRangeLabel(range)}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-blue-600 hover:text-red-500" />
                  </Button>
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
                      className="mx-3 mb-3 space-y-1 rounded-xl bg-blue-50/40 px-3 py-2 text-xs text-blue-700"
                    >
                      {range.excludedDays.map(item => {
                        const visual = REASON_VISUALS[item.reason];
                        const Icon = visual.icon;

                        return (
                          <li
                            key={item.date.toISOString()}
                            className="flex items-center gap-3 rounded-lg bg-white/70 px-2 py-0.5"
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
                              <span className="font-medium text-blue-900">
                                {item.displayDate}
                                {item.displayName && (
                                  <span className="text-blue-700"> — {item.displayName}</span>
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
