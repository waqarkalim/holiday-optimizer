'use client';

import { Activity, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ResultsDisplay } from '@/features/optimizer/components/ResultsDisplay';
import { OptimizerForm } from '@/features/optimizer/components/OptimizerForm';
import { OptimizerProvider } from '@/features/optimizer/context/OptimizerContext';
import { CompanyDayOff, OptimizationResult, OptimizationStrategy, WeekdayNumber } from '@/types';
import { optimizeDaysAsync } from '@/services/optimizer';
import {
  PageContent,
  PageDescription,
  PageHeader,
  PageLayout,
  PageTitle,
} from '@/shared/components/layout/PageLayout';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

interface FormState {
  numberOfDays: number | null;
  strategy: OptimizationStrategy;
  companyDaysOff: Array<CompanyDayOff>;
  preBookedDays: Array<{ date: string; name: string }>;
  holidays: Array<{ date: string; name: string }>;
  selectedYear: number;
  weekendDays: WeekdayNumber[];
  customStartDate?: string;
  customEndDate?: string;
}

const HomePage = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeframeRange, setTimeframeRange] = useState<{ start?: string; end?: string }>({});
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrollResultsIntoView = () => {
    if (typeof window === 'undefined') return;
    if (resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const runWithViewTransition = (update: () => void, afterTransition?: () => void) => {
    if (typeof document !== 'undefined') {
      const enhancedDocument = document as Document & {
        startViewTransition?: (
          callback: () => void | Promise<void>
        ) => { finished: Promise<void> } | undefined;
      };

      if (typeof enhancedDocument.startViewTransition === 'function') {
        const transition = enhancedDocument.startViewTransition(() => {
          update();
        });

        if (transition?.finished && afterTransition) {
          transition.finished.finally(afterTransition);
        } else if (afterTransition) {
          afterTransition();
        }

        return;
      }
    }

    update();
    afterTransition?.();
  };

  const handleOptimize = async (data: FormState) => {
    if (data.numberOfDays === null) return;

    setIsOptimizing(true);
    setSelectedYear(data.selectedYear);
    setTimeframeRange({ start: data.customStartDate, end: data.customEndDate });

    try {
      const result = await optimizeDaysAsync({
        numberOfDays: data.numberOfDays,
        strategy: data.strategy,
        year: data.selectedYear,
        companyDaysOff: data.companyDaysOff,
        preBookedDays: data.preBookedDays,
        holidays: data.holidays,
        weekendDays: data.weekendDays,
        startDate: data.customStartDate,
        endDate: data.customEndDate,
      });

      runWithViewTransition(
        () => {
          setOptimizationResult({
            days: result.days,
            breaks: result.breaks,
            stats: result.stats,
          });
          setIsOptimizing(false);
          toast.success('Optimization complete!', {
            description: `Found ${result.breaks.length} optimal break${result.breaks.length !== 1 ? 's' : ''} for your schedule.`,
          });
        },
        () => {
          if (typeof window === 'undefined') return;
          Promise.resolve().then(() => {
            window.requestAnimationFrame(() => scrollResultsIntoView());
          });
        }
      );
    } catch (e) {
      console.error('Optimization error:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred';
      runWithViewTransition(() => {
        setOptimizationResult(null);
        setIsOptimizing(false);
      });
      toast.error('Optimization failed', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  return (
    <OptimizerProvider>
      <PageLayout>
        <PageHeader>
          <PageTitle>Optimize Your Time Off</PageTitle>
          <PageDescription>
            Make the most of your paid time off in {selectedYear} with smart scheduling
          </PageDescription>
        </PageHeader>

        <PageContent>
          <section
            className={cn(
              'grid gap-6 mx-auto max-w-[1400px]',
              isOptimizing || optimizationResult
                ? 'lg:grid-cols-[minmax(480px,1fr),minmax(480px,2fr)]'
                : ''
            )}
            aria-label="Time Off Optimizer Tool"
          >
            {/* Form Section - Always visible */}
            <div
              className={cn(
                'space-y-4',
                isOptimizing || optimizationResult
                  ? 'lg:sticky lg:top-6 lg:self-start max-w-2xl'
                  : 'max-w-xl mx-auto w-full'
              )}
            >
              <h2 className="sr-only">Optimization Form</h2>
              <OptimizerForm
                onSubmitAction={(
                  {
                    days,
                    strategy,
                    companyDaysOff,
                    preBookedDays,
                    holidays,
                    selectedYear,
                    weekendDays,
                    customStartDate,
                    customEndDate,
                  }
                ) => {
                  const newFormState = {
                    numberOfDays: days,
                    strategy,
                    companyDaysOff,
                    preBookedDays,
                    holidays,
                    selectedYear,
                    weekendDays,
                    customStartDate,
                    customEndDate,
                  };
                  handleOptimize(newFormState);
                }}
                isLoading={isOptimizing}
              />
            </div>

            {/* Results Section with Loading State */}
            {(isOptimizing || (optimizationResult && optimizationResult.days.length > 0)) && (
              <div className="space-y-4 min-w-0 max-w-4xl w-full">
                <h2 className="sr-only">Optimization Results</h2>
                {isOptimizing && (
                  <Card
                    variant="neutral"
                    className="p-8 flex flex-col items-center justify-center min-h-[300px]"
                  >
                    <LoadingSpinner
                      variant="primary"
                      label="Creating Your Optimal Schedule"
                      description={`Finding the best way to use your time off in ${selectedYear}...`}
                    />
                  </Card>
                )}
                <Activity mode={isOptimizing ? 'hidden' : 'visible'}>
                  {optimizationResult && optimizationResult.days.length > 0 && (
                    <div itemScope itemType="https://schema.org/Event">
                      <meta
                        itemProp="name"
                        content={`Optimized Time Off Schedule for ${selectedYear}`}
                      />
                      <ResultsDisplay
                        ref={resultsRef}
                        optimizedDays={optimizationResult.days}
                        breaks={optimizationResult.breaks}
                        stats={optimizationResult.stats}
                        selectedYear={selectedYear}
                        customStartDate={timeframeRange.start}
                        customEndDate={timeframeRange.end}
                      />
                    </div>
                  )}
                </Activity>
              </div>
            )}
          </section>
        </PageContent>
      </PageLayout>
    </OptimizerProvider>
  );
};

export default HomePage;
