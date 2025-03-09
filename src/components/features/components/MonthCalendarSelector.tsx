import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DayClickEventHandler } from 'react-day-picker';
import { useEffect, useState } from 'react';
import { startOfMonth, startOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

interface MonthCalendarSelectorProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  colorScheme: 'amber' | 'violet';
  minDate?: Date;
  maxDate?: Date;
  id?: string;
  year?: number;
}

// Shared NavigationIcon component
type NavigationIconProps = {
  ariaLabel: string;
  Icon: LucideIcon;
  className?: string;
  colorScheme: 'amber' | 'violet';
  [key: string]: unknown; // Allow other props to be passed
};

const NavigationIcon = ({ ariaLabel, Icon, className, colorScheme, ...props }: NavigationIconProps) => (
  <span
    {...props}
    aria-label={ariaLabel}
    tabIndex={0}
    className={cn(
      'flex items-center justify-center',
      'rounded-md',
      'h-7 w-7',
      'bg-transparent',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      colorScheme === 'amber' ? 'focus-visible:ring-amber-500' : 'focus-visible:ring-violet-500',
      'disabled:opacity-40 disabled:pointer-events-none',
      className
    )}
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
  </span>
);

export function MonthCalendarSelector({
  selectedDates,
  onDateSelect,
  colorScheme,
  minDate,
  maxDate,
  id,
  year,
}: MonthCalendarSelectorProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    // If year is provided, use January of that year as the starting month
    if (year) {
      return startOfYear(new Date(year, 0, 1));
    }
    // Otherwise, use the current month
    return startOfMonth(new Date());
  });

  // Update the calendar when the year changes
  useEffect(() => {
    if (year) {
      setCurrentDate(startOfYear(new Date(year, 0, 1)));
    }
  }, [year]);

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) return;
    onDateSelect(day);
  };

  const isDateDisabled = (date: Date): boolean => {
    // If year is provided, only allow dates from that year
    if (year && date.getFullYear() !== year) {
      return true;
    }
    
    if (!minDate && !maxDate) return false;
    const isBeforeMin = minDate ? date < startOfMonth(minDate) : false;
    const isAfterMax = maxDate ? date > maxDate : false;
    return isBeforeMin || isAfterMax;
  };

  const colorStyles = {
    amber: {
      selected: 'bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50 shadow-amber-200/50 dark:shadow-amber-900/50',
      hover: 'hover:bg-amber-50 dark:hover:bg-amber-800 hover:text-amber-950 dark:hover:text-amber-50',
      ring: 'focus-visible:ring-4 focus-visible:ring-amber-500/50 dark:focus-visible:ring-amber-400/50',
      today: 'ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-50 dark:bg-amber-900',
      cell: '[&:has([aria-selected])]:bg-amber-50 dark:[&:has([aria-selected])]:bg-amber-900/70 [&:has([aria-selected])]:shadow-sm',
      header: 'text-amber-950 dark:text-amber-100',
      nav: {
        button: 'hover:bg-amber-50 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 hover:text-amber-950 dark:hover:text-amber-50',
        icon: 'text-amber-700 dark:text-amber-300',
      },
    },
    violet: {
      selected: 'bg-violet-100 text-violet-950 dark:bg-violet-900 dark:text-violet-50 shadow-violet-200/50 dark:shadow-violet-900/50',
      hover: 'hover:bg-violet-50 dark:hover:bg-violet-800 hover:text-violet-950 dark:hover:text-violet-50',
      ring: 'focus-visible:ring-4 focus-visible:ring-violet-500/50 dark:focus-visible:ring-violet-400/50',
      today: 'ring-2 ring-violet-400 dark:ring-violet-500 bg-violet-50 dark:bg-violet-900',
      cell: '[&:has([aria-selected])]:bg-violet-50 dark:[&:has([aria-selected])]:bg-violet-900/70 [&:has([aria-selected])]:shadow-sm',
      header: 'text-violet-950 dark:text-violet-100',
      nav: {
        button: 'hover:bg-violet-50 dark:hover:bg-violet-800 text-violet-900 dark:text-violet-100 hover:text-violet-950 dark:hover:text-violet-50',
        icon: 'text-violet-700 dark:text-violet-300',
      },
    },
  };

  const calendarType = colorScheme === 'amber' ? 'holidays' : 'company days';

  return (
    <section
      aria-label={`Calendar for selecting ${calendarType}`}
      id={id}
      className="relative"
    >
      <div className="sr-only">
        <h2>Calendar Navigation Instructions</h2>
        <ul>
          <li>Use Tab and Shift+Tab to navigate between calendar elements</li>
          <li>Use arrow keys to move between days</li>
          <li>Press Space or Enter to select a date</li>
          <li>Use Page Up/Down to move between months</li>
          <li>Use the &ldquo;Previous month&rdquo; and &ldquo;Next month&rdquo; buttons to navigate between months</li>
          <li>Press Tab to reach the month navigation buttons and Space or Enter to activate them</li>
        </ul>
      </div>

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
          'w-full select-none rounded-2xl border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900',
          'shadow-sm',
          'p-3.5 sm:p-4',
          'ring-1 ring-black/5 dark:ring-white/10'
        )}
        pagedNavigation
        modifiersClassNames={{
          selected: 'selected-day',
        }}
        modifiers={{
          today: new Date(),
        }}
        components={{
          IconLeft: (props) => (
            <NavigationIcon 
              {...props}
              ariaLabel="Go to previous month" 
              Icon={ChevronLeft} 
              colorScheme={colorScheme}
            />
          ),
          IconRight: (props) => (
            <NavigationIcon 
              {...props}
              ariaLabel="Go to next month" 
              Icon={ChevronRight} 
              colorScheme={colorScheme}
            />
          ),
        }}
        classNames={{
          months: 'flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0',
          month: cn(
            'space-y-4 w-full rounded-xl',
            'transition-opacity duration-200 ease-in-out'
          ),
          caption: cn(
            'flex justify-center pt-1 relative items-center h-9',
            'mb-2',
            colorStyles[colorScheme].header,
          ),
          caption_label: 'text-sm font-semibold tracking-wide',
          nav: 'space-x-1 flex items-center absolute inset-0',
          nav_button: cn(
            'h-7 w-7 bg-transparent rounded-lg transition-all duration-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'active:scale-95',
            'focus-visible:outline-none focus-visible:ring-4',
            'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
            'focus:ring-offset-2',
            'focus:ring-2',
            'focus-visible:ring-2',
            'focus-visible:ring-offset-2',
            colorStyles[colorScheme].nav.button,
          ),
          nav_button_previous: cn(
            'absolute left-1 flex items-center justify-center opacity-85 hover:opacity-100',
            'focus:outline-none focus:ring-4 focus:ring-offset-2',
            colorScheme === 'amber' ? 'focus:ring-amber-500/50' : 'focus:ring-violet-500/50',
            'cursor-pointer',
            'transition-all duration-200',
            'h-7 w-7 rounded-md',
            'focus-visible:ring-4',
            'aria-disabled:opacity-50 aria-disabled:pointer-events-none',
            'focus-visible:ring-offset-2',
            colorScheme === 'amber' ? 'focus-visible:ring-amber-500/50' : 'focus-visible:ring-violet-500/50'
          ),
          nav_button_next: cn(
            'absolute right-1 flex items-center justify-center opacity-85 hover:opacity-100',
            'focus:outline-none focus:ring-4 focus:ring-offset-2',
            colorScheme === 'amber' ? 'focus:ring-amber-500/50' : 'focus:ring-violet-500/50',
            'cursor-pointer',
            'transition-all duration-200',
            'h-7 w-7 rounded-md',
            'focus-visible:ring-4',
            'aria-disabled:opacity-50 aria-disabled:pointer-events-none',
            'focus-visible:ring-offset-2',
            colorScheme === 'amber' ? 'focus-visible:ring-amber-500/50' : 'focus-visible:ring-violet-500/50'
          ),
          table: 'w-full border-collapse space-y-1',
          head_row: 'flex w-full border-b border-gray-200 dark:border-gray-700',
          head_cell: cn(
            'flex-1 pb-2 text-center text-xs font-medium tracking-widest uppercase',
            'text-gray-600 dark:text-gray-400',
            '[&:first-child]:text-red-600/90 dark:[&:first-child]:text-red-400',
            'select-none transition-colors duration-200'
          ),
          row: 'flex w-full mt-2',
          cell: cn(
            'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
            colorStyles[colorScheme].cell,
            'first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
            'h-8 w-full'
          ),
          day: cn(
            'h-8 w-full p-0 font-normal',
            'aria-selected:opacity-100',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'active:scale-90',
            colorStyles[colorScheme].hover,
            'focus-visible:outline-none focus-visible:ring-4',
            colorStyles[colorScheme].ring,
            'focus-visible:ring-offset-1',
            'transition-all duration-150 ease-out',
            'rounded-md',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent',
            'text-gray-900 dark:text-gray-100'
          ),
          day_today: cn(
            'bg-gray-50 dark:bg-gray-800',
            'font-semibold',
            colorStyles[colorScheme].today,
            'shadow-sm'
          ),
          day_outside: cn(
            'text-gray-500 dark:text-gray-500 opacity-50 hover:opacity-70',
            'transition-opacity duration-200'
          ),
          day_disabled: cn(
            'text-gray-400 dark:text-gray-600 opacity-40',
            'cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
            'select-none'
          ),
          day_range_middle: 'aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800',
          day_hidden: 'invisible',
          day_selected: cn(
            colorStyles[colorScheme].selected,
            'font-medium shadow-sm',
            'scale-[0.95]'
          ),
        }}
      />
    </section>
  );
} 