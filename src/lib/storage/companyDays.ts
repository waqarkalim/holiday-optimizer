const STORAGE_KEY = 'holiday-optimizer-company-days';

export interface StoredCompanyDay {
  date: string;
  name: string;
}

export function getStoredCompanyDays(): StoredCompanyDay[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const companyDays: StoredCompanyDay[] = JSON.parse(stored);
    return companyDays.filter(day => day.name && day.date);
  } catch (error) {
    console.error('Error reading company days from storage:', error);
    return [];
  }
}

export function storeCompanyDay(day: StoredCompanyDay) {
  try {
    const currentDays = getStoredCompanyDays();
    
    // Check if day already exists
    const exists = currentDays.some(existingDay => existingDay.date === day.date);

    if (!exists) {
      const storedData = [...currentDays, day];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    }
  } catch (error) {
    console.error('Error storing company day:', error);
  }
}

export function removeStoredCompanyDay(index: number) {
  try {
    const currentDays = getStoredCompanyDays();
    const updatedDays = currentDays.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDays));
  } catch (error) {
    console.error('Error removing company day:', error);
  }
}

export function clearStoredCompanyDays() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing company days:', error);
  }
} 