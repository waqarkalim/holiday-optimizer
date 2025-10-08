import { SingleDateCalendar } from '@/shared/components/ui/single-date-calendar';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { DateList } from '@/features/optimizer/components/company-days-date-list';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useCallback } from 'react';

export function CompanyDaysStep() {
  const title = 'Selected Company Days';
  const colorScheme = 'violet';
  const { companyDaysOff, addCompanyDay, removeCompanyDay, selectedYear, customStartDate, customEndDate, weekendDays, holidays } = useOptimizerForm();

  // Convert companyDaysOff to Date objects for the calendar
  const selectedDates = companyDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()));

  const handleDateChange = useCallback((newDates: Date[]) => {
    // Add new dates
    newDates.forEach(date => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      if (!companyDaysOff.some(day => day.date === formattedDate)) {
        addCompanyDay(formattedDate, format(date, 'MMMM d, yyyy'));
      }
    });

    // Remove dates that were deselected
    companyDaysOff.forEach(day => {
      const dayDate = parse(day.date, 'yyyy-MM-dd', new Date());
      if (!newDates.some(d => d.toDateString() === dayDate.toDateString())) {
        removeCompanyDay(day.date);
      }
    });
  }, [companyDaysOff, addCompanyDay, removeCompanyDay]);

  // Using the new StepTitleWithInfo component
  const titleWithInfo = (
    <StepTitleWithInfo
      title="Company Days Off"
      colorScheme={colorScheme}
      badge={{ label: 'Optional' }}
      tooltip={{
        title: 'Company Days Off',
        description:
          "These are non-working days your company provides that don't count against your PTO, such as company holidays or special days off. Adding these helps avoid scheduling PTO on days you already have free.",
        ariaLabel: 'About company days off',
      }}
    />
  );

  // Filter company days for display in the date range text
  const filteredCompanyDays = companyDaysOff.filter(day => {
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
    <FormSection colorScheme={colorScheme} headingId="company-days-heading">
      <StepHeader
        number={6}
        title={titleWithInfo}
        description={`Add your company's special non-working days for ${dateRangeText} that don't count against your PTO.`}
        colorScheme={colorScheme}
        id="company-days-heading"
      />

      <fieldset className="space-y-6 border-0 m-0 p-0" aria-labelledby="company-days-heading">
        <legend className="sr-only">Company days off selection</legend>

        <div>
          <SingleDateCalendar
            selectedDates={selectedDates}
            onChange={handleDateChange}
            className="w-full"
            weekendDays={weekendDays}
            holidays={holidays}
          />
        </div>

        <DateList title={title} colorScheme={colorScheme} />
      </fieldset>
    </FormSection>
  );
}
