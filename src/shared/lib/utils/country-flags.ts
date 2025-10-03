/**
 * Get a country flag emoji from a country code
 * @param countryCode The 2-letter ISO country code (e.g., 'US', 'CA')
 * @returns The corresponding flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '';
  
  // Country code to regional indicator symbols
  // Each uppercase letter is converted to a regional indicator symbol
  const codePoints = [...countryCode.toUpperCase()]
    .map(char => char.charCodeAt(0) + 127397); // 127397 = 🇦(regional A) - A(65)
  
  return String.fromCodePoint(...codePoints);
} 