import { iso31662, type ISO31662Entry } from 'iso-3166';

/**
 * Finds a subdivision name by its code
 * @param subdivisionCode The ISO 3166-2 code (e.g. 'CA-ON', 'US-NY')
 * @returns The human-readable name of the subdivision, or the code if not found
 */
export const getSubdivisionName = (subdivisionCode: ISO31662Entry['code']) => {
  try {
    const subdivision = iso31662.find(({ code }) => code === subdivisionCode);
    return subdivision ? subdivision.name : subdivisionCode;
  } catch (error) {
    console.error(`Error finding subdivision name for ${subdivisionCode}:`, error);
    return subdivisionCode;
  }
};
