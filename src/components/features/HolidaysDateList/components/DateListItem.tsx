import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateItem } from '../types';
import { colorStyles } from '../constants/styles';
import { useDateList } from '../context/DateListContext';
import { X } from 'lucide-react';
import { addToSessionRemovedHolidays } from '@/lib/storage/holidays';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { toast } from 'sonner';
import { getStoredLocationData } from '@/lib/storage/location';

interface DateListItemProps {
  item: DateItem;
}

export function DateListItem({ item }: DateListItemProps) {
  const { colorScheme, onRemoveAction } = useDateList();
  const { state } = useOptimizer();
  const { selectedYear } = state;

  // Format the date for display and accessibility
  const formattedDate = format(
    parse(item.date, 'yyyy-MM-dd', new Date()),
    'MMMM d, yyyy',
  );

  // Handle remove action
  const handleRemove = () => {
    // Get the current location data to properly track which region this holiday is being removed from
    const locationData = getStoredLocationData(selectedYear);
    const country = locationData?.country || '';
    const subdivision = locationData?.subdivision || 'all';
    
    // Create a region identifier that combines country and subdivision
    const regionIdentifier = `${country}-${subdivision}`;
    
    // Add to the session-only list of manually removed holidays with region information
    addToSessionRemovedHolidays(item.date, selectedYear, regionIdentifier);
    
    // Remove from the current state
    onRemoveAction(item.date);

    // Show toast notification
    toast.success('Holiday removed', {
      description: `${item.name} on ${formattedDate} has been removed from your holidays.`,
    });
  };

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
        
        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            'h-7 w-7 rounded-full flex items-center justify-center',
            'opacity-0 group-hover/item:opacity-100',
            'transition-opacity duration-200',
            colorStyles[colorScheme].removeButton,
            'focus:outline-none focus:ring-2 focus:opacity-100',
            colorStyles[colorScheme].removeButtonFocus,
          )}
          aria-label={`Remove ${item.name} on ${formattedDate}`}
        >
          <X size={14} className={colorStyles[colorScheme].removeButtonIcon} />
        </button>
      </div>
    </div>
  );
} 