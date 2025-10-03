export interface DateItem {
  date: string;
  name: string;
  alternateNames?: string[];
}

export interface GroupedDates {
  name: string;
  dates: DateItem[];
  isDefaultNamed?: boolean;
  groupKeyTimestamp: number;
}

export interface DateListProps {
  title: string;
  colorScheme: 'violet';
}

export interface DateListItemProps {
  item: DateItem;
  isGrouped?: boolean;
}

export interface ListHeaderProps {
  id: string;
} 