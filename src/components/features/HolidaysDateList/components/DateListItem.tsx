import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateItem } from '../types';
import { colorStyles } from '../constants/styles';
import { useDateList } from '../context/DateListContext';

interface DateListItemProps {
  item: DateItem;
}

export function DateListItem({ item }: DateListItemProps) {
  const { colorScheme } = useDateList();

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
      </div>
    </div>
  );
} 
