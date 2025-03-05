import { createContext, KeyboardEvent as ReactKeyboardEvent, ReactNode, useContext } from 'react';
import { DateItem, GroupedDates } from '../types';
import { useDateGrouping } from '../hooks/useDateGrouping';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useGroupCollapse } from '../hooks/useGroupCollapse';
import { useCompanyDays } from '@/hooks/useOptimizer';

export interface DateListContextProps {
  // State
  items: DateItem[];
  title: string;
  colorScheme: 'violet';
  groupedDates: GroupedDates[];
  selectedDates: string[];
  collapsedGroups: string[];
  editingDate: string | null;
  editingValue: string;

  // Actions
  setSelectedDates: (fn: (prev: string[]) => string[]) => void;
  setEditingDate: (date: string | null) => void;
  setEditingValue: (value: string) => void;
  setCollapsedGroups: (fn: (prev: string[]) => string[]) => void;

  // Handlers
  handleSelectGroup: (name: string) => void;
  toggleGroupCollapse: (name: string) => void;
  handleKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  startEditing: (date: string, currentName: string) => void;
  handleBlur: () => void;
  handleBulkRename: () => void;
  handleBulkRenameConfirm: () => void;
  onRemoveAction: (date: string) => void;
  onClearAllAction: () => void;
  onUpdateName?: (date: string, newName: string) => void;
}

const DateListContext = createContext<DateListContextProps | undefined>(undefined);

export interface DateListProviderProps {
  children: ReactNode;
  title: string;
  colorScheme: 'violet';
  onBulkRename?: (dates: string[], newName: string) => void;
}

export const DateListProvider = ({
                                   children,
                                   title,
                                   colorScheme,
                                   onBulkRename,
                                 }: DateListProviderProps) => {
  const {
    companyDaysOff: items,
    addCompanyDay: onUpdateName,
    removeCompanyDay: onRemoveAction,
    clearCompanyDays: onClearAllAction,
  } = useCompanyDays();
  const groupedDates = useDateGrouping(items);
  const { collapsedGroups, setCollapsedGroups } = useGroupCollapse(groupedDates);
  const {
    selectedDates,
    setSelectedDates,
    editingDate,
    setEditingDate,
    editingValue,
    setEditingValue,
    handleBulkRename: bulkRename,
    handleBulkRenameConfirm,
  } = useBulkSelection(onBulkRename);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => {
    const index = items.findIndex(item => item.date === date);
    if (index === -1) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace': {
        if (editingDate === null) {
          e.preventDefault();
          onRemoveAction(date);
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
            if (typeof window !== 'undefined') {
              const targetButton = document.querySelector(`[data-date="${targetDate}"]`) as HTMLButtonElement;
              targetButton?.focus();
            }
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
  };

  const startEditing = (date: string, currentName: string) => {
    if (!onUpdateName) return;
    setEditingValue(currentName);
    setEditingDate(date);
  };

  const handleBlur = () => {
    if (editingDate !== null && onUpdateName) {
      onUpdateName(editingDate, editingValue.trim());
      setEditingDate(null);
    }
  };

  const handleSelectGroup = (name: string) => {
    const groupDates = groupedDates.find(g => g.name === name)?.dates || [];
    const dates = groupDates.map(d => d.date);
    const allSelected = dates.every(date => selectedDates.includes(date));
    setSelectedDates(prev =>
      allSelected
        ? prev.filter(d => !dates.includes(d))
        : [...new Set([...prev, ...dates])],
    );
  };

  const toggleGroupCollapse = (name: string) => {
    setCollapsedGroups(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name],
    );
  };

  const handleBulkRename = () => {
    bulkRename(items);
  };

  const value: DateListContextProps = {
    // State
    items,
    title,
    colorScheme,
    groupedDates,
    selectedDates,
    collapsedGroups,
    editingDate,
    editingValue,

    // Actions
    setSelectedDates,
    setEditingDate,
    setEditingValue,
    setCollapsedGroups,

    // Handlers
    handleSelectGroup,
    toggleGroupCollapse,
    handleKeyDown,
    startEditing,
    handleBlur,
    handleBulkRename,
    handleBulkRenameConfirm,
    onRemoveAction,
    onClearAllAction,
    onUpdateName,
  };

  return (
    <DateListContext.Provider value={value}>
      {children}
    </DateListContext.Provider>
  );
};

export const useDateList = () => {
  const context = useContext(DateListContext);

  if (context === undefined) {
    throw new Error('useDateList must be used within a DateListProvider');
  }

  return context;
}; 