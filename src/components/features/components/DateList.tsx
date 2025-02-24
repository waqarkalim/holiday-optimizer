import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parse, format, isSameMonth } from 'date-fns';
import { X, Calendar, Trash2, Pencil, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KeyboardEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onRemove: (index: number) => void;
  onClearAll: () => void;
  showName?: boolean;
  onUpdateName?: (index: number, newName: string) => void;
  onBulkRename?: (indices: number[], newName: string) => void;
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
  showBulkManagement = false
}: DateListProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [collapsedMonths, setCollapsedMonths] = useState<string[]>([]);

  // Sort all items by date
  const sortedItems = items.sort((a, b) => 
    parse(a.date, 'yyyy-MM-dd', new Date()).getTime() - 
    parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
  );

  // Group dates by month (only used when showBulkManagement is true)
  const groupedDates: GroupedDates[] = showBulkManagement 
    ? sortedItems.reduce((groups: GroupedDates[], item) => {
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

  const handleSelectMonth = (month: string) => {
    const monthDates = groupedDates.find(g => g.month === month)?.dates || [];
    const monthIndices = monthDates.map(d => items.findIndex(item => item.date === d.date));
    
    // If all dates in month are selected, unselect them
    const allSelected = monthIndices.every(i => selectedIndices.includes(i));
    if (allSelected) {
      setSelectedIndices(selectedIndices.filter(i => !monthIndices.includes(i)));
    } else {
      setSelectedIndices([...new Set([...selectedIndices, ...monthIndices])]);
    }
  };

  const handleBulkRename = () => {
    if (!onBulkRename || selectedIndices.length === 0) return;
    
    // Get the most common name from selected items
    const names = selectedIndices.map(i => items[i].name);
    const commonName = names.reduce((acc, curr) => 
      names.filter(name => name === acc).length >= names.filter(name => name === curr).length ? acc : curr
    );
    
    setEditingValue(commonName);
    setEditingDate('bulk');
  };

  const handleBulkRenameConfirm = () => {
    if (!onBulkRename || selectedIndices.length === 0) return;
    onBulkRename(selectedIndices, editingValue.trim());
    setEditingDate(null);
    setSelectedIndices([]);
  };

  const toggleMonthCollapse = (month: string) => {
    setCollapsedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, index: number, date: string) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace': {
        if (editingDate === null) {
          e.preventDefault();
          onRemove(index);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (editingDate === null) {
          const prevButton = document.querySelector(`[data-index="${index - 1}"]`) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        if (editingDate === null) {
          const nextButton = document.querySelector(`[data-index="${index + 1}"]`) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;
      }
      case 'Enter': {
        if (editingDate !== null && onUpdateName) {
          e.preventDefault();
          const index = items.findIndex(item => item.date === editingDate);
          if (index !== -1) {
            onUpdateName(index, editingValue.trim());
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
        onUpdateName(index, editingValue.trim());
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
        colorStyles[colorScheme].border
      )}
      aria-labelledby={`${title.toLowerCase()}-list-heading`}
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'p-1.5 rounded-lg',
            colorStyles[colorScheme].highlight
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
          {showBulkManagement && selectedIndices.length > 0 && (
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
                'group'
              )}
              tabIndex={0}
              aria-label="Rename selected dates"
            >
              <Pencil 
                className={cn(
                  'h-3.5 w-3.5',
                  colorStyles[colorScheme].accent
                )} 
              />
              <span className={cn(
                'text-[11px] font-medium',
                colorStyles[colorScheme].text
              )}>
                Rename {selectedIndices.length}
              </span>
            </Button>
          )}
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
              'group'
            )}
            tabIndex={0}
            aria-label={`Clear all ${title.toLowerCase()}`}
          >
            <Trash2 
              className={cn(
                'h-3.5 w-3.5 transition-colors duration-200',
                colorStyles[colorScheme].accent,
                'group-hover:text-red-500 dark:group-hover:text-red-400'
              )} 
            />
            <span className={cn(
              'text-[11px] font-medium',
              colorStyles[colorScheme].text
            )}>
              Clear All
            </span>
          </Button>
        </div>
      </header>

      {showBulkManagement && editingDate === 'bulk' ? (
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBulkRenameConfirm}
            className={cn(
              'h-8 px-3',
              colorStyles[colorScheme].border,
              colorStyles[colorScheme].hover,
            )}
          >
            <Check className={cn('h-4 w-4', colorStyles[colorScheme].accent)} />
          </Button>
        </div>
      ) : null}

      <div className={cn(
        'rounded-lg border',
        colorStyles[colorScheme].border,
        'overflow-hidden'
      )}>
        <ul 
          className={cn(
            'divide-y',
            colorStyles[colorScheme].divider
          )}
          role="list"
          aria-label={`List of ${title.toLowerCase()}`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {showBulkManagement ? (
              // Grouped view for bulk management
              groupedDates.map(({ month, dates }) => (
                <motion.li
                  key={month}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={colorStyles[colorScheme].hover}
                >
                  <div 
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
                      <input
                        type="checkbox"
                        checked={dates.every(d => 
                          selectedIndices.includes(items.findIndex(item => item.date === d.date))
                        )}
                        onChange={() => handleSelectMonth(month)}
                        className={cn(
                          'h-3.5 w-3.5 rounded',
                          `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
                          'border-gray-300 dark:border-gray-600',
                        )}
                      />
                      <span className={cn(
                        'text-sm font-medium',
                        colorStyles[colorScheme].text
                      )}>
                        {month}
                      </span>
                      <span className={cn(
                        'text-[11px]',
                        colorStyles[colorScheme].muted
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
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {!collapsedMonths.includes(month) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {dates.map((item) => (
                          <DateListItem
                            key={item.date}
                            item={item}
                            itemIndex={items.findIndex(i => i.date === item.date)}
                            showBulkManagement={showBulkManagement}
                            selectedIndices={selectedIndices}
                            setSelectedIndices={setSelectedIndices}
                            editingDate={editingDate}
                            editingValue={editingValue}
                            onUpdateName={onUpdateName}
                            onRemove={onRemove}
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
              // Flat list for non-bulk management
              sortedItems.map((item, index) => (
                <motion.li
                  key={item.date}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DateListItem
                    item={item}
                    itemIndex={index}
                    showBulkManagement={showBulkManagement}
                    selectedIndices={selectedIndices}
                    setSelectedIndices={setSelectedIndices}
                    editingDate={editingDate}
                    editingValue={editingValue}
                    onUpdateName={onUpdateName}
                    onRemove={onRemove}
                    colorScheme={colorScheme}
                    handleKeyDown={handleKeyDown}
                    startEditing={startEditing}
                    handleBlur={handleBlur}
                    setEditingValue={setEditingValue}
                  />
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
}

// Extract DateListItem to reduce duplication
interface DateListItemProps {
  item: DateItem;
  itemIndex: number;
  showBulkManagement: boolean;
  selectedIndices: number[];
  setSelectedIndices: (fn: (prev: number[]) => number[]) => void;
  editingDate: string | null;
  editingValue: string;
  onUpdateName?: (index: number, newName: string) => void;
  onRemove: (index: number) => void;
  colorScheme: 'amber' | 'violet';
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, index: number, date: string) => void;
  startEditing: (date: string, currentName: string) => void;
  handleBlur: () => void;
  setEditingValue: (value: string) => void;
}

function DateListItem({
  item,
  itemIndex,
  showBulkManagement,
  selectedIndices,
  setSelectedIndices,
  editingDate,
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
        'transition-colors duration-200'
      )}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        {showBulkManagement && (
          <input
            type="checkbox"
            checked={selectedIndices.includes(itemIndex)}
            onChange={() => {
              setSelectedIndices(prev => 
                prev.includes(itemIndex)
                  ? prev.filter(i => i !== itemIndex)
                  : [...prev, itemIndex]
              );
            }}
            className={cn(
              'h-3.5 w-3.5 rounded',
              `text-${colorScheme}-600 dark:text-${colorScheme}-400`,
              'border-gray-300 dark:border-gray-600',
            )}
          />
        )}
        <div className="flex-1 min-w-0">
          {editingDate === item.date ? (
            <Input
              autoFocus
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, itemIndex, item.date)}
              onBlur={handleBlur}
              className={cn(
                'h-7 text-sm font-medium',
                'bg-white dark:bg-gray-900',
                colorStyles[colorScheme].input,
                colorStyles[colorScheme].text,
              )}
              aria-label={`Edit name for ${format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}`}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm font-medium',
                  colorStyles[colorScheme].text
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
                      colorStyles[colorScheme].accent
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
          onClick={() => onRemove(itemIndex)}
          onKeyDown={(e) => handleKeyDown(e, itemIndex, item.date)}
          className={cn(
            'h-7 w-7 p-0',
            'opacity-0 group-hover/item:opacity-100',
            'transition-all duration-200',
            'hover:scale-110 active:scale-95',
            colorStyles[colorScheme].hover,
            'hover:bg-red-100/70 dark:hover:bg-red-900/30',
            'group/button'
          )}
          tabIndex={0}
          aria-label={`Remove ${item.name}`}
          data-index={itemIndex}
        >
          <X className={cn(
            'h-3.5 w-3.5',
            colorStyles[colorScheme].accent,
            'group-hover/button:text-red-500 dark:group-hover/button:text-red-400',
            'transition-colors duration-200'
          )} />
        </Button>
      </div>
    </div>
  );
} 