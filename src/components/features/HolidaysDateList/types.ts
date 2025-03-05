import { KeyboardEvent } from 'react';

export interface DateItem {
  date: string;
  name: string;
  alternateNames?: string[];
}

export interface DateListProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber' | 'violet';
  onRemoveAction: (date: string) => void;
  onClearAllAction: () => void;
  showName?: boolean;
  onUpdateName?: (date: string, newName: string) => void;
}

export interface DateListItemProps {
  /** The date item to render */
  item: DateItem;
  /** Currently editing date ID or null if not editing */
  editingDate: string | null;
  /** Function to set the currently editing date */
  setEditingDate: (date: string | null) => void;
  /** Current editing input value */
  editingValue: string;
  /** Function to update the name of a date (optional) */
  onUpdateName?: (date: string, newName: string) => void;
  /** Function to remove a date */
  onRemove: (date: string) => void;
  /** Color scheme for the item */
  colorScheme: 'amber' | 'violet';
  /** 
   * Main keyboard event handler
   * Handles arrow keys, delete/backspace, enter and escape
   */
  handleKeyDown: (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  /** Function to start editing a date */
  startEditing: (date: string, currentName: string) => void;
  /** Function to handle input blur event and confirm edits */
  handleBlur: () => void;
  /** Function to update the editing value */
  setEditingValue: (value: string) => void;
}

export interface ListHeaderProps {
  id: string;
  title: string;
  itemCount: number;
  colorScheme: 'amber' | 'violet';
  onClearAll: () => void;
}

export interface FlatViewProps {
  items: DateItem[];
  colorScheme: 'amber' | 'violet';
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