import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { format, parse } from 'date-fns';
import { useOptimizerForm } from '@/features/optimizer/hooks/useOptimizer';
import { DateItem, GroupedDates } from './types';
import { colorStyles } from './styles';

type EditingTarget = string | 'bulk' | null;

type ColorScheme = 'violet' | 'blue' | 'amber';
type Theme = (typeof colorStyles)[ColorScheme];

interface CompanyDayListContextValue {
  title: string;
  colorScheme: ColorScheme;
  theme: Theme;
  items: DateItem[];
  groups: GroupedDates[];
  itemCount: number;
  selectedDates: string[];
  collapsedGroups: string[];
  editingTarget: EditingTarget;
  editingValue: string;
  hasSelection: boolean;
  toggleDateSelection: (date: string) => void;
  toggleGroupSelection: (groupName: string) => void;
  toggleGroupCollapse: (groupName: string) => void;
  collapseAllGroups: () => void;
  expandAllGroups: () => void;
  beginEditing: (date: string, currentName: string) => void;
  cancelEditing: () => void;
  updateEditingValue: (value: string) => void;
  commitEditing: (date?: string) => void;
  beginBulkRename: () => void;
  confirmBulkRename: () => void;
  handleItemKeyDown: (
    event: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>,
    date: string
  ) => void;
  handleInputBlur: () => void;
  removeDate: (date: string) => void;
  clearAllDates: () => void;
}

type CompanyDayListProviderProps = {
  title: string;
  colorScheme: ColorScheme;
  children: ReactNode;
  onBulkRename: (dates: string[], newName: string) => void;
  filteredItems: DateItem[];
  onRemove: (date: string) => void;
  onClearAll: () => void;
  onAdd: (date: string, name: string) => void;
};

const CompanyDayListContext = createContext<CompanyDayListContextValue | null>(null);

const DATE_FORMAT = 'yyyy-MM-dd';

const parseDate = (value: string) => parse(value, DATE_FORMAT, new Date());

const groupCompanyDays = (items: DateItem[]): GroupedDates[] => {
  const groups = new Map<string, GroupedDates>();

  items.forEach(item => {
    const parsedDate = parseDate(item.date);
    const defaultLabel = format(parsedDate, 'MMMM d, yyyy');
    const isDefaultNamed = item.name === defaultLabel;
    const groupName = isDefaultNamed ? format(parsedDate, 'MMMM yyyy') : item.name;
    const key = `${groupName}|${isDefaultNamed ? 'default' : 'custom'}`;

    if (!groups.has(key)) {
      const firstDayOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
      groups.set(key, {
        name: groupName,
        dates: [item],
        isDefaultNamed,
        groupKeyTimestamp: firstDayOfMonth.getTime(),
      });
      return;
    }

    groups.get(key)!.dates.push(item);
  });

  return Array.from(groups.values())
    .map(group => {
      const dates = [...group.dates].sort(
        (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
      );
      const firstDate = parseDate(dates[0]?.date ?? format(new Date(), DATE_FORMAT));
      return {
        ...group,
        dates,
        groupKeyTimestamp: new Date(firstDate.getFullYear(), firstDate.getMonth(), 1).getTime(),
      };
    })
    .sort((a, b) => a.groupKeyTimestamp - b.groupKeyTimestamp);
};

const getCollapsedDefaults = (groups: GroupedDates[]) =>
  groups.filter(group => !group.isDefaultNamed).map(group => group.name);

const deriveBulkRenameValue = (items: DateItem[], selectedDates: string[]) => {
  const selectedItems = items.filter(item => selectedDates.includes(item.date));
  if (selectedItems.length === 0) return '';

  const counts = new Map<string, number>();
  let winner = selectedItems[0].name;
  let max = 0;

  selectedItems.forEach(({ name }) => {
    const next = (counts.get(name) ?? 0) + 1;
    counts.set(name, next);
    if (next > max) {
      max = next;
      winner = name;
    }
  });

  return winner;
};

export const CompanyDayListProvider = ({
  children,
  title,
  colorScheme,
  onBulkRename,
  filteredItems,
  onRemove,
  onClearAll,
  onAdd,
}: CompanyDayListProviderProps) => {
  // Use filtered items for display
  const items = filteredItems;

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null);
  const [editingValue, setEditingValue] = useState('');

  const groups = groupCompanyDays(items);
  const itemCount = items.length;
  const theme = colorStyles[colorScheme];

  useEffect(() => {
    const grouped = groupCompanyDays(items);
    setCollapsedGroups(getCollapsedDefaults(grouped));
  }, [items]);

  useEffect(() => {
    setSelectedDates(prev => prev.filter(date => items.some(item => item.date === date)));
  }, [items]);

  useEffect(() => {
    if (editingTarget && editingTarget !== 'bulk') {
      const stillExists = items.some(item => item.date === editingTarget);
      if (!stillExists) {
        setEditingTarget(null);
        setEditingValue('');
      }
    }
  }, [items, editingTarget]);

  const toggleDateSelection = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date) ? prev.filter(value => value !== date) : [...prev, date]
    );
  };

  const toggleGroupSelection = (groupName: string) => {
    const group = groups.find(({ name }) => name === groupName);
    if (!group) return;

    const dates = group.dates.map(({ date }) => date);
    setSelectedDates(prev => {
      const allSelected = dates.every(date => prev.includes(date));
      if (allSelected) {
        return prev.filter(date => !dates.includes(date));
      }
      return Array.from(new Set([...prev, ...dates]));
    });
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev =>
      prev.includes(groupName) ? prev.filter(name => name !== groupName) : [...prev, groupName]
    );
  };

  const collapseAllGroups = () => {
    setCollapsedGroups(groups.map(({ name }) => name));
  };

  const expandAllGroups = () => {
    setCollapsedGroups([]);
  };

  const beginEditing = (date: string, currentName: string) => {
    setEditingTarget(date);
    setEditingValue(currentName);
  };

  const cancelEditing = () => {
    setEditingTarget(null);
    setEditingValue('');
  };

  const commitEditing = (date?: string) => {
    if (!editingTarget || editingTarget === 'bulk') return;
    const targetDate = date ?? editingTarget;
    const nextName = editingValue.trim();
    onAdd(targetDate, nextName);
    cancelEditing();
  };

  const beginBulkRename = () => {
    if (selectedDates.length === 0) return;
    setEditingTarget('bulk');
    setEditingValue(deriveBulkRenameValue(items, selectedDates));
  };

  const confirmBulkRename = () => {
    if (editingTarget !== 'bulk' || selectedDates.length === 0) return;
    onBulkRename(selectedDates, editingValue.trim());
    setEditingTarget(null);
    setEditingValue('');
    setSelectedDates([]);
  };

  const handleItemKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>,
    date: string
  ) => {
    const index = items.findIndex(item => item.date === date);
    if (index === -1) return;

    switch (event.key) {
      case 'Delete':
      case 'Backspace': {
        if (!editingTarget) {
          event.preventDefault();
          onRemove(date);
          setSelectedDates(prev => prev.filter(value => value !== date));
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        if (!editingTarget) {
          const targetIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
          const targetDate = items[targetIndex]?.date;
          if (targetDate && typeof document !== 'undefined') {
            const targetButton = document.querySelector(
              `[data-date="${targetDate}"]`
            ) as HTMLButtonElement | null;
            targetButton?.focus();
          }
        }
        break;
      }
      case 'Enter': {
        if (editingTarget === date) {
          event.preventDefault();
          commitEditing(date);
        }
        break;
      }
      case 'Escape': {
        if (editingTarget === date) {
          event.preventDefault();
          cancelEditing();
        }
        break;
      }
      default:
        break;
    }
  };

  const handleInputBlur = () => {
    if (editingTarget && editingTarget !== 'bulk') {
      commitEditing(editingTarget);
    }
  };

  const removeDate = (date: string) => {
    onRemove(date);
    setSelectedDates(prev => prev.filter(value => value !== date));
    if (editingTarget === date) {
      cancelEditing();
    }
  };

  const clearAllDates = () => {
    onClearAll();
    setSelectedDates([]);
    cancelEditing();
  };

  const value: CompanyDayListContextValue = {
    title,
    colorScheme,
    theme,
    items,
    groups,
    itemCount,
    selectedDates,
    collapsedGroups,
    editingTarget,
    editingValue,
    hasSelection: selectedDates.length > 0,
    toggleDateSelection,
    toggleGroupSelection,
    toggleGroupCollapse,
    collapseAllGroups,
    expandAllGroups,
    beginEditing,
    cancelEditing,
    updateEditingValue: setEditingValue,
    commitEditing,
    beginBulkRename,
    confirmBulkRename,
    handleItemKeyDown,
    handleInputBlur,
    removeDate,
    clearAllDates,
  };

  return <CompanyDayListContext.Provider value={value}>{children}</CompanyDayListContext.Provider>;
};

export const useCompanyDayList = () => {
  const context = useContext(CompanyDayListContext);
  if (!context) {
    throw new Error('useCompanyDayList must be used within a CompanyDayListProvider');
  }
  return context;
};
