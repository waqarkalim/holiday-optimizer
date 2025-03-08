import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { colorStyles } from '../constants/styles';
import { CHECKBOX_ANIMATION } from '../constants/animations';
import { motion } from 'framer-motion';
import { DateItem } from '../types';
import { useDateList } from '../context/DateListContext';

export interface DateListItemProps {
  item: DateItem;
  isGrouped?: boolean;
}

export function DateListItem({ item, isGrouped = false }: DateListItemProps) {
  const {
    selectedDates,
    setSelectedDates,
    editingDate,
    setEditingDate,
    editingValue,
    setEditingValue,
    onRemoveAction,
    colorScheme,
    handleKeyDown,
    startEditing,
    handleBlur,
  } = useDateList();

  // Handle keyboard events for both edit and remove buttons
  const handleButtonKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div
      className={cn(
        'group/item relative',
        'border-t',
        colorStyles[colorScheme].divider,
        colorStyles[colorScheme].hover,
        'transition-colors duration-200',
        'pl-8',
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <motion.div
          {...CHECKBOX_ANIMATION}
        >
          <input
            type="checkbox"
            checked={selectedDates.includes(item.date)}
            onChange={() => {
              setSelectedDates(prev =>
                prev.includes(item.date)
                  ? prev.filter(d => d !== item.date)
                  : [...prev, item.date],
              );
            }}
            className={cn(
              'h-3.5 w-3.5 rounded',
              `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
              'border-gray-300 dark:border-gray-600',
            )}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          {editingDate === item.date ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, item.date)}
                onBlur={handleBlur}
                className={cn(
                  'h-7 text-sm font-medium flex-1',
                  'bg-white dark:bg-gray-900',
                  colorStyles[colorScheme].input,
                  colorStyles[colorScheme].text,
                )}
                aria-label={`Edit name for ${format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}`}
                data-edit-input="true"
              />
              <div className="flex gap-1" role="group" aria-label="Edit actions">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingDate(null)}
                  onKeyDown={(e) => handleButtonKeyDown(e, () => setEditingDate(null))}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-red-100/70 dark:hover:bg-red-900/30',
                    'group focus:ring-1 focus:ring-red-500 focus:ring-offset-1',
                  )}
                  tabIndex={0}
                  aria-label="Cancel edit"
                  data-cancel-button="true"
                >
                  <X className={cn(
                    'h-3.5 w-3.5',
                    colorStyles[colorScheme].accent,
                    'group-hover:text-red-500 dark:group-hover:text-red-400',
                  )} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBlur}
                  onKeyDown={(e) => handleButtonKeyDown(e, handleBlur)}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-green-100/70 dark:hover:bg-green-900/30',
                    'group focus:ring-1 focus:ring-green-500 focus:ring-offset-1',
                  )}
                  tabIndex={0}
                  aria-label="Confirm edit"
                  data-confirm-button="true"
                >
                  <Check className={cn(
                    'h-3.5 w-3.5',
                    colorStyles[colorScheme].accent,
                    'group-hover:text-green-500 dark:group-hover:text-green-400',
                  )} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                {!isGrouped && (
                  <p className={cn(
                    'text-sm font-medium',
                    colorStyles[colorScheme].text,
                  )}>
                    {item.name}
                  </p>
                )}
                {!isGrouped && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(item.date, item.name)}
                    onKeyDown={(e) => handleButtonKeyDown(e, () => startEditing(item.date, item.name))}
                    className={cn(
                      'h-6 w-6 p-0',
                      'opacity-0 group-hover/item:opacity-100 focus:opacity-100',
                      'transition-all duration-200',
                      colorStyles[colorScheme].hover,
                      'hover:scale-110 active:scale-95',
                      'focus:ring-1 focus:ring-violet-500 focus:ring-offset-1',
                    )}
                    aria-label={`Edit name for ${item.name}`}
                    tabIndex={0}
                    data-edit-button="true"
                    data-date={item.date}
                  >
                    <Pencil className={cn(
                      'h-3 w-3',
                      colorStyles[colorScheme].accent,
                    )} />
                  </Button>
                )}
              </div>
              <time
                dateTime={item.date}
                className={cn(
                  'block',
                  isGrouped ? 'text-sm' : 'text-xs mt-0.5',
                  isGrouped ? colorStyles[colorScheme].text : colorStyles[colorScheme].muted,
                )}
              >
                {format(parse(item.date, 'yyyy-MM-dd', new Date()),
                  isGrouped ? 'EEEE, MMMM d, yyyy' : 'EEEE, MMMM d, yyyy',
                )}
              </time>
            </>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveAction(item.date)}
          onKeyDown={(e) => handleButtonKeyDown(e, () => onRemoveAction(item.date))}
          className={cn(
            'h-7 w-7 p-0',
            'opacity-0 group-hover/item:opacity-100 focus:opacity-100',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            'hover:bg-violet-100/70 dark:hover:bg-violet-900/30',
            'hover:text-violet-600 dark:hover:text-violet-400',
            'group/button focus:ring-1 focus:ring-red-500 focus:ring-offset-1',
            editingDate === item.date ? 'opacity-100' : '', // Always show when in edit mode
          )}
          tabIndex={0}
          aria-label={`Remove ${item.name}`}
          data-date-remove-button="true"
          data-date={item.date}
        >
          <X
            className={cn(
              'h-3.5 w-3.5',
              'transition-colors duration-200',
              'text-violet-500/60 dark:text-violet-400/60',
              'group-hover/button:text-violet-600 dark:group-hover/button:text-violet-400',
            )}
          />
        </Button>
      </div>
    </div>
  );
} 