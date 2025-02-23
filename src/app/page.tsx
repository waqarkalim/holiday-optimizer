'use client';

import { useEffect, useRef, useState } from 'react';
import { ResultsDisplay } from '@/components/features/ResultsDisplay';
import { OptimizerForm } from '@/components/OptimizerForm';
import { OptimizerProvider } from '@/contexts/OptimizerContext';
import { CompanyDayOff, OptimizationResult, OptimizationStrategy } from '@/types';
import { optimizeDaysAsync } from '@/services/optimizer.improved';

interface FormState {
  numberOfDays: number | null
  strategy: OptimizationStrategy
  companyDaysOff: Array<CompanyDayOff>
  holidays: Array<{ date: string, name: string }>
}

const HomePage = () => {
  const currentYear = new Date().getUTCFullYear();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleOptimize = async (data: FormState) => {
    if (data.numberOfDays === null) return;

    try {
      setIsOptimizing(true);
      const result = await optimizeDaysAsync({
        numberOfDays: data.numberOfDays,
        strategy: data.strategy,
        year: currentYear,
        companyDaysOff: data.companyDaysOff,
        holidays: data.holidays
      });
      setOptimizationResult({
        days: result.days,
        breaks: result.breaks,
        stats: result.stats
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
      <div className="flex-grow">
        {/* Title Section */}
        <div className="bg-gray-50/90 dark:bg-gray-900 border-b border-gray-200/60 dark:border-gray-700/30 py-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Plan Your Time Off
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Optimize your CTO days from today until the end of {currentYear}, making every day off count
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-8 xl:px-12 py-6">
          <div className={`grid gap-6 ${isOptimizing || optimizationResult ? 'lg:grid-cols-[minmax(480px,1fr),minmax(480px,2fr)]' : ''} mx-auto max-w-[1400px]`}>
            {/* Form Section - Always visible */}
            <div className={`${isOptimizing || optimizationResult ? 'lg:sticky lg:top-6 lg:self-start max-w-2xl' : 'max-w-xl mx-auto w-full'} space-y-4`}>
              <OptimizerForm
                onSubmitAction={({ days, strategy, companyDaysOff, holidays }) => {
                  const newFormState = {
                    numberOfDays: days,
                    strategy,
                    companyDaysOff,
                    holidays
                  };
                  handleOptimize(newFormState);
                }}
                isLoading={isOptimizing}
              />
            </div>

            {/* Results Section with Loading State */}
            {(isOptimizing || (optimizationResult && optimizationResult.days.length > 0)) && (
              <div className="space-y-4 min-w-0 max-w-4xl w-full">
                {isOptimizing ? (
                  <div className="bg-white/90 dark:bg-gray-800/60 rounded-xl p-8 ring-1 ring-blue-900/5 dark:ring-blue-400/5 flex flex-col items-center justify-center min-h-[300px] space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-200 dark:border-violet-700 border-t-violet-500 dark:border-t-violet-400"></div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
                        Creating Your Perfect Schedule
                      </p>
                      <p className="text-xs text-violet-600/70 dark:text-violet-300/70">
                        Optimizing your time off for maximum enjoyment...
                      </p>
                    </div>
                  </div>
                ) : optimizationResult && (
                  <ResultsDisplay
                    ref={resultsRef}
                    optimizedDays={optimizationResult.days}
                    breaks={optimizationResult.breaks}
                    stats={optimizationResult.stats}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </OptimizerProvider>
  );
};

export default HomePage;
