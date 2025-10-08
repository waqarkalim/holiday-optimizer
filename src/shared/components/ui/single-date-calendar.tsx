'use client';

import React, { useMemo, useEffect } from 'react';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { format, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { WeekdayNumber } from '@/types';

export interface SingleDateCalendarProps {
  selectedDates?: Date[];
  onChange?: (dates: Date[]) => void;
  className?: string;
  weekendDays?: WeekdayNumber[];
  holidays?: Array<{ date: string; name: string }>;
}

export function SingleDateCalendar({
  selectedDates = [],
  onChange,
  className,
  weekendDays = [],
  holidays = [],
}: SingleDateCalendarProps) {
  const [statusMessage, setStatusMessage] = React.useState<string>('');

  // Helper to check if date is weekend
  const isWeekend = (date: Date): boolean => {
    const dayOfWeek = getDay(date) as WeekdayNumber;
    return weekendDays.includes(dayOfWeek);
  };

  // Helper to check if date is excluded
  const isExcludedDay = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.some(h => h.date === dateStr);
  };

  // Calculate working days
  const calculateWorkingDays = (dates: Date[]): { total: number; working: number; excluded: number } => {
    const total = dates.length;
    const working = dates.filter(date => !isWeekend(date) && !isExcludedDay(date)).length;
    const excluded = total - working;
    return { total, working, excluded };
  };

  // Convert Date[] to DateObject[] for the calendar
  const values = useMemo(() => {
    return selectedDates.map(date => new DateObject(date));
  }, [selectedDates]);

  const handleChange = (dates: DateObject | DateObject[] | null) => {
    if (!dates) {
      onChange?.([]);
      return;
    }

    const dateArray = Array.isArray(dates) ? dates : [dates];
    const allDates: Date[] = dateArray
      .filter((item): item is DateObject => item !== null && item?.toDate !== undefined)
      .map(item => item.toDate());

    onChange?.(allDates);
  };

  // Update status message
  useEffect(() => {
    if (selectedDates.length > 0) {
      const { total, working, excluded } = calculateWorkingDays(selectedDates);

      if (excluded > 0) {
        setStatusMessage(
          `${total} ${total === 1 ? 'day' : 'days'} selected: ${working} working ${working === 1 ? 'day' : 'days'} (${excluded} excluded) • Click any to remove`
        );
      } else {
        setStatusMessage(
          `${total} ${total === 1 ? 'day' : 'days'} selected • Click any to remove`
        );
      }
    } else {
      setStatusMessage('Click dates to select company days off');
    }
  }, [selectedDates, weekendDays, holidays]);

  return (
    <div className={className}>
      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 pb-3">
          <Calendar
            value={values as any}
            onChange={handleChange as any}
            multiple
            numberOfMonths={1}
            shadow={false}
            className="w-full"
            showOtherDays
          />
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-400 hover:border-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="How to use calendar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-3 w-3 text-gray-600"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 10a.75.75 0 01-.75-.75v-3.5a.75.75 0 011.5 0v3.5A.75.75 0 018 10zm0 2.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                <div className="space-y-2 text-xs">
                  <p><strong>Select dates:</strong> Click individual dates</p>
                  <p><strong>Remove selection:</strong> Click any selected date</p>
                </div>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-gray-700 leading-tight">
              {statusMessage}
            </span>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
