const STORAGE_KEY_BASE = 'companyDays';

interface CompanyDay {
  date: string;
  name: string;
}

// Helper function to get the year-specific storage key
const getYearStorageKey = (year: number): string => `${STORAGE_KEY_BASE}_${year}`;

export function getStoredCompanyDays(year: number = new Date().getFullYear()): CompanyDay[] {
  try {
    const storageKey = getYearStorageKey(year);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function storeCompanyDay(day: CompanyDay, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const companyDays = getStoredCompanyDays(year);
    const existingIndex = companyDays.findIndex(d => d.date === day.date);
    
    if (existingIndex !== -1) {
      // Update existing company day
      companyDays[existingIndex] = day;
    } else {
      // Add new company day
      companyDays.push(day);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(companyDays));
  } catch (error) {
    console.error('Failed to store company day:', error);
  }
}

export function removeStoredCompanyDay(dateToRemove: string, year: number = new Date().getFullYear()) {
  try {
    const storageKey = getYearStorageKey(year);
    const companyDays = getStoredCompanyDays(year);
    const updatedCompanyDays = companyDays.filter(day => day.date !== dateToRemove);
    localStorage.setItem(storageKey, JSON.stringify(updatedCompanyDays));
  } catch (error) {
    console.error('Failed to remove company day:', error);
  }
}