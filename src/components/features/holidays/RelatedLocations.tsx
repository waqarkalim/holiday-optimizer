'use client';

import Link from 'next/link';
import { getAvailableCountries, getRegions, getStates } from '@/services/holidays';

interface RelatedLocationsProps {
  currentCountry?: string;
  currentState?: string;
  currentRegion?: string;
  countryCode?: string;
  stateCode?: string;
  regionCode?: string;
  maxItems?: number;
}

export default function RelatedLocations({
  currentCountry,
  currentState,
  countryCode,
  stateCode,
  regionCode,
  maxItems = 5
}: RelatedLocationsProps) {
  // Different link strategies based on the current page context
  if (regionCode) {
    // On a region page, show:
    // 1. Sibling regions in the same state
    // 2. Parent state
    // 3. Other states in the same country
    const siblingRegions = getRegions(countryCode!, stateCode!)
      .filter(r => r.code.toLowerCase() !== regionCode.toLowerCase())
      .slice(0, maxItems);

    const otherStates = getStates(countryCode!)
      .filter(s => s.code.toLowerCase() !== stateCode!.toLowerCase())
      .slice(0, maxItems);

    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Related Locations
        </h2>

        {siblingRegions.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Other regions in {currentState}
            </h3>
            <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {siblingRegions.map(region => (
                <li key={region.code}>
                  <Link 
                    href={`/holidays/${countryCode?.toLowerCase()}/${stateCode?.toLowerCase()}/${region.code.toLowerCase()}`}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm hover:underline"
                    title={`Public holidays in ${region.name}, ${currentState}, ${currentCountry}`}
                  >
                    Public Holidays in {region.name}, {currentState}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {otherStates.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Other states in {currentCountry}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {otherStates.map(state => (
                <li key={state.code}>
                  <Link 
                    href={`/holidays/${countryCode?.toLowerCase()}/${state.code.toLowerCase()}`}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm hover:underline"
                    title={`Public holidays in ${state.name}, ${currentCountry}`}
                  >
                    Public Holidays in {state.name}, {currentCountry}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  } 
  else if (stateCode) {
    // On a state page, show:
    // 1. Top regions in this state
    // 2. Sibling states in the same country
    const topRegions = getRegions(countryCode!, stateCode!).slice(0, maxItems);

    const siblingStates = getStates(countryCode!)
      .filter(s => s.code.toLowerCase() !== stateCode.toLowerCase())
      .slice(0, maxItems);

    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Related Locations
        </h2>

        {topRegions.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Regions in {currentState}
            </h3>
            <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {topRegions.map(region => (
                <li key={region.code}>
                  <Link 
                    href={`/holidays/${countryCode?.toLowerCase()}/${stateCode.toLowerCase()}/${region.code.toLowerCase()}`}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm hover:underline"
                    title={`Public holidays in ${region.name}, ${currentState}, ${currentCountry}`}
                  >
                    Public Holidays in {region.name}, {currentState}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {siblingStates.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Other states in {currentCountry}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {siblingStates.map(state => (
                <li key={state.code}>
                  <Link 
                    href={`/holidays/${countryCode?.toLowerCase()}/${state.code.toLowerCase()}`}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm hover:underline"
                    title={`Public holidays in ${state.name}, ${currentCountry}`}
                  >
                    Public Holidays in {state.name}, {currentCountry}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  } 
  else if (countryCode) {
    // On a country page, show:
    // 1. Top states in this country
    // 2. Other popular countries
    const topStates = getStates(countryCode).slice(0, maxItems);

    const otherCountries = getAvailableCountries()
      .filter(c => c.countryCode.toLowerCase() !== countryCode.toLowerCase())
      .slice(0, maxItems);

    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Related Locations
        </h2>

        {topStates.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              States in {currentCountry}
            </h3>
            <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {topStates.map(state => (
                <li key={state.code}>
                  <Link 
                    href={`/holidays/${countryCode.toLowerCase()}/${state.code.toLowerCase()}`}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm hover:underline"
                    title={`Public holidays in ${state.name}, ${currentCountry}`}
                  >
                    Public Holidays in {state.name}, {currentCountry}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {otherCountries.length > 0 && (
          <>
            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Other countries
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {otherCountries.map(country => (
                <li key={country.countryCode}>
                  <Link 
                    href={`/holidays/${country.countryCode.toLowerCase()}`}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm hover:underline"
                    title={`Public holidays in ${country.name}`}
                  >
                    Public Holidays in {country.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  // Default empty component if no context matches
  return null;
} 
