'use client';

import { createContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DateListProps } from './types';
import { colorStyles } from './constants/styles';
import { ANIMATION_CONFIG } from './constants/animations';
import { ListHeader } from './components/ListHeader';
import { BulkRenameInput } from './components/BulkRenameInput';
import { GroupedView } from './components/GroupedView';
import { DateListProvider, useDateList } from './context/DateListContext';
import { useCompanyDays } from '@/hooks/useOptimizer';

// Color styles context
const ColorStylesContext = createContext<Record<string, string>>({});

export function DateList({ title, colorScheme }: DateListProps) {
  const { companyDaysOff, addCompanyDay } = useCompanyDays();
  const onBulkRename = (dates: string[], newName: string) => {
    dates.forEach(date => addCompanyDay(date, newName));
  };

  if (companyDaysOff.length === 0) return null;

  return (
    <DateListProvider
      title={title}
      colorScheme={colorScheme}
      onBulkRename={onBulkRename}
    >
      <DateListContent />
    </DateListProvider>
  );
}

function DateListContent() {
  const {
    title,
    colorScheme,
    editingDate,
  } = useDateList();

  // Create a valid ID for aria-labelledby
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-list-heading`;

  return (
    <ColorStylesContext.Provider value={colorStyles[colorScheme]}>
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
        aria-labelledby={headingId}
      >
        <ListHeader
          id={headingId}
        />

        {editingDate === 'bulk' && (
          <BulkRenameInput />
        )}

        <div className={cn('rounded-lg border', colorStyles[colorScheme].border, 'overflow-hidden')}>
          <ul
            className={cn('divide-y', colorStyles[colorScheme].divider)}
            role="list"
            aria-label={`List of dates`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <GroupedView />
            </AnimatePresence>
          </ul>
        </div>
      </motion.section>
    </ColorStylesContext.Provider>
  );
} 