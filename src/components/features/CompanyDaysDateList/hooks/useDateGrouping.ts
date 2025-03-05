import { useMemo } from 'react';
import { format, parse } from 'date-fns';
import { DateItem, GroupedDates } from '../types';

export function useDateGrouping(items: DateItem[]) {
  return useMemo(() => {
    return items
      .reduce((groups: GroupedDates[], item) => {
        const itemDate = parse(item.date, 'yyyy-MM-dd', new Date());
        const isDefaultNamed = item.name === format(itemDate, 'MMMM d, yyyy');
        const groupKey = isDefaultNamed ? format(itemDate, 'MMMM yyyy') : item.name;
        const existingGroup = groups.find(g => g.name === groupKey && g.isDefaultNamed === isDefaultNamed);
        
        if (existingGroup) {
          existingGroup.dates.push(item);
        } else {
          // Create a new date for the first day of the month
          const firstDayOfMonth = new Date(itemDate.getFullYear(), itemDate.getMonth(), 1);
          groups.push({ name: groupKey, dates: [item], isDefaultNamed, groupKeyTimestamp: firstDayOfMonth.getTime() });
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
        return a.groupKeyTimestamp - b.groupKeyTimestamp;
      });
  }, [items]);
} 