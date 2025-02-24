import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupedViewProps } from '../types';
import { colorStyles } from '../constants/styles';
import { ANIMATION_CONFIG, CHECKBOX_ANIMATION } from '../constants/animations';
import { DateListItem } from './DateListItem';

export function GroupedView({
  groupedDates,
  colorScheme,
  selectedDates,
  collapsedGroups,
  handleSelectGroup,
  toggleGroupCollapse,
  onUpdateName,
  onRemove,
  handleKeyDown,
  startEditing,
  handleBlur,
  setSelectedDates,
  editingDate,
  setEditingDate,
  editingValue,
  setEditingValue,
}: GroupedViewProps) {
  return (
    <>
      {groupedDates.map(({ name, dates, isDefaultNamed }) => (
        <motion.li
          key={name + (isDefaultNamed ? '-month' : '-name')}
          {...ANIMATION_CONFIG}
          className={colorStyles[colorScheme].hover}
        >
          <motion.div
            className={cn(
              'flex items-center justify-between px-3 py-2',
              'cursor-pointer select-none',
              colorStyles[colorScheme].hover,
            )}
            onClick={() => handleSelectGroup(name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectGroup(name);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <motion.input
                {...CHECKBOX_ANIMATION}
                type="checkbox"
                checked={dates.every(d => selectedDates.includes(d.date))}
                onChange={() => handleSelectGroup(name)}
                className={cn(
                  'h-3.5 w-3.5 rounded',
                  `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
                  'border-gray-300 dark:border-gray-600',
                )}
              />
              <div>
                <span className={cn('text-sm font-medium', colorStyles[colorScheme].text)}>
                  {isDefaultNamed ? `Dates in ${name}` : name}
                </span>
                <div className={cn('text-[11px]', colorStyles[colorScheme].muted)}>
                  {dates.length} date{dates.length > 1 ? 's' : ''} • {format(parse(dates[0].date, 'yyyy-MM-dd', new Date()), 'MMM d')}
                  {dates.length > 1 && ` - ${format(parse(dates[dates.length - 1].date, 'yyyy-MM-dd', new Date()), 'MMM d')}`}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleGroupCollapse(name);
              }}
              className={cn('h-6 w-6 p-0', colorStyles[colorScheme].hover)}
            >
              {collapsedGroups.includes(name) ? (
                <ChevronDown className={cn('h-4 w-4', colorStyles[colorScheme].accent)} />
              ) : (
                <ChevronUp className={cn('h-4 w-4', colorStyles[colorScheme].accent)} />
              )}
            </Button>
          </motion.div>

          <AnimatePresence initial={false}>
            {!collapsedGroups.includes(name) && (
              <motion.div
                {...ANIMATION_CONFIG}
              >
                {dates.map((item) => (
                  <DateListItem
                    key={item.date}
                    item={item}
                    showBulkManagement={true}
                    selectedDates={selectedDates}
                    setSelectedDates={setSelectedDates}
                    editingDate={editingDate}
                    setEditingDate={setEditingDate}
                    editingValue={editingValue}
                    onUpdateName={onUpdateName}
                    onRemove={onRemove}
                    colorScheme={colorScheme}
                    handleKeyDown={handleKeyDown}
                    startEditing={startEditing}
                    handleBlur={handleBlur}
                    setEditingValue={setEditingValue}
                    isGrouped={!isDefaultNamed}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.li>
      ))}
    </>
  );
} 