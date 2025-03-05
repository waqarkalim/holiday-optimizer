'use client';

import { KeyboardEvent as ReactKeyboardEvent, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DateListProps } from './types';
import { colorStyles } from './constants/styles';
import { ANIMATION_CONFIG } from './constants/animations';
import { ListHeader } from './components/ListHeader';
import { FlatView } from './components/FlatView';

export function DateList({
  items,
  title,
  colorScheme,
  onRemoveAction,
  onClearAllAction,
  onUpdateName,
}: DateListProps) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Cancel the current edit
  const cancelEdit = useCallback(() => {
    setEditingDate(null);
  }, []);

  // Confirm the edit
  const confirmEdit = useCallback((date: string) => {
    if (onUpdateName) {
      onUpdateName(date, editingValue.trim());
      cancelEdit();
    }
  }, [editingValue, onUpdateName, cancelEdit]);
  
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
    if (e.key === 'Enter' && onUpdateName) {
      e.preventDefault();
      confirmEdit(date);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [confirmEdit, cancelEdit, onUpdateName]);
  
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
    if (!onUpdateName) return;
    setEditingValue(currentName);
    setEditingDate(date);
  }, [onUpdateName]);

  // Handle blur event on edit fields
  const handleBlur = useCallback(() => {
    if (editingDate !== null && onUpdateName) {
      confirmEdit(editingDate);
    }
  }, [editingDate, confirmEdit, onUpdateName]);

  // Early return if no items
  if (items.length === 0) return null;

  // Create a valid ID for aria-labelledby
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
        colorStyles[colorScheme].container,
        colorStyles[colorScheme].border,
      )}
      aria-labelledby={headingId}
    >
      <ListHeader
        id={headingId}
        title={title}
        itemCount={items.length}
        colorScheme={colorScheme}
        onClearAll={onClearAllAction}
      />

      <div className={cn('rounded-lg border', colorStyles[colorScheme].border, 'overflow-hidden')}>
        <ul
          className={cn('divide-y', colorStyles[colorScheme].divider)}
          aria-label={`List of dates`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <FlatView
              items={items}
              colorScheme={colorScheme}
              editingDate={editingDate}
              setEditingDate={setEditingDate}
              editingValue={editingValue}
              onUpdateName={onUpdateName}
              onRemove={onRemoveAction}
              handleKeyDown={handleKeyDown}
              startEditing={startEditing}
              handleBlur={handleBlur}
              setEditingValue={setEditingValue}
            />
          </AnimatePresence>
        </ul>
      </div>
    </motion.section>
  );
} 