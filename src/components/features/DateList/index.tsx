import { createContext, KeyboardEvent as ReactKeyboardEvent, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DateListProps } from './types';
import { colorStyles } from './constants/styles';
import { ANIMATION_CONFIG } from './constants/animations';
import { useDateGrouping } from './hooks/useDateGrouping';
import { useBulkSelection } from './hooks/useBulkSelection';
import { useGroupCollapse } from './hooks/useGroupCollapse';
import { ListHeader } from './components/ListHeader';
import { BulkRenameInput } from './components/BulkRenameInput';
import { GroupedView } from './components/GroupedView';
import { FlatView } from './components/FlatView';

// Color styles context
const ColorStylesContext = createContext<Record<string, string>>({});

export function DateList({
  items,
  title,
  colorScheme,
  onRemove,
  onClearAll,
  onUpdateName,
  onBulkRename,
  showBulkManagement = false,
  isBulkMode = false,
}: DateListProps) {
  const groupedDates = useDateGrouping(items, showBulkManagement, isBulkMode);
  const { collapsedGroups, setCollapsedGroups } = useGroupCollapse(groupedDates, showBulkManagement, isBulkMode);
  const {
    selectedDates,
    setSelectedDates,
    editingDate,
    setEditingDate,
    editingValue,
    setEditingValue,
    handleBulkRename,
    handleBulkRenameConfirm
  } = useBulkSelection(onBulkRename);

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => {
    const index = items.findIndex(item => item.date === date);
    if (index === -1) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace': {
        if (editingDate === null) {
          e.preventDefault();
          onRemove(date);
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        e.preventDefault();
        if (editingDate === null) {
          const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
          const targetDate = items[targetIndex]?.date;
          if (targetDate) {
            const targetButton = document.querySelector(`[data-date="${targetDate}"]`) as HTMLButtonElement;
            targetButton?.focus();
          }
        }
        break;
      }
      case 'Enter': {
        if (editingDate !== null && onUpdateName) {
          e.preventDefault();
          onUpdateName(date, editingValue.trim());
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
  }, [items, editingDate, editingValue, onRemove, onUpdateName, setEditingDate]);

  const startEditing = useCallback((date: string, currentName: string) => {
    if (!onUpdateName) return;
    setEditingValue(currentName);
    setEditingDate(date);
  }, [onUpdateName, setEditingValue, setEditingDate]);

  const handleBlur = useCallback(() => {
    if (editingDate !== null && onUpdateName) {
      onUpdateName(editingDate, editingValue.trim());
      setEditingDate(null);
    }
  }, [editingDate, editingValue, onUpdateName, setEditingDate]);

  const handleSelectGroup = useCallback((name: string) => {
    if (!showBulkManagement) return;
    const groupDates = groupedDates.find(g => g.name === name)?.dates || [];
    const dates = groupDates.map(d => d.date);
    const allSelected = dates.every(date => selectedDates.includes(date));
    setSelectedDates(prev =>
      allSelected
        ? prev.filter(d => !dates.includes(d))
        : [...new Set([...prev, ...dates])]
    );
  }, [showBulkManagement, groupedDates, selectedDates, setSelectedDates]);

  const toggleGroupCollapse = useCallback((name: string) => {
    setCollapsedGroups(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  }, [setCollapsedGroups]);

  if (items.length === 0) return null;

  return (
    <ColorStylesContext.Provider value={colorStyles[colorScheme]}>
      <motion.section
        {...ANIMATION_CONFIG}
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
        <ListHeader
          title={title}
          itemCount={items.length}
          colorScheme={colorScheme}
          showBulkManagement={showBulkManagement}
          isBulkMode={isBulkMode}
          selectedDates={selectedDates}
          onBulkRename={() => handleBulkRename(items)}
          onClearAll={onClearAll}
          groupedDates={groupedDates}
          collapsedGroups={collapsedGroups}
          setCollapsedGroups={setCollapsedGroups}
        />

        {showBulkManagement && isBulkMode && editingDate === 'bulk' && (
          <BulkRenameInput
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            setEditingDate={setEditingDate}
            handleBulkRenameConfirm={handleBulkRenameConfirm}
            colorScheme={colorScheme}
          />
        )}

        <div className={cn('rounded-lg border', colorStyles[colorScheme].border, 'overflow-hidden')}>
          <ul
            className={cn('divide-y', colorStyles[colorScheme].divider)}
            role="list"
            aria-label={`List of dates`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {showBulkManagement && isBulkMode ? (
                <GroupedView
                  groupedDates={groupedDates}
                  colorScheme={colorScheme}
                  selectedDates={selectedDates}
                  collapsedGroups={collapsedGroups}
                  handleSelectGroup={handleSelectGroup}
                  toggleGroupCollapse={toggleGroupCollapse}
                  onUpdateName={onUpdateName}
                  onRemove={onRemove}
                  handleKeyDown={handleKeyDown}
                  startEditing={startEditing}
                  handleBlur={handleBlur}
                  setSelectedDates={setSelectedDates}
                  editingDate={editingDate}
                  setEditingDate={setEditingDate}
                  editingValue={editingValue}
                  setEditingValue={setEditingValue}
                />
              ) : (
                <FlatView
                  items={items}
                  colorScheme={colorScheme}
                  showBulkManagement={showBulkManagement && isBulkMode}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                  editingDate={editingDate}
                  setEditingDate={setEditingDate}
                  editingValue={editingValue}
                  onUpdateName={onUpdateName}
                  onRemove={onRemove}
                  handleKeyDown={handleKeyDown}
                  startEditing={startEditing}
                  handleBlur={handleBlur}
                  setEditingValue={setEditingValue}
                />
              )}
            </AnimatePresence>
          </ul>
        </div>
      </motion.section>
    </ColorStylesContext.Provider>
  );
} 