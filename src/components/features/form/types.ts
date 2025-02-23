import { CompanyDayOff, OptimizationStrategy } from '@/types';

export interface FormErrors {
  days?: string;
  companyDay?: { name?: string; date?: string };
  holiday?: { name?: string; date?: string };
}

export interface FormStepProps {
  errors?: FormErrors;
  colorScheme?: string;
}

export interface DaysInputStepProps extends FormStepProps {
  days: string;
  onDaysChange: (days: string) => void;
}

export interface StrategySelectionStepProps extends FormStepProps {
  strategy: OptimizationStrategy;
  onStrategyChange: (strategy: OptimizationStrategy) => void;
}

export interface HolidaysStepProps extends FormStepProps {
  holidays: Array<{ date: string; name: string }>;
  onHolidaySelect: (date: Date) => void;
  onHolidayRemove: (index: number) => void;
  onClearHolidays: () => void;
  onAutoDetect: () => void;
  onHolidayNameUpdate: (index: number, newName: string) => void;
}

export interface CompanyDaysStepProps extends FormStepProps {
  companyDaysOff: CompanyDayOff[];
  onCompanyDaySelect: (date: Date) => void;
  onCompanyDayRemove: (index: number) => void;
  onClearCompanyDays: () => void;
  onCompanyDayNameUpdate: (index: number, newName: string) => void;
} 