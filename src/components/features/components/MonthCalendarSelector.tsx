import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DayClickEventHandler } from "react-day-picker";
import { useEffect, useState } from "react";
import { format, isSameMonth, startOfMonth } from "date-fns";

interface MonthCalendarSelectorProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  month: number;
  year: number;
  minDate?: Date;
  maxDate?: Date;
}

export function MonthCalendarSelector({ 
  selectedDates, 
  onDateSelect, 
  month: initialMonth, 
  year: initialYear,
  minDate,
  maxDate 
}: MonthCalendarSelectorProps) {
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date(initialYear, initialMonth)));

  // Sync with parent component's month/year
  useEffect(() => {
    const newDate = startOfMonth(new Date(initialYear, initialMonth));
    if (!isSameMonth(currentDate, newDate)) {
      setCurrentDate(newDate);
    }
  }, [initialMonth, initialYear, currentDate]);

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

  return (
    <Calendar
      mode="multiple"
      selected={selectedDates}
      onDayClick={handleDayClick}
      month={currentDate}
      showOutsideDays={true}
      fromDate={minDate}
      toDate={maxDate}
      disabled={isDateDisabled}
      className={cn(
        "w-full select-none rounded-2xl border border-gray-200/60 dark:border-gray-700/30",
        "bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-800/80 dark:to-gray-800/40",
        "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]",
        "backdrop-blur-sm p-3"
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "hidden", // Hide the default caption since we have our custom one
        nav: "hidden", // Hide the default navigation
        table: "w-full border-collapse",
        head_row: "flex w-full",
        head_cell: cn(
          "text-gray-500 dark:text-gray-400 rounded-md w-full font-normal text-[0.8rem]",
          "first-letter:uppercase text-center"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-amber-50/50 dark:[&:has([aria-selected])]:bg-amber-900/20",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
          "h-9 w-full"
        ),
        day: cn(
          "h-9 w-full p-0 font-normal",
          "aria-selected:opacity-100",
          "hover:bg-amber-50/80 dark:hover:bg-amber-900/30 hover:text-amber-900 dark:hover:text-amber-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70 dark:focus-visible:ring-amber-400/70 focus-visible:ring-offset-2",
          "transition-all duration-200 ease-in-out",
          "rounded-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
        ),
        day_today: cn(
          "bg-white dark:bg-gray-800",
          "ring-2 ring-amber-200/70 dark:ring-amber-700/70"
        ),
        day_outside: "text-gray-400 dark:text-gray-600 opacity-50",
        day_disabled: "text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent",
        day_range_middle: "aria-selected:bg-amber-50 aria-selected:text-amber-900",
        day_hidden: "invisible",
        day_selected: cn(
          "bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/60 dark:to-amber-800/40",
          "text-amber-900 dark:text-amber-100",
          "hover:bg-amber-100/90 dark:hover:bg-amber-900/50",
          "shadow-[0_2px_8px_-2px_rgba(251,191,36,0.3)] dark:shadow-[0_2px_8px_-2px_rgba(251,191,36,0.2)]",
          "font-medium"
        ),
      }}
    />
  );
} 