'use client';

import { createContext, KeyboardEvent as ReactKeyboardEvent, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DateListProps } from './types';
import { colorStyles } from './constants/styles';
import { ANIMATION_CONFIG } from './constants/animations';
import { ListHeader } from './components/ListHeader';
import { FlatView } from './components/FlatView';

// Color styles context
const ColorStylesContext = createContext<Record<string, string>>({});

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

  const handleKeyDown = useCallback((e: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>, date: string) => {
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
  }, [items, editingDate, editingValue, onRemoveAction, onUpdateName, setEditingDate]);

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

  if (items.length === 0) return null;

  // Create a valid ID for aria-labelledby
  const headingId = `${title.toLowerCase().replace(/\s+/g, '-')}-list-heading`;

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
            role="list"
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
    </ColorStylesContext.Provider>
  );
} 