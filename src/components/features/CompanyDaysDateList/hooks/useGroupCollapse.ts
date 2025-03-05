import { useEffect, useState } from 'react';
import { GroupedDates } from '../types';

const getCustomNamedGroups = (groups: GroupedDates[]) => {
  return groups
    .filter(group => !group.isDefaultNamed)
    .map(group => group.name);
};

export function useGroupCollapse(groupedDates: GroupedDates[]) {
  const [collapsedGroups, setCollapsedGroups] = useState(() => getCustomNamedGroups(groupedDates));

  useEffect(() => {
    setCollapsedGroups(getCustomNamedGroups(groupedDates));
  }, [groupedDates]);

  return { collapsedGroups, setCollapsedGroups };
}