import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, parse } from 'date-fns';
import { Calendar, Check, ChevronDown, ChevronUp, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KeyboardEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface DateItem {
  date: string;
  name: string;
  alternateNames?: string[];
}

interface GroupedDates {
  month: string;
  dates: DateItem[];
}

interface DateListProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber' | 'violet';
  onRemove: (date: string) => void;
  onClearAll: () => void;
  showName?: boolean;
  onUpdateName?: (date: string, newName: string) => void;
  onBulkRename?: (dates: string[], newName: string) => void;
  showBulkManagement?: boolean;
}

const colorStyles = {
  amber: {
    container: 'bg-gradient-to-br from-amber-50/80 to-amber-100/30 dark:from-amber-900/20 dark:to-amber-900/10',
    border: 'border-amber-200/60 dark:border-amber-800/60',
    text: 'text-amber-900 dark:text-amber-100',
    muted: 'text-amber-600/70 dark:text-amber-400/70',
    accent: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:bg-amber-100/70 dark:hover:bg-amber-900/50',
    active: 'active:bg-amber-200/70 dark:active:bg-amber-900/70',
    focus: 'focus:ring-amber-400/30 dark:focus:ring-amber-300/30',
    divider: 'border-amber-200/30 dark:border-amber-800/30',
    highlight: 'bg-amber-100/50 dark:bg-amber-900/40',
    input: 'border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600',
  },
  violet: {
    container: 'bg-gradient-to-br from-violet-50/80 to-violet-100/30 dark:from-violet-900/20 dark:to-violet-900/10',
    border: 'border-violet-200/60 dark:border-violet-800/60',
    text: 'text-violet-900 dark:text-violet-100',
    muted: 'text-violet-600/70 dark:text-violet-400/70',
    accent: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:bg-violet-100/70 dark:hover:bg-violet-900/50',
    active: 'active:bg-violet-200/70 dark:active:bg-violet-900/70',
    focus: 'focus:ring-violet-400/30 dark:focus:ring-violet-300/30',
    divider: 'border-violet-200/30 dark:border-violet-800/30',
    highlight: 'bg-violet-100/50 dark:bg-violet-900/40',
    input: 'border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600',
  },
} as const;

export function DateList({
                           items,
                           title,
                           colorScheme,
                           onRemove,
                           onClearAll,
                           showName = true,
                           onUpdateName,
                           onBulkRename,
                           showBulkManagement = false,
                         }: DateListProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Group dates by month (only used when showBulkManagement is true)
  const groupedDates: GroupedDates[] = showBulkManagement && isBulkMode
    ? items.reduce((groups: GroupedDates[], item) => {
      const date = parse(item.date, 'yyyy-MM-dd', new Date());
      const monthKey = format(date, 'MMMM yyyy');

      const existingGroup = groups.find(g => g.month === monthKey);
      if (existingGroup) {
        existingGroup.dates.push(item);
      } else {
        groups.push({ month: monthKey, dates: [item] });
      }

      return groups;
    }, [])
    : [];

  // Initialize with all months collapsed except current month
  const [collapsedMonths, setCollapsedMonths] = useState<string[]>(() => {
    if (!showBulkManagement) return [];
    const currentMonth = format(new Date(), 'MMMM yyyy');
    return groupedDates
      .map(group => group.month)
      .filter(month => month !== currentMonth);
  });

  // Get a stable reference to the month keys for dependency tracking
  const monthKeys = groupedDates.map(group => group.month).join(',');

  // Clear selection and expand all months when bulk mode is disabled
  useEffect(() => {
    if (!isBulkMode) {
      setSelectedDates([]);
      setEditingDate(null);
    } else {
      // When entering bulk mode, expand all months
      setCollapsedMonths([]);
    }
  }, [isBulkMode]);

  // Update collapsed months when grouped dates change
  useEffect(() => {
    if (!showBulkManagement) {
      setCollapsedMonths([]);
      return;
    }

    // Only update collapsed months if not in bulk mode
    if (!isBulkMode) {
      const currentMonth = format(new Date(), 'MMMM yyyy');
      const allMonths = groupedDates.map(group => group.month);

      setCollapsedMonths(prev => {
        // Keep previous collapsed state for existing months
        const existingCollapsed = prev.filter(month => allMonths.includes(month));
        // Add new months as collapsed (except current month)
        const newMonths = allMonths.filter(month =>
          !prev.includes(month) && month !== currentMonth,
        );

        const updated = [...existingCollapsed, ...newMonths];
        // Only return new array if it's different
        return prev.length === updated.length &&
        prev.every(month => updated.includes(month)) ? prev : updated;
      });
    }
  }, [showBulkManagement, monthKeys, isBulkMode]); // Added isBulkMode to dependencies

  // Sort all items by date
  const sortedItems = [...items].sort((a, b) =>
    parse(a.date, 'yyyy-MM-dd', new Date()).getTime() -
    parse(b.date, 'yyyy-MM-dd', new Date()).getTime(),
  );

  const handleSelectMonth = (month: string) => {
    if (!showBulkManagement) return;

    const monthDates = groupedDates.find(g => g.month === month)?.dates || [];
    const dates = monthDates.map(d => d.date);

    // If all dates in month are selected, unselect them
    const allSelected = dates.every(date => selectedDates.includes(date));
    if (allSelected) {
      setSelectedDates(prev => prev.filter(d => !dates.includes(d)));
    } else {
      setSelectedDates(prev => {
        const newDates = [...prev, ...dates];
        return [...new Set(newDates)]; // Remove duplicates
      });
    }
  };

  const handleBulkRename = () => {
    if (!onBulkRename || selectedDates.length === 0) return;

    // Get the most common name from selected items
    const selectedItems = items.filter(item => selectedDates.includes(item.date));
    const names = selectedItems.map(item => item.name);
    const nameCount = names.reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonName = Object.entries(nameCount)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    setEditingValue(commonName);
    setEditingDate('bulk');
  };

  const handleBulkRenameConfirm = () => {
    if (!onBulkRename || selectedDates.length === 0) return;
    onBulkRename(selectedDates, editingValue.trim());
    setEditingDate(null);
    setSelectedDates([]);
  };

  const handleItemRemove = (date: string) => {
    // Remove the date from selected dates if it exists
    setSelectedDates(prev => prev.filter(d => d !== date));
    onRemove(date);
  };

  const handleClearAll = () => {
    setSelectedDates([]);
    setEditingDate(null);
    onClearAll();
  };

  const toggleMonthCollapse = (month: string) => {
    setCollapsedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month],
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => {
    const index = items.findIndex(item => item.date === date);
    if (index === -1) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace': {
        if (editingDate === null) {
          e.preventDefault();
          handleItemRemove(date);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (editingDate === null) {
          const prevButton = document.querySelector(`[data-date="${sortedItems[index - 1]?.date}"]`) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        if (editingDate === null) {
          const nextButton = document.querySelector(`[data-date="${sortedItems[index + 1]?.date}"]`) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;
      }
      case 'Enter': {
        if (editingDate !== null && onUpdateName) {
          e.preventDefault();
          if (index !== -1) {
            onUpdateName(date, editingValue.trim());
          }
          setEditingDate(null);
        }
        break;
      }
      case 'Escape': {
        if (editingDate !== null) {
          e.preventDefault();
          setEditingDate(null);
        }
        break;
      }
    }
  };

  const startEditing = (date: string, currentName: string) => {
    if (!onUpdateName) return;
    setEditingValue(currentName);
    setEditingDate(date);
  };

  const handleBlur = () => {
    if (editingDate !== null && onUpdateName) {
      const index = items.findIndex(item => item.date === editingDate);
      if (index !== -1) {
        onUpdateName(editingDate, editingValue.trim());
      }
      setEditingDate(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border p-4',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300 ease-in-out',
        colorStyles[colorScheme].container,
        colorStyles[colorScheme].border,
      )}
      aria-labelledby={`${title.toLowerCase()}-list-heading`}
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'p-1.5 rounded-lg',
            colorStyles[colorScheme].highlight,
          )}>
            <Calendar
              className={cn('h-4 w-4', colorStyles[colorScheme].accent)}
              aria-hidden="true"
            />
          </div>
          <div>
            <h3
              id={`${title.toLowerCase()}-list-heading`}
              className={cn('text-sm font-medium leading-none mb-1', colorStyles[colorScheme].text)}
            >
              {title}
            </h3>
            <p className={cn('text-[10px]', colorStyles[colorScheme].muted)}>
              {items.length} date{items.length === 1 ? '' : 's'} selected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showBulkManagement && (
            <>
              {isBulkMode && groupedDates.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const allCollapsed = groupedDates.every(g => collapsedMonths.includes(g.month));
                    setCollapsedMonths(allCollapsed ? [] : groupedDates.map(g => g.month));
                  }}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'group',
                  )}
                  tabIndex={0}
                  aria-label={groupedDates.every(g => collapsedMonths.includes(g.month))
                    ? 'Expand all months'
                    : 'Collapse all months'
                  }
                >
                  {groupedDates.every(g => collapsedMonths.includes(g.month)) ? (
                    <ChevronDown className={cn(
                      'h-3.5 w-3.5',
                      colorStyles[colorScheme].accent,
                    )} />
                  ) : (
                    <ChevronUp className={cn(
                      'h-3.5 w-3.5',
                      colorStyles[colorScheme].accent,
                    )} />
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBulkMode(!isBulkMode)}
                className={cn(
                  'h-7 px-2.5 gap-1.5',
                  'border transition-all duration-200',
                  colorStyles[colorScheme].border,
                  isBulkMode && colorStyles[colorScheme].highlight,
                  !isBulkMode && colorStyles[colorScheme].hover,
                  colorStyles[colorScheme].active,
                  'hover:border-opacity-100',
                  'group',
                )}
                tabIndex={0}
                aria-label={`${isBulkMode ? 'Exit bulk edit mode' : 'Enter bulk edit mode'}`}
                aria-pressed={isBulkMode}
              >
                <span className={cn(
                  'text-[11px] font-medium',
                  colorStyles[colorScheme].text,
                )}>
                  Bulk Edit
                </span>
              </Button>
            </>
          )}
          {showBulkManagement && isBulkMode && selectedDates.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBulkRename}
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
              aria-label={`Rename ${selectedDates.length} selected dates`}
            >
              <Pencil
                className={cn(
                  'h-3.5 w-3.5',
                  colorStyles[colorScheme].accent,
                )}
              />
              <span className={cn(
                'text-[11px] font-medium',
                colorStyles[colorScheme].text,
              )}>
                Rename {selectedDates.length}
              </span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
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
            <Trash2
              className={cn(
                'h-3.5 w-3.5 transition-colors duration-200',
                colorStyles[colorScheme].accent,
                'group-hover:text-red-500 dark:group-hover:text-red-400',
              )}
            />
            <span className={cn(
              'text-[11px] font-medium',
              colorStyles[colorScheme].text,
            )}>
              Clear All
            </span>
          </Button>
        </div>
      </header>

      {showBulkManagement && isBulkMode && editingDate === 'bulk' ? (
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
      ) : null}

      <div className={cn(
        'rounded-lg border',
        colorStyles[colorScheme].border,
        'overflow-hidden',
      )}>
        <ul
          className={cn(
            'divide-y',
            colorStyles[colorScheme].divider,
          )}
          role="list"
          aria-label={`List of ${title.toLowerCase()}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {items.length > 0 && (showBulkManagement && isBulkMode ? (
              // Grouped view
              groupedDates.map(({ month, dates }) => (
                <motion.li
                  key={month}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={colorStyles[colorScheme].hover}
                >
                  <motion.div
                    className={cn(
                      'flex items-center justify-between px-3 py-2',
                      'cursor-pointer select-none',
                      colorStyles[colorScheme].hover,
                    )}
                    onClick={() => handleSelectMonth(month)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectMonth(month);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.input
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        type="checkbox"
                        checked={dates.every(d => selectedDates.includes(d.date))}
                        onChange={() => handleSelectMonth(month)}
                        className={cn(
                          'h-3.5 w-3.5 rounded',
                          `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
                          'border-gray-300 dark:border-gray-600',
                        )}
                      />
                      <span className={cn(
                        'text-sm font-medium',
                        colorStyles[colorScheme].text,
                      )}>
                        {month}
                      </span>
                      <span className={cn(
                        'text-[11px]',
                        colorStyles[colorScheme].muted,
                      )}>
                        ({dates.length})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMonthCollapse(month);
                      }}
                      className={cn(
                        'h-6 w-6 p-0',
                        colorStyles[colorScheme].hover,
                      )}
                    >
                      {collapsedMonths.includes(month) ? (
                        <ChevronDown className={cn('h-4 w-4', colorStyles[colorScheme].accent)} />
                      ) : (
                        <ChevronUp className={cn('h-4 w-4', colorStyles[colorScheme].accent)} />
                      )}
                    </Button>
                  </motion.div>

                  <AnimatePresence initial={false}>
                    {!collapsedMonths.includes(month) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
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
                            onRemove={handleItemRemove}
                            colorScheme={colorScheme}
                            handleKeyDown={handleKeyDown}
                            startEditing={startEditing}
                            handleBlur={handleBlur}
                            setEditingValue={setEditingValue}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))
            ) : (
              // Flat list
              sortedItems.map((item) => (
                <motion.li
                  key={item.date}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DateListItem
                    item={item}
                    showBulkManagement={showBulkManagement && isBulkMode}
                    selectedDates={selectedDates}
                    setSelectedDates={setSelectedDates}
                    editingDate={editingDate}
                    setEditingDate={setEditingDate}
                    editingValue={editingValue}
                    onUpdateName={onUpdateName}
                    onRemove={handleItemRemove}
                    colorScheme={colorScheme}
                    handleKeyDown={handleKeyDown}
                    startEditing={startEditing}
                    handleBlur={handleBlur}
                    setEditingValue={setEditingValue}
                  />
                </motion.li>
              ))
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
}

// Extract DateListItem to reduce duplication
interface DateListItemProps {
  item: DateItem;
  showBulkManagement: boolean;
  selectedDates: string[];
  setSelectedDates: (fn: (prev: string[]) => string[]) => void;
  editingDate: string | null;
  setEditingDate: (date: string | null) => void;
  editingValue: string;
  onUpdateName?: (date: string, newName: string) => void;
  onRemove: (date: string) => void;
  colorScheme: 'amber' | 'violet';
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  startEditing: (date: string, currentName: string) => void;
  handleBlur: () => void;
  setEditingValue: (value: string) => void;
}

function DateListItem({
                        item,
                        showBulkManagement,
                        selectedDates,
                        setSelectedDates,
                        editingDate,
                        setEditingDate,
                        editingValue,
                        onUpdateName,
                        onRemove,
                        colorScheme,
                        handleKeyDown,
                        startEditing,
                        handleBlur,
                        setEditingValue,
                      }: DateListItemProps) {
  return (
    <div
      className={cn(
        'group/item relative',
        'border-t',
        colorStyles[colorScheme].divider,
        colorStyles[colorScheme].hover,
        'transition-colors duration-200',
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        {showBulkManagement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="checkbox"
              checked={selectedDates.includes(item.date)}
              onChange={() => {
                setSelectedDates(prev =>
                  prev.includes(item.date)
                    ? prev.filter(d => d !== item.date)
                    : [...prev, item.date],
                );
              }}
              className={cn(
                'h-3.5 w-3.5 rounded',
                `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
                'border-gray-300 dark:border-gray-600',
              )}
            />
          </motion.div>
        )}
        <div className="flex-1 min-w-0">
          {editingDate === item.date ? (
            <div className="flex items-center gap-1.5">
              <Input
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, item.date)}
                onBlur={handleBlur}
                className={cn(
                  'h-7 text-sm font-medium flex-1',
                  'bg-white dark:bg-gray-900',
                  colorStyles[colorScheme].input,
                  colorStyles[colorScheme].text,
                )}
                aria-label={`Edit name for ${format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}`}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingDate(null)}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-red-100/70 dark:hover:bg-red-900/30',
                    'group',
                  )}
                  aria-label="Cancel edit"
                >
                  <X className={cn(
                    'h-3.5 w-3.5',
                    colorStyles[colorScheme].accent,
                    'group-hover:text-red-500 dark:group-hover:text-red-400',
                  )} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBlur}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-green-100/70 dark:hover:bg-green-900/30',
                    'group',
                  )}
                  aria-label="Confirm edit"
                >
                  <Check className={cn(
                    'h-3.5 w-3.5',
                    colorStyles[colorScheme].accent,
                    'group-hover:text-green-500 dark:group-hover:text-green-400',
                  )} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm font-medium',
                  colorStyles[colorScheme].text,
                )}>
                  {item.name}
                </p>
                {onUpdateName && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(item.date, item.name)}
                    className={cn(
                      'h-6 w-6 p-0',
                      'opacity-0 group-hover/item:opacity-100',
                      'transition-all duration-200',
                      colorStyles[colorScheme].hover,
                      'hover:scale-110 active:scale-95',
                    )}
                    aria-label={`Edit name for ${item.name}`}
                  >
                    <Pencil className={cn(
                      'h-3 w-3',
                      colorStyles[colorScheme].accent,
                    )} />
                  </Button>
                )}
              </div>
              <time
                dateTime={item.date}
                className={cn('text-[11px] block mt-0.5', colorStyles[colorScheme].muted)}
              >
                {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy')}
              </time>
            </>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.date)}
          onKeyDown={(e) => handleKeyDown(e, item.date)}
          className={cn(
            'h-7 w-7 p-0',
            'opacity-0 group-hover/item:opacity-100',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            colorStyles[colorScheme].hover,
            'hover:bg-red-100/70 dark:hover:bg-red-900/30',
            'group/button',
          )}
          tabIndex={0}
          aria-label={`Remove ${item.name}`}
          data-date={item.date}
        >
          <X className={cn(
            'h-3.5 w-3.5',
            colorStyles[colorScheme].accent,
            'group-hover/button:text-red-500 dark:group-hover/button:text-red-400',
            'transition-colors duration-200',
          )} />
        </Button>
      </div>
    </div>
  );
} 