'use client';

import { Coffee, Palmtree, Shuffle, Star, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OPTIMIZATION_STRATEGIES } from '@/constants';
import { OptimizationStrategy } from '@/types';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useStrategySelection } from '@/hooks/useOptimizer';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';

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

  // Using the new StepTitleWithInfo component
  const titleWithInfo = (
    <StepTitleWithInfo
      title="Choose Your Style"
      colorScheme="blue"
      tooltip={{
        title: "Optimization Styles",
        description: "Your selected style determines how your days will be distributed throughout the year. Each option creates a different pattern of time off based on your preferences - from short breaks to longer vacations.",
        ariaLabel: "About optimization styles"
      }}
    />
  );

  return (
    <FormSection colorScheme="blue" headingId="strategy-heading">
      <StepHeader
        number={2}
        title={titleWithInfo}
        description="Select how you'd like to distribute your time off. This affects the length and frequency of your breaks throughout the year."
        colorScheme="blue"
        id="strategy-heading"
      />
      <fieldset
        className="space-y-2 border-0 m-0 p-0"
        aria-labelledby="strategy-heading"
        role="radiogroup"
      >
        <legend className="sr-only">Select optimization strategy</legend>
        {OPTIMIZATION_STRATEGIES.map((strategyOption) => {
          const Icon = STRATEGY_ICONS[strategyOption.id as OptimizationStrategy];
          const isSelected = strategy === strategyOption.id;

          return (
            <div key={strategyOption.id} className="relative">
              <label
                htmlFor={`strategy-${strategyOption.id}`}
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
                  id={`strategy-${strategyOption.id}`}
                  name="strategy"
                  value={strategyOption.id}
                  checked={isSelected}
                  onChange={() => setStrategy(strategyOption.id)}
                  className="absolute opacity-0 h-0 w-0"
                  tabIndex={0}
                  aria-describedby={`strategy-description-${strategyOption.id}`}
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
                        <span
                          className="inline-flex items-center rounded-md bg-blue-50/80 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-900 dark:text-blue-100 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p
                      id={`strategy-description-${strategyOption.id}`}
                      className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 mt-1"
                    >
                      {strategyOption.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-300 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </fieldset>
    </FormSection>
  );
} 