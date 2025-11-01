import { MultiRangeCalendar } from '@/shared/components/ui/multi-range-calendar';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { PreBookedDaysRangeList } from '@/features/optimizer/components/PreBookedDaysRangeList';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';

export function PreBookedDaysStep() {
  const colorScheme = 'blue';
  const {
    preBookedDays,
    addPreBookedDay,
    removePreBookedDay,
    selectedYear,
    customStartDate,
    customEndDate,
    weekendDays,
    holidays,
    companyDaysOff
  } = useOptimizerForm();

  // Convert preBookedDays to Date objects for the calendar
  const selectedDates = preBookedDays.map(day => parse(day.date, 'yyyy-MM-dd', new Date()));

  const handleDateChange = (newDates: Date[]) => {
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
  };

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
          <MultiRangeCalendar
            selectedDates={selectedDates}
            onChange={handleDateChange}
            className="w-full"
            weekendDays={weekendDays}
            holidays={holidays}
            companyDaysOff={companyDaysOff}
          />
        </div>

        <PreBookedDaysRangeList />
      </fieldset>
    </FormSection>
  );
}
