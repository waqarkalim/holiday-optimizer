import { KeyboardEvent } from 'react';

export interface DateItem {
  date: string;
  name: string;
  alternateNames?: string[];
}

export interface GroupedDates {
  name: string;
  dates: DateItem[];
  isDefaultNamed?: boolean;
  groupKeyTimestamp: number;
}

export interface DateListProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber' | 'violet';
  onRemove: (date: string) => void;
  onClearAll: () => void;
  showName?: boolean;
  onUpdateName?: (date: string, newName: string) => void;
  onBulkRename?: (dates: string[], newName: string) => void;
  showBulkManagement?: boolean;
  isBulkMode?: boolean;
  setIsBulkMode?: ((value: boolean) => void) | null;
}

export interface DateListItemProps {
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
  isGrouped?: boolean;
}

export interface ListHeaderProps {
  id: string;
  title: string;
  itemCount: number;
  colorScheme: 'amber' | 'violet';
  showBulkManagement: boolean;
  isBulkMode: boolean;
  selectedDates: string[];
  onBulkRename: () => void;
  onClearAll: () => void;
  groupedDates: GroupedDates[];
  collapsedGroups: string[];
  setCollapsedGroups: (value: string[]) => void;
}

export interface BulkRenameInputProps {
  editingValue: string;
  setEditingValue: (value: string) => void;
  setEditingDate: (value: string | null) => void;
  handleBulkRenameConfirm: () => void;
  colorScheme: 'amber' | 'violet';
}

export interface GroupedViewProps {
  groupedDates: GroupedDates[];
  colorScheme: 'amber' | 'violet';
  selectedDates: string[];
  collapsedGroups: string[];
  handleSelectGroup: (name: string) => void;
  toggleGroupCollapse: (name: string) => void;
  onUpdateName?: (date: string, newName: string) => void;
  onRemove: (date: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  startEditing: (date: string, currentName: string) => void;
  handleBlur: () => void;
  setSelectedDates: (fn: (prev: string[]) => string[]) => void;
  editingDate: string | null;
  setEditingDate: (date: string | null) => void;
  editingValue: string;
  setEditingValue: (value: string) => void;
}

export interface FlatViewProps {
  items: DateItem[];
  colorScheme: 'amber' | 'violet';
  showBulkManagement: boolean;
  selectedDates: string[];
  setSelectedDates: (fn: (prev: string[]) => string[]) => void;
  editingDate: string | null;
  setEditingDate: (date: string | null) => void;
  editingValue: string;
  onUpdateName?: (date: string, newName: string) => void;
  onRemove: (date: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  startEditing: (date: string, currentName: string) => void;
  handleBlur: () => void;
  setEditingValue: (value: string) => void;
} 