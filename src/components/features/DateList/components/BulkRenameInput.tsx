import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BulkRenameInputProps } from '../types';
import { colorStyles } from '../constants/styles';

export function BulkRenameInput({
  editingValue,
  setEditingValue,
  setEditingDate,
  handleBulkRenameConfirm,
  colorScheme,
}: BulkRenameInputProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Input
        autoFocus
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleBulkRenameConfirm();
          if (e.key === 'Escape') setEditingDate(null);
        }}
        className={cn(
          'h-8 text-sm font-medium flex-1',
          'bg-white dark:bg-gray-900',
          colorStyles[colorScheme].input,
          colorStyles[colorScheme].text,
        )}
        placeholder="Enter new name for selected dates"
      />
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditingDate(null)}
          className={cn(
            'h-8 w-8 p-0',
            colorStyles[colorScheme].border,
            colorStyles[colorScheme].hover,
            'hover:bg-red-100/70 dark:hover:bg-red-900/30',
            'group',
          )}
          aria-label="Cancel rename"
        >
          <X className={cn(
            'h-4 w-4',
            colorStyles[colorScheme].accent,
            'group-hover:text-red-500 dark:group-hover:text-red-400',
          )} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBulkRenameConfirm}
          className={cn(
            'h-8 w-8 p-0',
            colorStyles[colorScheme].border,
            colorStyles[colorScheme].hover,
            'hover:bg-green-100/70 dark:hover:bg-green-900/30',
            'group',
          )}
          aria-label="Confirm rename"
        >
          <Check className={cn(
            'h-4 w-4',
            colorStyles[colorScheme].accent,
            'group-hover:text-green-500 dark:group-hover:text-green-400',
          )} />
        </Button>
      </div>
    </div>
  );
} 