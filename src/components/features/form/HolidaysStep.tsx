import { DateList } from '@/components/features/HolidaysDateList';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useHolidays } from '@/hooks/useOptimizer';
import {
  CountrySubdivision,
  extractSubdivisions,
  getHolidaysBySubdivision,
  HolidayResponse,
} from '@/services/holidays';
import { toast } from 'sonner';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { useEffect, useState } from 'react';
import { getStoredLocationData, storeLocationData } from '@/lib/storage/location';
import { getSubdivisionName } from '@/lib/utils/iso-codes';
import { Loader2, RefreshCw } from 'lucide-react';
import { useCountries, useHolidaysByCountry } from '@/hooks/useHolidayQueries';
import { clearSessionRemovedHolidaysForRegion, isHolidayRemoved } from '@/lib/storage/holidays';

export function HolidaysStep() {
  const { holidays, setDetectedHolidays } = useHolidays();
  const { state: optimizerState, dispatch: optimizerDispatch } = useOptimizer();
  const { selectedYear } = optimizerState;

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSubdivision, setSelectedSubdivision] = useState('all');
  const [subdivisions, setSubdivisions] = useState<CountrySubdivision[]>([]);

  const { data: countries = [], isLoading: isLoadingCountries } = useCountries();

  const {
    data: holidaysData,
    isLoading: isLoadingHolidays,
    isFetching: isFetchingHolidays,
  } = useHolidaysByCountry(selectedCountry, selectedYear);

  // Reset selections when year changes
  useEffect(() => {
    setSelectedCountry('');
    setSelectedSubdivision('all');
  }, [selectedYear]);

  // Load stored location data on initial load
  useEffect(() => {
    if (countries.length === 0 || selectedCountry) return;

    const storedLocation = getStoredLocationData(selectedYear);
    if (storedLocation?.country) {
      setSelectedCountry(storedLocation.country);

      if (storedLocation.subdivision) {
        setSelectedSubdivision(storedLocation.subdivision);
      }
    }
  }, [countries, selectedYear, selectedCountry]);

  // Process holidays when data changes
  useEffect(() => {
    if (!holidaysData) return;

    const extractedSubdivisions = extractSubdivisions(holidaysData);
    setSubdivisions(extractedSubdivisions);

    applyHolidaySelection(holidaysData, selectedSubdivision);
  }, [holidaysData, selectedSubdivision]);

  function getCountryName(countryCode: string): string | undefined {
    return countries.find(c => c.countryCode === countryCode)?.name;
  }

  function applyHolidaySelection(holidays: HolidayResponse[], subdivisionCode: string): void {
    optimizerDispatch({ type: 'CLEAR_HOLIDAYS' });

    const actualSubdivisionCode = subdivisionCode === 'all' ? undefined : subdivisionCode;
    const filteredHolidays = getHolidaysBySubdivision(holidays, actualSubdivisionCode);
    
    // Get the region code for filtering removed holidays
    const regionIdentifier = `${selectedCountry}-${subdivisionCode}`;
    
    // Filter out holidays that have been manually removed by the user for this specific region
    const nonRemovedHolidays = filteredHolidays.filter(holiday => 
      !isHolidayRemoved(holiday.date, selectedYear, regionIdentifier)
    );

    setDetectedHolidays(nonRemovedHolidays);
    storeLocationData(selectedCountry, subdivisionCode, selectedYear);
  }

  function handleCountryChange(countryCode: string): void {
    if (countryCode === selectedCountry) return;

    // Clear any session-removed holidays for the previous region
    if (selectedCountry) {
      const oldRegionIdentifier = `${selectedCountry}-${selectedSubdivision}`;
      clearSessionRemovedHolidaysForRegion(oldRegionIdentifier);
    }

    setSelectedCountry(countryCode);
    setSelectedSubdivision('all');
    storeLocationData(countryCode, 'all', selectedYear);

    toast.success('Loading holidays', {
      description: `Loading public holidays for ${getCountryName(countryCode)} in ${selectedYear}...`,
    });
  }

  function handleSubdivisionChange(subdivisionCode: string): void {
    if (subdivisionCode === selectedSubdivision || !holidaysData) return;

    // Clear any session-removed holidays for the previous region
    const oldRegionIdentifier = `${selectedCountry}-${selectedSubdivision}`;
    clearSessionRemovedHolidaysForRegion(oldRegionIdentifier);

    setSelectedSubdivision(subdivisionCode);
    applyHolidaySelection(holidaysData, subdivisionCode);

    const countryName = getCountryName(selectedCountry);
    const actualSubdivisionCode = subdivisionCode === 'all' ? undefined : subdivisionCode;
    const locationDisplay = actualSubdivisionCode
      ? `${countryName} (${getSubdivisionName(actualSubdivisionCode)})`
      : countryName;

    toast.success('Holidays filtered', {
      description: `Showing public holidays for ${locationDisplay} in ${selectedYear}.`,
    });
  }

  // Add function to refresh holidays for the current region
  function handleRefreshHolidays() {
    if (!selectedCountry || !holidaysData) return;
    
    // Create region identifier
    const regionIdentifier = `${selectedCountry}-${selectedSubdivision}`;
    
    // Clear removed holidays for this region
    clearSessionRemovedHolidaysForRegion(regionIdentifier);
    
    // Re-apply holiday selection to get fresh list
    applyHolidaySelection(holidaysData, selectedSubdivision);
    
    // Show success toast
    toast.success('Holidays refreshed', {
      description: 'All previously removed holidays have been restored.',
    });
  }

  const publicHolidaysTooltip = {
    title: 'About Public Holidays',
    description: 'Public holidays are already non-working days, so you don\'t need to use PTO for them. Adding them helps create an optimized schedule that accounts for these days when planning your time off.',
    ariaLabel: 'Why public holidays matter',
  };

  return (
    <FormSection colorScheme="amber" headingId="holidays-heading">
      <StepHeader
        number={3}
        title={<StepTitleWithInfo title="Public Holidays" badge={{ label: 'Required' }} colorScheme="amber"
                                  tooltip={publicHolidaysTooltip} />}
        description={`Add public holidays for ${selectedYear} by selecting your country and region.`}
        colorScheme="amber"
        id="holidays-heading"
      />

      <fieldset className="space-y-4 border-0 m-0 p-0" aria-labelledby="holidays-heading">
        <legend className="sr-only">Public holidays selection</legend>

        <div className="space-y-3">
          {/* Country Selector */}
          <div className="space-y-1.5">
            <label htmlFor="country-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Country
            </label>
            <div className="relative">
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={isLoadingCountries}
                className="w-full h-9 px-3 py-1.5 rounded-md transition-all duration-200 
                  bg-amber-50/50 dark:bg-amber-900/20 
                  border border-amber-200 dark:border-amber-800 
                  text-amber-900 dark:text-amber-100 text-sm font-medium
                  hover:bg-amber-100 dark:hover:bg-amber-800/40 
                  hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm
                  focus:ring-1 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-1
                  focus:outline-none
                  disabled:opacity-70 disabled:cursor-not-allowed 
                  disabled:hover:bg-amber-50/50 disabled:hover:border-amber-200
                  appearance-none"
              >
                <option value="" disabled>
                  {isLoadingCountries ? 'Loading countries...' : 'Select a country'}
                </option>
                {countries.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Subdivision Selector */}
          {selectedCountry && subdivisions.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="subdivision-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Region/Province
              </label>
              <div className="relative">
                <select
                  id="subdivision-select"
                  value={selectedSubdivision}
                  onChange={(e) => handleSubdivisionChange(e.target.value)}
                  disabled={isLoadingHolidays || isFetchingHolidays}
                  className="w-full h-9 px-3 py-1.5 rounded-md transition-all duration-200 
                    bg-amber-50/50 dark:bg-amber-900/20 
                    border border-amber-200 dark:border-amber-800 
                    text-amber-900 dark:text-amber-100 text-sm font-medium
                    hover:bg-amber-100 dark:hover:bg-amber-800/40 
                    hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm
                    focus:ring-1 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-1
                    focus:outline-none
                    disabled:opacity-70 disabled:cursor-not-allowed 
                    disabled:hover:bg-amber-50/50 disabled:hover:border-amber-200
                    appearance-none"
                >
                  {isLoadingHolidays || isFetchingHolidays ? (
                    <option value="" disabled>Loading regions...</option>
                  ) : (
                    <>
                      <option value="all">All regions (nationwide holidays only)</option>
                      {subdivisions.map((subdivision) => (
                        <option key={subdivision.code} value={subdivision.code}>
                          {subdivision.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                  <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {isLoadingHolidays || isFetchingHolidays ? (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-800 dark:text-amber-300" />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Automatically Detected Holidays
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshHolidays}
                  disabled={!selectedCountry || isLoadingHolidays}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                  aria-label="Refresh holidays list"
                >
                  <RefreshCw size={12} className="inline" />
                  <span>Refresh</span>
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'} found
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These holidays are automatically detected based on your country and region selection.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
              Not all holidays may apply to your specific situation. Hover over any holiday and click the
              <span className="inline-block mx-1">
                <svg className="h-3 w-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
              icon to remove holidays that don&apos;t apply to you.
            </p>
          </div>

          <DateList title="Public Holidays for Your Location" colorScheme="amber" />
        </div>
      </fieldset>
    </FormSection>
  );
} 