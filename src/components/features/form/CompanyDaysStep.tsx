import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { DateList } from '../components/DateList';
import { parse } from 'date-fns';
import { CompanyDaysStepProps } from './types';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';

export function CompanyDaysStep({
  companyDaysOff,
  onCompanyDaySelect,
  onCompanyDayRemove,
  onClearCompanyDays,
  onCompanyDayNameUpdate,
}: CompanyDaysStepProps) {
  const handleBulkRename = (indices: number[], newName: string) => {
    indices.forEach(index => {
      onCompanyDayNameUpdate(index, newName);
    });
  };

  return (
    <FormSection colorScheme="violet" headingId="company-days-heading">
      <StepHeader
        number={4}
        title="Company Days Off"
        description="Select your company's special days off (like Summer Fridays or team events). Select multiple dates to rename them together."
        colorScheme="violet"
        id="company-days-heading"
      />

      <div className="space-y-6" role="group" aria-labelledby="company-days-heading">
        {/* Calendar Selection */}
        <MonthCalendarSelector
          id="company-days-calendar"
          selectedDates={companyDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()))}
          onDateSelect={onCompanyDaySelect}
          colorScheme="violet"
        />

        {/* Selected Company Days List */}
        <DateList
          items={companyDaysOff}
          title="Selected Company Days"
          colorScheme="violet"
          onRemove={onCompanyDayRemove}
          onClearAll={onClearCompanyDays}
          onUpdateName={onCompanyDayNameUpdate}
          onBulkRename={handleBulkRename}
          showBulkManagement={true}
        />
      </div>
    </FormSection>
  );
} 