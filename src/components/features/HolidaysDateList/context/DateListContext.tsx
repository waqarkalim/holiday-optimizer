'use client';

import { KeyboardEvent as ReactKeyboardEvent, createContext, useCallback, useContext, useState } from 'react';
import { DateItem } from '../types';

interface DateListContextProps {
  // State
  items: DateItem[];
  colorScheme: 'amber' | 'violet';
  title: string;
  editingDate: string | null;
  editingValue: string;
  
  // Actions
  onRemoveAction: (date: string) => void;
  onClearAllAction: () => void;
  onUpdateNameAction?: (date: string, newName: string) => void;
  
  // Derived state
  itemCount: number;
  headingId: string;
  
  // Handlers
  setEditingDate: (date: string | null) => void;
  setEditingValue: (value: string) => void;
  cancelEdit: () => void;
  confirmEdit: (date: string) => void;
  navigateWithArrowKeys: (e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, currentIndex: number) => void;
  handleEditingModeKeys: (e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  handleNormalModeKeys: (e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string, index: number) => void;
  handleKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => void;
  startEditing: (date: string, currentName: string) => void;
  handleBlur: () => void;
}

// Create context with a meaningful default value that throws when used outside provider
const DateListContext = createContext<DateListContextProps | null>(null);

export function useDateList() {
  const context = useContext(DateListContext);
  if (!context) {
    throw new Error('useDateList must be used within a DateListProvider');
  }
  return context;
}

export interface DateListProviderProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber' | 'violet';
  onRemoveAction: (date: string) => void;
  onClearAllAction: () => void;
  onUpdateNameAction?: (date: string, newName: string) => void;
  children: React.ReactNode;
}

export function DateListProvider({
  items,
  title,
  colorScheme,
  onRemoveAction,
  onClearAllAction,
  onUpdateNameAction,
  children,
}: DateListProviderProps) {
  // Local state
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Derived state
  const itemCount = items.length;
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-list-heading`;

  // Cancel the current edit
  const cancelEdit = useCallback(() => {
    setEditingDate(null);
  }, []);

  // Confirm the edit
  const confirmEdit = useCallback((date: string) => {
    if (onUpdateNameAction) {
      onUpdateNameAction(date, editingValue.trim());
      cancelEdit();
    }
  }, [editingValue, onUpdateNameAction, cancelEdit]);
  
  // Handle arrow key navigation between items
  const navigateWithArrowKeys = useCallback((
    e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>,
    currentIndex: number
  ) => {
    e.preventDefault();
    const targetIndex = e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
    const targetDate = items[targetIndex]?.date;
    
    if (targetDate && typeof window !== 'undefined') {
      const targetButton = document.querySelector(`[data-date="${targetDate}"]`) as HTMLButtonElement;
      targetButton?.focus();
    }
  }, [items]);

  // Handle keys when in editing mode
  const handleEditingModeKeys = useCallback((
    e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, 
    date: string
  ) => {
    if (e.key === 'Enter' && onUpdateNameAction) {
      e.preventDefault();
      confirmEdit(date);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [confirmEdit, cancelEdit, onUpdateNameAction]);
  
  // Handle keys when not in editing mode
  const handleNormalModeKeys = useCallback((
    e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, 
    date: string,
    index: number
  ) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      onRemoveAction(date);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      navigateWithArrowKeys(e, index);
    }
  }, [onRemoveAction, navigateWithArrowKeys]);

  // Handle keyboard navigation and actions
  const handleKeyDown = useCallback((
    e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, 
    date: string
  ) => {
    const index = items.findIndex(item => item.date === date);
    if (index === -1) return;
    
    // While in editing mode
    if (editingDate !== null) {
      handleEditingModeKeys(e, date);
      return;
    }
    
    // Not in editing mode
    handleNormalModeKeys(e, date, index);
  }, [items, editingDate, handleEditingModeKeys, handleNormalModeKeys]);

  // Start editing a date item
  const startEditing = useCallback((date: string, currentName: string) => {
    if (!onUpdateNameAction) return;
    setEditingValue(currentName);
    setEditingDate(date);
  }, [onUpdateNameAction]);

  // Handle blur event on edit fields
  const handleBlur = useCallback(() => {
    if (editingDate !== null && onUpdateNameAction) {
      confirmEdit(editingDate);
    }
  }, [editingDate, confirmEdit, onUpdateNameAction]);

  const contextValue = {
    // State
    items,
    colorScheme,
    title,
    editingDate,
    editingValue,
    
    // Actions
    onRemoveAction,
    onClearAllAction,
    onUpdateNameAction,
    
    // Derived state
    itemCount,
    headingId,
    
    // Handlers
    setEditingDate,
    setEditingValue,
    cancelEdit,
    confirmEdit,
    navigateWithArrowKeys,
    handleEditingModeKeys,
    handleNormalModeKeys,
    handleKeyDown,
    startEditing,
    handleBlur,
  };

  return (
    <DateListContext.Provider value={contextValue}>
      {children}
    </DateListContext.Provider>
  );
} 