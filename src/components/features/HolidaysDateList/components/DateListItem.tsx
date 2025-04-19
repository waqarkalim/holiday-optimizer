import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateItem } from '../types';
import { colorStyles } from '../constants/styles';
import { useDateList } from '../context/DateListContext';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DateListItemProps {
  item: DateItem;
}

export function DateListItem({ item }: DateListItemProps) {
  const { colorScheme, onRemoveAction } = useDateList();

  // Format the date for display and accessibility
  let formattedDate = item.date; // Default to the raw date string as fallback
  try {
    // Attempt to parse and format the date
    const parsedDate = parse(item.date, 'yyyy-MM-dd', new Date());
    // Check if the parsed date is valid
    if (isValid(parsedDate)) {
      formattedDate = format(parsedDate, 'MMMM d, yyyy');
    }
  } catch (error) {
    console.error(`Error parsing date: ${item.date}`, error);
    // Keep the fallback value
  }

  return (
    <div
      className={cn(
        'group/item relative',
        'border-t',
        colorStyles[colorScheme].divider,
        'transition-colors duration-200',
        colorStyles[colorScheme].hover,
      )}
      data-date={item.date}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex-1 min-w-0">
          <>
            <div className="flex items-center gap-2">
              <p className={cn(
                'text-sm font-medium',
                colorStyles[colorScheme].text,
              )}>
                {item.name}
              </p>
            </div>
            <time
              dateTime={item.date}
              className={cn(
                'block text-xs mt-0.5',
                colorStyles[colorScheme].muted,
              )}
            >
              {formattedDate}
            </time>
          </>
        </div>

        <button
          type="button"
          onClick={() => onRemoveAction(item.date)}
          className={cn(
            'p-1.5 rounded-full',
            'opacity-0 group-hover/item:opacity-100',
            'scale-90 group-hover/item:scale-100',
            'text-gray-400',
            colorStyles[colorScheme].accent,
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            colorStyles[colorScheme].focus,
            'focus:opacity-100 focus:scale-100',
          )}
          aria-label={`Remove ${item.name}`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
