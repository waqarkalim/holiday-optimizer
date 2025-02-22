const STORAGE_KEY = 'holiday-optimizer-custom-days';

export interface StoredCustomDay {
  date: string;
  name: string;
}

export function getStoredCustomDays(): StoredCustomDay[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const customDays: StoredCustomDay[] = JSON.parse(stored);
    return customDays.filter(day => day.name && day.date);
  } catch (error) {
    console.error('Error reading custom days from storage:', error);
    return [];
  }
}

export function storeCustomDay(day: StoredCustomDay) {
  try {
    const currentDays = getStoredCustomDays();
    
    // Check if day already exists
    const exists = currentDays.some(existingDay => existingDay.date === day.date);

    if (!exists) {
      const storedData = [...currentDays, day];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  } catch (error) {
    console.error('Error storing custom day:', error);
  }
}

export function removeStoredCustomDay(index: number) {
  try {
    const currentDays = getStoredCustomDays();
    const updatedDays = currentDays.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
  } catch (error) {
    console.error('Error removing custom day:', error);
  }
}

export function clearStoredCustomDays() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing custom days:', error);
  }
} 