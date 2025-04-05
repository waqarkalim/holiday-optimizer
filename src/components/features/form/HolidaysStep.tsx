import { DateList } from '@/components/features/HolidaysDateList';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useHolidays } from '@/hooks/useOptimizer';
import {
  CountrySubdivision,
  extractSubdivisions,
  getAvailableCountries,
  getHolidaysBySubdivision,
  getPublicHolidaysByCountry,
  HolidayResponse,
  NagerCountry,
} from '@/services/holidays';
import { toast } from 'sonner';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoredLocationData, storeLocationData } from '@/lib/storage/location';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSubdivisionName } from '@/lib/utils/iso-codes';
import { getCountryFlag } from '@/lib/utils/country-flags';
import { Loader2 } from 'lucide-react';

export function HolidaysStep() {
  const title = 'Public Holidays for Your Location';
  const colorScheme = 'amber';
  const { holidays, addHoliday, removeHoliday, setDetectedHolidays } = useHolidays();
  const { state, dispatch } = useOptimizer();
  const { selectedYear } = state;

  // States for country selection and loading
  const [countries, setCountries] = useState<NagerCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // States for subdivision selection
  const [subdivisions, setSubdivisions] = useState<CountrySubdivision[]>([]);
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('all');
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [countryHolidays, setCountryHolidays] = useState<HolidayResponse[]>([]);

  // Ref to track if initial location load has been attempted
  const initialLoadAttemptedRef = useRef(false);

  // Helper function to get country name from country code
  const getCountryName = useCallback((countryCode: string): string => {
    return countries.find(c => c.countryCode === countryCode)?.name || countryCode;
  }, [countries]);

  // Handle country selection with useCallback
  const handleCountryChange = useCallback(async (countryCode: string, isInitialLoad = false) => {
    if (countryCode === selectedCountry && !isInitialLoad) return;

    setSelectedCountry(countryCode);
    setIsLoadingHolidays(true);

    // Set default subdivision if not loading a stored one
    if (!isInitialLoad) {
      setSelectedSubdivision('all');
    }

    try {
      const holidays = await getPublicHolidaysByCountry(countryCode, selectedYear);
      setCountryHolidays(holidays);

      // Extract subdivisions from holidays
      const extractedSubdivisions = extractSubdivisions(holidays);
      setSubdivisions(extractedSubdivisions);

      // If it's the initial load, try to restore the saved subdivision
      const storedLocation = isInitialLoad ? getStoredLocationData(selectedYear) : null;
      const subdivisionToUse = storedLocation && storedLocation.subdivision
        ? storedLocation.subdivision
        : 'all';

      // Clear existing holidays and set new ones
      dispatch({ type: 'CLEAR_HOLIDAYS' });

      // Set subdivision if it exists in the stored data
      if (isInitialLoad && storedLocation && storedLocation.subdivision) {
        setSelectedSubdivision(storedLocation.subdivision);
      }

      // Filter based on the selected subdivision
      const actualSubdivisionCode = subdivisionToUse === 'all' ? undefined : subdivisionToUse;
      const filteredHolidays = getHolidaysBySubdivision(
        holidays,
        actualSubdivisionCode,
      );

      setDetectedHolidays(filteredHolidays);

      // Save to localStorage (but don't show toast on initial load)
      storeLocationData(countryCode, subdivisionToUse, selectedYear);

      if (!isInitialLoad) {
        const countryName = getCountryName(countryCode);
        toast.success('Holidays loaded', {
          description: `Loaded ${filteredHolidays.length} public holidays for ${countryName} in ${selectedYear}.`,
        });
      }
    } catch (error) {
      console.error(`Error fetching holidays for ${countryCode}:`, error);
      if (!isInitialLoad) {
        toast.error(`Failed to fetch holidays for ${countryCode}`);
      }
    } finally {
      setIsLoadingHolidays(false);
    }
  }, [selectedCountry, selectedYear, countries, dispatch, setDetectedHolidays, getCountryName]);

  // Reset initialLoadAttempted when year changes
  useEffect(() => {
    initialLoadAttemptedRef.current = false;
  }, [selectedYear]);

  // Load stored location data when component mounts or year changes
  useEffect(() => {
    // Only attempt to load if countries are available
    if (countries.length === 0) return;

    // Avoid repeated loading attempts
    if (initialLoadAttemptedRef.current) return;

    initialLoadAttemptedRef.current = true;

    const storedLocation = getStoredLocationData(selectedYear);
    if (storedLocation && storedLocation.country) {
      // Load the stored country
      handleCountryChange(storedLocation.country, true);
    }
  }, [selectedYear, countries, handleCountryChange]);

  // Fetch available countries on component mount
  useEffect(() => {
    async function fetchCountries() {
      setIsLoadingCountries(true);
      try {
        const availableCountries = await getAvailableCountries();
        console.log(availableCountries);
        const sortedCountries = availableCountries.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to fetch available countries');
      } finally {
        setIsLoadingCountries(false);
      }
    }

    fetchCountries();
  }, []);

  // Handle subdivision selection
  const handleSubdivisionChange = useCallback((subdivisionCode: string) => {
    if (subdivisionCode === selectedSubdivision) return;

    setSelectedSubdivision(subdivisionCode);

    if (!selectedCountry || !countryHolidays.length) return;

    // Clear existing holidays first
    dispatch({ type: 'CLEAR_HOLIDAYS' });

    const actualSubdivisionCode = subdivisionCode === 'all' ? undefined : subdivisionCode;
    const filteredHolidays = getHolidaysBySubdivision(
      countryHolidays,
      actualSubdivisionCode,
    );

    setDetectedHolidays(filteredHolidays);

    // Save to localStorage
    storeLocationData(selectedCountry, subdivisionCode, selectedYear);

    const countryName = getCountryName(selectedCountry);
    const locationDescription = actualSubdivisionCode
      ? `${countryName} (${getSubdivisionName(actualSubdivisionCode)})`
      : countryName;

    toast.success('Holidays filtered', {
      description: `Showing ${filteredHolidays.length} public holidays for ${locationDescription} in ${selectedYear}.`,
    });
  }, [selectedSubdivision, selectedCountry, countryHolidays, selectedYear, dispatch, setDetectedHolidays, getCountryName]);

  // Using the new StepTitleWithInfo component
  const titleWithInfo = (
    <StepTitleWithInfo
      title="Public Holidays"
      colorScheme={colorScheme}
      tooltip={{
        title: 'About Public Holidays',
        description: 'Public holidays are already non-working days, so you don\'t need to use PTO for them. Adding them helps create an optimized schedule that accounts for these days when planning your time off.',
        ariaLabel: 'Why public holidays matter',
      }}
    />
  );

  return (
    <FormSection colorScheme={colorScheme} headingId="holidays-heading">
      <StepHeader
        number={3}
        title={titleWithInfo}
        description={`Add public holidays for ${selectedYear} by selecting your country and region.`}
        colorScheme={colorScheme}
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
            <Select
              disabled={isLoadingCountries}
              value={selectedCountry}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger
                id="country-select"
                className="w-full transition-all duration-200 bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 
                hover:bg-amber-100 dark:hover:bg-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700
                focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-2
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-amber-50/50 disabled:hover:border-amber-200
                active:bg-amber-200/60 dark:active:bg-amber-800/50"
              >
                {selectedCountry && countries.length > 0 ? (
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{getCountryFlag(selectedCountry)}</span>
                    <span>{getCountryName(selectedCountry)}</span>
                  </div>
                ) : isLoadingCountries ? (
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading countries...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a country" />
                )}
              </SelectTrigger>
              <SelectContent
                className="max-h-80 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-md shadow-lg animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                <div className="py-1">
                  {countries.map((country) => (
                    <SelectItem
                      key={country.countryCode}
                      value={country.countryCode}
                      className="transition-colors duration-150 cursor-pointer data-[highlighted]:bg-amber-100 data-[highlighted]:dark:bg-amber-800/40 data-[highlighted]:text-amber-900 data-[highlighted]:dark:text-amber-50"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{getCountryFlag(country.countryCode)}</span>
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Subdivision Selector - Only show if country is selected and subdivisions exist */}
          {selectedCountry && subdivisions.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="subdivision-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Region/Province
              </label>
              <Select
                disabled={isLoadingHolidays}
                value={selectedSubdivision}
                onValueChange={handleSubdivisionChange}
              >
                <SelectTrigger
                  id="subdivision-select"
                  className="w-full transition-all duration-200 bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 
                  hover:bg-amber-100 dark:hover:bg-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700
                  focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-300 focus:ring-offset-2
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-amber-50/50 disabled:hover:border-amber-200
                  active:bg-amber-200/60 dark:active:bg-amber-800/50"
                >
                  {isLoadingHolidays ? (
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading regions...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select a region (optional)" />
                  )}
                </SelectTrigger>
                <SelectContent
                  className="max-h-80 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-md shadow-lg animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                  <SelectItem
                    value="all"
                    className="border-b border-amber-100 dark:border-amber-800 mt-1 transition-colors duration-150 cursor-pointer data-[highlighted]:bg-amber-100 data-[highlighted]:dark:bg-amber-800/40 data-[highlighted]:text-amber-900 data-[highlighted]:dark:text-amber-50"
                  >
                    All regions (nationwide holidays only)
                  </SelectItem>
                  {subdivisions.map((subdivision) => (
                    <SelectItem
                      key={subdivision.code}
                      value={subdivision.code}
                      className="transition-colors duration-150 cursor-pointer data-[highlighted]:bg-amber-100 data-[highlighted]:dark:bg-amber-800/40 data-[highlighted]:text-amber-900 data-[highlighted]:dark:text-amber-50"
                    >
                      <div className="flex items-center justify-center">
                        <span>{getSubdivisionName(subdivision.code)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <DateList title={title} colorScheme={colorScheme} />
        </div>
      </fieldset>
    </FormSection>
  );
} 