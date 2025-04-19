import { Metadata } from 'next';
import Link from 'next/link';
import { getAvailableCountries } from '@/services/holidays';
import { CalendarIcon, CheckCircleIcon, GlobeIcon } from 'lucide-react';
import { continents, getCountryData, TCountryCode } from 'countries-list';
import CountrySearch from '@/components/features/holidays/CountrySearch';
import { PageContent, PageDescription, PageHeader, PageLayout, PageTitle } from '@/components/layout/PageLayout';

export const metadata: Metadata = {
  title: 'Public Holidays Around the World',
  description: 'Explore public holidays and observances for countries around the world. Find information about national holidays, bank holidays, and more.',
  keywords: 'public holidays, national holidays, bank holidays, world holidays, international holidays, days off',
};

export default async function HolidaysIndexPage() {
  const countries = getAvailableCountries();

  // Sort countries alphabetically by name
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));

  // Group countries by continent/region for better organization
  const getCountryGroup = (country: TCountryCode) => {
    return continents[getCountryData(country).continent] || 'Other';
  };

  const groupedCountries: Record<string, Array<{ countryCode: string; name: string }>> = {};

  for (const country of sortedCountries) {
    const group = getCountryGroup(country.countryCode as TCountryCode);
    if (!groupedCountries[group]) {
      groupedCountries[group] = [];
    }
    groupedCountries[group].push(country);
  }

  // Sort groups by name
  const sortedGroups = Object.keys(groupedCountries).sort();

  // Add schema.org structured data for better SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Public Holidays Around the World',
    'description': 'Explore public holidays and observances for countries around the world. Find information about national holidays, bank holidays, and more.',
    'url': 'https://holidayoptimizer.com/holidays',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': sortedGroups.map((group, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': group,
        'item': {
          '@type': 'Thing',
          'name': group,
          'description': `Public holidays in ${group} countries`,
        },
      })),
    },
  };

  return (
    <PageLayout>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero section */}
      <PageHeader className="bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-400 via-indigo-500 to-blue-600"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center mb-5 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white">
            <CalendarIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="text-sm font-medium">Worldwide Public Holidays</span>
          </div>

          <PageTitle className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
            Discover Public Holidays <br className="hidden sm:block" />Around the World
          </PageTitle>

          <PageDescription className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Find official public holidays for {sortedCountries.length} countries worldwide.
            Plan your travels, business operations, or simply learn about different cultural celebrations.
          </PageDescription>

          <div className="flex flex-wrap gap-4 justify-center mb-10">
            <Link
              href="#browse-countries"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <GlobeIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              Browse Countries
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>National Holidays</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>Bank Holidays</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>Regional Observances</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/80">
              <span>School Holidays</span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Main content */}
      <PageContent>
        <section className="container mx-auto px-4 py-16 max-w-6xl" id="browse-countries">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Browse Countries
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Select a country to view its public holidays, bank holidays, and observances.
            </p>
          </div>

          {/* Country search and groups */}
          <CountrySearch groupedCountries={groupedCountries} sortedGroups={sortedGroups} />
        </section>

        {/* Features section */}
        <section className="bg-gray-100 dark:bg-gray-800/50 py-16 mt-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Why Use Our Holiday Calendar?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our comprehensive public holiday database offers several benefits for travelers, businesses, and the
                culturally curious.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
                  <GlobeIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Comprehensive Coverage
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access holiday information for {sortedCountries.length} countries worldwide, including regional and
                  local observances.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Current & Upcoming Years
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  View holidays for both the current and upcoming year to plan ahead for vacations, business operations,
                  and events.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Accurate & Reliable
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our data is based on official government sources and regularly updated to ensure accuracy and
                  reliability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
                About Public Holidays
              </h2>
            </div>

            <div className="p-6 md:p-8 space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Public holidays, also known as national holidays or legal holidays, are days when most businesses,
                schools, and government offices are closed.
                These holidays are established by law and typically commemorate important historical, cultural, or
                religious events.
              </p>
              <p>
                Different countries have their own unique set of public holidays that reflect their history, culture, and
                traditions.
                Some holidays, like New Year&apos;s Day, are celebrated in many countries around the world, while others
                are specific to certain regions or cultures.
              </p>
              <p>
                Use this resource to explore public holidays for countries around the world and plan your travels,
                business operations, or simply learn about different cultural celebrations.
              </p>
            </div>
          </div>
        </section>
      </PageContent>
    </PageLayout>
  );
}
