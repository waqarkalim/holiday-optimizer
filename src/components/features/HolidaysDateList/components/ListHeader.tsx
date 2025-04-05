import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colorStyles } from '../constants/styles';
import { useDateList } from '../context/DateListContext';

export function ListHeader() {
  const { headingId: id, title, itemCount, colorScheme } = useDateList();

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
      </div>
    </div>
  );
} 