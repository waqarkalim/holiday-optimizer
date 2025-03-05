import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colorStyles } from '../constants/styles';
import { useDateList } from '../context/DateListContext';

export function BulkRenameInput() {
  const {
    colorScheme,
    editingValue,
    setEditingValue,
    setEditingDate,
    handleBulkRenameConfirm
  } = useDateList();

  return (
    <div className={cn('mb-4 p-3 rounded-lg', colorStyles[colorScheme].highlight, 'animate-in fade-in')}>
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleBulkRenameConfirm();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              setEditingDate(null);
            }
          }}
          placeholder="Enter a new name for selected dates"
          className={cn(
            'h-8 text-sm',
            'bg-white dark:bg-gray-900',
            'flex-1',
            colorStyles[colorScheme].input,
          )}
        />
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditingDate(null)}
            className={cn(
              'h-8 w-8 p-0',
              'hover:bg-red-100/70 dark:hover:bg-red-900/30',
              'group',
            )}
            aria-label="Cancel Rename"
          >
            <X className={cn(
              'h-4 w-4',
              'text-gray-500 dark:text-gray-400',
              'group-hover:text-red-500 dark:group-hover:text-red-400',
            )} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBulkRenameConfirm}
            className={cn(
              'h-8 w-8 p-0',
              'hover:bg-green-100/70 dark:hover:bg-green-900/30',
              'group',
            )}
            aria-label="Confirm Rename"
          >
            <Check className={cn(
              'h-4 w-4',
              'text-gray-500 dark:text-gray-400',
              'group-hover:text-green-500 dark:group-hover:text-green-400',
            )} />
          </Button>
        </div>
      </div>
    </div>
  );
} 