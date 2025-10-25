'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, DateRange, Matcher } from 'react-day-picker';

import { cn } from '@/shared/lib/utils';
import { buttonVariants } from '@/shared/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        range_end: 'range-end',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside:
          'outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeft {...props} className="h-4 w-4" />;
          }
          return <ChevronRight {...props} className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

// Types for multi-select calendar
export interface MultiSelectCalendarProps extends Omit<CalendarProps, 'mode' | 'selected' | 'onSelect' | 'required'> {
  mode: 'multiple-ranges' | 'multiple-singles' | 'mixed';
  selectedRanges?: DateRange[];
  selectedDates?: Date[];
  onRangesChange?: (ranges: DateRange[]) => void;
  onDatesChange?: (dates: Date[]) => void;
  maxRanges?: number;
  maxDates?: number;
}

const isDateInRanges = (date: Date, ranges: DateRange[]): boolean => {
  return ranges.some(range => {
    if (!range.from) return false;
    if (!range.to) {
      return date.toDateString() === range.from.toDateString();
    }
    return date >= range.from && date <= range.to;
  });
};

const isDateSelected = (date: Date, dates: Date[]): boolean => {
  return dates.some(d => d.toDateString() === date.toDateString());
};

const buildModifiers = (dates: Date[], ranges: DateRange[]): Record<string, Matcher> => {
  if (dates.length === 0 && ranges.length === 0) {
    return {};
  }

  return {
    selected: (date: Date) =>
      isDateSelected(date, dates) || isDateInRanges(date, ranges),
  };
};

function MultiSelectCalendar({
  className,
  classNames,
  mode,
  selectedRanges = [],
  selectedDates = [],
  onRangesChange,
  onDatesChange,
  maxRanges,
  maxDates,
  showOutsideDays = true,
  ...props
}: MultiSelectCalendarProps) {
  const [internalRanges, setInternalRanges] = React.useState<DateRange[]>(selectedRanges);
  const [internalDates, setInternalDates] = React.useState<Date[]>(selectedDates);
  const [currentRangeStart, setCurrentRangeStart] = React.useState<Date | undefined>();

  // Sync with external state
  React.useEffect(() => {
    setInternalRanges(selectedRanges);
  }, [selectedRanges]);

  React.useEffect(() => {
    setInternalDates(selectedDates);
  }, [selectedDates]);

  // Handle day click for range selection
  const handleRangeClick = (date: Date | undefined) => {
    if (!date) return;

    if (mode === 'multiple-singles') {
      // Handle single date selection
      setInternalDates((prev) => {
        const exists = isDateSelected(date, prev);
        let newDates: Date[];

        if (exists) {
          // Remove the date if already selected
          newDates = prev.filter((d) => d.toDateString() !== date.toDateString());
        } else {
          // Add the date if not at max limit
          if (maxDates && prev.length >= maxDates) {
            return prev;
          }
          newDates = [...prev, date];
        }

        // Call callback after state update using setTimeout
        setTimeout(() => onDatesChange?.(newDates), 0);
        return newDates;
      });
      return;
    }

    // Handle range selection (multiple-ranges or mixed mode)
    if (!currentRangeStart) {
      // Start a new range
      setCurrentRangeStart(date);
      setInternalRanges((prev) => {
        if (maxRanges && prev.length >= maxRanges) {
          return prev;
        }
        const newRanges = [...prev, { from: date, to: undefined }];
        // Don't call callback here - it will be called after state update
        return newRanges;
      });
    } else {
      // Complete the range
      const from = currentRangeStart <= date ? currentRangeStart : date;
      const to = currentRangeStart <= date ? date : currentRangeStart;

      setInternalRanges((prev) => {
        const newRanges = prev.map((range, index) =>
          index === prev.length - 1 ? { from, to } : range
        );
        // Call callback after state update using setTimeout
        setTimeout(() => onRangesChange?.(newRanges), 0);
        return newRanges;
      });
      setCurrentRangeStart(undefined);
    }
  };

  // Handle mixed mode - allow both range and single date selection
  const handleMixedClick = (date: Date | undefined) => {
    if (!date) return;

    // Check if clicking on an already selected single date to deselect it
    if (isDateSelected(date, internalDates)) {
      setInternalDates((prev) => {
        const newDates = prev.filter((d) => d.toDateString() !== date.toDateString());
        // Call callback after state update using setTimeout
        setTimeout(() => onDatesChange?.(newDates), 0);
        return newDates;
      });
      return;
    }

    // Check if clicking on a date within a range to remove that range
    const rangeIndex = internalRanges.findIndex((range) => {
      if (!range.from) return false;
      if (!range.to) return date.toDateString() === range.from.toDateString();
      return date >= range.from && date <= range.to;
    });

    if (rangeIndex !== -1) {
      setInternalRanges((prev) => {
        const newRanges = prev.filter((_, index) => index !== rangeIndex);
        // Call callback after state update using setTimeout
        setTimeout(() => onRangesChange?.(newRanges), 0);
        return newRanges;
      });
      setCurrentRangeStart(undefined);
      return;
    }

    // Default to range selection behavior in mixed mode
    handleRangeClick(date);
  };

  // Create modifiers for selected dates and ranges
  const modifiers = buildModifiers(internalDates, internalRanges);

  const handleDayClick = mode === 'mixed' ? handleMixedClick : handleRangeClick;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      modifiers={modifiers}
      onDayClick={handleDayClick}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal'
        ),
        today: 'bg-accent text-accent-foreground',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeft {...props} className="h-4 w-4" />;
          }
          return <ChevronRight {...props} className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
MultiSelectCalendar.displayName = 'MultiSelectCalendar';

export { Calendar, MultiSelectCalendar };
