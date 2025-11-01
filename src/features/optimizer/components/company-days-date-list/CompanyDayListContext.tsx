import {
  createContext,
  useContext,
  useState,
  ReactNode,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { format, parse } from 'date-fns';
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
  const items = filteredItems;
  const groups = groupCompanyDays(items);
  const itemCount = items.length;
  const theme = colorStyles[colorScheme];
  const itemsByDate = new Set(items.map(item => item.date));
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [collapsedOverrides, setCollapsedOverrides] = useState<Record<string, boolean>>({});
  const [editingState, setEditingState] = useState<{ target: EditingTarget; value: string }>({
    target: null,
    value: '',
  });

  const defaultCollapsedGroups = getCollapsedDefaults(groups);
  const defaultCollapsedSet = new Set(defaultCollapsedGroups);
  const collapsedGroups = groups
    .filter(({ name }) => {
      const override = collapsedOverrides[name];
      if (override !== undefined) {
        return override;
      }
      return defaultCollapsedSet.has(name);
    })
    .map(({ name }) => name);
  const sanitizedSelectedDates = selectedDates.filter(date => itemsByDate.has(date));

  const hasSelection = sanitizedSelectedDates.length > 0;
  const activeEditingTarget =
    editingState.target === 'bulk'
      ? hasSelection
        ? editingState.target
        : null
      : editingState.target && itemsByDate.has(editingState.target)
        ? editingState.target
        : null;
  const editingValue = activeEditingTarget ? editingState.value : '';

  const updateSelection = (updater: (current: string[]) => string[]) => {
    setSelectedDates(prev => {
      const current = prev.filter(date => itemsByDate.has(date));
      return updater(current);
    });
  };

  const resetEditingState = () => {
    setEditingState({ target: null, value: '' });
  };

  const toggleDateSelection = (date: string) => {
    updateSelection(prev =>
      prev.includes(date) ? prev.filter(value => value !== date) : [...prev, date]
    );
  };

  const toggleGroupSelection = (groupName: string) => {
    const group = groups.find(({ name }) => name === groupName);
    if (!group) return;

    const dates = group.dates.map(({ date }) => date);
    updateSelection(prev => {
      const allSelected = dates.every(date => prev.includes(date));
      if (allSelected) {
        return prev.filter(date => !dates.includes(date));
      }
      return Array.from(new Set([...prev, ...dates]));
    });
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedOverrides(prev => {
      const next = { ...prev };
      const isDefaultCollapsed = defaultCollapsedSet.has(groupName);
      const current = next[groupName] ?? isDefaultCollapsed;
      const nextValue = !current;
      if (nextValue === isDefaultCollapsed) {
        delete next[groupName];
      } else {
        next[groupName] = nextValue;
      }
      return next;
    });
  };

  const collapseAllGroups = () => {
    setCollapsedOverrides(() => {
      const overrides: Record<string, boolean> = {};
      groups.forEach(({ name }) => {
        overrides[name] = true;
      });
      return overrides;
    });
  };

  const expandAllGroups = () => {
    setCollapsedOverrides(() => {
      const overrides: Record<string, boolean> = {};
      groups.forEach(({ name }) => {
        overrides[name] = false;
      });
      return overrides;
    });
  };

  const beginEditing = (date: string, currentName: string) => {
    setEditingState({ target: date, value: currentName });
  };

  const cancelEditing = () => {
    resetEditingState();
  };

  const commitEditing = (date?: string) => {
    if (!activeEditingTarget || activeEditingTarget === 'bulk') return;
    const targetDate = date ?? activeEditingTarget;
    const nextName = editingValue.trim();
    onAdd(targetDate, nextName);
    resetEditingState();
  };

  const beginBulkRename = () => {
    if (!hasSelection) return;
    setEditingState({
      target: 'bulk',
      value: deriveBulkRenameValue(items, sanitizedSelectedDates),
    });
  };

  const confirmBulkRename = () => {
    if (activeEditingTarget !== 'bulk' || !hasSelection) return;
    onBulkRename(sanitizedSelectedDates, editingValue.trim());
    resetEditingState();
    updateSelection(() => []);
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
        if (!activeEditingTarget) {
          event.preventDefault();
          onRemove(date);
          updateSelection(prev => prev.filter(value => value !== date));
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        if (!activeEditingTarget) {
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
        if (activeEditingTarget === date) {
          event.preventDefault();
          commitEditing(date);
        }
        break;
      }
      case 'Escape': {
        if (activeEditingTarget === date) {
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
    if (activeEditingTarget && activeEditingTarget !== 'bulk') {
      commitEditing(activeEditingTarget);
    }
  };

  const removeDate = (date: string) => {
    onRemove(date);
    updateSelection(prev => prev.filter(value => value !== date));
    if (activeEditingTarget === date) {
      resetEditingState();
    }
  };

  const clearAllDates = () => {
    onClearAll();
    updateSelection(() => []);
    resetEditingState();
  };

  const value: CompanyDayListContextValue = {
    title,
    colorScheme,
    theme,
    items,
    groups,
    itemCount,
    selectedDates: sanitizedSelectedDates,
    collapsedGroups,
    editingTarget: activeEditingTarget,
    editingValue,
    hasSelection,
    toggleDateSelection,
    toggleGroupSelection,
    toggleGroupCollapse,
    collapseAllGroups,
    expandAllGroups,
    beginEditing,
    cancelEditing,
    updateEditingValue: value =>
      setEditingState(prev => ({
        ...prev,
        value,
      })),
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
