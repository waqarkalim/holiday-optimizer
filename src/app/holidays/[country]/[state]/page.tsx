import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllHolidaysByCountry, getAvailableCountries, getStates } from '@/services/holidays';
import HolidayPageContent from '@/components/features/holidays/HolidayPageContent';
import { CountryInfo } from '@/lib/storage/location';
import { WebPageJsonLd } from '@/components/JsonLd';

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

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return {
    title: `${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear} | Regional Calendar`,
    description: `Official list of public holidays, bank holidays, and regional observances in ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}. Find state-specific holidays and plan your local activities.`,
    keywords: `${stateInfo.name} holidays, ${stateInfo.name} ${countryInfo.name} public holidays, ${stateInfo.name} regional holidays, ${stateInfo.name} bank holidays, ${stateInfo.name} state holidays, ${stateInfo.name} days off, ${currentYear} ${stateInfo.name} holidays, ${nextYear} ${stateInfo.name} holidays`,
    openGraph: {
      title: `${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`,
      description: `Complete list of public holidays and regional observances in ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}.`,
      type: 'website',
      url: `https://holidayoptimizer.com/holidays/${country.toLowerCase()}/${state!.toLowerCase()}`,
      siteName: 'Holiday Optimizer',
    },
    twitter: {
      card: 'summary',
      title: `${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`,
      description: `Complete list of public holidays and regional observances in ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}.`,
    },
    alternates: {
      canonical: `https://holidayoptimizer.com/holidays/${country.toLowerCase()}/${state!.toLowerCase()}`,
    },
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
  const nextYear = currentYear + 1

  const holidays = getAllHolidaysByCountry(
    currentYear,
    { country: countryInfo.countryCode, state: stateInfo.code },
  );

  // Get holidays for next year too
  const nextYearHolidays = getAllHolidaysByCountry(
    nextYear,
    { country: countryInfo.countryCode, state: stateInfo.code },
  );

  // Prepare data for schema.org structured data
  const pageTitle = `${stateInfo.name}, ${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`;
  const pageDescription = `Official list of public holidays, bank holidays, and regional observances in ${stateInfo.name}, ${countryInfo.name} for ${currentYear} and ${nextYear}.`;
  const pageUrl = `https://holidayoptimizer.com/holidays/${country.toLowerCase()}/${state!.toLowerCase()}`;

  // Prepare holiday items for structured data
  const holidayItems = holidays.map(holiday => ({
    name: holiday.name,
    description: `${holiday.name} - Public holiday in ${stateInfo.name}, ${countryInfo.name}`,
    startDate: holiday.date as string,
    location: {
      '@type': 'State' as const,
      name: stateInfo.name,
      containedInPlace: {
        '@type': 'Country' as const,
        name: countryInfo.name
      }
    },
  }));

  return (
    <>
      {/* Schema.org structured data */}
      <WebPageJsonLd
        name={pageTitle}
        description={pageDescription}
        url={pageUrl}
        itemListElements={holidayItems}
        id="state-jsonld"
      />
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
    </>
  );
}
