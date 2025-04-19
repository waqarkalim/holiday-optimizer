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

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return {
    title: `${countryInfo.name} Public Holidays ${currentYear}-${nextYear} | Official Calendar`,
    description: `Complete list of ${countryInfo.name} public holidays, bank holidays, and national observances for ${currentYear} and ${nextYear}. Plan your vacations and business operations with our official holiday calendar.`,
    keywords: `${countryInfo.name} public holidays, ${countryInfo.name} bank holidays, ${countryInfo.name} national holidays, ${countryInfo.name} holiday calendar, ${countryInfo.name} days off, ${countryInfo.name} official holidays, ${currentYear} holidays, ${nextYear} holidays`,
    openGraph: {
      title: `${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`,
      description: `Complete list of public holidays and observances in ${countryInfo.name} for ${currentYear} and ${nextYear}. Plan your vacations and business operations.`,
      type: 'website',
      url: `https://holidayoptimizer.com/holidays/${country.toLowerCase()}`,
      siteName: 'Holiday Optimizer',
    },
    twitter: {
      card: 'summary',
      title: `${countryInfo.name} Public Holidays ${currentYear}-${nextYear}`,
      description: `Complete list of public holidays and observances in ${countryInfo.name} for ${currentYear} and ${nextYear}.`,
    },
    alternates: {
      canonical: `https://holidayoptimizer.com/holidays/${country.toLowerCase()}`,
    },
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
