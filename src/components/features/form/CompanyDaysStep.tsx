import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useCompanyDays } from '@/hooks/useOptimizer';
import { DateList } from '@/components/features/DateList';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  // Custom title with badge
  const titleWithBadge = (
    <div className="flex items-center gap-2">
      <span>Company Days Off</span>
      <Badge 
        variant="outline"
        size="sm" 
        className="font-medium text-[0.65rem] px-1.5 
                  bg-violet-50/50 text-violet-600 border-violet-200
                  dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-700/30"
      >
        Optional
      </Badge>
    </div>
  );

  return (
    <FormSection colorScheme="violet" headingId="company-days-heading">
      <StepHeader
        number={4}
        title={titleWithBadge}
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
        />
      </div>
    </FormSection>
  );
} 