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
import { Loader2 } from 'lucide-react';
import { useCountries, useHolidaysByCountry } from '@/hooks/useHolidayQueries';

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

    setDetectedHolidays(filteredHolidays);
    storeLocationData(selectedCountry, subdivisionCode, selectedYear);
  }

  function handleCountryChange(countryCode: string): void {
    if (countryCode === selectedCountry) return;

    setSelectedCountry(countryCode);
    setSelectedSubdivision('all');
    storeLocationData(countryCode, 'all', selectedYear);

    toast.success('Loading holidays', {
      description: `Loading public holidays for ${getCountryName(countryCode)} in ${selectedYear}...`,
    });
  }

  function handleSubdivisionChange(subdivisionCode: string): void {
    if (subdivisionCode === selectedSubdivision || !holidaysData) return;

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

  const publicHolidaysTooltip = {
    title: 'About Public Holidays',
    description: 'Public holidays are already non-working days, so you don\'t need to use PTO for them. Adding them helps create an optimized schedule that accounts for these days when planning your time off.',
    ariaLabel: 'Why public holidays matter',
  };

  return (
    <FormSection colorScheme="amber" headingId="holidays-heading">
      <StepHeader
        number={3}
        title={<StepTitleWithInfo title="Public Holidays" colorScheme="amber" tooltip={publicHolidaysTooltip} />}
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
                className="w-full h-10 px-3 py-2 rounded-md transition-all duration-200 
                  bg-amber-50/50 dark:bg-amber-900/20 
                  border border-amber-200 dark:border-amber-800 
                  text-amber-900 dark:text-amber-100
                  hover:bg-amber-100 dark:hover:bg-amber-800/40 
                  hover:border-amber-300 dark:hover:border-amber-700
                  focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-2
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
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="w-full h-10 px-3 py-2 rounded-md transition-all duration-200 
                    bg-amber-50/50 dark:bg-amber-900/20 
                    border border-amber-200 dark:border-amber-800 
                    text-amber-900 dark:text-amber-100
                    hover:bg-amber-100 dark:hover:bg-amber-800/40 
                    hover:border-amber-300 dark:hover:border-amber-700
                    focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-2
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
                          {getSubdivisionName(subdivision.code)}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'} found
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These holidays are automatically detected based on your country and region selection.
            </p>
          </div>

          <DateList title="Public Holidays for Your Location" colorScheme="amber" />
        </div>
      </fieldset>
    </FormSection>
  );
} 