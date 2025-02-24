import { useState, useEffect } from 'react';
import { GroupedDates } from '../types';

export function useGroupCollapse(groupedDates: GroupedDates[], showBulkManagement: boolean, isBulkMode: boolean) {
  // Initialize with only custom-named groups collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() => 
    groupedDates
      .filter(group => !group.isDefaultNamed) // Only collapse custom-named groups
      .map(group => group.name)
  );

  useEffect(() => {
    if (!showBulkManagement) {
      setCollapsedGroups([]);
      return;
    }

    // When bulk mode is enabled, maintain the same collapsed state:
    // - Month groups (isDefaultNamed: true) stay expanded
    // - Custom-named groups stay collapsed
    if (isBulkMode) {
      const customNamedGroups = groupedDates
        .filter(group => !group.isDefaultNamed)
        .map(group => group.name);
      setCollapsedGroups(customNamedGroups);
    }
  }, [showBulkManagement, groupedDates, isBulkMode]);

  return { collapsedGroups, setCollapsedGroups };
} 