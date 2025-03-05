export const ANIMATION_CONFIG = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2 }
} as const;

export const ITEM_ANIMATION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.2 }
} as const;

export const CHECKBOX_ANIMATION = {
  initial: { opacity: 0, scale: 0.8, width: 0 },
  animate: { opacity: 1, scale: 1, width: 'auto' },
  exit: { opacity: 0, scale: 0.8, width: 0 },
  transition: { duration: 0.2 }
} as const; 