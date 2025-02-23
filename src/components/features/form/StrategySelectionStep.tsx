import { Coffee, Palmtree, Shuffle, Star, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OPTIMIZATION_STRATEGIES } from '@/constants';
import { OptimizationStrategy } from '@/types';
import { KeyboardEvent } from 'react';
import { StrategySelectionStepProps } from './types';
import { StepHeader } from './components/StepHeader';

// Update the icons type to match strategy IDs
const STRATEGY_ICONS: Record<OptimizationStrategy, typeof Shuffle> = {
  balanced: Shuffle,
  miniBreaks: Star,
  longWeekends: Coffee,
  weekLongBreaks: Sunrise,
  extendedVacations: Palmtree,
};

export function StrategySelectionStep({ strategy, onStrategyChange }: StrategySelectionStepProps) {
  const handleStrategyKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OPTIMIZATION_STRATEGIES.findIndex(s => s.id === strategy);
    const lastIndex = OPTIMIZATION_STRATEGIES.length - 1;

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        const prevIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        const prevStrategy = OPTIMIZATION_STRATEGIES[prevIndex];
        onStrategyChange(prevStrategy.id);
        const radioInput = document.querySelector<HTMLInputElement>(`input[value="${prevStrategy.id}"]`);
        radioInput?.focus();
        break;
      }
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        const nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        const nextStrategy = OPTIMIZATION_STRATEGIES[nextIndex];
        onStrategyChange(nextStrategy.id);
        const radioInput = document.querySelector<HTMLInputElement>(`input[value="${nextStrategy.id}"]`);
        radioInput?.focus();
        break;
      }
    }
  };

  return (
    <section
      className="bg-white/90 dark:bg-gray-800/60 rounded-lg p-2.5 ring-1 ring-blue-900/5 dark:ring-blue-300/10 space-y-2"
      aria-labelledby="strategy-heading"
    >
      <StepHeader
        number={2}
        title="Pick Your Perfect Style"
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
          const Icon = STRATEGY_ICONS[strategyOption.id];
          const isSelected = strategy === strategyOption.id;

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
                tabIndex={isSelected || (index === 0 && !strategy) ? 0 : -1}
                onChange={() => onStrategyChange(strategyOption.id)}
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
                        className="inline-flex items-center rounded-md bg-blue-50/80 dark:bg-blue-900/30 px-2 py-1 text-[10px] font-medium text-blue-900 dark:text-blue-100 ring-1 ring-blue-900/10 dark:ring-blue-400/10">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 mt-1">
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
    </section>
  );
} 