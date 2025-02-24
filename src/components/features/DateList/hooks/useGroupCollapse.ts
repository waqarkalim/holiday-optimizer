import { useState, useEffect } from 'react';
import { GroupedDates } from '../types';

export function useGroupCollapse(groupedDates: GroupedDates[], showBulkManagement: boolean, isBulkMode: boolean) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() => 
    showBulkManagement ? groupedDates.map(group => group.name) : []
  );

  useEffect(() => {
    if (!showBulkManagement) {
      setCollapsedGroups([]);
      return;
    }

    if (!isBulkMode) {
      const allNames = groupedDates.map(group => group.name);
      setCollapsedGroups(prev => {
        const existingCollapsed = prev.filter(name => allNames.includes(name));
        const newNames = allNames.filter(name => !prev.includes(name));
        return [...existingCollapsed, ...newNames];
      });
    }
  }, [showBulkManagement, groupedDates, isBulkMode]);

  return { collapsedGroups, setCollapsedGroups };
} 