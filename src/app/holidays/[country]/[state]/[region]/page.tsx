import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAvailableCountries, getAllHolidaysByCountry, getRegions, getStates } from '@/services/holidays';
import HolidayPageContent from '@/components/features/holidays/HolidayPageContent';
import { CountryInfo } from '@/lib/storage/location';

// Generate static paths for all country/state/region combinations
export async function generateStaticParams() {
  const countries = getAvailableCountries();
  const params = [];

  // For each country, get its states
  for (const { countryCode } of countries) {
    const states = getStates(countryCode);

    // For each state, get its regions
    for (const { code: stateCode } of states) {
      const regions = getRegions(countryCode, stateCode);

      // Add each country/state/region combination to params
      for (const { code: regionCode } of regions) {
        params.push({
          country: countryCode.toLowerCase(),
          state: stateCode.toLowerCase(),
          region: regionCode.toLowerCase(),
        });
      }
    }
  }

  return params;
}

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<CountryInfo> }): Promise<Metadata> {
  const params = await props.params;
  const { country, state, region } = params;

  // Get country, state, and region names
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

  const regions = getRegions(countryInfo.countryCode, stateInfo.code);
  const regionInfo = regions.find(r => r.code.toLowerCase() === region!.toLowerCase());

  if (!regionInfo) {
    return {
      title: 'Location Not Found',
      description: 'The requested location information could not be found.',
    };
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return {
    title: `${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear} | Local Calendar`,
    description: `Detailed list of public holidays, local observances, and special events in ${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}. Find local holidays specific to ${regionInfo.name}.`,
    keywords: `${regionInfo.name} holidays, ${regionInfo.name} ${stateInfo.name} holidays, ${regionInfo.name} local holidays, ${regionInfo.name} public holidays, ${regionInfo.name} observances, ${regionInfo.name} special events, ${currentYear} ${regionInfo.name} holidays, ${nextYear} ${regionInfo.name} holidays`,
    openGraph: {
      title: `${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`,
      description: `Complete list of public holidays and local observances in ${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}.`,
      type: 'website',
      url: `https://holidayoptimizer.com/holidays/${country.toLowerCase()}/${state!.toLowerCase()}/${region!.toLowerCase()}`,
      siteName: 'Holiday Optimizer',
    },
    twitter: {
      card: 'summary',
      title: `${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`,
      description: `Complete list of public holidays and local observances in ${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}.`,
    },
    alternates: {
      canonical: `https://holidayoptimizer.com/holidays/${country.toLowerCase()}/${state!.toLowerCase()}/${region!.toLowerCase()}`,
    },
  };
}

export default async function RegionHolidaysPage(props: { params: Promise<CountryInfo> }) {
  const params = await props.params;
  const { country, state, region } = params;

  // Get country, state, and region names
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

  const regions = getRegions(countryInfo.countryCode, stateInfo.code);
  const regionInfo = regions.find(r => r.code.toLowerCase() === region!.toLowerCase());

  if (!regionInfo) {
    notFound();
  }

  // Get holidays for the country, state, and region
  const currentYear = new Date().getFullYear();
  const holidays = getAllHolidaysByCountry(
    currentYear,
    {
      country: countryInfo.countryCode,
      state: stateInfo.code,
      region: regionInfo.code,
    },
  );

  // Get holidays for next year too
  const nextYearHolidays = getAllHolidaysByCountry(
    currentYear + 1,
    {
      country: countryInfo.countryCode,
      state: stateInfo.code,
      region: regionInfo.code,
    },
  );

  return (
    <HolidayPageContent
      title={`Public Holidays in ${regionInfo.name}, ${stateInfo.name}, ${countryInfo.name}`}
      location={{
        country: countryInfo.name,
        state: stateInfo.name,
        region: regionInfo.name,
      }}
      countryCode={countryInfo.countryCode}
      stateCode={stateInfo.code}
      regionCode={regionInfo.code}
      currentYearHolidays={holidays}
      nextYearHolidays={nextYearHolidays}
    />
  );
}
