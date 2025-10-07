import { MultiRangeCalendar } from '@/shared/components/ui/multi-range-calendar';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { DateList } from '@/features/optimizer/components/company-days-date-list';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useCallback } from 'react';

export function PreBookedDaysStep() {
  const title = 'Pre-Booked Vacation Days';
  const colorScheme = 'blue';
  const dateListColorScheme = 'violet';
  const {
    preBookedDays,
    addPreBookedDay,
    removePreBookedDay,
    selectedYear,
    customStartDate,
    customEndDate
  } = useOptimizerForm();

  // Convert preBookedDays to Date objects for the calendar
  const selectedDates = preBookedDays.map(day => parse(day.date, 'yyyy-MM-dd', new Date()));

  const handleDateChange = useCallback((newDates: Date[]) => {
    // Add new dates
    newDates.forEach(date => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      if (!preBookedDays.some(day => day.date === formattedDate)) {
        addPreBookedDay(formattedDate, format(date, 'MMMM d, yyyy'));
      }
    });

    // Remove dates that were deselected
    preBookedDays.forEach(day => {
      const dayDate = parse(day.date, 'yyyy-MM-dd', new Date());
      if (!newDates.some(d => d.toDateString() === dayDate.toDateString())) {
        removePreBookedDay(day.date);
      }
    });
  }, [preBookedDays, addPreBookedDay, removePreBookedDay]);

  const titleWithInfo = (
    <StepTitleWithInfo
      title="Pre-Booked Vacation Days"
      colorScheme={colorScheme}
      badge={{ label: 'Optional' }}
      tooltip={{
        title: 'Already Planned Time Off',
        description:
          "Add any vacation days you've already requested, approved, or booked. The optimizer will account for these days and suggest additional PTO to maximize your remaining time off.",
        ariaLabel: 'About pre-booked vacation days',
      }}
    />
  );

  // Filter pre-booked days for display
  const filteredPreBookedDays = preBookedDays.filter(day => {
    if (!customStartDate || !customEndDate) return true;

    const dayDate = parse(day.date, 'yyyy-MM-dd', new Date());
    const startDate = parse(customStartDate, 'yyyy-MM-dd', new Date());
    const endDate = parse(customEndDate, 'yyyy-MM-dd', new Date());

    return dayDate >= startDate && dayDate <= endDate;
  });

  // Format date range for description
  const startDate = customStartDate ? parse(customStartDate, 'yyyy-MM-dd', new Date()) : null;
  const endDate = customEndDate ? parse(customEndDate, 'yyyy-MM-dd', new Date()) : null;

  const dateRangeText = startDate && endDate
    ? `${format(startDate, 'MMM yyyy')} – ${format(endDate, 'MMM yyyy')}`
    : selectedYear.toString();

  return (
    <FormSection colorScheme={colorScheme} headingId="pre-booked-days-heading">
      <StepHeader
        number={5}
        title={titleWithInfo}
        description={`Add any vacation days you've already planned or approved for ${dateRangeText}. The optimizer will factor these in when suggesting additional PTO.`}
        colorScheme={colorScheme}
        id="pre-booked-days-heading"
      />

      <fieldset className="space-y-6 border-0 m-0 p-0" aria-labelledby="pre-booked-days-heading">
        <legend className="sr-only">Pre-booked vacation days selection</legend>

        <div>
          <label className="block mb-3">
            <span className="sr-only">Select vacation days</span>
            <span className="block text-sm text-gray-600">
              Click a date twice for single days, or select start and end dates for ranges
            </span>
          </label>

          <MultiRangeCalendar
            selectedDates={selectedDates}
            onChange={handleDateChange}
            className="w-full"
          />
        </div>

        {filteredPreBookedDays.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              {filteredPreBookedDays.length} {filteredPreBookedDays.length === 1 ? 'day' : 'days'} pre-booked
            </p>
          </div>
        )}
      </fieldset>
    </FormSection>
  );
}
