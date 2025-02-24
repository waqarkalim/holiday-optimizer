import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useCompanyDays } from '@/hooks/useOptimizer';
import { DateList } from '@/components/features/DateList';

export function CompanyDaysStep() {
  const { companyDaysOff, addCompanyDay, removeCompanyDay, clearCompanyDays } = useCompanyDays();

  const handleCompanyDaySelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const isSelected = companyDaysOff.some(day => day.date === formattedDate);

    if (isSelected) {
      removeCompanyDay(formattedDate);
    } else {
      addCompanyDay(formattedDate, format(date, 'MMMM d, yyyy'));
    }
  };

  return (
    <FormSection colorScheme="violet" headingId="company-days-heading">
      <StepHeader
        number={4}
        title="Company Days Off"
        description="Select your company's special days off (like Summer Fridays or team events). Group and rename multiple dates together for easier management."
        colorScheme="violet"
        id="company-days-heading"
      />

      <div className="space-y-6" role="group" aria-labelledby="company-days-heading">
        {/* Calendar Selection */}
        <MonthCalendarSelector
          id="company-days-calendar"
          selectedDates={companyDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()))}
          onDateSelect={handleCompanyDaySelect}
          colorScheme="violet"
        />

        {/* Selected Company Days List */}
        <DateList
          items={companyDaysOff}
          title="Selected Company Days"
          colorScheme="violet"
          onRemove={(date: string) => removeCompanyDay(date)}
          onClearAll={clearCompanyDays}
          onUpdateName={(date: string, newName: string) => {
            addCompanyDay(date, newName);
          }}
          onBulkRename={(dates: string[], newName: string) => {
            dates.forEach(date => {
              addCompanyDay(date, newName);
            });
          }}
          showBulkManagement={true}
          isBulkMode={true}
          setIsBulkMode={null}
        />
      </div>
    </FormSection>
  );
} 