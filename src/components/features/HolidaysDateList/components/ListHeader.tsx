import { Button } from '@/components/ui/button';
import { Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListHeaderProps } from '../types';
import { colorStyles } from '../constants/styles';

export function ListHeader({
  id,
  title,
  itemCount,
  colorScheme,
  onClearAll,
}: ListHeaderProps) {
  return (
    <div className="mb-4 space-y-2">
      {/* Title and Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-1.5 rounded-lg', colorStyles[colorScheme].highlight)}>
            <Calendar className={cn('h-4 w-4', colorStyles[colorScheme].accent)} aria-hidden="true" />
          </div>
          <div>
            <h3
              id={id}
              className={cn('text-sm font-medium leading-none mb-1', colorStyles[colorScheme].text)}
            >
              {title}
            </h3>
            <p className={cn('text-xs', colorStyles[colorScheme].muted)}>
              {itemCount} date{itemCount === 1 ? '' : 's'} selected
            </p>
          </div>
        </div>

        {/* Clear All button - Individual operation, not bulk */}
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
            'group',
          )}
          tabIndex={0}
          aria-label={`Clear all ${title.toLowerCase()}`}
        >
          <Trash2 className={cn('h-3.5 w-3.5', 'transition-colors duration-200', colorStyles[colorScheme].accent)} />
          <span className={cn('text-xs font-medium', colorStyles[colorScheme].text)}>
            Clear All
          </span>
        </Button>
      </div>
    </div>
  );
} 