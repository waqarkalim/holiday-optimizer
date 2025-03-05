import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateItem } from '../types';
import { colorStyles } from '../constants/styles';
import { KeyboardEvent, useRef } from 'react';
import { useDateList } from '../context/DateListContext';

interface DateListItemProps {
  item: DateItem;
}

export function DateListItem({ item }: DateListItemProps) {
  const {
    editingDate,
    setEditingDate,
    editingValue,
    onUpdateNameAction: onUpdateName,
    onRemoveAction: onRemove,
    colorScheme,
    handleKeyDown,
    startEditing,
    handleBlur,
    setEditingValue,
  } = useDateList();

  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const removeButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Common handlers for shared patterns
  const handleEnterOrSpace = (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
      return true;
    }
    return false;
  };

  const focusEditButton = () => setTimeout(() => editButtonRef.current?.focus(), 0);

  const handleEscape = (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingDate(null);
      focusEditButton();
      return true;
    }
    return false;
  };

  // Simplified key handlers using the common functions
  const handleEditKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (handleEnterOrSpace(e, () => startEditing(item.date, item.name))) {
      return;
    }
    // Forward other key events to the common handler
    handleKeyDown(e, item.date);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // Move to cancel button when Tab is pressed
      e.preventDefault();
      cancelButtonRef.current?.focus();
      return;
    }
    // Handle other keys with the common handler
    handleKeyDown(e, item.date);
  };

  const handleCancelKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (handleEnterOrSpace(e, () => {
      setEditingDate(null);
      focusEditButton();
    })) {
      return;
    }
    
    if (handleEscape(e)) return;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // If tabbing backward, move to input field
        inputRef.current?.focus();
      } else {
        // If tabbing forward, move to confirm button
        confirmButtonRef.current?.focus();
      }
    }
  };

  const handleConfirmKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (handleEnterOrSpace(e, () => {
      if (editingDate !== null && onUpdateName) {
        onUpdateName(item.date, editingValue.trim());
        setEditingDate(null);
        focusEditButton();
      }
    })) {
      return;
    }
    
    if (handleEscape(e)) return;
    
    if (e.key === 'Tab' && e.shiftKey) {
      // If tabbing backward, move to cancel button
      e.preventDefault();
      cancelButtonRef.current?.focus();
    }
    // Allow default Tab behavior to exit the component
  };

  const handleRemoveKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (handleEnterOrSpace(e, () => onRemove(item.date))) {
      return;
    }
    // Forward other key events to the common handler
    handleKeyDown(e, item.date);
  };

  return (
    <div
      className={cn(
        'group/item relative',
        'border-t',
        colorStyles[colorScheme].divider,
        colorStyles[colorScheme].hover,
        'transition-colors duration-200'
      )}
      data-date={item.date}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex-1 min-w-0">
          {editingDate === item.date ? (
            <div className="flex items-center gap-1.5">
              <Input
                ref={inputRef}
                autoFocus
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={(e) => {
                  // Only trigger blur if we're not focusing one of our buttons
                  if (
                    e.relatedTarget !== cancelButtonRef.current && 
                    e.relatedTarget !== confirmButtonRef.current
                  ) {
                    handleBlur();
                  }
                }}
                className={cn(
                  'h-7 text-sm font-medium flex-1',
                  'bg-white dark:bg-gray-900',
                  colorStyles[colorScheme].input,
                  colorStyles[colorScheme].text,
                )}
                aria-label={`Edit name for ${format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}`}
              />
              <div className="flex gap-1">
                <Button
                  ref={cancelButtonRef}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingDate(null);
                    setTimeout(() => editButtonRef.current?.focus(), 0);
                  }}
                  onKeyDown={handleCancelKeyDown}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-red-100/70 dark:hover:bg-red-900/30',
                    'group',
                  )}
                  aria-label="Cancel edit"
                  tabIndex={0}
                >
                  <X className={cn(
                    'h-3.5 w-3.5',
                    colorStyles[colorScheme].accent,
                    'group-hover:text-red-500 dark:group-hover:text-red-400',
                  )} />
                </Button>
                <Button
                  ref={confirmButtonRef}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleBlur();
                    setTimeout(() => editButtonRef.current?.focus(), 0);
                  }}
                  onKeyDown={handleConfirmKeyDown}
                  className={cn(
                    'h-7 w-7 p-0',
                    colorStyles[colorScheme].hover,
                    'hover:bg-green-100/70 dark:hover:bg-green-900/30',
                    'group',
                  )}
                  aria-label="Confirm edit"
                  tabIndex={0}
                >
                  <Check className={cn(
                    'h-3.5 w-3.5',
                    colorStyles[colorScheme].accent,
                    'group-hover:text-green-500 dark:group-hover:text-green-400',
                  )} />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className={cn(
                  'text-sm font-medium',
                  colorStyles[colorScheme].text,
                )}>
                  {item.name}
                </p>
                {onUpdateName && (
                  <Button
                    ref={editButtonRef}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(item.date, item.name)}
                    onKeyDown={handleEditKeyDown}
                    className={cn(
                      'h-6 w-6 p-0',
                      'opacity-0 group-hover/item:opacity-100 focus:opacity-100',
                      'transition-all duration-200',
                      colorStyles[colorScheme].hover,
                      'hover:scale-110 active:scale-95',
                    )}
                    aria-label={`Edit name for ${item.name}`}
                    tabIndex={0}
                    data-date={item.date}
                  >
                    <Pencil className={cn(
                      'h-3 w-3',
                      colorStyles[colorScheme].accent,
                    )} />
                  </Button>
                )}
              </div>
              <time 
                dateTime={item.date}
                className={cn(
                  'block text-xs mt-0.5',
                  colorStyles[colorScheme].muted
                )}
              >
                {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMMM d, yyyy')}
              </time>
            </>
          )}
        </div>
        
        {/* Remove Button */}
        <Button
          ref={removeButtonRef}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.date)}
          onKeyDown={handleRemoveKeyDown}
          className={cn(
            'h-7 w-7 p-0',
            'opacity-0 group-hover/item:opacity-100 focus:opacity-100',
            'transition-all duration-200',
            colorStyles[colorScheme].hover,
            'group',
          )}
          aria-label={`Remove ${item.name}`}
          tabIndex={0}
        >
          <X className={cn(
            'h-3.5 w-3.5',
            colorStyles[colorScheme].accent,
            'group-hover:text-red-500 dark:group-hover:text-red-400',
          )} />
        </Button>
      </div>
    </div>
  );
} 