import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { format, parse } from 'date-fns';
import { ChangeEvent, useEffect, useState } from 'react';
import { Calendar, CalendarDays, Edit3 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const DATE_FORMAT = 'yyyy-MM-dd';

type TimeframePresetOption = {
  id: string; // Will be like 'calendar-2025', 'fiscal-12month', or 'custom'
  type: 'calendar' | 'fiscal' | 'custom';
  year?: number;
  label: string;
  description: string;
  icon: typeof Calendar;
};

const MONTH_OPTIONS = [
  { value: 0, label: 'Jan', fullLabel: 'January' },
  { value: 1, label: 'Feb', fullLabel: 'February' },
  { value: 2, label: 'Mar', fullLabel: 'March' },
  { value: 3, label: 'Apr', fullLabel: 'April' },
  { value: 4, label: 'May', fullLabel: 'May' },
  { value: 5, label: 'Jun', fullLabel: 'June' },
  { value: 6, label: 'Jul', fullLabel: 'July' },
  { value: 7, label: 'Aug', fullLabel: 'August' },
  { value: 8, label: 'Sep', fullLabel: 'September' },
  { value: 9, label: 'Oct', fullLabel: 'October' },
  { value: 10, label: 'Nov', fullLabel: 'November' },
  { value: 11, label: 'Dec', fullLabel: 'December' },
];

const buildTimeframeOptions = (currentYear: number): TimeframePresetOption[] => {
  const options: TimeframePresetOption[] = [];

  // Current year and next year Calendar Year options
  for (let i = 0; i < 2; i++) {
    const year = currentYear + i;

    options.push({
      id: `calendar-${year}`,
      type: 'calendar',
      year,
      label: `Calendar Year ${year}`,
      description: `Jan 1 – Dec 31`,
      icon: Calendar,
    });
  }

  // 12-Month Period (Fiscal Year - flexible) - handles all custom date ranges
  options.push({
    id: 'fiscal-12month',
    type: 'fiscal',
    label: '12-Month Period',
    description: 'Choose your start month and year',
    icon: CalendarDays,
  });

  return options;
};

const formatRangeLabel = (startISO: string, endISO: string) => {
  const start = parse(startISO, DATE_FORMAT, new Date());
  const end = parse(endISO, DATE_FORMAT, new Date());
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
};

export function TimeframeStep() {
  const {
    selectedYear,
    setSelectedYear,
    timeframePreset,
    applyTimeframePreset,
    customStartDate,
    customEndDate,
    setCustomStartDate,
    setCustomEndDate,
  } = useOptimizerForm();

  const currentYear = new Date().getFullYear();
  const presetOptions = buildTimeframeOptions(currentYear);

  // For fiscal year, track the start month (default to July - common fiscal year start)
  const [fiscalStartMonth, setFiscalStartMonth] = useState(6); // July
  const [fiscalStartYear, setFiscalStartYear] = useState(currentYear);

  // Determine the selected option ID based on current state
  const selectedOptionId =
    timeframePreset === 'fiscal' ? 'fiscal-12month' :
    `${timeframePreset}-${selectedYear}`;

  const titleWithInfo = (
    <StepTitleWithInfo
      title="Select Your Timeframe"
      colorScheme="blue"
      tooltip={{
        title: 'Planning Timeframe',
        description:
          'Choose the period you want to plan for. You can select a calendar year (Jan–Dec), a 12-month period starting any month, or define a custom range. Your holidays and company days will automatically filter to match your selection.',
        ariaLabel: 'About planning timeframe',
      }}
    />
  );

  const handlePresetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value;
    const option = presetOptions.find(opt => opt.id === optionId);

    if (!option) return;

    if (option.type === 'fiscal') {
      // Apply fiscal year based on current start month
      const startDate = new Date(fiscalStartYear, fiscalStartMonth, 1);
      const endDate = new Date(fiscalStartYear + 1, fiscalStartMonth, 0); // Last day of month before start month next year

      setCustomStartDate(format(startDate, DATE_FORMAT));
      setCustomEndDate(format(endDate, DATE_FORMAT));
      applyTimeframePreset('fiscal', fiscalStartYear);
    } else if (option.year) {
      setSelectedYear(option.year);
      applyTimeframePreset(option.type, option.year);
    }
  };

  const handleFiscalMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(event.target.value, 10);
    setFiscalStartMonth(month);

    // Update the fiscal year dates without changing the preset type
    const startDate = new Date(fiscalStartYear, month, 1);
    const endDate = new Date(fiscalStartYear + 1, month, 0);

    setCustomStartDate(format(startDate, DATE_FORMAT));
    setCustomEndDate(format(endDate, DATE_FORMAT));
    // Keep the preset as 'fiscal' - don't trigger preset change
  };

  const handleFiscalYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    setFiscalStartYear(year);

    // Update the fiscal year dates without changing the preset type
    const startDate = new Date(year, fiscalStartMonth, 1);
    const endDate = new Date(year + 1, fiscalStartMonth, 0);

    setCustomStartDate(format(startDate, DATE_FORMAT));
    setCustomEndDate(format(endDate, DATE_FORMAT));
    // Keep the preset as 'fiscal' - don't trigger preset change
  };

  return (
    <FormSection colorScheme="blue" headingId="timeframe-heading">
      <StepHeader
        number={2}
        title={titleWithInfo}
        description="Select the time period you want to plan for. Your holidays and company days will automatically adjust to show only what's relevant for your selected timeframe."
        colorScheme="blue"
        id="timeframe-heading"
      />

      <fieldset className="border-0 m-0 p-0 space-y-3" aria-labelledby="timeframe-heading">
        <legend className="sr-only">Timeframe selection</legend>

        <div className="space-y-2">
          {presetOptions.map(option => {
            const Icon = option.icon;
            const isSelected = selectedOptionId === option.id;

            return (
              <div key={option.id} className="relative">
                <label
                  htmlFor={`timeframe-${option.id}`}
                  className={cn(
                    'flex items-start p-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                    'focus-within:ring-2 focus-within:ring-blue-400',
                    isSelected
                      ? 'bg-blue-50/80 ring-1 ring-blue-900/10'
                      : 'bg-white ring-1 ring-gray-200 hover:ring-blue-200'
                  )}
                >
                  <input
                    type="radio"
                    id={`timeframe-${option.id}`}
                    name="timeframe-preset"
                    value={option.id}
                    checked={isSelected}
                    onChange={handlePresetChange}
                    className="absolute opacity-0 h-0 w-0"
                    tabIndex={0}
                    aria-describedby={`timeframe-description-${option.id}`}
                  />
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={cn(
                        'p-2 rounded-md mt-0.5',
                        isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-900">{option.label}</p>
                      <p
                        id={`timeframe-description-${option.id}`}
                        className="text-xs leading-relaxed text-gray-600 mt-1"
                      >
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </label>
              </div>
            );
          })}
        </div>

        {/* 12-Month Period configuration - shown when fiscal year is selected */}
        {timeframePreset === 'fiscal' && (
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="fiscal-start-month" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Start month
                </label>
                <select
                  id="fiscal-start-month"
                  value={fiscalStartMonth}
                  onChange={handleFiscalMonthChange}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem',
                  }}
                >
                  {MONTH_OPTIONS.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.fullLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-32">
                <label htmlFor="fiscal-start-year" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Year
                </label>
                <select
                  id="fiscal-start-year"
                  value={fiscalStartYear}
                  onChange={handleFiscalYearChange}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem',
                  }}
                >
                  {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {customStartDate && customEndDate && (
              <p className="text-xs text-gray-600">
                <span className="font-medium">Period:</span> {formatRangeLabel(customStartDate, customEndDate)}
              </p>
            )}
          </div>
        )}
      </fieldset>
    </FormSection>
  );
}
