import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DayClickEventHandler } from 'react-day-picker';
import { useState } from 'react';
import { startOfMonth } from 'date-fns';

interface MonthCalendarSelectorProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  colorScheme: 'amber' | 'violet';
  minDate?: Date;
  maxDate?: Date;
}

export function MonthCalendarSelector({
  selectedDates,
  onDateSelect,
  colorScheme,
  minDate,
  maxDate,
}: MonthCalendarSelectorProps) {
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) return;
    onDateSelect(day);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (!minDate && !maxDate) return false;
    const isBeforeMin = minDate ? date < startOfMonth(minDate) : false;
    const isAfterMax = maxDate ? date > maxDate : false;
    return isBeforeMin || isAfterMax;
  };

  const colorStyles = {
    amber: {
      selected: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100',
      hover: 'hover:bg-amber-50/80 dark:hover:bg-amber-900/30 hover:text-amber-900 dark:hover:text-amber-100',
      ring: 'focus-visible:ring-amber-500/70 dark:focus-visible:ring-amber-400/70',
      today: 'ring-2 ring-amber-200/70 dark:ring-amber-700/70',
      cell: '[&:has([aria-selected])]:bg-amber-50/50 dark:[&:has([aria-selected])]:bg-amber-900/20',
      header: 'text-amber-900 dark:text-amber-100',
      nav: {
        button: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300',
        icon: 'text-amber-600/80 dark:text-amber-400/80',
      },
    },
    violet: {
      selected: 'bg-violet-100 text-violet-900 dark:bg-violet-900/60 dark:text-violet-100',
      hover: 'hover:bg-violet-50/80 dark:hover:bg-violet-900/30 hover:text-violet-900 dark:hover:text-violet-100',
      ring: 'focus-visible:ring-violet-500/70 dark:focus-visible:ring-violet-400/70',
      today: 'ring-2 ring-violet-200/70 dark:ring-violet-700/70',
      cell: '[&:has([aria-selected])]:bg-violet-50/50 dark:[&:has([aria-selected])]:bg-violet-900/20',
      header: 'text-violet-900 dark:text-violet-100',
      nav: {
        button: 'hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300',
        icon: 'text-violet-600/80 dark:text-violet-400/80',
      },
    },
  };

  return (
    <Calendar
      mode="multiple"
      selected={selectedDates}
      onDayClick={handleDayClick}
      month={currentDate}
      onMonthChange={setCurrentDate}
      showOutsideDays={true}
      fromDate={minDate}
      toDate={maxDate}
      disabled={isDateDisabled}
      className={cn(
        'w-full select-none rounded-2xl border border-gray-200/60 dark:border-gray-700/30',
        'bg-white dark:bg-gray-800/60',
        'shadow-sm',
        'p-3',
      )}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4 w-full',
        caption: cn(
          'flex justify-center pt-1 relative items-center h-10',
          colorStyles[colorScheme].header,
        ),
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center absolute inset-0',
        nav_button: cn(
          'h-7 w-7 bg-transparent rounded-lg transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus-visible:outline-none focus-visible:ring-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          colorStyles[colorScheme].nav.button,
        ),
        nav_button_previous: 'absolute left-1 flex items-center justify-center',
        nav_button_next: 'absolute right-1 flex items-center justify-center',
        table: 'w-full border-collapse',
        head_row: 'flex w-full border-b border-gray-100 dark:border-gray-800',
        head_cell: cn(
          'flex-1 pb-2 text-center text-[10px] font-medium tracking-widest uppercase',
          'text-gray-400 dark:text-gray-500',
          '[&:first-child]:text-red-400/60 dark:[&:first-child]:text-red-500/50',
          'select-none transition-colors duration-200'
        ),
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
          colorStyles[colorScheme].cell,
          'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
          'h-9 w-full',
        ),
        day: cn(
          'h-9 w-full p-0 font-normal',
          'aria-selected:opacity-100',
          colorStyles[colorScheme].hover,
          'focus-visible:outline-none focus-visible:ring-2',
          colorStyles[colorScheme].ring,
          'focus-visible:ring-offset-2',
          'transition-all duration-200 ease-in-out',
          'rounded-lg',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
        ),
        day_today: cn(
          'bg-white dark:bg-gray-800',
          colorStyles[colorScheme].today,
        ),
        day_outside: 'text-gray-400 dark:text-gray-600 opacity-50',
        day_disabled: 'text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
        day_range_middle: 'aria-selected:bg-amber-50 aria-selected:text-amber-900',
        day_hidden: 'invisible',
        day_selected: cn(
          colorStyles[colorScheme].selected,
          'font-medium',
        ),
      }}
    />
  );
} 