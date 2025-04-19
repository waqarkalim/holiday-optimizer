'use client';

import { useEffect, useRef, useState } from 'react';
import { ResultsDisplay } from '@/components/features/ResultsDisplay';
import { OptimizerForm } from '@/components/OptimizerForm';
import { OptimizerProvider } from '@/contexts/OptimizerContext';
import { CompanyDayOff, OptimizationResult, OptimizationStrategy } from '@/types';
import { optimizeDaysAsync } from '@/services/optimizer';
import { PageContent, PageDescription, PageHeader, PageLayout, PageTitle } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FormState {
  numberOfDays: number | null;
  strategy: OptimizationStrategy;
  companyDaysOff: Array<CompanyDayOff>;
  holidays: Array<{ date: string, name: string }>;
  selectedYear: number;
}

const HomePage = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleOptimize = async (data: FormState) => {
    if (data.numberOfDays === null) return;

    try {
      setIsOptimizing(true);
      setSelectedYear(data.selectedYear);
      const result = await optimizeDaysAsync({
        numberOfDays: data.numberOfDays,
        strategy: data.strategy,
        year: data.selectedYear,
        companyDaysOff: data.companyDaysOff,
        holidays: data.holidays,
      });
      setOptimizationResult({
        days: result.days,
        breaks: result.breaks,
        stats: result.stats,
      });
      setShouldScrollToResults(true);
    } catch (e) {
      console.error('Optimization error:', e);
      setOptimizationResult(null);
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    if (shouldScrollToResults && resultsRef.current && window.innerWidth < 1024) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShouldScrollToResults(false);
    }
  }, [shouldScrollToResults, optimizationResult]);

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
              isOptimizing || optimizationResult ? 'lg:grid-cols-[minmax(480px,1fr),minmax(480px,2fr)]' : '',
            )}
            aria-label="Time Off Optimizer Tool"
          >
            {/* Form Section - Always visible */}
            <div className={cn(
              'space-y-4',
              isOptimizing || optimizationResult
                ? 'lg:sticky lg:top-6 lg:self-start max-w-2xl'
                : 'max-w-xl mx-auto w-full',
            )}>
              <h2 className="sr-only">Optimization Form</h2>
              <OptimizerForm
                onSubmitAction={({ days, strategy, companyDaysOff, holidays, selectedYear }) => {
                  const newFormState = {
                    numberOfDays: days,
                    strategy,
                    companyDaysOff,
                    holidays,
                    selectedYear,
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
                {isOptimizing ? (
                  <Card variant="neutral" className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <LoadingSpinner
                      variant="primary"
                      label="Creating Your Optimal Schedule"
                      description={`Finding the best way to use your time off in ${selectedYear}...`}
                    />
                  </Card>
                ) : optimizationResult && (
                  <div itemScope itemType="https://schema.org/Event">
                    <meta itemProp="name" content={`Optimized Time Off Schedule for ${selectedYear}`} />
                    <ResultsDisplay
                      ref={resultsRef}
                      optimizedDays={optimizationResult.days}
                      breaks={optimizationResult.breaks}
                      stats={optimizationResult.stats}
                      selectedYear={selectedYear}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </PageContent>
      </PageLayout>
    </OptimizerProvider>
  );
};

export default HomePage;
