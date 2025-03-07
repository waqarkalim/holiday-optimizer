'use client';

import { Coffee, Info, Palmtree, Shuffle, Star, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OPTIMIZATION_STRATEGIES } from '@/constants';
import { OptimizationStrategy } from '@/types';
import { KeyboardEvent } from 'react';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useStrategySelection } from '@/hooks/useOptimizer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Map strategy IDs to their respective icons
const STRATEGY_ICONS = {
  balanced: Shuffle,
  miniBreaks: Star,
  longWeekends: Coffee,
  weekLongBreaks: Sunrise,
  extendedVacations: Palmtree,
} as const;

export function StrategySelectionStep() {
  const { strategy, setStrategy } = useStrategySelection();

  const handleStrategyKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OPTIMIZATION_STRATEGIES.findIndex(s => s.id === strategy);
    const lastIndex = OPTIMIZATION_STRATEGIES.length - 1;

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
      const prevStrategy = OPTIMIZATION_STRATEGIES[prevIndex];
      setStrategy(prevStrategy.id);
      focusStrategyRadio(prevStrategy.id);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
      const nextStrategy = OPTIMIZATION_STRATEGIES[nextIndex];
      setStrategy(nextStrategy.id);
      focusStrategyRadio(nextStrategy.id);
    }
  };

  const focusStrategyRadio = (strategyId: string) => {
    if (typeof window !== 'undefined') {
      const radioInput = document.querySelector<HTMLInputElement>(`input[value="${strategyId}"]`);
      radioInput?.focus();
    }
  };

  // Info tooltip for strategy selection
  const titleWithInfo = (
    <div className="flex items-center justify-between w-full">
      <span>Pick Your Perfect Style</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-full p-1 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 cursor-help transition-colors">
            <Info className="h-3.5 w-3.5 text-blue-500/70 dark:text-blue-400/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" align="start" className="max-w-xs bg-blue-50/95 dark:bg-blue-900/90 border-blue-100 dark:border-blue-800/40 text-blue-900 dark:text-blue-100">
          <div className="space-y-2 p-1">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">About Optimization Styles</h4>
            <p className="text-xs text-blue-700/90 dark:text-blue-300/90 leading-relaxed">
              Your optimization style determines how your PTO days will be distributed throughout the year. 
              Choose based on your personal preferences - whether you enjoy frequent short breaks, 
              longer weekends, or extended vacations. Each style creates a different pattern of time off.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <FormSection colorScheme="blue" headingId="strategy-heading">
      <StepHeader
        number={2}
        title={titleWithInfo}
        description="Choose how you'd like to enjoy your time off. Each style is designed to match different preferences."
        colorScheme="blue"
        id="strategy-heading"
      />
      <div
        role="radiogroup"
        aria-labelledby="strategy-heading"
        aria-describedby="strategy-description"
        className="space-y-2"
        onKeyDown={handleStrategyKeyDown}
      >
        {OPTIMIZATION_STRATEGIES.map((strategyOption, index) => {
          const Icon = STRATEGY_ICONS[strategyOption.id as OptimizationStrategy];
          const isSelected = strategy === strategyOption.id;
          const isFirstOption = index === 0;

          return (
            <label
              key={strategyOption.id}
              className={cn(
                'flex items-start p-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                'focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-600',
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-900/30 ring-1 ring-blue-900/10 dark:ring-blue-400/10'
                  : 'bg-white dark:bg-gray-800/60 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-blue-200 dark:hover:ring-blue-800',
              )}
            >
              <input
                type="radio"
                name="strategy"
                value={strategyOption.id}
                checked={isSelected}
                className="sr-only"
                tabIndex={isSelected || (isFirstOption && !strategy) ? 0 : -1}
                onChange={() => setStrategy(strategyOption.id)}
              />
              <div className="flex items-start gap-3 w-full">
                <div className={cn(
                  'p-2 rounded-md mt-0.5',
                  isSelected
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                )}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {strategyOption.label}
                    </p>
                    {strategyOption.id === 'balanced' && (
                      <span className="inline-flex items-center rounded-md bg-blue-50/80 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-900 dark:text-blue-100 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 mt-1">
                    {strategyOption.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300 flex-shrink-0 mt-1.5" />
                )}
              </div>
            </label>
          );
        })}
      </div>
    </FormSection>
  );
} 