import { DateList } from '@/components/features/HolidaysDateList';
import { StepHeader } from './components/StepHeader';
import { FormSection } from './components/FormSection';
import { useHolidays } from '@/hooks/useOptimizer';
import { StepTitleWithInfo } from './components/StepTitleWithInfo';
import { useOptimizer } from '@/contexts/OptimizerContext';
import { useEffect, useReducer } from 'react';
import { useCountries, useHolidaysByCountry, useRegions, useStates } from '@/hooks/useHolidayQueries';
import { CountryInfo, getStoredLocationData, storeLocationData } from '@/lib/storage/location';
import { convertToDateObject } from '@/utils/dates';
import { format } from 'date-fns';

// Define the state interface for the reducer
interface HolidaysState {
  selectedCountryCode: string;
  selectedState: string;
  selectedRegion: string;
}

const initialState: HolidaysState = {
  selectedCountryCode: '',
  selectedState: '',
  selectedRegion: '',
};

// Define action types
type HolidaysAction =
  | { type: 'SET_COUNTRY_INFO'; payload: CountryInfo }
  | { type: 'SET_COUNTRY'; payload: string }
  | { type: 'SET_STATE'; payload: string }
  | { type: 'SET_REGION'; payload: string }
  | { type: 'RESET_SELECTIONS' };

// Implement the reducer function
const holidaysReducer = (state: HolidaysState, action: HolidaysAction): HolidaysState => {
  switch (action.type) {
    case 'SET_COUNTRY_INFO':
      return {
        ...state,
        selectedCountryCode: action.payload.country,
        selectedState: action.payload.state!,
        selectedRegion: action.payload.region!,
      };
    case 'SET_COUNTRY':
      return {
        ...state,
        selectedCountryCode: action.payload,
        selectedState: '',
        selectedRegion: '',
      };
    case 'SET_STATE':
      return {
        ...state,
        selectedState: action.payload,
        selectedRegion: '',
      };
    case 'SET_REGION':
      return {
        ...state,
        selectedRegion: action.payload,
      };
    case 'RESET_SELECTIONS':
      return initialState;
    default:
      return state;
  }
};

export const HolidaysStep = () => {
  const { holidays, setDetectedHolidays } = useHolidays();
  const { state: { selectedYear } } = useOptimizer();

  const [holidaysState, dispatch] = useReducer(holidaysReducer, initialState);
  const { selectedCountryCode, selectedState, selectedRegion } = holidaysState;

  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates(selectedCountryCode);
  const { data: regions = [] } = useRegions(selectedCountryCode, selectedState);

  const { data: holidaysData, refetch } = useHolidaysByCountry(selectedYear, {
    country: selectedCountryCode,
    state: selectedState,
    region: selectedRegion,
  });

  useEffect(() => {
    const countryInfo = getStoredLocationData(selectedYear);
    if (countryInfo) {
      dispatch({ type: 'SET_COUNTRY_INFO', payload: countryInfo });
    } else {
      dispatch({ type: 'RESET_SELECTIONS' });
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedCountryCode) {
      const countryInfo: CountryInfo = { country: selectedCountryCode, state: selectedState, region: selectedRegion };
      storeLocationData(selectedYear, countryInfo);
    }
  }, [selectedCountryCode, selectedState, selectedRegion, selectedYear]);

  // Process holidays when data changes
  useEffect(() => {
    if (!holidaysData) return;

    setDetectedHolidays(holidaysData.map(holiday => {
      const displayDate = format(convertToDateObject(holiday.date), 'yyyy-MM-dd');

      return {
        date: displayDate,
        name: holiday.name,
      };
    }));
  }, [holidaysData]);

  const handleCountryChange = (countryCode: string): void => {
    dispatch({ type: 'SET_COUNTRY', payload: countryCode });
  };

  const handleStateChange = (stateCode: string): void => {
    dispatch({ type: 'SET_STATE', payload: stateCode });
  };

  const handleRegionChange = (regionCode: string): void => {
    dispatch({ type: 'SET_REGION', payload: regionCode });
  };
  const handleRefetch = () => refetch();

  const publicHolidaysTooltip = {
    title: 'About Public Holidays',
    description: 'Public holidays are already non-working days, so you don\'t need to use PTO for them. Adding them helps create an optimized schedule that accounts for these days when planning your time off.',
    ariaLabel: 'Why public holidays matter',
  };

  return (
    <FormSection colorScheme="amber" headingId="holidays-heading">
      <StepHeader
        number={3}
        title={<StepTitleWithInfo
          title="Public Holidays"
          badge={{ label: 'Required' }}
          colorScheme="amber"
          tooltip={publicHolidaysTooltip} />}
        description={`Add public holidays for ${selectedYear} by selecting your country, state, and region.`}
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
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
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
                <option value="" disabled>Select a country</option>
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

          {/* State Selector */}
          {selectedCountryCode && states.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="state-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select State/Province
              </label>
              <div className="relative">
                <select
                  id="state-select"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
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
                  <>
                    <option value="">All states (nationwide holidays only)</option>
                    {states.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                  <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Region Selector */}
          {selectedCountryCode && selectedState && regions.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="region-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Region
              </label>
              <div className="relative">
                <select
                  id="region-select"
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
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
                  <>
                    <option value="">All regions</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
                  <svg className="h-4 w-4 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleRefetch}
                  className={`inline-flex items-center justify-center px-2 py-1 text-xs rounded
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-1 focus:ring-amber-300 dark:focus:ring-amber-400/50
                    text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:underline`}
                  aria-label="Refresh holidays"
                >
                  <>
                    <svg className="h-3 w-3 mr-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {holidays.length} {holidays.length === 1 ? 'holiday' : 'holidays'} found
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These holidays are automatically detected based on your country, state, and region selection.
            </p>
          </div>

          <DateList title="Public Holidays for Your Location" colorScheme="amber" />
        </div>
      </fieldset>
    </FormSection>
  );
};
