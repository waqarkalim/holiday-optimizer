'use client';

import { createContext, useContext, useState } from 'react';
import { DateItem } from '../types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Simplified context API for the DateList component
 */
interface DateListContextProps {
  // ---- State ----
  items: DateItem[];                              // List of date items
  colorScheme: 'amber';                           // Color theme
  title: string;                                  // Title of the list
  editingDate: string | null;                     // Currently editing date or null
  editingValue: string;                           // Current input value
  itemCount: number;                              // Number of items
  headingId: string;                              // Accessibility ID
  
  // ---- Actions ----
  onRemoveAction: (date: string) => void;         // Remove a date
  onClearAllAction: () => void;                   // Clear all dates
  onUpdateNameAction: (date: string, newName: string) => void; // Update name (optional)
  
  // ---- Edit Operations ----
  startEditing: (date: string, currentName: string) => void; // Enter edit mode
  cancelEdit: () => void;                         // Cancel editing
  confirmEdit: (date: string) => void;            // Save changes
  setEditingValue: (value: string) => void;       // Update input value
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

/**
 * Context for DateList functionality
 */
const DateListContext = createContext<DateListContextProps | null>(null);

/**
 * Hook to access DateList context
 */
export function useDateList() {
  const context = useContext(DateListContext);
  if (!context) {
    throw new Error('useDateList must be used within a DateListProvider');
  }
  return context;
}

// =============================================================================
// PROVIDER PROPS
// =============================================================================

/**
 * Props for the DateListProvider component
 */
export interface DateListProviderProps {
  items: DateItem[];                // List of date items
  title: string;                    // List title
  colorScheme: 'amber';             // Color theme
  onRemoveAction: (date: string) => void;        // Remove handler
  onClearAllAction: () => void;                  // Clear all handler
  onUpdateNameAction: (date: string, newName: string) => void; // Rename handler (optional)
  children: React.ReactNode;        // Child components
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

/**
 * Provider component for DateList context
 */
export function DateListProvider({
  items,
  title,
  colorScheme,
  onRemoveAction,
  onClearAllAction,
  onUpdateNameAction,
  children
}: DateListProviderProps) {
  // =========================================================================
  // STATE
  // =========================================================================
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  
  // Derived state
  const itemCount = items.length;
  const headingId = `holiday-list-heading-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // =========================================================================
  // EDIT OPERATIONS
  // =========================================================================
  
  /**
   * Cancel the current edit
   */
  const cancelEdit = () => {
    setEditingDate(null);
    setEditingValue('');
  }

  /**
   * Save the current edit
   */
  const confirmEdit = (date: string) => {
    if (editingValue.trim()) {
      onUpdateNameAction(date, editingValue.trim());
    }
    cancelEdit();
  }
  
  /**
   * Start editing an item
   */
  const startEditing = (date: string, currentName: string) => {
    setEditingDate(date);
    setEditingValue(currentName);
  }
  
  // =========================================================================
  // CONTEXT VALUE
  // =========================================================================
  
  const contextValue: DateListContextProps = {
    // State
    items,
    colorScheme,
    title,
    editingDate,
    editingValue,
    itemCount,
    headingId,
    
    // Actions
    onRemoveAction,
    onClearAllAction,
    onUpdateNameAction,
    
    // Edit operations
    startEditing,
    cancelEdit,
    confirmEdit,
    setEditingValue,
  };
  
  // =========================================================================
  // RENDER
  // =========================================================================
  
  return (
    <DateListContext.Provider value={contextValue}>
      {children}
    </DateListContext.Provider>
  );
} 