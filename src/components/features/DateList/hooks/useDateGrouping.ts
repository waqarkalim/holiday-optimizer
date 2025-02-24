import { useMemo } from 'react';
import { format, parse } from 'date-fns';
import { DateItem, GroupedDates } from '../types';

export function useDateGrouping(items: DateItem[], showBulkManagement: boolean, isBulkMode: boolean) {
  return useMemo(() => {
    if (!showBulkManagement || !isBulkMode) return [];

    return items
      .reduce((groups: GroupedDates[], item) => {
        const itemDate = parse(item.date, 'yyyy-MM-dd', new Date());
        const isDefaultNamed = item.name === format(itemDate, 'MMMM d, yyyy');
        const groupKey = isDefaultNamed ? format(itemDate, 'MMMM yyyy') : item.name;
        const existingGroup = groups.find(g => g.name === groupKey && g.isDefaultNamed === isDefaultNamed);
        
        if (existingGroup) {
          existingGroup.dates.push(item);
        } else {
          groups.push({ name: groupKey, dates: [item], isDefaultNamed });
        }
        return groups;
      }, [])
      .map(group => ({
        ...group,
        dates: group.dates.sort((a, b) => 
          parse(a.date, 'yyyy-MM-dd', new Date()).getTime() -
          parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
        )
      }))
      .sort((a, b) => {
        if (a.isDefaultNamed !== b.isDefaultNamed) return a.isDefaultNamed ? 1 : -1;
        return b.dates.length - a.dates.length;
      });
  }, [items, showBulkManagement, isBulkMode]);
} 