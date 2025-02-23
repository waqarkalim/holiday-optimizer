import { Button } from '@/components/ui/button';
import { parse, format } from 'date-fns';
import { X, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DateItem {
  date: string;
  name: string;
  alternateNames?: string[];
}

interface DateListProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber' | 'violet';
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

const colorStyles = {
  amber: {
    container: 'bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-900/20 dark:to-amber-900/10',
    border: 'border-amber-200/60 dark:border-amber-800/60',
    text: 'text-amber-900 dark:text-amber-100',
    muted: 'text-amber-600/70 dark:text-amber-400/70',
    accent: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:bg-amber-100/70 dark:hover:bg-amber-900/50',
    active: 'active:bg-amber-200/70 dark:active:bg-amber-900/70',
    focus: 'focus:ring-amber-400/30 dark:focus:ring-amber-300/30',
    divider: 'border-amber-200/30 dark:border-amber-800/30',
    highlight: 'bg-amber-100/50 dark:bg-amber-900/40',
  },
  violet: {
    container: 'bg-gradient-to-br from-violet-50/80 to-violet-100/30 dark:from-violet-900/20 dark:to-violet-900/10',
    border: 'border-violet-200/60 dark:border-violet-800/60',
    text: 'text-violet-900 dark:text-violet-100',
    muted: 'text-violet-600/70 dark:text-violet-400/70',
    accent: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:bg-violet-100/70 dark:hover:bg-violet-900/50',
    active: 'active:bg-violet-200/70 dark:active:bg-violet-900/70',
    focus: 'focus:ring-violet-400/30 dark:focus:ring-violet-300/30',
    divider: 'border-violet-200/30 dark:border-violet-800/30',
    highlight: 'bg-violet-100/50 dark:bg-violet-900/40',
  },
} as const;

export function DateList({ items, title, colorScheme, onRemove, onClearAll }: DateListProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onRemove(index);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevButton = document.querySelector(`[data-index="${index - 1}"]`) as HTMLButtonElement;
        prevButton?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextButton = document.querySelector(`[data-index="${index + 1}"]`) as HTMLButtonElement;
        nextButton?.focus();
        break;
    }
  };

  const sortedItems = [...items].sort(
    (a, b) => parse(a.date, 'yyyy-MM-dd', new Date()).getTime() - 
              parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
  );

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border p-4',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300 ease-in-out',
        colorStyles[colorScheme].container,
        colorStyles[colorScheme].border
      )}
      aria-labelledby={`${title.toLowerCase()}-list-heading`}
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'p-1.5 rounded-lg',
            colorStyles[colorScheme].highlight
          )}>
            <Calendar 
              className={cn('h-4 w-4', colorStyles[colorScheme].accent)} 
              aria-hidden="true" 
            />
          </div>
          <div>
            <h3 
              id={`${title.toLowerCase()}-list-heading`}
              className={cn('text-sm font-medium leading-none mb-1', colorStyles[colorScheme].text)}
            >
              {title}
            </h3>
            <p className={cn('text-[10px]', colorStyles[colorScheme].muted)}>
              {items.length} date{items.length === 1 ? '' : 's'} selected
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className={cn(
            'h-7 px-2.5 gap-1.5',
            'border transition-all duration-200',
            colorStyles[colorScheme].border,
            colorStyles[colorScheme].hover,
            colorStyles[colorScheme].active,
            'hover:border-opacity-100',
            'group'
          )}
          tabIndex={0}
          aria-label={`Clear all ${title.toLowerCase()}`}
        >
          <Trash2 
            className={cn(
              'h-3.5 w-3.5 transition-colors duration-200',
              colorStyles[colorScheme].accent,
              'group-hover:text-red-500 dark:group-hover:text-red-400'
            )} 
          />
          <span className={cn(
            'text-[11px] font-medium',
            colorStyles[colorScheme].text
          )}>
            Clear All
          </span>
        </Button>
      </header>

      <div className={cn(
        'rounded-lg border',
        colorStyles[colorScheme].border,
        'overflow-hidden'
      )}>
        <ul 
          className={cn(
            'divide-y',
            colorStyles[colorScheme].divider
          )}
          role="list"
          aria-label={`List of ${title.toLowerCase()}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {sortedItems.map((item, index) => (
              <motion.li
                key={item.date}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'group/item relative',
                  colorStyles[colorScheme].hover,
                  'transition-colors duration-200'
                )}
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium',
                      colorStyles[colorScheme].text
                    )}>
                      {item.name}
                    </p>
                    <time 
                      dateTime={item.date}
                      className={cn('text-[11px] block mt-0.5', colorStyles[colorScheme].muted)}
                    >
                      {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy')}
                    </time>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                      'h-7 w-7 p-0',
                      'opacity-0 group-hover/item:opacity-100',
                      'transition-all duration-200',
                      'hover:scale-110 active:scale-95',
                      colorStyles[colorScheme].hover,
                      'hover:bg-red-100/70 dark:hover:bg-red-900/30',
                      'group/button'
                    )}
                    tabIndex={0}
                    aria-label={`Remove ${item.name}`}
                    data-index={index}
                  >
                    <X className={cn(
                      'h-3.5 w-3.5',
                      colorStyles[colorScheme].accent,
                      'group-hover/button:text-red-500 dark:group-hover/button:text-red-400',
                      'transition-colors duration-200'
                    )} />
                  </Button>
                </div>
                <motion.div
                  initial={false}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className={cn(
                    'absolute inset-y-0 left-0 w-1 rounded-full my-2',
                    colorStyles[colorScheme].highlight,
                    'transition-opacity duration-200'
                  )}
                  aria-hidden="true"
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
} 