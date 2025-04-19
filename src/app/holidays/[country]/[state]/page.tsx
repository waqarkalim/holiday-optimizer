import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAvailableCountries, getPublicHolidaysByCountry, getStates } from '@/services/holidays';
import HolidayPageContent from '@/components/features/holidays/HolidayPageContent';
import { CountryInfo } from '@/lib/storage/location';

// Generate static paths for all country/state combinations
export async function generateStaticParams() {
  const countries = getAvailableCountries();
  const params = [];

  // For each country, get its states
  for (const { countryCode } of countries) {
    const states = getStates(countryCode);

    // Add each country/state combination to params
    for (const { code: stateCode } of states) {
      params.push({
        country: countryCode.toLowerCase(),
        state: stateCode.toLowerCase(),
      });
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<CountryInfo> }): Promise<Metadata> {
  const params = await props.params;
  const { country, state } = params;

  // Get country and state names
  const countries = getAvailableCountries();
  const countryInfo = countries.find(c => c.countryCode.toLowerCase() === country.toLowerCase());

  if (!countryInfo) {
    return {
      title: 'Location Not Found',
      description: 'The requested location information could not be found.',
    };
  }

  const states = getStates(countryInfo.countryCode);
  const stateInfo = states.find(s => s.code.toLowerCase() === state!.toLowerCase());

  if (!stateInfo) {
    return {
      title: 'Location Not Found',
      description: 'The requested location information could not be found.',
    };
  }

  return {
    title: `Public Holidays in ${stateInfo.name}, ${countryInfo.name}`,
    description: `Complete list of public holidays and observances in ${stateInfo.name}, ${countryInfo.name} for the current year and upcoming years.`,
    keywords: `public holidays, ${stateInfo.name}, ${countryInfo.name}, regional holidays, state holidays, days off, bank holidays`,
  };
}

export default async function StateHolidaysPage(props: { params: Promise<CountryInfo> }) {
  const params = await props.params;
  const { country, state } = params;

  // Get country and state names
  const countries = getAvailableCountries();
  const countryInfo = countries.find(c => c.countryCode.toLowerCase() === country.toLowerCase());

  if (!countryInfo) {
    notFound();
  }

  const states = getStates(countryInfo.countryCode);
  const stateInfo = states.find(s => s.code.toLowerCase() === state!.toLowerCase());

  if (!stateInfo) {
    notFound();
  }

  // Get holidays for the country and state
  const currentYear = new Date().getFullYear();
  const holidays = getPublicHolidaysByCountry(
    currentYear,
    { country: countryInfo.countryCode, state: stateInfo.code },
  );

  // Get holidays for next year too
  const nextYearHolidays = getPublicHolidaysByCountry(
    currentYear + 1,
    { country: countryInfo.countryCode, state: stateInfo.code },
  );

  return (
    <HolidayPageContent
      title={`Public Holidays in ${stateInfo.name}, ${countryInfo.name}`}
      location={{
        country: countryInfo.name,
        state: stateInfo.name,
      }}
      countryCode={countryInfo.countryCode}
      stateCode={stateInfo.code}
      currentYearHolidays={holidays}
      nextYearHolidays={nextYearHolidays}
    />
  );
}
