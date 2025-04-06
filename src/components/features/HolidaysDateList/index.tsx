'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DateListProps } from './types';
import { colorStyles } from './constants/styles';
import { ANIMATION_CONFIG } from './constants/animations';
import { ListHeader } from './components/ListHeader';
import { FlatView } from './components/FlatView';
import { DateListProvider, useDateList } from './context/DateListContext';
import { useHolidays } from '@/hooks/useOptimizer';

export const DateList = ({ title, colorScheme }: DateListProps) => {
  const { holidays } = useHolidays();
  // Early return if no holidays
  if (holidays.length === 0) return null;

  return (
    <DateListProvider title={title} colorScheme={colorScheme}>
      <DateListContent />
    </DateListProvider>
  );
};

// Separated content component that consumes the context
function DateListContent() {
  const { colorScheme, title } = useDateList();

  return (
    <motion.section
      {...ANIMATION_CONFIG}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border p-4',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300 ease-in-out',
        colorStyles[colorScheme].container,
        colorStyles[colorScheme].border,
      )}
      aria-label={title}
    >
      <ListHeader />

      <div className={cn('rounded-lg border', colorStyles[colorScheme].border, 'overflow-hidden')}>
        <ul
          className={cn('divide-y', colorStyles[colorScheme].divider)}
          aria-label={`List of dates`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <FlatView />
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
}