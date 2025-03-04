import { MonthCalendarSelector } from '../components/MonthCalendarSelector';
import { format, parse } from 'date-fns';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useCompanyDays } from '@/hooks/useOptimizer';
import { DateList } from '@/components/features/DateList';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const handleUpdateCompanyDayName = (date: string, newName: string) => {
    addCompanyDay(date, newName);
  };

  const handleBulkRename = (dates: string[], newName: string) => {
    dates.forEach(date => addCompanyDay(date, newName));
  };

  // Title with badge and info tooltip
  const titleWithBadge = (
    <div className="flex items-center justify-between w-full">
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
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-full p-1 hover:bg-violet-100/70 dark:hover:bg-violet-900/40 cursor-help transition-colors">
            <Info className="h-3.5 w-3.5 text-violet-500/70 dark:text-violet-400/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start" 
          className="max-w-xs bg-violet-50/95 dark:bg-violet-900/90 border-violet-100 dark:border-violet-800/40 text-violet-900 dark:text-violet-100"
        >
          <div className="space-y-2 p-1">
            <h4 className="font-medium text-violet-800 dark:text-violet-300 text-sm">About Company Days Off</h4>
            <p className="text-xs text-violet-700/90 dark:text-violet-300/90 leading-relaxed">
              Company days off are special non-working days your company provides that don&apos;t count against your PTO
              (e.g., Summer Fridays, company holidays, or gifted days off). Unlike company retreats or team events 
              where you still have work obligations, these are true days off where you&apos;re not required to work at all.
              Adding these helps the optimizer avoid suggesting PTO on days you already have free.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const selectedDates = companyDaysOff.map(day => parse(day.date, 'yyyy-MM-dd', new Date()));

  return (
    <FormSection colorScheme="violet" headingId="company-days-heading">
      <StepHeader
        number={4}
        title={titleWithBadge}
        description="Select your company's special non-working days (like Summer Fridays or company holidays) that don't count against your PTO. Group and rename multiple dates together for easier management."
        colorScheme="violet"
        id="company-days-heading"
      />

      <div className="space-y-6" role="group" aria-labelledby="company-days-heading">
        <MonthCalendarSelector
          id="company-days-calendar"
          selectedDates={selectedDates}
          onDateSelect={handleCompanyDaySelect}
          colorScheme="violet"
        />

        <DateList
          items={companyDaysOff}
          title="Selected Company Days"
          colorScheme="violet"
          onRemove={removeCompanyDay}
          onClearAll={clearCompanyDays}
          onUpdateName={handleUpdateCompanyDayName}
          onBulkRename={handleBulkRename}
          showBulkManagement={true}
          isBulkMode={true}
        />
      </div>
    </FormSection>
  );
} 