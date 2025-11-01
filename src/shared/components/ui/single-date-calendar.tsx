'use client';

import React from 'react';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { format, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { WeekdayNumber } from '@/types';

const buildStatusMessage = (
  selectedDates: Date[],
  weekendDays: WeekdayNumber[],
  holidays: Array<{ date: string; name: string }>
) => {
  if (selectedDates.length === 0) {
    return 'Click dates to select company days off';
  }

  const isWeekend = (date: Date): boolean => {
    const dayOfWeek = getDay(date) as WeekdayNumber;
    return weekendDays.includes(dayOfWeek);
  };

  const isExcludedDay = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.some(h => h.date === dateStr);
  };

  const total = selectedDates.length;
  const working = selectedDates.filter(date => !isWeekend(date) && !isExcludedDay(date)).length;
  const excluded = total - working;

  if (excluded > 0) {
    return `${total} ${total === 1 ? 'day' : 'days'} selected: ${working} ${
      working === 1 ? 'working day' : 'working days'
    } (${excluded} excluded) • Click any to remove`;
  }

  return `${total} ${total === 1 ? 'day' : 'days'} selected • Click any to remove`;
};

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
  type CalendarSelection = DateObject[] | DateObject | null;
  const values = selectedDates.map(date => new DateObject(date));

  const handleChange = (dates: CalendarSelection) => {
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

  const statusMessage = buildStatusMessage(selectedDates, weekendDays, holidays);

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-white sm:border-gray-200">
        <div className="p-3 pb-2 sm:p-4 sm:pb-3">
          <Calendar
            value={values}
            onChange={nextValue => handleChange(nextValue as CalendarSelection)}
            multiple
            numberOfMonths={1}
            shadow={false}
            className="w-full"
            showOtherDays
          />
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50/60 px-3 py-2 sm:border-gray-200 sm:bg-gray-50 sm:px-4 sm:py-2.5">
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
