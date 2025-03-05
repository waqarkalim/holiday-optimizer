export interface DateItem {
  date: string;
  name: string;
}

export interface DateListProps {
  items: DateItem[];
  title: string;
  colorScheme: 'amber';
  onRemoveAction: (date: string) => void;
  onClearAllAction: () => void;
  showName: boolean;
  onUpdateNameAction: (date: string, newName: string) => void;
}