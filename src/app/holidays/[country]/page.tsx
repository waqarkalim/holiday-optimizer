import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAvailableCountries, getAllHolidaysByCountry } from '@/services/holidays';
import HolidayPageContent from '@/components/features/holidays/HolidayPageContent';
import { CountryInfo } from '@/lib/storage/location';

// Generate static paths for all countries
export async function generateStaticParams() {
  const countries = getAvailableCountries();

  return countries.map(({ countryCode }) => ({
    country: countryCode.toLowerCase(),
  }));
}

// Generate metadata for SEO
export async function generateMetadata(props: { params: Promise<CountryInfo> }): Promise<Metadata> {
  const params = await props.params;
  const { country } = params;

  // Get all available countries to find the country name
  const countries = getAvailableCountries();
  const countryInfo = countries.find(c => c.countryCode.toLowerCase() === country.toLowerCase());

  if (!countryInfo) {
    return {
      title: 'Country Not Found',
      description: 'The requested country information could not be found.',
    };
  }

  return {
    title: `Public Holidays in ${countryInfo.name}`,
    description: `Complete list of public holidays and observances in ${countryInfo.name} for the current year and upcoming years.`,
    keywords: `public holidays, ${countryInfo.name}, national holidays, ${countryInfo.name} holidays, days off, bank holidays`,
  };
}

export default async function CountryHolidaysPage(props: { params: Promise<CountryInfo> }) {
  const params = await props.params;
  const { country } = params;

  // Get all available countries to find the country name
  const countries = getAvailableCountries();
  const countryInfo = countries.find(c => c.countryCode.toLowerCase() === country.toLowerCase());

  if (!countryInfo) {
    notFound();
  }

  // Get holidays for the country
  const currentYear = new Date().getFullYear();
  const holidays = getAllHolidaysByCountry(currentYear, { country: countryInfo.countryCode });

  // Get holidays for next year too
  const nextYearHolidays = getAllHolidaysByCountry(currentYear + 1, { country: countryInfo.countryCode });

  return (
    <HolidayPageContent
      title={`Public Holidays in ${countryInfo.name}`}
      location={{ country: countryInfo.name }}
      countryCode={countryInfo.countryCode}
      currentYearHolidays={holidays}
      nextYearHolidays={nextYearHolidays}
    />
  );
}
