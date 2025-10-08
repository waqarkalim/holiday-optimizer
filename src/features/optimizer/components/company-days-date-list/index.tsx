'use client';

import { useEffect, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp, Check, Pencil, Trash2, X } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { ANIMATION_CONFIG, CHECKBOX_ANIMATION } from './animations';
import { CompanyDayListProvider, useCompanyDayList } from './CompanyDayListContext';
import { DateItem, DateListProps } from './types';

function BulkRenameInput() {
  const { theme, editingValue, updateEditingValue, cancelEditing, confirmBulkRename, selectedDates } =
    useCompanyDayList();

  return (
    <div className={cn('mb-4 p-3 rounded-lg border', theme.highlight, 'border-violet-200', 'animate-in fade-in')}>
      <label className={cn('text-xs font-medium mb-2 block', theme.text)}>
        Rename {selectedDates.length} selected date{selectedDates.length > 1 ? 's' : ''}:
      </label>
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={editingValue}
          onChange={event => updateEditingValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              confirmBulkRename();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              cancelEditing();
            }
          }}
          placeholder="e.g., Summer Fridays, Winter Break, Q3 Benefits..."
          className={cn('h-8 text-sm', 'bg-white', 'flex-1', theme.input)}
        />
        <div className="flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelEditing}
            className={cn('h-8 w-8 p-0', 'hover:bg-red-100/70', 'group')}
            aria-label="Cancel Rename"
          >
            <X className={cn('h-4 w-4', 'text-gray-500', 'group-hover:text-red-500')} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={confirmBulkRename}
            className={cn('h-8 w-8 p-0', 'hover:bg-green-100/70', 'group')}
            aria-label="Confirm Rename"
          >
            <Check className={cn('h-4 w-4', 'text-gray-500', 'group-hover:text-green-500')} />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ListHeaderProps {
  id: string;
}

function ListHeader({ id }: ListHeaderProps) {
  const {
    title,
    theme,
    itemCount,
    selectedDates,
    hasSelection,
    groups,
    collapsedGroups,
    beginBulkRename,
    clearAllDates,
    collapseAllGroups,
    expandAllGroups,
  } = useCompanyDayList();

  const allCollapsed =
    groups.length > 0 && groups.every(({ name }) => collapsedGroups.includes(name));

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-1.5 rounded-lg', theme.highlight)}>
            <Calendar className={cn('h-4 w-4', theme.accent)} aria-hidden="true" />
          </div>
          <div>
            <h3 id={id} className={cn('text-sm font-medium leading-none mb-1', theme.text)}>
              {title}
            </h3>
            <p className={cn('text-xs', theme.muted)}>
              {itemCount} date{itemCount === 1 ? '' : 's'} selected
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAllDates}
          className={cn(
            'h-7 px-2.5 gap-1.5',
            'border transition-all duration-200',
            theme.border,
            theme.hover,
            theme.active,
            'hover:border-opacity-100',
            'group'
          )}
          tabIndex={0}
          aria-label={`Clear all ${title.toLowerCase()}`}
        >
          <Trash2 className={cn('h-3.5 w-3.5', 'transition-colors duration-200', theme.accent)} />
          <span className={cn('text-xs font-medium', theme.text)}>Clear All</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={beginBulkRename}
          disabled={!hasSelection}
          className={cn(
            'h-7 px-2.5 gap-1.5',
            'border transition-all duration-200',
            theme.border,
            hasSelection && [theme.hover, theme.active, 'border-violet-400'],
            'hover:border-opacity-100',
            'group',
            'flex-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'disabled:hover:bg-transparent',
            // Make it pulse when dates are selected to draw attention
            hasSelection && 'animate-in fade-in'
          )}
          tabIndex={0}
          aria-label={
            hasSelection
              ? `Rename ${selectedDates.length} selected dates`
              : 'Select dates to rename them'
          }
          title={
            hasSelection
              ? `Click to rename ${selectedDates.length} selected date${selectedDates.length > 1 ? 's' : ''}`
              : 'Select dates using checkboxes, then click here to rename them'
          }
        >
          <Pencil
            className={cn(
              'h-3.5 w-3.5',
              theme.accent,
              'transition-all duration-200',
              hasSelection ? 'opacity-100 scale-110' : 'opacity-40'
            )}
          />
          <span className={cn('text-xs font-medium', theme.text, hasSelection && 'font-semibold')}>
            {hasSelection ? `Rename ${selectedDates.length} Selected` : 'Rename Selected'}
          </span>
        </Button>

        {groups.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={allCollapsed ? expandAllGroups : collapseAllGroups}
            className={cn('h-7 px-2.5 gap-1.5', theme.hover, 'group', 'hidden sm:flex')}
            tabIndex={0}
            aria-label={allCollapsed ? 'Expand all groups' : 'Collapse all groups'}
          >
            {allCollapsed ? (
              <>
                <ChevronDown className={cn('h-3.5 w-3.5', theme.accent)} />
                <span className={cn('text-xs font-medium', theme.text)}>Expand All</span>
              </>
            ) : (
              <>
                <ChevronUp className={cn('h-3.5 w-3.5', theme.accent)} />
                <span className={cn('text-xs font-medium', theme.text)}>Collapse All</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

interface DateListItemProps {
  item: DateItem;
  isGrouped?: boolean;
  groupIsDefaultNamed?: boolean;
}

function DateListItem({ item, isGrouped = false, groupIsDefaultNamed = false }: DateListItemProps) {
  const {
    theme,
    colorScheme,
    selectedDates,
    toggleDateSelection,
    editingTarget,
    editingValue,
    updateEditingValue,
    handleItemKeyDown,
    handleInputBlur,
    beginEditing,
    cancelEditing,
    commitEditing,
    removeDate,
  } = useCompanyDayList();

  const isEditing = editingTarget === item.date;
  const isSelected = selectedDates.includes(item.date);
  const checkboxColor = `text-${colorScheme}-600 `;

  const handleButtonKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    action: () => void
  ) => {
    if (event.key === 'Enter' || event.key === '') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div
      className={cn(
        'group/item relative',
        'border-t',
        theme.divider,
        theme.hover,
        'transition-colors duration-200',
        'pl-8'
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <motion.div {...CHECKBOX_ANIMATION}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleDateSelection(item.date)}
            className={cn('h-3.5 w-3.5 rounded', checkboxColor, 'border-gray-300')}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={editingValue}
                onChange={event => updateEditingValue(event.target.value)}
                onKeyDown={event => handleItemKeyDown(event, item.date)}
                onBlur={handleInputBlur}
                className={cn(
                  'h-7 text-sm font-medium flex-1',
                  'bg-white',
                  theme.input,
                  theme.text
                )}
                aria-label={`Edit name for ${format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}`}
                data-edit-input="true"
              />
              <div className="flex gap-1" role="group" aria-label="Edit actions">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditing}
                  onKeyDown={event => handleButtonKeyDown(event, cancelEditing)}
                  className={cn(
                    'h-7 w-7 p-0',
                    theme.hover,
                    'hover:bg-red-100/70',
                    'group focus:ring-1 focus:ring-red-500 focus:ring-offset-1'
                  )}
                  tabIndex={0}
                  aria-label="Cancel edit"
                  data-cancel-button="true"
                >
                  <X className={cn('h-3.5 w-3.5', theme.accent, 'group-hover:text-red-500')} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => commitEditing(item.date)}
                  onKeyDown={event => handleButtonKeyDown(event, () => commitEditing(item.date))}
                  className={cn(
                    'h-7 w-7 p-0',
                    theme.hover,
                    'hover:bg-green-100/70',
                    'group focus:ring-1 focus:ring-green-500 focus:ring-offset-1'
                  )}
                  tabIndex={0}
                  aria-label="Confirm edit"
                  data-confirm-button="true"
                >
                  <Check
                    className={cn('h-3.5 w-3.5', theme.accent, 'group-hover:text-green-500')}
                  />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {isGrouped ? (
                // When in a group:
                // - Default named groups (by month): show "Thursday, 16th" - month/year is in header
                // - Custom named groups: show "Thu, Oct 16, 2025" - need full context for dates across months/years
                <time
                  dateTime={item.date}
                  className={cn('text-sm font-medium', theme.text)}
                >
                  {groupIsDefaultNamed
                    ? format(parse(item.date, 'yyyy-MM-dd', new Date()), 'EEEE, do')
                    : format(parse(item.date, 'yyyy-MM-dd', new Date()), 'EEE, MMM d, yyyy')}
                </time>
              ) : (
                // When ungrouped, show full details with edit button
                <>
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-medium', theme.text)}>{item.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => beginEditing(item.date, item.name)}
                      onKeyDown={event =>
                        handleButtonKeyDown(event, () => beginEditing(item.date, item.name))
                      }
                      className={cn(
                        'h-6 w-6 p-0',
                        'opacity-0 group-hover/item:opacity-100 focus:opacity-100',
                        'transition-all duration-200',
                        theme.hover,
                        'hover:scale-110 active:scale-95',
                        'focus:ring-1 focus:ring-violet-500 focus:ring-offset-1'
                      )}
                      aria-label={`Edit name for ${item.name}`}
                      tabIndex={0}
                      data-edit-button="true"
                      data-date={item.date}
                    >
                      <Pencil className={cn('h-3 w-3', theme.accent)} />
                    </Button>
                  </div>
                  <time
                    dateTime={item.date}
                    className={cn('block text-xs mt-0.5', theme.muted)}
                  >
                    {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy')}
                  </time>
                </>
              )}
            </>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeDate(item.date)}
          onKeyDown={event => handleButtonKeyDown(event, () => removeDate(item.date))}
          className={cn(
            'h-7 w-7 p-0',
            'opacity-0 group-hover/item:opacity-100 focus:opacity-100',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            theme.hover,
            'focus:ring-1 focus:ring-red-500 focus:ring-offset-1'
          )}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className={cn('h-3.5 w-3.5', theme.accent)} />
        </Button>
      </div>
    </div>
  );
}

function GroupRow({
  group,
}: {
  group: { name: string; dates: DateItem[]; isDefaultNamed?: boolean };
}) {
  const {
    theme,
    colorScheme,
    selectedDates,
    collapsedGroups,
    toggleGroupSelection,
    toggleGroupCollapse,
  } = useCompanyDayList();

  const { name, dates, isDefaultNamed } = group;
  const checkboxRef = useRef<HTMLInputElement | null>(null);
  const isCollapsed = collapsedGroups.includes(name);
  const allSelected = dates.every(({ date }) => selectedDates.includes(date));
  const someSelected = !allSelected && dates.some(({ date }) => selectedDates.includes(date));
  const selectedCount = dates.filter(({ date }) => selectedDates.includes(date)).length;
  const groupId = `${name.toLowerCase().replace(/\s+/g, '-')}-group-id`;
  const checkboxColor = `text-${colorScheme}-600 `;

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    toggleGroupSelection(name);
  };

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <motion.li
      key={name + (isDefaultNamed ? '-month' : '-name')}
      {...ANIMATION_CONFIG}
      className={theme.hover}
      aria-labelledby={groupId}
    >
      <motion.div
        className={cn(
          'flex items-center gap-3 px-3 py-2',
          'cursor-pointer select-none',
          theme.hover
        )}
        onClick={() => toggleGroupSelection(name)}
        role="button"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === '') {
            event.preventDefault();
            toggleGroupSelection(name);
          }
        }}
      >
        <motion.input
          {...CHECKBOX_ANIMATION}
          ref={checkboxRef}
          type="checkbox"
          checked={allSelected}
          onChange={handleCheckboxChange}
          onClick={event => event.stopPropagation()}
          className={cn('h-3.5 w-3.5 rounded', checkboxColor, 'border-gray-300')}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span id={groupId} className={cn('text-sm font-semibold', theme.text)}>
              {name}
            </span>
            <span className={cn('text-xs font-medium', theme.muted)}>
              ({dates.length})
            </span>
            {someSelected && (
              <span
                className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-full',
                  theme.highlight,
                  theme.text
                )}
              >
                {selectedCount} selected
              </span>
            )}
          </div>
          <div className={cn('text-xs mt-0.5', theme.muted)}>
            {format(parse(dates[0].date, 'yyyy-MM-dd', new Date()), 'MMM d')}
            {dates.length > 1 &&
              ` - ${format(parse(dates[dates.length - 1].date, 'yyyy-MM-dd', new Date()), 'MMM d')}`}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={event => {
            event.stopPropagation();
            toggleGroupCollapse(name);
          }}
          className={cn('h-6 w-6 p-0', theme.hover)}
          aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed ? (
            <ChevronDown className={cn('h-3.5 w-3.5', theme.accent)} />
          ) : (
            <ChevronUp className={cn('h-3.5 w-3.5', theme.accent)} />
          )}
        </Button>
      </motion.div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div {...ANIMATION_CONFIG}>
            {dates.map(item => (
              <DateListItem key={item.date} item={item} isGrouped={true} groupIsDefaultNamed={isDefaultNamed} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function GroupedView() {
  const { groups } = useCompanyDayList();
  return (
    <>
      {groups.map(group => (
        <GroupRow key={group.name + String(group.isDefaultNamed)} group={group} />
      ))}
    </>
  );
}

function DateListContent() {
  const { title, theme, editingTarget } = useCompanyDayList();
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-list-heading`;

  return (
    <motion.section
      {...ANIMATION_CONFIG}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border p-4',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300 ease-in-out',
        theme.container,
        theme.border
      )}
      aria-labelledby={headingId}
    >
      <ListHeader id={headingId} />

      {editingTarget === 'bulk' && <BulkRenameInput />}

      <div className={cn('rounded-lg border', theme.border, 'overflow-hidden')}>
        <ul className={cn('divide-y', theme.divider)} role="list" aria-label="List of dates">
          <AnimatePresence initial={false} mode="popLayout">
            <GroupedView />
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
}

export function DateList({ title, colorScheme }: DateListProps) {
  const {
    companyDaysOff,
    preBookedDays,
    addCompanyDay,
    addPreBookedDay,
    removeCompanyDay,
    removePreBookedDay,
    clearCompanyDays,
    clearPreBookedDays,
    customStartDate,
    customEndDate
  } = useOptimizerForm();

  // Determine which data source to use based on the title
  const isPreBookedDays = title === 'Pre-Booked Vacation Days';
  const sourceData = isPreBookedDays ? preBookedDays : companyDaysOff;
  const addFunction = isPreBookedDays ? addPreBookedDay : addCompanyDay;
  const removeFunction = isPreBookedDays ? removePreBookedDay : removeCompanyDay;
  const clearFunction = isPreBookedDays ? clearPreBookedDays : clearCompanyDays;

  if (sourceData.length === 0) return null;

  // Filter days to only show those within the selected timeframe
  const filteredDays = sourceData.filter(day => {
    if (!customStartDate || !customEndDate) return true;

    const dayDate = parse(day.date, 'yyyy-MM-dd', new Date());
    const startDate = parse(customStartDate, 'yyyy-MM-dd', new Date());
    const endDate = parse(customEndDate, 'yyyy-MM-dd', new Date());

    return dayDate >= startDate && dayDate <= endDate;
  });

  // Only show the list if there are days in the current timeframe
  if (filteredDays.length === 0) return null;

  const handleBulkRename = (dates: string[], newName: string) => {
    dates.forEach(date => addFunction(date, newName));
  };

  return (
    <CompanyDayListProvider
      title={title}
      colorScheme={colorScheme}
      onBulkRename={handleBulkRename}
      filteredItems={filteredDays}
      onAdd={addFunction}
      onRemove={removeFunction}
      onClearAll={clearFunction}
    >
      <DateListContent />
    </CompanyDayListProvider>
  );
}
