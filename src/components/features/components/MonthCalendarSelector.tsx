import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DayClickEventHandler } from "react-day-picker";
import { useEffect, useState } from "react";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  maxDate
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

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const colorStyles = {
    amber: {
      selected: "bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/60 dark:to-amber-800/40 text-amber-900 dark:text-amber-100 hover:bg-amber-100/90 dark:hover:bg-amber-900/50 shadow-[0_2px_8px_-2px_rgba(251,191,36,0.3)] dark:shadow-[0_2px_8px_-2px_rgba(251,191,36,0.2)]",
      hover: "hover:bg-amber-50/80 dark:hover:bg-amber-900/30 hover:text-amber-900 dark:hover:text-amber-100",
      ring: "focus-visible:ring-amber-500/70 dark:focus-visible:ring-amber-400/70",
      today: "ring-2 ring-amber-200/70 dark:ring-amber-700/70",
      cell: "[&:has([aria-selected])]:bg-amber-50/50 dark:[&:has([aria-selected])]:bg-amber-900/20",
      header: "text-amber-900 dark:text-amber-100",
      nav: {
        button: "hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
        icon: "text-amber-600/80 dark:text-amber-400/80"
      }
    },
    violet: {
      selected: "bg-gradient-to-b from-violet-100 to-violet-50 dark:from-violet-900/60 dark:to-violet-800/40 text-violet-900 dark:text-violet-100 hover:bg-violet-100/90 dark:hover:bg-violet-900/50 shadow-[0_2px_8px_-2px_rgba(139,92,246,0.3)] dark:shadow-[0_2px_8px_-2px_rgba(139,92,246,0.2)]",
      hover: "hover:bg-violet-50/80 dark:hover:bg-violet-900/30 hover:text-violet-900 dark:hover:text-violet-100",
      ring: "focus-visible:ring-violet-500/70 dark:focus-visible:ring-violet-400/70",
      today: "ring-2 ring-violet-200/70 dark:ring-violet-700/70",
      cell: "[&:has([aria-selected])]:bg-violet-50/50 dark:[&:has([aria-selected])]:bg-violet-900/20",
      header: "text-violet-900 dark:text-violet-100",
      nav: {
        button: "hover:bg-violet-50 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300",
        icon: "text-violet-600/80 dark:text-violet-400/80"
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={cn(
          "text-sm font-medium",
          colorStyles[colorScheme].header
        )}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className={cn(
              "h-8 w-8",
              colorStyles[colorScheme].nav.button
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4",
              colorStyles[colorScheme].nav.icon
            )} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className={cn(
              "h-8 w-8",
              colorStyles[colorScheme].nav.button
            )}
          >
            <ChevronRight className={cn(
              "h-4 w-4",
              colorStyles[colorScheme].nav.icon
            )} />
          </Button>
        </div>
      </div>

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
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            colorStyles[colorScheme].cell,
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
            "h-9 w-full"
          ),
          day: cn(
            "h-9 w-full p-0 font-normal",
            "aria-selected:opacity-100",
            colorStyles[colorScheme].hover,
            "focus-visible:outline-none focus-visible:ring-2",
            colorStyles[colorScheme].ring,
            "focus-visible:ring-offset-2",
            "transition-all duration-200 ease-in-out",
            "rounded-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          ),
          day_today: cn(
            "bg-white dark:bg-gray-800",
            colorStyles[colorScheme].today
          ),
          day_outside: "text-gray-400 dark:text-gray-600 opacity-50",
          day_disabled: "text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent",
          day_range_middle: "aria-selected:bg-amber-50 aria-selected:text-amber-900",
          day_hidden: "invisible",
          day_selected: cn(
            colorStyles[colorScheme].selected,
            "font-medium"
          ),
        }}
      />
    </div>
  );
} 