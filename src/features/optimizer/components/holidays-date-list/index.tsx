'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { ANIMATION_CONFIG } from './animations';
import { colorStyles } from './styles';
import { DateListProps, DateItem } from './types';

const DATE_FORMAT = 'yyyy-MM-dd';

const formatDisplayDate = (value: string) => {
  try {
    const parsed = parse(value, DATE_FORMAT, new Date());
    if (isValid(parsed)) {
      return format(parsed, 'MMMM d, yyyy');
    }
  } catch (error) {
    console.error(`Error parsing date: ${value}`, error);
  }
  return value;
};

interface ListHeaderProps {
  id: string;
  title: string;
  itemCount: number;
  theme: (typeof colorStyles)['amber'];
}

const ListHeader = ({ id, title, itemCount, theme }: ListHeaderProps) => (
  <div className="mb-4 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={cn('p-1.5 rounded-lg', theme.highlight)}>
          <Calendar className={cn('h-4 w-4', theme.accent)} aria-hidden="true" />
        </div>
        <div>
          <h3 id={id} className={cn('text-sm font-medium leading-none mb-1', theme.text)}>
            {title}
          </h3>
          <p className={cn('text-xs', theme.muted)}>
            {itemCount} date{itemCount === 1 ? '' : 's'} selected
          </p>
        </div>
      </div>
    </div>
  </div>
);

interface ListItemProps {
  item: DateItem;
  theme: (typeof colorStyles)['amber'];
  onRemove: (date: string) => void;
}

const ListItem = ({ item, theme, onRemove }: ListItemProps) => (
  <div
    className={cn(
      'group/item relative',
      'border-t',
      theme.divider,
      'transition-colors duration-200',
      theme.hover
    )}
    data-date={item.date}
  >
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-medium', theme.text)}>{item.name}</p>
        </div>
        <time dateTime={item.date} className={cn('block text-xs mt-0.5', theme.muted)}>
          {formatDisplayDate(item.date)}
        </time>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.date)}
        className={cn(
          'p-1.5 rounded-full',
          'opacity-0 group-hover/item:opacity-100',
          'scale-90 group-hover/item:scale-100',
          'text-gray-400',
          theme.accent,
          'transition-all duration-200',
          'focus:outline-none focus:ring-2',
          theme.focus,
          'focus:opacity-100 focus:scale-100'
        )}
        aria-label={`Remove ${item.name}`}
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  </div>
);

export const DateList = ({ title, colorScheme }: DateListProps) => {
  const { holidays, removeHoliday } = useOptimizerForm();

  if (holidays.length === 0) return null;

  const theme = colorStyles[colorScheme];
  const headingId = `holiday-list-heading-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const sortedItems = [...holidays].sort(
    (a, b) =>
      parse(a.date, DATE_FORMAT, new Date()).getTime() -
      parse(b.date, DATE_FORMAT, new Date()).getTime()
  );

  return (
    <motion.section
      {...ANIMATION_CONFIG}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border p-4',
        'shadow-sm',
        'transition-all duration-300 ease-in-out',
        theme.container,
        theme.border
      )}
      aria-labelledby={headingId}
    >
      <ListHeader id={headingId} title={title} itemCount={sortedItems.length} theme={theme} />

      <div className={cn('rounded-lg border', theme.border, 'overflow-hidden')}>
        <ul className={cn('divide-y', theme.divider)} aria-label="List of dates">
          <AnimatePresence initial={false} mode="popLayout">
            {sortedItems.map((item, index) => (
              <motion.li
                key={`${item.date}-${index}`}
                {...ANIMATION_CONFIG}
                data-list-item="true"
                data-list-index={index}
              >
                <ListItem item={item} theme={theme} onRemove={removeHoliday} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
};
