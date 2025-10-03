import { parse } from 'date-fns';
import { motion } from 'framer-motion';
import { ANIMATION_CONFIG } from '../constants/animations';
import { DateListItem } from './DateListItem';
import { useDateList } from '../context/DateListContext';

export function FlatView() {
  const { items } = useDateList();
  
  // Simple date sort without any bulk or grouping functionality
  const sortedItems = [...items].sort((a, b) =>
    parse(a.date, 'yyyy-MM-dd', new Date()).getTime() -
    parse(b.date, 'yyyy-MM-dd', new Date()).getTime()
  );

  return (
    <>
      {sortedItems.map((item, index) => (
        <motion.li
          key={`${item.date}-${index}`}
          {...ANIMATION_CONFIG}
          data-list-item="true"
          data-list-index={index}
        >
          <DateListItem item={item} />
        </motion.li>
      ))}
    </>
  );
} 