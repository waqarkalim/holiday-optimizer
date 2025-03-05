import { parse } from 'date-fns';
import { motion } from 'framer-motion';
import { FlatViewProps } from '../types';
import { ANIMATION_CONFIG } from '../constants/animations';
import { DateListItem } from './DateListItem';

export function FlatView({
  items,
  colorScheme,
  showBulkManagement,
  selectedDates,
  setSelectedDates,
  editingDate,
  setEditingDate,
  editingValue,
  onUpdateName,
  onRemove,
  handleKeyDown,
  startEditing,
  handleBlur,
  setEditingValue,
}: FlatViewProps) {
  const sortedItems = [...items].sort((a, b) =>
    parse(a.date, 'yyyy-MM-dd', new Date()).getTime() -
    parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
  );

  return (
    <>
      {sortedItems.map((item) => (
        <motion.li
          key={item.date}
          {...ANIMATION_CONFIG}
        >
          <DateListItem
            item={item}
            showBulkManagement={showBulkManagement}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            editingDate={editingDate}
            setEditingDate={setEditingDate}
            editingValue={editingValue}
            onUpdateName={onUpdateName}
            onRemove={onRemove}
            colorScheme={colorScheme}
            handleKeyDown={handleKeyDown}
            startEditing={startEditing}
            handleBlur={handleBlur}
            setEditingValue={setEditingValue}
          />
        </motion.li>
      ))}
    </>
  );
} 