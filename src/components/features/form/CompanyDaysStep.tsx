import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useCompanyDays } from '@/hooks/useOptimizer';
import { DateList } from '@/components/features/CompanyDaysDateList';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizer } from '@/contexts/OptimizerContext';

export function CompanyDaysStep() {
  const title = 'Selected Company Days';
  const colorScheme = 'violet';
  const { companyDaysOff, addCompanyDay, removeCompanyDay } = useCompanyDays();
  const { state } = useOptimizer();
  const { selectedYear } = state;

  const handleCompanyDaySelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = companyDaysOff.some(day => day.date === formattedDate);

    if (isSelected) {
      removeCompanyDay(formattedDate);
    } else {
      addCompanyDay(formattedDate, format(date, 'MMMM d, yyyy'));
    }
  };

  // Using the new StepTitleWithInfo component
  const titleWithInfo = (
    <StepTitleWithInfo
      title="Company Days Off"
      colorScheme={colorScheme}
      badge={{ label: "Optional" }}
      tooltip={{
        title: "About Company Days Off",
        description: "Company days off are special non-working days your company provides that don't count against your PTO (e.g., Summer Fridays, company holidays, or gifted days off). Unlike company retreats or team events where you still have work obligations, these are true days off where you're not required to work at all. Adding these helps the optimizer avoid suggesting PTO on days you already have free.",
        ariaLabel: "About company days off"
      }}
    />
  );

  const selectedDates = companyDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()));

  return (
    <FormSection colorScheme={colorScheme} headingId="company-days-heading">
      <StepHeader
        number={4}
        title={titleWithInfo}
        description={`Select your company's special non-working days for ${selectedYear} (like Summer Fridays or company holidays) that don't count against your PTO. Group and rename multiple dates together for easier management.`}
        colorScheme={colorScheme}
        id="company-days-heading"
      />

      <fieldset className="space-y-6 border-0 m-0 p-0" aria-labelledby="company-days-heading">
        <legend className="sr-only">Company days off selection</legend>
        <MonthCalendarSelector
          id="company-days-calendar"
          selectedDates={selectedDates}
          onDateSelect={handleCompanyDaySelect}
          colorScheme={colorScheme}
          year={selectedYear}
        />

        <DateList title={title} colorScheme={colorScheme} />
      </fieldset>
    </FormSection>
  );
} 