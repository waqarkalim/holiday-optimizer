'use client';

import React from 'react';
import { Calendar, Info, Lightbulb } from 'lucide-react';
import { cn, DayType, dayTypeToColorScheme } from '@/shared/lib/utils';
import { COLOR_SCHEMES } from '@/constants';
import { SectionCard } from '@/shared/components/ui/section-card';

// Our simplified day types for the explainer
type ExplainerDayType = 'weekend' | 'pto' | 'holiday' | 'workday' | 'empty';

// Factor item for the algorithm explanation
interface Factor {
  icon: React.ReactNode;
  text: string;
  bgColor: string;
}

interface DayCellProps {
  day: string | number;
  dayType: ExplainerDayType;
  isToday?: boolean;
}

// Helper component for displaying the day cells in our example calendars
const DayCell = ({ day, dayType, isToday = false }: DayCellProps) => {
  const baseStyle = 'flex flex-col items-center justify-center rounded-md text-center p-1 h-8 sm:p-2 sm:h-10 md:h-14 transition-colors shadow-sm';

  // Map our simplified day types to the app's actual day types
  let appDayType: DayType = 'default';

  switch (dayType) {
    case 'holiday':
      appDayType = 'publicHoliday';
      break;
    case 'pto':
      appDayType = 'pto';
      break;
    case 'weekend':
      appDayType = 'weekend';
      break;
    case 'workday':
    case 'empty':
    default:
      appDayType = 'default';
  }

  // Get the color scheme based on day type
  const colorScheme = dayTypeToColorScheme[appDayType];

  return (
    <div className={cn(
      baseStyle,
      colorScheme ? COLOR_SCHEMES[colorScheme].calendar.bg : '',
      'ring-1 ring-gray-200/80 dark:ring-gray-700/80',
      dayType === 'pto' && 'ring-2 ring-teal-500 dark:ring-teal-500',
      isToday && 'ring-2 ring-offset-2 ring-blue-500',
    )}>
      <span className={cn(
        'text-xs font-medium sm:text-sm',
        colorScheme ? COLOR_SCHEMES[colorScheme].calendar.text : '',
      )}>
        {day}
      </span>
    </div>
  );
};

interface WeekViewExampleProps {
  title: string;
  description: string;
  days: Array<{ date: string | number; type: ExplainerDayType }>;
  formula: string;
}

// Component for showing a week view calendar with optimization explanation
const WeekViewExample = ({ title, description, days, formula }: WeekViewExampleProps) => (
  <article
    className="space-y-3 p-3 sm:space-y-4 sm:p-4 bg-white dark:bg-gray-800/30 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
    <header className="flex items-start gap-2 sm:gap-3">
      <div className="mt-1 flex-shrink-0 p-1 bg-amber-100 dark:bg-amber-900/30 rounded-full sm:p-1.5">
        <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400 sm:h-5 sm:w-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-sm mt-1">
          {description}
        </p>
      </div>
    </header>

    <div className="overflow-x-auto -mx-3 px-3 pb-2 sm:-mx-4 sm:px-4">
      <figure className="min-w-[500px] py-2 sm:py-3">
        <div className="grid grid-cols-9 gap-1 mb-1 sm:gap-2 sm:mb-2" role="row">
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Sat
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Sun
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Mon
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Tue
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Wed
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Thu
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Fri
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Sat
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 xs:text-xs"
               role="columnheader">Sun
          </div>
        </div>

        <div className="grid grid-cols-9 gap-1 sm:gap-2" role="grid">
          {days.map((day, i) => (
            <DayCell key={i} day={day.date} dayType={day.type} />
          ))}
        </div>
      </figure>
    </div>

    <footer
      className="mt-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-2 border border-blue-100 dark:border-blue-800/40 sm:mt-4 sm:p-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 sm:h-4 sm:w-4" />
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 sm:text-sm">Formula:</p>
      </div>
      <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 font-medium pl-5 sm:text-sm sm:pl-6 leading-snug">
        {formula}
      </p>
    </footer>
  </article>
);

// Legend component to explain the colors - styled more like CalendarLegend
const Legend = () => {
  const ptoDayType: DayType = 'pto';
  const weekendDayType: DayType = 'weekend';
  const holidayDayType: DayType = 'publicHoliday';

  return (
    <figure className={cn(
      'mb-4 bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden sm:mb-5',
      'ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm',
      'transition-all duration-200',
    )}>
      <figcaption
        className="px-3 py-2 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-800/70 flex items-center justify-between sm:px-4">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 sm:text-sm tracking-tight">
          <Info className="h-3 w-3 text-gray-500 dark:text-gray-400 sm:h-3.5 sm:w-3.5" />
          Calendar Legend
        </h3>
      </figcaption>

      <div className="p-2 sm:p-3">
        <ul className="grid gap-1 grid-cols-2 sm:grid-cols-4">
          <li className="flex items-center space-x-2 px-2 py-1.5 rounded-md sm:px-3 sm:py-2">
            <div className={cn(
              'w-4 h-4 rounded-md flex-shrink-0 sm:w-5 sm:h-5',
              COLOR_SCHEMES[dayTypeToColorScheme[ptoDayType]].calendar.bg,
              'ring-2 ring-teal-500 dark:ring-teal-500 shadow-sm',
            )} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm leading-none">PTO Day</span>
          </li>

          <li className="flex items-center space-x-2 px-2 py-1.5 rounded-md sm:px-3 sm:py-2">
            <div className={cn(
              'w-4 h-4 rounded-md flex-shrink-0 sm:w-5 sm:h-5',
              COLOR_SCHEMES[dayTypeToColorScheme[weekendDayType]].calendar.bg,
              'ring-1 ring-gray-200/80 dark:ring-gray-700/80 shadow-sm',
            )} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm leading-none">Weekend</span>
          </li>

          <li className="flex items-center space-x-2 px-2 py-1.5 rounded-md sm:px-3 sm:py-2">
            <div className={cn(
              'w-4 h-4 rounded-md flex-shrink-0 sm:w-5 sm:h-5',
              COLOR_SCHEMES[dayTypeToColorScheme[holidayDayType]].calendar.bg,
              'ring-1 ring-gray-200/80 dark:ring-gray-700/80 shadow-sm',
            )} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm leading-none">Holiday</span>
          </li>

          <li className="flex items-center space-x-2 px-2 py-1.5 rounded-md sm:px-3 sm:py-2">
            <div className={cn(
              'w-4 h-4 rounded-md flex-shrink-0 sm:w-5 sm:h-5',
              'bg-slate-100 dark:bg-slate-800/70',
              'ring-1 ring-gray-200/80 dark:ring-gray-700/80 shadow-sm',
            )} />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm leading-none">Work Day</span>
          </li>
        </ul>
      </div>
    </figure>
  );
};

interface OptimizationExplainerProps {
  introText?: string;
  factorsText?: string;
  factors?: Factor[];
}

interface IStrategyExample {
  id: string;
  title: string;
  mobileTitle: string;
  description: string;
  days: { date: string, type: ExplainerDayType }[];
  formula: string;
}

export const OptimizationExplainer = ({ introText, factorsText, factors }: OptimizationExplainerProps) => {
  // Example content for each strategy
  const examples: IStrategyExample[] = [
    {
      id: 'basic',
      title: 'Basic Week Strategy',
      mobileTitle: 'Full Week Strategy',
      description: 'Using 5 PTO days (Monday-Friday) gives you 9 total days off including the adjacent weekends.',
      days: [
        { date: '1', type: 'weekend' },
        { date: '2', type: 'weekend' },
        { date: '3', type: 'pto' },
        { date: '4', type: 'pto' },
        { date: '5', type: 'pto' },
        { date: '6', type: 'pto' },
        { date: '7', type: 'pto' },
        { date: '8', type: 'weekend' },
        { date: '9', type: 'weekend' },
      ],
      formula: '5 PTO days + 4 weekend days = 9 consecutive days off',
    },
    {
      id: 'holiday',
      title: 'Holiday Advantage',
      mobileTitle: 'Holiday Advantage',
      description: 'Using 4 PTO days around a holiday gives you 9 total days off with one less PTO day.',
      days: [
        { date: '1', type: 'weekend' },
        { date: '2', type: 'weekend' },
        { date: '3', type: 'holiday' },
        { date: '4', type: 'pto' },
        { date: '5', type: 'pto' },
        { date: '6', type: 'pto' },
        { date: '7', type: 'pto' },
        { date: '8', type: 'weekend' },
        { date: '9', type: 'weekend' },
      ],
      formula: '4 PTO days + 1 holiday + 4 weekend days = 9 consecutive days off',
    },
    {
      id: 'extended',
      title: 'Extended Weekend',
      mobileTitle: 'Extended Weekend',
      description: 'Using just 2 PTO days (Thursday-Friday) gives you 4 consecutive days off.',
      days: [
        { date: '1', type: 'weekend' },
        { date: '2', type: 'weekend' },
        { date: '3', type: 'workday' },
        { date: '4', type: 'workday' },
        { date: '5', type: 'workday' },
        { date: '6', type: 'pto' },
        { date: '7', type: 'pto' },
        { date: '8', type: 'weekend' },
        { date: '9', type: 'weekend' },
      ],
      formula: '2 PTO days + 2 weekend days = 4 consecutive days off',
    }
  ];

  return (
    <>
      <SectionCard
        className="shadow-md"
        title="Understanding Optimization"
        subtitle="Learn how strategic PTO placement creates longer breaks without using extra days"
        icon={<Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />}
      >
        <div className="space-y-4 pt-3 sm:space-y-6 sm:pt-4">
          {/* Intro text - either from props or default */}
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base tracking-normal">
            {introText || 'The key to maximizing your time off is strategic PTO placement. Of course, 15 PTO days can\'t magically become 53 days off - Holiday Optimizer simply helps you align your PTO days around weekends and holidays to create longer stretches of consecutive time off work.'}
          </p>

          {/* Algorithm factors list - only shown if provided via props */}
          {factors && factors.length > 0 && (
            <>
              {factorsText && (
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mt-3 sm:text-base">
                  {factorsText}
                </p>
              )}

              <ul className="list-none pl-0 mb-1 text-gray-700 dark:text-gray-300 space-y-3">
                {factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className={`p-1.5 ${factor.bgColor} rounded-full`}>
                      {factor.icon}
                    </div>
                    <span className="text-sm font-medium sm:text-base leading-tight">{factor.text}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </SectionCard>
      <SectionCard
        className="shadow-md"
        title="Optimization Strategies"
        subtitle="See examples of how to maximize your time off with smart scheduling techniques"
        icon={<Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
      >
        <div className="space-y-4 pt-3 sm:space-y-6 sm:pt-4">
          <Legend />

          {/* All examples displayed vertically for all screen sizes */}
          <section className="space-y-6">
            {examples.map((example) => (
              <WeekViewExample
                key={example.id}
                title={example.title}
                description={example.description}
                days={example.days}
                formula={example.formula}
              />
            ))}
          </section>

          <aside
            className="mt-4 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/10 p-3 border border-teal-200 dark:border-teal-800 shadow-sm sm:mt-6 sm:p-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 flex-shrink-0 p-1 rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-teal-800 dark:text-teal-200 leading-tight tracking-tight">
                  The Algorithm Works At Scale
                </h3>
                <p className="mt-2 text-[15px] text-teal-700 dark:text-teal-300 leading-relaxed">
                  Holiday Optimizer doesn&apos;t add to your PTO days - it finds the most strategic placement for them. This
                  is the same approach used in vacation planning guides and other tools. Your 15 PTO days are still just 15
                  days, but by connecting them to weekends and holidays, you get more consecutive days away from work
                  without using additional PTO.
                </p>
              </div>
            </div>
          </aside>
          
          {/* Disclaimer Banner */}
          <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800/60 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex-shrink-0">
                <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  <span className="font-medium">Note:</span> The optimization results are suggestions based on general patterns and preferences. What works best for you might differ based on your personal circumstances, specific work requirements, or individual preferences. Always verify that the suggested schedule aligns with your specific needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </>
  );
};