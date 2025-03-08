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
        title: "Company Days Off",
        description: "These are non-working days your company provides that don't count against your PTO, such as company holidays or special days off. Adding these helps avoid scheduling PTO on days you already have free.",
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
        description={`Add your company's special non-working days for ${selectedYear} that don't count against your PTO.`}
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