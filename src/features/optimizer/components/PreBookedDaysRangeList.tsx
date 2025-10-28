'use client';

import { useState } from 'react';
import { format, parse, getDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Info, Trash2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { WeekdayNumber } from '@/types';

type ExcludedReason = 'weekend' | 'holiday' | 'company';

type ExcludedDay = {
  date: Date;
  label: string;
  reason: ExcludedReason;
};

type RangeSummary = {
  start: Date;
  end: Date;
  dates: string[];
  workingDays: number;
  excludedDays: ExcludedDay[];
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

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
        label: format(date, 'EEE, MMM d'),
        reason: 'weekend',
      };
    }

    const dateKey = toDateKey(date);
    const holidayName = holidayMap.get(dateKey);
    if (holidayName) {
      return {
        date,
        label: `${format(date, 'EEE, MMM d')} — ${holidayName}`,
        reason: 'holiday',
      };
    }

    const companyName = companyDayMap.get(dateKey);
    if (companyName) {
      return {
        date,
        label: `${format(date, 'EEE, MMM d')} — ${companyName}`,
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

  const sortedDates = preBookedDays
    .map(day => parse(day.date, 'yyyy-MM-dd', new Date()))
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

    const isConsecutive = date.getTime() - currentRange.end.getTime() === DAY_IN_MS;
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
              {totalWorkingDays} working {totalWorkingDays === 1 ? 'day' : 'days'} across{' '}
              {ranges.length} {ranges.length === 1 ? 'selection' : 'selections'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {ranges.map((range, index) => {
          const key = `${range.start.getTime()}-${range.end.getTime()}`;
          const excludedCount = range.excludedDays.length;
          const isExpanded = expandedRows[key] ?? false;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'rounded-lg border border-blue-200/40 bg-white',
                'hover:border-blue-300 hover:shadow-sm transition-all duration-200'
              )}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900">
                    {formatRangeLabel(range)}
                  </p>
                  <p className="text-xs text-blue-600/70 mt-0.5">
                    {range.workingDays} working {range.workingDays === 1 ? 'day' : 'days'}
                    {excludedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleRow(key)}
                        className="ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-blue-500/60 transition-colors hover:text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        • {excludedCount} excluded
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="h-3 w-3" aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {excludedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleRow(key)}
                      className="hidden sm:inline-flex items-center gap-1 rounded-md border border-transparent bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <Info className="h-3 w-3" aria-hidden="true" />
                      View details
                    </button>
                  )}
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
                      className="mx-3 mb-3 space-y-1 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-700"
                    >
                      {range.excludedDays.map(item => (
                        <li key={item.date.toISOString()} className="flex items-start gap-2">
                          <span
                            className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"
                            aria-hidden="true"
                          />
                          <span>
                            <span className="font-medium">{item.label}</span>
                            {item.reason === 'weekend' && ' • Weekend'}
                            {item.reason === 'holiday' && ' • Holiday'}
                            {item.reason === 'company' && ' • Company day'}
                          </span>
                        </li>
                      ))}
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
