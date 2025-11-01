'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { eachDayOfInterval, format, getDay, differenceInCalendarDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { WeekdayNumber } from '@/types';

export interface MultiRangeCalendarProps {
  selectedDates?: Date[];
  onChange?: (dates: Date[]) => void;
  className?: string;
  weekendDays?: WeekdayNumber[];
  holidays?: Array<{ date: string; name: string }>;
  companyDaysOff?: Array<{ date: string; name: string }>;
}

const buildCalendarValues = (selectedDates: Date[]): DateObject[][] => {
  if (selectedDates.length === 0) return [];

  const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
  const ranges: DateObject[][] = [];
  let rangeStart = new DateObject(sortedDates[0]);
  let rangeEnd = new DateObject(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new DateObject(sortedDates[i]);
    const prevDate = new DateObject(sortedDates[i - 1]);
    const diffInDays = differenceInCalendarDays(currentDate.toDate(), prevDate.toDate());

    if (diffInDays === 1) {
      rangeEnd = currentDate;
    } else {
      ranges.push([rangeStart, rangeEnd]);
      rangeStart = currentDate;
      rangeEnd = currentDate;
    }
  }

  ranges.push([rangeStart, rangeEnd]);
  return ranges;
};

export function MultiRangeCalendar({
  selectedDates = [],
  onChange,
  className,
  weekendDays = [],
  holidays = [],
  companyDaysOff = [],
}: MultiRangeCalendarProps) {
  type CalendarSelection = DateObject | DateObject[] | DateObject[][] | null;

  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const rangeStartRef = useRef<Date | null>(null);
  const values = buildCalendarValues(selectedDates);

  const buildWorkingStats = (dates: Date[]) => {
    const total = dates.length;
    const working = dates.filter(date => {
      const dayOfWeek = getDay(date) as WeekdayNumber;
      if (weekendDays.includes(dayOfWeek)) {
        return false;
      }

      const dateStr = format(date, 'yyyy-MM-dd');
      const isHoliday = holidays.some(h => h.date === dateStr);
      const isCompanyDay = companyDaysOff.some(c => c.date === dateStr);

      return !isHoliday && !isCompanyDay;
    }).length;
    const excluded = total - working;
    return { total, working, excluded };
  };

  const statusMessage = ((): React.ReactNode => {
    if (isSelecting && rangeStart && hoverDate) {
      const start = rangeStart.getTime();
      const end = hoverDate.getTime();
      const [minDate, maxDate] = start < end ? [rangeStart, hoverDate] : [hoverDate, rangeStart];
      const datesInRange = eachDayOfInterval({ start: minDate, end: maxDate });
      const { total, working, excluded } = buildWorkingStats(datesInRange);

      if (excluded > 0) {
        return (
          <>
            <span className="text-gray-700">Selecting {total} {total === 1 ? 'day' : 'days'}: {working} {working === 1 ? 'working day' : 'working days'}</span>{' '}
            <span className="text-gray-500">({excluded} excluded)</span>
          </>
        );
      }

      return (
        <>
          <span className="text-gray-700">Selecting {total} {total === 1 ? 'day' : 'days'}: {format(minDate, 'MMM d')} – {format(maxDate, 'MMM d')}</span>
        </>
      );
    }

    if (isSelecting && rangeStart) {
      return <span className="text-gray-600">Click another date to complete the range</span>;
    }

    if (selectedDates.length > 0) {
      const { total, working, excluded } = buildWorkingStats(selectedDates);

      if (excluded > 0) {
        return (
          <>
            <span className="text-gray-700">{total} {total === 1 ? 'day' : 'days'} selected: {working} {working === 1 ? 'working day' : 'working days'}</span>{' '}
            <span className="text-gray-500">({excluded} excluded)</span>
            <span className="text-gray-400 mx-1.5">•</span>
            <span className="text-gray-500">Click any to remove</span>
          </>
        );
      }

      return (
        <>
          <span className="text-gray-700">{total} {total === 1 ? 'day' : 'days'} selected</span>
          <span className="text-gray-400 mx-1.5">•</span>
          <span className="text-gray-500">Click any to remove</span>
        </>
      );
    }

    return (
      <>
        <span className="text-gray-500">Double-click for single dates</span>
        <span className="text-gray-400 mx-1.5">•</span>
        <span className="text-gray-500">Click start and end for ranges</span>
      </>
    );
  })();

  const handleChange = (_dates: CalendarSelection) => {
    void _dates;
    if (!isSelectingRef.current) {
      setIsSelecting(false);
      setRangeStart(null);
      setHoverDate(null);
      rangeStartRef.current = null;
    }
  };

  // Helper function to extract date from day element
  const getDateFromElement = (element: Element): Date | null => {
    try {
      const span = element.querySelector('span');
      if (!span) return null;

      const dayText = span.textContent?.trim();
      if (!dayText) return null;

      const day = parseInt(dayText);
      if (isNaN(day)) return null;

      const calendar = element.closest('.rmdp-calendar');
      if (!calendar) return null;

      const headerValues = calendar.querySelector('.rmdp-header-values');
      if (!headerValues) return null;

      const monthYearText = headerValues.textContent?.trim();
      if (!monthYearText) return null;

      // Parse month and year from header (e.g., "January 2024", "October 2025", or "October,2025")
      const parts = monthYearText.includes(',')
        ? monthYearText.split(',')
        : monthYearText.split(' ');

      if (parts.length < 2) return null;

      const monthName = parts[0].trim();
      const yearStr = parts[1].trim();
      const year = parseInt(yearStr);

      if (isNaN(year)) return null;

      const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

      // Handle dates from other months (deactive class)
      const isDeactive = element.classList.contains('rmdp-deactive');
      let actualMonth = monthIndex;
      let actualYear = year;

      if (isDeactive) {
        const week = element.closest('.rmdp-week');
        const allWeeks = Array.from(calendar.querySelectorAll('.rmdp-week'));
        const weekIndex = allWeeks.indexOf(week as Element);

        if ((weekIndex <= 1 || weekIndex === -1) && day > 20) {
          // Previous month
          if (monthIndex === 0) {
            actualMonth = 11;
            actualYear = year - 1;
          } else {
            actualMonth = monthIndex - 1;
          }
        } else if (weekIndex > 3 && day < 15) {
          // Next month
          if (monthIndex === 11) {
            actualMonth = 0;
            actualYear = year + 1;
          } else {
            actualMonth = monthIndex + 1;
          }
        }
      }

      return new Date(actualYear, actualMonth, day);
    } catch {
      return null;
    }
  };

  // Track when user clicks on a date
  useEffect(() => {
    if (!calendarRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dayElement = target.closest('.rmdp-day:not(.rmdp-disabled)');

      if (dayElement) {
        e.preventDefault();
        e.stopPropagation();
        const date = getDateFromElement(dayElement);

        if (date) {
          // Check if this date is already in the selectedDates array
          const dateStr = date.toDateString();
          const isAlreadySelected = selectedDates.some(d => d.toDateString() === dateStr);

          if (isAlreadySelected) {
            // User is clicking on an already-selected date - exit selecting mode
            isSelectingRef.current = false;
            rangeStartRef.current = null;
            setIsSelecting(false);
            setRangeStart(null);
            setHoverDate(null);

            const sortedDates = [...selectedDates].sort(
              (a, b) => a.getTime() - b.getTime()
            );
            const targetIndex = sortedDates.findIndex(d => d.toDateString() === dateStr);

            if (targetIndex !== -1) {
              let rangeStartIndex = targetIndex;
              let rangeEndIndex = targetIndex;

              while (
                rangeStartIndex > 0 &&
                differenceInCalendarDays(
                  sortedDates[rangeStartIndex],
                  sortedDates[rangeStartIndex - 1]
                ) === 1
              ) {
                rangeStartIndex -= 1;
              }

              while (
                rangeEndIndex < sortedDates.length - 1 &&
                differenceInCalendarDays(
                  sortedDates[rangeEndIndex + 1],
                  sortedDates[rangeEndIndex]
                ) === 1
              ) {
                rangeEndIndex += 1;
              }

              const removalSet = new Set(
                sortedDates
                  .slice(rangeStartIndex, rangeEndIndex + 1)
                  .map(d => d.toDateString())
              );

              const remaining = selectedDates
                .filter(d => !removalSet.has(d.toDateString()))
                .sort((a, b) => a.getTime() - b.getTime());

              onChange?.(remaining);
            }
            return;
          }

          if (!rangeStartRef.current) {
            // First click - set range start and enable hover preview
            setRangeStart(date);
            setHoverDate(date);
            setIsSelecting(true);
            rangeStartRef.current = date;
            isSelectingRef.current = true;
          } else {
            // Second click - finalize range selection manually
            const startDate = rangeStartRef.current;
            if (startDate) {
              const [minDate, maxDate] = startDate.getTime() <= date.getTime()
                ? [startDate, date]
                : [date, startDate];
              const rangeDates = eachDayOfInterval({ start: minDate, end: maxDate });

              const combined = new Map<string, Date>();
              selectedDates.forEach(existing => {
                combined.set(existing.toDateString(), existing);
              });
              rangeDates.forEach(newDate => {
                combined.set(newDate.toDateString(), newDate);
              });

              const merged = Array.from(combined.values()).sort(
                (a, b) => a.getTime() - b.getTime()
              );

              onChange?.(merged);
            }

            rangeStartRef.current = null;
            isSelectingRef.current = false;
            setIsSelecting(false);
            setRangeStart(null);
            setHoverDate(null);
          }
        }
      }
    };

    const calendarElement = calendarRef.current;
    // Use capture phase to get the event before the library processes it
    calendarElement.addEventListener('click', handleClick, true);

    return () => {
      calendarElement.removeEventListener('click', handleClick, true);
    };
  }, [selectedDates, onChange]);

  // Track hover for range preview - set up once and use refs
  useEffect(() => {
    if (!calendarRef.current) return;

    const handleMouseEnter = (e: MouseEvent) => {
      if (!isSelectingRef.current) return;

      const target = e.target as HTMLElement;
      const dayElement = target.closest('.rmdp-day:not(.rmdp-disabled)');

      if (dayElement) {
        const date = getDateFromElement(dayElement);
        if (date) {
          setHoverDate(date);
        }
      }
    };

    const calendarElement = calendarRef.current;

    // Use MutationObserver to re-attach listeners when calendar updates
    const observer = new MutationObserver(() => {
      const dayElements = calendarElement.querySelectorAll('.rmdp-day:not(.rmdp-disabled)');

      dayElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter as EventListener);
        el.addEventListener('mouseenter', handleMouseEnter as EventListener);
      });
    });

    observer.observe(calendarElement, {
      childList: true,
      subtree: true,
    });

    // Initial setup
    const dayElements = calendarElement.querySelectorAll('.rmdp-day:not(.rmdp-disabled)');
    dayElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter as EventListener);
    });

    return () => {
      observer.disconnect();
      calendarElement.querySelectorAll('.rmdp-day').forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter as EventListener);
      });
    };
  }, []);

  // Apply hover preview classes
  useEffect(() => {
    if (!calendarRef.current) {
      return;
    }

    // Remove all preview classes first
    calendarRef.current.querySelectorAll('.rmdp-day').forEach(el => {
      el.classList.remove('hover-preview');
    });

    if (!isSelecting || !rangeStart || !hoverDate) {
      return;
    }

    const start = rangeStart.getTime();
    const end = hoverDate.getTime();
    const [minDate, maxDate] = start < end ? [start, end] : [end, start];

    // Add preview class to dates in range
    calendarRef.current.querySelectorAll('.rmdp-day').forEach(el => {
      const date = getDateFromElement(el);
      if (date) {
        const dateTime = date.getTime();
        if (dateTime >= minDate && dateTime <= maxDate) {
          el.classList.add('hover-preview');
        }
      }
    });
  }, [isSelecting, rangeStart, hoverDate]);

  return (
    <div className={className}>
      <div
        ref={calendarRef}
        className="relative overflow-hidden"
      >
        <div className="pb-2">
          <Calendar
            value={values}
            onChange={nextValue => handleChange(nextValue as CalendarSelection)}
            multiple
            range
            numberOfMonths={1}
            shadow={false}
            className="w-full"
            showOtherDays
          />
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-2.5 border-gray-200/60 bg-gray-50/50 px-3 py-2.5 sm:px-4 sm:py-3 rounded-b-lg">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="How to use calendar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-2.5 w-2.5 text-gray-600"
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
                  <p><strong>Select a single date:</strong> Double-click</p>
                  <p><strong>Select a range:</strong> Click start date, then end date</p>
                  <p><strong>Remove selection:</strong> Click any selected date</p>
                </div>
              </TooltipContent>
            </Tooltip>
            <div className="text-xs leading-tight flex-1">
              {statusMessage}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
