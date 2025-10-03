import { useState } from 'react';
import { DateItem } from '../types';

export function useBulkSelection(onBulkRename?: (dates: string[], newName: string) => void) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleBulkRename = (items: DateItem[]) => {
    if (!onBulkRename || selectedDates.length === 0) return;
    
    const selectedItems = items.filter(item => selectedDates.includes(item.date));
    const nameCount = selectedItems.reduce((acc, item) => {
      acc[item.name] = (acc[item.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const commonName = Object.entries(nameCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    setEditingValue(commonName);
    setEditingDate('bulk');
  }

  const handleBulkRenameConfirm = () => {
    if (!onBulkRename || selectedDates.length === 0) return;
    onBulkRename(selectedDates, editingValue.trim());
    setEditingDate(null);
    setSelectedDates([]);
  }

  return {
    selectedDates,
    setSelectedDates,
    editingDate,
    setEditingDate,
    editingValue,
    setEditingValue,
    handleBulkRename,
    handleBulkRenameConfirm
  };
} 