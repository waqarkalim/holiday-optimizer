import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ListHeaderProps } from '../types';
import { colorStyles } from '../constants/styles';

export function ListHeader({
  title,
  itemCount,
  colorScheme,
  showBulkManagement,
  isBulkMode,
  selectedDates,
  onBulkRename,
  onClearAll,
  groupedDates,
  collapsedGroups,
  setCollapsedGroups,
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
              id={`${title.toLowerCase()}-list-heading`}
              className={cn('text-sm font-medium leading-none mb-1', colorStyles[colorScheme].text)}
            >
              {title}
            </h3>
            <p className={cn('text-[10px]', colorStyles[colorScheme].muted)}>
              {itemCount} date{itemCount === 1 ? '' : 's'} selected
            </p>
          </div>
        </div>

        {/* Clear All - Always visible */}
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
          <span className={cn('text-[11px] font-medium', colorStyles[colorScheme].text)}>
            Clear All
          </span>
        </Button>
      </div>

      {/* Bulk Management Controls */}
      {showBulkManagement && isBulkMode && (
        <div className="flex items-center gap-2">
          {/* Rename Button - Always visible in bulk mode */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBulkRename}
            disabled={selectedDates.length === 0}
            className={cn(
              'h-7 px-2.5 gap-1.5',
              'border transition-all duration-200',
              colorStyles[colorScheme].border,
              selectedDates.length > 0 && [
                colorStyles[colorScheme].hover,
                colorStyles[colorScheme].active,
              ],
              'hover:border-opacity-100',
              'group',
              'flex-1 sm:flex-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'disabled:hover:bg-transparent',
            )}
            tabIndex={0}
            aria-label={selectedDates.length > 0 
              ? `Rename ${selectedDates.length} selected dates`
              : 'Select dates to rename them'
            }
          >
            <Pencil className={cn(
              'h-3.5 w-3.5',
              colorStyles[colorScheme].accent,
              'opacity-50 group-hover:opacity-100 transition-opacity',
              selectedDates.length === 0 && 'opacity-40 group-hover:opacity-40',
            )} />
            <span className={cn('text-[11px] font-medium', colorStyles[colorScheme].text)}>
              {selectedDates.length > 0 ? `Rename ${selectedDates.length}` : 'Rename Selected'}
            </span>
          </Button>

          {/* Expand/Collapse All - Only visible with multiple groups */}
          {groupedDates.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const allCollapsed = groupedDates.every(g => collapsedGroups.includes(g.name));
                setCollapsedGroups(allCollapsed ? [] : groupedDates.map(g => g.name));
              }}
              className={cn(
                'h-7 w-7 p-0',
                colorStyles[colorScheme].hover,
                'group',
                'hidden sm:flex', // Hide on mobile to save space
              )}
              tabIndex={0}
              aria-label={groupedDates.every(g => collapsedGroups.includes(g.name))
                ? "Expand all groups"
                : "Collapse all groups"
              }
            >
              {groupedDates.every(g => collapsedGroups.includes(g.name)) ? (
                <ChevronDown className={cn('h-3.5 w-3.5', colorStyles[colorScheme].accent)} />
              ) : (
                <ChevronUp className={cn('h-3.5 w-3.5', colorStyles[colorScheme].accent)} />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 