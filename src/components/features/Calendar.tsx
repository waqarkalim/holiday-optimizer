import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, getDay, isEqual, isSameMonth, isToday } from 'date-fns';
import clsx from 'clsx';

const Calendar: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [firstDayCurrentMonth, setFirstDayCurrentMonth] = useState(new Date());

  const handleDateClick = (day: Date) => {
    setSelectedDay(day);
  };

  const previousMonth = () => {
    const previousMonth = new Date(firstDayCurrentMonth);
    previousMonth.setMonth(previousMonth.getUTCMonth() - 1);
    setFirstDayCurrentMonth(previousMonth);
  };

  const nextMonth = () => {
    const nextMonth = new Date(firstDayCurrentMonth);
    nextMonth.setMonth(nextMonth.getUTCMonth() + 1);
    setFirstDayCurrentMonth(nextMonth);
  };

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(firstDayCurrentMonth);
    date.setDate(i - firstDayCurrentMonth.getUTCDay() + 1);
    return date;
  });

  const colStartClasses = ['col-start-1', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];

  const isPublicHoliday = () => {
    // Implement your logic to check if a day is a public holiday
    return false;
  };

  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-300/10">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/50 px-6 py-4">
        <h2 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={previousMonth}
            className={clsx(
              'p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors',
              'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
            )}
          >
            <span className="sr-only">Previous month</span>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className={clsx(
              'p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors',
              'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
            )}
          >
            <span className="sr-only">Next month</span>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs leading-6 text-gray-500 dark:text-gray-400">
        <div className="py-2">S</div>
        <div className="py-2">M</div>
        <div className="py-2">T</div>
        <div className="py-2">W</div>
        <div className="py-2">T</div>
        <div className="py-2">F</div>
        <div className="py-2">S</div>
      </div>
      <div className="grid grid-cols-7 text-sm">
        {days.map((day, dayIdx) => (
          <div
            key={day.toString()}
            className={clsx(
              dayIdx === 0 && colStartClasses[getDay(day)],
              'py-2'
            )}
          >
            <button
              type="button"
              onClick={() => handleDateClick(day)}
              className={clsx(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                isEqual(day, selectedDay) && 'text-white',
                !isEqual(day, selectedDay) && isToday(day) && 'text-blue-500 dark:text-blue-400',
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  isSameMonth(day, firstDayCurrentMonth) &&
                  'text-gray-900 dark:text-gray-100',
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  !isSameMonth(day, firstDayCurrentMonth) &&
                  'text-gray-400 dark:text-gray-600',
                isEqual(day, selectedDay) &&
                  isToday(day) &&
                  'bg-blue-500 dark:bg-blue-400',
                isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  'bg-gray-900 dark:bg-gray-100',
                !isEqual(day, selectedDay) &&
                  'hover:bg-gray-100 dark:hover:bg-gray-700/50',
                (isEqual(day, selectedDay) || isToday(day)) &&
                  'font-semibold'
              )}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')}>
                {format(day, 'd')}
              </time>
            </button>

            {isPublicHoliday() && (
              <div className="mx-auto mt-1">
                <div className={clsx(
                  'h-1 w-1 rounded-full',
                  isEqual(day, selectedDay)
                    ? 'bg-white'
                    : 'bg-blue-500 dark:bg-blue-400'
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 