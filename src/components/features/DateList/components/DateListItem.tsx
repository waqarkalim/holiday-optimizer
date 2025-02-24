import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateListItemProps } from '../types';
import { colorStyles } from '../constants/styles';
import { CHECKBOX_ANIMATION } from '../constants/animations';
import { motion } from 'framer-motion';

export function DateListItem({
  item,
  showBulkManagement,
  selectedDates,
  setSelectedDates,
  editingDate,
  setEditingDate,
  editingValue,
  onUpdateName,
  onRemove,
  colorScheme,
  handleKeyDown,
  startEditing,
  handleBlur,
  setEditingValue,
  isGrouped = false,
}: DateListItemProps) {
  return (
    <div
      className={cn(
        'group/item relative',
        'border-t',
        colorStyles[colorScheme].divider,
        colorStyles[colorScheme].hover,
        'transition-colors duration-200',
        showBulkManagement && 'pl-8',
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        {showBulkManagement && (
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
        )}
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
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingDate(null)}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-red-100/70 dark:hover:bg-red-900/30',
                    'group',
                  )}
                  aria-label="Cancel edit"
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
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-green-100/70 dark:hover:bg-green-900/30',
                    'group',
                  )}
                  aria-label="Confirm edit"
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
                {onUpdateName && !isGrouped && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(item.date, item.name)}
                    className={cn(
                      'h-6 w-6 p-0',
                      'opacity-0 group-hover/item:opacity-100',
                      'transition-all duration-200',
                      colorStyles[colorScheme].hover,
                      'hover:scale-110 active:scale-95',
                    )}
                    aria-label={`Edit name for ${item.name}`}
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
                  isGrouped ? 'text-sm' : 'text-[11px] mt-0.5',
                  isGrouped ? colorStyles[colorScheme].text : colorStyles[colorScheme].muted
                )}
              >
                {format(parse(item.date, 'yyyy-MM-dd', new Date()), 
                  isGrouped ? 'EEEE, MMMM d, yyyy' : 'EEEE, MMMM d, yyyy'
                )}
              </time>
            </>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.date)}
          onKeyDown={(e) => handleKeyDown(e, item.date)}
          className={cn(
            'h-7 w-7 p-0',
            'opacity-0 group-hover/item:opacity-100',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            colorScheme === 'amber' ? [
              'hover:bg-amber-100/70 dark:hover:bg-amber-900/30',
              'hover:text-amber-600 dark:hover:text-amber-400',
            ] : [
              'hover:bg-violet-100/70 dark:hover:bg-violet-900/30',
              'hover:text-violet-600 dark:hover:text-violet-400',
            ],
            'group/button',
          )}
          tabIndex={0}
          aria-label={`Remove ${item.name}`}
          data-date={item.date}
        >
          <X 
            className={cn(
              'h-3.5 w-3.5',
              'transition-colors duration-200',
              colorScheme === 'amber' ? [
                'text-amber-500/60 dark:text-amber-400/60',
                'group-hover/button:text-amber-600 dark:group-hover/button:text-amber-400',
              ] : [
                'text-violet-500/60 dark:text-violet-400/60',
                'group-hover/button:text-violet-600 dark:group-hover/button:text-violet-400',
              ],
            )} 
          />
        </Button>
      </div>
    </div>
  );
} 