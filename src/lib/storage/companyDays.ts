const STORAGE_KEY = 'companyDays';

interface CompanyDay {
  date: string;
  name: string;
}

export function getStoredCompanyDays(): CompanyDay[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function storeCompanyDay(day: CompanyDay) {
  try {
    const companyDays = getStoredCompanyDays();
    const existingIndex = companyDays.findIndex(d => d.date === day.date);
    
    if (existingIndex !== -1) {
      // Update existing company day
      companyDays[existingIndex] = day;
    } else {
      // Add new company day
      companyDays.push(day);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companyDays));
  } catch (error) {
    console.error('Failed to store company day:', error);
  }
}

export function removeStoredCompanyDay(dateToRemove: string) {
  try {
    const companyDays = getStoredCompanyDays();
    const updatedCompanyDays = companyDays.filter(day => day.date !== dateToRemove);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompanyDays));
  } catch (error) {
    console.error('Failed to remove company day:', error);
  }
}

export function clearStoredCompanyDays() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear company days:', error);
  }
}

export function updateStoredCompanyDay(date: string, newName: string) {
  try {
    const companyDays = getStoredCompanyDays();
    const updatedCompanyDays = companyDays.map(day =>
      day.date === date ? { ...day, name: newName } : day
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCompanyDays));
  } catch (error) {
    console.error('Failed to update company day:', error);
  }
} 